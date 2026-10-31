import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FileCheck,
  Wrench,
  ReceiptIndianRupee,
  ArrowUpRight,
  Info,
  Clock,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { SHOW_DASHBOARD_CHARTS } from '../../../dashboard/config';

export function DashboardKpiCards({
  grossSales,
  invoicesVsTarget,
  bayUtilisation,
  gstOutput,
  hasFinancePermission = true,
}) {
  const navigate = useNavigate();
  const [showGstTooltip, setShowGstTooltip] = useState(false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Gross Sales Today (Pastel Blue) - Finance Protected */}
      {hasFinancePermission && (
        <div
          onClick={() => navigate('/billing')}
          className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative group flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/billing')}
          aria-label={`Gross Sales Today: ${grossSales.formattedAmount}, ${grossSales.subtext}`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 tracking-wider uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <span>Gross Sales Today</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-800 font-mono lowercase">
                  today
                </span>
              </span>
              <div className="p-1 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tabular-nums tracking-tight">
                {grossSales.formattedAmount}
              </h3>
              {grossSales.deltaPercent != null && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center ${
                    grossSales.deltaPercent >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                  title="Versus yesterday"
                >
                  {grossSales.deltaPercent >= 0 ? '↑' : '↓'}
                  {Math.abs(grossSales.deltaPercent)}%
                </span>
              )}
            </div>

            <p className="text-xs text-blue-700/80 font-medium mt-1">{grossSales.subtext}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/50 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-800 flex items-center gap-1">
              <span>View detailed ledger</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>

            {/* Sparkline past 7 days */}
            {SHOW_DASHBOARD_CHARTS && grossSales.sparkline && grossSales.sparkline.length > 0 && (
              <div className="w-20 h-7" title="7-day sales sparkline">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={grossSales.sparkline}>
                    <Line
                      type="monotone"
                      dataKey="amountRupees"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Invoices vs Target (Pastel Green) */}
      <div
        onClick={() => navigate('/billing')}
        className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative group flex flex-col justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/billing')}
        aria-label={`Invoices vs Target: ${invoicesVsTarget.percentage} percent, ${invoicesVsTarget.subtext}`}
      >
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1.5">
              <span>Invoices vs Target</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-800 font-mono lowercase">
                today
              </span>
            </span>
            <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tabular-nums tracking-tight">
              {invoicesVsTarget.percentage}%
            </h3>
          </div>

          <p className="text-xs text-emerald-700/80 font-medium mt-1">{invoicesVsTarget.subtext}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-200/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
            <span>View detailed ledger</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>

          {/* SVG Progress Ring */}
          {SHOW_DASHBOARD_CHARTS && (
            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-600"
                  strokeDasharray={`${Math.min(100, invoicesVsTarget.percentage)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 3. Service Bay Utilisation (Pastel Amber/Orange) */}
      <div
        onClick={() => navigate('/service/live-bays')}
        className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer relative group flex flex-col justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/service/live-bays')}
        aria-label={`Service Bay Utilisation: ${bayUtilisation.percentage} percent, ${bayUtilisation.subtext}`}
      >
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1.5">
              <span>Service Bay Utilisation</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-800 font-mono lowercase">
                today
              </span>
            </span>
            <div className="p-1 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tabular-nums tracking-tight">
              {bayUtilisation.percentage}%
            </h3>
          </div>

          <p className="text-xs text-amber-800/80 font-medium mt-1">{bayUtilisation.subtext}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-700 group-hover:text-amber-900 flex items-center gap-1">
            <span>View workshop board</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>

          {/* Mini Hourly Bar Graphic */}
          {SHOW_DASHBOARD_CHARTS && bayUtilisation.hourlyBars && (
            <div className="w-20 h-6 flex items-end gap-0.5" title="Hourly bay utilization (9am - 6pm)">
              {bayUtilisation.hourlyBars.slice(0, 8).map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-t transition-all ${
                    bar.isCurrent ? 'bg-amber-600' : 'bg-amber-300'
                  }`}
                  style={{ height: `${Math.max(15, bar.percentage)}%` }}
                  title={`${bar.label}: ${bar.percentage}%`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. GST Output Today (Pastel Purple) - Finance Protected */}
      {hasFinancePermission && (
        <div
          onClick={() => navigate('/gst')}
          className="bg-purple-50/70 border border-purple-200/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer relative group flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/gst')}
          aria-label={`GST Output Today: ${gstOutput.formattedAmount}, ${gstOutput.subtext}`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 tracking-wider uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <span>GST Output Today</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-800 font-mono lowercase">
                  today
                </span>
              </span>
              <div
                className="p-1 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors relative"
                onMouseEnter={() => setShowGstTooltip(true)}
                onMouseLeave={() => setShowGstTooltip(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGstTooltip(!showGstTooltip);
                }}
              >
                <ReceiptIndianRupee className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950 tabular-nums tracking-tight">
                {gstOutput.formattedAmount}
              </h3>
            </div>

            <p className="text-xs text-purple-800/80 font-medium mt-1">{gstOutput.subtext}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-200/50 flex items-center justify-between relative">
            <span className="text-[11px] font-semibold text-purple-700 group-hover:text-purple-900 flex items-center gap-1">
              <span>View tax compliance</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>

            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-purple-200/70 text-purple-900 rounded">
              ITC: {gstOutput.formattedItcCredited}
            </span>

            {/* Statutory CGST / SGST / IGST breakdown popup */}
            {showGstTooltip && (
              <div
                className="absolute bottom-full mb-2 right-0 bg-navy-950 text-white rounded-lg p-2.5 text-xs shadow-dialog z-50 min-w-[180px] pointer-events-none animate-in fade-in zoom-in-95"
                role="tooltip"
              >
                <div className="font-bold text-[11px] text-blue-200 border-b border-white/20 pb-1 mb-1.5">
                  Today's Tax Split (IST)
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-300">CGST (9%/14%):</span>
                    <span className="font-semibold tabular-nums">
                      ₹ {gstOutput.breakdown.cgstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">SGST (9%/14%):</span>
                    <span className="font-semibold tabular-nums">
                      ₹ {gstOutput.breakdown.sgstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">IGST (Inter-state):</span>
                    <span className="font-semibold tabular-nums">
                      ₹ {gstOutput.breakdown.igstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardKpiCards;

