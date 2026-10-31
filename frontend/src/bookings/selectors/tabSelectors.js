import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { BOOKING_STATUSES } from '../config';
import { getSimulatedNow } from '../engine';

/**
 * Pure Selector for Booking Tab Badges
 * All, Pending, Confirmed, Delivered, Cancelled
 * Reconciles strictly: PENDING + CONFIRMED + DELIVERED + CANCELLED === ALL
 */
export function getBookingTabCounts(
  bookings = [],
  branchId = 'all',
  dateRange = {},
  includeOpenBookings = true,
  referenceDate = getSimulatedNow()
) {
  const { startDate = new Date(2026, 9, 1), endDate = referenceDate } = dateRange;
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const scoped = bookings.filter((b) => {
    if (branchId && branchId !== 'all') {
      if (b.branchId && b.branchId !== branchId) return false;
    }

    const isOpen = b.status === BOOKING_STATUSES.PENDING || b.status === BOOKING_STATUSES.CONFIRMED;
    if (includeOpenBookings && isOpen) return true;

    const createdStr = b.createdAt || b.bookingDate;
    if (!createdStr) return true;
    const createdDate = typeof createdStr === 'string' ? parseISO(createdStr) : new Date(createdStr);
    if (!isValid(createdDate)) return true;

    return isWithinInterval(createdDate, { start, end });
  });

  const counts = {
    ALL: scoped.length,
    all: scoped.length,
    [BOOKING_STATUSES.PENDING]: 0,
    [BOOKING_STATUSES.CONFIRMED]: 0,
    [BOOKING_STATUSES.DELIVERED]: 0,
    [BOOKING_STATUSES.CANCELLED]: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
  };

  scoped.forEach((b) => {
    if (counts[b.status] !== undefined) {
      counts[b.status]++;
    }
    const lower = b.status?.toLowerCase();
    if (counts[lower] !== undefined) {
      counts[lower]++;
    }
  });

  return counts;
}

