import React from 'react';
import { formatMoney, formatCompactMoney } from '../../lib/format';

/**
 * MoneyText Component (Section 2.2)
 * Formats monetary amounts in Indian Rupee format (Lakhs/Crores)
 */
export function MoneyText({
  paise = 0,
  compact = false,
  symbol = '₹',
  showPaise = false,
  className = '',
}) {
  const formatted = compact
    ? formatCompactMoney(paise, { symbol })
    : formatMoney(paise, { symbol, showPaise });

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
