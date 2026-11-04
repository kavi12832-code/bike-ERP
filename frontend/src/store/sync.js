/**
 * Store -> backend sync engine.
 *
 * Every store action stays a plain local state update; this engine watches the store and sends
 * the difference between the current data and the last server-confirmed copy to the API
 * (create / update / delete per record), in order and debounced. If the server rejects a change
 * (permissions, validation, business rules) the user is told why and server truth is reloaded.
 *
 * Which endpoint a slice uses is defined once in syncConfig.js.
 */
import { toast } from 'sonner';
import { backend } from '../services/api/backend';
import {
  CATALOG_KEYS,
  COLLECTION_SLICES,
  OBJECT_RECORD_ID,
  OBJECT_SLICES,
  REST_SLICES,
  catalogCollection,
  recordKey,
} from './syncConfig';

const DEBOUNCE_MS = 350;

// Fields the browser must never send back (server-managed or display-only).
const REST_READ_ONLY = new Set(['createdAt', 'updatedAt', 'tenantSlug', 'lastLogin', 'twoFactorEnabled', 'failedAttempts']);

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`;
}

/** Every syncable list in the store, with how to read it and where it goes. */
function buildSpecs(state) {
  const specs = [];
  for (const [slice, cfg] of Object.entries(REST_SLICES)) {
    specs.push({ key: `rest:${slice}`, label: slice, kind: 'rest', cfg, read: (s) => s[slice] });
  }
  for (const [slice, name] of Object.entries(COLLECTION_SLICES)) {
    specs.push({ key: `col:${name}`, label: slice, kind: 'collection', name, read: (s) => s[slice] });
  }
  for (const [slice, name] of Object.entries(OBJECT_SLICES)) {
    specs.push({
      key: `col:${name}`,
      label: slice,
      kind: 'collection',
      name,
      read: (s) => (s[slice] === undefined ? undefined : [{ id: OBJECT_RECORD_ID, value: s[slice] }]),
      refOf: (s) => s[slice],
    });
  }
  for (const key of CATALOG_KEYS) {
    const name = catalogCollection(key);
    specs.push({ key: `col:${name}`, label: `catalog ${key}`, kind: 'collection', name, read: (s) => s.catalogs?.[key] });
  }
  // Page-level collections (useCollection hook).
  for (const name of Object.keys(state.collections || {})) {
    specs.push({ key: `col:${name}`, label: name, kind: 'collection', name, read: (s) => s.collections?.[name] });
  }
  return specs;
}

function toMap(items) {
  const map = new Map();
  for (const item of items || []) {
    const id = recordKey(item);
    if (id !== null && id !== undefined) map.set(String(id), item);
  }
  return map;
}

function changedFields(before, after) {
  const patch = {};
  for (const key of new Set([...Object.keys(before || {}), ...Object.keys(after || {})])) {
    if (REST_READ_ONLY.has(key)) continue;
    if (stableStringify(before?.[key]) !== stableStringify(after?.[key])) patch[key] = after?.[key] ?? null;
  }
  return patch;
}

export function createSyncEngine(store) {
  let active = false;
  let timer = null;
  let queue = Promise.resolve();
  // spec.key -> { ref: last array/object reference seen, items: Map(id -> json) , raw: Map(id -> item) }
  const confirmed = new Map();

  const snapshotOf = (items) => {
    const map = toMap(items);
    return {
      json: new Map([...map].map(([id, item]) => [id, stableStringify(item)])),
      raw: map,
    };
  };

  /** Records the given state as "what the server has" (after hydrate / server responses). */
  function markClean(state = store.getState()) {
    confirmed.clear();
    for (const spec of buildSpecs(state)) {
      const items = spec.read(state);
      if (items === undefined) continue;
      confirmed.set(spec.key, { ref: spec.refOf ? spec.refOf(state) : items, ...snapshotOf(items) });
    }
  }

  /** Marks one record as server-confirmed (used after explicit business-rule endpoint calls). */
  function markRecordClean(slice, item) {
    const spec = REST_SLICES[slice] ? `rest:${slice}` : COLLECTION_SLICES[slice] ? `col:${COLLECTION_SLICES[slice]}` : null;
    const entry = spec && confirmed.get(spec);
    const id = recordKey(item);
    if (!entry || id === null) return;
    entry.json.set(String(id), stableStringify(item));
    entry.raw.set(String(id), item);
  }

  async function pushOp(spec, op) {
    const { id, before, after } = op;
    if (spec.kind === 'rest') {
      const { path, create = true, remove = true } = spec.cfg;
      if (op.type === 'create' && create) {
        const body = { ...after };
        REST_READ_ONLY.forEach((k) => delete body[k]);
        await backend.createResource(path, body);
      } else if (op.type === 'update') {
        const patch = changedFields(before, after);
        if (Object.keys(patch).length) await backend.updateResource(path, id, patch);
      } else if (op.type === 'delete' && remove) {
        await backend.deleteResource(path, id);
      }
      return;
    }
    if (op.type === 'create') await backend.createRecord(spec.name, { ...after, id });
    else if (op.type === 'update') await backend.replaceRecord(spec.name, id, { ...after, id });
    else await backend.deleteRecord(spec.name, id);
  }

  function diff() {
    const state = store.getState();
    const work = [];
    for (const spec of buildSpecs(state)) {
      const items = spec.read(state);
      if (items === undefined) continue;
      const ref = spec.refOf ? spec.refOf(state) : items;
      const prev = confirmed.get(spec.key);
      if (prev && prev.ref === ref) continue; // untouched since last sync
      const next = snapshotOf(items);
      const ops = [];
      const before = prev || { json: new Map(), raw: new Map() };
      for (const [id, json] of next.json) {
        if (!before.json.has(id)) ops.push({ type: 'create', id, after: next.raw.get(id) });
        else if (before.json.get(id) !== json) {
          ops.push({ type: 'update', id, before: before.raw.get(id), after: next.raw.get(id) });
        }
      }
      for (const id of before.json.keys()) {
        if (!next.json.has(id)) ops.push({ type: 'delete', id, before: before.raw.get(id) });
      }
      // Assume success; a failure reloads server truth, which resets this snapshot.
      confirmed.set(spec.key, { ref, ...next });
      if (ops.length) work.push({ spec, ops });
    }
    return work;
  }

  function flush() {
    timer = null;
    if (!active || !backend.isLoggedIn()) return queue;
    const work = diff();
    if (!work.length) return queue;
    queue = queue.then(async () => {
      for (const { spec, ops } of work) {
        for (const op of ops) {
          try {
            await pushOp(spec, op);
          } catch (err) {
            const action = op.type === 'create' ? 'add' : op.type === 'delete' ? 'delete' : 'save';
            toast.error(`Could not ${action} ${spec.label} (${op.id}): ${err.message}`);
            // Reload server truth *after* this queue settles: refreshFromBackend waits for the queue,
            // so awaiting it here would deadlock.
            setTimeout(() => store.getState().refreshFromBackend?.(), 0);
            return; // drop the rest of this batch; the reload resets every snapshot
          }
        }
      }
    });
    return queue;
  }

  const unsubscribe = store.subscribe(() => {
    if (!active) return;
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && timer) {
        clearTimeout(timer);
        flush();
      }
    });
  }

  return {
    start(state) {
      markClean(state);
      active = true;
    },
    stop() {
      active = false;
      clearTimeout(timer);
      confirmed.clear();
    },
    markClean,
    markRecordClean,
    /** Sends pending changes now (e.g. before navigating away after a save). */
    flush: () => {
      clearTimeout(timer);
      return flush();
    },
    isActive: () => active,
    dispose: unsubscribe,
  };
}
