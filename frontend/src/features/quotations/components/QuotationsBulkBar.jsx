import React from 'react';
import { FileDown, MessageSquare, Ban, X } from 'lucide-react';

export function QuotationsBulkBar({
  selectedCount,
  onClearSelection,
  onBulkExport,
  onBulkWhatsApp,
  onBulkCancel,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[11px]">
          {selectedCount}
        </span>
        <span className="font-semibold">
          {selectedCount} {selectedCount === 1 ? 'quotation' : 'quotations'} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onBulkExport}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-400" />
          <span>Export Selected</span>
        </button>

        <button
          onClick={onBulkWhatsApp}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Send Reminders</span>
        </button>

        <button
          onClick={onBulkCancel}
          className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-medium inline-flex items-center gap-1.5 transition-colors border border-rose-800/60"
        >
          <Ban className="w-3.5 h-3.5 text-rose-400" />
          <span>Cancel Selected</span>
        </button>

        <button
          onClick={onClearSelection}
          title="Clear Selection"
          className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

