// src/config/usersConfig.js
/**
 * Configuration and safety rules for Users & Staff Account Administration.
 */

import { PERMISSIONS } from './permissions';
import { ROLES } from './roles';

// EXPLICIT REQUIREMENT: No trend arrows or charts on KPI cards.
// Trend text can be enabled in the future without code changes by setting this to true.
export const SHOW_KPI_TRENDS = false;

// Allowed company email domain for official staff emails
export const COMPANY_DOMAIN = '@akashbajaj.com';

// System security policy defaults
export const SECURITY_POLICY = {
  minPasswordLength: 10,
  requireComplexity: true, // Uppercase, lowercase, number, symbol
  passwordExpiryDays: 90,
  failedAttemptsLockThreshold: 5,
  autoUnlockMinutes: 30,
  inviteLinkValidityHours: 48,
};

// Role hierarchy levels (higher number = higher privilege)
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  'Branch Manager': 80,
  [ROLES.SALES_MANAGER]: 60,
  [ROLES.SERVICE_MANAGER]: 60,
  [ROLES.ACCOUNTANT]: 50,
  [ROLES.INVENTORY_MANAGER]: 40,
  [ROLES.SERVICE_ADVISOR]: 30,
  [ROLES.SALES_EXECUTIVE]: 20,
  [ROLES.TECHNICIAN]: 10,
  'PDI Specialist': 10,
  'CRM Executive': 10,
  'Parts Specialist': 10,
};

// Roles considered privileged that require approval & mandatory 2FA
export const PRIVILEGED_ROLES = [
  ROLES.SUPER_ADMIN,
  'Branch Manager',
  ROLES.SALES_MANAGER,
  ROLES.SERVICE_MANAGER,
  ROLES.ACCOUNTANT,
];

// Check whether a user with creatorRole can assign targetRole
export function canAssignRole(creatorRole, targetRole) {
  if (creatorRole === ROLES.SUPER_ADMIN) {
    // Super admin can assign any role, but creating another Super Admin requires dual-control approval
    return true;
  }
  const creatorLevel = ROLE_HIERARCHY[creatorRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  // Can only assign roles strictly below their own
  return targetLevel < creatorLevel;
}

// Check whether targetRole is privileged
export function isPrivilegedRole(role) {
  return PRIVILEGED_ROLES.includes(role);
}

// Plain-language role capabilities for Step 2 and Staff Drawer
export const ROLE_CAPABILITIES = {
  [ROLES.SUPER_ADMIN]: {
    canDo: [
      'Full administrative access across all 3 dealership branches',
      'Manage credentials, 2FA policies and system configurations',
      'Approve high-value discounts, expenses and payroll runs',
      'Export unmasked statutory audit trails and customer PII',
      'Manage dealer network, OEM schemes and bank integrations',
    ],
    cannotSee: [],
  },
  [ROLES.SALES_MANAGER]: {
    canDo: [
      'Lead distribution, pipeline allocation and team targets',
      'Approve vehicle booking cancellations and discount requests',
      'View wholesale vehicle inventory and allocation states',
      'Access sales analytics, deal profitability and conversion reports',
      'Manage test ride schedules and showroom campaigns',
    ],
    cannotSee: [
      'Cannot view other staff salaries or HR payroll records',
      'Cannot modify general ledger accounts or tax rules',
      'Cannot edit system-wide 2FA or security audit policies',
    ],
  },
  [ROLES.SALES_EXECUTIVE]: {
    canDo: [
      'Create and update customer inquiries and leads',
      'Generate quotations and book customer test rides',
      'Collect token payments and initiate vehicle bookings',
      'Deliver retail vehicles and complete digital PDI handovers',
    ],
    cannotSee: [
      'Cannot view wholesale vehicle purchase costs or dealer margins',
      'Cannot approve discounts or waive statutory RTO/Insurance fees',
      'Cannot cancel confirmed bookings without manager approval',
      'Cannot view other sales executives\' performance commissions',
    ],
  },
  [ROLES.SERVICE_MANAGER]: {
    canDo: [
      'Manage workshop bays, technician job queues and SLA targets',
      'Approve warranty claims, recall repairs and goodwill discounts',
      'Review service quality, First Time Fix (FTF) and comeback logs',
      'Manage spare parts requisition for active job cards',
    ],
    cannotSee: [
      'Cannot view vehicle showroom sales margins or financing commissions',
      'Cannot access general accounting journal entries',
      'Cannot view management payroll benchmarks',
    ],
  },
  [ROLES.SERVICE_ADVISOR]: {
    canDo: [
      'Book service appointments and open digital Job Cards',
      'Perform Digital Vehicle Inspections (DVI) with photo evidence',
      'Generate repair estimates and bill approved services',
      'Issue spare parts to assigned workshop bays',
    ],
    cannotSee: [
      'Cannot cancel posted statutory tax invoices',
      'Cannot approve warranty claim write-offs without manager sign-off',
      'Cannot access wholesale parts procurement purchase orders',
    ],
  },
  [ROLES.TECHNICIAN]: {
    canDo: [
      'View assigned service job cards and customer complaints',
      'Clock labour hours and request parts from spares counter',
      'Complete safety checklists and mark vehicle ready for QC',
      'Perform Pre-Delivery Inspections (PDI) on newly arrived stock',
    ],
    cannotSee: [
      'Cannot view customer contact numbers or sales invoices',
      'Cannot view dealership financial ledger or profit margins',
      'Cannot edit vehicle inventory pricing or labour rates',
      'Cannot access customer portal credentials or audit logs',
    ],
  },
  [ROLES.ACCOUNTANT]: {
    canDo: [
      'Post statutory GST tax invoices and record customer settlements',
      'Manage general ledger, journal entries and bank reconciliation',
      'Generate GSTR-1 / GSTR-3B monthly compliance summaries',
      'Calculate monthly staff payroll and incentive disbursal batches',
      'Manage customer credit notes and supplier payments',
    ],
    cannotSee: [
      'Cannot modify vehicle allocation states without sales manager sign-off',
      'Cannot override workshop technician labour hours',
      'Cannot alter system-wide RBAC role permissions',
    ],
  },
  [ROLES.INVENTORY_MANAGER]: {
    canDo: [
      'Manage spare parts stock, minimum reorder thresholds and bins',
      'Process Goods Received Notes (GRN) against purchase orders',
      'Perform physical stock audits and log variance adjustments',
      'Transfer inventory between dealership branch hubs',
    ],
    cannotSee: [
      'Cannot approve unvouched customer discounts or cash disbursements',
      'Cannot access customer CRM conversations or WhatsApp studio',
      'Cannot view staff incentive commission matrices',
    ],
  },
};

// Default fallback capabilities for custom or unmapped roles
export function getRoleCapabilities(roleName) {
  if (ROLE_CAPABILITIES[roleName]) {
    return ROLE_CAPABILITIES[roleName];
  }
  return {
    canDo: [
      'Standard operational access scoped to assigned branch',
      'View tasks, appointments, and notifications relevant to role',
    ],
    cannotSee: [
      'Cannot access privileged financial ledgers or system security settings',
      'Cannot view other staff compensation or statutory audit logs',
    ],
  };
}

// Field Validators
export function validateLegalName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Full legal name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name contains invalid characters.';
  return null;
}

