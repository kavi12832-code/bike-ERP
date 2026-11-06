import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonHoverProps } from '../../lib/motion';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // xs, sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full select-none disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2';

  const sizeStyles = {
    xs: 'text-[11px] h-7 px-3 gap-1',
    sm: 'text-xs h-8 px-3.5 gap-1.5',
    md: 'text-xs sm:text-sm h-10 px-5 gap-2',
    lg: 'text-sm sm:text-base h-11 px-6 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#0b1220] hover:bg-[#162033] active:bg-[#070c17] text-white border border-white/20 shadow-[0_4px_14px_rgba(2,20,40,0.25)] hover:shadow-[0_6px_20px_rgba(2,20,40,0.35)]',
    secondary:
      'bg-white/20 hover:bg-white/30 active:bg-white/35 text-text-main dark:text-white border border-white/35 shadow-[0_2px_10px_rgba(2,20,40,0.08)] backdrop-blur-md',
    outline:
      'bg-transparent hover:bg-white/20 text-text-main dark:text-white border border-white/40 shadow-xs backdrop-blur-sm',
    ghost:
      'bg-transparent hover:bg-white/20 text-text-main dark:text-white',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-rose-300 shadow-soft',
  };

  return (
    <motion.button
      type={type}
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...buttonHoverProps}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
      {!loading && IconRight ? (
        <span className="transition-transform duration-150 group-hover:translate-x-0.5">
          <IconRight className="w-4 h-4 text-current" />
        </span>
      ) : null}
    </motion.button>
  );
}

export default Button;
