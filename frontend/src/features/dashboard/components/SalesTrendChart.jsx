import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function SalesTrendChart({ trendData = [], hourlyData = [] }) {
  const [viewMode, setViewMode] = useState('7DAYS'); // '7DAYS' or 'HOURLY'

  // Use dynamic hourly data computed from today's invoice timestamps up to current hour
  const displayHourlyData = hourlyData.length > 0 ? hourlyData : [
    { hour: '09 AM', revenue: 0, count: 0 },
    { hour: '10 AM', revenue: 0, count: 0 },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Showroom Revenue Trajectory</CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            {viewMode === '7DAYS'
              ? '7-Day Invoiced Sales Revenue (Derived from posted records)'
              : "Today's Invoiced Revenue by Hour (Up to current time)"}
          </p>
        </div>
        <div className="flex bg-white/20 border border-white/30 rounded-full p-1 text-xs">
          <button
            onClick={() => setViewMode('7DAYS')}
            className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${viewMode === '7DAYS' ? 'bg-slate-900 shadow-xs text-white font-semibold' : 'text-text-glass-muted hover:text-text-glass-main'
              }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setViewMode('HOURLY')}
            className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${viewMode === 'HOURLY' ? 'bg-slate-900 shadow-xs text-white font-semibold' : 'text-text-glass-muted hover:text-text-glass-main'
              }`}
          >
            Today Hourly
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[260px] pt-4">
        <ResponsiveContainer width="100%" height={260}>
          {viewMode === '7DAYS' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2bb8e0" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2bb8e0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.25)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(11, 27, 43, 0.55)' }} />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: 'rgba(11, 27, 43, 0.55)' }}
                tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 16,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#0b1b2b',
                  fontSize: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenueRupees"
                stroke="#2bb8e0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={displayHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.25)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'rgba(11, 27, 43, 0.55)' }} />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: 'rgba(11, 27, 43, 0.55)' }}
                tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Invoiced']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 16,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#0b1b2b',
                  fontSize: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
              />
              <Bar dataKey="revenue" fill="rgba(43, 184, 224, 0.65)" stroke="#2bb8e0" strokeWidth={1} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
