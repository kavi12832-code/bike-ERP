import React from 'react';
import { Calendar } from 'lucide-react';

export function QuotationWeeklyActivity({ weeklyActivity }) {
  const { weeks = [], totalQuotes = 0, totalConverted = 0, totalExpired = 0 } = weeklyActivity || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Quotation Activity by Week</h2>
            <p className="text-[11px] text-slate-400">Weekly cohort volumes & outcomes</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>October 2026</span>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-1.5 px-2">Week Period</th>
                <th className="py-1.5 px-2 text-center">Created</th>
                <th className="py-1.5 px-2 text-center">Converted</th>
                <th className="py-1.5 px-2 text-center">Expired</th>
                <th className="py-1.5 px-2 text-right">Quoted (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              {weeks.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-2 font-medium text-slate-700">{w.label}</td>
                  <td className="py-2 px-2 text-center font-semibold text-blue-600">{w.createdCount}</td>
                  <td className="py-2 px-2 text-center font-semibold text-emerald-600">{w.convertedCount}</td>
                  <td className="py-2 px-2 text-center font-semibold text-rose-500">{w.expiredCount}</td>
                  <td className="py-2 px-2 text-right font-medium text-slate-800">
                    ₹ {(w.totalQuotedRupees / 100000).toFixed(2)}L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Totals: {totalQuotes} Created</span>
        <span className="font-semibold text-emerald-600">{totalConverted} Converted ({totalExpired} Expired)</span>
      </div>
    </div>
  );
}

