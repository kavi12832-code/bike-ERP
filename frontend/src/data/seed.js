import { SEEDED_APPROVALS } from './approvalsSeed';
import { DEFAULT_POLICIES } from '../approvals/policies';
import { SEEDED_USERS } from './usersSeed';
import { SEEDED_HR_STAFF, SEEDED_PERFORMANCE_TREND, SEEDED_PAYROLL_RUNS, SEEDED_INCENTIVE_RULES, SEEDED_MONTHLY_ATTENDANCE } from './hrSeed';
import { DEALERSHIP_INFO, BRANCHES } from '../config/constants';
import { ROLE_PRESETS } from '../config/roles';
import { BIKE_CATALOG } from './catalogs/bikes';
import { TAX_RULES } from './catalogs/taxRules';
import { FINANCIERS } from './catalogs/financiers';
import { SERVICE_PACKAGES } from './catalogs/servicePackages';
import { PDI_CHECKLIST_TEMPLATE, SERVICE_CHECKIN_INSPECTION } from './catalogs/inspectionTemplates';
import { SEEDED_CUSTOMERS } from './factories/people';
import { SEEDED_VEHICLE_UNITS } from './factories/bikes';
import { SEEDED_PARTS } from './factories/parts';
import { SEEDED_QUOTATIONS } from './quotationsSeed';
import { SEEDED_BOOKINGS } from './bookingsSeed';
import { SEEDED_VEHICLE_STOCK } from './stockSeed';
import { SEEDED_LEADS, SEEDED_SALES_ORDERS } from './factories/orders';
import { SEEDED_APPOINTMENTS, SEEDED_BAYS, SEEDED_JOB_CARDS } from './factories/jobs';
import { SEEDED_INVOICES, SEEDED_CHART_OF_ACCOUNTS, SEEDED_JOURNAL_ENTRIES } from './factories/invoices';
import { SEEDED_WHATSAPP_CONVERSATIONS, SEEDED_WA_TEMPLATES } from './factories/messages';
import { relativeDateIso } from '../lib/dates';
import {
  SEEDED_IMPORT_HISTORY,
  SEEDED_EXPORT_HISTORY,
  SEEDED_SCHEDULED_JOBS,
  SEEDED_SYNC_INTEGRATIONS,
} from './importExportSeed';
import {
  SEEDED_TASKS,
  SEEDED_CANCELLATIONS,
  DEFAULT_DASHBOARD_SETTINGS,
} from './dashboardSeed';

export function getInitialSeedData() {
  return {
    dealership: DEALERSHIP_INFO,
    branches: BRANCHES,
    activeBranchId: 'br-blr-central',
    currentUser: ROLE_PRESETS[0], // Rajesh Varma, Super Admin
    catalogs: {
      bikes: BIKE_CATALOG,
      taxRules: TAX_RULES,
      financiers: FINANCIERS,
      servicePackages: SERVICE_PACKAGES,
      pdiTemplate: PDI_CHECKLIST_TEMPLATE,
      serviceInspectionTemplate: SERVICE_CHECKIN_INSPECTION,
    },
    users: SEEDED_USERS,
    userDrafts: [],
    customers: SEEDED_CUSTOMERS,
    vehicleStock: SEEDED_VEHICLE_STOCK,
    partsStock: SEEDED_PARTS,
    leads: SEEDED_LEADS,
    quotations: SEEDED_QUOTATIONS,
    bookings: SEEDED_BOOKINGS,
    salesOrders: SEEDED_SALES_ORDERS,
    bays: SEEDED_BAYS,
    jobCards: SEEDED_JOB_CARDS,
    appointments: SEEDED_APPOINTMENTS,
    invoices: SEEDED_INVOICES,
    chartOfAccounts: SEEDED_CHART_OF_ACCOUNTS,
    journalEntries: SEEDED_JOURNAL_ENTRIES,
    whatsappConversations: SEEDED_WHATSAPP_CONVERSATIONS,
    whatsappTemplates: SEEDED_WA_TEMPLATES,
    approvals: SEEDED_APPROVALS,
    approvalPolicies: DEFAULT_POLICIES,
    auditLogs: [
      {
        id: 'aud-001',
        timestamp: relativeDateIso(-75),
        userId: 'accountant',
        userName: 'Suresh Iyer',
        userRole: 'Accountant',
        action: 'INVOICE_POSTED',
        entityType: 'INVOICE',
        entityId: 'inv-2627-001',
        oldValue: { status: 'DRAFT' },
        newValue: { status: 'POSTED', invoiceNumber: 'VI/2627/00001', amount: 38900000 },
        ipAddress: '192.168.1.104',
      },
      {
        id: 'aud-002',
        timestamp: relativeDateIso(-15),
        userId: 'sales-manager',
        userName: 'Vikram Sethi',
        userRole: 'Sales Manager',
        action: 'CHASSIS_ALLOCATED',
        entityType: 'VEHICLE_STOCK',
        entityId: 'unit-hunter-02',
        oldValue: { status: 'IN_STOCK', allocatedBookingId: null },
        newValue: { status: 'ALLOCATED', allocatedBookingId: 'bk-2627-001' },
        ipAddress: '192.168.1.102',
      },
    ],
    importHistory: SEEDED_IMPORT_HISTORY,
    exportHistory: SEEDED_EXPORT_HISTORY,
    scheduledJobs: SEEDED_SCHEDULED_JOBS,
    syncIntegrations: SEEDED_SYNC_INTEGRATIONS,
    tasks: SEEDED_TASKS,
    cancellations: SEEDED_CANCELLATIONS,
    settings: DEFAULT_DASHBOARD_SETTINGS,
    lastImportMappings: {},
    hrStaff: SEEDED_HR_STAFF,
    hrPerformanceTrend: SEEDED_PERFORMANCE_TREND,
    hrPayrollRuns: SEEDED_PAYROLL_RUNS,
    hrIncentiveRules: SEEDED_INCENTIVE_RULES,
    hrAttendance: SEEDED_MONTHLY_ATTENDANCE,
    notifications: [
      {
        id: 'notif-1',
        type: 'SLA_BREACH',
        severity: 'HIGH',
        title: 'Bay #02 SLA Exceeded',
        message: 'TVS iQube (KA-03-EV-8840) exceeded 45-minute target delivery time.',
        timestamp: relativeDateIso(0, 15, 10),
        read: false,
        link: '/service/bays',
      },
      {
        id: 'notif-2',
        type: 'APPROVAL_REQUEST',
        severity: 'MEDIUM',
        title: 'Discount Approval Required',
        message: 'Deepak Rao requested ₹5,000 discount on Quotation QT/2627/00002.',
        timestamp: relativeDateIso(-1, 14, 30),
        read: false,
        link: '/quotations',
      },
      {
        id: 'notif-3',
        type: 'LOW_STOCK',
        severity: 'HIGH',
        title: 'Front Disc Brake Pad Set Low Stock',
        message: 'Current qty 8 is below reorder level 15.',
        timestamp: relativeDateIso(0, 8, 30),
        read: false,
        link: '/stock/parts',
      },
    ],
  };
}
