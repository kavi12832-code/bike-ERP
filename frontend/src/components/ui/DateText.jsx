import React from 'react';
import { formatDate } from '../../lib/format';

/**
 * DateText Component (Section 2.2)
 * Renders dates in Indian Standard Time (IST, DD MMM YYYY)
 */
export function DateText({
  date,
  formatStr = 'dd MMM yyyy',
  includeTime = false,
  className = '',
}) {
  if (!date) return <span className="text-text-muted">—</span>;

  const resolvedFormat = includeTime ? 'dd MMM yyyy, hh:mm a' : formatStr;
  const formatted = formatDate(date, { formatStr: resolvedFormat });

  return (
    <span className={`tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
