import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { BOOKING_STATUSES } from '../config';
import { getSimulatedNow } from '../engine';

/**
 * Pure Selector for Bookings KPI Cards
 * Respects branch scope and date range, but NOT table search, tab or filter criteria.
 * Strict Reconciliation Invariant:
 * confirmedCount + pendingCount + deliveredCount + cancelledCount === totalCount
 */
export function getBookingsKpis(
  bookings = [],
  branchId = 'all',
  dateRange = {},
  referenceDate = getSimulatedNow()
) {
  const { startDate = new Date(2026, 9, 1), endDate = referenceDate } = dateRange;
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Filter bookings in branch scope and created within the active date range
  const scoped = bookings.filter((b) => {
    // Branch scope
    if (branchId && branchId !== 'all') {
      if (b.branchId && b.branchId !== branchId) return false;
    }

    // Created Date interval
    const createdStr = b.createdAt || b.bookingDate;
    if (!createdStr) return true;
    const createdDate = typeof createdStr === 'string' ? parseISO(createdStr) : new Date(createdStr);
    if (!isValid(createdDate)) return true;

    return isWithinInterval(createdDate, { start, end });
  });

  const totalCount = scoped.length;
  let confirmedCount = 0;
  let pendingCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;

  scoped.forEach((b) => {
    if (b.status === BOOKING_STATUSES.CONFIRMED) confirmedCount++;
    else if (b.status === BOOKING_STATUSES.PENDING) pendingCount++;
    else if (b.status === BOOKING_STATUSES.DELIVERED) deliveredCount++;
    else if (b.status === BOOKING_STATUSES.CANCELLED) cancelledCount++;
  });

  const confirmedSharePercent = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;
  const deliveredSharePercent = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0;

  return {
    totalCount,
    confirmedCount,
    pendingCount,
    deliveredCount,
    cancelledCount,
    confirmedSharePercent,
    deliveredSharePercent,
  };
}

