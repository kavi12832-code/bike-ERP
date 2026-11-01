import React from 'react';
import { Calendar } from 'lucide-react';

export function BookingActivityTable({ weeklyData = [] }) {
  // Gracefully handle either an array of rows or an object containing { weeks, totalCreated, ... }
  const rows = Array.isArray(weeklyData)
    ? weeklyData
    : Array.isArray(weeklyData?.weeks)
    ? weeklyData.weeks
    : [];

  // Compute column totals safely
  const totals = {
    created:
      weeklyData?.totalCreated ??
      rows.reduce((acc, row) => acc + (row.created ?? row.createdCount ?? 0), 0),
    confirmed:
      weeklyData?.totalConfirmed ??
      rows.reduce((acc, row) => acc + (row.confirmed ?? row.confirmedCount ?? 0), 0),
    delivered:
      weeklyData?.totalDelivered ??
      rows.reduce((acc, row) => acc + (row.delivered ?? row.deliveredCount ?? 0), 0),
    cancelled:
      weeklyData?.totalCancelled ??
      rows.reduce((acc, row) => acc + (row.cancelled ?? row.cancelledCount ?? 0), 0),
    tokenCollectedRupees:
      weeklyData?.totalTokenCollectedRupees ??
      Math.round(
        rows.reduce(
          (acc, row) =>
            acc + (row.tokenCollectedRupees ?? Math.round((row.tokenCollectedPaise || 0) / 100)),
          0
        )
      ),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Weekly Activity Summary
            </h3>
            <p className="text-[11px] text-slate-400">
              Operational intake, confirmations & handovers
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>This Month</span>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-2 text-center">Created</th>
                <th className="py-2.5 px-2 text-center">Confirmed</th>
                <th className="py-2.5 px-2 text-center">Delivered</th>
                <th className="py-2.5 px-2 text-center">Cancelled</th>
                <th className="py-2.5 px-3 text-right">Tokens (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No weekly activity recorded
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const periodLabel = row.weekLabel || row.label || `Week ${idx + 1}`;
                  const dateRange = row.dateRange || '';
                  const created = row.created ?? row.createdCount ?? 0;
                  const confirmed = row.confirmed ?? row.confirmedCount ?? 0;
                  const delivered = row.delivered ?? row.deliveredCount ?? 0;
                  const cancelled = row.cancelled ?? row.cancelledCount ?? 0;
                  const tokenRupees =
                    row.tokenCollectedRupees ??
                    Math.round((row.tokenCollectedPaise || 0) / 100);

                  return (
                    <tr key={periodLabel + idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                        <div>{periodLabel}</div>
                        {dateRange && (
                          <div className="text-[10px] text-slate-400 font-normal">{dateRange}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-medium">{created}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-medium">
                        {confirmed}
                      </td>
                      <td className="py-2.5 px-2 text-center text-blue-700 font-medium">
                        {delivered}
                      </td>
                      <td className="py-2.5 px-2 text-center text-rose-600 font-medium">
                        {cancelled}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        ₹ {tokenRupees.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-slate-900 font-bold text-xs">
                <td className="py-2.5 px-3 uppercase text-[11px] tracking-wide">Total Month</td>
                <td className="py-2.5 px-2 text-center">{totals.created}</td>
                <td className="py-2.5 px-2 text-center text-emerald-700">{totals.confirmed}</td>
                <td className="py-2.5 px-2 text-center text-blue-700">{totals.delivered}</td>
                <td className="py-2.5 px-2 text-center text-rose-600">{totals.cancelled}</td>
                <td className="py-2.5 px-3 text-right text-blue-700">
                  ₹ {totals.tokenCollectedRupees.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Operational Intake Summary</span>
        <span className="font-medium text-slate-600">Reconciled with Store</span>
      </div>
    </div>
  );
}
