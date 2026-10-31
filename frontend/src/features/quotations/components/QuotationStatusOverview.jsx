import React from 'react';
import { STATUS_CONFIG, QUOTATION_STATUSES } from '../../../quotations/config';

export function QuotationStatusOverview({ breakdown }) {
  const { totalCount = 0, totalQuotedRupees = 0, rows = [] } = breakdown || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Quotation Status Overview</h2>
            <p className="text-[11px] text-slate-400">Distribution across active pipeline</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {totalCount} Total
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {rows.map((r) => {
            const config = STATUS_CONFIG[r.status] || STATUS_CONFIG[QUOTATION_STATUSES.DRAFT];
            return (
              <div
                key={r.status}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: config.dotColor }}
                  />
                  <span className="font-medium text-slate-700 truncate">{r.status}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {r.count} <span className="text-slate-400">({r.percentage}%)</span>
                  </span>
                  <span className="font-semibold text-slate-800 text-right min-w-[70px]">
                    ₹ {Math.round(r.totalValueRupees / 1000).toLocaleString('en-IN')}k
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Total Quoted Value</span>
        <span className="font-bold text-slate-900 text-sm">
          ₹ {(totalQuotedRupees / 100000).toFixed(2)} Lakhs
        </span>
      </div>
    </div>
  );
}

