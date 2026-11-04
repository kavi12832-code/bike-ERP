/**
 * Where each store slice lives on the Django backend. Shared by the sync engine (store/sync.js),
 * the bootstrap hydration and scripts/export-seed.mjs, so all three always agree.
 *
 * - REST slices have their own table and endpoint (/api/v1/<path>/).
 * - Collection slices are lists in the secured collections API (/api/v1/collections/<name>/).
 *   The prefix before the dot is the backend's permission module (hr.* is HR-only, etc.).
 * - Object slices are single objects, stored as one record with id "_value".
 * - Catalog slices are the lists inside `state.catalogs`.
 */

export const REST_SLICES = {
  customers: { path: 'customers' },
  leads: { path: 'leads' },
  quotations: { path: 'quotations' },
  bookings: { path: 'bookings' },
  salesOrders: { path: 'sales-orders' },
  vehicleStock: { path: 'vehicles' },
  partsStock: { path: 'parts' },
  jobCards: { path: 'job-cards' },
  appointments: { path: 'appointments' },
  notifications: { path: 'notifications' },
  branches: { path: 'branches' },
  users: { path: 'auth/users' },
  // Posted invoices are created by postInvoice() (server numbering); only payment fields may change later.
  invoices: { path: 'invoices', create: false, remove: false },
};

export const COLLECTION_SLICES = {
  approvals: 'approvals.requests',
  approvalPolicies: 'admin.approvalPolicies',
  chartOfAccounts: 'accounting.chartOfAccounts',
  journalEntries: 'accounting.journalEntries',
  whatsappConversations: 'whatsapp.conversations',
  whatsappTemplates: 'whatsapp.templates',
  importHistory: 'admin.importHistory',
  exportHistory: 'admin.exportHistory',
  scheduledJobs: 'admin.scheduledJobs',
  syncIntegrations: 'admin.syncIntegrations',
  externalIntegrations: 'admin.externalIntegrations',
  customApprovalRules: 'admin.customApprovalRules',
  customRoles: 'admin.customRoles',
  userDrafts: 'admin.userDrafts',
  tasks: 'tasks.items',
  cancellations: 'sales.cancellations',
  hrStaff: 'hr.staff',
  hrPerformanceTrend: 'hr.performanceTrend',
  hrPayrollRuns: 'hr.payrollRuns',
  hrIncentiveRules: 'hr.incentiveRules',
};

export const OBJECT_SLICES = {
  settings: 'config.settings',
  dealership: 'config.dealership',
  hrAttendance: 'hr.attendance',
  lastImportMappings: 'admin.lastImportMappings',
};

export const CATALOG_KEYS = ['bikes', 'taxRules', 'financiers', 'servicePackages', 'pdiTemplate', 'serviceInspectionTemplate'];
export const catalogCollection = (key) => `catalog.${key}`;

// Bays change only through the assign/release endpoints (server enforces occupancy rules).
export const EXPLICIT_SLICES = ['bays'];

export const OBJECT_RECORD_ID = '_value';

/** Stable key of a record inside a slice (some legacy lists have no `id`). */
export function recordKey(item) {
  if (!item || typeof item !== 'object') return null;
  return item.id ?? item.code ?? item.month ?? item.key ?? null;
}
