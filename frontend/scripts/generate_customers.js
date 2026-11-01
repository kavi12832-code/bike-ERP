import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cities = [
  { city: 'Bangalore', stateCode: '29', pincode: '560038' },
  { city: 'Bangalore', stateCode: '29', pincode: '560066' },
  { city: 'Mysore', stateCode: '29', pincode: '570001' },
  { city: 'Mangalore', stateCode: '29', pincode: '575001' },
  { city: 'Hubli', stateCode: '29', pincode: '580020' },
  { city: 'Belgaum', stateCode: '29', pincode: '590001' },
  { city: 'Shimoga', stateCode: '29', pincode: '577201' },
  { city: 'Tumkur', stateCode: '29', pincode: '572101' },
  { city: 'Davanagere', stateCode: '29', pincode: '577002' },
  { city: 'Bellary', stateCode: '29', pincode: '583101' },
  { city: 'Udupi', stateCode: '29', pincode: '576101' },
  { city: 'Hassan', stateCode: '29', pincode: '573201' },
  { city: 'Mandya', stateCode: '29', pincode: '571401' },
  { city: 'Bijapur', stateCode: '29', pincode: '586101' },
  { city: 'Gulbarga', stateCode: '29', pincode: '585102' }
];

const models = [
  'Bajaj Pulsar NS200', 'Bajaj Pulsar N250', 'Bajaj Pulsar 150 Twin Disc', 
  'Bajaj Chetak Premium 2024', 'Bajaj Dominar 400 Touring Edition', 'Bajaj Dominar 250',
  'Bajaj Platina 110 ABS', 'Bajaj CT 110X', 'Bajaj Avenger Cruise 220', 'Bajaj Pulsar RS200'
];

