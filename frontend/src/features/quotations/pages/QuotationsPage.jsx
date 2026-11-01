import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { FileText, Plus, FileSpreadsheet, FileDown, Home } from 'lucide-react';
import { toast } from 'sonner';

// Config, Selectors & Engine
import { QUOTATION_STATUSES } from '../../../quotations/config';
import {
  getQuotationsKpis,
  filterQuotations,
  sortQuotations,
  getQuotationStatusBreakdown,
  getQuotationWeeklyActivity,
} from '../../../quotations/selectors';
import {
  getSimulatedNow,
  advanceSimulatedClock,
  resetSimulatedClock,
} from '../../../quotations/engine';
import { canViewFullPhone } from '../../../lib/rbac';

// Child Components
import { QuotationsKpis } from '../components/QuotationsKpis';
import { QuotationsFilterBar } from '../components/QuotationsFilterBar';
import { QuotationsTable } from '../components/QuotationsTable';
import { QuotationsBulkBar } from '../components/QuotationsBulkBar';
import { QuotationsPagination } from '../components/QuotationsPagination';
import { QuotationStatusOverview } from '../components/QuotationStatusOverview';
import { QuotationWeeklyActivity } from '../components/QuotationWeeklyActivity';
import { QuotationQuickActions } from '../components/QuotationQuickActions';
import { QuotationDetailDrawer } from '../components/QuotationDetailDrawer';
import { QuotationBuilderModal } from '../components/QuotationBuilderModal';
import { ConvertBookingModal } from '../components/ConvertBookingModal';
import { WhatsAppShareModal } from '../components/WhatsAppShareModal';
import { QuotationReportsModal } from '../components/QuotationReportsModal';

