import React, { useState } from 'react';
import { X, BookmarkCheck, CreditCard, Calendar } from 'lucide-react';
import { calculateQuotationTotals } from '../../../quotations/math';
import { toast } from 'sonner';

export function ConvertBookingModal({ isOpen, onClose, quotation, onConfirm }) {
  if (!isOpen || !quotation) return null;

  const totals = calculateQuotationTotals(quotation);
  const [tokenAmountRupees, setTokenAmountRupees] = useState(15000);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState(`UPI-${Date.now().toString().slice(-8)}`);
  const [tentativeDays, setTentativeDays] = useState(5);

  const handleConfirm = () => {
    if (tokenAmountRupees <= 0) {
      toast.error('Token amount must be greater than zero');
      return;
    }
    onConfirm(quotation.id, {
      tokenAmountPaise: Number(tokenAmountRupees) * 100,
      paymentMode,
      paymentRef,
      tentativeDeliveryDate: new Date(Date.now() + tentativeDays * 86400000).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden text-xs text-slate-700">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <span>Convert Quotation to Vehicle Booking</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-900 text-xs">
              <span>{quotation.customerName}</span>
              <span className="font-mono text-blue-700">{quotation.quotationNumber}</span>
            </div>
            <div className="text-slate-600">
              {quotation.modelName} — {quotation.colorName}
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
              <span>Agreed On-Road Price:</span>
              <span className="text-blue-700">₹ {totals.netAmountRupees.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Booking Advance Token Amount (₹) *
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                value={tokenAmountRupees}
                onChange={(e) => setTokenAmountRupees(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Instrument</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NETBANKING">Net Banking / NEFT</option>
                  <option value="CASH">Cash Deposit</option>
                  <option value="CHEQUE">Banker's Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Reference / UTR</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Tentative Delivery Schedule
              </label>
              <select
                value={tentativeDays}
                onChange={(e) => setTentativeDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value={3}>Within 3 Days (Ready Stock)</option>
                <option value={5}>Within 5 Days (Standard PDI & RTO)</option>
                <option value={10}>Within 10 Days (Transit Inbound)</option>
                <option value={20}>Within 20 Days (Factory Dispatch)</option>
              </select>
            </div>
          </div>
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
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Confirm & Generate Booking</span>
          </button>
        </div>
      </div>
    </div>
  );
}

