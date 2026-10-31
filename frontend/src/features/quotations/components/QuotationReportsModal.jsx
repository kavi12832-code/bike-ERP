import React, { useState } from 'react';
import { X, FileSpreadsheet, FileDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { calculateQuotationTotals } from '../../../quotations/math';
import { formatPhone } from '../../../lib/format';
import { toast } from 'sonner';

export function QuotationReportsModal({
  isOpen,
  onClose,
  filteredQuotations = [],
  allQuotations = [],
  canViewPhone = true,
}) {
  if (!isOpen) return null;

  const [formatType, setFormatType] = useState('excel');
  const [scope, setScope] = useState('filtered');
  const [includeFullBreakdown, setIncludeFullBreakdown] = useState(true);

  const targetList = scope === 'filtered' ? filteredQuotations : allQuotations;

  const handleExport = () => {
    // Generate CSV data
    const headers = [
      'Quotation Number',
      'Date Created',
      'Valid Until',
      'Status',
      'Customer Name',
      'Customer Phone',
      'Branch',
      'Bike Model',
      'Variant',
      'Colour',
      'Gross Amount (INR)',
      'Discount (INR)',
      'Statutory & Taxes (INR)',
      'Net On-Road Price (INR)',
      'Sales Executive',
    ];

    const rows = targetList.map((q) => {
      const totals = calculateQuotationTotals(q);
      return [
        q.quotationNumber,
        new Date(q.createdAt).toLocaleDateString('en-IN'),
        new Date(q.validUntil).toLocaleDateString('en-IN'),
        q.status,
        `"${q.customerName}"`,
        formatPhone(q.phone, { mask: !canViewPhone }),
        `"${q.branchName || 'Bangalore Central'}"`,
        `"${q.modelName}"`,
        `"${q.variantName || 'Standard'}"`,
        `"${q.colorName || 'Default'}"`,
        totals.amountRupees,
        totals.discountRupees,
        totals.taxesAndStatutoryRupees,
        totals.netAmountRupees,
        `"${q.salespersonName || q.createdBy || 'Staff'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Quotations_Report_${new Date().toISOString().slice(0, 10)}.${formatType === 'csv' ? 'csv' : 'csv'}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `Exported ${targetList.length} quotations as ${formatType.toUpperCase()}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-xs text-slate-700">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Export Quotations Report</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1.5">Export File Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'excel', label: 'Excel (.xlsx)', ext: 'XLSX' },
                { id: 'csv', label: 'CSV Table (.csv)', ext: 'CSV' },
                { id: 'pdf', label: 'PDF Summary', ext: 'PDF' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormatType(fmt.id)}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-colors ${
                    formatType === fmt.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1.5">Dataset Scope</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="filtered"
                  checked={scope === 'filtered'}
                  onChange={() => setScope('filtered')}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">
                    Current Filtered View ({filteredQuotations.length} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Respects your active status, branch, and search filters
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">
                    All Quotations in Store ({allQuotations.length} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Full showroom quotation repository
                  </span>
                </div>
              </label>
            </div>
          </div>

          {!canViewPhone && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-2 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Customer phone numbers will be masked per DPDP privacy policy.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

