import React from 'react';
import { motion } from 'framer-motion';
import { BOOKING_STATUSES } from '../../../bookings/config';
import { springTransition } from '../../../lib/motion';

export function BookingsTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { key: 'ALL', label: 'All Bookings', count: counts?.all ?? 0 },
    { key: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed', count: counts?.confirmed ?? 0 },
    { key: BOOKING_STATUSES.PENDING, label: 'Pending', count: counts?.pending ?? 0 },
    { key: BOOKING_STATUSES.DELIVERED, label: 'Delivered', count: counts?.delivered ?? 0 },
    { key: BOOKING_STATUSES.CANCELLED, label: 'Cancelled', count: counts?.cancelled ?? 0 },
  ];

  return (
    <div className="flex items-center overflow-x-auto no-scrollbar py-1">
      <nav className="p-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center gap-1 shadow-xs" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative whitespace-nowrap py-1.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer z-10 ${isActive
                  ? 'text-white'
                  : 'text-text-glass-main hover:text-black hover:bg-white/10'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bookingsActiveTab"
                  transition={springTransition}
                  className="absolute inset-0 bg-[#0b1220] rounded-full shadow-sm -z-10"
                />
              )}
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/30 text-text-glass-main'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