export function QuotationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableRef = useRef(null);

  // Store bindings
  const state = useAppStore();
  const rawQuotations = state.quotations || [];
  const bikeCatalog = state.catalogs?.bikes || [];
  const branches = state.branches || [];
  const currentUser = state.currentUser || {};
  const activeBranchId = state.activeBranchId || 'br-blr-central';

  // Store actions
  const addQuotation = state.addQuotation;
  const updateQuotation = state.updateQuotation;
  const renewQuotation = state.renewQuotation;
  const cancelQuotation = state.cancelQuotation;
  const convertQuotationToBooking = state.convertQuotationToBooking;
  const expireQuotationsCatchup = state.expireQuotationsCatchup;
  const updateDiscountStatus = state.updateDiscountStatus;

  // Run initial expiry check
  useEffect(() => {
    if (typeof expireQuotationsCatchup === 'function') {
      expireQuotationsCatchup();
    }
  }, []);

  // Filter State from URL / Defaults
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('q') || '',
    status: searchParams.get('status') || 'ALL',
    branchId: searchParams.get('branch') || activeBranchId,
    includeOpenQuotations: true,
    salespersonId: '',
    modelId: '',
    minAmount: '',
    maxAmount: '',
    minDiscountPct: '',
    maxDiscountPct: '',
    expiringWithinDays: '',
    hasApprovalRequest: false,
    dateRangeLabel: 'Oct 01, 2026 – Oct 31, 2026',
  }));

  // Sync active branch when changed in topbar
  useEffect(() => {
    if (activeBranchId && filters.branchId !== activeBranchId) {
      setFilters((prev) => ({ ...prev, branchId: activeBranchId }));
    }
  }, [activeBranchId]);

  // Keep URL in sync with search & status
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.branchId && filters.branchId !== 'all') params.set('branch', filters.branchId);
    setSearchParams(params, { replace: true });
  }, [filters.search, filters.status, filters.branchId, setSearchParams]);

  // Sorting & Pagination
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Dev Clock trigger to force re-render on simulated time advance
  const [clockTick, setClockTick] = useState(0);

  // Active Date Range: Default Current Month (October 2026)
  const dateRange = useMemo(() => {
    const ref = getSimulatedNow();
    return {
      startDate: new Date(2026, 9, 1),
      endDate: new Date(2026, 9, 31, 23, 59, 59),
    };
  }, [clockTick]);

  // Filtered & Sorted Quotations
  const filteredQuotations = useMemo(() => {
    return filterQuotations(
      rawQuotations,
      filters,
      currentUser,
      dateRange,
      getSimulatedNow()
    );
  }, [rawQuotations, filters, currentUser, dateRange, clockTick]);

  const sortedQuotations = useMemo(() => {
    return sortQuotations(filteredQuotations, sortKey, sortOrder);
  }, [filteredQuotations, sortKey, sortOrder]);

  // Paginated Slice
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedQuotations.slice(start, start + pageSize);
  }, [sortedQuotations, currentPage, pageSize]);

  // Compute KPI values strictly from pure selector
  const kpis = useMemo(() => {
    return getQuotationsKpis(
      rawQuotations,
      filters.branchId,
      dateRange,
      getSimulatedNow()
    );
  }, [rawQuotations, filters.branchId, dateRange, clockTick]);

  // Bottom Rows Pure Selectors
  const statusBreakdown = useMemo(() => {
    return getQuotationStatusBreakdown(filteredQuotations);
  }, [filteredQuotations]);

  const weeklyActivity = useMemo(() => {
    return getQuotationWeeklyActivity(rawQuotations, filters.branchId, dateRange);
  }, [rawQuotations, filters.branchId, dateRange]);

  // Modals & Drawers State
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [activeQuotation, setActiveQuotation] = useState(null);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [targetConvertQuote, setTargetConvertQuote] = useState(null);

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [targetWhatsAppQuote, setTargetWhatsAppQuote] = useState(null);

  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  // Auto-open builder if URL has ?lead=<id>
  useEffect(() => {
    const leadParam = searchParams.get('lead');
    if (leadParam && !builderOpen) {
      setEditingQuotation(null);
      setBuilderOpen(true);
    }
  }, [searchParams]);

  // Filter Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleKpiStatusSelect = (statusTarget) => {
    handleFilterChange('status', statusTarget);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedQuotations.length && paginatedQuotations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedQuotations.map((q) => q.id));
    }
  };

  // Clock Simulation
  const handleAdvanceClock = (days = 1) => {
    advanceSimulatedClock(days);
    if (typeof expireQuotationsCatchup === 'function') {
      expireQuotationsCatchup();
    }
    setClockTick((v) => v + 1);
    toast.info(`Simulated clock advanced by +${days} ${days === 1 ? 'day' : 'days'}`);
  };

  const handleResetClock = () => {
    resetSimulatedClock();
    if (typeof expireQuotationsCatchup === 'function') {
      expireQuotationsCatchup();
    }
    setClockTick((v) => v + 1);
    toast.success('Simulated clock reset to current time');
  };

  // Actions Handlers
  const handleViewQuotation = (q) => {
    setActiveQuotation(q);
    setDetailDrawerOpen(true);
  };

  const handleEditQuotation = (q) => {
    setEditingQuotation(q);
    setBuilderOpen(true);
  };

  const handleConvertToBooking = (q) => {
    setTargetConvertQuote(q);
    setConvertModalOpen(true);
  };

  const handleConfirmBookingConversion = (quotationId, bookingData) => {
    try {
      const result = convertQuotationToBooking(quotationId, bookingData);
      toast.success(
        `Successfully generated Booking ${result.booking.bookingNumber} for ${result.booking.customerName}`
      );
      if (activeQuotation?.id === quotationId) {
        setActiveQuotation(result.quotation);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to convert quotation to booking');
    }
  };

  const handleSendWhatsApp = (q) => {
    setTargetWhatsAppQuote(q);
    setWhatsAppModalOpen(true);
  };

  const handleConfirmSendWhatsApp = (quotationId, message) => {
    const q = rawQuotations.find((item) => item.id === quotationId);
    if (q && (q.status === QUOTATION_STATUSES.DRAFT || q.status === QUOTATION_STATUSES.APPROVED)) {
      updateQuotation(quotationId, {
        status: QUOTATION_STATUSES.SENT,
        history: [
          ...(q.history || []),
          {
            timestamp: new Date().toISOString(),
            action: 'DISPATCHED_WHATSAPP',
            performedBy: currentUser?.name || 'Staff',
            notes: 'Quotation details and link dispatched to customer mobile via WhatsApp API',
          },
        ],
      });
    }
  };

  const handleRenewQuotation = (q) => {
    const renewed = renewQuotation(q.id);
    if (renewed) {
      toast.success(`Generated renewed quotation revision ${renewed.quotationNumber}`);
      setActiveQuotation(renewed);
    }
  };

  const handleCancelQuotation = (q) => {
    const reason = window.prompt(
      `Please provide a cancellation reason for ${q.quotationNumber}:`,
      'Customer chose competing brand'
    );
    if (reason) {
      cancelQuotation(q.id, reason);
      toast.info(`Quotation ${q.quotationNumber} has been cancelled`);
      if (activeQuotation?.id === q.id) {
        setActiveQuotation((prev) => ({ ...prev, status: QUOTATION_STATUSES.CANCELLED, cancelReason: reason }));
      }
    }
  };

  const handleDownloadPdf = (q) => {
    toast.success(`Downloaded Quotation PDF for ${q.quotationNumber}`);
  };

  const handleApproveDiscount = (quotationId) => {
    updateDiscountStatus(quotationId, 'APPROVED', currentUser?.name || 'Manager');
    updateQuotation(quotationId, {
      status: QUOTATION_STATUSES.APPROVED,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'DISCOUNT_AUTHORIZED',
          performedBy: currentUser?.name || 'Manager',
          notes: 'Dual-control discount authorized via Quotations Center',
        },
      ],
    });
    toast.success(`Discount approved for ${quotationId}`);
    if (activeQuotation?.id === quotationId) {
      setActiveQuotation((prev) => ({ ...prev, status: QUOTATION_STATUSES.APPROVED }));
    }
  };

  const handleSaveQuotationBuilder = (payload) => {
    if (editingQuotation) {
      updateQuotation(payload.id, payload);
      toast.success(`Updated quotation ${payload.quotationNumber}`);
    } else {
      addQuotation(payload);
      toast.success(`Created quotation ${payload.quotationNumber}`);
    }
  };

  // Bulk Actions
  const handleBulkExport = () => {
    setReportsModalOpen(true);
  };

  const handleBulkWhatsApp = () => {
    toast.success(`Dispatched WhatsApp reminders to ${selectedIds.length} customer quotations`);
    setSelectedIds([]);
  };

  const handleBulkCancel = () => {
    if (window.confirm(`Are you sure you want to cancel ${selectedIds.length} quotations?`)) {
      selectedIds.forEach((id) => {
        cancelQuotation(id, 'Bulk cancelled by showroom manager');
      });
      toast.info(`Cancelled ${selectedIds.length} quotations`);
      setSelectedIds([]);
    }
  };

  const canViewPhone = canViewFullPhone(currentUser);

  // Extract salespeople list from users store or staff
  const salespeople = (state.users || [])
    .filter((u) => u.role === 'Sales Executive' || u.role === 'Sales Manager')
    .map((u) => ({ id: u.id, name: u.name }));

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Operations</span>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600 font-semibold">Quotations</span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-soft shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quotations</h1>
            <p className="text-xs text-slate-500">Create, manage and track customer quotations.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setReportsModalOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setReportsModalOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setEditingQuotation(null);
              setBuilderOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* 3. Four KPI Cards */}
      <QuotationsKpis
        kpis={kpis}
        activeStatus={filters.status}
        onSelectStatus={handleKpiStatusSelect}
      />

      {/* 4. Filter Bar */}
      <div ref={tableRef}>
        <QuotationsFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          branches={branches}
          salespeople={salespeople}
          models={bikeCatalog}
          onAdvanceClock={handleAdvanceClock}
          onResetClock={handleResetClock}
        />
      </div>

      {/* 5. Bulk Selection Bar */}
      <QuotationsBulkBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkExport={handleBulkExport}
        onBulkWhatsApp={handleBulkWhatsApp}
        onBulkCancel={handleBulkCancel}
      />

      {/* 6. Quotations Table */}
      <QuotationsTable
        quotations={paginatedQuotations}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewQuotation={handleViewQuotation}
        onEditQuotation={handleEditQuotation}
        onConvertToBooking={handleConvertToBooking}
        onSendWhatsApp={handleSendWhatsApp}
        onRenewQuotation={handleRenewQuotation}
        onCancelQuotation={handleCancelQuotation}
        onDownloadPdf={handleDownloadPdf}
        canViewPhone={canViewPhone}
        currentUser={currentUser}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* 7. Pagination */}
      <QuotationsPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={sortedQuotations.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* 8. Bottom Row: Status Overview, Weekly Activity & Quick Actions (NO GRAPH DESIGN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <QuotationStatusOverview breakdown={statusBreakdown} />
        <QuotationWeeklyActivity weeklyActivity={weeklyActivity} />
        <QuotationQuickActions
          onCreateQuotation={() => {
            setEditingQuotation(null);
            setBuilderOpen(true);
          }}
          onResetFilters={() => {
            setFilters({
              search: '',
              status: 'ALL',
              branchId: activeBranchId,
              includeOpenQuotations: true,
              salespersonId: '',
              modelId: '',
              minAmount: '',
              maxAmount: '',
              minDiscountPct: '',
              maxDiscountPct: '',
              expiringWithinDays: '',
              hasApprovalRequest: false,
              dateRangeLabel: 'Oct 01, 2026 – Oct 31, 2026',
            });
          }}
          onOpenExportReport={() => setReportsModalOpen(true)}
        />
      </div>

      {/* Modals & Drawers */}
      <QuotationDetailDrawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        quotation={activeQuotation}
        onConvertToBooking={handleConvertToBooking}
        onSendWhatsApp={handleSendWhatsApp}
        onRenewQuotation={handleRenewQuotation}
        onDownloadPdf={handleDownloadPdf}
        onApproveDiscount={handleApproveDiscount}
        canViewPhone={canViewPhone}
        currentUser={currentUser}
      />

      <QuotationBuilderModal
        isOpen={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingQuotation(null);
        }}
        initialData={editingQuotation}
        leadPrefill={
          searchParams.get('lead')
            ? (state.leads || []).find((l) => l.id === searchParams.get('lead'))
            : null
        }
        bikes={bikeCatalog}
        branches={branches}
        currentUser={currentUser}
        onSave={handleSaveQuotationBuilder}
      />

      <ConvertBookingModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        quotation={targetConvertQuote}
        onConfirm={handleConfirmBookingConversion}
      />

      <WhatsAppShareModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        quotation={targetWhatsAppQuote}
        onSend={handleConfirmSendWhatsApp}
      />

      <QuotationReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        filteredQuotations={filteredQuotations}
        allQuotations={rawQuotations}
        canViewPhone={canViewPhone}
      />
    </div>
  );
}
