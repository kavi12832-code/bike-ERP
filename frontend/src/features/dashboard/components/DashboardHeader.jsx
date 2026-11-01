import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, ChevronDown, RotateCcw, Home } from 'lucide-react';
import { getDateRangePreset } from '../../../dashboard/selectors/dateUtils';
import { useAppStore } from '../../../store';
import { toast } from 'sonner';

export function DashboardHeader({ dateRange, onDateRangeChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync date range preset with URL query string
  useEffect(() => {
    const urlPreset = searchParams.get('dateRange');
    if (urlPreset && urlPreset !== dateRange.key && ['today', 'this_week', 'this_month', 'last_month'].includes(urlPreset)) {
      onDateRangeChange(getDateRangePreset(urlPreset));
    }
  }, [searchParams, dateRange.key, onDateRangeChange]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (presetKey) => {
    const preset = getDateRangePreset(presetKey);
    onDateRangeChange(preset);
    setOpenDropdown(false);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('dateRange', presetKey);
      return next;
    });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      toast.info('Resetting mock records...');
      if (resetDemoData) resetDemoData();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-2">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-text-muted" aria-label="Breadcrumb">
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
        <span>&gt;</span>
        <span className="font-semibold text-text-main">Overview</span>
      </nav>

      {/* Right Controls: Date Range Picker & Dev-only Reset Demo Data */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        {/* Dev-only Reset Demo Data (Hidden in production) */}
        {import.meta.env.DEV && (
          <button
            onClick={handleResetData}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-[11px] font-semibold text-text-muted transition-colors shadow-2xs"
            title="Reset localStorage demo records to initial factory state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        )}

        {/* Date Range Picker Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-xs font-semibold text-text-main transition-colors shadow-2xs"
            aria-label="Select dashboard date range"
            aria-expanded={openDropdown}
          >
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{dateRange.displayLabel}</span>
            <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border/60">
                Range Presets
              </div>
              <div className="py-1">
                {[
                  { key: 'today', label: 'Today (IST)' },
                  { key: 'this_week', label: 'This Week (Mon – Sun)' },
                  { key: 'this_month', label: 'This Month' },
                  { key: 'last_month', label: 'Last Month' },
                ].map((preset) => {
                  const isSelected = dateRange.key === preset.key;
                  return (
                    <button
                      key={preset.key}
                      onClick={() => handleSelectPreset(preset.key)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                        isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-text-main font-medium'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;

