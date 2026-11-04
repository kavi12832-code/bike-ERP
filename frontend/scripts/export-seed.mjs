// Exports the demo data to backend/fixtures/demo_seed.json, which `manage.py seed_demo` loads into
// PostgreSQL. The running app never uses this data directly: it reads everything from the API.
// Run with: npm run export:seed
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialSeedData } from '../src/data/seed';
import { ROLE_PRESETS } from '../src/config/roles';
import {
  CATALOG_KEYS,
  COLLECTION_SLICES,
  OBJECT_RECORD_ID,
  OBJECT_SLICES,
  catalogCollection,
  recordKey,
} from '../src/store/syncConfig';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The backend lives next to the frontend folder: <repo>/backend
const out = resolve(root, '../backend/fixtures/demo_seed.json');
const seed = getInitialSeedData();

// Slices with their own backend tables (loaded into models by seed_demo).
const MODEL_KEYS = [
  'dealership', 'branches', 'customers', 'vehicleStock', 'partsStock', 'leads', 'quotations', 'bookings',
  'salesOrders', 'bays', 'jobCards', 'appointments', 'invoices', 'notifications',
];

const withIds = (items) => (items || []).map((item) => ({ ...item, id: recordKey(item) ?? undefined }));

const collections = {};
for (const [slice, name] of Object.entries(COLLECTION_SLICES)) collections[name] = withIds(seed[slice]);
for (const [slice, name] of Object.entries(OBJECT_SLICES)) {
  collections[name] = seed[slice] === undefined ? [] : [{ id: OBJECT_RECORD_ID, value: seed[slice] }];
}
for (const key of CATALOG_KEYS) collections[catalogCollection(key)] = withIds(seed.catalogs?.[key]);

// Records that pages used to hardcode, extracted by scripts/extract-page-data.mjs.
const pageFixtures = resolve(root, 'src/data/fixtures/pageCollections.js');
if (existsSync(pageFixtures)) {
  const { PAGE_COLLECTIONS } = await import('../src/data/fixtures/pageCollections.js');
  for (const [name, items] of Object.entries(PAGE_COLLECTIONS)) collections[name] = withIds(items);
}

const payload = {
  exportedAt: new Date().toISOString(),
  users: ROLE_PRESETS, // demo personas (login accounts if missing from the directory)
  staffDirectory: seed.users || [], // Admin > Users directory -> real login accounts
  collections,
};
for (const key of MODEL_KEYS) payload[key] = seed[key] ?? [];

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 1));
const recordCount = Object.values(collections).reduce((n, list) => n + list.length, 0);
console.log(`Wrote ${out} (${Object.keys(collections).length} collections, ${recordCount} records)`);
