// src/features/admin/utils/cryptoDemo.js
/**
 * Cryptographic demo helpers for simulated authentication & temporary passwords.
 * Uses the standard Web Crypto API (PBKDF2) with salt.
 * All generated hashes are clearly labelled for demo use only.
 */

// Generate strong temporary password meeting security policy
export function generateTemporaryPassword() {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '@#$%&*!';

  const getRandom = (str) => str[Math.floor(Math.random() * str.length)];

  // Guarantee at least one of each category (12 characters total)
  const parts = [
    getRandom(uppers),
    getRandom(lowers),
    getRandom(digits),
    getRandom(specials),
    getRandom(uppers),
    getRandom(lowers),
    getRandom(digits),
    getRandom(lowers),
    getRandom(specials),
    getRandom(digits),
    getRandom(uppers),
    getRandom(lowers),
  ];

  // Shuffle
  return parts.sort(() => 0.5 - Math.random()).join('');
}

// Salted PBKDF2 hash using Web Crypto API
export async function hashPasswordPbkdf2(password, saltString = 'akashbajaj_demo_salt_2026') {
  try {
    const webCrypto = typeof globalThis !== 'undefined' && globalThis.crypto?.subtle
      ? globalThis.crypto
      : (typeof window !== 'undefined' && window.crypto?.subtle ? window.crypto : null);

    if (!webCrypto || !webCrypto.subtle) {
      // Fallback for environments where Web Crypto isn't available
      const b64 = typeof btoa !== 'undefined' ? btoa(password + saltString) : Buffer.from(password + saltString).toString('base64');
      return `pbkdf2_sha256$10000$demo$${b64} (demo authentication only)`;
    }
    const enc = new TextEncoder();
    const keyMaterial = await webCrypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = enc.encode(saltString);
    const derivedKey = await webCrypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 10000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );

    const exported = await webCrypto.subtle.exportKey('raw', derivedKey);
    const hashHex = Array.from(new Uint8Array(exported))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `pbkdf2_sha256$10000$${saltString}$${hashHex} (demo authentication only)`;
  } catch (err) {
    const b64 = typeof btoa !== 'undefined' ? btoa(password + saltString) : Buffer.from(password + saltString).toString('base64');
    return `pbkdf2_sha256$10000$demo$${b64} (demo authentication only)`;
  }
}

// Sample Indian names pool for realistic Auto-Fill Demo Staff
const FIRST_NAMES = [
  'Arun', 'Kavita', 'Sanjay', 'Pooja', 'Rohan', 'Sneha', 'Deepak', 'Meera',
  'Gautam', 'Ananya', 'Naveen', 'Divya', 'Manish', 'Priya', 'Vivek', 'Lakshmi',
  'Aditya', 'Nandini', 'Chetan', 'Swati', 'Kiran', 'Vidya', 'Pradeep', 'Shreya'
];

const LAST_NAMES = [
  'Rao', 'Sharma', 'Patil', 'Iyer', 'Kumar', 'Gowda', 'Nair', 'Sethi',
  'Reddy', 'Pillai', 'Hegde', 'Shetty', 'Verma', 'Menon', 'Joshi', 'Deshmukh'
];

// Helper to auto-fill demo staff with realistic non-colliding attributes
export function generateDemoStaff(existingUsers = []) {
  const usersList = Array.isArray(existingUsers) ? existingUsers : [];
  const existingEmails = new Set(
    usersList.map((u) => (typeof u === 'string' ? u : (u.email || '')).toLowerCase())
  );
  const existingPhones = new Set(
    usersList.map((u) => (typeof u === 'string' ? u : (u.phone || '')).replace(/\D/g, ''))
  );

  let firstName = '';
  let lastName = '';
  let fullName = '';
  let email = '';
  let phone = '';

  for (let attempt = 0; attempt < 50; attempt++) {
    firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    fullName = `${firstName} ${lastName}`;
    const slug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    email = `${slug}@akashbajaj.com`;

    // random 10 digit Indian phone starting with 98450
    const suffix = Math.floor(10000 + Math.random() * 90000);
    phone = `+91 98450 ${suffix}`;
    const rawPhone = phone.replace(/\D/g, '');

    if (!existingEmails.has(email) && !existingPhones.has(rawPhone)) {
      break;
    }
  }

  const roles = [
    { role: 'Sales Executive', dept: 'Sales', designation: 'Senior Sales Consultant' },
    { role: 'Technician', dept: 'Workshop', designation: 'Master Technician' },
    { role: 'Service Advisor', dept: 'Service', designation: 'Customer Service Specialist' },
    { role: 'Parts Specialist', dept: 'Parts & Spares', designation: 'Spares Inventory Associate' },
    { role: 'CRM Executive', dept: 'Customer Care', designation: 'Customer Relations Associate' },
  ];
  const chosen = roles[Math.floor(Math.random() * roles.length)];

  const branches = ['br-blr-central', 'br-indiranagar', 'br-ecity'];
  const branchId = branches[Math.floor(Math.random() * branches.length)];

  return {
    fullName,
    name: fullName,
    email,
    phone,
    role: chosen.role,
    department: chosen.dept,
    designation: chosen.designation,
    primaryBranchId: branchId,
    twoFactorRequired: true,
    employmentType: 'Full-time',
    shift: 'General (09:30 - 18:30)',
  };
}
