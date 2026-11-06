import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import {
  getDateRangePreset,
  getGrossSalesToday,
  getInvoicesVsTarget,
  getServiceBayUtilisation,
  getGstOutputToday,
  getSalesPerformance,
  getLeadSourceDistribution,
  getShowroomRevenueTrajectory,
  getBookingTrends,
  getTopPerformers,
  getDeterministicAiInsights,
  getUpcomingTasks,
} from '../../../dashboard/selectors';

// Dashboard Components
import { DashboardHeader } from '../components/DashboardHeader';
import { HeroBanner } from '../components/HeroBanner';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { SalesPerformanceChart } from '../components/SalesPerformanceChart';
import { LeadSourceDonutChart } from '../components/LeadSourceDonutChart';
import { TopPerformersCard } from '../components/TopPerformersCard';
import { AiCopilotInsights } from '../components/AiCopilotInsights';
import { UpcomingTasksCard } from '../components/UpcomingTasksCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { PromoCarousel } from '../components/PromoCarousel';
import { ShowroomRevenueChart } from '../components/ShowroomRevenueChart';
import { BookingTrendsChart } from '../components/BookingTrendsChart';
import { TechnicianDashboardView } from '../components/TechnicianDashboardView';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { staggerContainer, cardEntranceVariants } from '../../../lib/motion';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useAppStore();

  const currentUser = state.currentUser;
  const activeBranchId = state.activeBranchId || 'br-blr-central';
  const invoices = state.invoices || [];
  const leads = state.leads || [];
  const bookings = state.bookings || [];
  const cancellations = state.cancellations || [];
  const bays = state.bays || [];
  const jobCards = state.jobCards || [];
  const purchases = state.purchases || [];
  const hrStaff = state.hrStaff || [];
  const hrPayrollRuns = state.hrPayrollRuns || [];
  const tasks = state.tasks || [];
  const settings = state.settings || {};

  // Permissions
  const hasFinancePermission = hasPermission(currentUser, PERMISSIONS.DASHBOARD_VIEW_FINANCE);
  const hasTeamPermission = hasPermission(currentUser, PERMISSIONS.DASHBOARD_VIEW_TEAM);
  const hasQuickActionsPermission = hasPermission(currentUser, PERMISSIONS.DASHBOARD_QUICK_ACTIONS);

  // Date Range State (default: This Month)
  const initialPresetKey = searchParams.get('dateRange') || 'this_month';
  const [dateRange, setDateRange] = useState(() => getDateRangePreset(initialPresetKey));

  // Chart local control state
  const [salesPeriod, setSalesPeriod] = useState('this_week'); // 'this_week' | 'this_month' | 'last_month'
  const [revenueTab, setRevenueTab] = useState('30_days'); // '7_days' | '30_days' | 'this_month'

  // Bay Assignment Quick Modal
  const [bayModalOpen, setBayModalOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState('');
  const [selectedJobCardId, setSelectedJobCardId] = useState('');

  const freeBays = bays.filter(
    (b) => b.status === 'FREE' && (!b.branchId || b.branchId === activeBranchId)
  );
  const unassignedJobCards = jobCards.filter((jc) => !jc.bayNumber && jc.stage !== 'DELIVERED');

  const openBayModal = () => {
    setSelectedBay(freeBays[0]?.bayNumber ?? '');
    setSelectedJobCardId(unassignedJobCards[0]?.id ?? '');
    setBayModalOpen(true);
  };

  const handleQuickBayAssign = () => {
    if (!selectedBay || !selectedJobCardId) {
      toast.error('Select an available bay and a job card first.');
      return;
    }
    try {
      state.assignBayToJobCard(Number(selectedBay), selectedJobCardId);
      setBayModalOpen(false);
      toast.success(`Bay #${selectedBay} assigned to Job Card successfully!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Pure Selector Memoized Derivations
  const referenceDate = useMemo(() => new Date(), []);

  // 1. Pastel KPI Cards (Strictly TODAY, ignores dateRange picker)
  const grossSalesToday = useMemo(
    () => getGrossSalesToday(invoices, activeBranchId, referenceDate),
    [invoices, activeBranchId, referenceDate]
  );

  const invoicesVsTarget = useMemo(
    () => getInvoicesVsTarget(invoices, settings.dailyVehicleTarget, activeBranchId, referenceDate),
    [invoices, settings.dailyVehicleTarget, activeBranchId, referenceDate]
  );

  const serviceBayUtilisation = useMemo(
    () => getServiceBayUtilisation(bays, jobCards, activeBranchId, referenceDate),
    [bays, jobCards, activeBranchId, referenceDate]
  );

  const gstOutputToday = useMemo(
    () => getGstOutputToday(invoices, purchases, activeBranchId, referenceDate),
    [invoices, purchases, activeBranchId, referenceDate]
  );

  // 2. Row 2 Charts (Follows selected period & dateRange)
  const salesPerformance = useMemo(
    () => getSalesPerformance(invoices, salesPeriod, activeBranchId, referenceDate),
    [invoices, salesPeriod, activeBranchId, referenceDate]
  );

  const leadSourceDistribution = useMemo(
    () => getLeadSourceDistribution(leads, activeBranchId, dateRange),
    [leads, activeBranchId, dateRange]
  );

  const topPerformers = useMemo(
    () => getTopPerformers(hrStaff, hrPayrollRuns, activeBranchId, dateRange),
    [hrStaff, hrPayrollRuns, activeBranchId, dateRange]
  );

  // 3. Row 3 Supporting Intelligence & Actions
  const aiInsights = useMemo(
    () => getDeterministicAiInsights(state, activeBranchId),
    [state, activeBranchId]
  );

  const upcomingTasks = useMemo(
    () => getUpcomingTasks(tasks, currentUser, activeBranchId, referenceDate),
    [tasks, currentUser, activeBranchId, referenceDate]
  );

  // 4. Row 4 Revenue & Booking Trends
  const showroomRevenue = useMemo(
    () => getShowroomRevenueTrajectory(invoices, revenueTab, activeBranchId, referenceDate),
    [invoices, revenueTab, activeBranchId, referenceDate]
  );

  const bookingTrends = useMemo(
    () => getBookingTrends(bookings, cancellations, activeBranchId, dateRange),
    [bookings, cancellations, activeBranchId, dateRange]
  );

  const isTechnician = currentUser?.role?.toLowerCase() === 'technician';

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      {/* If Technician, display dedicated operational view without sales / GST metrics */}
      {isTechnician ? (
        <TechnicianDashboardView />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-5"
        >
          {/* 1. Breadcrumb & Date Range Header */}
          <motion.div variants={cardEntranceVariants}>
            <DashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />
          </motion.div>

          {/* 2. Hero Operational Banner */}
          <motion.div variants={cardEntranceVariants}>
            <HeroBanner onQuickBayAssign={openBayModal} />
          </motion.div>

          {/* 3. Four Pastel KPI Cards (Always Today's IST figures) */}
          <motion.div variants={cardEntranceVariants}>
            <DashboardKpiCards
              grossSales={grossSalesToday}
              invoicesVsTarget={invoicesVsTarget}
              bayUtilisation={serviceBayUtilisation}
              gstOutput={gstOutputToday}
              hasFinancePermission={hasFinancePermission}
            />
          </motion.div>

          {/* 4. Row 2: Sales Performance, Lead Source Donut, Top Performers */}
          <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Sales Performance (Visible with Finance permission) */}
            {hasFinancePermission ? (
              <div className="lg:col-span-7 flex flex-col h-full">
                <SalesPerformanceChart
                  performanceData={salesPerformance}
                  selectedPeriod={salesPeriod}
                  onPeriodChange={setSalesPeriod}
                />
              </div>
            ) : null}

            {/* Lead Source Donut Chart */}
            <div className={hasFinancePermission ? 'lg:col-span-5 flex flex-col h-full' : 'lg:col-span-7 flex flex-col h-full'}>
              <LeadSourceDonutChart leadSourceData={leadSourceDistribution} />
            </div>

            {/* Top Performers (Visible with Team permission) */}
            {hasTeamPermission && (
              <div className={hasFinancePermission ? 'lg:col-span-12 xl:col-span-12' : 'lg:col-span-5'}>
                <TopPerformersCard performersData={topPerformers} hasTeamPermission={hasTeamPermission} />
              </div>
            )}
          </motion.div>

          {/* 5. Row 3: AI Copilot Insights, Upcoming Tasks, Quick Actions, Promo Carousel */}
          <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            <div className="flex flex-col h-full"><AiCopilotInsights insights={aiInsights} /></div>
            <div className="flex flex-col h-full"><UpcomingTasksCard tasks={upcomingTasks} /></div>
            <div className="flex flex-col h-full"><QuickActionsCard canPerformQuickActions={hasQuickActionsPermission} /></div>
            <div className="flex flex-col h-full"><PromoCarousel /></div>
          </motion.div>

          {/* 6. Row 4: Showroom Revenue Trajectory & Booking Trends */}
          <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Showroom Revenue Area Chart (Finance Protected) */}
            {hasFinancePermission ? (
              <div className="lg:col-span-7 flex flex-col h-full">
                <ShowroomRevenueChart
                  revenueData={showroomRevenue}
                  filterTab={revenueTab}
                  onTabChange={setRevenueTab}
                />
              </div>
            ) : null}

            {/* Booking vs Cancellation Trends */}
            <div className={hasFinancePermission ? 'lg:col-span-5 flex flex-col h-full' : 'lg:col-span-12 flex flex-col h-full'}>
              <BookingTrendsChart bookingTrendsData={bookingTrends} />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Bay Assignment Modal */}
      {bayModalOpen && (
        <Modal
          title="Quick Service Bay Allocation"
          open={bayModalOpen}
          onClose={() => setBayModalOpen(false)}
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-text-muted">
              Assign an available workshop lift to a check-in job card.
            </p>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Select Available Service Bay *
              </label>
              <select
                value={selectedBay}
                onChange={(e) => setSelectedBay(e.target.value)}
                className="w-full text-xs bg-surface-subtle border border-border rounded-lg p-2.5 text-text-main font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {freeBays.length === 0 ? (
                  <option value="">No free bays available in this branch</option>
                ) : (
                  freeBays.map((bay) => (
                    <option key={bay.id || bay.bayNumber} value={bay.bayNumber}>
                      Bay #{bay.bayNumber} ({bay.type || 'Hydraulic Lift'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Select Check-in Job Card *
              </label>
              <select
                value={selectedJobCardId}
                onChange={(e) => setSelectedJobCardId(e.target.value)}
                className="w-full text-xs bg-surface-subtle border border-border rounded-lg p-2.5 text-text-main font-medium focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {unassignedJobCards.length === 0 ? (
                  <option value="">No unassigned job cards waiting</option>
                ) : (
                  unassignedJobCards.map((jc) => (
                    <option key={jc.id} value={jc.id}>
                      {jc.jobCardNumber} — {jc.customerName} ({jc.regNumber || 'New'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setBayModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleQuickBayAssign}
                disabled={freeBays.length === 0 || unassignedJobCards.length === 0}
              >
                Assign Bay Lift
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DashboardPage;
