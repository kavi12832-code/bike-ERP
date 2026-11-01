import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Truck,
  Compass,
  Wrench,
  PhoneCall,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export function UpcomingTasksCard({ tasks = [] }) {
  const navigate = useNavigate();

  const getModuleIcon = (module) => {
    switch (module) {
      case 'DELIVERY':
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      case 'TEST_RIDE':
        return <Compass className="w-3.5 h-3.5 text-amber-600" />;
      case 'SERVICE':
        return <Wrench className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CRM_FOLLOWUP':
        return <PhoneCall className="w-3.5 h-3.5 text-purple-600" />;
      case 'RECEIVABLES':
        return <FileText className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <span>Upcoming Tasks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted">
              {tasks.length} due
            </span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Assigned to you in current branch scope</p>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 group"
        >
          <span>View Calendar</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Task List (Top 3) */}
      <div className="space-y-2.5 my-2">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted border border-dashed border-border rounded-xl">
            No pending tasks due for you today.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(task.entityLink || '/tasks')}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-subtle/70 border border-border/50 hover:bg-surface-subtle hover:border-primary/30 transition-all cursor-pointer group"
            >
              {/* Date Badge: e.g. 31 OCT */}
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-surface border border-border shadow-2xs shrink-0 text-center">
                <span className="text-xs font-black text-text-main leading-tight">
                  {task.dateBadge.day}
                </span>
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                  {task.dateBadge.month}
                </span>
              </div>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-0.5">
                  {getModuleIcon(task.module)}
                  <span className="font-semibold uppercase tracking-wider">{task.module}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{task.time}</span>
                  </span>
                </div>
                <div className="text-xs font-semibold text-text-main group-hover:text-primary transition-colors truncate">
                  {task.title}
                </div>
              </div>

              {/* Priority Chip */}
              <div className="shrink-0">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    task.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
        <span>Click task to open execution desk</span>
        <span className="font-medium text-text-main">Tasks & Calendar</span>
      </div>
    </div>
  );
}

export default UpcomingTasksCard;