export function validateEmployeeCode(code, existingUsers = [], currentUserId = null) {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) return 'Employee code is required.';
  if (!/^EMP-\d{4}-\d{4}$/.test(trimmed) && !/^EMP-\d{4}$/.test(trimmed)) {
    return 'Format should be EMP-YYYY-XXXX (e.g. EMP-2026-0043).';
  }
  const duplicate = existingUsers.find(
    (u) => (u.employeeCode || '').toUpperCase() === trimmed && u.id !== currentUserId
  );
  if (duplicate) return `Employee code ${trimmed} is already assigned to ${duplicate.fullName || duplicate.name}.`;
  return null;
}

export function validateOfficialEmail(email, existingUsers = [], currentUserId = null, domain = COMPANY_DOMAIN) {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed) return 'Official email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
  if (!trimmed.endsWith(domain.toLowerCase())) {
    return `Email must use company domain (${domain}).`;
  }
  const duplicate = existingUsers.find(
    (u) => (u.email || '').toLowerCase() === trimmed && u.id !== currentUserId
  );
  if (duplicate) return `Email is already registered for ${duplicate.fullName || duplicate.name}.`;
  return null;
}

export function validateIndianMobile(phone, existingUsers = [], currentUserId = null) {
  const trimmed = (phone || '').replace(/\s+/g, '').replace(/^(\+91)/, '');
  if (!trimmed) return 'Mobile phone number is required.';
  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile starting with 6-9.';
  }
  const normalized = `+91 ${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
  const duplicate = existingUsers.find((u) => {
    if (u.id === currentUserId) return false;
    const existingRaw = (u.phone || '').replace(/\s+/g, '').replace(/^(\+91)/, '');
    return existingRaw === trimmed;
  });
  if (duplicate) return `Mobile number is already registered for ${duplicate.fullName || duplicate.name}.`;
  return null;
}

export function formatIndianMobile(input) {
  const digits = (input || '').replace(/\D/g, '');
  const clean = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  if (clean.length === 0) return '+91 ';
  if (clean.length <= 5) return `+91 ${clean}`;
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5, 10)}`;
}

// Generate unique auto-incrementing employee code
export function generateNextEmployeeCode(existingUsers = []) {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  existingUsers.forEach((u) => {
    const code = u.employeeCode || '';
    const match = code.match(/EMP-(\d{4})-(\d{4})/) || code.match(/EMP-(\d{4})/);
    if (match) {
      const seq = parseInt(match[2] || match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `EMP-${year}-${nextSeq}`;
}