const existing = [
  {
    id: 'cust-rohan-mehta',
    name: 'Rohan Mehta',
    phone: '+91 98450 12345',
    email: 'rohan.mehta@gmail.com',
    address: '42, 4th Cross, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560038',
    gstin: null,
    loyaltyTier: 'Platinum',
    loyaltyPoints: 3450,
    ltvPaise: 48500000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: false, updatedAtDays: -30 },
    documents: [
      { id: 'doc-1', type: 'DRIVING_LICENCE', name: 'DL_Rohan_KA03.pdf', verified: true },
      { id: 'doc-2', type: 'PAN_CARD', name: 'PAN_Rohan_M.pdf', verified: true }
    ],
    vehicles: [{
      registrationNumber: 'KA-03-JM-4921',
      modelName: 'Royal Enfield Hunter 350',
      chassisNumber: 'ME3U3S5C8PRA01294',
      engineNumber: 'U3S5C801294',
      purchaseDays: -210,
      lastServiceDays: -45,
      odometerKm: 5840,
      avgDailyKm: 28
    }]
  },
  {
    id: 'cust-priya-singh',
    name: 'Priya Singh',
    phone: '+91 98451 22345',
    email: 'priya.singh@outlook.com',
    address: '15, Gokulam 3rd Stage',
    city: 'Mysore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '570002',
    gstin: null,
    loyaltyTier: 'Gold',
    loyaltyPoints: 1200,
    ltvPaise: 11700000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -60 },
    documents: [{ id: 'doc-3', type: 'DRIVING_LICENCE', name: 'DL_Priya_KA.pdf', verified: true }],
    vehicles: [{
      registrationNumber: 'KA-09-EV-8840',
      modelName: 'Bajaj Chetak Premium 2024',
      chassisNumber: 'MD625CK31P1A89201',
      engineNumber: 'CK31P1089201',
      purchaseDays: -120,
      lastServiceDays: -20,
      odometerKm: 2950,
      avgDailyKm: 24
    }]
  },
  {
    id: 'cust-arjun-das',
    name: 'Arjun Das',
    phone: '+91 97412 88901',
    email: 'arjun.das@techcorp.in',
    address: '108, Palm Meadows, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560066',
    gstin: '29AAGCD1234F1Z8',
    loyaltyTier: 'Gold',
    loyaltyPoints: 1850,
    ltvPaise: 29500000,
    csatScore: 4,
    churnRisk: 'MEDIUM',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -90 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-53-MJ-1049',
      modelName: 'Bajaj Dominar 400 Touring Edition',
      chassisNumber: 'ME3U3S5D7PRA09481',
      engineNumber: 'U3S5D709481',
      purchaseDays: -320,
      lastServiceDays: -110,
      odometerKm: 9400,
      avgDailyKm: 31
    }]
  },
  {
    id: 'cust-neha-verma',
    name: 'Neha Verma',
    phone: '+91 99801 44552',
    email: 'neha.verma@fintech.co',
    address: '512, Koramangala 3rd Block',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560034',
    gstin: null,
    loyaltyTier: 'Silver',
    loyaltyPoints: 450,
    ltvPaise: 8900000,
    csatScore: 4,
    churnRisk: 'HIGH',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: false, updatedAtDays: -15 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-01-EL-7123',
      modelName: 'Bajaj Pulsar 150 Twin Disc',
      chassisNumber: 'ME4JF504BP8029145',
      engineNumber: 'JF50E8029145',
      purchaseDays: -400,
      lastServiceDays: -180,
      odometerKm: 14200,
      avgDailyKm: 22
    }]
  },
  {
    id: 'cust-sandeep-yadav',
    name: 'Sandeep Yadav',
    phone: '+91 96112 33445',
    email: 'sandeep.yadav@gmail.com',
    address: '22, BTM 2nd Stage',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560076',
    gstin: null,
    loyaltyTier: 'Silver',
    loyaltyPoints: 780,
    ltvPaise: 16500000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -45 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-05-NB-5520',
      modelName: 'Bajaj Pulsar NS200',
      chassisNumber: 'MD2A36AY9PCD01824',
      engineNumber: 'JL36AY01824',
      purchaseDays: -150,
      lastServiceDays: -30,
      odometerKm: 4200,
      avgDailyKm: 35
    }]
  },
  {
    id: 'cust-rohit-chandran',
    name: 'Rohit Chandran',
    phone: '+91 98800 77123',
    email: 'rohit.chandran@gmail.com',
    address: '14/B, HSR Layout Sector 1',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560102',
    gstin: null,
    loyaltyTier: 'Platinum',
    loyaltyPoints: 4200,
    ltvPaise: 38900000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -10 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-51-EX-0099',
      modelName: 'Bajaj Dominar 400 Touring Edition',
      chassisNumber: 'ME3U4S5C8PRA99102',
      engineNumber: 'U4S5C899102',
      purchaseDays: -75,
      lastServiceDays: -15,
      odometerKm: 3800,
      avgDailyKm: 50
    }]
  },
  {
    id: 'cust-sunil-hegde',
    name: 'Sunil Hegde',
    phone: '+91 94480 66551',
    email: 'sunil.hegde@rediffmail.com',
    address: '45, Kadri Temple Road',
    city: 'Mangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '575002',
    gstin: null,
    loyaltyTier: 'Gold',
    loyaltyPoints: 1600,
    ltvPaise: 13500000,
    csatScore: 4,
    churnRisk: 'MEDIUM',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: false, updatedAtDays: -80 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-19-MH-2211',
      modelName: 'Bajaj Platina 110 ABS',
      chassisNumber: 'ME4JC914BP9012398',
      engineNumber: 'JC91E9012398',
      purchaseDays: -240,
      lastServiceDays: -65,
      odometerKm: 7600,
      avgDailyKm: 32
    }]
  },
  {
    id: 'cust-arvind-v',
    name: 'Arvind V.',
    phone: '+91 97311 22890',
    email: 'arvind.v@tcs.com',
    address: '90, Bellandur Outer Ring Road',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560103',
    gstin: null,
    loyaltyTier: 'Silver',
    loyaltyPoints: 900,
    ltvPaise: 18000000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -25 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-53-NQ-3344',
      modelName: 'Bajaj Chetak Premium 2024',
      chassisNumber: 'MD9ATH450XP204918',
      engineNumber: 'ATH450XP204918',
      purchaseDays: -90,
      lastServiceDays: -25,
      odometerKm: 2100,
      avgDailyKm: 23
    }]
  },
  {
    id: 'cust-kavita-nair',
    name: 'Kavita Nair',
    phone: '+91 98860 11992',
    email: 'kavita.nair@biocon.com',
    address: '601, Shriram Spandana, Challaghatta',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560037',
    gstin: null,
    loyaltyTier: 'Gold',
    loyaltyPoints: 2100,
    ltvPaise: 15400000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -40 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-03-NA-9011',
      modelName: 'Bajaj Pulsar N250',
      chassisNumber: 'MD625EK44P2A10948',
      engineNumber: 'EK44P210948',
      purchaseDays: -190,
      lastServiceDays: -50,
      odometerKm: 5900,
      avgDailyKm: 30
    }]
  },
  {
    id: 'cust-gautam-singhal',
    name: 'Gautam Singhal',
    phone: '+91 99000 88771',
    email: 'gautam.singhal@gmail.com',
    address: '12, Vidyanagar Main Road',
    city: 'Hubli',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '580021',
    gstin: null,
    loyaltyTier: 'Platinum',
    loyaltyPoints: 5100,
    ltvPaise: 35000000,
    csatScore: 5,
    churnRisk: 'LOW',
    consent: { marketingWhatsapp: true, serviceReminders: true, promotionalSms: true, updatedAtDays: -5 },
    documents: [],
    vehicles: [{
      registrationNumber: 'KA-25-DU-3900',
      modelName: 'Bajaj Pulsar RS200',
      chassisNumber: 'MD2A42CY9PCD90124',
      engineNumber: '42CY90124',
      purchaseDays: -110,
      lastServiceDays: -22,
      odometerKm: 3400,
      avgDailyKm: 31
    }]
  }
];

