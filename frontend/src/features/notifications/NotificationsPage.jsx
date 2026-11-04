import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Wrench,
  Bike,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useCollection } from '../../hooks/useCollection';
export default function NotificationsPage() {
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'APPROVAL', 'STOCK', 'SLA'

  const [notifications, setNotifications] = useCollection('notifications.notifications.notifications');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('Notification feed cleared.');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Operational Notifications &amp; Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time feed of dual-control approval requests, critical parts shortages, and workshop bay SLA alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-1 text-slate-400" />
            Clear Feed
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        {['ALL', 'APPROVAL', 'STOCK', 'SLA'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              filter === f
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'ALL'
              ? 'All Notifications'
              : f === 'APPROVAL'
              ? 'Approvals Required'
              : f === 'STOCK'
              ? 'Low Stock Alerts'
              : 'Service SLA Risk'}
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs">
            No notifications in this category. All systems operating within normal parameters.
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all hover:shadow-md ${
                !item.read
                  ? 'border-l-4 border-l-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-0.5">
                    {item.type === 'APPROVAL' ? (
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                    ) : item.type === 'STOCK' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : item.type === 'SLA' ? (
                      <Clock className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Bike className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                      {item.time}
                    </span>
                  </div>
                </div>

                <Link to={item.link}>
                  <Button variant="outline" size="sm" className="text-xs shrink-0 w-full sm:w-auto">
                    {item.actionLabel}
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
