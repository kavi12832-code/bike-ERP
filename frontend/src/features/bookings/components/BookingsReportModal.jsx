import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function BookingsReportModal({
  isOpen,
  onClose,
  bookings = [],
  filteredCount = 0,
}) {
  const [exportScope, setExportScope] = useState('FILTERED');
  const [exportFormat, setExportFormat] = useState('CSV');

  if (!isOpen) return null;

  const handleExport = () => {
    const dataToExport = bookings;
    if (dataToExport.length === 0) {
      toast.error('No bookings to export');
      return;
    }

    if (exportFormat === 'CSV' || exportFormat === 'EXCEL') {
      const headers = [
        'Booking #',
        'Customer Name',
        'Phone',
        'Model',
        'Colour',
        'Branch',
        'Status',
        'Token Paid (INR)',
        'Allocated VIN',
        'Tentative Delivery Date',
        'Created Date',
      ];

      const rows = dataToExport.map((b) => [
        `"${b.bookingNumber}"`,
        `"${b.customerName}"`,
        `"${b.customerPhone}"`,
        `"${b.modelName}"`,
        `"${b.colour}"`,
        `"${b.branchName}"`,
        `"${b.status}"`,
        (b.tokenPaidPaise || 0) / 100,
        `"${b.allocatedVin || 'Unallocated'}"`,
        `"${b.tentativeDeliveryDate}"`,
        `"${b.bookingDate}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Bookings_Report_${new Date().toISOString().slice(0, 10)}.${
          exportFormat === 'EXCEL' ? 'csv' : 'csv'
        }`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${dataToExport.length} bookings as ${exportFormat}`);
      onClose();
    } else {
      // PDF simulation
      toast.success(
        `PDF Summary Report generated for ${dataToExport.length} bookings (Demo export triggered)`
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Export Reservations Report</h2>
              <p className="text-xs text-slate-500">
                Statutory audit report & booking registers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CSV', 'EXCEL', 'PDF'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    exportFormat === fmt
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-semibold">{fmt}</span>
                  <span className="text-[10px] text-slate-400">
                    {fmt === 'PDF' ? 'Formatted Summary' : 'Full Table'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Records to Export:</span>
              <span className="font-bold text-slate-900">{bookings.length} reservations</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Includes customer contacts, model, colour, token receipts, and allocated chassis VINs.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

