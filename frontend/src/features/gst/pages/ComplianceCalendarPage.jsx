import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Scale, 
  Building2, 
  FileCheck, 
  Bell, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// STATUTORY_DEADLINES: loaded from the database (collection "gst.complianceCalendar.statutoryDeadlines")

export function ComplianceCalendarPage() {
  const [deadlines, setDeadlines] = useCollection('gst.complianceCalendar.statutoryDeadlines');
  const [filter, setFilter] = useState('ALL');

  const handleMarkCompleted = (id) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d));
    toast.success('Compliance requirement marked as filed and completed!');
  };

  const filtered = deadlines.filter(d => filter === 'ALL' || d.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Statutory &amp; Dealership Compliance Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking GSTR-1, GSTR-3B, TDS (7th), PF/ESI (15th), Advance Tax and RTO Trade Certificate renewal deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DUE_THIS_WEEK', 'UPCOMING', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                filter === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Deadlines' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Day Proactive Alert Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs text-amber-950 dark:text-amber-200">
            <span className="font-bold">Next Statutory Deadline: RTO Trade Certificate Renewal (Due 02 Nov 2026)</span>
            <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">Automated notification reminders are dispatched to CA and Accountant 3 days prior to due dates.</p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-800 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-1 rounded-md">
          Action Required
        </span>
      </div>

      {/* Deadlines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border transition space-y-3 bg-white dark:bg-slate-850 shadow-sm ${
              item.status === 'DUE_THIS_WEEK'
                ? 'border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {item.act}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.title}
                </h3>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                item.status === 'DUE_THIS_WEEK' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-blue-100 text-blue-800'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {item.notes}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span>Due Date: <strong className="font-mono text-slate-900 dark:text-white">{item.dueDate}</strong></span>
                <span className="block text-[10px] text-slate-400">{item.frequency}</span>
              </div>

              {item.status !== 'COMPLETED' ? (
                <button
                  onClick={() => handleMarkCompleted(item.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                >
                  Mark Filed
                </button>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Filed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComplianceCalendarPage;
