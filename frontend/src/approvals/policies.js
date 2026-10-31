// src/approvals/policies.js
/**
 * Single source of truth for dual-control approval policies.
 * All governance parameters, multi-level paths, SLA targets, and bulk limits live here.
 */

import { APPROVAL_TYPES, APPROVAL_MODULES } from './config';
import { ROLES } from '../config/roles';

export const DEFAULT_POLICIES = [
  // 1. Discount Policy
  {
    id: 'pol-discount',
    version: '1.2',
    type: APPROVAL_TYPES.DISCOUNT,
    label: 'Special Customer Discount Approval',
    module: APPROVAL_MODULES.SALES,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Discounts exceeding sales executive personal limit require Sales Manager approval. Discounts above ₹5,000 or >5% of ex-showroom price require 2-tier dual control including Branch Manager.',
    conditions: {
      minAmountPaise: 0, // Checked against requester limit dynamically
      multiLevelThresholdPaise: 500000, // ₹5,000
      multiLevelThresholdPercent: 5.0, // 5% of vehicle price
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.SALES_MANAGER, ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 1: Sales Management Review',
        businessHoursSla: 4,
        escalationRole: ROLES.BRANCH_MANAGER,
        escalationAfterHours: 4,
      },
      {
        level: 2,
        approverRoles: [ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 2: Branch Executive Sign-off',
        businessHoursSla: 6,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 6,
      },
    ],
    requiresNote: false, // Optional for approve; mandatory for reject/return
    requiresAttachment: false,
    bulkLimitPaise: 500000, // Maximum ₹5,000 allowed for bulk approve
    approvalValidityHours: 24,
  },

  // 2. Refund Policy
  {
    id: 'pol-refund',
    version: '1.0',
    type: APPROVAL_TYPES.REFUND,
    label: 'Booking Cancellation & Service Refund',
    module: APPROVAL_MODULES.SALES,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Customer deposit and booking cancellation refunds above ₹5,000 require Branch Manager approval. Refunds exceeding ₹25,000 require Level 1 Accountant verification prior to Branch Manager payout sign-off.',
    conditions: {
      minAmountPaise: 500000, // ₹5,000
      multiLevelThresholdPaise: 2500000, // ₹25,000
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN],
        label: 'Level 1: Accounts Ledger Verification',
        businessHoursSla: 4,
        escalationRole: ROLES.BRANCH_MANAGER,
        escalationAfterHours: 4,
      },
      {
        level: 2,
        approverRoles: [ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 2: Branch Manager Disbursement Sign-off',
        businessHoursSla: 6,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 6,
      },
    ],
    requiresNote: true,
    requiresAttachment: true,
    bulkLimitPaise: 1500000, // ₹15,000 max for bulk
    approvalValidityHours: 48,
  },

  // 3. Write-off Policy
  {
    id: 'pol-write-off',
    version: '1.1',
    type: APPROVAL_TYPES.WRITE_OFF,
    label: 'Inventory Scrap & Damaged Stock Write-off',
    module: APPROVAL_MODULES.SERVICE,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Inventory scrap and damaged vehicle write-offs above ₹10,000 require Branch Manager approval. High-value losses above ₹50,000 require statutory sign-off from Super Admin.',
    conditions: {
      minAmountPaise: 1000000, // ₹10,000
      multiLevelThresholdPaise: 5000000, // ₹50,000
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 1: Technical & Survey Verification',
        businessHoursSla: 6,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 6,
      },
      {
        level: 2,
        approverRoles: [ROLES.SUPER_ADMIN],
        label: 'Level 2: Principal Dealer Statutory Write-off',
        businessHoursSla: 8,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 8,
      },
    ],
    requiresNote: true,
    requiresAttachment: true,
    bulkLimitPaise: 1000000, // ₹10,000
    approvalValidityHours: 72,
  },

  // 4. Manual Journal Entry Policy
  {
    id: 'pol-journal',
    version: '1.0',
    type: APPROVAL_TYPES.JOURNAL,
    label: 'Manual Journal Voucher & Ledger Adjustment',
    module: APPROVAL_MODULES.ACCOUNTS,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'All manual debit/credit journal vouchers require dual-control sign-off by Finance Head or Super Admin. Creator can never approve.',
    conditions: {
      minAmountPaise: 1, // Any manual journal entry
      multiLevelThresholdPaise: 5000000, // Above ₹50k requires Super Admin specifically
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN],
        label: 'Level 1: Finance Verification & Posting Sign-off',
        businessHoursSla: 8,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 8,
      },
    ],
    requiresNote: true,
    requiresAttachment: true,
    bulkLimitPaise: 2500000, // ₹25,000
    approvalValidityHours: 24,
  },

  // 5. Marketing Campaign Policy
  {
    id: 'pol-campaign',
    version: '1.0',
    type: APPROVAL_TYPES.CAMPAIGN,
    label: 'WhatsApp Broadcast & Promotional Campaign Authorization',
    module: APPROVAL_MODULES.MARKETING,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Customer broadcast campaigns and promotional discount dispatches require Sales Manager approval with DPDP consent verification.',
    conditions: {
      minAmountPaise: 0,
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.SALES_MANAGER, ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 1: Campaign Budget & Content Authorization',
        businessHoursSla: 12,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 12,
      },
    ],
    requiresNote: false,
    requiresAttachment: false,
    bulkLimitPaise: 0, // Campaigns cannot be bulk approved
    approvalValidityHours: 48,
  },

  // 6. Payroll & Incentives Policy
  {
    id: 'pol-payroll',
    version: '1.0',
    type: APPROVAL_TYPES.PAYROLL,
    label: 'Monthly Staff Payroll & Incentive Disbursal Batch',
    module: APPROVAL_MODULES.HR,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Monthly payroll batch finalization or manual incentive adjustments above ₹5,000 require Branch Manager or Super Admin sign-off.',
    conditions: {
      minAmountPaise: 500000, // ₹5,000
      multiLevelThresholdPaise: 50000000, // ₹5 Lakhs batch requires Super Admin
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
        label: 'Level 1: Branch Payroll Certification',
        businessHoursSla: 8,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 8,
      },
    ],
    requiresNote: true,
    requiresAttachment: true,
    bulkLimitPaise: 500000, // ₹5,000
    approvalValidityHours: 48,
  },

  // 7. Privileged Access & 2FA Waiver Policy
  {
    id: 'pol-access',
    version: '1.0',
    type: APPROVAL_TYPES.ACCESS,
    label: 'Privileged Staff Enrolment & 2FA Waiver',
    module: APPROVAL_MODULES.ADMIN,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Creation of Super Admin, Manager, or Accountant accounts and 2FA waivers require Maker-Checker dual approval by a distinct Super Admin.',
    conditions: {
      minAmountPaise: 0,
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.SUPER_ADMIN],
        label: 'Level 1: Secondary Super Admin Security Review',
        businessHoursSla: 24,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 24,
      },
    ],
    requiresNote: true,
    requiresAttachment: false,
    bulkLimitPaise: 0, // Access requests cannot be bulk approved
    approvalValidityHours: 72,
  },

  // 8. Bulk & Personal Data Export Policy
  {
    id: 'pol-export',
    version: '1.0',
    type: APPROVAL_TYPES.EXPORT,
    label: 'Statutory DPDP Unmasked Data Export Authorization',
    module: APPROVAL_MODULES.ADMIN,
    enabled: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description:
      'Customer PII exports exceeding 25 records or containing unmasked mobile/email addresses require Super Admin statutory sign-off.',
    conditions: {
      minAmountPaise: 0,
    },
    levels: [
      {
        level: 1,
        approverRoles: [ROLES.SUPER_ADMIN],
        label: 'Level 1: Data Protection Officer (DPO) / Super Admin Review',
        businessHoursSla: 4,
        escalationRole: ROLES.SUPER_ADMIN,
        escalationAfterHours: 4,
      },
    ],
    requiresNote: true,
    requiresAttachment: false,
    bulkLimitPaise: 0,
    approvalValidityHours: 12,
  },
];

