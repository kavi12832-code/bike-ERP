import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { CountUp } from '../../../components/ui/CountUp';
import { cardHoverProps } from '../../../lib/motion';

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
      {/* 1. Gross Sales Today (Glass Blue) - Finance Protected */}
      {hasFinancePermission && (
        <motion.div
          {...cardHoverProps}
          onClick={() => navigate('/billing')}
          className="glass-card glass-card-interactive !p-5 shadow-card hover:shadow-card-hover h-full min-h-[175px] cursor-pointer relative group flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/billing')}
          aria-label={`Gross Sales Today: ${grossSales.formattedAmount}, ${grossSales.subtext}`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-text-glass-main dark:text-white tracking-wider uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <span>Gross Sales Today</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-cyan-300 border border-blue-400/40 font-mono lowercase">
                  today
                </span>
              </span>
              <div className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/15 border border-white/50 dark:border-white/20 text-blue-700 dark:text-cyan-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main dark:text-white tabular-nums tracking-tight">
                <CountUp value={grossSales.formattedAmount} />
              </h3>
              {grossSales.deltaPercent != null && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center border ${grossSales.deltaPercent >= 0
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/40'
                      : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-400/40'
                    }`}
                  title="Versus yesterday"
                >
                  {grossSales.deltaPercent >= 0 ? '↑' : '↓'}
                  {Math.abs(grossSales.deltaPercent)}%
                </span>
              )}
            </div>

            <p className="text-xs text-text-glass-muted dark:text-slate-300 font-medium mt-1">{grossSales.subtext}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-cyan-400 group-hover:text-blue-900 dark:group-hover:text-cyan-200 flex items-center gap-1">
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
                      stroke="#2bb8e0"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 2. Invoices vs Target (Glass Green) */}
      <motion.div
        {...cardHoverProps}
        onClick={() => navigate('/billing')}
        className="glass-card glass-card-interactive !p-5 shadow-card hover:shadow-card-hover h-full min-h-[175px] cursor-pointer relative group flex flex-col justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/billing')}
        aria-label={`Invoices vs Target: ${invoicesVsTarget.percentage} percent, ${invoicesVsTarget.subtext}`}
      >
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-text-glass-main dark:text-white tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1.5">
              <span>Invoices vs Target</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 font-mono lowercase">
                today
              </span>
            </span>
            <div className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/15 border border-white/50 dark:border-white/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main dark:text-white tabular-nums tracking-tight">
              <CountUp value={`${invoicesVsTarget.percentage}%`} />
            </h3>
          </div>

          <p className="text-xs text-text-glass-muted dark:text-slate-300 font-medium mt-1">{invoicesVsTarget.subtext}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-200 flex items-center gap-1">
            <span>View detailed ledger</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>

          {/* SVG Progress Ring */}
          {SHOW_DASHBOARD_CHARTS && (
            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-200/50"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-600 dark:text-emerald-400"
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
      </motion.div>

      {/* 3. Service Bay Utilisation (Glass Amber/Orange) */}
      <motion.div
        {...cardHoverProps}
        onClick={() => navigate('/service/live-bays')}
        className="glass-card glass-card-interactive !p-5 shadow-card hover:shadow-card-hover h-full min-h-[175px] cursor-pointer relative group flex flex-col justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/service/live-bays')}
        aria-label={`Service Bay Utilisation: ${bayUtilisation.percentage} percent, ${bayUtilisation.subtext}`}
      >
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-text-glass-main dark:text-white tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1.5">
              <span>Service Bay Utilisation</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 font-mono lowercase">
                today
              </span>
            </span>
            <div className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/15 border border-white/50 dark:border-white/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main dark:text-white tabular-nums tracking-tight">
              <CountUp value={`${bayUtilisation.percentage}%`} />
            </h3>
          </div>

          <p className="text-xs text-text-glass-muted dark:text-slate-300 font-medium mt-1">{bayUtilisation.subtext}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 group-hover:text-amber-900 dark:group-hover:text-amber-200 flex items-center gap-1">
            <span>View workshop board</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>

          {/* Mini Hourly Bar Graphic */}
          {SHOW_DASHBOARD_CHARTS && bayUtilisation.hourlyBars && (
            <div className="w-20 h-6 flex items-end gap-0.5" title="Hourly bay utilization (9am - 6pm)">
              {bayUtilisation.hourlyBars.slice(0, 8).map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-t transition-all ${bar.isCurrent ? 'bg-amber-500' : 'bg-amber-400/60'
                    }`}
                  style={{ height: `${Math.max(15, bar.percentage)}%` }}
                  title={`${bar.label}: ${bar.percentage}%`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* 4. GST Output Today (Glass Purple) - Finance Protected */}
      {hasFinancePermission && (
        <motion.div
          {...cardHoverProps}
          onClick={() => navigate('/gst')}
          className="glass-card glass-card-interactive !p-5 shadow-card hover:shadow-card-hover h-full min-h-[175px] cursor-pointer relative group flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/gst')}
          aria-label={`GST Output Today: ${gstOutput.formattedAmount}, ${gstOutput.subtext}`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-text-glass-main dark:text-white tracking-wider uppercase mb-1">
              <span className="flex items-center gap-1.5">
                <span>GST Output Today</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-400/40 font-mono lowercase">
                  today
                </span>
              </span>
              <div
                className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/15 border border-white/50 dark:border-white/20 text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform relative cursor-pointer"
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
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main dark:text-white tabular-nums tracking-tight">
                <CountUp value={gstOutput.formattedAmount} />
              </h3>
            </div>

            <p className="text-xs text-text-glass-muted dark:text-slate-300 font-medium mt-1">{gstOutput.subtext}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between relative">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-purple-200 flex items-center gap-1">
              <span>View tax compliance</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>

            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-purple-500/20 text-purple-800 dark:text-purple-300 rounded-full border border-purple-400/40">
              ITC: {gstOutput.formattedItcCredited}
            </span>

            {/* Statutory CGST / SGST / IGST breakdown popup */}
            {showGstTooltip && (
              <div
                className="absolute bottom-full mb-2 right-0 glass-card !p-2.5 !rounded-2xl border border-white/40 shadow-2xl text-xs z-50 min-w-[180px] pointer-events-none text-text-glass-main"
                role="tooltip"
              >
                <div className="font-bold text-[11px] text-blue-900 border-b border-white/30 pb-1 mb-1.5">
                  Today's Tax Split (IST)
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-glass-muted">CGST (9%/14%):</span>
                    <span className="font-semibold tabular-nums text-text-glass-main">
                      ₹ {gstOutput.breakdown.cgstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-glass-muted">SGST (9%/14%):</span>
                    <span className="font-semibold tabular-nums text-text-glass-main">
                      ₹ {gstOutput.breakdown.sgstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-glass-muted">IGST (Inter-state):</span>
                    <span className="font-semibold tabular-nums text-text-glass-main">
                      ₹ {gstOutput.breakdown.igstRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DashboardKpiCards;

