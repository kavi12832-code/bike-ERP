/**
 * Options, defaults and validation for the Create Vehicle Service Job Card form.
 * Validation mirrors backend/apps/erp/serializers.py (JobCardSerializer).
 */

export const MANUFACTURERS = {
  Bajaj: ['Pulsar 125', 'Pulsar 150', 'Pulsar N160', 'Pulsar NS200', 'Platina 110', 'CT 110X', 'Avenger 160', 'Dominar 400', 'Chetak EV'],
  Hero: ['Splendor Plus', 'HF Deluxe', 'Passion Pro', 'Glamour', 'Super Splendor', 'Xtreme 160R', 'Xpulse 200', 'Destini 125'],
  Honda: ['Activa 6G', 'Shine 100', 'Shine 125', 'SP 125', 'Unicorn', 'Dio', 'Hornet 2.0', 'CB350'],
  TVS: ['Jupiter', 'Ntorq 125', 'Raider 125', 'Apache RTR 160', 'Apache RTR 200', 'XL100', 'iQube Electric'],
  'Royal Enfield': ['Classic 350', 'Hunter 350', 'Bullet 350', 'Meteor 350', 'Himalayan 450', 'Interceptor 650'],
  Yamaha: ['FZ-S', 'MT-15', 'R15 V4', 'Ray ZR 125', 'Fascino 125'],
  Suzuki: ['Access 125', 'Burgman Street', 'Gixxer', 'Avenis'],
  KTM: ['Duke 200', 'Duke 390', 'RC 200'],
  'Ola Electric': ['S1 Pro', 'S1 Air', 'S1 X'],
  Ather: ['450X', '450S', 'Rizta'],
};

export const VARIANTS = ['Self Start', 'Kick Start', 'Disc Brake', 'Drum Brake', 'Alloy Wheel', 'Spoke Wheel', 'ABS', 'Standard'];
export const VEHICLE_TYPES = ['Two Wheeler', 'Motorcycle', 'Scooter', 'Electric Scooter', 'Electric Motorcycle', 'Moped'];
export const COLOURS = ['Black', 'White', 'Red', 'Blue', 'Grey', 'Silver', 'Green', 'Yellow', 'Orange', 'Brown', 'Matte Black', 'Other'];

export const SERVICE_TYPES = [
  { id: 'PERIODIC_MAINTENANCE', label: 'Periodic Maintenance' },
  { id: 'FREE_SERVICE', label: 'Free Service' },
  { id: 'PAID_SERVICE', label: 'Paid Service' },
  { id: 'RUNNING_REPAIR', label: 'Running Repair' },
  { id: 'ACCIDENTAL_REPAIR', label: 'Accidental Repair' },
  { id: 'WARRANTY_REPAIR', label: 'Warranty Repair' },
  { id: 'AMC_SERVICE', label: 'AMC Service' },
  { id: 'RECALL_CAMPAIGN', label: 'Recall / Campaign' },
  { id: 'PDI', label: 'Pre-Delivery Inspection (PDI)' },
];

export const PRIORITIES = [
  { id: 'LOW', label: 'Low' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'HIGH', label: 'High' },
  { id: 'URGENT', label: 'Urgent' },
];

// Job card status on creation; later stages are driven from the Job Cards Kanban.
export const JOB_STATUSES = [
  { id: 'CHECKED_IN', label: 'Vehicle Received' },
  { id: 'ESTIMATE_SENT', label: 'Estimate Sent' },
  { id: 'IN_PROGRESS', label: 'Work In Progress' },
];

export const INSURANCE_PROVIDERS = [
  'Bajaj Allianz', 'HDFC ERGO', 'ICICI Lombard', 'New India Assurance', 'United India Insurance',
  'Oriental Insurance', 'National Insurance', 'Tata AIG', 'SBI General', 'Digit Insurance', 'Acko', 'Other',
];
export const WARRANTY_TYPES = ['Manufacturer Warranty', 'Extended Warranty', 'AMC', 'Dealer Warranty', 'No Warranty'];

export const FUEL_LEVELS = [
  { id: 'EMPTY', label: 'Empty' },
  { id: 'RESERVE', label: 'Reserve' },
  { id: 'QUARTER', label: 'Quarter (1/4)' },
  { id: 'HALF', label: 'Half (1/2)' },
  { id: 'THREE_QUARTER', label: 'Three Quarter (3/4)' },
  { id: 'FULL', label: 'Full' },
];

export const DAMAGE_POINTS = [
  { id: 'FRONT_LEFT', label: 'Front Left' },
  { id: 'FRONT_RIGHT', label: 'Front Right' },
  { id: 'REAR_LEFT', label: 'Rear Left' },
  { id: 'REAR_RIGHT', label: 'Rear Right' },
];

