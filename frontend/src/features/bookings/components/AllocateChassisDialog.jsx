import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, AlertTriangle, CheckCircle2, ShieldAlert, Check } from 'lucide-react';
import { isValidVin } from '../../../bookings/engine';
import { BOOKING_STATUSES } from '../../../bookings/config';
import { toast } from 'sonner';

export function AllocateChassisDialog({
  booking,
  isOpen,
  onClose,
  vehicleStock = [],
  onAllocate,
}) {
  const [selectedVin, setSelectedVin] = useState('');
  const [manualVin, setManualVin] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [reallocationReason, setReallocationReason] = useState('Customer requested batch change');
  const [holdOnly, setHoldOnly] = useState(false);

  if (!isOpen || !booking) return null;

  const isPending = booking.status === BOOKING_STATUSES.PENDING;
  const isReallocation = Boolean(booking.allocatedVin);

  // Available stock matching the model
  const matchingStock = vehicleStock.filter(
    (u) =>
      u.status === 'IN_STOCK' &&
      !u.allocatedBookingId &&
      u.modelName === booking.modelName &&
      (!booking.branchName || u.branchName === booking.branchName)
  );

  const effectiveVin = isManualMode ? manualVin.trim().toUpperCase() : selectedVin;
  const vinValid = isValidVin(effectiveVin);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!effectiveVin) {
      toast.error('Please select or enter a Chassis # (VIN)');
      return;
    }

    if (!vinValid) {
      toast.error('Invalid VIN: Must be exactly 17 characters (excluding I, O, Q)');
      return;
    }

    // Verify stock availability if manual VIN was entered
    const existingUnit = vehicleStock.find((u) => u.vin === effectiveVin);
    if (existingUnit && existingUnit.allocatedBookingId && existingUnit.allocatedBookingId !== booking.id) {
      toast.error(`VIN ${effectiveVin} is already allocated to another booking! Single-unit gate violation.`);
      return;
    }

    onAllocate({
      bookingId: booking.id,
      vin: effectiveVin,
      isHold: isPending && holdOnly,
      reallocationReason: isReallocation ? reallocationReason : undefined,
    });

    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isReallocation ? 'Reallocate Chassis (VIN)' : 'Allocate Chassis (VIN)'}
              </h2>
              <p className="text-xs text-slate-500">
                Booking: <strong className="text-slate-800">{booking.bookingNumber}</strong> ({booking.customerName})
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Reservation Spec Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Vehicle Reserved</span>
              <span className="font-bold text-slate-900">{booking.modelName}</span>
              <span className="text-slate-500 ml-1.5">· {booking.colour}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Branch</span>
              <span className="font-semibold text-slate-800">{booking.branchName}</span>
            </div>
          </div>

          {/* Current VIN (if reallocating) */}
          {isReallocation && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Current Allocated VIN: {booking.allocatedVin}</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Reallocating will release the current chassis back into inventory and lock the new one.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Reason for Reallocation *
                </label>
                <select
                  value={reallocationReason}
                  onChange={(e) => setReallocationReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-300 bg-white"
                >
                  <option value="Customer requested batch change">Customer requested batch change</option>
                  <option value="Customer requested alternate colour">Customer requested alternate colour</option>
                  <option value="PDI transit imperfection noted">PDI transit imperfection noted</option>
                  <option value="Priority fleet reallocation">Priority fleet reallocation</option>
                </select>
              </div>
            </div>
          )}

          {/* Mode Switch: Available Stock vs Manual Entry */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-slate-700">Select Allocation Source:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualMode(false)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  !isManualMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                From Available Stock ({matchingStock.length})
              </button>
              <button
                type="button"
                onClick={() => setIsManualMode(true)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  isManualMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Manual 17-Char VIN
              </button>
            </div>
          </div>

          {!isManualMode ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Available Matching Chassis in Stock ({matchingStock.length} units available)
              </label>
              {matchingStock.length === 0 ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center">
                  <p className="font-semibold">No available stock units found</p>
                  <p className="text-[11px] mt-0.5">
                    Switch to manual entry or adjust branch filters to allocate.
                  </p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {matchingStock.map((u) => {
                    const isSelected = selectedVin === u.vin;
                    return (
                      <div
                        key={u.vin}
                        onClick={() => setSelectedVin(u.vin)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-900">{u.vin}</div>
                          <div className="text-[10px] text-slate-500">
                            Colour: {u.colour} · {u.branchName}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Enter 17-Character ISO Chassis Number (VIN)
              </label>
              <input
                type="text"
                maxLength={17}
                placeholder="e.g. ME3UJ3S5C8PRA10099"
                value={manualVin}
                onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border focus:outline-none uppercase ${
                  manualVin.length === 17 && vinValid
                    ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900'
                    : manualVin.length > 0 && (!vinValid || manualVin.length < 17)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
                <span>{manualVin.length} / 17 characters</span>
                {manualVin.length === 17 && (
                  <span
                    className={
                      vinValid ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'
                    }
                  >
                    {vinValid ? '✓ Valid ISO VIN' : '✗ Invalid characters (no I, O, Q allowed)'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Pending Booking 48h Hold option */}
          {isPending && (
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={holdOnly}
                  onChange={(e) => setHoldOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-semibold text-blue-900">
                  Assign as 48-Hour Temporary Vehicle Hold
                </span>
              </label>
              <p className="text-[11px] text-blue-700 mt-1 pl-5">
                Reserves the VIN for 48 hours while the customer completes token or finance verification.
              </p>
            </div>
          )}

          {/* Single Unit Gate Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span>
              Atomic verification: Two bookings can never share the same chassis number.
            </span>
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
              disabled={!vinValid}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isReallocation ? 'Confirm Reallocation' : 'Lock Chassis Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