const additionalNames = [
  'Ananya Sharma', 'Karthik Reddy', 'Rajeshwari Patel', 'Suresh Bhat', 'Divya Krishnan',
  'Manoj Gowda', 'Swati Kulkarni', 'Vikram Shenoy', 'Deepa Deshmukh', 'Harish Shetty',
  'Lakshmi Narayanan', 'Prakash Pai', 'Meera Kamath', 'Raghavendra Rao', 'Poornima Joshi',
  'Chetan Nayak', 'Shruti Hegde', 'Girish Prabhu', 'Tanvi Acharya', 'Nitin Bhandary',
  'Radhika Nadkarni', 'Vinay Murthy', 'Rekha Shenoy', 'Sanjay Alva', 'Pavithra Somayaji',
  'Ashok Kumble', 'Bhavana Ballal', 'Mahesh Holla', 'Geetha Shastry', 'Pradeep Karanth',
  'Shailaja Adiga', 'Naveen Upadhyaya', 'Madhuri Kedilaya', 'Vijayendra Achar', 'Preeti Marathe',
  'Venkatesh Prasad', 'Archana Srinivas', 'Shivaraj Patil', 'Vidyashree Angadi', 'Anand Hukkeri',
  'Shobha Meti', 'Siddalingesh Hiremath', 'Rashmi Bellad', 'Gururaj Jagirdar', 'Soumya Belagavi',
  'Mallikarjun Koliwad', 'Anupama Koujalgi', 'Basavaraj Bommai', 'Manjula Horatti', 'Ramesh Jarkiholi'
];

const rtoCodes = ['01', '02', '03', '04', '05', '09', '14', '19', '20', '22', '25', '28', '32', '34', '51', '53'];
const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const risks = ['LOW', 'LOW', 'LOW', 'MEDIUM', 'HIGH'];

const customers = [...existing];

