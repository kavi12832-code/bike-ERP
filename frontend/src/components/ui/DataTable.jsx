import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Inbox,
  Loader2,
} from 'lucide-react';

/**
 * Enterprise DataTable component conforming to Section 2.2:
 * - Sortable columns with indicator
 * - Column visibility picker
 * - Multi-row selection with bulk action bar
 * - Sticky header
 * - Pagination with customizable page sizes (10, 25, 50, 100)
 * - Optional totals summary row
 * - Empty and Loading states
 */
export function DataTable({
  columns = [], // Array of { id, header, accessor, cell, sortable, align, footer, minWidth, defaultHidden }
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items matching the selected filters.',
  onRowClick = null,
  selectedIds = [],
  onSelectRow = null,
  onSelectAll = null,
  bulkActions = null, // ReactNode rendered when selectedIds.length > 0
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange = null,
  onPageSizeChange = null,
  sortField = null,
  sortDirection = 'asc',
  onSort = null,
  className = '',
}) {
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initial = {};
    columns.forEach((c) => {
      initial[c.id] = !c.defaultHidden;
    });
    return initial;
  });

  const [columnPickerOpen, setColumnPickerOpen] = useState(false);

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibility[col.id] !== false),
    [columns, columnVisibility]
  );

  const toggleColumn = (id) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isAllSelected = data.length > 0 && data.every((row) => selectedIds.includes(row[keyField]));
  const isPartiallySelected =
    data.length > 0 && !isAllSelected && data.some((row) => selectedIds.includes(row[keyField]));

  const totalPages = Math.max(1, Math.ceil((totalItems || data.length) / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems || data.length, currentPage * pageSize);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Bulk action banner */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full text-[11px]">
              {selectedIds.length} selected
            </span>
            <span>records selected across view</span>
          </div>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden relative transition-colors">
        {/* Table Top Utility Bar */}
        <div className="px-4 py-2.5 border-b border-border bg-slate-50/50 flex items-center justify-between text-xs">
          <div className="text-text-muted font-medium">
            Showing <span className="font-bold text-text-main">{startItem}</span> -{' '}
            <span className="font-bold text-text-main">{endItem}</span> of{' '}
            <span className="font-bold text-text-main">{totalItems || data.length}</span> records
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnPickerOpen(!columnPickerOpen)}
              className="px-2.5 py-1 rounded border border-border bg-surface text-text-main hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {columnPickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-lg shadow-lg z-30 p-2 text-xs space-y-1">
                <div className="font-bold text-text-muted px-2 py-1 text-[11px] uppercase tracking-wider">
                  Toggle Columns
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {columns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100/70 text-text-main cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.id] !== false}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded border-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                      />
                      <span className="truncate">{col.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-border text-text-muted font-semibold sticky top-0 z-10">
              <tr>
                {onSelectAll && (
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={onSelectAll}
                      aria-label="Select all rows"
                      className="rounded border-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                )}
                {visibleColumns.map((col) => {
                  const isSorted = sortField === col.id;
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  return (
                    <th
                      key={col.id}
                      style={{ minWidth: col.minWidth }}
                      className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wider ${alignClass} ${
                        col.sortable && onSort ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                      }`}
                      onClick={() => {
                        if (col.sortable && onSort) {
                          onSort(
                            col.id,
                            isSorted && sortDirection === 'asc' ? 'desc' : 'asc'
                          );
                        }
                      }}
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable && onSort && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-brand-primary" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-brand-primary" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-text-main">
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (onSelectAll ? 1 : 0)} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                      <span className="text-xs">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (onSelectAll ? 1 : 0)} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-text-muted">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-text-main">{emptyTitle}</h4>
                      <p className="text-xs leading-relaxed">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const isSelected = selectedIds.includes(row[keyField]);
                  return (
                    <tr
                      key={row[keyField] || idx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {onSelectRow && (
                        <td
                          className="w-10 px-3 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectRow(row[keyField])}
                            aria-label={`Select row ${row[keyField]}`}
                            className="rounded border-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => {
                        const alignClass =
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left';

                        const cellValue = col.accessor ? row[col.accessor] : null;

                        return (
                          <td key={col.id} className={`px-3 py-3 ${alignClass}`}>
                            {col.cell ? col.cell(row, idx) : cellValue != null ? cellValue : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Optional Totals Footer */}
            {visibleColumns.some((c) => c.footer) && (
              <tfoot className="bg-slate-50/90 border-t-2 border-border font-bold text-text-main">
                <tr>
                  {onSelectAll && <td className="px-3 py-2.5"></td>}
                  {visibleColumns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';
                    return (
                      <td key={col.id} className={`px-3 py-2.5 text-xs ${alignClass}`}>
                        {typeof col.footer === 'function' ? col.footer(data) : col.footer || ''}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Footer */}
        {onPageChange && (
          <div className="px-4 py-3 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-text-muted">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 rounded border border-border bg-background text-text-main font-medium focus:ring-2 focus:ring-brand-primary focus:outline-hidden cursor-pointer"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-muted mr-2">
                Page <span className="font-bold text-text-main">{currentPage}</span> of{' '}
                <span className="font-bold text-text-main">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-border text-text-main hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-border text-text-main hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
