import React, { useState } from 'react';
import { X, CreditCard, Receipt, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function RecordTokenPaymentModal({
  booking,
  isOpen,
  onClose,
  onRecordPayment,
}) {
  const [amountRupees, setAmountRupees] = useState(5000);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !booking) return null;

  const currentPaid = ((booking.tokenPaidPaise || 0) / 100).toLocaleString('en-IN');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amountRupees || amountRupees <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    onRecordPayment({
      bookingId: booking.id,
      amountPaise: Math.round(Number(amountRupees) * 100),
      mode: paymentMode,
      reference: paymentRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    toast.success('Token payment recorded successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record Token Payment</h2>
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
            <span className="text-slate-500 font-medium">Current Paid Token:</span>
            <span className="text-sm font-bold text-slate-900">₹ {currentPaid}</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              required
              min={100}
              step={100}
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Payment Mode *
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="UPI">UPI / QR Code</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking / NEFT</option>
              <option value="Cash">Cash at Counter</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              UTR / Transaction Ref
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-293847"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Second token installment towards registration"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Generate Receipt & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

