import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatIndianCompact } from '../../../dashboard/selectors/dateUtils';
import { SHOW_DASHBOARD_CHARTS } from '../../../dashboard/config';
import { Table, LineChart as ChartIcon } from 'lucide-react';

export function ShowroomRevenueChart({
  revenueData,
  filterTab,
  onTabChange,
}) {
  const [showTable, setShowTable] = useState(!SHOW_DASHBOARD_CHARTS);
  const { points = [], formattedTotalRevenue, compactTotalRevenue } = revenueData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card !p-3 !rounded-2xl border border-white/40 shadow-2xl text-xs z-50 min-w-[210px] text-text-glass-main">
          <div className="font-bold text-blue-900 border-b border-white/30 pb-1 mb-2">
            {data.label} ({data.date})
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-text-glass-muted">Net Revenue (Excl. GST):</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                ₹ {data.revenueRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-text-glass-muted pt-1 border-t border-white/20">
              <span>Vehicle Sales:</span>
              <span className="tabular-nums font-medium text-text-glass-main">
                ₹ {data.vehicleRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-text-glass-muted">
              <span>Service Labor & Repairs:</span>
              <span className="tabular-nums font-medium text-text-glass-main">
                ₹ {data.serviceRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-text-glass-muted">
              <span>Counter Parts:</span>
              <span className="tabular-nums font-medium text-text-glass-main">
                ₹ {data.partsRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-blue-800 pt-1">
              <span>Invoices Posted:</span>
              <span className="tabular-nums font-bold">{data.invoicesCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header with Title, Period Tabs & Table Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-text-glass-main flex items-center gap-2">
            <span>Showroom Revenue Trajectory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 dark:bg-cyan-500/25 border border-blue-400/30 dark:border-cyan-400/40 text-blue-900 dark:text-cyan-300">
              Excl. GST
            </span>
          </h2>
          <p className="text-xs text-text-glass-muted mt-0.5 font-medium">
            Total Net Invoiced: <strong className="text-text-glass-main">{formattedTotalRevenue}</strong> ({compactTotalRevenue})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs: 7 Days, 30 Days, This Month */}
          <div className="flex items-center p-1 rounded-full bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-xs font-medium">
            <button
              onClick={() => onTabChange('7_days')}
              className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${filterTab === '7_days'
                  ? 'bg-[#0b1220] dark:bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-text-glass-muted hover:text-text-glass-main'
                }`}
            >
              7 Days
            </button>
            <button
              onClick={() => onTabChange('30_days')}
              className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${filterTab === '30_days'
                  ? 'bg-[#0b1220] dark:bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-text-glass-muted hover:text-text-glass-main'
                }`}
            >
              30 Days
            </button>
            <button
              onClick={() => onTabChange('this_month')}
              className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${filterTab === 'this_month'
                  ? 'bg-[#0b1220] dark:bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-text-glass-muted hover:text-text-glass-main'
                }`}
            >
              This Month
            </button>
          </div>

          {/* Toggle Table */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="p-2 rounded-full border border-white/30 bg-white/20 text-text-glass-muted hover:text-text-glass-main hover:bg-white/30 transition-colors cursor-pointer"
            title={showTable ? 'Switch to Area Chart' : 'Switch to Table View'}
            aria-label={showTable ? 'Switch to Area Chart' : 'Switch to Table View'}
          >
            {showTable ? <ChartIcon className="w-4 h-4 text-blue-600" /> : <Table className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Area Chart or Fallback Table */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="w-full h-64 mt-2" aria-label="Showroom Revenue Area Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2bb8e0" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2bb8e0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.25)" opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <YAxis
                tickFormatter={(val) => formatIndianCompact(val)}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenueRupees"
                name="Net Invoiced Revenue"
                stroke="#2bb8e0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Table Fallback */
        <div className="overflow-x-auto mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left text-text-main">
            <thead className="text-[11px] uppercase tracking-wider bg-surface-subtle text-text-muted border-b border-border sticky top-0">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Net Revenue (₹)</th>
                <th className="px-3 py-2 text-right">Vehicles</th>
                <th className="px-3 py-2 text-right">Service</th>
                <th className="px-3 py-2 text-right">Parts</th>
                <th className="px-3 py-2 text-center">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {points.map((row) => (
                <tr key={row.date} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2 font-medium">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-primary">
                    ₹ {row.revenueRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">
                    ₹ {row.vehicleRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">
                    ₹ {row.serviceRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">
                    ₹ {row.partsRupees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums font-semibold">
                    {row.invoicesCount}
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

export default ShowroomRevenueChart;

