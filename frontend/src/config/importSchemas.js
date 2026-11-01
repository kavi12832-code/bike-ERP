// src/config/importSchemas.js
/**
 * Single source of truth for Data Exchange (Import & Export) schemas.
 * Adding a new importable module only requires adding a new configuration object here.
 */

// Regex patterns for validation
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Normalizers
export function normalizeIndianPhone(val) {
  if (val === null || val === undefined || val === '') return '';
  let str = String(val).trim();
  // Handle scientific notation e.g. 9.84501e+09 or 9.845012345e+09
  if (str.toLowerCase().includes('e')) {
    const num = Number(str);
    if (!Number.isNaN(num)) {
      str = Math.round(num).toString();
    }
  }
  // Remove floating point .0
  if (str.endsWith('.0')) {
    str = str.slice(0, -2);
  }
  // Remove all non-digits
  let digits = str.replace(/\D/g, '');
  // Strip leading 91 or +91 if length is 12
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function normalizePincode(val) {
  if (val === null || val === undefined || val === '') return '';
  let digits = String(val).replace(/\D/g, '').trim();
  if (digits.length === 5) {
    digits = '0' + digits; // Excel dropped leading zero
  }
  return digits;
}

export function normalizeNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[₹,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeCurrencyToPaise(val) {
  const num = normalizeNumber(val);
  // If the number already looks like paise (> 10,000,000 for standard amounts or integer),
  // but if user enters standard INR ₹1,50,000, convert to paise:
  return Math.round(num);
}

export function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  // Handle Excel serial date numbers e.g. 44927
  if (typeof val === 'number' || (!Number.isNaN(Number(val)) && !String(val).includes('-') && !String(val).includes('/'))) {
    const serial = Number(val);
    if (serial > 30000 && serial < 60000) {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  // Support DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Support YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return str;
}

export const IMPORT_SCHEMAS = {
  customers: {
    id: 'customers',
    label: 'Customers',
    targetStore: 'customers',
    uniqueKey: 'phone',
    requiredPermission: 'importexport.import.customers',
    defaultDuplicateStrategy: 'UPDATE',
    fields: [
      {
        key: 'name',
        label: 'Customer Name',
        required: true,
        type: 'string',
        synonyms: ['Customer Name', 'Full Name', 'Name', 'Client Name', 'Buyer Name', 'Customer'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || String(v).trim().length === 0 ? 'Customer Name is required' : null),
      },
      {
        key: 'phone',
        label: 'Mobile Number',
        required: true,
        type: 'phone',
        synonyms: ['Mobile', 'Phone', 'Mobile Number', 'Phone Number', 'Contact Number', 'Cell', 'Telephone'],
        normalise: normalizeIndianPhone,
        validate: (v) => {
          const norm = normalizeIndianPhone(v);
          if (!norm) return 'Mobile Number is required';
          if (!INDIAN_PHONE_REGEX.test(norm)) return 'Must be a valid 10-digit Indian mobile number (e.g. 9845012345)';
          return null;
        },
      },
      {
        key: 'email',
        label: 'Email Address',
        required: false,
        type: 'email',
        synonyms: ['Email', 'Email Address', 'Mail ID', 'E-Mail', 'Electronic Mail'],
        normalise: (v) => String(v || '').trim().toLowerCase(),
        validate: (v) => {
          if (!v) return null; // optional
          const norm = String(v).trim().toLowerCase();
          if (!EMAIL_REGEX.test(norm)) return 'Invalid email format (e.g. user@example.com)';
          return null;
        },
      },
      {
        key: 'city',
        label: 'City',
        required: false,
        type: 'string',
        synonyms: ['City', 'Town', 'District', 'Location'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'pincode',
        label: 'PIN Code',
        required: false,
        type: 'pincode',
        synonyms: ['PIN', 'Pincode', 'Postal Code', 'Zip Code', 'Zip'],
        normalise: normalizePincode,
        validate: (v) => {
          if (!v) return null;
          const norm = normalizePincode(v);
          if (!PINCODE_REGEX.test(norm)) return 'PIN Code must be a 6-digit Indian postal code';
          return null;
        },
      },
      {
        key: 'gstin',
        label: 'GSTIN',
        required: false,
        type: 'gstin',
        synonyms: ['GSTIN', 'GST Number', 'GST No', 'Tax ID', 'GST'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: (v) => {
          if (!v) return null;
          const norm = String(v).trim().toUpperCase();
          if (!GSTIN_REGEX.test(norm)) return 'Invalid GSTIN format (15 characters, e.g. 29AABCS8891H1Z9)';
          return null;
        },
      },
      {
        key: 'address',
        label: 'Address',
        required: false,
        type: 'string',
        synonyms: ['Address', 'Street', 'Full Address', 'Residential Address', 'Door No'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'branchId',
        label: 'Branch ID',
        required: false,
        type: 'string',
        synonyms: ['Branch', 'Branch ID', 'Location Code', 'Showroom'],
        normalise: (v) => String(v || '').trim(),
        validate: (v, row, { branches = [] } = {}) => {
          if (!v) return null;
          if (branches.length && !branches.some((b) => b.id === v || b.name?.toLowerCase() === v.toLowerCase())) {
            return `Unknown branch "${v}"`;
          }
          return null;
        },
      },
      {
        key: 'marketingConsent',
        label: 'Marketing Consent',
        required: false,
        type: 'boolean',
        synonyms: ['Consent', 'Marketing Consent', 'DPDP Consent', 'Opt In', 'Allow Marketing'],
        normalise: (v) => {
          if (typeof v === 'boolean') return v;
          const str = String(v || '').trim().toLowerCase();
          return ['true', '1', 'yes', 'y', 'consent'].includes(str);
        },
        validate: () => null,
      },
    ],
    sampleRow: {
      name: 'Arjun Das',
      phone: '9845012345',
      email: 'arjun@example.com',
      city: 'Bangalore',
      pincode: '560001',
      gstin: '29AABCS8891H1Z9',
      address: '12 Indiranagar 100ft Road',
      branchId: 'blr-main',
      marketingConsent: true,
    },
  },

  vehicles: {
    id: 'vehicles',
    label: 'Vehicles (Inventory)',
    targetStore: 'vehicleStock',
    uniqueKey: 'chassisNumber',
    requiredPermission: 'importexport.import.vehicles',
    defaultDuplicateStrategy: 'UPDATE',
    fields: [
      {
        key: 'chassisNumber',
        label: 'Chassis Number (VIN)',
        required: true,
        type: 'vin',
        synonyms: ['Chassis Number', 'VIN', 'Chassis No', 'Chassis', 'VIN Number', 'ChassisNumber'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: (v) => {
          if (!v) return 'Chassis Number is required';
          const norm = String(v).trim().toUpperCase();
          if (!VIN_REGEX.test(norm)) return 'Must be a 17-character VIN (cannot contain I, O, Q)';
          return null;
        },
      },
      {
        key: 'engineNumber',
        label: 'Engine Number',
        required: true,
        type: 'string',
        synonyms: ['Engine Number', 'Engine No', 'Motor Number', 'Engine', 'EngineNumber'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: (v) => (!v || !String(v).trim() ? 'Engine Number is required' : null),
      },
      {
        key: 'modelName',
        label: 'Model Name',
        required: true,
        type: 'string',
        synonyms: ['Model Name', 'Model', 'Vehicle Model', 'Bike Model', 'Variant', 'ModelName'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Model Name is required' : null),
      },
      {
        key: 'color',
        label: 'Color / Shade',
        required: false,
        type: 'string',
        synonyms: ['Color', 'Colour', 'Paint', 'Shade', 'Paint Scheme'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'status',
        label: 'Inventory Status',
        required: false,
        type: 'enum',
        options: ['IN_STOCK', 'ALLOCATED', 'DELIVERED', 'IN_TRANSIT'],
        synonyms: ['Status', 'Stock Status', 'Availability', 'Vehicle Status'],
        normalise: (v) => {
          const s = String(v || '').trim().toUpperCase().replace(/\s+/g, '_');
          if (['IN_STOCK', 'AVAILABLE', 'STOCK'].includes(s)) return 'IN_STOCK';
          if (['ALLOCATED', 'BOOKED'].includes(s)) return 'ALLOCATED';
          if (['DELIVERED', 'SOLD'].includes(s)) return 'DELIVERED';
          if (['IN_TRANSIT', 'TRANSIT'].includes(s)) return 'IN_TRANSIT';
          return s || 'IN_STOCK';
        },
        validate: (v) => {
          if (!v) return null;
          const s = String(v).trim().toUpperCase().replace(/\s+/g, '_');
          const validOptions = ['IN_STOCK', 'ALLOCATED', 'DELIVERED', 'IN_TRANSIT'];
          return validOptions.includes(s) ? null : `Status must be one of: ${validOptions.join(', ')}`;
        },
      },
      {
        key: 'factoryCostPaise',
        label: 'Factory Cost (Paise / INR)',
        required: false,
        type: 'number',
        synonyms: ['Factory Cost', 'Cost Price', 'FactoryCostPaise', 'Purchase Price', 'Dealer Cost', 'Cost'],
        normalise: normalizeCurrencyToPaise,
        validate: (v) => {
          if (v === null || v === undefined || v === '') return null;
          const num = normalizeNumber(v);
          return num < 0 ? 'Cost cannot be negative' : null;
        },
      },
      {
        key: 'branchId',
        label: 'Branch ID',
        required: false,
        type: 'string',
        synonyms: ['Branch', 'Branch ID', 'Showroom', 'Location Code'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
    ],
    sampleRow: {
      chassisNumber: 'ME3J350C7P1049281',
      engineNumber: 'J350E1049281',
      modelName: 'Pulsar NS200',
      color: 'Burnt Red',
      status: 'IN_STOCK',
      factoryCostPaise: 14500000,
      branchId: 'blr-main',
    },
  },

  leads: {
    id: 'leads',
    label: 'Sales Leads',
    targetStore: 'leads',
    uniqueKey: 'phone_model',
    requiredPermission: 'importexport.import.leads',
    defaultDuplicateStrategy: 'SKIP',
    fields: [
      {
        key: 'customerName',
        label: 'Customer Name',
        required: true,
        type: 'string',
        synonyms: ['Customer Name', 'Lead Name', 'Name', 'Prospect Name', 'Contact Name'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Customer Name is required' : null),
      },
      {
        key: 'phone',
        label: 'Mobile Phone',
        required: true,
        type: 'phone',
        synonyms: ['Mobile', 'Phone', 'Contact', 'Mobile Number', 'Phone Number', 'Cell'],
        normalise: normalizeIndianPhone,
        validate: (v) => {
          const norm = normalizeIndianPhone(v);
          if (!norm) return 'Mobile Phone is required';
          if (!INDIAN_PHONE_REGEX.test(norm)) return 'Must be a valid 10-digit Indian mobile number';
          return null;
        },
      },
      {
        key: 'email',
        label: 'Email Address',
        required: false,
        type: 'email',
        synonyms: ['Email', 'Email Address', 'Mail ID'],
        normalise: (v) => String(v || '').trim().toLowerCase(),
        validate: (v) => {
          if (!v) return null;
          const norm = String(v).trim().toLowerCase();
          return EMAIL_REGEX.test(norm) ? null : 'Invalid email format';
        },
      },
      {
        key: 'interestedModel',
        label: 'Interested Model',
        required: true,
        type: 'string',
        synonyms: ['Model', 'Interested Model', 'Bike Model', 'Vehicle', 'Model Name', 'Interested In'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Interested Model is required' : null),
      },
      {
        key: 'source',
        label: 'Lead Source',
        required: false,
        type: 'string',
        synonyms: ['Source', 'Lead Source', 'Channel', 'Enquiry Source', 'Lead Channel'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'status',
        label: 'Lead Status',
        required: false,
        type: 'enum',
        options: ['NEW', 'CONTACTED', 'TEST_RIDE_BOOKED', 'TEST_RIDE_DONE', 'BOOKED', 'LOST'],
        synonyms: ['Status', 'Lead Status', 'Stage', 'Enquiry Status'],
        normalise: (v) => {
          const s = String(v || '').trim().toUpperCase().replace(/\s+/g, '_');
          return s || 'NEW';
        },
        validate: () => null,
      },
      {
        key: 'branchId',
        label: 'Branch ID',
        required: false,
        type: 'string',
        synonyms: ['Branch', 'Branch ID', 'Location'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
    ],
    sampleRow: {
      customerName: 'Priya Singh',
      phone: '9845088214',
      email: 'priya.singh@example.com',
      interestedModel: 'Dominar 400',
      source: 'Walk-in Showroom',
      status: 'NEW',
      branchId: 'blr-main',
    },
  },

  parts: {
    id: 'parts',
    label: 'Spare Parts & Inventory',
    targetStore: 'partsStock',
    uniqueKey: 'partNumber',
    requiredPermission: 'importexport.import.parts',
    defaultDuplicateStrategy: 'UPDATE',
    fields: [
      {
        key: 'partNumber',
        label: 'Part Number (SKU)',
        required: true,
        type: 'string',
        synonyms: ['Part Number', 'Part No', 'SKU', 'Item Code', 'Part Code', 'PartNumber'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: (v) => (!v || !String(v).trim() ? 'Part Number is required' : null),
      },
      {
        key: 'description',
        label: 'Description',
        required: true,
        type: 'string',
        synonyms: ['Description', 'Part Name', 'Item Name', 'Name', 'Item Description'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Description is required' : null),
      },
      {
        key: 'category',
        label: 'Category',
        required: false,
        type: 'string',
        synonyms: ['Category', 'Type', 'Group', 'Part Group'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'stockQty',
        label: 'Stock Quantity',
        required: true,
        type: 'number',
        synonyms: ['Stock Qty', 'Quantity', 'Qty', 'Current Stock', 'Stock', 'OnHand'],
        normalise: (v) => Math.max(0, Math.round(normalizeNumber(v))),
        validate: (v) => {
          if (v === null || v === undefined || v === '') return 'Stock Quantity is required';
          const num = normalizeNumber(v);
          return num < 0 ? 'Stock Quantity cannot be negative' : null;
        },
      },
      {
        key: 'reorderLevel',
        label: 'Reorder Level',
        required: false,
        type: 'number',
        synonyms: ['Reorder Level', 'Min Qty', 'Reorder Point', 'Minimum Stock'],
        normalise: (v) => Math.max(0, Math.round(normalizeNumber(v))),
        validate: (v) => {
          if (v === null || v === undefined || v === '') return null;
          return normalizeNumber(v) < 0 ? 'Reorder Level cannot be negative' : null;
        },
      },
      {
        key: 'mrpPaise',
        label: 'MRP (Paise / INR)',
        required: true,
        type: 'number',
        synonyms: ['MRP', 'Price', 'Selling Price', 'MrpPaise', 'Rate', 'Retail Price'],
        normalise: normalizeCurrencyToPaise,
        validate: (v) => {
          if (v === null || v === undefined || v === '') return 'MRP is required';
          return normalizeNumber(v) < 0 ? 'MRP cannot be negative' : null;
        },
      },
      {
        key: 'binLocation',
        label: 'Bin Location',
        required: false,
        type: 'string',
        synonyms: ['Bin Location', 'Location', 'Shelf', 'Rack', 'Bin'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: () => null,
      },
    ],
    sampleRow: {
      partNumber: 'BAJ-SP-101',
      description: 'Spark Plug Champion Platinum',
      category: 'Fast Moving',
      stockQty: 45,
      reorderLevel: 15,
      mrpPaise: 24500,
      binLocation: 'A-12-04',
    },
  },

  models: {
    id: 'models',
    label: 'Vehicle Models / Price List',
    targetStore: 'bikeModels',
    uniqueKey: 'modelCode',
    requiredPermission: 'importexport.import.models',
    defaultDuplicateStrategy: 'UPDATE',
    fields: [
      {
        key: 'modelCode',
        label: 'Model Code',
        required: true,
        type: 'string',
        synonyms: ['Model Code', 'Code', 'SKU', 'Model ID', 'ModelCode'],
        normalise: (v) => String(v || '').trim().toUpperCase(),
        validate: (v) => (!v || !String(v).trim() ? 'Model Code is required' : null),
      },
      {
        key: 'name',
        label: 'Model Name',
        required: true,
        type: 'string',
        synonyms: ['Model Name', 'Name', 'Bike Name', 'Vehicle Name', 'Model'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Model Name is required' : null),
      },
      {
        key: 'category',
        label: 'Category',
        required: false,
        type: 'enum',
        options: ['Motorcycle', 'Scooter', 'EV'],
        synonyms: ['Category', 'Type', 'Segment', 'Vehicle Type'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
      {
        key: 'exShowroomPaise',
        label: 'Ex-Showroom Price (Paise / INR)',
        required: true,
        type: 'number',
        synonyms: ['Ex-Showroom Price', 'Ex-Showroom', 'Price', 'ExShowroomPaise', 'Base Price'],
        normalise: normalizeCurrencyToPaise,
        validate: (v) => {
          if (v === null || v === undefined || v === '') return 'Ex-Showroom Price is required';
          return normalizeNumber(v) <= 0 ? 'Ex-Showroom Price must be positive' : null;
        },
      },
      {
        key: 'engineCc',
        label: 'Engine CC',
        required: false,
        type: 'number',
        synonyms: ['CC', 'Engine CC', 'Displacement', 'Engine Capacity'],
        normalise: (v) => Math.round(normalizeNumber(v)),
        validate: () => null,
      },
    ],
    sampleRow: {
      modelCode: 'BAJ-PULSAR-NS200',
      name: 'Pulsar NS200',
      category: 'Motorcycle',
      exShowroomPaise: 14500000,
      engineCc: 199,
    },
  },

  staff: {
    id: 'staff',
    label: 'Staff (Admin Only)',
    targetStore: 'staffUsers',
    uniqueKey: 'email',
    requiredPermission: 'importexport.import.staff',
    defaultDuplicateStrategy: 'UPDATE',
    fields: [
      {
        key: 'name',
        label: 'Full Legal Name',
        required: true,
        type: 'string',
        synonyms: ['Name', 'Full Name', 'Staff Name', 'Employee Name', 'Legal Name'],
        normalise: (v) => String(v || '').trim(),
        validate: (v) => (!v || !String(v).trim() ? 'Full Legal Name is required' : null),
      },
      {
        key: 'email',
        label: 'Official Email',
        required: true,
        type: 'email',
        synonyms: ['Email', 'Official Email', 'Work Email', 'Mail ID'],
        normalise: (v) => String(v || '').trim().toLowerCase(),
        validate: (v) => {
          if (!v) return 'Official Email is required';
          const norm = String(v).trim().toLowerCase();
          return EMAIL_REGEX.test(norm) ? null : 'Invalid email format';
        },
      },
      {
        key: 'phone',
        label: 'Mobile Phone',
        required: true,
        type: 'phone',
        synonyms: ['Mobile', 'Phone', 'Contact Number', 'Mobile Phone', 'Cell'],
        normalise: normalizeIndianPhone,
        validate: (v) => {
          const norm = normalizeIndianPhone(v);
          if (!norm) return 'Mobile Phone is required';
          return INDIAN_PHONE_REGEX.test(norm) ? null : 'Must be a 10-digit Indian phone number';
        },
      },
      {
        key: 'role',
        label: 'Role Persona',
        required: true,
        type: 'enum',
        options: [
          'SUPER_ADMIN',
          'SALES_MANAGER',
          'SALES_EXECUTIVE',
          'SERVICE_MANAGER',
          'SERVICE_ADVISOR',
          'TECHNICIAN',
          'ACCOUNTANT',
          'INVENTORY_MANAGER',
        ],
        synonyms: ['Role', 'Role Persona', 'Designation', 'Position', 'Access Level'],
        normalise: (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, '_'),
        validate: (v) => {
          if (!v) return 'Role Persona is required';
          const norm = String(v).trim().toUpperCase().replace(/\s+/g, '_');
          const validRoles = [
            'SUPER_ADMIN',
            'SALES_MANAGER',
            'SALES_EXECUTIVE',
            'SERVICE_MANAGER',
            'SERVICE_ADVISOR',
            'TECHNICIAN',
            'ACCOUNTANT',
            'INVENTORY_MANAGER',
          ];
          return validRoles.includes(norm) ? null : `Role must be one of: ${validRoles.join(', ')}`;
        },
      },
      {
        key: 'branchId',
        label: 'Assigned Branch',
        required: false,
        type: 'string',
        synonyms: ['Branch', 'Branch ID', 'Location', 'Showroom'],
        normalise: (v) => String(v || '').trim(),
        validate: () => null,
      },
    ],
    sampleRow: {
      name: 'Anand Kumar',
      email: 'anand.kumar@akashbajaj.com',
      phone: '9845022002',
      role: 'SALES_EXECUTIVE',
      branchId: 'blr-main',
    },
  },
};

export const MODULE_OPTIONS = Object.values(IMPORT_SCHEMAS).map((s) => ({
  id: s.id,
  label: s.label,
  uniqueKey: s.uniqueKey,
}));

