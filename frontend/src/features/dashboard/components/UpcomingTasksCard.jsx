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
    <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-text-glass-main flex items-center gap-2">
            <span>Upcoming Tasks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 dark:bg-white/10 text-text-glass-muted border border-white/25">
              {tasks.length} due
            </span>
          </h2>
          <p className="text-xs text-text-glass-muted mt-0.5">Assigned to you in current branch scope</p>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="text-xs font-semibold text-blue-700 dark:text-cyan-400 hover:text-blue-900 dark:hover:text-cyan-200 flex items-center gap-1 group cursor-pointer"
        >
          <span>View Calendar</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Task List (Top 3) */}
      <div className="space-y-2.5 my-2">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-glass-muted border border-dashed border-white/25 rounded-xl">
            No pending tasks due for you today.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(task.entityLink || '/tasks')}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/20 dark:bg-white/10 border border-white/25 dark:border-white/15 hover:bg-white/35 dark:hover:bg-white/20 transition-all cursor-pointer group"
            >
              {/* Date Badge: e.g. 31 OCT */}
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-white/60 dark:bg-white/15 border border-white/40 dark:border-white/20 shadow-2xs shrink-0 text-center">
                <span className="text-xs font-black text-text-glass-main leading-tight">
                  {task.dateBadge.day}
                </span>
                <span className="text-[9px] font-bold text-blue-700 dark:text-cyan-300 uppercase tracking-wider">
                  {task.dateBadge.month}
                </span>
              </div>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-text-glass-muted mb-0.5">
                  {getModuleIcon(task.module)}
                  <span className="font-semibold uppercase tracking-wider">{task.module}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{task.time}</span>
                  </span>
                </div>
                <div className="text-xs font-semibold text-text-glass-main group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors truncate">
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

