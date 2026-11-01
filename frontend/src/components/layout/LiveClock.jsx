import React, { useState, useEffect, useRef, memo } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Isolated LiveClock component.
 * Self-contained ticker so it does NOT trigger re-renders on the rest of Topbar or Dashboard.
 * Emits aria-live announcement only when the minute changes.
 */
export const LiveClock = memo(function LiveClock({ className = '' }) {
  const [time, setTime] = useState(() => new Date());
  const lastAnnouncedMinuteRef = useRef('');
  const [ariaText, setAriaText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const currentMinuteKey = format(now, 'yyyy-MM-dd HH:mm');
      if (lastAnnouncedMinuteRef.current !== currentMinuteKey) {
        lastAnnouncedMinuteRef.current = currentMinuteKey;
        setAriaText(`${format(now, 'hh:mm a')} Indian Standard Time`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = format(time, 'hh');
  const minutes = format(time, 'mm');
  const ampm = format(time, 'a');
  const isEvenSecond = time.getSeconds() % 2 === 0;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-xs text-text-main font-medium tabular-nums shrink-0 whitespace-nowrap shadow-xs ${className}`}
      title="Indian Standard Time (IST)"
    >
      <Clock className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
      <span aria-hidden="true">
        {hours}
        <span className={isEvenSecond ? 'opacity-100' : 'opacity-25'}>:</span>
        {minutes}
      </span>
      <span className="text-[10px] text-text-muted uppercase ml-0.5" aria-hidden="true">
        {ampm} IST
      </span>
      {/* Screen reader only announcement that updates only once per minute */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaText}
      </span>
    </div>
  );
});

export default LiveClock;

