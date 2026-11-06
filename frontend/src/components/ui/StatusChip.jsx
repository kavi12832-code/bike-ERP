import React from 'react';
import clsx from 'clsx';

/**
 * Glass StatusChip with dot indicator and tinted glass pill
 */
export function StatusChip({ status, label, className = '' }) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let style = {
    bg: 'bg-slate-500/15 dark:bg-slate-400/20',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-400/30 dark:border-slate-400/40',
    dot: 'bg-slate-500 dark:bg-slate-300',
  };

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
      'ACTIVE',
      'RESOLVED',
      'OK',
    ].includes(norm)
  ) {
    style = {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-500/30 dark:border-emerald-400/40',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    };
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
      'ATTENTION',
      'OPEN',
      'IN_PROGRESS',
    ].includes(norm)
  ) {
    style = {
      bg: 'bg-amber-500/15 dark:bg-amber-500/25',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-500/30 dark:border-amber-400/40',
      dot: 'bg-amber-500 dark:bg-amber-400',
    };
  } else if (
    [
      'ALLOCATED',
      'BOOKED',
      'PDI',
      'INVOICED',
      'CHECKED_IN',
      'COMPLETED',
      'SENT',
      'CONVERTED',
    ].includes(norm)
  ) {
    style = {
      bg: 'bg-blue-500/15 dark:bg-cyan-500/25',
      text: 'text-blue-800 dark:text-cyan-300',
      border: 'border-blue-500/30 dark:border-cyan-400/40',
      dot: 'bg-blue-500 dark:bg-cyan-400',
    };
  } else if (
    [
      'CANCELLED',
      'REJECTED',
      'OVERDUE',
      'BREACHED',
      'LOST',
      'FAILED',
      'COLD',
      'HIGH',
    ].includes(norm)
  ) {
    style = {
      bg: 'bg-rose-500/15 dark:bg-rose-500/25',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-500/30 dark:border-rose-400/40',
      dot: 'bg-rose-500 dark:bg-rose-400',
    };
  }

  const displayText = label || (status ? String(status).replace(/_/g, ' ') : '—');

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-2xs select-none',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', style.dot)} />
      <span>{displayText}</span>
    </span>
  );
}

export default StatusChip;
