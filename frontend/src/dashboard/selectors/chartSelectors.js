import {
  parseDateSafe,
  isSameCalendarDay,
  isWithinRange,
  getDateRangePreset,
  getPreviousPeriodRange,
  calculatePercentChange,
  getDayStart,
  getDayEnd,
  formatIndianCompact,
} from './dateUtils';
import { matchesBranch } from './kpiSelectors';
import {
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  format,
} from 'date-fns';

/**
 * 1. Sales Performance Selector
 * Supports periods:
 * - 'this_week': Monday to Sunday of the active week.
 * - 'this_month': Grouped into Weeks (Week 1, Week 2, Week 3, Week 4, Week 5).
 * - 'last_month': Grouped into Weeks for the previous month.
 */
export function getSalesPerformance(
  invoices = [],
  periodKey = 'this_week',
  branchId = 'br-blr-central',
  referenceDate = new Date()
) {
  const ref = parseDateSafe(referenceDate) || new Date();

  let bars = [];
  let totalSalesPaise = 0;
  let totalTargetPaise = 0;
  let previousTotalSalesPaise = 0;

  if (periodKey === 'this_week') {
    // Monday to Sunday
    const weekStart = startOfWeek(ref, { weekStartsOn: 1 });
    const prevWeekStart = subDays(weekStart, 7);

    // Days Mon-Sun
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyTargetRupees = 350000; // Baseline daily showroom target ~3.5L

    bars = dayNames.map((name, i) => {
      const curDay = addDays(weekStart, i);
      const prevDay = addDays(prevWeekStart, i);

      // Current week day invoices
      const dayInvoices = invoices.filter((inv) => {
        if (inv.status !== 'POSTED') return false;
        if (!matchesBranch(inv, branchId)) return false;
        const d = parseDateSafe(inv.date || inv.postedAt);
        return isSameCalendarDay(d, curDay);
      });
      const daySalesPaise = dayInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);
      const daySalesRupees = Math.round(daySalesPaise / 100);

      // Previous week day invoices
      const prevInvoices = invoices.filter((inv) => {
        if (inv.status !== 'POSTED') return false;
        if (!matchesBranch(inv, branchId)) return false;
        const d = parseDateSafe(inv.date || inv.postedAt);
        return isSameCalendarDay(d, prevDay);
      });
      const prevSalesPaise = prevInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);
      const prevSalesRupees = Math.round(prevSalesPaise / 100);

      totalSalesPaise += daySalesPaise;
      totalTargetPaise += dailyTargetRupees * 100;
      previousTotalSalesPaise += prevSalesPaise;

      const achievementPct =
        dailyTargetRupees > 0 ? Math.round((daySalesRupees / dailyTargetRupees) * 100) : 0;
      const changePct = calculatePercentChange(daySalesRupees, prevSalesRupees);

      return {
        label: name,
        fullDateStr: format(curDay, 'dd MMM yyyy'),
        salesRupees: daySalesRupees,
        targetRupees: dailyTargetRupees,
        achievementPct,
        changePct,
        previousSalesRupees: prevSalesRupees,
        formattedSales: formatIndianCompact(daySalesRupees),
        formattedTarget: formatIndianCompact(dailyTargetRupees),
      };
    });
  } else {
    // 'this_month' or 'last_month' -> Grouped by weeks (Week 1, Week 2, Week 3, Week 4, etc.)
    const monthRef = periodKey === 'last_month' ? subMonths(ref, 1) : ref;
    const mStart = startOfMonth(monthRef);
    const mEnd = endOfMonth(monthRef);

    // Prior month for comparison
    const prevMStart = startOfMonth(subMonths(monthRef, 1));
    const prevMEnd = endOfMonth(subMonths(monthRef, 1));

    // Calculate weekly intervals (e.g. days 1-7, 8-14, 15-21, 22-28, 29-end)
    const weeks = [
      { label: 'Week 1', startDay: 1, endDay: 7 },
      { label: 'Week 2', startDay: 8, endDay: 14 },
      { label: 'Week 3', startDay: 15, endDay: 21 },
      { label: 'Week 4', startDay: 22, endDay: 28 },
      { label: 'Week 5', startDay: 29, endDay: mEnd.getDate() },
    ];

    const weeklyTargetRupees = 2500000; // ~25L weekly target

    bars = weeks
      .filter((w) => w.startDay <= mEnd.getDate())
      .map((w) => {
        const weekStartDate = new Date(monthRef.getFullYear(), monthRef.getMonth(), w.startDay);
        const weekEndDate = new Date(
          monthRef.getFullYear(),
          monthRef.getMonth(),
          Math.min(w.endDay, mEnd.getDate())
        );

        const weekInvoices = invoices.filter((inv) => {
          if (inv.status !== 'POSTED') return false;
          if (!matchesBranch(inv, branchId)) return false;
          const d = parseDateSafe(inv.date || inv.postedAt);
          return isWithinRange(d, weekStartDate, weekEndDate);
        });

        const weekSalesPaise = weekInvoices.reduce(
          (sum, inv) => sum + (inv.grandTotalPaise || 0),
          0
        );
        const weekSalesRupees = Math.round(weekSalesPaise / 100);

        // Previous month equivalent week
        const prevWeekStart = new Date(
          prevMStart.getFullYear(),
          prevMStart.getMonth(),
          w.startDay
        );
        const prevWeekEnd = new Date(
          prevMStart.getFullYear(),
          prevMStart.getMonth(),
          Math.min(w.endDay, prevMEnd.getDate())
        );
        const prevInvoices = invoices.filter((inv) => {
          if (inv.status !== 'POSTED') return false;
          if (!matchesBranch(inv, branchId)) return false;
          const d = parseDateSafe(inv.date || inv.postedAt);
          return isWithinRange(d, prevWeekStart, prevWeekEnd);
        });
        const prevSalesPaise = prevInvoices.reduce(
          (sum, inv) => sum + (inv.grandTotalPaise || 0),
          0
        );
        const prevSalesRupees = Math.round(prevSalesPaise / 100);

        totalSalesPaise += weekSalesPaise;
        totalTargetPaise += weeklyTargetRupees * 100;
        previousTotalSalesPaise += prevSalesPaise;

        const achievementPct =
          weeklyTargetRupees > 0
            ? Math.round((weekSalesRupees / weeklyTargetRupees) * 100)
            : 0;
        const changePct = calculatePercentChange(weekSalesRupees, prevSalesRupees);

        return {
          label: w.label,
          fullDateStr: `${format(weekStartDate, 'dd MMM')} – ${format(weekEndDate, 'dd MMM')}`,
          salesRupees: weekSalesRupees,
          targetRupees: weeklyTargetRupees,
          achievementPct,
          changePct,
          previousSalesRupees: prevSalesRupees,
          formattedSales: formatIndianCompact(weekSalesRupees),
          formattedTarget: formatIndianCompact(weeklyTargetRupees),
        };
      });
  }

  const totalSalesRupees = Math.round(totalSalesPaise / 100);
  const totalTargetRupees = Math.round(totalTargetPaise / 100);
  const totalAchievementPct =
    totalTargetRupees > 0 ? Math.round((totalSalesRupees / totalTargetRupees) * 100) : 0;
  const overallChangePct = calculatePercentChange(totalSalesPaise, previousTotalSalesPaise);

  return {
    bars,
    totalSalesRupees,
    totalTargetRupees,
    formattedTotalSales: `₹ ${totalSalesRupees.toLocaleString('en-IN')}`,
    compactTotalSales: formatIndianCompact(totalSalesRupees),
    formattedTotalTarget: `₹ ${totalTargetRupees.toLocaleString('en-IN')}`,
    compactTotalTarget: formatIndianCompact(totalTargetRupees),
    achievementPct: totalAchievementPct,
    changePct: overallChangePct,
  };
}

