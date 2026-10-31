import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { BOOKING_STATUSES } from '../config.js';
import { getTokenSummary } from '../engine.js';

/**
 * Booking Activity Selector (Plain Table, strictly NO GRAPH)
 * Groups booking creation & outcomes by week across active date range.
 * Totals row strictly matches KPI cards!
 */
export function getBookingWeeklyActivity(
  bookings = [],
  branchId = 'br-blr-central',
  dateRange = {}
) {
  const { startDate = new Date(2026, 9, 1), endDate = new Date(2026, 9, 31, 23, 59, 59) } = dateRange;
  const rangeStart = startOfDay(startDate);
  const rangeEnd = endOfDay(endDate);

  const startDay = rangeStart.getDate();
  const endDay = rangeEnd.getDate();
  const totalDays = endDay - startDay + 1;

  // Split into ~4 standard weeks (01-07, 08-14, 15-21, 22-31)
  const weekDefinitions = [
    { label: 'Week 1, 01 to 07 Oct', startD: 1, endD: 7 },
    { label: 'Week 2, 08 to 14 Oct', startD: 8, endD: 14 },
    { label: 'Week 3, 15 to 21 Oct', startD: 15, endD: 21 },
    { label: 'Week 4, 22 to 31 Oct', startD: 22, endD: 31 },
  ];

  const year = rangeStart.getFullYear();
  const month = rangeStart.getMonth();

  let totalCreated = 0;
  let totalConfirmed = 0;
  let totalDelivered = 0;
  let totalCancelled = 0;
  let totalTokenPaise = 0;

  const weeks = weekDefinitions.map((w) => {
    const wStart = new Date(year, month, w.startD, 0, 0, 0, 0);
    const wEnd = new Date(year, month, Math.min(w.endD, endDay), 23, 59, 59, 999);

    const weekBookings = bookings.filter((b) => {
      if (branchId && branchId !== 'all') {
        if (b.branchId && b.branchId !== branchId) return false;
      }
      const createdStr = b.createdAt || b.bookingDate;
      if (!createdStr) return false;
      const d = typeof createdStr === 'string' ? parseISO(createdStr) : new Date(createdStr);
      if (!isValid(d)) return false;
      return isWithinInterval(d, { start: wStart, end: wEnd });
    });

    let createdCount = weekBookings.length;
    let confirmedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let tokenPaise = 0;

    weekBookings.forEach((b) => {
      if (b.status === BOOKING_STATUSES.CONFIRMED) confirmedCount++;
      else if (b.status === BOOKING_STATUSES.DELIVERED) deliveredCount++;
      else if (b.status === BOOKING_STATUSES.CANCELLED) cancelledCount++;
      tokenPaise += getTokenSummary(b).clearedPaise;
    });

    totalCreated += createdCount;
    totalConfirmed += confirmedCount;
    totalDelivered += deliveredCount;
    totalCancelled += cancelledCount;
    totalTokenPaise += tokenPaise;

    return {
      label: w.label,
      createdCount,
      confirmedCount,
      deliveredCount,
      cancelledCount,
      tokenCollectedRupees: Math.round(tokenPaise / 100),
    };
  });

  return {
    weeks,
    totalCreated,
    totalConfirmed,
    totalDelivered,
    totalCancelled,
    totalTokenCollectedRupees: Math.round(totalTokenPaise / 100),
  };
}