export const CONDITIONS = [
  { id: 'GOOD', label: 'Good', className: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'NEEDS_ATTENTION', label: 'Needs Attention', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'DAMAGED', label: 'Damaged', className: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'NA', label: 'N/A', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: '', label: '-', className: 'bg-surface text-text-muted border-border' },
];

export const INSPECTION_ITEMS = [
  [
    { key: 'body', label: 'Body Condition' },
    { key: 'scratches', label: 'Existing Scratches / Dents' },
    { key: 'lights', label: 'Headlight & Indicators' },
    { key: 'horn', label: 'Horn' },
    { key: 'front_brake', label: 'Front Brake' },
    { key: 'rear_brake', label: 'Rear Brake' },
    { key: 'tyres', label: 'Tyre Condition' },
  ],
  [
    { key: 'wheels', label: 'Wheel Condition' },
    { key: 'battery', label: 'Battery Condition' },
    { key: 'clutch', label: 'Clutch Operation' },
    { key: 'steering', label: 'Steering Condition' },
    { key: 'suspension', label: 'Suspension Condition' },
    { key: 'chain', label: 'Chain Condition' },
    { key: 'engine', label: 'Engine Condition' },
    { key: 'other_damage', label: 'Other Visible Damage', defaultCondition: '' },
  ],
];

export const COMPLAINT_CATEGORIES = [
  'Starting Problem', 'Engine Noise', 'Pickup / Performance', 'Mileage Issue', 'Brake Issue', 'Electrical Issue',
  'Oil Leakage', 'Suspension Noise', 'Gear / Clutch Issue', 'Overheating', 'Periodic Service', 'Body / Paint', 'Other',
];
export const REPORTED_PROBLEMS = [
  'Battery / Electrical', 'Engine', 'Fuel System', 'Brakes', 'Clutch / Gearbox', 'Suspension', 'Tyres / Wheels',
  'Chain / Sprocket', 'Body / Paint', 'Other',
];

// Adviser / technician choices come from the staff directory (Admin > Users), not a fixed list.
const ADVISER_ROLES = ['Service Advisor', 'Service Manager', 'Workshop Manager'];
const TECHNICIAN_ROLES = ['Technician', 'Senior Technician', 'Master Technician', 'EV Technician'];
const activeNamesByRole = (users, roles) =>
  [...new Set((users || [])
    .filter((u) => roles.includes(u.role) && (u.status || 'Active') !== 'Inactive' && u.isActive !== false)
    .map((u) => u.name || u.fullName)
    .filter(Boolean))].sort();
export const serviceAdvisersFrom = (users) => activeNamesByRole(users, ADVISER_ROLES);
export const techniciansFrom = (users) => activeNamesByRole(users, TECHNICIAN_ROLES);

export const emptyComplaint = () => ({
  category: '',
  description: '',
  customerRemarks: '',
  reportedProblem: '',
  priority: 'MEDIUM',
});

const pad = (n) => String(n).padStart(2, '0');
export const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function emptyJobCardForm(now = new Date()) {
  const due = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  due.setHours(17, 0, 0, 0);
  return {
    customerId: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    registrationNumber: '',
    manufacturer: '',
    modelName: '',
    variant: '',
    vehicleType: 'Two Wheeler',
    chassisNumber: '',
    engineNumber: '',
    colour: '',
    dateOfSale: '',
    odometerKm: '',
    keyNumber: '',
    sellingDealer: '',
    vehicleTagNumber: '',
    inDate: toDateInput(now),
    inTime: toTimeInput(now),
    expectedDate: toDateInput(due),
    expectedTime: '17:00',
    actualDate: '',
    actualTime: '',
    advisorName: '',
    technicianName: '',
    priority: 'MEDIUM',
    stage: 'CHECKED_IN',
    serviceType: 'PERIODIC_MAINTENANCE',
    insuranceProvider: '',
    policyNumber: '',
    insuranceStart: '',
    insuranceExpiry: '',
    warrantyType: '',
    warrantyStart: '',
    warrantyExpiry: '',
    freeServiceCoupon: '',
    fuelLevel: 'HALF',
    damageMarks: [],
    remarks: '',
    inspection: INSPECTION_ITEMS.flat().map((item) => ({
      key: item.key,
      label: item.label,
      condition: item.defaultCondition ?? 'GOOD',
      remarks: '',
    })),
    complaints: [emptyComplaint()],
    appointmentId: null,
    // Set when the form is used to book a workshop slot (Service Appointments -> Book Service Appointment).
    bookingDate: '',
    bookingSlot: '',
  };
}