/**
 * 2. Lead Source Distribution Selector
 * Segments leads by source in the active date range and branch.
 * Enforces that percentage components sum exactly to 100%.
 */
export function getLeadSourceDistribution(leads = [], branchId = 'br-blr-central', dateRange = {}) {
  const { startDate = startOfMonth(new Date()), endDate = endOfMonth(new Date()) } = dateRange;

  const inScopeLeads = leads.filter((l) => {
    if (!matchesBranch(l, branchId)) return false;
    const d = parseDateSafe(l.createdAt || l.date);
    return isWithinRange(d, startDate, endDate);
  });

  const totalLeads = inScopeLeads.length;

  // Source colors palette matching light navy theme
  const sourceColors = {
    Website: '#3b82f6', // blue
    'Walk-in': '#10b981', // green
    Walkin: '#10b981',
    Referral: '#8b5cf6', // purple
    Social: '#ec4899', // pink
    Campaign: '#f59e0b', // amber
    Others: '#64748b', // slate
  };

  // Canonicalize sources: Website, Walk-in, Referral, Others
  const rawCounts = {};
  inScopeLeads.forEach((l) => {
    let src = l.source || 'Others';
    if (/web|online|portal|internet/i.test(src)) src = 'Website';
    else if (/walk|showroom|visit|counter/i.test(src)) src = 'Walk-in';
    else if (/refer|friend|word/i.test(src)) src = 'Referral';
    else if (/campaign|whatsapp|facebook|insta|social/i.test(src)) src = 'Campaign';
    else src = 'Others';

    rawCounts[src] = (rawCounts[src] || 0) + 1;
  });

  // Ensure default segments exist if there is data
  const candidateSources = ['Website', 'Walk-in', 'Referral', 'Others'];
  candidateSources.forEach((src) => {
    if (!rawCounts[src]) rawCounts[src] = 0;
  });

  // Compute percentages that sum to exactly 100 using largest remainder method
  const items = Object.entries(rawCounts).map(([source, count]) => {
    const rawPct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    const floorPct = Math.floor(rawPct);
    const remainder = rawPct - floorPct;
    return {
      source,
      count,
      rawPct,
      floorPct,
      remainder,
      color: sourceColors[source] || '#64748b',
    };
  });

  if (totalLeads > 0) {
    const sumFloors = items.reduce((acc, it) => acc + it.floorPct, 0);
    let diff = 100 - sumFloors;

    // Distribute remaining points to largest remainders
    items.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < items.length && diff > 0; i++) {
      items[i].floorPct += 1;
      diff--;
    }
  }

  // Restore canonical presentation order
  const order = ['Website', 'Walk-in', 'Referral', 'Campaign', 'Others'];
  items.sort((a, b) => order.indexOf(a.source) - order.indexOf(b.source));

  const segments = items.map((it) => ({
    source: it.source,
    count: it.count,
    percentage: it.floorPct,
    color: it.color,
  }));

  return {
    totalLeads,
    segments,
    centerLabel: `${totalLeads} Total Leads`,
  };
}

