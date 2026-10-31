// src/features/approvals/components/ExportApprovalsModal.jsx
import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { formatMoney } from '../../../lib/format';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ExportApprovalsModal({ isOpen, onClose, filteredApprovals = [] }) {
  const [format, setFormat] = useState('CSV');
  const [includeTimeline, setIncludeTimeline] = useState(true);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const headers = [
        'Reference ID',
        'Type',
        'Module',
        'Title',
        'Amount (INR)',
        'Customer / Entity',
        'Requester',
        'Requester Role',
        'Branch',
        'Status',
        'Submitted At',
        'Decided By',
        'Decided At',
        'Decision Note',
        'SLA State',
      ];

      const rows = filteredApprovals.map((req) => [
        `"${req.id}"`,
        `"${req.type}"`,
        `"${req.sourceModule || 'Sales'}"`,
        `"${(req.title || '').replace(/"/g, '""')}"`,
        req.amountPaise ? (req.amountPaise / 100).toFixed(2) : '0',
        `"${(req.customerName || '').replace(/"/g, '""')}"`,
        `"${(req.requesterName || '').replace(/"/g, '""')}"`,
        `"${(req.requesterRole || '').replace(/"/g, '""')}"`,
        `"${(req.branchName || '').replace(/"/g, '""')}"`,
        `"${req.status}"`,
        `"${req.createdAt}"`,
        `"${(req.decidedBy || '').replace(/"/g, '""')}"`,
        `"${req.decidedAt || ''}"`,
        `"${(req.decisionNote || '').replace(/"/g, '""')}"`,
        `"${req.slaBreached ? 'Breached' : 'Normal'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `approvals_report_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase() === 'excel' ? 'csv' : format.toLowerCase()}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredApprovals.length} approval records in ${format} format.`);
      onClose();
    } catch (err) {
      toast.error('Failed to generate export file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Export Approvals Governance Report</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-2">Select Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['CSV', 'Excel', 'PDF'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    format === f
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {f === 'PDF' ? <FileText className="w-4 h-4 mx-auto mb-1 text-rose-500" /> : <FileSpreadsheet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />}
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Export Scope:</span>
            <p className="text-slate-600 text-[11px]">
              {filteredApprovals.length} records matching current tab and active filter criteria will be exported.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={includeTimeline}
              onChange={(e) => setIncludeTimeline(e.target.checked)}
              className="rounded border-slate-300 text-blue-600"
            />
            <span className="text-slate-700 font-medium">Include audit trail history and reviewer notes</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportApprovalsModal;

