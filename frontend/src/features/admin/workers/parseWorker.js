// src/features/admin/workers/parseWorker.js
/**
 * Dedicated Web Worker for background file parsing to ensure zero main-thread lag.
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

self.onmessage = async (e) => {
  const { fileData, fileName, fileType, selectedSheetIndex } = e.data;

  try {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(fileData, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          self.postMessage({
            success: true,
            headers: results.meta.fields || [],
            rows: results.data,
            sheetNames: ['Default'],
          });
        },
        error: (err) => {
          self.postMessage({ success: false, error: err.message });
        },
      });
      return;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(fileData, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      const targetSheet = sheetNames[selectedSheetIndex || 0];
      const worksheet = workbook.Sheets[targetSheet];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const headers = rows.length ? Object.keys(rows[0]) : [];

      self.postMessage({
        success: true,
        headers,
        rows,
        sheetNames,
      });
      return;
    }

    if (ext === 'json') {
      const parsed = JSON.parse(fileData);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const headers = rows.length ? Object.keys(rows[0]) : [];
      self.postMessage({
        success: true,
        headers,
        rows,
        sheetNames: ['JSON'],
      });
      return;
    }

    self.postMessage({ success: false, error: `Unsupported file extension .${ext}` });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};

