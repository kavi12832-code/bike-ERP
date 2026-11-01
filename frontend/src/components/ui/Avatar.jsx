import React from 'react';

/**
 * Enterprise Initials-Only Avatar Component (Section 2.2)
 * Strictly renders user initials, no stock photos.
 */
export function Avatar({
  name = 'Staff',
  size = 'md', // sm (24px) | md (32px) | lg (40px) | xl (48px)
  className = '',
}) {
  const initials = (name || 'S')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  }[size] || 'w-8 h-8 text-xs';

  // Deterministic color assignment based on initials charCode
  const colors = [
    'bg-blue-600 text-white',
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-amber-600 text-white',
    'bg-slate-700 text-white',
  ];
  const charCodeSum = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const colorClass = colors[charCodeSum % colors.length];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold select-none shrink-0 ${sizeClasses} ${colorClass} ${className}`}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}
