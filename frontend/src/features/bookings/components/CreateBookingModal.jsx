import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarPlus, CreditCard, Bike, User, Warehouse, Check } from 'lucide-react';
import { getMinimumTokenPaise } from '../../../bookings/engine';
import { BOOKING_STATUSES } from '../../../bookings/config';
import { toast } from 'sonner';

export function CreateBookingModal({
  isOpen,
  onClose,
  branches = [],
  models = [],
  vehicleStock = [],
  prefill = null,
  onCreateBooking,
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(
    branches[0]?.name || 'Bangalore Central Flagship'
  );
  const [selectedModel, setSelectedModel] = useState(
    models[0]?.name || 'Royal Enfield Classic 350'
  );
  const [variant, setVariant] = useState('Standard ABS');
  const [colour, setColour] = useState('Dark Stealth Black');
  const [tokenAmountRupees, setTokenAmountRupees] = useState(10000);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('UPI-TXN-8942');
  const [tentativeDeliveryDate, setTentativeDeliveryDate] = useState('2026-11-05');
  const [selectedVin, setSelectedVin] = useState('');
  const [quotationId, setQuotationId] = useState(null);

  // Update token default when model changes
  useEffect(() => {
    const minPaise = getMinimumTokenPaise(selectedModel);
    setTokenAmountRupees(minPaise / 100);
  }, [selectedModel]);

  // Handle prefill (e.g. from quotation or check availability)
  useEffect(() => {
    if (prefill) {
      if (prefill.customerName) setCustomerName(prefill.customerName);
      if (prefill.customerPhone) setCustomerPhone(prefill.customerPhone);
      if (prefill.customerEmail) setCustomerEmail(prefill.customerEmail);
      if (prefill.modelName) setSelectedModel(prefill.modelName);
      if (prefill.colour) setColour(prefill.colour);
      if (prefill.variant) setVariant(prefill.variant);
      if (prefill.branchName) setSelectedBranch(prefill.branchName);
      if (prefill.vin) setSelectedVin(prefill.vin);
      if (prefill.quotationId) setQuotationId(prefill.quotationId);
    }
  }, [prefill, isOpen]);

  if (!isOpen) return null;

  // Matching available stock
  const matchingUnits = vehicleStock.filter(
    (u) =>
      u.status === 'IN_STOCK' &&
      !u.allocatedBookingId &&
      u.modelName === selectedModel &&
      (!selectedBranch || u.branchName === selectedBranch)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      toast.error('Valid contact phone is required (10 digits)');
      return;
    }

    const minPaise = getMinimumTokenPaise(selectedModel);
    const tokenPaidPaise = Number(tokenAmountRupees) * 100;

    if (tokenPaidPaise < minPaise) {
      toast.error(
        `Token amount is below mandatory minimum of ₹ ${(minPaise / 100).toLocaleString(
          'en-IN'
        )} for ${selectedModel}`
      );
      return;
    }

    onCreateBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      deliveryAddress: deliveryAddress.trim() || undefined,
      branchName: selectedBranch,
      modelName: selectedModel,
      variant,
      colour,
      tokenPaidPaise,
      paymentMode,
      paymentRef,
      tentativeDeliveryDate,
      allocatedVin: selectedVin || undefined,
      quotationId: quotationId || undefined,
      status: selectedVin ? BOOKING_STATUSES.CONFIRMED : BOOKING_STATUSES.PENDING,
    });

    toast.success('Reservation created successfully!');
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create New Vehicle Reservation
              </h2>
              <p className="text-xs text-slate-500">
                Reserve chassis, generate statutory token receipt and lock booking
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Customer Section */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Particulars</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Rao"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Branch Allocation *
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id || b.name} value={b.name || b}>
                      {b.name || b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>Vehicle Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bike Model *
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {models.map((m) => (
                    <option key={m.id || m.name || m} value={m.name || m}>
                      {m.name || m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Colour & Trim *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rebel Blue"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tentative Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={tentativeDeliveryDate}
                  onChange={(e) => setTentativeDeliveryDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Optional Chassis Allocation from Stock */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-indigo-600" />
                <span>Immediate Chassis Allocation (Optional)</span>
              </h3>
              <span className="text-[11px] text-indigo-700 font-medium">
                {matchingUnits.length} matching units in stock
              </span>
            </div>

            {matchingUnits.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                No matching chassis available currently. Booking will be saved as Pending.
              </p>
            ) : (
              <select
                value={selectedVin}
                onChange={(e) => setSelectedVin(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              >
                <option value="">-- Leave Unallocated (Allocate Later) --</option>
                {matchingUnits.map((u) => (
                  <option key={u.vin} value={u.vin}>
                    {u.vin} (Colour: {u.colour})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Token Receipt Section */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Token Payment Collection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Token Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={5000}
                  step={500}
                  value={tokenAmountRupees}
                  onChange={(e) => setTokenAmountRupees(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Min required: ₹{' '}
                  {(getMinimumTokenPaise(selectedModel) / 100).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Net Banking">Net Banking / NEFT</option>
                  <option value="Cash">Cash at Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Transaction Ref / Receipt Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-TXN-10293"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Create Reservation & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

