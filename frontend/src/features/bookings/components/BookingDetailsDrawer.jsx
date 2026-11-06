import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Bike,
  CreditCard,
  Key,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Clock,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { STATUS_CONFIG, BOOKING_STATUSES } from '../../../bookings/config';
import { getDeliveryFlag, isHoldExpired } from '../../../bookings/engine';
import { maskPhone } from '../../../lib/rbac';
import { toast } from 'sonner';

export function BookingDetailsDrawer({
  booking,
  isOpen,
  onClose,
  onRecordToken,
  onAllocateChassis,
  onRescheduleDelivery,
  onConfirmBooking,
  onDeliverBooking,
  onCancelBooking,
  canViewFullPhone = false,
  canAllocateChassis = true,
  canCancel = true,
}) {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copiedVin, setCopiedVin] = useState(false);

  if (!isOpen || !booking) return null;

  const statusMeta = STATUS_CONFIG[booking.status] || {
    label: booking.status,
    badgeClass: 'bg-slate-100 text-slate-700',
  };
  const tokenAmount = ((booking.tokenPaidPaise || 0) / 100).toLocaleString('en-IN');
  const deliveryTiming = getDeliveryFlag(booking);
  const holdExpired = isHoldExpired(booking);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVin(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedVin(false), 2000);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {booking.bookingNumber}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {booking.bookingDate || '2026-10-15'} · Branch:{' '}
                <strong className="text-slate-700">{booking.branchName}</strong>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Customer Information */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {booking.customerName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-900 font-mono">
                    {canViewFullPhone || showFullPhone
                      ? booking.customerPhone
                      : maskPhone(booking.customerPhone)}
                  </span>
                  {canViewFullPhone && (
                    <button
                      type="button"
                      onClick={() => setShowFullPhone(!showFullPhone)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      title={showFullPhone ? 'Mask phone' : 'Show full phone'}
                    >
                      {showFullPhone ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Email Address</span>
                <span className="font-medium text-slate-800">
                  {booking.customerEmail || 'customer@example.com'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Delivery Address</span>
                <span className="font-medium text-slate-800">
                  {booking.deliveryAddress || 'Bangalore, Karnataka'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>Reserved Vehicle Specification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block">Model</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {booking.modelName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Variant & Colour</span>
                <span className="font-medium text-slate-800">
                  {booking.variant || 'Standard'} · {booking.colour || 'Selected Colour'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Estimated On-Road</span>
                <span className="font-bold text-slate-900">
                  ₹{' '}
                  {(
                    (booking.onRoadPricePaise || booking.totalAmountPaise || 20000000) / 100
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Source Quotation</span>
                {booking.quotationId ? (
                  <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                    {booking.quotationNumber || booking.quotationId}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Direct Showroom Walk-in</span>
                )}
              </div>
            </div>
          </div>

          {/* Chassis Allocation Gate */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Single-Unit Chassis Allocation Gate</span>
              </h3>
              {canAllocateChassis &&
                booking.status !== BOOKING_STATUSES.DELIVERED &&
                booking.status !== BOOKING_STATUSES.CANCELLED && (
                  <button
                    type="button"
                    onClick={() => onAllocateChassis(booking)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {booking.allocatedVin ? 'Change / Reallocate' : 'Allocate Chassis'}
                  </button>
                )}
            </div>

            {booking.allocatedVin ? (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Allocated Chassis (VIN)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Chassis Locked
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {booking.allocatedVin}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(booking.allocatedVin)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Copy VIN"
                  >
                    {copiedVin ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Strict single-unit gate enforced: This chassis is locked to Booking{' '}
                  <strong>{booking.bookingNumber}</strong> and cannot be assigned elsewhere.
                </p>
              </div>
            ) : booking.temporaryHoldUntil ? (
              <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-amber-800 font-semibold text-xs">
                  <span>Temporary 48-Hour Vehicle Hold</span>
                  <span>{holdExpired ? 'EXPIRED' : 'ACTIVE HOLD'}</span>
                </div>
                <p className="text-xs text-amber-700">
                  VIN held: <strong className="font-mono">{booking.temporaryVin}</strong> until{' '}
                  {new Date(booking.temporaryHoldUntil).toLocaleString('en-IN')}.
                </p>
                {booking.status === BOOKING_STATUSES.PENDING && (
                  <button
                    type="button"
                    onClick={() => onConfirmBooking(booking)}
                    className="w-full mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition-colors"
                  >
                    Confirm Booking & Lock Chassis
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white p-3.5 rounded-lg border border-dashed border-slate-300 text-center py-5">
                <p className="text-slate-500 text-xs font-medium">
                  No chassis currently allocated to this reservation.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Chassis allocation can be performed for Confirmed bookings or as a 48h hold.
                </p>
                {canAllocateChassis && (
                  <button
                    type="button"
                    onClick={() => onAllocateChassis(booking)}
                    className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    Allocate Chassis Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Token & Receipts */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Token Payments & Receipts</span>
              </h3>
              {booking.status !== BOOKING_STATUSES.DELIVERED &&
                booking.status !== BOOKING_STATUSES.CANCELLED && (
                  <button
                    type="button"
                    onClick={() => onRecordToken(booking)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    + Record Token Payment
                  </button>
                )}
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Token Paid</span>
                <span className="text-base font-bold text-slate-900">₹ {tokenAmount}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Payment Mode</span>
                <span className="font-semibold text-slate-800">{booking.paymentMode || 'UPI'}</span>
              </div>
            </div>

            {/* Receipts List */}
            {booking.tokenReceipts && booking.tokenReceipts.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Payment History
                </span>
                {booking.tokenReceipts.map((rec, idx) => (
                  <div
                    key={rec.receiptNumber || idx}
                    className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{rec.receiptNumber}</span>
                      <span className="text-slate-400 ml-2">
                        {rec.date} · {rec.mode}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹ {((rec.amountPaise || 0) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery & Scheduling */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Delivery & Schedule Management</span>
              </h3>
              {booking.status !== BOOKING_STATUSES.DELIVERED &&
                booking.status !== BOOKING_STATUSES.CANCELLED && (
                  <button
                    type="button"
                    onClick={() => onRescheduleDelivery(booking)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-800 hover:underline"
                  >
                    Reschedule Delivery
                  </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block">Tentative Delivery Date</span>
                <span className="font-bold text-slate-900 text-sm">
                  {booking.tentativeDeliveryDate}
                </span>
                {deliveryTiming.flag === 'OVERDUE' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-0.5">
                    <AlertTriangle className="w-3 h-3" /> Overdue by {deliveryTiming.days} days
                  </span>
                )}
                {deliveryTiming.flag === 'DUE_IN_2_DAYS' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-0.5">
                    <Clock className="w-3 h-3" /> Due in 2 days
                  </span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">PDI & Readiness</span>
                <span className="font-medium text-slate-800">
                  {booking.allocatedVin ? 'Ready for Pre-Delivery Inspection' : 'Awaiting Allocation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canCancel &&
              booking.status !== BOOKING_STATUSES.DELIVERED &&
              booking.status !== BOOKING_STATUSES.CANCELLED && (
                <button
                  type="button"
                  onClick={() => onCancelBooking(booking)}
                  className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
          </div>

          <div className="flex items-center gap-2">
            {booking.status === BOOKING_STATUSES.PENDING && (
              <button
                type="button"
                onClick={() => onConfirmBooking(booking)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Confirm Booking
              </button>
            )}

            {booking.status === BOOKING_STATUSES.CONFIRMED && (
              <button
                type="button"
                onClick={() => onDeliverBooking(booking)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Mark as Delivered
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