/**
 * 3. Showroom Revenue Trajectory Selector
 * Area chart for revenue = net invoice value (vehicles, service, parts) excluding GST.
 * Tabs: '7_days', '30_days', 'this_month'
 */
export function getShowroomRevenueTrajectory(
  invoices = [],
  filterTab = '30_days',
  branchId = 'br-blr-central',
  referenceDate = new Date()
) {
  const ref = parseDateSafe(referenceDate) || new Date();

  let daysCount = 30;
  let intervalStart;
  let intervalEnd = getDayEnd(ref);

  if (filterTab === '7_days') {
    daysCount = 7;
    intervalStart = getDayStart(subDays(ref, 6));
  } else if (filterTab === 'this_month') {
    intervalStart = getDayStart(startOfMonth(ref));
    intervalEnd = getDayEnd(ref);
  } else {
    // '30_days'
    daysCount = 30;
    intervalStart = getDayStart(subDays(ref, 29));
  }

  const daysInterval = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  let totalNetPaise = 0;

  const points = daysInterval.map((day) => {
    const dayInvoices = invoices.filter((inv) => {
      if (inv.status !== 'POSTED') return false;
      if (!matchesBranch(inv, branchId)) return false;
      const d = parseDateSafe(inv.date || inv.postedAt);
      return isSameCalendarDay(d, day);
    });

    let dayVehicleNetPaise = 0;
    let dayServiceNetPaise = 0;
    let dayPartsNetPaise = 0;

    dayInvoices.forEach((inv) => {
      // Net invoice value excluding GST = taxableAmountPaise
      const netPaise = inv.taxableAmountPaise || (inv.grandTotalPaise ? Math.round(inv.grandTotalPaise / 1.18) : 0);
      if (inv.type === 'VEHICLE_SALE') {
        dayVehicleNetPaise += netPaise;
      } else if (inv.type === 'PARTS_COUNTER') {
        dayPartsNetPaise += netPaise;
      } else {
        dayServiceNetPaise += netPaise;
      }
    });

    const dayTotalNetPaise = dayVehicleNetPaise + dayServiceNetPaise + dayPartsNetPaise;
    totalNetPaise += dayTotalNetPaise;

    const netRupees = Math.round(dayTotalNetPaise / 100);
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'dd MMM'),
      revenueRupees: netRupees,
      vehicleRupees: Math.round(dayVehicleNetPaise / 100),
      serviceRupees: Math.round(dayServiceNetPaise / 100),
      partsRupees: Math.round(dayPartsNetPaise / 100),
      invoicesCount: dayInvoices.length,
      formattedRevenue: formatIndianCompact(netRupees),
    };
  });

  const totalRevenueRupees = Math.round(totalNetPaise / 100);

  return {
    points,
    totalRevenueRupees,
    formattedTotalRevenue: `₹ ${totalRevenueRupees.toLocaleString('en-IN')}`,
    compactTotalRevenue: formatIndianCompact(totalRevenueRupees),
  };
}

/**
 * 4. Booking Trends Selector
 * Two lines: Bookings and Cancellations per day over selected range.
 */
export function getBookingTrends(bookings = [], cancellations = [], branchId = 'br-blr-central', dateRange = {}) {
  const { startDate = startOfMonth(new Date()), endDate = endOfMonth(new Date()) } = dateRange;

  const start = getDayStart(startDate);
  const end = getDayEnd(endDate);
  const daysInterval = eachDayOfInterval({ start, end });

  let totalBookings = 0;
  let totalCancellations = 0;

  const points = daysInterval.map((day) => {
    // In-scope bookings for this day
    const dayBookings = bookings.filter((b) => {
      if (!matchesBranch(b, branchId)) return false;
      const d = parseDateSafe(b.bookingDate || b.createdAt);
      return isSameCalendarDay(d, day);
    });

    // In-scope cancellations for this day
    const dayCancellations = cancellations.filter((c) => {
      if (!matchesBranch(c, branchId)) return false;
      const d = parseDateSafe(c.cancelledAt || c.date || c.createdAt);
      return isSameCalendarDay(d, day);
    });

    const bookingsCount = dayBookings.length;
    const cancellationsCount = dayCancellations.length;

    totalBookings += bookingsCount;
    totalCancellations += cancellationsCount;

    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'dd MMM'),
      bookings: bookingsCount,
      cancellations: cancellationsCount,
    };
  });

  return {
    points,
    totalBookings,
    totalCancellations,
    netBookings: totalBookings - totalCancellations,
  };
}
