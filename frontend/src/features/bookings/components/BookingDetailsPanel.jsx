import React, { useState } from 'react';
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
  ChevronUp,
} from 'lucide-react';
import { STATUS_CONFIG, BOOKING_STATUSES } from '../../../bookings/config';
import { getDeliveryFlag, isHoldExpired } from '../../../bookings/engine';
import { maskPhone } from '../../../lib/rbac';
import { toast } from 'sonner';

export function BookingDetailsPanel({
  booking,
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

  if (!booking) return null;

  const statusMeta = STATUS_CONFIG[booking.status] || {
    label: booking.status,
    badgeClass: 'bg-white/20 text-slate-800 dark:text-white border-white/30',
  };
  const tokenAmount = ((booking.tokenPaidPaise || 0) / 100).toLocaleString('en-IN');
  const deliveryTiming = getDeliveryFlag(booking);
  const holdExpired = isHoldExpired(booking);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVin(true);
    toast.success('Copied VIN to clipboard');
    setTimeout(() => setCopiedVin(false), 2000);
  };

  return (
    <section
      id="booking-detail-panel"
      className="glass-card rounded-[28px] p-5 sm:p-7 border border-white/40 dark:border-white/10 shadow-xl space-y-6 scroll-mt-6 transition-all duration-300 relative"
      aria-label="Booking Details"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-text-glass-main dark:text-white font-mono">
                {booking.bookingNumber}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-text-glass-muted dark:text-slate-300 mt-1">
              Created on {booking.bookingDate || '2026-10-15'} · Branch:{' '}
              <strong className="text-text-glass-main dark:text-white font-medium">
                {booking.branchName}
              </strong>
            </p>
          </div>
        </div>

        {/* Header Right Actions & Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 border border-white/30 text-xs font-medium text-text-glass-main dark:text-white transition-colors"
            title="Collapse Details Panel"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Hide Details</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 border border-white/30 flex items-center justify-center text-text-glass-muted dark:text-slate-200 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Structured Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card A: Customer Details */}
        <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-glass-main dark:text-white uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Customer Details</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Full Name</span>
              <span className="font-semibold text-text-glass-main dark:text-white text-sm">
                {booking.customerName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Contact Phone</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-glass-main dark:text-white font-mono">
                  {canViewFullPhone || showFullPhone
                    ? booking.customerPhone
                    : maskPhone(booking.customerPhone)}
                </span>
                {canViewFullPhone && (
                  <button
                    type="button"
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    className="text-text-glass-muted hover:text-text-glass-main p-0.5"
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
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Email Address</span>
              <span className="font-medium text-text-glass-main dark:text-slate-200 truncate block">
                {booking.customerEmail || 'customer@example.com'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Delivery Address</span>
              <span className="font-medium text-text-glass-main dark:text-slate-200 block">
                {booking.deliveryAddress || 'Bangalore, Karnataka'}
              </span>
            </div>
          </div>
        </div>

        {/* Card B: Reserved Vehicle Specification */}
        <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-glass-main dark:text-white uppercase tracking-wider">
            <Bike className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Reserved Vehicle Specification</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Model</span>
              <span className="font-semibold text-text-glass-main dark:text-white text-sm">
                {booking.modelName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Variant & Colour</span>
              <span className="font-medium text-text-glass-main dark:text-slate-200">
                {booking.variant || 'Standard'} · {booking.colour || 'Selected Colour'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Estimated On-Road</span>
              <span className="font-bold text-text-glass-main dark:text-white text-base">
                ₹{' '}
                {(
                  (booking.onRoadPricePaise || booking.totalAmountPaise || 20000000) / 100
                ).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Source Quotation</span>
              {booking.quotationId ? (
                <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  {booking.quotationNumber || booking.quotationId}
                </span>
              ) : (
                <span className="text-text-glass-muted dark:text-slate-400 italic">Direct Showroom Walk-in</span>
              )}
            </div>
          </div>
        </div>

        {/* Card C: Single-Unit Chassis Allocation Gate */}
        <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/30 space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-text-glass-main dark:text-white uppercase tracking-wider">
              <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Chassis Gate</span>
            </div>
            {canAllocateChassis &&
              booking.status !== BOOKING_STATUSES.DELIVERED &&
              booking.status !== BOOKING_STATUSES.CANCELLED && (
                <button
                  type="button"
                  onClick={() => onAllocateChassis(booking)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {booking.allocatedVin ? 'Reallocate' : 'Allocate'}
                </button>
              )}
          </div>

          {booking.allocatedVin ? (
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/10 border border-white/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-text-glass-muted dark:text-slate-300 uppercase">
                  Allocated VIN
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Locked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-text-glass-main dark:text-white bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded border border-white/40">
                  {booking.allocatedVin}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(booking.allocatedVin)}
                  className="p-1 rounded text-text-glass-muted hover:text-text-glass-main hover:bg-white/30 transition-colors"
                  title="Copy VIN"
                >
                  {copiedVin ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-text-glass-muted dark:text-slate-400">
                Chassis locked exclusively to Booking <strong>{booking.bookingNumber}</strong>.
              </p>
            </div>
          ) : booking.temporaryHoldUntil ? (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold text-xs">
                <span>48h Temporary Hold</span>
                <span>{holdExpired ? 'EXPIRED' : 'ACTIVE'}</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200">
                VIN held: <strong className="font-mono">{booking.temporaryVin}</strong>
              </p>
              {booking.status === BOOKING_STATUSES.PENDING && (
                <button
                  type="button"
                  onClick={() => onConfirmBooking(booking)}
                  className="w-full mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  Confirm Booking & Lock Chassis
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white/20 dark:bg-white/5 border border-dashed border-white/40 text-center py-4">
              <p className="text-xs text-text-glass-muted dark:text-slate-300">
                No chassis allocated to this reservation yet.
              </p>
              {canAllocateChassis && (
                <button
                  type="button"
                  onClick={() => onAllocateChassis(booking)}
                  className="mt-2.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Allocate Chassis Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Token Payments & Delivery Timeline Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Receipts */}
        <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-text-glass-main dark:text-white uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Token Payments & Receipts</span>
            </div>
            {booking.status !== BOOKING_STATUSES.DELIVERED &&
              booking.status !== BOOKING_STATUSES.CANCELLED && (
                <button
                  type="button"
                  onClick={() => onRecordToken(booking)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Record Token Payment
                </button>
              )}
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-white/10 border border-white/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Total Token Paid</span>
              <span className="text-lg font-bold text-text-glass-main dark:text-white">₹ {tokenAmount}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Payment Mode</span>
              <span className="font-semibold text-text-glass-main dark:text-slate-200">
                {booking.paymentMode || 'UPI'}
              </span>
            </div>
          </div>

          {booking.tokenReceipts && booking.tokenReceipts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-text-glass-muted dark:text-slate-400 uppercase">
                Payment History
              </span>
              {booking.tokenReceipts.map((rec, idx) => (
                <div
                  key={rec.receiptNumber || idx}
                  className="p-2 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-text-glass-main dark:text-white">{rec.receiptNumber}</span>
                    <span className="text-text-glass-muted dark:text-slate-400 ml-2">
                      {rec.date} · {rec.mode}
                    </span>
                  </div>
                  <span className="font-bold text-text-glass-main dark:text-white">
                    ₹ {((rec.amountPaise || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery & Schedule */}
        <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-text-glass-main dark:text-white uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Delivery & Schedule Management</span>
            </div>
            {booking.status !== BOOKING_STATUSES.DELIVERED &&
              booking.status !== BOOKING_STATUSES.CANCELLED && (
                <button
                  type="button"
                  onClick={() => onRescheduleDelivery(booking)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Reschedule Date
                </button>
              )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">Tentative Delivery Date</span>
              <span className="font-bold text-text-glass-main dark:text-white text-base">
                {booking.tentativeDeliveryDate}
              </span>
              {deliveryTiming.flag === 'OVERDUE' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 ml-2">
                  <AlertTriangle className="w-3 h-3" /> Overdue by {deliveryTiming.days} days
                </span>
              )}
              {deliveryTiming.flag === 'DUE_IN_2_DAYS' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 ml-2">
                  <Clock className="w-3 h-3" /> Due in 2 days
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] text-text-glass-muted dark:text-slate-400 block">PDI & Readiness</span>
              <span className="font-medium text-text-glass-main dark:text-slate-200">
                {booking.allocatedVin ? 'Ready for Pre-Delivery Inspection (PDI)' : 'Awaiting Chassis Allocation'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer Actions Bar */}
      <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          {canCancel &&
            booking.status !== BOOKING_STATUSES.DELIVERED &&
            booking.status !== BOOKING_STATUSES.CANCELLED && (
              <button
                type="button"
                onClick={() => onCancelBooking(booking)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-rose-500/30 transition-colors"
              >
                Cancel Booking
              </button>
            )}
        </div>

        <div className="flex items-center gap-2.5">
          {booking.status === BOOKING_STATUSES.PENDING && (
            <button
              type="button"
              onClick={() => onConfirmBooking(booking)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              Confirm Booking
            </button>
          )}

          {booking.status === BOOKING_STATUSES.CONFIRMED && (
            <button
              type="button"
              onClick={() => onDeliverBooking(booking)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              Mark as Delivered
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 border border-white/30 text-text-glass-main dark:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookingDetailsPanel;

