import React from 'react';
import { Calendar, CheckCircle2, Clock, Truck } from 'lucide-react';
import { BOOKING_STATUSES } from '../../../bookings/config';

export function BookingsKpis({ kpis, activeTab, onSelectTab }) {
  const cards = [
    {
      id: 'total',
      tabTarget: 'ALL',
      title: 'Total Reservations',
      value: kpis?.totalCount ?? 0,
      subtext: 'Across all stages & branches',
      icon: Calendar,
      bgClass: 'bg-blue-50/80 border-blue-200/80 hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-700',
      activeRing: activeTab === 'ALL' ? 'ring-2 ring-blue-500 shadow-md' : '',
    },
    {
      id: 'confirmed',
      tabTarget: BOOKING_STATUSES.CONFIRMED,
      title: 'Confirmed Bookings',
      value: kpis?.confirmedCount ?? 0,
      subtext: `${kpis?.confirmedPercent ?? 0}% ready for VIN allocation`,
      icon: CheckCircle2,
      bgClass: 'bg-emerald-50/80 border-emerald-200/80 hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-700',
      activeRing: activeTab === BOOKING_STATUSES.CONFIRMED ? 'ring-2 ring-emerald-500 shadow-md' : '',
    },
    {
      id: 'pending',
      tabTarget: BOOKING_STATUSES.PENDING,
      title: 'Pending',
      value: kpis?.pendingCount ?? 0,
      subtext: `${kpis?.pendingPercent ?? 0}% awaiting token or verification`,
      icon: Clock,
      bgClass: 'bg-purple-50/80 border-purple-200/80 hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-700',
      activeRing: activeTab === BOOKING_STATUSES.PENDING ? 'ring-2 ring-purple-500 shadow-md' : '',
    },
    {
      id: 'delivered',
      tabTarget: BOOKING_STATUSES.DELIVERED,
      title: 'Delivered Vehicles',
      value: kpis?.deliveredCount ?? 0,
      subtext: `${kpis?.deliveredPercent ?? 0}% handovers fulfilled`,
      icon: Truck,
      bgClass: 'bg-amber-50/80 border-amber-200/80 hover:border-amber-400',
      iconBg: 'bg-amber-100 text-amber-700',
      activeRing: activeTab === BOOKING_STATUSES.DELIVERED ? 'ring-2 ring-amber-500 shadow-md' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectTab(c.tabTarget)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer ${c.bgClass} ${c.activeRing}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg ${c.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {c.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">{c.subtext}</p>
          </button>
        );
      })}
    </div>
  );
}

