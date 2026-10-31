import React from 'react';

/**
 * Standard StatusChip component with dot indicator and accessible color semantic tokens
 */
export function StatusChip({ status, label, className = '' }) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let style = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
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
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
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
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
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
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    };
  } else if (
    [
      'CANCELLED',
      'REJECTED',
      'OVERDUE',
      'BREACHED',
      'COLD',
      'HIGH',
      'URGENT',
      'EXPIRED',
      'INACTIVE',
      'DAMAGED',
    ].includes(norm)
  ) {
    style = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    };
  }

  const displayText = label || (status || '').replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide whitespace-nowrap ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span className="capitalize">{displayText}</span>
    </span>
  );
}
