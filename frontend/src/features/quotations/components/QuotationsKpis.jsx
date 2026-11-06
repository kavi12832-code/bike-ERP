import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { QUOTATION_STATUSES } from '../../../quotations/config';
import { CountUp } from '../../../components/ui/CountUp';
import { cardHoverProps } from '../../../lib/motion';

export function QuotationsKpis({ kpis, activeStatus, onSelectStatus }) {
  const cards = [
    {
      id: 'total',
      statusTarget: 'ALL',
      title: 'Total Quotations',
      value: kpis.totalCount ?? 0,
      subtext: 'In selected period',
      icon: FileText,
      iconColor: 'text-blue-700',
      activeBorder: activeStatus === 'ALL' ? 'border-blue-500 ring-2 ring-blue-400/40' : '',
    },
    {
      id: 'converted',
      statusTarget: QUOTATION_STATUSES.CONVERTED,
      title: 'Converted to Booking',
      value: kpis.convertedCount ?? 0,
      subtext: `${kpis.conversionRatePercent ?? 0}% of quotations converted`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      activeBorder: activeStatus === QUOTATION_STATUSES.CONVERTED ? 'border-emerald-500 ring-2 ring-emerald-400/40' : '',
    },
    {
      id: 'pending',
      statusTarget: QUOTATION_STATUSES.PENDING_APPROVAL,
      title: 'Pending Approval',
      value: kpis.pendingApprovalCount ?? 0,
      subtext: 'Awaiting approval',
      icon: Clock,
      iconColor: 'text-purple-700',
      activeBorder: activeStatus === QUOTATION_STATUSES.PENDING_APPROVAL ? 'border-purple-500 ring-2 ring-purple-400/40' : '',
    },
    {
      id: 'expired',
      statusTarget: QUOTATION_STATUSES.EXPIRED,
      title: 'Expired',
      value: kpis.expiredCount ?? 0,
      subtext: `${kpis.expiringSoonCount ?? 0} more expire within 3 days`,
      icon: AlertCircle,
      iconColor: 'text-rose-700',
      activeBorder: activeStatus === QUOTATION_STATUSES.EXPIRED ? 'border-rose-500 ring-2 ring-rose-400/40' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <motion.div
            key={c.id}
            {...cardHoverProps}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStatus(c.statusTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStatus(c.statusTarget);
              }
            }}
            className={`w-full text-left glass-card glass-card-interactive !rounded-[24px] !p-5 h-full min-h-[145px] flex flex-col justify-between cursor-pointer shadow-card hover:shadow-card-hover ${c.activeBorder}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">{c.title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                  <CountUp value={c.value} />
                </p>
              </div>
              <div className={`w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center shadow-xs ${c.iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-text-glass-muted font-medium mt-3">{c.subtext}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

