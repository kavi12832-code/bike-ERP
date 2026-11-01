import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

/**
 * Enterprise FilterBar component
 * Provides search query input, branch selector, status selector, date ranges, and clear filters
 */
export function FilterBar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records by name, ID, phone...',
  filters = {},
  filterConfig = [], // Array of { key, label, options: [{ value, label }], value, onChange }
  onResetFilters = null,
  activeFilterCount = 0,
  children,
}) {
  return (
    <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border mb-4 shadow-2xs space-y-3 transition-colors">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg text-text-main placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {filterConfig.map((cfg) => (
            <div key={cfg.key} className="flex items-center">
              <select
                value={cfg.value || 'ALL'}
                onChange={(e) => cfg.onChange(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg text-text-main hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-primary cursor-pointer transition-colors"
                aria-label={cfg.label}
              >
                {cfg.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {children}

          {/* Reset button */}
          {onResetFilters && activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
