import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { QUOTATION_STATUSES } from '../../../quotations/config';

export function QuotationsKpis({ kpis, activeStatus, onSelectStatus }) {
  const cards = [
    {
      id: 'total',
      statusTarget: 'ALL',
      title: 'Total Quotations',
      value: kpis.totalCount ?? 0,
      subtext: 'In selected period',
      icon: FileText,
      bgClass: 'bg-blue-50/80 border-blue-200/80 hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-700',
      activeRing: activeStatus === 'ALL' ? 'ring-2 ring-blue-500 shadow-md' : '',
    },
    {
      id: 'converted',
      statusTarget: QUOTATION_STATUSES.CONVERTED,
      title: 'Converted to Booking',
      value: kpis.convertedCount ?? 0,
      subtext: `${kpis.conversionRatePercent ?? 0}% of quotations converted`,
      icon: CheckCircle2,
      bgClass: 'bg-emerald-50/80 border-emerald-200/80 hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-700',
      activeRing: activeStatus === QUOTATION_STATUSES.CONVERTED ? 'ring-2 ring-emerald-500 shadow-md' : '',
    },
    {
      id: 'pending',
      statusTarget: QUOTATION_STATUSES.PENDING_APPROVAL,
      title: 'Pending Approval',
      value: kpis.pendingApprovalCount ?? 0,
      subtext: 'Awaiting approval',
      icon: Clock,
      bgClass: 'bg-purple-50/80 border-purple-200/80 hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-700',
      activeRing: activeStatus === QUOTATION_STATUSES.PENDING_APPROVAL ? 'ring-2 ring-purple-500 shadow-md' : '',
    },
    {
      id: 'expired',
      statusTarget: QUOTATION_STATUSES.EXPIRED,
      title: 'Expired',
      value: kpis.expiredCount ?? 0,
      subtext: `${kpis.expiringSoonCount ?? 0} more expire within 3 days`,
      icon: AlertCircle,
      bgClass: 'bg-rose-50/80 border-rose-200/80 hover:border-rose-400',
      iconBg: 'bg-rose-100 text-rose-700',
      activeRing: activeStatus === QUOTATION_STATUSES.EXPIRED ? 'ring-2 ring-rose-500 shadow-md' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStatus(c.statusTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStatus(c.statusTarget);
              }
            }}
            className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer ${c.bgClass} ${c.activeRing}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{c.title}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${c.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-3">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}