additionalNames.forEach((name, idx) => {
  const i = idx + 11;
  const cityObj = cities[idx % cities.length];
  const rto = rtoCodes[idx % rtoCodes.length];
  const series = String.fromCharCode(65 + (idx % 26)) + String.fromCharCode(65 + ((idx * 3) % 26));
  const num = 1000 + ((idx * 137) % 8999);
  const regNo = `KA-${rto}-${series}-${num}`;
  const phone = `+91 9${String(8000 + (idx * 23)).padStart(4, '0')} ${String(10000 + (idx * 1437)).slice(0, 5)}`;
  const email = name.toLowerCase().replace(/[^a-z]/g, '.') + '@example.com';
  const model = models[idx % models.length];
  const ltv = 8000000 + (idx * 550000);
  const tier = tiers[idx % tiers.length];
  const risk = risks[idx % risks.length];

  customers.push({
    id: 'cust-' + name.toLowerCase().replace(/[^a-z]/g, '-'),
    name,
    phone,
    email,
    address: `${idx + 10}, MG Road Cross, ${cityObj.city}`,
    city: cityObj.city,
    state: 'Karnataka',
    stateCode: '29',
    pincode: cityObj.pincode,
    gstin: idx % 5 === 0 ? `29AAAAA0000A1Z${idx % 9}` : null,
    loyaltyTier: tier,
    loyaltyPoints: 300 + (idx * 75),
    ltvPaise: ltv,
    csatScore: 4 + (idx % 2),
    churnRisk: risk,
    consent: {
      marketingWhatsapp: true,
      serviceReminders: true,
      promotionalSms: idx % 2 === 0,
      updatedAtDays: -(idx * 3) - 5
    },
    documents: [
      { id: `doc-${i}`, type: 'DRIVING_LICENCE', name: `DL_${name.replace(/\s+/g, '_')}.pdf`, verified: true }
    ],
    vehicles: [{
      registrationNumber: regNo,
      modelName: model,
      chassisNumber: `MD2A${String(100000000000 + idx * 98765).slice(0, 13)}`,
      engineNumber: `ENG${String(10000000 + idx * 8765).slice(0, 8)}`,
      purchaseDays: -(idx * 7) - 60,
      lastServiceDays: -(idx * 2) - 15,
      odometerKm: 1500 + (idx * 280),
      avgDailyKm: 20 + (idx % 25)
    }]
  });
});

let output = `import { relativeDateIso } from '../../lib/dates';\n\nexport const SEEDED_CUSTOMERS = [\n`;

customers.forEach(c => {
  output += `  {\n`;
  output += `    id: ${JSON.stringify(c.id)},\n`;
  output += `    name: ${JSON.stringify(c.name)},\n`;
  output += `    phone: ${JSON.stringify(c.phone)},\n`;
  output += `    email: ${JSON.stringify(c.email)},\n`;
  output += `    address: ${JSON.stringify(c.address)},\n`;
  output += `    city: ${JSON.stringify(c.city)},\n`;
  output += `    state: ${JSON.stringify(c.state)},\n`;
  output += `    stateCode: ${JSON.stringify(c.stateCode)},\n`;
  output += `    pincode: ${JSON.stringify(c.pincode)},\n`;
  output += `    gstin: ${JSON.stringify(c.gstin)},\n`;
  output += `    loyaltyTier: ${JSON.stringify(c.loyaltyTier)},\n`;
  output += `    loyaltyPoints: ${c.loyaltyPoints},\n`;
  output += `    ltvPaise: ${c.ltvPaise},\n`;
  output += `    csatScore: ${c.csatScore},\n`;
  output += `    churnRisk: ${JSON.stringify(c.churnRisk)},\n`;
  output += `    consent: {\n`;
  output += `      marketingWhatsapp: ${c.consent.marketingWhatsapp},\n`;
  output += `      serviceReminders: ${c.consent.serviceReminders},\n`;
  output += `      promotionalSms: ${c.consent.promotionalSms},\n`;
  output += `      updatedAt: relativeDateIso(${c.consent.updatedAtDays}),\n`;
  output += `    },\n`;
  output += `    documents: ${JSON.stringify(c.documents)},\n`;
  output += `    vehicles: [\n`;
  c.vehicles.forEach(v => {
    output += `      {\n`;
    output += `        registrationNumber: ${JSON.stringify(v.registrationNumber)},\n`;
    output += `        modelName: ${JSON.stringify(v.modelName)},\n`;
    output += `        chassisNumber: ${JSON.stringify(v.chassisNumber)},\n`;
    output += `        engineNumber: ${JSON.stringify(v.engineNumber)},\n`;
    output += `        purchaseDate: relativeDateIso(${v.purchaseDays}),\n`;
    output += `        lastServiceDate: relativeDateIso(${v.lastServiceDays}),\n`;
    output += `        odometerKm: ${v.odometerKm},\n`;
    output += `        avgDailyKm: ${v.avgDailyKm},\n`;
    output += `      },\n`;
  });
  output += `    ],\n`;
  output += `  },\n`;
});

output += `];\n`;

const targetPath = path.resolve(__dirname, '../src/data/factories/people.js');
fs.writeFileSync(targetPath, output, 'utf8');
console.log(`Successfully wrote ${customers.length} reconciled customers to ${targetPath}`);
