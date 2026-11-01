import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
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
        <div className="bg-navy-950 text-white rounded-lg p-3 text-xs shadow-dialog border border-white/10 z-50 min-w-[200px]">
          <div className="font-bold text-blue-200 border-b border-white/20 pb-1 mb-2">
            {data.fullDateStr || label}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Sales Invoiced:</span>
              <span className="font-semibold text-emerald-400 tabular-nums">
                ₹ {data.salesRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Target Benchmark:</span>
              <span className="font-semibold text-blue-300 tabular-nums">
                ₹ {data.targetRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/10">
              <span className="text-slate-300">Achievement:</span>
              <span className="font-bold text-white tabular-nums">{data.achievementPct}%</span>
            </div>
            {data.changePct != null && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px]">vs Prev Period:</span>
                <span
                  className={`text-[10px] font-bold ${
                    data.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
      {/* Header with Title, Period Dropdown & Table Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <span>Sales Performance</span>
            {changePct != null && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  changePct >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
                title="Versus previous comparable period"
              >
                {changePct >= 0 ? '↑' : '↓'}
                {Math.abs(changePct)}% vs prev period
              </span>
            )}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Total {formattedTotalSales} invoiced of {formattedTotalTarget} target ({achievementPct}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-xs bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-text-main font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            aria-label="Select sales performance aggregation period"
          >
            <option value="this_week">This Week (Mon – Sun)</option>
            <option value="this_month">This Month (By Week)</option>
            <option value="last_month">Last Month (By Week)</option>
          </select>

          {/* Table / Chart Toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="p-1.5 rounded-lg border border-border bg-surface-subtle text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors"
            title={showTable ? 'Switch to Bar Chart' : 'Switch to Table View'}
            aria-label={showTable ? 'Switch to Bar Chart' : 'Switch to Table View'}
          >
            {showTable ? <BarChart2 className="w-4 h-4 text-primary" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart View or Accessible Fallback Table */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="w-full h-64 mt-2" aria-label="Sales Performance Composed Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bars} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tickFormatter={(val) => formatIndianCompact(val)}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                name="Sales Invoiced"
                dataKey="salesRupees"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
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

