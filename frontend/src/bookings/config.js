/**
 * Bookings Module Configuration & Status Constants
 * Strict requirement: NO GRAPH DESIGN
 * SHOW_KPI_TRENDS = false
 */

export const SHOW_KPI_TRENDS = false;

export const BOOKING_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const STATUS_CONFIG = {
  [BOOKING_STATUSES.PENDING]: {
    id: 'PENDING',
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    dotColor: '#f59e0b',
    icon: 'Clock',
    description: 'Awaiting token clearance, minimum deposit, or manager authorization.',
  },
  [BOOKING_STATUSES.CONFIRMED]: {
    id: 'CONFIRMED',
    label: 'Confirmed',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotColor: '#10b981',
    icon: 'CheckCircle2',
    description: 'Token cleared and unique chassis allocated. Awaiting customer handover.',
  },
  [BOOKING_STATUSES.DELIVERED]: {
    id: 'DELIVERED',
    label: 'Delivered',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    dotColor: '#3b82f6',
    icon: 'Truck',
    description: 'Handover complete. PDI signed, invoice settled and keys dispatched.',
  },
  [BOOKING_STATUSES.CANCELLED]: {
    id: 'CANCELLED',
    label: 'Cancelled',
    badgeClass: 'bg-slate-200 text-slate-700 border-slate-300',
    dotColor: '#64748b',
    icon: 'Ban',
    description: 'Reservation cancelled with audit reason. Chassis released to inventory.',
  },
};

// Model-wise minimum token requirements (in Paise)
export const MODEL_MINIMUM_TOKEN_PAISE = {
  'bike-re-him450': 2000000, // ₹ 20,000 (Himalayan 450)
  'bike-re-classic350': 1500000, // ₹ 15,000 (Classic 350)
  'bike-re-hunter350': 1000000, // ₹ 10,000 (Hunter 350)
  'bike-bajaj-pulsarns200': 1000000, // ₹ 10,000 (Pulsar NS200)
  'bike-tvs-apache160': 1000000, // ₹ 10,000 (Apache RTR 160)
  'bike-honda-sp125': 500000, // ₹ 5,000 (SP 125)
  'bike-honda-activa125': 500000, // ₹ 5,000 (Activa 125)
};

export const DEFAULT_MINIMUM_TOKEN_PAISE = 1000000; // ₹ 10,000 default

export const DEFAULT_HOLD_HOURS = 48;

/**
 * Strict 17-character VIN Validator (excludes I, O, Q)
 */
export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export const VALID_PAYMENT_MODES = ['UPI', 'CARD', 'NETBANKING', 'CASH', 'CHEQUE'];

export const CANCELLATION_REFUND_POLICIES = {
  PRE_ALLOCATION: {
    description: 'Before chassis allocation: 100% full token refund',
    deductionPercent: 0,
  },
  POST_ALLOCATION: {
    description: 'After chassis allocation: ₹ 1,000 admin charge retained',
    deductionPaise: 100000,
  },
  DISPATCH_READY: {
    description: 'After PDI & RTO submission: 50% cancellation fee',
    deductionPercent: 50,
  },
};

