export const DEALERSHIP_INFO = {
  name: 'AKASH BAJAJ',
  tagline: 'Authorized Two-Wheeler Sales, Service & Spares',
  headOffice: '142, Hosur Main Road, Koramangala, Bangalore - 560095',
  phone: '+91 80 4965 2000',
  email: 'contact@akashbajaj.com',
  website: 'https://akashbajaj.com',
  gstin: '29AABCB1829M1ZK',
  state: 'Karnataka',
  stateCode: '29',
  cin: 'U50100KA2018PTC112345',
  pan: 'AABCB1829M',
};

export const BRANCHES = [
  {
    id: 'br-blr-central',
    code: 'BLR-CENTRAL',
    name: 'Bangalore Central Flagship',
    type: 'Sales & Primary Service Hub',
    address: '142, Hosur Main Road, Koramangala, Bangalore - 560095',
    phone: '+91 80 4965 2001',
    gstin: '29AABCB1829M1ZK',
    stateCode: '29',
    bays: 12,
    isHeadquarters: true,
  },
  {
    id: 'br-indiranagar',
    code: 'BLR-INDIRA',
    name: 'Indiranagar Workshop Annex',
    type: 'Dedicated Express Service Center',
    address: '88, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore - 560038',
    phone: '+91 80 4965 2002',
    gstin: '29AABCB1829M1ZK',
    stateCode: '29',
    bays: 8,
    isHeadquarters: false,
  },
  {
    id: 'br-ecity',
    code: 'BLR-ECITY',
    name: 'Electronic City Experience Hub',
    type: 'Boutique Showroom & EV Center',
    address: 'Plot 24, Phase 1, Electronic City, Bangalore - 560100',
    phone: '+91 80 4965 2003',
    gstin: '29AABCB1829M1ZK',
    stateCode: '29',
    bays: 6,
    isHeadquarters: false,
  },
];

export const TAX_CONSTANTS = {
  HOME_STATE_CODE: '29',
  VEHICLE_HSN: '8711',
  LABOUR_SAC: '9987',
  CASH_TRANSACTION_LIMIT_PAISE: 20000000, // ₹2,00,000 (Sec 269ST - CONFIRM WITH CA)
  TCS_THRESHOLD_PAISE: 100000000, // ₹10,00,000 (Sec 206C(1F) - CONFIRM WITH CA)
  TCS_RATE_PERCENT: 1.0, // 1% TCS above threshold
};

export const FINANCIAL_YEAR = {
  code: '2627',
  label: 'FY 2026-27',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};
