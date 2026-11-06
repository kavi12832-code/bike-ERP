import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../../store';
import {
  Calendar,
  Plus,
  Download,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import {
  advanceSimulatedClock,
  resetSimulatedClock,
  runHoldExpiryCheck,
} from '../../../bookings/engine';
import {
  getBookingsKpis,
  getBookingTabCounts,
  filterBookings,
  sortBookings,
  getBookingStatusBreakdown,
  getBookingWeeklyActivity,
} from '../../../bookings/selectors';

// Components
import { BookingsKpis } from '../components/BookingsKpis';
import { BookingsTabs } from '../components/BookingsTabs';
import { BookingsFilterBar } from '../components/BookingsFilterBar';
import { BookingsTable } from '../components/BookingsTable';
import { BookingsPagination } from '../components/BookingsPagination';
import { BookingsBulkBar } from '../components/BookingsBulkBar';
import { BookingStatusDistribution } from '../components/BookingStatusDistribution';
import { BookingActivityTable } from '../components/BookingActivityTable';
import { BookingQuickActions } from '../components/BookingQuickActions';

// Modals & Panels
import { BookingDetailsPanel } from '../components/BookingDetailsPanel';
import { CheckAvailabilityDialog } from '../components/CheckAvailabilityDialog';
import { CreateBookingModal } from '../components/CreateBookingModal';
import { AllocateChassisDialog } from '../components/AllocateChassisDialog';
import { RecordTokenPaymentModal } from '../components/RecordTokenPaymentModal';
import { RescheduleDeliveryModal } from '../components/RescheduleDeliveryModal';
import { CancelBookingModal } from '../components/CancelBookingModal';
import { BookingsReportModal } from '../components/BookingsReportModal';

import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { staggerContainer, cardEntranceVariants } from '../../../lib/motion';

export function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useAppStore();

  const rawBookings = state.bookings || [];
  const vehicleStock = state.vehicleStock || [];
  const branches = state.branches || [];
  const models = state.catalogs?.bikes || [
    { id: 're-classic-350', name: 'Royal Enfield Classic 350' },
    { id: 're-hunter-350', name: 'Royal Enfield Hunter 350' },
    { id: 're-himalayan-450', name: 'Royal Enfield Himalayan 450' },
    { id: 'pulsar-ns200', name: 'Bajaj Pulsar NS200' },
    { id: 'pulsar-150', name: 'Bajaj Pulsar 150' },
    { id: 'chetak-premium', name: 'Bajaj Chetak Premium' },
    { id: 'honda-shine-125', name: 'Honda Shine 125' },
    { id: 'tvs-apache-160', name: 'TVS Apache RTR 160' },
  ];
  const currentUser = state.currentUser;

  // Store actions
  const addBooking = state.addBooking;
  const updateBooking = state.updateBooking;
  const recordTokenPayment = state.recordTokenPayment;
  const allocateChassisToBooking = state.allocateChassisToBooking;
  const deallocateChassis = state.deallocateChassis;
  const confirmBooking = state.confirmBooking;
  const deliverBooking = state.deliverBooking;
  const cancelBooking = state.cancelBooking;
  const expireHoldsCatchup = state.expireHoldsCatchup;

  // Periodic hold expiry check (every 60s)
  useEffect(() => {
    if (expireHoldsCatchup) {
      expireHoldsCatchup();
    }
    const interval = setInterval(() => {
      if (expireHoldsCatchup) expireHoldsCatchup();
    }, 60000);
    return () => clearInterval(interval);
  }, [expireHoldsCatchup]);

  // Permissions
  const canViewFullPhone =
    hasPermission(currentUser, PERMISSIONS.BOOKINGS_VIEW_CUSTOMER_PHONE) ||
    currentUser?.role === 'SUPER_ADMIN';
  const canAllocateChassis =
    hasPermission(currentUser, PERMISSIONS.BOOKINGS_ALLOCATE_CHASSIS) ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';
  const canCancel =
    hasPermission(currentUser, PERMISSIONS.BOOKINGS_CANCEL) ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  // Filters State
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('q') || '',
    branch: searchParams.get('branch') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    datePreset: searchParams.get('range') || 'THIS_MONTH',
    includeAllOpenBookings: true,
    modelName: 'ALL',
    allocationStatus: 'ALL',
    deliveryTiming: 'ALL',
  });

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'ALL');
  const [sortField, setSortField] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Drawers state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [recordTokenModalOpen, setRecordTokenModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState(null);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'ALL') params.set('tab', activeTab);
    if (filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.branch !== 'ALL') params.set('branch', filters.branch);
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.datePreset !== 'THIS_MONTH') params.set('range', filters.datePreset);
    setSearchParams(params, { replace: true });
  }, [activeTab, filters, setSearchParams]);

  // Handle URL prefill (e.g. ?quotation=QT/... or ?lead=...)
  useEffect(() => {
    const quotationParam = searchParams.get('quotation');
    if (quotationParam && state.quotations) {
      const q = state.quotations.find((item) => item.quotationNumber === quotationParam || item.id === quotationParam);
      if (q) {
        setCreatePrefill({
          quotationId: q.id,
          customerName: q.customerName,
          customerPhone: q.customerPhone,
          customerEmail: q.customerEmail,
          modelName: q.modelName,
          colour: q.colour,
          variant: q.variant,
          branchName: q.branchName,
        });
        setCreateModalOpen(true);
      }
    }
  }, [searchParams, state.quotations]);

  // Pure selectors computations
  const kpis = useMemo(() => getBookingsKpis(rawBookings), [rawBookings]);
  const tabCounts = useMemo(() => getBookingTabCounts(rawBookings), [rawBookings]);
  const statusBreakdown = useMemo(() => getBookingStatusBreakdown(rawBookings), [rawBookings]);
  const weeklyActivity = useMemo(() => getBookingWeeklyActivity(rawBookings), [rawBookings]);

  // Filtered & sorted bookings
  const filteredList = useMemo(() => {
    const effectiveFilters = {
      ...filters,
      tab: activeTab,
    };
    const list = filterBookings(rawBookings, effectiveFilters);
    return sortBookings(list, sortField, sortDirection);
  }, [rawBookings, filters, activeTab, sortField, sortDirection]);

  // Paginated subset
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'ALL') {
      setFilters((prev) => ({ ...prev, status: tab }));
    } else {
      setFilters((prev) => ({ ...prev, status: 'ALL' }));
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.status && newFilters.status !== activeTab) {
      setActiveTab(newFilters.status);
    }
    setCurrentPage(1);
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (paginatedList.every((b) => selectedIds.includes(b.id))) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedList.some((b) => b.id === id))
      );
    } else {
      const newIds = [...selectedIds];
      paginatedList.forEach((b) => {
        if (!newIds.includes(b.id)) newIds.push(b.id);
      });
      setSelectedIds(newIds);
    }
  };

  // Clock simulation handlers
  const handleAdvanceClock = (days) => {
    advanceSimulatedClock(days);
    if (expireHoldsCatchup) expireHoldsCatchup();
    toast.info(`Simulated clock advanced by ${days} day(s)`);
  };

  const handleResetClock = () => {
    resetSimulatedClock();
    if (expireHoldsCatchup) expireHoldsCatchup();
    toast.success('Simulated clock reset to current time');
  };

  // Booking actions - Toggle view under the table
  const handleViewDetails = (booking) => {
    if (selectedBooking?.id === booking.id) {
      setSelectedBooking(null);
    } else {
      setSelectedBooking(booking);
      setTimeout(() => {
        const el = document.getElementById('booking-detail-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
    }
  };

  const handleOpenRecordToken = (booking) => {
    setSelectedBooking(booking);
    setRecordTokenModalOpen(true);
  };

  const handleOpenAllocate = (booking) => {
    setSelectedBooking(booking);
    setAllocateModalOpen(true);
  };

  const handleOpenReschedule = (booking) => {
    setSelectedBooking(booking);
    setRescheduleModalOpen(true);
  };

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmBooking = (booking) => {
    if (confirmBooking) {
      confirmBooking(booking.id);
      toast.success(`Booking ${booking.bookingNumber} confirmed successfully!`);
    }
  };

  const handleDeliverBooking = (booking) => {
    if (deliverBooking) {
      deliverBooking(booking.id);
      toast.success(`Booking ${booking.bookingNumber} marked as Delivered!`);
    }
  };

  // Bulk actions
  const handleBulkReminders = () => {
    toast.success(
      `Delivery reminder push sent via WhatsApp to ${selectedIds.length} customer(s)`
    );
    setSelectedIds([]);
  };

  const handleBulkPrint = () => {
    toast.info(`Preparing print bundle for ${selectedIds.length} booking form(s)`);
    setSelectedIds([]);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5 pb-12"
    >
      {/* Breadcrumb & Header */}
      <motion.div variants={cardEntranceVariants}>
        <div className="text-xs text-text-glass-muted mb-1 flex items-center gap-1.5 font-medium">
          <span className="hover:text-black cursor-pointer">Operations</span>
          <span>&gt;</span>
          <span className="text-text-glass-main font-semibold">Bookings</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/40 border border-white/50 text-blue-700 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-glass-main tracking-tight">
                Vehicle Reservations & Bookings
              </h1>
              <p className="text-xs sm:text-sm text-text-glass-muted">
                Token receipts, single-unit chassis allocation gates and delivery reservations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCreatePrefill(null);
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b1220] hover:bg-[#162033] text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer hover:-translate-y-0.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 text-text-glass-muted" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => toast.info('Delivery Calendar view available under Tasks & Calendar')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <CalendarDays className="w-4 h-4 text-text-glass-muted" />
              <span>View Calendar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards (No Graph Design: Plain, Reconciled) */}
      <motion.div variants={cardEntranceVariants}>
        <BookingsKpis
          kpis={kpis}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
        />
      </motion.div>

      {/* Filter Bar with Dev Clock */}
      <BookingsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        branches={branches}
        models={models}
        onAdvanceClock={handleAdvanceClock}
        onResetClock={handleResetClock}
      />

      {/* Tabs Row */}
      <BookingsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />

      {/* Bulk Action Bar */}
      <BookingsBulkBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExportSelected={() => setReportModalOpen(true)}
        onSendReminders={handleBulkReminders}
        onPrintForms={handleBulkPrint}
      />

      {/* Primary Table */}
      <BookingsTable
        bookings={paginatedList}
        selectedIds={selectedIds}
        activeBookingId={selectedBooking?.id}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onViewDetails={handleViewDetails}
        onRecordToken={handleOpenRecordToken}
        onAllocateChassis={handleOpenAllocate}
        onRescheduleDelivery={handleOpenReschedule}
        onConfirmBooking={handleConfirmBooking}
        onDeliverBooking={handleDeliverBooking}
        onCancelBooking={handleOpenCancel}
        canViewFullPhone={canViewFullPhone}
        canAllocateChassis={canAllocateChassis}
        canCancel={canCancel}
      />

      {/* Pagination */}
      <BookingsPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredList.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Selected Booking Details (Rendered Directly Under the Table) */}
      {selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRecordToken={handleOpenRecordToken}
          onAllocateChassis={handleOpenAllocate}
          onRescheduleDelivery={handleOpenReschedule}
          onConfirmBooking={handleConfirmBooking}
          onDeliverBooking={handleDeliverBooking}
          onCancelBooking={handleOpenCancel}
          canViewFullPhone={canViewFullPhone}
          canAllocateChassis={canAllocateChassis}
          canCancel={canCancel}
        />
      )}

      {/* Bottom 3-Card Row (Replaces Line & Donut Graphs strictly with structured information) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <BookingActivityTable weeklyData={weeklyActivity} />
        </div>

        <div className="lg:col-span-1">
          <BookingStatusDistribution
            breakdown={statusBreakdown}
            totalBookings={kpis.totalCount}
            onSelectStatus={handleTabChange}
          />
        </div>

        <div className="lg:col-span-1">
          <BookingQuickActions
            onCreateBooking={() => {
              setCreatePrefill(null);
              setCreateModalOpen(true);
            }}
            onCheckAvailability={() => setAvailabilityDialogOpen(true)}
            onViewReports={() => setReportModalOpen(true)}
            onOpenDeliveryDesk={() => toast.info('Delivery Desk: Check Ready for PDI bookings')}
          />
        </div>
      </div>

      {/* Dialogs & Modals */}
      <CheckAvailabilityDialog
        isOpen={availabilityDialogOpen}
        onClose={() => setAvailabilityDialogOpen(false)}
        vehicleStock={vehicleStock}
        models={models}
        branches={branches}
        onSelectVinForBooking={(unit) => {
          setCreatePrefill({
            modelName: unit.modelName,
            colour: unit.colour,
            vin: unit.vin,
            branchName: unit.branchName,
          });
          setCreateModalOpen(true);
        }}
      />

      <CreateBookingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        branches={branches}
        models={models}
        vehicleStock={vehicleStock}
        prefill={createPrefill}
        onCreateBooking={(bookingData) => {
          if (addBooking) {
            addBooking(bookingData);
          }
        }}
      />

      <AllocateChassisDialog
        booking={selectedBooking}
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        vehicleStock={vehicleStock}
        onAllocate={(allocData) => {
          if (allocateChassisToBooking) {
            allocateChassisToBooking(allocData);
          }
        }}
      />

      <RecordTokenPaymentModal
        booking={selectedBooking}
        isOpen={recordTokenModalOpen}
        onClose={() => setRecordTokenModalOpen(false)}
        onRecordPayment={(payData) => {
          if (recordTokenPayment) {
            recordTokenPayment(payData);
          }
        }}
      />

      <RescheduleDeliveryModal
        booking={selectedBooking}
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onReschedule={(reschedData) => {
          if (updateBooking) {
            updateBooking(reschedData.bookingId, {
              tentativeDeliveryDate: reschedData.newDate,
            });
          }
        }}
      />

      <CancelBookingModal
        booking={selectedBooking}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onCancelReservation={(cancelData) => {
          if (cancelBooking) {
            cancelBooking(cancelData.bookingId, cancelData);
          }
        }}
      />

      <BookingsReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        bookings={filteredList}
        filteredCount={filteredList.length}
      />
    </motion.div>
  );
}
