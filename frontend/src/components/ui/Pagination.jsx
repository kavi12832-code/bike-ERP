import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function Pagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = 'records',
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted px-2 py-3 border-t border-border ${className}`}
    >
      {/* Entry counts */}
      <div className="font-medium text-text-muted">
        Showing <span className="font-bold text-text-main tabular-nums">{startItem}</span> to{' '}
        <span className="font-bold text-text-main tabular-nums">{endItem}</span> of{' '}
        <span className="font-bold text-text-main tabular-nums">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Page size picker */}
        {onPageSizeChange && pageSizeOptions?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="px-2.5 py-1 border border-border rounded bg-surface text-text-main text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded border border-border text-text-main hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First page"
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded border border-border text-text-main hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-7 h-7 px-2 rounded text-xs font-semibold transition-colors ${
                currentPage === p
                  ? 'bg-primary text-white shadow-xs'
                  : 'border border-border text-text-main hover:bg-surface-subtle'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded border border-border text-text-main hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded border border-border text-text-main hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last page"
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

