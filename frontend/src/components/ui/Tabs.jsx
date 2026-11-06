import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { springTransition } from '../../lib/motion';

/**
 * Glass Segmented Toggles & Tabs Component:
 * - Glass track (rounded-full)
 * - Active segment is a dark pill (#0b1220) that SLIDES between options with framer-motion layoutId (300ms spring)
 */
export function Tabs({ tabs, activeTab, onChange, className = '', layoutId = 'activeTabPill' }) {
  return (
    <div
      className={clsx(
        'glass-segmented-track p-1 rounded-full flex items-center space-x-1 relative select-none',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative z-10 px-4 py-2 text-xs font-semibold rounded-full transition-colors duration-150 flex items-center gap-2 cursor-pointer',
              isActive ? 'text-white' : 'text-text-muted hover:text-text-main dark:text-slate-200 dark:hover:text-white'
            )}
          >
            {/* Sliding Dark Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#0b1220] dark:bg-blue-600 border border-white/20 shadow-md -z-10"
                transition={springTransition}
              />
            )}

            <span>{tab.label}</span>

            {tab.count != null && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors',
                  isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-text-muted dark:text-slate-200'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
