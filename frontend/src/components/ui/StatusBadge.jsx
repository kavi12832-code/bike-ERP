import React from 'react';
import clsx from 'clsx';

/**
 * Glass StatusBadge:
 * Tinted glass pills with 20% background, light border, and high-contrast text
 */
export function StatusBadge({ status, label, className = '' }) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let variantClass = 'bg-slate-500/15 dark:bg-slate-400/20 text-slate-800 dark:text-slate-200 border-slate-400/30 dark:border-slate-400/40';

  if (
    [
      'PAID',
      'CONFIRMED',
      'READY',
      'APPROVED',
      'DELIVERED',
      'AVAILABLE',
      'IN_STOCK',
      'HOT',
      'NORMAL',
    ].includes(norm)
  ) {
    variantClass = 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40';
  } else if (
    [
      'PENDING',
      'PENDING_APPROVAL',
      'WAITING',
      'SCHEDULED',
      'ESTIMATE_SENT',
      'WARM',
      'MEDIUM',
      'WARNING',
    ].includes(norm)
  ) {
    variantClass = 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40';
  } else if (
    [
      'IN_PROGRESS',
      'COMPLETED',
      'FILED',
      'ALLOCATED',
      'CHECKED_IN',
      'QUALITY_CHECK',
      'IN_TRANSIT',
    ].includes(norm)
  ) {
    variantClass = 'bg-blue-500/15 dark:bg-cyan-500/25 text-blue-800 dark:text-cyan-300 border-blue-500/30 dark:border-cyan-400/40';
  } else if (
    [
      'CANCELLED',
      'LOW_STOCK',
      'OVERDUE',
      'REJECTED',
      'BREACHED',
      'LOST',
      'COLD',
      'HIGH',
    ].includes(norm)
  ) {
    variantClass = 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40';
  }

  const displayText = label || (status ? String(status).replace(/_/g, ' ') : '—');

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm shadow-2xs select-none uppercase tracking-wide',
        variantClass,
        className
      )}
    >
      {displayText}
    </span>
  );
}

export default StatusBadge;