const combine = (date, time) => (date ? new Date(`${date}T${time || '00:00'}`) : null);
const PHONE_RE = /^[6-9]\d{9}$/;
const REG_RE = /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{0,3}[ -]?\d{1,4}$/;
export const phoneDigits = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
};

/** Returns { fieldName: message }. Drafts only check formats of fields that are filled in. */
export function validateJobCard(form, { draft = false } = {}) {
  const errors = {};
  const required = {
    customerName: 'Customer name is required',
    customerPhone: 'Mobile number is required',
    registrationNumber: 'Registration number is required',
    manufacturer: 'Select the manufacturer',
    modelName: 'Select the model',
    inDate: 'In date is required',
    expectedDate: 'Expected delivery date is required',
    advisorName: 'Select the service adviser',
    serviceType: 'Select the service type',
  };
  if (!draft) {
    Object.entries(required).forEach(([field, message]) => {
      if (!String(form[field] ?? '').trim()) errors[field] = message;
    });
  }
  if (form.customerPhone && !PHONE_RE.test(phoneDigits(form.customerPhone))) {
    errors.customerPhone = 'Enter a valid 10-digit mobile number';
  }
  if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
    errors.customerEmail = 'Enter a valid email address';
  }
  if (form.registrationNumber && !REG_RE.test(form.registrationNumber.trim().toUpperCase())) {
    errors.registrationNumber = 'Use the format AP 16 K 7038';
  }
  if (form.odometerKm !== '' && (Number(form.odometerKm) < 0 || Number(form.odometerKm) > 999999)) {
    errors.odometerKm = 'Enter a valid KM reading';
  }
  const inAt = combine(form.inDate, form.inTime);
  const expected = combine(form.expectedDate, form.expectedTime);
  const actual = combine(form.actualDate, form.actualTime);
  if (inAt && expected && expected < inAt) errors.expectedDate = 'Must be after the in date & time';
  if (inAt && actual && actual < inAt) errors.actualDate = 'Cannot be before the in date & time';
  if (form.insuranceStart && form.insuranceExpiry && form.insuranceExpiry < form.insuranceStart) {
    errors.insuranceExpiry = 'Must be after the start date';
  }
  if (form.warrantyStart && form.warrantyExpiry && form.warrantyExpiry < form.warrantyStart) {
    errors.warrantyExpiry = 'Must be after the start date';
  }
  return errors;
}

/** Form state -> API/store job card shape. */
export function toJobCardPayload(form, { draft }) {
  const iso = (date, time) => (date ? combine(date, time).toISOString() : null);
  const digits = phoneDigits(form.customerPhone);
  const { inDate, inTime, expectedDate, expectedTime, actualDate, actualTime, ...rest } = form;
  return {
    ...rest,
    customerPhone: digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : form.customerPhone,
    registrationNumber: form.registrationNumber.trim().toUpperCase(),
    odometerKm: form.odometerKm === '' ? null : Number(form.odometerKm),
    dateOfSale: form.dateOfSale || null,
    insuranceStart: form.insuranceStart || null,
    insuranceExpiry: form.insuranceExpiry || null,
    warrantyStart: form.warrantyStart || null,
    warrantyExpiry: form.warrantyExpiry || null,
    inAt: iso(inDate, inTime),
    expectedDeliveryAt: iso(expectedDate, expectedTime),
    actualDeliveryAt: iso(actualDate, actualTime),
    complaints: form.complaints.filter((c) => c.category || c.description),
    stage: draft ? 'DRAFT' : form.stage,
  };
}

/** Saved job card -> form state (used to continue a draft). */
export function fromJobCard(card) {
  const base = emptyJobCardForm();
  const split = (iso) => (iso ? [toDateInput(new Date(iso)), toTimeInput(new Date(iso))] : ['', '']);
  const [inDate, inTime] = split(card.inAt);
  const [expectedDate, expectedTime] = split(card.expectedDeliveryAt);
  const [actualDate, actualTime] = split(card.actualDeliveryAt);
  const form = { ...base };
  Object.keys(base).forEach((key) => {
    if (card[key] !== undefined && card[key] !== null) form[key] = card[key];
  });
  return {
    ...form,
    odometerKm: card.odometerKm ?? '',
    inDate: inDate || base.inDate,
    inTime: inTime || base.inTime,
    expectedDate: expectedDate || base.expectedDate,
    expectedTime: expectedTime || base.expectedTime,
    actualDate,
    actualTime,
    stage: card.stage === 'DRAFT' ? 'CHECKED_IN' : card.stage,
    inspection: card.inspection?.length ? card.inspection : base.inspection,
    complaints: card.complaints?.length ? card.complaints : base.complaints,
  };
}
