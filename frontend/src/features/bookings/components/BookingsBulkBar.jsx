import React from 'react';
import { Download, MessageSquare, Printer, X } from 'lucide-react';

export function BookingsBulkBar({
  selectedCount,
  onClearSelection,
  onExportSelected,
  onSendReminders,
  onPrintForms,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-xs tracking-wide">
          {selectedCount} {selectedCount === 1 ? 'booking' : 'bookings'} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-blue-200 hover:text-white p-0.5 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Selected</span>
        </button>

        <button
          onClick={onSendReminders}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send Reminder</span>
        </button>

        <button
          onClick={onPrintForms}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Forms</span>
        </button>
      </div>
    </div>
  );
}

