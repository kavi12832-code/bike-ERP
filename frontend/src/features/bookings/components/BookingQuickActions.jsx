import React from 'react';
import { CalendarPlus, Warehouse, FileSpreadsheet, Truck } from 'lucide-react';

export function BookingQuickActions({
  onCreateBooking,
  onCheckAvailability,
  onViewReports,
  onOpenDeliveryDesk,
}) {
  const actions = [
    {
      id: 'create',
      label: 'Create Booking',
      icon: CalendarPlus,
      onClick: onCreateBooking,
      bg: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200/80',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'availability',
      label: 'Check Availability',
      icon: Warehouse,
      onClick: onCheckAvailability,
      bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'reports',
      label: 'View Reports',
      icon: FileSpreadsheet,
      onClick: onViewReports,
      bg: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/80',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'delivery',
      label: 'Delivery & PDI Desk',
      icon: Truck,
      onClick: onOpenDeliveryDesk,
      bg: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/80',
      iconBg: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                onClick={act.onClick}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer ${act.bg}`}
              >
                <div className={`p-2 rounded-lg mb-1.5 ${act.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold leading-tight">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-2">
        Operational shortcuts for reservation workflows
      </div>
    </div>
  );
}

