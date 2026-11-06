import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowUpRight, HelpCircle } from 'lucide-react';

export function TopPerformersCard({ performersData, hasTeamPermission = true }) {
  const navigate = useNavigate();
  if (!hasTeamPermission) return null;

  const { performers = [], metricTitle, metricDescription } = performersData;

  return (
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-text-glass-main">Top Performers</h2>
            <div className="relative group cursor-help" title={metricDescription}>
              <HelpCircle className="w-3.5 h-3.5 text-text-glass-muted hover:text-text-glass-main" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 bg-slate-900 text-white text-[11px] rounded p-2 shadow-xl z-50 pointer-events-none">
                {metricDescription}
              </div>
            </div>
          </div>
          <p className="text-xs text-text-glass-muted mt-0.5 font-medium">
            Ranked by <strong className="text-blue-700 dark:text-cyan-400">{metricTitle}</strong> in range
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/hr')}
          className="text-xs font-semibold text-blue-700 dark:text-cyan-400 hover:text-blue-900 dark:hover:text-cyan-200 flex items-center gap-1 group cursor-pointer"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Performers List */}
      <div className="space-y-3 my-2">
        {performers.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-glass-muted">
            No active staff performance records in selected range.
          </div>
        ) : (
          performers.map((person) => (
            <div
              key={person.id}
              onClick={() => navigate('/admin/hr')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/15 hover:bg-white/35 dark:hover:bg-white/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Medal & Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500/15 dark:bg-cyan-500/20 border border-blue-400/30 dark:border-cyan-400/40 text-blue-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">
                    {person.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-sm leading-none" title={`Rank #${person.rank}`}>
                    {person.medal}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-glass-main group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors truncate">
                    {person.name}
                  </div>
                  <div className="text-[11px] text-text-glass-muted truncate font-medium">
                    {person.role} • {person.department}
                  </div>
                </div>
              </div>

              {/* Amount & Trend Chip */}
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {person.formattedAmount}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-text-glass-muted font-medium">
                    {person.achievementPct}% target
                  </span>
                  {person.changePct != null && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        person.changePct >= 0
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30'
                          : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-400/30'
                      }`}
                    >
                      {person.changePct >= 0 ? '↑' : '↓'}
                      {Math.abs(person.changePct)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
        <span>Includes Sales & Service Staff</span>
        <span className="font-medium text-primary">Live HR Benchmark</span>
      </div>
    </div>
  );
}

export default TopPerformersCard;

