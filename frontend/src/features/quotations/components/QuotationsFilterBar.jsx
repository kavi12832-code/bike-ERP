import React, { useState } from 'react';
import { Search, Filter, RotateCcw, FastForward, CheckSquare, Square, X, Calendar } from 'lucide-react';
import { QUOTATION_STATUSES } from '../../../quotations/config';
import { getSimulatedClockOffsetDays } from '../../../quotations/engine';

export function QuotationsFilterBar({
  filters,
  onFilterChange,
  branches = [],
  salespeople = [],
  models = [],
  onAdvanceClock,
  onResetClock,
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const offsetDays = getSimulatedClockOffsetDays();

  const statuses = [
    { value: 'ALL', label: 'All Status' },
    { value: QUOTATION_STATUSES.DRAFT, label: 'Draft' },
    { value: QUOTATION_STATUSES.PENDING_APPROVAL, label: 'Pending Approval' },
    { value: QUOTATION_STATUSES.APPROVED, label: 'Approved' },
    { value: QUOTATION_STATUSES.SENT, label: 'Sent' },
    { value: QUOTATION_STATUSES.CONVERTED, label: 'Converted' },
    { value: QUOTATION_STATUSES.EXPIRED, label: 'Expired' },
    { value: QUOTATION_STATUSES.REJECTED, label: 'Rejected' },
    { value: QUOTATION_STATUSES.CANCELLED, label: 'Cancelled' },
  ];

  const activeAdvancedCount = [
    filters.salespersonId,
    filters.modelId,
    filters.minAmount,
    filters.maxAmount,
    filters.minDiscountPct,
    filters.maxDiscountPct,
    filters.expiringWithinDays,
    filters.hasApprovalRequest,
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
            placeholder="Search by Quotation ID, Customer Name, Bike Model..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange('status', e.target.value)}
          aria-label="Filter by Status"
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Branch Dropdown */}
        <select
          value={filters.branchId || 'all'}
          onChange={(e) => onFilterChange('branchId', e.target.value)}
          aria-label="Filter by Branch"
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="all">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Date Preset Range Button / Display */}
        <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{filters.dateRangeLabel || 'Oct 01, 2026 – Oct 31, 2026'}</span>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            advancedOpen || activeAdvancedCount > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeAdvancedCount > 0 && (
            <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Secondary Bar: Open Quotations Toggle & Dev Clock Advance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={Boolean(filters.includeOpenQuotations)}
            onChange={(e) => onFilterChange('includeOpenQuotations', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span>Include all open quotations regardless of date</span>
          <span className="text-slate-400 text-[11px]">(Draft, Pending Approval, Approved, Sent)</span>
        </label>

        {/* Dev Clock Simulation Toolbar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          <span className="text-[11px] text-slate-500 font-medium">
            Simulated Clock: {offsetDays === 0 ? 'Today (IST)' : `+${offsetDays} days`}
          </span>
          <button
            onClick={() => onAdvanceClock(1)}
            title="Advance simulated time by 1 day"
            className="px-1.5 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1"
          >
            <FastForward className="w-3 h-3 text-blue-600" /> +1d
          </button>
          <button
            onClick={() => onAdvanceClock(7)}
            title="Advance simulated time by 7 days"
            className="px-1.5 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1"
          >
            <FastForward className="w-3 h-3 text-blue-600" /> +7d
          </button>
          {offsetDays !== 0 && (
            <button
              onClick={onResetClock}
              title="Reset simulated time to real today"
              className="px-1.5 py-0.5 text-[11px] font-semibold bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 text-rose-700 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer / Expansion */}
      {advancedOpen && (
        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Advanced Filters</span>
            {activeAdvancedCount > 0 && (
              <button
                onClick={() => {
                  onFilterChange('salespersonId', '');
                  onFilterChange('modelId', '');
                  onFilterChange('minAmount', '');
                  onFilterChange('maxAmount', '');
                  onFilterChange('minDiscountPct', '');
                  onFilterChange('maxDiscountPct', '');
                  onFilterChange('expiringWithinDays', '');
                  onFilterChange('hasApprovalRequest', false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Salesperson</label>
              <select
                value={filters.salespersonId || ''}
                onChange={(e) => onFilterChange('salespersonId', e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-1.5"
              >
                <option value="">All Staff</option>
                {salespeople.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Bike Model</label>
              <select
                value={filters.modelId || ''}
                onChange={(e) => onFilterChange('modelId', e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-1.5"
              >
                <option value="">All Models</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand ? `${m.brand} ${m.model || m.name}` : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Expires Within</label>
              <select
                value={filters.expiringWithinDays || ''}
                onChange={(e) => onFilterChange('expiringWithinDays', e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-1.5"
              >
                <option value="">Any Validity</option>
                <option value="3">Within 3 Days</option>
                <option value="7">Within 7 Days</option>
                <option value="15">Within 15 Days</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasApprovalRequest)}
                  onChange={(e) => onFilterChange('hasApprovalRequest', e.target.checked)}
                  className="rounded text-blue-600 border-slate-300"
                />
                <span>Has Dual-Control Approval</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

