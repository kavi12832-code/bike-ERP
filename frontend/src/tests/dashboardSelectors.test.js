import { describe, it, expect } from 'vitest';
import {
  getDayStart,
  getDayEnd,
  isSameCalendarDay,
  isWithinRange,
  getDateRangePreset,
  getPreviousPeriodRange,
  calculatePercentChange,
  formatIndianCompact,
} from '../dashboard/selectors/dateUtils';
import {
  getGrossSalesToday,
  getInvoicesVsTarget,
  getServiceBayUtilisation,
  getGstOutputToday,
} from '../dashboard/selectors/kpiSelectors';
import {
  getSalesPerformance,
  getLeadSourceDistribution,
  getShowroomRevenueTrajectory,
  getBookingTrends,
} from '../dashboard/selectors/chartSelectors';
import { getTopPerformers } from '../dashboard/selectors/performerSelectors';
import { getUpcomingTasks } from '../dashboard/selectors/taskSelectors';
import { hasPermission } from '../lib/rbac';
import { PERMISSIONS } from '../config/permissions';
import { ROLES } from '../config/roles';

describe('Dashboard Selectors Suite', () => {
  const mockRefDate = new Date(2026, 9, 31, 14, 30, 0); // 31 Oct 2026 14:30 IST

  // Sample mock invoices
  const mockInvoices = [
    {
      id: 'inv-1',
      invoiceNumber: 'VI/2627/00001',
      type: 'VEHICLE_SALE',
      status: 'POSTED',
      date: '2026-10-31T10:00:00.000Z',
      grandTotalPaise: 15000000, // 1.5 Lakhs
      taxableAmountPaise: 12500000,
      totalTaxPaise: 2500000,
      cgstPaise: 1250000,
      sgstPaise: 1250000,
      branchId: 'br-blr-central',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'VI/2627/00002',
      type: 'SERVICE',
      status: 'POSTED',
      date: '2026-10-31T11:15:00.000Z',
      grandTotalPaise: 200000, // 2,000
      taxableAmountPaise: 169492,
      totalTaxPaise: 30508,
      cgstPaise: 15254,
      sgstPaise: 15254,
      branchId: 'br-blr-central',
    },
    {
      id: 'inv-3',
      invoiceNumber: 'VI/2627/00003',
      type: 'VEHICLE_SALE',
      status: 'POSTED',
      date: '2026-10-30T16:00:00.000Z', // Yesterday
      grandTotalPaise: 10000000, // 1.0 Lakh
      taxableAmountPaise: 8474576,
      totalTaxPaise: 1525424,
      branchId: 'br-blr-central',
    },
    {
      id: 'inv-4',
      invoiceNumber: 'VI/2627/00004',
      type: 'VEHICLE_SALE',
      status: 'DRAFT', // Should NOT be included in Gross Sales
      date: '2026-10-31T12:00:00.000Z',
      grandTotalPaise: 20000000,
      branchId: 'br-blr-central',
    },
  ];

  describe('1. Date Utilities & IST Day Boundaries', () => {
    it('accurately bounds day start and day end', () => {
      const start = getDayStart(mockRefDate);
      const end = getDayEnd(mockRefDate);

      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });

    it('identifies same calendar day correctly', () => {
      const d1 = new Date(2026, 9, 31, 8, 0, 0);
      const d2 = new Date(2026, 9, 31, 23, 15, 0);
      const d3 = new Date(2026, 10, 1, 0, 5, 0);

      expect(isSameCalendarDay(d1, d2)).toBe(true);
      expect(isSameCalendarDay(d1, d3)).toBe(false);
    });

    it('computes identical duration for previous period', () => {
      const start = new Date(2026, 9, 1);
      const end = new Date(2026, 9, 31);
      const prev = getPreviousPeriodRange(start, end);

      expect(prev.days).toBe(31);
      expect(prev.endDate.getDate()).toBe(30);
      expect(prev.endDate.getMonth()).toBe(8); // September
    });

    it('formats Indian compact currency accurately', () => {
      expect(formatIndianCompact(500000)).toBe('₹5L');
      expect(formatIndianCompact(1000000)).toBe('₹10L');
      expect(formatIndianCompact(15000000)).toBe('₹1.5Cr');
      expect(formatIndianCompact(25000)).toBe('₹25K');
      expect(formatIndianCompact(450)).toBe('₹450');
      expect(formatIndianCompact(0)).toBe('₹0');
    });

    it('calculates percentage change safely without hardcoding', () => {
      // Normal positive change
      expect(calculatePercentChange(150, 100)).toBe(50);
      // Normal negative change
      expect(calculatePercentChange(80, 100)).toBe(-20);
      // Zero or missing previous returns null to avoid fake trends
      expect(calculatePercentChange(100, 0)).toBe(null);
      expect(calculatePercentChange(100, null)).toBe(null);
    });
  });

  describe('2. Pastel KPI Card Selectors', () => {
    it('computes Gross Sales Today strictly from posted invoices', () => {
      const result = getGrossSalesToday(mockInvoices, 'br-blr-central', mockRefDate);

      // inv-1 (1,50,000) + inv-2 (2,000) = 1,52,000; inv-4 (DRAFT) ignored
      expect(result.grossSalesRupees).toBe(152000);
      expect(result.invoicesCount).toBe(2);
      expect(result.sparkline.length).toBe(7);
      // Compare vs yesterday (inv-3 = 100,000)
      expect(result.deltaPercent).toBe(52); // (152,000 - 100,000) / 100,000 = +52%
    });

    it('computes Invoices vs Target and separates vehicle vs service invoices', () => {
      const result = getInvoicesVsTarget(mockInvoices, 5, 'br-blr-central', mockRefDate);

      // 1 vehicle sale, 1 service invoice today, target = 5
      expect(result.vehicleCount).toBe(1);
      expect(result.servicePartsCount).toBe(1);
      expect(result.target).toBe(5);
      expect(result.percentage).toBe(20); // 1 of 5 = 20%
    });

    it('fixes service bay utilisation (active / total bays)', () => {
      const mockBays = [
        { id: 'bay-1', bayNumber: 1, status: 'OCCUPIED', branchId: 'br-blr-central' },
        { id: 'bay-2', bayNumber: 2, status: 'OCCUPIED', branchId: 'br-blr-central' },
        { id: 'bay-3', bayNumber: 3, status: 'OCCUPIED', branchId: 'br-blr-central' },
        { id: 'bay-4', bayNumber: 4, status: 'FREE', branchId: 'br-blr-central' },
        { id: 'bay-5', bayNumber: 5, status: 'FREE', branchId: 'br-blr-central' },
        { id: 'bay-6', bayNumber: 6, status: 'FREE', branchId: 'br-blr-central' },
      ];

      const result = getServiceBayUtilisation(mockBays, [], 'br-blr-central', mockRefDate);

      // 3 active / 6 total = 50%
      expect(result.activeBays).toBe(3);
      expect(result.totalBays).toBe(6);
      expect(result.readyBays).toBe(3);
      expect(result.percentage).toBe(50);
      expect(result.hourlyBars.length).toBe(10);
    });

    it('computes GST output today with CGST/SGST breakdown and ITC offset', () => {
      const mockPurchases = [
        {
          id: 'po-1',
          status: 'RECEIVED',
          totalTaxPaise: 800000,
          branchId: 'br-blr-central',
          receivedAt: '2026-10-31T09:00:00.000Z',
        },
      ];

      const result = getGstOutputToday(mockInvoices, mockPurchases, 'br-blr-central', mockRefDate);

      // inv-1 tax (25,000) + inv-2 tax (305.08) = 25,305.08
      expect(result.outputGstRupees).toBe(25305);
      expect(result.itcCreditedRupees).toBe(8000); // 8,000
      expect(result.netLiabilityRupees).toBe(17305);
      expect(result.breakdown.cgstRupees).toBeGreaterThan(0);
      expect(result.breakdown.sgstRupees).toBeGreaterThan(0);
    });
  });

  describe('3. Chart Selectors & Donut 100% Invariant', () => {
    it('ensures lead source donut percentages sum strictly to 100%', () => {
      const mockLeads = [
        { id: 'l1', source: 'Website', date: '2026-10-15', branchId: 'br-blr-central' },
        { id: 'l2', source: 'Website', date: '2026-10-16', branchId: 'br-blr-central' },
        { id: 'l3', source: 'Walk-in', date: '2026-10-17', branchId: 'br-blr-central' },
        { id: 'l4', source: 'Referral', date: '2026-10-18', branchId: 'br-blr-central' },
        { id: 'l5', source: 'Social', date: '2026-10-19', branchId: 'br-blr-central' },
        { id: 'l6', source: 'Others', date: '2026-10-20', branchId: 'br-blr-central' },
        { id: 'l7', source: 'Walk-in', date: '2026-10-21', branchId: 'br-blr-central' },
      ];

      const dateRange = getDateRangePreset('this_month', mockRefDate);
      const result = getLeadSourceDistribution(mockLeads, 'br-blr-central', dateRange);

      const sumPercent = result.segments.reduce((acc, seg) => acc + seg.percentage, 0);
      expect(sumPercent).toBe(100);
      expect(result.totalLeads).toBe(7);
    });

    it('groups sales performance by weekday for this_week and weeks for this_month', () => {
      // Weekday grouping
      const weekResult = getSalesPerformance(mockInvoices, 'this_week', 'br-blr-central', mockRefDate);
      expect(weekResult.bars.length).toBe(7);
      expect(weekResult.bars[0].label).toBe('Mon');

      // Month weekly grouping
      const monthResult = getSalesPerformance(mockInvoices, 'this_month', 'br-blr-central', mockRefDate);
      expect(monthResult.bars.length).toBeGreaterThanOrEqual(4);
      expect(monthResult.bars[0].label).toBe('Week 1');
    });

    it('computes net showroom revenue excluding GST over 7 Days and 30 Days', () => {
      const result7 = getShowroomRevenueTrajectory(mockInvoices, '7_days', 'br-blr-central', mockRefDate);
      expect(result7.points.length).toBe(7);
      expect(result7.totalRevenueRupees).toBeGreaterThan(0);
    });

    it('computes booking vs cancellation trends per day', () => {
      const mockBookings = [
        { id: 'b1', bookingDate: '2026-10-15', branchId: 'br-blr-central' },
        { id: 'b2', bookingDate: '2026-10-15', branchId: 'br-blr-central' },
      ];
      const mockCancellations = [
        { id: 'c1', cancelledAt: '2026-10-15', branchId: 'br-blr-central' },
      ];

      const dateRange = {
        startDate: new Date(2026, 9, 14),
        endDate: new Date(2026, 9, 16),
      };

      const result = getBookingTrends(mockBookings, mockCancellations, 'br-blr-central', dateRange);
      expect(result.totalBookings).toBe(2);
      expect(result.totalCancellations).toBe(1);
      expect(result.netBookings).toBe(1);
    });
  });

  describe('4. Top Performers & Upcoming Tasks', () => {
    it('ranks top performers explicitly on Incentive Earned across sales and service', () => {
      const mockStaff = [
        {
          id: 's1',
          name: 'Deepak Rao',
          role: 'Sales Executive',
          baselineSalesIncentive: 18500,
          branchId: 'br-blr-central',
        },
        {
          id: 's2',
          name: 'Vikram Sethi',
          role: 'Sales Manager',
          baselineSalesIncentive: 42000,
          branchId: 'br-blr-central',
        },
        {
          id: 's3',
          name: 'Manoj Kumar',
          role: 'Technician',
          baselineServiceIncentive: 21500,
          branchId: 'br-blr-central',
        },
      ];

      const result = getTopPerformers(mockStaff, [], 'br-blr-central', {});
      expect(result.performers.length).toBe(3);
      // Vikram Sethi (42,000) should be #1, Manoj Kumar (21,500) #2, Deepak Rao (18,500) #3
      expect(result.performers[0].name).toBe('Vikram Sethi');
      expect(result.performers[1].name).toBe('Manoj Kumar');
      expect(result.performers[2].name).toBe('Deepak Rao');
      expect(result.metricTitle).toBe('Incentive Earned');
    });

    it('filters upcoming tasks for the current user and formats date badge', () => {
      const mockTasks = [
        {
          id: 't1',
          title: 'Hunter 350 PDI Inspection',
          dueDate: '2026-10-31',
          assignee: 'Vikram Sethi',
          branchId: 'br-blr-central',
          completed: false,
        },
        {
          id: 't2',
          title: 'Customer Followup',
          dueDate: '2026-11-01',
          assignee: 'Vikram Sethi',
          branchId: 'br-blr-central',
          completed: false,
        },
        {
          id: 't3',
          title: 'Completed Task',
          dueDate: '2026-10-31',
          assignee: 'Vikram Sethi',
          branchId: 'br-blr-central',
          completed: true, // Should be excluded
        },
      ];

      const currentUser = { name: 'Vikram Sethi', role: 'Sales Manager' };
      const tasks = getUpcomingTasks(mockTasks, currentUser, 'br-blr-central', mockRefDate);

      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Hunter 350 PDI Inspection');
      expect(tasks[0].dateBadge.day).toBe('31');
      expect(tasks[0].dateBadge.month).toBe('OCT');
    });
  });

  describe('5. RBAC & Permissions Isolation', () => {
    it('verifies Super Admin has full permissions', () => {
      const superAdmin = { role: ROLES.SUPER_ADMIN };
      expect(hasPermission(superAdmin, PERMISSIONS.DASHBOARD_VIEW)).toBe(true);
      expect(hasPermission(superAdmin, PERMISSIONS.DASHBOARD_VIEW_FINANCE)).toBe(true);
      expect(hasPermission(superAdmin, PERMISSIONS.DASHBOARD_VIEW_TEAM)).toBe(true);
      expect(hasPermission(superAdmin, PERMISSIONS.DASHBOARD_VIEW_ALL_BRANCHES)).toBe(true);
    });

    it('verifies Sales Executive has dashboard view but NOT finance permissions', () => {
      const salesExec = {
        role: ROLES.SALES_EXECUTIVE,
        permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.LEAD_VIEW_OWN],
      };
      expect(hasPermission(salesExec, PERMISSIONS.DASHBOARD_VIEW)).toBe(true);
      expect(hasPermission(salesExec, PERMISSIONS.DASHBOARD_VIEW_FINANCE)).toBe(false);
      expect(hasPermission(salesExec, PERMISSIONS.DASHBOARD_VIEW_ALL_BRANCHES)).toBe(false);
    });
  });
});

