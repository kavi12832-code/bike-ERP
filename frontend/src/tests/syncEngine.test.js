import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';

const calls = [];
let failNext = false;
vi.mock('../services/api/backend', () => {
  const record = (name) => (...args) => {
    calls.push([name, ...args]);
    if (failNext) {
      failNext = false;
      return Promise.reject(new Error('Dual-control violation'));
    }
    return Promise.resolve({});
  };
  return {
    backend: {
      isLoggedIn: () => true,
      createResource: record('createResource'),
      updateResource: record('updateResource'),
      deleteResource: record('deleteResource'),
      createRecord: record('createRecord'),
      replaceRecord: record('replaceRecord'),
      deleteRecord: record('deleteRecord'),
    },
  };
});
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

// The test setup already loaded the store (and sync.js with the real backend); reload with the mock.
vi.resetModules();
const { createSyncEngine } = await import('../store/sync');

function makeStore() {
  const refresh = vi.fn(async () => {
    // A reload waits for pending pushes, like the real refreshFromBackend.
    await engine.flush();
    return true;
  });
  const store = create(() => ({
    leads: [{ id: 'l1', customerName: 'A', stage: 'ENQUIRY' }],
    approvals: [{ id: 'ap1', status: 'Pending' }],
    settings: { dailyVehicleTarget: 5 },
    collections: { 'care.complaints': [] },
    refreshFromBackend: refresh,
  }));
  const engine = createSyncEngine(store);
  engine.start(store.getState());
  return { store, engine, refresh };
}

describe('store sync engine', () => {
  beforeEach(() => {
    calls.length = 0;
    failNext = false;
  });

  it('sends only what changed, to the right endpoint', async () => {
    const { store, engine } = makeStore();
    store.setState((s) => ({
      leads: [{ ...s.leads[0], stage: 'TEST_RIDE' }, { id: 'l2', customerName: 'B' }],
      collections: { 'care.complaints': [{ id: 'c1', title: 'Brake noise' }] },
      settings: { dailyVehicleTarget: 7 },
    }));
    await engine.flush();
    expect(calls).toContainEqual(['updateResource', 'leads', 'l1', { stage: 'TEST_RIDE' }]);
    expect(calls).toContainEqual(['createResource', 'leads', { id: 'l2', customerName: 'B' }]);
    expect(calls).toContainEqual(['createRecord', 'care.complaints', { id: 'c1', title: 'Brake noise' }]);
    expect(calls).toContainEqual(['replaceRecord', 'config.settings', '_value', { id: '_value', value: { dailyVehicleTarget: 7 } }]);
    expect(calls.some(([fn]) => fn.startsWith('delete'))).toBe(false);

    calls.length = 0;
    store.setState({ leads: [] });
    await engine.flush();
    expect(calls).toEqual([
      ['deleteResource', 'leads', 'l1'],
      ['deleteResource', 'leads', 'l2'],
    ]);
  });

  it('does not resend data that came from the server', async () => {
    const { store, engine } = makeStore();
    store.setState({ leads: [{ id: 'l9', customerName: 'From server' }] });
    engine.markClean(store.getState());
    await engine.flush();
    expect(calls).toEqual([]);
  });

  it('reloads server truth after a rejected change without deadlocking', async () => {
    const { store, engine, refresh } = makeStore();
    failNext = true;
    store.setState({ approvals: [{ id: 'ap1', status: 'Approved' }] });
    await engine.flush();
    await new Promise((r) => setTimeout(r, 10));
    expect(refresh).toHaveBeenCalledTimes(1);
    await expect(Promise.race([engine.flush(), new Promise((_, rej) => setTimeout(() => rej(new Error('deadlock')), 500))]))
      .resolves.toBeUndefined();
  });
});
