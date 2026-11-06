import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { tableRowVariants, listStaggerContainer } from '../../lib/motion';

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
        <div className="glass-card !p-2.5 !rounded-2xl border border-blue-400/40 bg-blue-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-blue-950 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] shadow-xs">
              {selectedIds.length} selected
            </span>
            <span className="font-medium text-slate-800">records selected across view</span>
          </div>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="glass-card !p-0 overflow-hidden relative transition-colors shadow-card">
        {/* Table Top Utility Bar */}
        <div className="px-4 py-2.5 border-b border-white/20 bg-white/5 flex items-center justify-between text-xs">
          <div className="text-text-glass-muted font-medium">
            Showing <span className="font-bold text-text-glass-main">{startItem}</span> -{' '}
            <span className="font-bold text-text-glass-main">{endItem}</span> of{' '}
            <span className="font-bold text-text-glass-main">{totalItems || data.length}</span> records
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnPickerOpen(!columnPickerOpen)}
              className="px-3 py-1 rounded-full border border-white/30 bg-white/15 text-text-glass-main hover:bg-white/25 inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-text-glass-muted" />
              <span>Columns</span>
            </button>

            {columnPickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 glass-card !p-2.5 shadow-2xl z-30 text-xs space-y-1 border border-white/40">
                <div className="font-bold text-text-glass-muted px-2 py-1 text-[11px] uppercase tracking-wider">
                  Toggle Columns
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                  {columns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/20 text-text-glass-main cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.id] !== false}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded border-white/40 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
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
            <thead className="bg-white/10 border-b border-white/25 text-text-glass-muted font-semibold sticky top-0 z-10 backdrop-blur-xs">
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
                      className="rounded border-white/40 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
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
                      className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wider ${alignClass} ${col.sortable && onSort ? 'cursor-pointer hover:bg-white/10 select-none' : ''
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
                        className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                          }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable && onSort && (
                          <span className="text-text-glass-muted">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
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

            <motion.tbody
              variants={listStaggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-white/20 text-text-glass-main"
            >
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (onSelectAll ? 1 : 0)} className="py-12 text-center text-text-glass-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (onSelectAll ? 1 : 0)} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-text-glass-muted">
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-text-glass-muted mb-1">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-text-glass-main">{emptyTitle}</h4>
                      <p className="text-xs leading-relaxed">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const isSelected = selectedIds.includes(row[keyField]);
                  return (
                    <motion.tr
                      key={row[keyField] || idx}
                      variants={tableRowVariants}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`hover:bg-white/20 transition-colors ${isSelected ? 'bg-blue-500/15' : ''
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
                            className="rounded border-white/40 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
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
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>

            {/* Optional Totals Footer */}
            {visibleColumns.some((c) => c.footer) && (
              <tfoot className="bg-white/15 border-t-2 border-white/30 font-bold text-text-glass-main">
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
          <div className="px-4 py-3 border-t border-white/20 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-text-glass-muted">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                className="px-2.5 py-1 rounded-full border border-white/30 bg-white/15 text-text-glass-main font-medium focus:ring-2 focus:ring-blue-400 focus:outline-hidden cursor-pointer"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size} className="bg-slate-900 text-white">
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-glass-muted mr-2">
                Page <span className="font-bold text-text-glass-main">{currentPage}</span> of{' '}
                <span className="font-bold text-text-glass-main">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-full border border-white/30 text-text-glass-main hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-full border border-white/30 text-text-glass-main hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
