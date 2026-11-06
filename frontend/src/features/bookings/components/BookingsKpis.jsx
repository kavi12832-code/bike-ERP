import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Truck } from 'lucide-react';
import { BOOKING_STATUSES } from '../../../bookings/config';
import { CountUp } from '../../../components/ui/CountUp';
import { cardHoverProps } from '../../../lib/motion';

export function BookingsKpis({ kpis, activeTab, onSelectTab }) {
  const cards = [
    {
      id: 'total',
      tabTarget: 'ALL',
      title: 'Total Reservations',
      value: kpis?.totalCount ?? 0,
      subtext: 'Across all stages & branches',
      icon: Calendar,
      iconColor: 'text-blue-700',
      activeBorder: activeTab === 'ALL' ? 'border-blue-500 ring-2 ring-blue-400/40' : '',
    },
    {
      id: 'confirmed',
      tabTarget: BOOKING_STATUSES.CONFIRMED,
      title: 'Confirmed Bookings',
      value: kpis?.confirmedCount ?? 0,
      subtext: `${kpis?.confirmedPercent ?? 0}% ready for VIN allocation`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      activeBorder: activeTab === BOOKING_STATUSES.CONFIRMED ? 'border-emerald-500 ring-2 ring-emerald-400/40' : '',
    },
    {
      id: 'pending',
      tabTarget: BOOKING_STATUSES.PENDING,
      title: 'Pending',
      value: kpis?.pendingCount ?? 0,
      subtext: `${kpis?.pendingPercent ?? 0}% awaiting token or verification`,
      icon: Clock,
      iconColor: 'text-purple-700',
      activeBorder: activeTab === BOOKING_STATUSES.PENDING ? 'border-purple-500 ring-2 ring-purple-400/40' : '',
    },
    {
      id: 'delivered',
      tabTarget: BOOKING_STATUSES.DELIVERED,
      title: 'Delivered Vehicles',
      value: kpis?.deliveredCount ?? 0,
      subtext: `${kpis?.deliveredPercent ?? 0}% handovers fulfilled`,
      icon: Truck,
      iconColor: 'text-amber-700',
      activeBorder: activeTab === BOOKING_STATUSES.DELIVERED ? 'border-amber-500 ring-2 ring-amber-400/40' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <motion.button
            key={c.id}
            {...cardHoverProps}
            type="button"
            onClick={() => onSelectTab(c.tabTarget)}
            className={`w-full text-left glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all duration-200 cursor-pointer shadow-card hover:shadow-card-hover ${c.activeBorder}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-glass-main uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center shadow-xs ${c.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-text-glass-main tracking-tight tabular-nums">
                <CountUp value={c.value} />
              </span>
            </div>
            <p className="mt-1 text-xs text-text-glass-muted line-clamp-1">{c.subtext}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

