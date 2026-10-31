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
        <div className="bg-navy-950 text-white rounded-lg p-3 text-xs shadow-dialog border border-white/10 z-50 min-w-[180px]">
          <div className="font-bold text-blue-200 border-b border-white/20 pb-1 mb-2">
            {data.label} ({data.date})
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-blue-300">New Bookings:</span>
              <span className="font-bold text-white tabular-nums">{data.bookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-rose-300">Cancellations:</span>
              <span className="font-bold text-white tabular-nums">{data.cancellations}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/10">
              <span className="text-slate-300 font-medium">Net Booking Delta:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
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
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <span>Customer Booking Trends</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {netBookings} Net
            </span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {totalBookings} Total Bookings vs {totalCancellations} Cancellations
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg border border-border bg-surface-subtle text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors self-start sm:self-auto"
          title={showTable ? 'Switch to Line Chart' : 'Switch to Table View'}
          aria-label={showTable ? 'Switch to Line Chart' : 'Switch to Table View'}
        >
          {showTable ? <TrendingUp className="w-4 h-4 text-primary" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      {/* Line Chart or Fallback Table */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="w-full h-64 mt-2" aria-label="Customer Booking vs Cancellation Trends Line Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                allowDecimals={false}
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
              <Line
                name="New Bookings"
                type="monotone"
                dataKey="bookings"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563eb' }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="Cancellations"
                type="monotone"
                dataKey="cancellations"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#ef4444' }}
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

