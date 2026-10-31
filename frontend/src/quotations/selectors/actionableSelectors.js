import { QUOTATION_STATUSES } from '../config';
import { parseISO, isValid, differenceInCalendarDays, endOfDay } from 'date-fns';
import { getSimulatedNow } from '../engine';

/**
 * Computes actionable quotations count for current user to display in Sidebar badge.
 * Strictly counts items that need the active user's action:
 * - Pending Approval (if user is eligible approver, or if user created it and it's returned)
 * - Rejected items for the creator (requiring revision)
 * - Open quotations expiring within 3 days
 * Hidden when count is 0.
 */
export function getActionableQuotationsCount(
  quotations = [],
  currentUser = {},
  referenceDate = getSimulatedNow()
) {
  if (!currentUser) return 0;

  const isManagerOrAdmin =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Sales Manager' ||
    currentUser.role === 'Branch Manager';

  return quotations.filter((q) => {
    // 1. Pending Approval
    if (q.status === QUOTATION_STATUSES.PENDING_APPROVAL) {
      if (isManagerOrAdmin) return true; // Managers need to decide
      // For sales exec, if they created it, it's pending decision
      if (q.salespersonId === currentUser.id || q.createdBy === currentUser.name) return true;
    }

    // 2. Rejected (requester needs to revise)
    if (q.status === QUOTATION_STATUSES.REJECTED) {
      if (q.salespersonId === currentUser.id || q.createdBy === currentUser.name) return true;
    }

    // 3. Expiring within 3 days for open quotations
    const isOpen =
      q.status === QUOTATION_STATUSES.DRAFT ||
      q.status === QUOTATION_STATUSES.APPROVED ||
      q.status === QUOTATION_STATUSES.SENT;

    if (isOpen && q.validUntil) {
      // Must belong to user's branch / ownership
      const isOwnerOrManager =
        isManagerOrAdmin ||
        q.salespersonId === currentUser.id ||
        q.createdBy === currentUser.name;

      if (isOwnerOrManager) {
        const vDate = typeof q.validUntil === 'string' ? parseISO(q.validUntil) : new Date(q.validUntil);
        if (isValid(vDate)) {
          const daysLeft = differenceInCalendarDays(endOfDay(vDate), referenceDate);
          if (daysLeft >= 0 && daysLeft <= 3) return true;
        }
      }
    }

    return false;
  }).length;
}
