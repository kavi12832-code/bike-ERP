import React from 'react';
import {
  X,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  BookmarkCheck,
  MessageSquare,
  FileDown,
  RotateCcw,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { STATUS_CONFIG, QUOTATION_STATUSES } from '../../../quotations/config';
import { calculateQuotationTotals } from '../../../quotations/math';
import { getExpiryStatus, canConvertQuotation } from '../../../quotations/engine';
import { formatPhone } from '../../../lib/format';
import { toast } from 'sonner';

export function QuotationDetailDrawer({
  isOpen,
  onClose,
  quotation,
  onConvertToBooking,
  onSendWhatsApp,
  onRenewQuotation,
  onDownloadPdf,
  onApproveDiscount,
  canViewPhone = true,
  currentUser = {},
}) {
  if (!isOpen || !quotation) return null;

  const totals = calculateQuotationTotals(quotation);
  const expiry = getExpiryStatus(quotation);
  const convertCheck = canConvertQuotation(quotation);
  const statusCfg = STATUS_CONFIG[quotation.status] || STATUS_CONFIG[QUOTATION_STATUSES.DRAFT];

  const copyQuotationNumber = () => {
    navigator.clipboard.writeText(quotation.quotationNumber);
    toast.success(`Copied ${quotation.quotationNumber} to clipboard`);
  };

  const isPendingApproval = quotation.status === QUOTATION_STATUSES.PENDING_APPROVAL;
  const canDecideApproval =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Branch Manager' ||
    currentUser?.role === 'Sales Manager';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-blue-700">
                  {quotation.quotationNumber}
                </span>
                <button
                  onClick={copyQuotationNumber}
                  title="Copy Quotation ID"
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusCfg.dotColor }}
                  />
                  {quotation.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} by {quotation.createdBy || 'Staff'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5 text-xs text-slate-700">
            {/* Validity Banner */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                expiry.isExpired
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : expiry.isExpiringSoon
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-semibold">Valid Until: </span>
                  <span>{expiry.formattedDate}</span>
                </div>
              </div>
              {expiry.badgeText && (
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${expiry.badgeClass}`}>
                  {expiry.badgeText}
                </span>
              )}
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-3.5 space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-semibold text-slate-900">{quotation.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatPhone(quotation.phone, { mask: !canViewPhone })}
                  </span>
                </div>
                {quotation.email && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="text-slate-700">{quotation.email}</span>
                  </div>
                )}
                <div className="col-span-2 flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{quotation.branchName || 'Bangalore Central Flagship'}</span>
                </div>
              </div>
            </div>

            {/* Bike Specifications */}
            <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-3.5 space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Vehicle Specifications
              </h3>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{quotation.modelName}</div>
                  <div className="text-slate-600">{quotation.variantName}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: quotation.colorHex || '#94a3b8' }}
                  />
                  <span className="font-medium text-[11px] text-slate-700">{quotation.colorName}</span>
                </div>
              </div>
            </div>

            {/* On-Road Price Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                On-Road Mathematical Breakdown
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Ex-Showroom:</span>
                  <span className="font-medium">₹ {totals.breakdown.exShowroomRupees.toLocaleString('en-IN')}</span>
                </div>
                {totals.breakdown.accessoriesRupees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Selected Accessories:</span>
                    <span className="font-medium">₹ {totals.breakdown.accessoriesRupees.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-slate-100 pt-1">
                  <span>Gross Quotation Amount:</span>
                  <span>₹ {totals.amountRupees.toLocaleString('en-IN')}</span>
                </div>
                {totals.discountRupees > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    <span>Discount / Scheme Allowance:</span>
                    <span>- ₹ {totals.discountRupees.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Statutory Taxes & RTO Levies
                </div>
                <div className="flex justify-between text-slate-500 pl-2">
                  <span>Road Tax (18% Karnataka LTT):</span>
                  <span>₹ {totals.breakdown.roadTaxRupees.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-2">
                  <span>RTO Registration, Smart Card & HSRP:</span>
                  <span>₹ {totals.breakdown.rtoFeeRupees.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-2">
                  <span>Mandatory 5-Yr Comprehensive IRDAI Insurance:</span>
                  <span>₹ {totals.breakdown.insuranceRupees.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-2">
                  <span>Showroom Logistics & Pre-Delivery Inspection:</span>
                  <span>₹ {totals.breakdown.handlingRupees.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                  <span>Net On-Road Price:</span>
                  <span className="text-blue-700">₹ {totals.netAmountRupees.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Dual Control Approval Gate Card */}
            {isPendingApproval && (
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Dual-Control Governance Gate</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {quotation.discountReason || 'Discount exceeds executive threshold. Requires manager authorization.'}
                </p>
                {quotation.approvalRequestId && (
                  <p className="text-[10px] font-mono text-amber-700">
                    Linked Approval Request: {quotation.approvalRequestId}
                  </p>
                )}
                {canDecideApproval && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onApproveDiscount && onApproveDiscount(quotation.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Authorize Discount
                    </button>
                    <a
                      href="/approvals"
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-900 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <span>Approvals Center</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Linked Booking Card if Converted */}
            {quotation.status === QUOTATION_STATUSES.CONVERTED && quotation.bookingId && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900">
                  <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="font-bold block">Converted to Customer Booking</span>
                    <span className="font-mono text-[11px] text-indigo-700">{quotation.bookingId}</span>
                  </div>
                </div>
                <a
                  href="/bookings"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  View Booking
                </a>
              </div>
            )}

            {/* Audit History Timeline */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Audit History
              </h3>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                {(quotation.history || []).map((h, i) => (
                  <div key={i} className="relative text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-blue-500 absolute -left-[17px] top-1" />
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                      <span className="font-semibold text-slate-700">{h.performedBy}</span>
                    </div>
                    <div className="font-medium text-slate-800">{h.action}</div>
                    {h.notes && <div className="text-slate-500 text-[10px] mt-0.5">{h.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 sticky bottom-0">
            <button
              onClick={() => onDownloadPdf(quotation)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-slate-500" />
              <span>Download PDF</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSendWhatsApp(quotation)}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              {convertCheck.canConvert && (
                <button
                  onClick={() => onConvertToBooking(quotation)}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Convert to Booking</span>
                </button>
              )}

              {quotation.status === QUOTATION_STATUSES.EXPIRED && (
                <button
                  onClick={() => onRenewQuotation(quotation)}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Renew</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

