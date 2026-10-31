// src/features/admin/utils/dataValidator.js
/**
 * High-performance chunked data validation engine for Data Exchange.
 * Processes 5,000 rows per tick without freezing the UI thread.
 */

import {
  INDIAN_PHONE_REGEX,
  GSTIN_REGEX,
  VIN_REGEX,
  PINCODE_REGEX,
  EMAIL_REGEX,
  normalizeIndianPhone,
  normalizeNumber,
  normalizePincode,
} from '../../../config/importSchemas';

// Valid Indian GST 2-digit state codes (01 to 38, 97, 99)
const VALID_GST_STATE_CODES = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '97', '99'
]);

/**
 * Validates a single mapped row against schema rules & context
 * Returns { errors: Array<{ field, message, severity, value }>, valid: boolean, hasWarnings: boolean }
 */
export function validateRow(row, rowIndex, schema, context = {}) {
  const { existingRecords = [], seenFileKeys = new Set(), branches = [], duplicateStrategy = 'UPDATE' } = context;
  const rowErrors = [];

  // 1. Validate Schema Fields
  for (const field of schema.fields) {
    const val = row[field.key];
    const rawVal = val === undefined || val === null ? '' : String(val).trim();

    // Required check
    if (field.required && !rawVal) {
      rowErrors.push({
        rowNumber: rowIndex,
        field: field.label,
        key: field.key,
        value: '(Empty)',
        message: `${field.label} is required`,
        severity: 'ERROR',
      });
      continue;
    }

    if (!rawVal) {
      // Optional field is empty, skip further format checks
      continue;
    }

    // Type-specific validations
    if (field.type === 'phone') {
      const normPhone = normalizeIndianPhone(rawVal);
      if (!INDIAN_PHONE_REGEX.test(normPhone)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'Must be a 10-digit Indian phone number (starting with 6-9)',
          severity: 'ERROR',
        });
      }
    } else if (field.type === 'gstin') {
      const upperGstin = rawVal.toUpperCase();
      if (!GSTIN_REGEX.test(upperGstin)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'Invalid GSTIN format (15 characters alphanumeric)',
          severity: 'ERROR',
        });
      } else {
        const stateCode = upperGstin.slice(0, 2);
        if (!VALID_GST_STATE_CODES.has(stateCode)) {
          rowErrors.push({
            rowNumber: rowIndex,
            field: field.label,
            key: field.key,
            value: rawVal,
            message: `Invalid GST state code "${stateCode}"`,
            severity: 'WARNING',
          });
        }
      }
    } else if (field.type === 'vin') {
      const upperVin = rawVal.toUpperCase();
      if (!VIN_REGEX.test(upperVin)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'VIN must be 17 characters alphanumeric (excluding I, O, Q)',
          severity: 'ERROR',
        });
      }
    } else if (field.type === 'pincode') {
      const normPin = normalizePincode(rawVal);
      if (!PINCODE_REGEX.test(normPin)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'PIN Code must be a 6-digit postal code',
          severity: 'WARNING',
        });
      }
    } else if (field.type === 'email') {
      if (!EMAIL_REGEX.test(rawVal.toLowerCase())) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'Invalid email address format',
          severity: field.required ? 'ERROR' : 'WARNING',
        });
      }
    } else if (field.type === 'number') {
      const num = normalizeNumber(rawVal);
      if (Number.isNaN(num)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'Must be a valid numeric value',
          severity: 'ERROR',
        });
      } else if (num < 0) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: 'Amount or quantity cannot be negative',
          severity: 'ERROR',
        });
      }
    } else if (field.type === 'enum' && field.options) {
      const normVal = rawVal.toUpperCase().replace(/\s+/g, '_');
      if (!field.options.includes(normVal)) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: `Value must be one of: ${field.options.join(', ')}`,
          severity: 'ERROR',
        });
      }
    }

    // Branch cross-reference check
    if (field.key === 'branchId' && branches.length > 0 && rawVal) {
      const branchFound = branches.some(
        (b) => b.id === rawVal || b.name?.toLowerCase() === rawVal.toLowerCase()
      );
      if (!branchFound) {
        rowErrors.push({
          rowNumber: rowIndex,
          field: field.label,
          key: field.key,
          value: rawVal,
          message: `Branch code or name "${rawVal}" not recognized in branch master`,
          severity: 'WARNING',
        });
      }
    }
  }

  // 2. Unique Key & Duplicate Checks
  let uniqueKeyValue = '';
  if (schema.uniqueKey === 'phone') {
    uniqueKeyValue = normalizeIndianPhone(row.phone);
  } else if (schema.uniqueKey === 'phone_model') {
    uniqueKeyValue = `${normalizeIndianPhone(row.phone)}_${String(row.interestedModel || '').trim().toLowerCase()}`;
  } else if (schema.uniqueKey) {
    uniqueKeyValue = String(row[schema.uniqueKey] || '').trim().toUpperCase();
  }

  let isStoreDuplicate = false;
  if (uniqueKeyValue) {
    // Check inside file duplicates
    if (seenFileKeys.has(uniqueKeyValue)) {
      rowErrors.push({
        rowNumber: rowIndex,
        field: 'Duplicate Key',
        key: schema.uniqueKey,
        value: uniqueKeyValue,
        message: `Duplicate record within file for key "${uniqueKeyValue}"`,
        severity: 'WARNING',
      });
    } else {
      seenFileKeys.add(uniqueKeyValue);
    }

    // Check store duplicates
    isStoreDuplicate = existingRecords.some((rec) => {
      if (schema.uniqueKey === 'phone') {
        return normalizeIndianPhone(rec.phone) === uniqueKeyValue;
      }
      if (schema.uniqueKey === 'phone_model') {
        return (
          normalizeIndianPhone(rec.phone) === normalizeIndianPhone(row.phone) &&
          String(rec.interestedModel || '').trim().toLowerCase() === String(row.interestedModel || '').trim().toLowerCase()
        );
      }
      if (schema.uniqueKey === 'chassisNumber') {
        return String(rec.chassisNumber || rec.vin || '').toUpperCase() === uniqueKeyValue;
      }
      return String(rec[schema.uniqueKey] || '').toUpperCase() === uniqueKeyValue;
    });

    if (isStoreDuplicate) {
      if (duplicateStrategy === 'SKIP') {
        rowErrors.push({
          rowNumber: rowIndex,
          field: 'Store Duplicate',
          key: schema.uniqueKey,
          value: uniqueKeyValue,
          message: `Record already exists in store and strategy is set to Skip`,
          severity: 'WARNING',
        });
      } else if (duplicateStrategy === 'UPDATE') {
        // Will update existing record - informational warning
        rowErrors.push({
          rowNumber: rowIndex,
          field: 'Store Duplicate',
          key: schema.uniqueKey,
          value: uniqueKeyValue,
          message: `Existing record found: will update on commit`,
          severity: 'WARNING',
        });
      }
    }
  }

  const hasErrors = rowErrors.some((e) => e.severity === 'ERROR');
  const hasWarnings = rowErrors.some((e) => e.severity === 'WARNING');

  return {
    errors: rowErrors,
    isValid: !hasErrors,
    hasWarnings,
    isDuplicate: isStoreDuplicate,
    rowNumber: rowIndex,
  };
}

