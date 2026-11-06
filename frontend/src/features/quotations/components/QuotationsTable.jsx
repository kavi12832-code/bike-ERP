import React, { useState } from 'react';
import { Eye, Edit, MoreVertical, MessageSquare, BookmarkCheck, RotateCcw, Ban, FileDown, Info } from 'lucide-react';
import { STATUS_CONFIG, QUOTATION_STATUSES } from '../../../quotations/config';
import { calculateQuotationTotals } from '../../../quotations/math';
import { getExpiryStatus, canEditQuotation, canConvertQuotation } from '../../../quotations/engine';
import { formatPhone, formatMoney } from '../../../lib/format';

export function QuotationsTable({
  quotations = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onViewQuotation,
  onEditQuotation,
  onConvertToBooking,
  onSendWhatsApp,
  onRenewQuotation,
  onCancelQuotation,
  onDownloadPdf,
  canViewPhone = true,
  currentUser = {},
  sortKey = 'createdAt',
  sortOrder = 'desc',
  onSort,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [hoveredNetId, setHoveredNetId] = useState(null);

  const allSelected = quotations.length > 0 && selectedIds.length === quotations.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < quotations.length;

  const renderSortIndicator = (key) => {
    if (sortKey !== key) return null;
    return <span className="ml-1 text-[10px]">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/10 dark:bg-white/5 border-b border-white/20 text-[11px] font-bold text-text-glass-muted dark:text-slate-300 uppercase tracking-wider select-none">
              <th className="py-3 px-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select All Quotations"
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-800"
                onClick={() => onSort('quotationNumber')}
              >
                Quotation # {renderSortIndicator('quotationNumber')}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-800"
                onClick={() => onSort('customerName')}
              >
                Customer {renderSortIndicator('customerName')}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-800"
                onClick={() => onSort('modelName')}
              >
                Bike Model & Variant {renderSortIndicator('modelName')}
              </th>
              <th className="py-3 px-3">Colour</th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                onClick={() => onSort('amount')}
              >
                Amount {renderSortIndicator('amount')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                onClick={() => onSort('discount')}
              >
                Discount {renderSortIndicator('discount')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-800"
                onClick={() => onSort('netAmount')}
              >
                Net Amount {renderSortIndicator('netAmount')}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-800"
                onClick={() => onSort('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-800"
                onClick={() => onSort('validUntil')}
              >
                Valid Until {renderSortIndicator('validUntil')}
              </th>
              <th className="py-3 px-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/15 text-xs text-text-glass-main dark:text-white">
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-text-glass-muted dark:text-slate-400">
                  <p className="text-sm font-semibold text-text-glass-main dark:text-white">No quotations found</p>
                  <p className="text-xs text-text-glass-muted dark:text-slate-300 mt-1">Try adjusting your filters, search term or date range.</p>
                </td>
              </tr>
            ) : (
              quotations.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                const totals = calculateQuotationTotals(q);
                const expiry = getExpiryStatus(q);
                const editCheck = canEditQuotation(q, currentUser);
                const convertCheck = canConvertQuotation(q);
                const statusCfg = STATUS_CONFIG[q.status] || STATUS_CONFIG[QUOTATION_STATUSES.DRAFT];

                return (
                  <tr
                    key={q.id}
                    className={`hover:bg-white/20 dark:hover:bg-white/10 transition-colors ${
                      isSelected ? 'bg-white/25 dark:bg-white/15' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(q.id)}
                        aria-label={`Select quotation ${q.quotationNumber}`}
                        className="w-4 h-4 text-blue-600 rounded border-white/40 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Quotation Number */}
                    <td className="py-3 px-3 font-semibold">
                      <button
                        onClick={() => onViewQuotation(q)}
                        className="text-blue-700 dark:text-cyan-400 hover:text-blue-900 dark:hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono text-[12px]"
                      >
                        {q.quotationNumber}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-text-glass-main dark:text-white">{q.customerName}</div>
                      <div className="text-[11px] text-text-glass-muted dark:text-slate-300 font-mono">
                        {formatPhone(q.phone, { mask: !canViewPhone })}
                      </div>
                    </td>

                    {/* Bike Model & Variant */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-text-glass-main dark:text-white">{q.modelName}</div>
                      <div className="text-[11px] text-text-glass-muted dark:text-slate-300">{q.variantName || 'Standard Variant'}</div>
                    </td>

                    {/* Colour */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                          style={{ backgroundColor: q.colorHex || '#94a3b8' }}
                        />
                        <span className="text-text-glass-main dark:text-white font-medium truncate max-w-[110px]">{q.colorName || 'Default'}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-medium text-text-glass-main dark:text-white tabular-nums">
                      ₹ {totals.amountRupees.toLocaleString('en-IN')}
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {totals.discountRupees > 0 ? (
                        <span>₹ {totals.discountRupees.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-text-glass-muted/60 dark:text-slate-500">—</span>
                      )}
                    </td>

                    {/* Net Amount with Hover Breakdown Tooltip */}
                    <td className="py-3 px-3 text-right relative">
                      <div
                        onMouseEnter={() => setHoveredNetId(q.id)}
                        onMouseLeave={() => setHoveredNetId(null)}
                        className="inline-flex items-center gap-1 justify-end font-bold text-text-glass-main dark:text-white tabular-nums cursor-help"
                      >
                        <span>₹ {totals.netAmountRupees.toLocaleString('en-IN')}</span>
                        <Info className="w-3 h-3 text-text-glass-muted dark:text-slate-400" />
                      </div>

                      {/* Tooltip */}
                      {hoveredNetId === q.id && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 text-white rounded-lg shadow-xl p-3 z-50 text-[11px] text-left space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1 text-blue-300">
                            On-Road Price Breakdown
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ex-Showroom:</span>
                            <span>₹ {totals.breakdown.exShowroomRupees.toLocaleString('en-IN')}</span>
                          </div>
                          {totals.breakdown.accessoriesRupees > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Accessories:</span>
                              <span>₹ {totals.breakdown.accessoriesRupees.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {totals.discountRupees > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Less: Discount:</span>
                              <span>- ₹ {totals.discountRupees.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-400">
                            <span>Road Tax (LTT):</span>
                            <span>₹ {totals.breakdown.roadTaxRupees.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>RTO & Registration:</span>
                            <span>₹ {totals.breakdown.rtoFeeRupees.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Insurance (IRDAI):</span>
                            <span>₹ {totals.breakdown.insuranceRupees.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Showroom Handling:</span>
                            <span>₹ {totals.breakdown.handlingRupees.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-700 text-xs">
                            <span>Net On-Road Price:</span>
                            <span>₹ {totals.netAmountRupees.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: statusCfg.dotColor }}
                        />
                        {q.status}
                      </span>
                    </td>

                    {/* Valid Until */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-text-glass-main dark:text-white">{expiry.formattedDate}</div>
                      {expiry.badgeText && (
                        <div className="mt-0.5">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] ${expiry.badgeClass}`}>
                            {expiry.badgeText}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 relative">
                        {/* View Button */}
                        <button
                          onClick={() => onViewQuotation(q)}
                          title="View Quotation"
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => editCheck.canEdit && onEditQuotation(q)}
                          disabled={!editCheck.canEdit}
                          title={editCheck.canEdit ? 'Edit Quotation' : editCheck.reason}
                          className={`p-1 rounded transition-colors ${
                            editCheck.canEdit
                              ? 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* "⋯" Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === q.id ? null : q.id)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === q.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSendWhatsApp(q);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Share via WhatsApp</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (convertCheck.canConvert) onConvertToBooking(q);
                                  }}
                                  disabled={!convertCheck.canConvert}
                                  title={convertCheck.reason || 'Convert to Booking'}
                                  className={`w-full px-3 py-1.5 text-xs flex items-center gap-2 ${
                                    convertCheck.canConvert
                                      ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                                      : 'text-slate-300 cursor-not-allowed'
                                  }`}
                                >
                                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Convert to Booking</span>
                                </button>

                                {q.status === QUOTATION_STATUSES.EXPIRED && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onRenewQuotation(q);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Renew Quotation</span>
                                  </button>
                                )}

                                {q.status !== QUOTATION_STATUSES.CANCELLED &&
                                  q.status !== QUOTATION_STATUSES.CONVERTED && (
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onCancelQuotation(q);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Cancel Quotation</span>
                                    </button>
                                  )}

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDownloadPdf(q);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 border-t border-slate-100"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Download PDF</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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

