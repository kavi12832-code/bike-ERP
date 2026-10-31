import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { calculateCancellationRefund } from '../../../bookings/engine';
import { toast } from 'sonner';

export function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onCancelReservation,
}) {
  const [reason, setReason] = useState('Customer opted for another brand');
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !booking) return null;

  const refundCalc = calculateCancellationRefund(booking, reason);
  const tokenPaid = ((booking.tokenPaidPaise || 0) / 100).toLocaleString('en-IN');
  const deduction = (refundCalc.deductionPaise / 100).toLocaleString('en-IN');
  const refundAmount = (refundCalc.refundAmountPaise / 100).toLocaleString('en-IN');

  const handleSubmit = (e) => {
    e.preventDefault();

    onCancelReservation({
      bookingId: booking.id,
      reason,
      remarks: remarks.trim() || undefined,
      refundAmountPaise: refundCalc.refundAmountPaise,
    });

    toast.success(`Booking ${booking.bookingNumber} cancelled and chassis released`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-950">Cancel Vehicle Reservation</h2>
              <p className="text-xs text-rose-700">
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
          {/* Chassis Release Notice */}
          {booking.allocatedVin && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Chassis Release Gate</span>
                <span className="text-[11px] text-amber-700">
                  Allocated VIN <strong className="font-mono">{booking.allocatedVin}</strong> will
                  be automatically unlocked and returned to available inventory.
                </span>
              </div>
            </div>
          )}

          {/* Refund Breakdown Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Token Amount Collected:</span>
              <span className="font-semibold text-slate-900">₹ {tokenPaid}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Standard Policy Processing Fee:</span>
              <span className="font-semibold">- ₹ {deduction}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-emerald-700 font-bold text-sm">
              <span>Net Refund to Customer:</span>
              <span>₹ {refundAmount}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cancellation Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="Customer opted for another brand">
                Customer opted for another brand
              </option>
              <option value="Customer financial or loan rejection">
                Customer financial or loan rejection
              </option>
              <option value="Customer personal / relocation emergency">
                Customer personal / relocation emergency
              </option>
              <option value="Customer dissatisfaction with delivery timeline">
                Customer dissatisfaction with delivery timeline
              </option>
              <option value="Duplicate booking entry">Duplicate booking entry</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Audit Remarks / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Customer purchased Honda CB350 from competing dealer"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Keep Reservation
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

