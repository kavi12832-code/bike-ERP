import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Enterprise Glass FilterBar component
 * Provides search query input, branch selector, status selector, date ranges, and clear filters
 */
export function FilterBar({
  searchQuery = '',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records by name, ID, phone...',
  filters = [],
  filterConfig = [], // Array of { key, label, options: [{ value, label }], value, onChange }
  onResetFilters = null,
  onClear = null,
  activeFilterCount = 0,
  children,
}) {
  const currentSearch = searchQuery || searchValue;
  const filterList = filterConfig.length > 0 ? filterConfig : Array.isArray(filters) ? filters : [];
  const handleReset = onResetFilters || onClear;

  return (
    <div className="glass-card !p-3.5 sm:!p-4 !rounded-2xl mb-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-text-glass-muted dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-full text-text-glass-main dark:text-white placeholder:text-text-glass-muted/60 dark:placeholder:text-slate-400 focus:outline-hidden focus:bg-white/60 dark:focus:bg-white/20 focus:ring-2 focus:ring-cyan-400/40 transition-all backdrop-blur-sm"
            />
            {currentSearch && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-glass-muted dark:text-slate-400 hover:text-text-glass-main dark:hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {filterList.map((cfg, idx) => (
            <div key={cfg.key || idx} className="flex items-center">
              <select
                value={cfg.value || 'ALL'}
                onChange={(e) => cfg.onChange(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-full text-text-glass-main dark:text-white hover:bg-white/50 dark:hover:bg-white/20 focus:outline-hidden focus:ring-2 focus:ring-cyan-400/40 cursor-pointer transition-colors backdrop-blur-md"
                aria-label={cfg.label}
              >
                {cfg.options?.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {children}

          {/* Reset button */}
          {handleReset && (activeFilterCount > 0 || currentSearch || filterList.some(f => f.value && f.value !== 'ALL')) && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-3 py-2 text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 bg-rose-500/15 dark:bg-rose-500/25 hover:bg-rose-500/25 border border-rose-400/30 dark:border-rose-400/40 rounded-full font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
export default FilterBar;
