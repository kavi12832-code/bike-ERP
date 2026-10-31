import { parseISO, isValid, differenceInCalendarDays, startOfDay, isBefore } from 'date-fns';
import { BOOKING_STATUSES } from '../config.js';
import { getSimulatedNow } from '../engine.js';

/**
 * Computes actionable bookings count for the current user to display in the Sidebar badge.
 * Strictly counts items needing current user's action:
 * - Pending approvals that the user can act on
 * - Deliveries due in <= 2 days
 * - Deliveries overdue
 * Hidden when count is 0.
 */
export function getActionableBookingsCount(
  bookings = [],
  currentUser = {},
  referenceDate = getSimulatedNow()
) {
  if (!currentUser) return 0;

  const isManagerOrAdmin =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Branch Manager' ||
    currentUser.role === 'Sales Manager';

  const isSalesExec = currentUser.role === 'Sales Executive';
  const nowStart = startOfDay(referenceDate);

  let actionableCount = 0;

  bookings.forEach((b) => {
    // Branch scope check: Managers & Staff see their branch
    if (!isManagerOrAdmin && b.branchId && currentUser.branchId && b.branchId !== currentUser.branchId) {
      return;
    }

    // If Sales Exec, only check their own bookings
    if (isSalesExec) {
      const isOwner =
        b.salespersonId === currentUser.id ||
        b.salesExecutive === currentUser.name ||
        b.salespersonName === currentUser.name;
      if (!isOwner) return;
    }

    const isOpen = b.status === BOOKING_STATUSES.PENDING || b.status === BOOKING_STATUSES.CONFIRMED;
    if (!isOpen) return;

    // 1. Pending Approvals
    if (b.approvalRequestId && b.approvalStatus === 'PENDING') {
      if (isManagerOrAdmin) {
        actionableCount++;
        return;
      }
    }

    // 2. Deliveries due in <= 2 days or Overdue
    const estDateInput = b.estDelivery || b.tentativeDeliveryDate;
    if (estDateInput) {
      const estDate = typeof estDateInput === 'string' ? parseISO(estDateInput) : new Date(estDateInput);
      if (isValid(estDate)) {
        const estStart = startOfDay(estDate);
        if (isBefore(estStart, nowStart)) {
          // Overdue
          actionableCount++;
          return;
        }

        const daysUntil = differenceInCalendarDays(estStart, nowStart);
        if (daysUntil <= 2 && daysUntil >= 0) {
          // Due in 2 days
          actionableCount++;
          return;
        }
      }
    }
  });

  return actionableCount;
}
