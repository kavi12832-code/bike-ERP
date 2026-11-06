import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SHOW_DASHBOARD_CHARTS } from '../../../dashboard/config';
import { Table, PieChart as PieIcon, ExternalLink } from 'lucide-react';

export function LeadSourceDonutChart({ leadSourceData }) {
  const navigate = useNavigate();
  const [showTable, setShowTable] = useState(!SHOW_DASHBOARD_CHARTS);
  const { totalLeads = 0, segments = [] } = leadSourceData;

  const handleSegmentClick = (segment) => {
    if (segment && segment.source) {
      navigate(`/leads?source=${encodeURIComponent(segment.source)}`);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card !p-2.5 !rounded-2xl border border-white/40 shadow-2xl text-xs z-50 text-text-glass-main min-w-[160px]">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.source}</span>
          </div>
          <div className="mt-1 flex justify-between gap-4 text-text-glass-muted">
            <span>Leads:</span>
            <span className="font-bold text-text-glass-main tabular-nums">{data.count} ({data.percentage}%)</span>
          </div>
          <div className="text-[10px] text-blue-800 mt-1 flex items-center gap-1">
            <span>Click to filter leads</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-text-glass-main">Lead Source Distribution</h2>
          <p className="text-xs text-text-glass-muted mt-0.5">
            {totalLeads} total prospect inquiries in selected range
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-2 rounded-full border border-white/30 bg-white/20 text-text-glass-muted hover:text-text-glass-main hover:bg-white/30 transition-colors cursor-pointer"
          title={showTable ? 'Switch to Donut Chart' : 'Switch to Table View'}
          aria-label={showTable ? 'Switch to Donut Chart' : 'Switch to Table View'}
        >
          {showTable ? <PieIcon className="w-4 h-4 text-blue-600" /> : <Table className="w-4 h-4" />}
        </button>
      </div>

      {/* Donut Chart or Table View */}
      {!showTable && SHOW_DASHBOARD_CHARTS ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
          {/* Centered Donut */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                {totalLeads === 0 ? (
                  <Pie
                    data={[{ value: 1 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    fill="rgba(148, 163, 184, 0.2)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                ) : (
                  <Pie
                    data={segments}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    strokeLinecap="round"
                    onClick={(entry) => handleSegmentClick(entry)}
                    cursor="pointer"
                    animationDuration={600}
                  >
                    {segments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth={2}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Total leads in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-text-glass-main dark:text-white tabular-nums leading-none">
                {totalLeads}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-glass-muted dark:text-slate-300 mt-1">
                Leads
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 w-full space-y-2">
            {segments.map((seg) => (
              <div
                key={seg.source}
                onClick={() => handleSegmentClick(seg)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-xs group"
                title={`Filter Leads by ${seg.source}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-semibold text-text-main dark:text-slate-100 group-hover:text-primary dark:group-hover:text-cyan-300 transition-colors truncate">
                    {seg.source}
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-text-muted dark:text-slate-300 text-[11px] font-medium">{seg.count}</span>
                  <span className="font-bold text-text-main dark:text-white text-xs min-w-[32px] text-right">
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Accessible Table Fallback */
        <div className="overflow-x-auto my-2 max-h-56 overflow-y-auto">
          <table className="w-full text-xs text-left text-text-main">
            <thead className="text-[11px] uppercase tracking-wider bg-surface-subtle text-text-muted border-b border-border sticky top-0">
              <tr>
                <th className="px-3 py-2">Source Channel</th>
                <th className="px-3 py-2 text-right">Lead Count</th>
                <th className="px-3 py-2 text-right">Share %</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {segments.map((seg) => (
                <tr key={seg.source} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2 font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span>{seg.source}</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{seg.count}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-primary">
                    {seg.percentage}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleSegmentClick(seg)}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
        <span>Click slice or row to drill down</span>
        <span className="font-mono font-semibold">100% Total Share</span>
      </div>
    </div>
  );
}

export default LeadSourceDonutChart;

