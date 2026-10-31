// src/features/admin/utils/fileParser.js
/**
 * Robust file parsing utility for CSV, XLS, XLSX, and JSON files.
 * Handles UTF-8 BOM, multi-sheet Excel files, Hindi/Tamil Unicode text,
 * blank rows, duplicate headers, scientific notation numbers, and date serialization.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_ROW_LIMIT = 50000;

/**
 * Computes a fast hash of the file using subtle crypto or fallback
 */
export async function computeFileHash(file) {
  try {
    const buffer = await file.slice(0, 65536).arrayBuffer(); // hash first 64KB + size + name
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') + `_${file.size}`;
  } catch {
    return `${file.name}_${file.size}_${file.lastModified}`;
  }
}

/**
 * Normalizes headers: removes BOM, trims, handles duplicates
 */
export function sanitizeHeaders(headers) {
  const seen = new Map();
  return headers.map((header, idx) => {
    let clean = String(header || '')
      .replace(/^\uFEFF/, '') // Strip UTF-8 BOM
      .trim();

    if (!clean) clean = `Column_${idx + 1}`;

    const count = seen.get(clean) || 0;
    seen.set(clean, count + 1);

    if (count > 0) {
      return `${clean}_${count + 1}`;
    }
    return clean;
  });
}

/**
 * Checks if a parsed row object has any non-empty value
 */
function isRowNotEmpty(row) {
  return Object.values(row).some((val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    return true;
  });
}

/**
 * Main parseFile function
 * Returns { headers, rows, sheetNames, selectedSheet, recordCount, totalRows, warning }
 */
export async function parseFile(file, options = {}) {
  const { selectedSheetIndex = 0 } = options;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`);
  }

  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCsv(file);
  }
  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file, selectedSheetIndex);
  }
  if (ext === 'json') {
    return parseJson(file);
  }

  throw new Error(`Unsupported file type ".${ext}". Please upload a CSV, XLS, XLSX, or JSON file.`);
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && !results.data.length) {
          return reject(new Error(results.errors[0].message || 'Failed to parse CSV file.'));
        }

        const rawRows = results.data.filter(isRowNotEmpty);
        if (rawRows.length === 0) {
          return reject(new Error('The uploaded CSV file is empty.'));
        }

        if (rawRows.length > MAX_ROW_LIMIT) {
          return reject(new Error(`File contains ${rawRows.length} rows, which exceeds the maximum limit of ${MAX_ROW_LIMIT.toLocaleString()} rows.`));
        }

        const headers = sanitizeHeaders(results.meta.fields || Object.keys(rawRows[0] || {}));

        resolve({
          headers,
          rows: rawRows,
          sheetNames: ['Default'],
          selectedSheet: 'Default',
          recordCount: rawRows.length,
          totalRows: rawRows.length,
        });
      },
      error: (err) => reject(new Error(`CSV parsing error: ${err.message}`)),
    });
  });
}

async function parseExcel(file, sheetIndex = 0) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      dateNF: 'yyyy-mm-dd',
    });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel workbook contains no sheets.');
    }

    const sheetNames = workbook.SheetNames;
    const safeIndex = Math.min(Math.max(0, sheetIndex), sheetNames.length - 1);
    const targetSheetName = sheetNames[safeIndex];
    const worksheet = workbook.Sheets[targetSheetName];

    // Convert sheet to JSON array of objects
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      blankrows: false,
    });

    const rawRows = jsonData.filter(isRowNotEmpty);

    if (rawRows.length === 0) {
      throw new Error(`Sheet "${targetSheetName}" contains no records.`);
    }

    if (rawRows.length > MAX_ROW_LIMIT) {
      throw new Error(`Sheet "${targetSheetName}" contains ${rawRows.length} rows, which exceeds the limit of ${MAX_ROW_LIMIT.toLocaleString()} rows.`);
    }

    // Extract headers from first non-empty row or keys
    const headers = sanitizeHeaders(Object.keys(rawRows[0] || {}));

    return {
      headers,
      rows: rawRows,
      sheetNames,
      selectedSheet: targetSheetName,
      recordCount: rawRows.length,
      totalRows: rawRows.length,
    };
  } catch (err) {
    throw new Error(`Excel parse failed: ${err.message}`);
  }
}

async function parseJson(file) {
  try {
    const text = await file.text();
    const cleanText = text.replace(/^\uFEFF/, '').trim();
    const parsed = JSON.parse(cleanText);

    let rows = [];
    if (Array.isArray(parsed)) {
      rows = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Find first array property
      const arrKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrKey) {
        rows = parsed[arrKey];
      } else {
        rows = [parsed];
      }
    } else {
      throw new Error('Invalid JSON format: expected array of objects.');
    }

    const validRows = rows.filter(isRowNotEmpty);
    if (validRows.length === 0) {
      throw new Error('JSON file contains no record objects.');
    }

    if (validRows.length > MAX_ROW_LIMIT) {
      throw new Error(`File contains ${validRows.length} records, which exceeds the ${MAX_ROW_LIMIT.toLocaleString()} limit.`);
    }

    const headers = sanitizeHeaders(Object.keys(validRows[0] || {}));

    return {
      headers,
      rows: validRows,
      sheetNames: ['JSON Data'],
      selectedSheet: 'JSON Data',
      recordCount: validRows.length,
      totalRows: validRows.length,
    };
  } catch (err) {
    throw new Error(`JSON parse error: ${err.message}`);
  }
}

