import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowUpRight, HelpCircle } from 'lucide-react';

export function TopPerformersCard({ performersData, hasTeamPermission = true }) {
  const navigate = useNavigate();
  if (!hasTeamPermission) return null;

  const { performers = [], metricTitle, metricDescription } = performersData;

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-text-main">Top Performers</h2>
            <div className="relative group cursor-help" title={metricDescription}>
              <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-main" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 bg-navy-950 text-white text-[11px] rounded p-2 shadow-dialog z-50 pointer-events-none">
                {metricDescription}
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Ranked by <strong className="text-primary">{metricTitle}</strong> in range
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/hr')}
          className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Performers List */}
      <div className="space-y-3 my-2">
        {performers.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">
            No active staff performance records in selected range.
          </div>
        ) : (
          performers.map((person) => (
            <div
              key={person.id}
              onClick={() => navigate('/admin/hr')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/70 border border-border/50 hover:bg-surface-subtle hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Medal & Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {person.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-sm leading-none" title={`Rank #${person.rank}`}>
                    {person.medal}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-main group-hover:text-primary transition-colors truncate">
                    {person.name}
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
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
                  <span className="text-[10px] text-text-muted">
                    {person.achievementPct}% target
                  </span>
                  {person.changePct != null && (
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        person.changePct >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
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

