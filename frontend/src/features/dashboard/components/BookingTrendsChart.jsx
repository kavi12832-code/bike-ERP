import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SHOW_DASHBOARD_CHARTS } from '../../../dashboard/config';
import { Table, TrendingUp } from 'lucide-react';

export function BookingTrendsChart({ bookingTrendsData }) {
  const [showTable, setShowTable] = useState(!SHOW_DASHBOARD_CHARTS);
  const { points = [], totalBookings = 0, totalCancellations = 0, netBookings = 0 } = bookingTrendsData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card !p-3 !rounded-2xl border border-white/40 shadow-2xl text-xs z-50 min-w-[180px] text-text-glass-main">
          <div className="font-bold text-blue-900 border-b border-white/30 pb-1 mb-2">
            {data.label} ({data.date})
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-text-glass-muted">New Bookings:</span>
              <span className="font-bold text-blue-700 tabular-nums">{data.bookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-glass-muted">Cancellations:</span>
              <span className="font-bold text-rose-700 tabular-nums">{data.cancellations}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/20">
              <span className="text-text-glass-muted font-medium">Net Booking Delta:</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {data.bookings - data.cancellations > 0 ? '+' : ''}
                {data.bookings - data.cancellations}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-text-glass-main flex items-center gap-2">
            <span>Customer Booking Trends</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30">
              {netBookings} Net
            </span>
          </h2>
          <p className="text-xs text-text-glass-muted mt-0.5 font-medium">
            {totalBookings} Total Bookings vs {totalCancellations} Cancellations
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-2 rounded-full border border-white/30 bg-white/20 text-text-glass-muted hover:text-text-glass-main hover:bg-white/30 transition-colors cursor-pointer self-start sm:self-auto"
          title={showTable ? 'Switch to Line Chart' : 'Switch to Table View'}
          aria-label={showTable ? 'Switch to Line Chart' : 'Switch to Table View'}
        >
          {showTable ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      {/* Line Chart or Fallback Table */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="w-full h-64 mt-2" aria-label="Customer Booking vs Cancellation Trends Line Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.25)" opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#94a3b8"
                fontSize={11}
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
              <Line
                name="New Bookings"
                type="monotone"
                dataKey="bookings"
                stroke="#2bb8e0"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#2bb8e0' }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="Cancellations"
                type="monotone"
                dataKey="cancellations"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#f43f5e' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Table Fallback */
        <div className="overflow-x-auto mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left text-text-main">
            <thead className="text-[11px] uppercase tracking-wider bg-surface-subtle text-text-muted border-b border-border sticky top-0">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Bookings</th>
                <th className="px-3 py-2 text-right">Cancellations</th>
                <th className="px-3 py-2 text-right">Net Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {points.map((row) => (
                <tr key={row.date} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2 font-medium">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-blue-600">
                    {row.bookings}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-rose-600">
                    {row.cancellations}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold">
                    {row.bookings - row.cancellations > 0 ? '+' : ''}
                    {row.bookings - row.cancellations}
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

export default BookingTrendsChart;

