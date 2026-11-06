import React from 'react';
import clsx from 'clsx';

/**
 * Shimmering glass placeholder skeleton (1.4s sweeping gradient loop)
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={clsx('glass-skeleton rounded-[14px] bg-white/15', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex gap-4 border-b border-white/20 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-white/10">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
