// src/tests/dataExchange.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeIndianPhone,
  normalizePincode,
  normalizeNumber,
  normalizeDate,
  INDIAN_PHONE_REGEX,
  GSTIN_REGEX,
  VIN_REGEX,
  PINCODE_REGEX,
  IMPORT_SCHEMAS,
} from '../config/importSchemas';
import { matchHeaderToField, autoMapHeaders } from '../features/admin/utils/dataMapper';
import { validateRow, validateDataChunked } from '../features/admin/utils/dataValidator';

describe('Data Exchange - Normalizers & RegEx', () => {
  it('normalizes various Indian phone number formats to 10 digits', () => {
    expect(normalizeIndianPhone('+91 98450 12345')).toBe('9845012345');
    expect(normalizeIndianPhone('919845012345')).toBe('9845012345');
    expect(normalizeIndianPhone('09845012345')).toBe('9845012345');
    expect(normalizeIndianPhone('98450-12345')).toBe('9845012345');
    expect(normalizeIndianPhone('9845012345.0')).toBe('9845012345');
    expect(normalizeIndianPhone('9.845012345e+09')).toBe('9845012345');
    expect(INDIAN_PHONE_REGEX.test(normalizeIndianPhone('9845012345'))).toBe(true);
    expect(INDIAN_PHONE_REGEX.test(normalizeIndianPhone('12345'))).toBe(false);
  });

  it('validates 15-character GSTIN format correctly', () => {
    expect(GSTIN_REGEX.test('29AABCS8891H1Z9')).toBe(true);
    expect(GSTIN_REGEX.test('INVALID_GSTIN')).toBe(false);
    expect(GSTIN_REGEX.test('29AABCS8891H1Z')).toBe(false); // only 14 chars
  });

  it('validates 17-character VIN without I, O, Q', () => {
    expect(VIN_REGEX.test('ME3J350C7P1049281')).toBe(true);
    expect(VIN_REGEX.test('ME3J350C7I1049281')).toBe(false); // contains 'I'
    expect(VIN_REGEX.test('SHORT_VIN')).toBe(false);
  });

  it('normalizes postal PIN codes and preserves leading zeros', () => {
    expect(normalizePincode('560001')).toBe('560001');
    expect(normalizePincode(' 560001 ')).toBe('560001');
    expect(normalizePincode('60001')).toBe('060001'); // 5-digit padded
    expect(PINCODE_REGEX.test('560001')).toBe(true);
  });

  it('cleanses currency amounts with rupee symbols and commas', () => {
    expect(normalizeNumber('₹1,45,000')).toBe(145000);
    expect(normalizeNumber('145000')).toBe(145000);
    expect(normalizeNumber(25000)).toBe(25000);
  });

  it('parses varied date formats to ISO date string', () => {
    expect(normalizeDate('30/10/2026')).toBe('2026-10-30');
    expect(normalizeDate('30-10-2026')).toBe('2026-10-30');
    expect(normalizeDate('2026-10-30')).toBe('2026-10-30');
  });
});

describe('Data Exchange - Auto Mapper Engine', () => {
  const customerFields = IMPORT_SCHEMAS.customers.fields;

  it('matches exact header names with HIGH confidence', () => {
    const match = matchHeaderToField('Customer Name', customerFields);
    expect(match.targetKey).toBe('name');
    expect(match.confidence).toBe('HIGH');
  });

  it('matches synonym variations with HIGH confidence', () => {
    const phoneMatch = matchHeaderToField('Contact Number', customerFields);
    expect(phoneMatch.targetKey).toBe('phone');
    expect(phoneMatch.confidence).toBe('HIGH');

    const emailMatch = matchHeaderToField('Mail ID', customerFields);
    expect(emailMatch.targetKey).toBe('email');
    expect(emailMatch.confidence).toBe('HIGH');
  });

  it('auto-maps an entire table of headers', () => {
    const headers = ['Client Name', 'Mobile Number', 'Mail ID', 'City', 'Unknown Col'];
    const mapping = autoMapHeaders(headers, customerFields);

    expect(mapping['Client Name'].targetKey).toBe('name');
    expect(mapping['Mobile Number'].targetKey).toBe('phone');
    expect(mapping['Mail ID'].targetKey).toBe('email');
    expect(mapping['City'].targetKey).toBe('city');
    expect(mapping['Unknown Col'].targetKey).toBe('__IGNORE__');
  });
});

describe('Data Exchange - Chunked Validation Engine', () => {
  const schema = IMPORT_SCHEMAS.customers;

  it('flags valid rows as valid', () => {
    const validRow = {
      name: 'Arjun Das',
      phone: '9845012345',
      email: 'arjun@example.com',
      city: 'Bangalore',
      gstin: '29AABCS8891H1Z9',
    };

    const res = validateRow(validRow, 1, schema, { existingRecords: [] });
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('flags required field errors for missing Customer Name and invalid Phone', () => {
    const invalidRow = {
      name: '',
      phone: '12345',
      email: 'arjun@example.com',
    };

    const res = validateRow(invalidRow, 2, schema, { existingRecords: [] });
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.field === 'Customer Name' && e.severity === 'ERROR')).toBe(true);
    expect(res.errors.some((e) => e.field === 'Mobile Number' && e.severity === 'ERROR')).toBe(true);
  });

  it('validates rows in chunked fashion without blocking', async () => {
    const rows = [
      { name: 'User 1', phone: '9845011111' },
      { name: 'User 2', phone: '9845022222' },
      { name: '', phone: 'invalid' }, // bad row
    ];

    const results = await validateDataChunked(rows, schema, { existingRecords: [] });
    expect(results.totalRows).toBe(3);
    expect(results.validCount).toBe(2);
    expect(results.errorCount).toBe(1);
    expect(results.validPercent).toBe(67);
  });
});

