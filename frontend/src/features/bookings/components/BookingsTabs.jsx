import React from 'react';
import { BOOKING_STATUSES } from '../../../bookings/config';

export function BookingsTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { key: 'ALL', label: 'All Bookings', count: counts?.all ?? 0 },
    { key: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed', count: counts?.confirmed ?? 0 },
    { key: BOOKING_STATUSES.PENDING, label: 'Pending', count: counts?.pending ?? 0 },
    { key: BOOKING_STATUSES.DELIVERED, label: 'Delivered', count: counts?.delivered ?? 0 },
    { key: BOOKING_STATUSES.CANCELLED, label: 'Cancelled', count: counts?.cancelled ?? 0 },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
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

