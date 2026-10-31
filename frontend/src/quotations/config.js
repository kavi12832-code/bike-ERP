/**
 * Quotations Module Configuration & Status Constants
 * Strict requirement: NO GRAPH DESIGN
 * SHOW_KPI_TRENDS = false
 */

export const SHOW_KPI_TRENDS = false;

export const DEFAULT_VALIDITY_DAYS = 7;

export const QUOTATION_STATUSES = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SENT: 'Sent',
  CONVERTED: 'Converted',
  EXPIRED: 'Expired',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const STATUS_CONFIG = {
  [QUOTATION_STATUSES.DRAFT]: {
    id: 'DRAFT',
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    dotColor: '#64748b',
    icon: 'FileText',
    canEdit: true,
    isTerminal: false,
    description: 'Initial quotation created, awaiting discount authorization or dispatch.',
  },
  [QUOTATION_STATUSES.PENDING_APPROVAL]: {
    id: 'PENDING_APPROVAL',
    label: 'Pending Approval',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    dotColor: '#f59e0b',
    icon: 'Clock',
    canEdit: false,
    isTerminal: false,
    description: 'Discount exceeds personal limits. Locked awaiting dual-control authorization.',
  },
  [QUOTATION_STATUSES.APPROVED]: {
    id: 'APPROVED',
    label: 'Approved',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotColor: '#10b981',
    icon: 'CheckCircle2',
    canEdit: true,
    isTerminal: false,
    description: 'Special pricing authorized. Ready for customer communication or token booking.',
  },
  [QUOTATION_STATUSES.SENT]: {
    id: 'SENT',
    label: 'Sent',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    dotColor: '#3b82f6',
    icon: 'Send',
    canEdit: true,
    isTerminal: false,
    description: 'Dispatched to customer via WhatsApp/Email. Awaiting purchase decision.',
  },
  [QUOTATION_STATUSES.CONVERTED]: {
    id: 'CONVERTED',
    label: 'Converted',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    dotColor: '#6366f1',
    icon: 'BookmarkCheck',
    canEdit: false,
    isTerminal: true,
    description: 'Customer paid booking advance. Linked to Vehicle Sales Booking.',
  },
  [QUOTATION_STATUSES.EXPIRED]: {
    id: 'EXPIRED',
    label: 'Expired',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    dotColor: '#ef4444',
    icon: 'AlertCircle',
    canEdit: false,
    isTerminal: false,
    description: 'Price lock validity elapsed. Can be renewed into a new quotation version.',
  },
  [QUOTATION_STATUSES.REJECTED]: {
    id: 'REJECTED',
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotColor: '#e11d48',
    icon: 'XCircle',
    canEdit: false,
    isTerminal: false,
    description: 'Requested discount was rejected or returned by authorizing manager.',
  },
  [QUOTATION_STATUSES.CANCELLED]: {
    id: 'CANCELLED',
    label: 'Cancelled',
    badgeClass: 'bg-slate-200 text-slate-700 border-slate-300',
    dotColor: '#475569',
    icon: 'Ban',
    canEdit: false,
    isTerminal: true,
    description: 'Customer or showroom cancelled this proposal with audit reason.',
  },
};
