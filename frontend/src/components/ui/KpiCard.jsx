import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverProps } from '../../lib/motion';
import { CountUp } from './CountUp';

/**
 * Stat Card conforming to Glass Admin Dashboard Spec:
 * - Small round white icon chip (36px) top-left
 * - Optional delta badge top-right (green/red tinted pill)
 * - Big number (28-32px, 700, tight tracking) with animated CountUp
 * - Label (14px, 600 weight)
 * - Muted sub-line (12px)
 * - Card hover: y -5px, background to --glass-bg-strong, shadow deepens (250ms), press: scale 0.98
 */
export function KpiCard({
  icon,
  label,
  value,
  subtext,
  helperText,
  delta,
  deltaType = 'neutral', // up | down | positive | negative | neutral
  onClick = null,
  active = false,
  variant = 'default',
  className = '',
}) {
  const description = subtext || helperText;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComp = icon;
      return <IconComp className="w-5 h-5 text-slate-800 dark:text-white" />;
    }
    return null;
  };

  const Component = motion.button;

  // Determine delta badge styles
  const isPositive =
    deltaType === 'up' || deltaType === 'positive' || (typeof delta === 'string' && delta.startsWith('+'));
  const isNegative =
    deltaType === 'down' || deltaType === 'negative' || (typeof delta === 'string' && delta.startsWith('-'));

  const deltaPillClass = isPositive
    ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40'
    : isNegative
      ? 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40'
      : 'bg-white/30 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-white/40 dark:border-white/20';

  return (
    <Component
      type={onClick ? 'button' : 'button'}
      onClick={onClick || undefined}
      className={`glass-card glass-card-interactive rounded-[24px] text-left flex flex-col justify-between h-full min-h-[145px] select-none relative overflow-hidden ${active ? 'ring-2 ring-cyan-500 border-white/60 bg-white/30 dark:bg-white/20 shadow-lg' : ''
        } ${className}`}
      {...cardHoverProps}
    >
      {/* Top Row: 36px Round White Icon Chip top-left & optional Delta Badge top-right */}
      <div className="flex items-center justify-between gap-3 mb-4 w-full">
        {icon && (
          <div className="w-9 h-9 rounded-full bg-white/85 dark:bg-white/15 shadow-xs border border-white/60 dark:border-white/20 flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>
        )}

        {delta && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-2xs ${deltaPillClass}`}
          >
            {delta}
          </span>
        )}
      </div>

      {/* Middle & Bottom: Big Number + Label + Sub-line */}
      <div className="w-full">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-text-glass-main dark:text-white tabular-nums mb-1">
          <CountUp value={value} />
        </div>

        <div className="text-sm font-semibold text-text-glass-main dark:text-white line-clamp-1">
          {label}
        </div>

        {description && (
          <p className="text-xs text-text-glass-muted dark:text-slate-300 mt-1 line-clamp-1 font-medium">
            {description}
          </p>
        )}
      </div>
    </Component>
  );
}

export default KpiCard;
