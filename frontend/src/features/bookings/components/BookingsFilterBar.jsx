import React, { useState } from 'react';
import { Search, Filter, RotateCcw, FastForward, CheckSquare, Square, X, Calendar, Clock } from 'lucide-react';
import { BOOKING_STATUSES } from '../../../bookings/config';
import { getSimulatedClockOffsetDays, getSimulatedNow } from '../../../bookings/engine';

export function BookingsFilterBar({
  filters,
  onFilterChange,
  branches = [],
  models = [],
  onAdvanceClock,
  onResetClock,
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const offsetDays = getSimulatedClockOffsetDays();
  const simulatedNow = getSimulatedNow();

  const statuses = [
    { value: 'ALL', label: 'All Status' },
    { value: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed' },
    { value: BOOKING_STATUSES.PENDING, label: 'Pending' },
    { value: BOOKING_STATUSES.DELIVERED, label: 'Delivered' },
    { value: BOOKING_STATUSES.CANCELLED, label: 'Cancelled' },
  ];

  const datePresets = [
    { value: 'THIS_MONTH', label: 'Oct 01, 2026 – Oct 31, 2026' },
    { value: 'LAST_MONTH', label: 'Sep 01, 2026 – Sep 30, 2026' },
    { value: 'LAST_3_MONTHS', label: 'Aug 01, 2026 – Oct 31, 2026' },
    { value: 'ALL_TIME', label: 'All Dates' },
  ];

  const activeAdvancedCount = [
    filters.modelName,
    filters.allocationStatus,
    filters.deliveryTiming,
    filters.minToken,
    filters.maxToken,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5 space-y-3">
      {/* Primary Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking #, Customer Name, Phone, or VIN..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Branch Filter */}
        <select
          value={filters.branch || 'ALL'}
          onChange={(e) => onFilterChange({ branch: e.target.value })}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Branches</option>
          {branches.map((b) => (
            <option key={b.id || b.name} value={b.name || b}>
              {b.name || b}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Date Preset */}
        <div className="relative">
          <select
            value={filters.datePreset || 'THIS_MONTH'}
            onChange={(e) => onFilterChange({ datePreset: e.target.value })}
            className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {datePresets.map((dp) => (
              <option key={dp.value} value={dp.value}>
                {dp.label}
              </option>
            ))}
          </select>
          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Drawer Toggle */}
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            advancedOpen || activeAdvancedCount > 0
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeAdvancedCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Secondary Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        {/* Open Bookings Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                includeAllOpenBookings: !filters.includeAllOpenBookings,
              })
            }
            className="text-blue-600 focus:outline-none"
          >
            {filters.includeAllOpenBookings ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <span className="font-medium text-slate-700">
            Include all open bookings regardless of date range
          </span>
          <span className="text-[11px] text-slate-400">
            (Prevents active pending/confirmed reservations from being hidden)
          </span>
        </label>

        {/* Simulated Dev Clock Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-600">
            Simulated Clock:{' '}
            <strong className="text-slate-900">
              {simulatedNow.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </strong>
            {offsetDays > 0 && (
              <span className="ml-1 text-amber-600 font-semibold">
                (+{offsetDays}d)
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => onAdvanceClock(1)}
            title="Advance simulated clock by 1 day"
            className="flex items-center gap-0.5 px-2 py-0.5 text-[11px] bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium transition-colors"
          >
            <FastForward className="w-3 h-3 text-blue-600" /> +1d
          </button>
          <button
            type="button"
            onClick={() => onAdvanceClock(7)}
            title="Advance simulated clock by 7 days"
            className="flex items-center gap-0.5 px-2 py-0.5 text-[11px] bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium transition-colors"
          >
            <FastForward className="w-3 h-3 text-blue-600" /> +7d
          </button>
          {offsetDays > 0 && (
            <button
              type="button"
              onClick={onResetClock}
              title="Reset simulated clock to today"
              className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded text-rose-700 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {advancedOpen && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/60 p-3 rounded-lg">
          {/* Model Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Bike Model
            </label>
            <select
              value={filters.modelName || 'ALL'}
              onChange={(e) => onFilterChange({ modelName: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
            >
              <option value="ALL">All Models</option>
              {models.map((m) => (
                <option key={m.id || m.name || m} value={m.name || m}>
                  {m.name || m}
                </option>
              ))}
            </select>
          </div>

          {/* Chassis Allocation Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Chassis Allocation
            </label>
            <select
              value={filters.allocationStatus || 'ALL'}
              onChange={(e) => onFilterChange({ allocationStatus: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
            >
              <option value="ALL">All Chassis States</option>
              <option value="ALLOCATED">Chassis Allocated</option>
              <option value="NOT_ALLOCATED">Unallocated</option>
              <option value="HELD">Temporary 48h Hold</option>
            </select>
          </div>

          {/* Delivery Timing Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Delivery Timing Window
            </label>
            <select
              value={filters.deliveryTiming || 'ALL'}
              onChange={(e) => onFilterChange({ deliveryTiming: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
            >
              <option value="ALL">All Deliveries</option>
              <option value="DUE_IN_2_DAYS">Due in Next 2 Days</option>
              <option value="OVERDUE">Overdue Deliveries</option>
              <option value="ON_SCHEDULE">On Schedule</option>
            </select>
          </div>

          {/* Clear Advanced Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  modelName: 'ALL',
                  allocationStatus: 'ALL',
                  deliveryTiming: 'ALL',
                  minToken: null,
                  maxToken: null,
                })
              }
              className="w-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded bg-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

