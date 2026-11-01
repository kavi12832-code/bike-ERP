import React, { useState } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function RescheduleDeliveryModal({
  booking,
  isOpen,
  onClose,
  onReschedule,
}) {
  const [newDate, setNewDate] = useState(booking?.tentativeDeliveryDate || '2026-11-10');
  const [reason, setReason] = useState('Customer requested date postponement');
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('Please pick a new tentative delivery date');
      return;
    }

    onReschedule({
      bookingId: booking.id,
      newDate,
      reason,
      notifyCustomer,
    });

    toast.success(
      `Delivery rescheduled to ${newDate}${notifyCustomer ? ' (Customer notified via WhatsApp)' : ''}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Reschedule Delivery Date</h2>
              <p className="text-xs text-slate-500">
                {booking.bookingNumber} · {booking.customerName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Current Delivery Date:</span>
            <span className="text-xs font-bold text-slate-900">
              {booking.tentativeDeliveryDate}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              New Tentative Delivery Date *
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Reason for Rescheduling *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="Customer requested date postponement">
                Customer requested date postponement
              </option>
              <option value="RTO registration or HSRP processing delay">
                RTO registration or HSRP processing delay
              </option>
              <option value="OEM transit delay from factory">
                OEM transit delay from factory
              </option>
              <option value="Accessories fitment & ceramic coating in progress">
                Accessories fitment & ceramic coating in progress
              </option>
              <option value="Customer finance / loan disbursement pending">
                Customer finance / loan disbursement pending
              </option>
            </select>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-semibold text-blue-900">
                Send updated date notification to customer via WhatsApp
              </span>
            </label>
            <p className="text-[11px] text-blue-700 mt-0.5 pl-5">
              Simulates delivery reminder push with revised PDI slot.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

