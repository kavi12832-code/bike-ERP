import React from 'react';
import { PieChart, Info } from 'lucide-react';
import { BOOKING_STATUSES } from '../../../bookings/config';

export function BookingStatusDistribution({ breakdown, totalBookings = 0, onSelectStatus }) {
  const rows = Array.isArray(breakdown) ? breakdown : breakdown?.rows || [];
  const displayTotal = totalBookings || breakdown?.totalCount || 0;
  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUSES.CONFIRMED:
        return { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-700' };
      case BOOKING_STATUSES.PENDING:
        return { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-700' };
      case BOOKING_STATUSES.DELIVERED:
        return { dot: 'bg-blue-500', bar: 'bg-blue-500', text: 'text-blue-700' };
      case BOOKING_STATUSES.CANCELLED:
        return { dot: 'bg-rose-500', bar: 'bg-rose-500', text: 'text-rose-700' };
      default:
        return { dot: 'bg-slate-400', bar: 'bg-slate-400', text: 'text-slate-700' };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Booking Status Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Strict reconciliation · 100% total pool</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">{displayTotal}</span>
            <span className="text-[11px] text-slate-500 block -mt-0.5">Total</span>
          </div>
        </div>

        {/* Proportional Segment Bar (Pure CSS Stacked Bar) */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex my-4">
          {rows.map((item) => {
            const colors = getStatusColor(item.status);
            if (item.percentage === 0) return null;
            return (
              <div
                key={item.status}
                style={{ width: `${item.percentage}%` }}
                className={`${colors.bar} h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                title={`${item.status}: ${item.count} (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Status List Breakdown */}
        <div className="space-y-3">
          {rows.map((item) => {
            const colors = getStatusColor(item.status);
            const tokenAmount = (item.tokenCollectedRupees || 0).toLocaleString('en-IN');
            return (
              <button
                key={item.status}
                type="button"
                onClick={() => onSelectStatus(item.status)}
                className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Token: ₹ {tokenAmount}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{item.count}</span>
                  <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                    ({item.percentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>Percentages dynamically rounded to reconcile exactly to 100%.</span>
      </div>
    </div>
  );
}
