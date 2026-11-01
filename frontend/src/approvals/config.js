// src/approvals/config.js
/**
 * Configuration constants for the Dual-Control Approvals Center.
 * Explicit Requirement: SHOW_KPI_TRENDS = false.
 * Strictly no charts, sparklines, or trend arrows on the Approvals page.
 */

export const SHOW_KPI_TRENDS = false;

export const APPROVAL_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',     // Changes requested by reviewer
  ESCALATED: 'Escalated',   // SLA breached; elevated to higher tier
  EXPIRED: 'Expired',       // Approval validity period elapsed
  CANCELLED: 'Cancelled',   // Withdrawn by requester or source altered
};

export const APPROVAL_TYPES = {
  DISCOUNT: 'DISCOUNT',     // Vehicle & Accessory discount requests
  REFUND: 'REFUND',         // Booking cancellations & customer refunds
  WRITE_OFF: 'WRITE-OFF',   // Stock, parts & damaged vehicle write-offs
  CAMPAIGN: 'CAMPAIGN',     // WhatsApp campaigns & promotional offers
  JOURNAL: 'JOURNAL',       // Manual journal vouchers & accounting adjustments
  PAYROLL: 'PAYROLL',       // Staff payroll runs & incentive adjustments
  ACCESS: 'ACCESS',         // Privileged role assignments & 2FA waivers
  EXPORT: 'EXPORT',         // Bulk & unmasked PII data exports
};

export const APPROVAL_MODULES = {
  SALES: 'Sales',
  SERVICE: 'Service',
  ACCOUNTS: 'Accounts',
  MARKETING: 'Marketing',
  HR: 'HR',
  ADMIN: 'Admin',
};

export const BUSINESS_HOURS = {
  START_HOUR: 9,
  START_MINUTE: 30, // 09:30 IST
  END_HOUR: 19,
  END_MINUTE: 0,    // 19:00 IST
  WORKING_DAYS: [1, 2, 3, 4, 5, 6], // Monday = 1, Saturday = 6 (Sunday off)
  MINUTES_PER_DAY: 570, // 9.5 hours = 570 mins
};

// Default approval validity after being granted (source record must be processed within this window)
export const DEFAULT_APPROVAL_VALIDITY_HOURS = 24;

// Color tokens for status badges
export const STATUS_COLORS = {
  [APPROVAL_STATUS.PENDING]: 'bg-amber-50 text-amber-800 border-amber-200',
  [APPROVAL_STATUS.APPROVED]: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  [APPROVAL_STATUS.REJECTED]: 'bg-red-50 text-red-800 border-red-200',
  [APPROVAL_STATUS.RETURNED]: 'bg-blue-50 text-blue-800 border-blue-200',
  [APPROVAL_STATUS.ESCALATED]: 'bg-purple-50 text-purple-800 border-purple-200',
  [APPROVAL_STATUS.EXPIRED]: 'bg-slate-100 text-slate-700 border-slate-200',
  [APPROVAL_STATUS.CANCELLED]: 'bg-slate-100 text-slate-600 border-slate-200',
};

// Color tokens for approval type chips
export const TYPE_COLORS = {
  [APPROVAL_TYPES.DISCOUNT]: 'bg-blue-50 text-blue-700 border-blue-200',
  [APPROVAL_TYPES.REFUND]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [APPROVAL_TYPES.WRITE_OFF]: 'bg-purple-50 text-purple-700 border-purple-200',
  [APPROVAL_TYPES.CAMPAIGN]: 'bg-teal-50 text-teal-700 border-teal-200',
  [APPROVAL_TYPES.JOURNAL]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [APPROVAL_TYPES.PAYROLL]: 'bg-rose-50 text-rose-700 border-rose-200',
  [APPROVAL_TYPES.ACCESS]: 'bg-orange-50 text-orange-700 border-orange-200',
  [APPROVAL_TYPES.EXPORT]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