/**
 * Validates mapped data in chunks of 5,000 rows to prevent blocking the UI
 */
export async function validateDataChunked(mappedRows, schema, context = {}, onProgress = () => {}) {
  const CHUNK_SIZE = 5000;
  const totalRows = mappedRows.length;
  const errors = [];
  const validRows = [];
  const seenFileKeys = new Set();

  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  return new Promise((resolve) => {
    let currentIndex = 0;

    function processChunk() {
      const chunkEnd = Math.min(currentIndex + CHUNK_SIZE, totalRows);

      for (let i = currentIndex; i < chunkEnd; i++) {
        const row = mappedRows[i];
        const res = validateRow(row, i + 1, schema, {
          ...context,
          seenFileKeys,
        });

        if (res.errors.length > 0) {
          errors.push(...res.errors);
        }

        if (res.isValid) {
          validCount++;
          validRows.push({
            ...row,
            __isDuplicate: res.isDuplicate,
            __hasWarnings: res.hasWarnings,
          });
        } else {
          errorCount++;
        }

        if (res.hasWarnings) {
          warningCount++;
        }
      }

      currentIndex = chunkEnd;
      const percent = totalRows === 0 ? 100 : Math.round((currentIndex / totalRows) * 100);
      onProgress(percent);

      if (currentIndex < totalRows) {
        setTimeout(processChunk, 0);
      } else {
        const validPercent = totalRows === 0 ? 100 : Math.round((validCount / totalRows) * 100);
        resolve({
          totalRows,
          validCount,
          warningCount,
          errorCount,
          validPercent,
          errors,
          validRows,
        });
      }
    }

    processChunk();
  });
}

/**
 * Generates CSV string for downloading error reports
 */
export function generateErrorReportCsv(errors, rawRows = [], headers = []) {
  const csvHeaders = ['Row Number', 'Field', 'Severity', 'Error Message', 'Rejected Value', ...headers];
  const rows = [csvHeaders.join(',')];

  errors.forEach((err) => {
    const rawRow = rawRows[err.rowNumber - 1] || {};
    const extraCols = headers.map((h) => {
      const val = String(rawRow[h] ?? '').replace(/"/g, '""');
      return `"${val}"`;
    });

    const line = [
      err.rowNumber,
      `"${(err.field || '').replace(/"/g, '""')}"`,
      `"${err.severity}"`,
      `"${(err.message || '').replace(/"/g, '""')}"`,
      `"${(err.value || '').replace(/"/g, '""')}"`,
      ...extraCols,
    ].join(',');
    rows.push(line);
  });

  return rows.join('\r\n');
}

