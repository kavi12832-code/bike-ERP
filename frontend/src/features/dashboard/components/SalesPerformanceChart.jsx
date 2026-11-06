import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatIndianCompact } from '../../../dashboard/selectors/dateUtils';
import { SHOW_DASHBOARD_CHARTS } from '../../../dashboard/config';
import { Table, BarChart2 } from 'lucide-react';

export function SalesPerformanceChart({
  performanceData,
  selectedPeriod,
  onPeriodChange,
}) {
  const [showTable, setShowTable] = useState(!SHOW_DASHBOARD_CHARTS);
  const { bars = [], formattedTotalSales, formattedTotalTarget, achievementPct, changePct } = performanceData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card !p-3 !rounded-2xl border border-white/40 shadow-2xl text-xs z-50 min-w-[200px] text-text-glass-main">
          <div className="font-bold text-blue-900 border-b border-white/30 pb-1 mb-2">
            {data.fullDateStr || label}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-text-glass-muted">Sales Invoiced:</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                ₹ {data.salesRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-glass-muted">Target Benchmark:</span>
              <span className="font-semibold text-blue-900 tabular-nums">
                ₹ {data.targetRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/20">
              <span className="text-text-glass-muted">Achievement:</span>
              <span className="font-bold text-text-glass-main tabular-nums">{data.achievementPct}%</span>
            </div>
            {data.changePct != null && (
              <div className="flex justify-between items-center">
                <span className="text-text-glass-muted text-[10px]">vs Prev Period:</span>
                <span
                  className={`text-[10px] font-bold ${data.changePct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                >
                  {data.changePct >= 0 ? '↑' : '↓'}
                  {Math.abs(data.changePct)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header with Title, Period Dropdown & Table Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-text-glass-main dark:text-white flex items-center gap-2">
            <span>Sales Performance</span>
            {changePct != null && (
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${changePct >= 0
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-400/40'
                  }`}
                title="Versus previous comparable period"
              >
                {changePct >= 0 ? '↑' : '↓'}
                {Math.abs(changePct)}% vs prev period
              </span>
            )}
          </h2>
          <p className="text-xs text-text-glass-muted dark:text-slate-300 mt-0.5 font-medium">
            Total {formattedTotalSales} invoiced of {formattedTotalTarget} target ({achievementPct}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-xs glass-pill bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 px-3 py-1.5 text-text-glass-main dark:text-white font-medium focus:ring-1 focus:ring-cyan-400 focus:outline-hidden cursor-pointer"
            aria-label="Select sales performance aggregation period"
          >
            <option value="this_week" className="bg-slate-900 text-white">This Week (Mon – Sun)</option>
            <option value="this_month" className="bg-slate-900 text-white">This Month (By Week)</option>
            <option value="last_month" className="bg-slate-900 text-white">Last Month (By Week)</option>
          </select>

          {/* Table / Chart Toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="p-2 rounded-full border border-white/30 bg-white/20 text-text-glass-muted hover:text-text-glass-main hover:bg-white/30 transition-colors cursor-pointer"
            title={showTable ? 'Switch to Bar Chart' : 'Switch to Table View'}
            aria-label={showTable ? 'Switch to Bar Chart' : 'Switch to Table View'}
          >
            {showTable ? <BarChart2 className="w-4 h-4 text-blue-600" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart View or Accessible Fallback Table */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="w-full h-64 mt-2" aria-label="Sales Performance Composed Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bars} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.25)" opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <YAxis
                tickFormatter={(val) => formatIndianCompact(val)}
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                formatter={(value) => (
                  <span className="text-text-glass-main dark:text-slate-200 font-semibold text-xs ml-1">
                    {value}
                  </span>
                )}
              />
              <Bar
                name="Sales Invoiced"
                dataKey="salesRupees"
                radius={[8, 8, 2, 2]}
                maxBarSize={38}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {bars.map((entry, index) => {
                  const isLatest = index === bars.length - 1;
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isLatest ? '#2bb8e0' : 'rgba(43, 184, 224, 0.45)'}
                      stroke={isLatest ? '#2bb8e0' : 'rgba(43, 184, 224, 0.75)'}
                      strokeWidth={1}
                    />
                  );
                })}
              </Bar>
              <Line
                name="Target Benchmark"
                type="monotone"
                dataKey="targetRupees"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Data Table Fallback */
        <div className="overflow-x-auto mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left text-text-main">
            <thead className="text-[11px] uppercase tracking-wider bg-surface-subtle text-text-muted border-b border-border sticky top-0">
              <tr>
                <th className="px-3 py-2">Interval</th>
                <th className="px-3 py-2 text-right">Sales Invoiced</th>
                <th className="px-3 py-2 text-right">Target</th>
                <th className="px-3 py-2 text-right">Achieved %</th>
                <th className="px-3 py-2 text-right">vs Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bars.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2 font-medium">{row.fullDateStr || row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-primary">
                    ₹ {row.salesRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">
                    ₹ {row.targetRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold">
                    {row.achievementPct}%
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.changePct != null ? (
                      <span className={row.changePct >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {row.changePct >= 0 ? '+' : ''}
                        {row.changePct}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SalesPerformanceChart;

