import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { cardHoverProps } from '../../lib/motion';

export function Card({ children, className = '', hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? cardHoverProps : {};

  return (
    <Component
      className={clsx(
        'glass-card rounded-[24px] transition-colors duration-200 text-current',
        hover && 'glass-card-interactive cursor-pointer',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={clsx(
        'px-6 py-4.5 border-b border-white/20 flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-base font-bold text-text-main dark:text-white tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={clsx('p-6', className)}>{children}</div>;
}

export default Card;
