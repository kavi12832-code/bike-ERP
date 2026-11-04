import React, { useState } from 'react';
import {
  Copy,
  Check,
  MoreVertical,
  Eye,
  CreditCard,
  Key,
  Calendar,
  XCircle,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  Bike,
  Pencil,
  Trash2,
} from 'lucide-react';
import { STATUS_CONFIG, BOOKING_STATUSES } from '../../../bookings/config';
import { getDeliveryFlag, isHoldExpired } from '../../../bookings/engine';
import { maskPhone } from '../../../lib/rbac';
import { toast } from 'sonner';

export function BookingsTable({
  bookings = [],
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onViewDetails,
  onRecordToken,
  onAllocateChassis,
  onRescheduleDelivery,
  onConfirmBooking,
  onDeliverBooking,
  onCancelBooking,
  onEditBooking,
  onDeleteBooking,
  canDelete = false,
  canViewFullPhone = false,
  canAllocateChassis = true,
  canCancel = true,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedVin, setCopiedVin] = useState(null);

  const allSelected = bookings.length > 0 && bookings.every((b) => selectedIds.includes(b.id));

  const handleCopyVin = (e, vin) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    toast.success(`Copied VIN ${vin} to clipboard`);
    setTimeout(() => setCopiedVin(null), 2000);
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CU';
  };

  const getAvatarBg = (name = '') => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-teal-100 text-teal-700 border-teal-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Booking #</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Model & Colour</th>
              <th className="py-3 px-3">Token Paid</th>
              <th className="py-3 px-3">Allocated Chassis (VIN)</th>
              <th className="py-3 px-3">Est. Delivery</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Bike className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No bookings found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing filters or search query to see reservations
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const isSelected = selectedIds.includes(b.id);
                const statusMeta = STATUS_CONFIG[b.status] || {
                  label: b.status,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const tokenAmount = ((b.tokenPaidPaise || 0) / 100).toLocaleString('en-IN');
                const deliveryTiming = getDeliveryFlag(b);
                const holdExpired = isHoldExpired(b);

                return (
                  <tr
                    key={b.id}
                    onClick={() => onViewDetails(b)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRow(b.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow(b.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Booking Number */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {b.bookingNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {b.branchName || 'Bangalore Central'}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] ${getAvatarBg(
                            b.customerName
                          )}`}
                        >
                          {getInitials(b.customerName)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{b.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {canViewFullPhone
                              ? b.customerPhone || 'N/A'
                              : maskPhone(b.customerPhone)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Model & Colour */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-900 line-clamp-1">{b.modelName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 line-clamp-1">
                        <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span>
                        <span>{b.colour || 'Standard'}</span>
                        {b.variant && (
                          <span className="text-slate-400">· {b.variant}</span>
                        )}
                      </div>
                    </td>

                    {/* Token Paid */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">₹ {tokenAmount}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-slate-400" />
                        <span>{b.tokenReceipts?.length || 1} receipt(s)</span>
                      </div>
                    </td>

                    {/* Allocated Chassis (VIN) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {b.allocatedVin ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {b.allocatedVin}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyVin(e, b.allocatedVin)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
                            title="Copy VIN"
                          >
                            {copiedVin === b.allocatedVin ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : b.temporaryHoldUntil ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {b.temporaryVin || 'Hold Pending'}
                          </span>
                          <span className="text-[10px] text-amber-600 font-medium">
                            {holdExpired ? '(Hold Expired)' : '(48h Hold)'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 italic text-[11px]">Not allocated</span>
                          {canAllocateChassis && b.status !== BOOKING_STATUSES.CANCELLED && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAllocateChassis(b);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-[11px] hover:underline"
                            >
                              Allocate
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Est. Delivery */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {b.status === BOOKING_STATUSES.DELIVERED ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered on {b.actualDeliveryDate || b.tentativeDeliveryDate}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-900">
                            {b.tentativeDeliveryDate}
                          </div>
                          {deliveryTiming.flag === 'OVERDUE' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Overdue by {deliveryTiming.days}d
                            </span>
                          )}
                          {deliveryTiming.flag === 'DUE_IN_2_DAYS' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-2.5 h-2.5" />
                              Due in 2 days
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td
                      className="py-3.5 px-3 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(b)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === b.id ? null : b.id)
                          }
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === b.id && (
                          <div
                            onMouseLeave={() => setActiveMenuId(null)}
                            className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left text-xs animate-in fade-in duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onViewDetails(b);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Booking Details</span>
                            </button>

                            {b.status !== BOOKING_STATUSES.DELIVERED &&
                              b.status !== BOOKING_STATUSES.CANCELLED && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRecordToken(b);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Record Token Payment</span>
                                </button>
                              )}

                            {onEditBooking && b.status !== BOOKING_STATUSES.DELIVERED && (
                              <button
                                type="button"
                                onClick={() => {
                                  onEditBooking(b);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit Booking</span>
                              </button>
                            )}

                            {canAllocateChassis &&
                              b.status !== BOOKING_STATUSES.DELIVERED &&
                              b.status !== BOOKING_STATUSES.CANCELLED && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onAllocateChassis(b);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>
                                    {b.allocatedVin ? 'Change / Reallocate VIN' : 'Allocate Chassis'}
                                  </span>
                                </button>
                              )}

                            {b.status !== BOOKING_STATUSES.DELIVERED &&
                              b.status !== BOOKING_STATUSES.CANCELLED && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRescheduleDelivery(b);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Reschedule Delivery</span>
                                </button>
                              )}

                            {b.status === BOOKING_STATUSES.PENDING && (
                              <button
                                type="button"
                                onClick={() => {
                                  onConfirmBooking(b);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-50 text-emerald-700 font-medium"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Confirm Booking</span>
                              </button>
                            )}

                            {b.status === BOOKING_STATUSES.CONFIRMED && (
                              <button
                                type="button"
                                onClick={() => {
                                  onDeliverBooking(b);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 text-blue-700 font-medium"
                              >
                                <Truck className="w-3.5 h-3.5 text-blue-600" />
                                <span>Mark as Delivered</span>
                              </button>
                            )}

                            {canCancel &&
                              b.status !== BOOKING_STATUSES.DELIVERED &&
                              b.status !== BOOKING_STATUSES.CANCELLED && (
                                <div className="border-t border-slate-100 mt-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onCancelBooking(b);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-medium"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel Reservation</span>
                                  </button>
                                </div>
                              )}

                            {canDelete && onDeleteBooking && b.status !== BOOKING_STATUSES.DELIVERED && (
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteBooking(b);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-700 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Booking</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

