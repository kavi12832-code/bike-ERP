import React from 'react';

/**
 * Plain, accessible KPI Card conforming strictly to Section 0.5 & 2.2:
 * NO charts, NO sparklines, NO trend arrows, NO progress rings.
 * Features: icon, uppercase small label, bold large number, one line of descriptive text, optional onClick.
 */
export function KpiCard({
  icon,
  label,
  value,
  subtext,
  helperText,
  onClick = null,
  active = false,
  variant = 'default', // default | success | warning | danger | info | purple
  className = '',
}) {
  const description = subtext || helperText;
  const variantStyles = {
    default: {
      card: 'bg-surface border-border hover:border-slate-300',
      iconBox: 'bg-slate-100 text-slate-700',
      valueColor: 'text-text-main',
    },
    info: {
      card: 'bg-blue-50/70 border-blue-200 hover:border-blue-300',
      iconBox: 'bg-blue-100 text-blue-700',
      valueColor: 'text-blue-900',
    },
    success: {
      card: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300',
      iconBox: 'bg-emerald-100 text-emerald-700',
      valueColor: 'text-emerald-900',
    },
    warning: {
      card: 'bg-amber-50/70 border-amber-200 hover:border-amber-300',
      iconBox: 'bg-amber-100 text-amber-700',
      valueColor: 'text-amber-900',
    },
    danger: {
      card: 'bg-rose-50/70 border-rose-200 hover:border-rose-300',
      iconBox: 'bg-rose-100 text-rose-700',
      valueColor: 'text-rose-900',
    },
    purple: {
      card: 'bg-purple-50/70 border-purple-200 hover:border-purple-300',
      iconBox: 'bg-purple-100 text-purple-700',
      valueColor: 'text-purple-900',
    },
  }[variant] || variantStyles.default;

  const Component = onClick ? 'button' : 'div';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComp = icon;
      return <IconComp className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${variantStyles.card} ${
        active ? 'ring-2 ring-brand-primary shadow-sm' : 'shadow-2xs'
      } ${onClick ? 'cursor-pointer hover:shadow-xs' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${variantStyles.iconBox}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div>
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${variantStyles.valueColor}`}>
          {value != null ? value : '—'}
        </div>
        {description && (
          <p className="text-[11px] text-text-muted mt-1 line-clamp-1 font-normal">
            {description}
          </p>
        )}
      </div>
    </Component>
  );
}
