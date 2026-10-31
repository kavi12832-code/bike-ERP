import React from 'react';
import { Clock } from 'lucide-react';
import { formatDate } from '../../lib/format';

/**
 * Enterprise Activity Timeline Component for records (Customers, Orders, Job Cards, Audit)
 */
export function Timeline({
  events = [], // Array of { id, title, description, timestamp, user, type, icon: Icon, badge }
  className = '',
}) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-text-muted">
        No recorded timeline events.
      </div>
    );
  }

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border ${className}`}>
      {events.map((evt, idx) => {
        const Icon = evt.icon || Clock;
        return (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface border-2 border-brand-primary flex items-center justify-center text-brand-primary shadow-xs">
              <Icon className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>

            <div className="bg-surface p-3.5 rounded-xl border border-border shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-main">
                  {evt.title}
                </span>
                <span className="text-[10px] text-text-muted font-medium">
                  {evt.timestamp ? formatDate(evt.timestamp, { formatStr: 'dd MMM yyyy, hh:mm a' }) : ''}
                </span>
              </div>

              {evt.description && (
                <p className="text-xs text-text-muted leading-relaxed">
                  {evt.description}
                </p>
              )}

              {evt.user && (
                <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1 font-medium">
                  <span>Action by:</span>
                  <span className="text-text-main font-semibold">{evt.user}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
