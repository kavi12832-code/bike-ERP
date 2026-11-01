import { QUOTATION_STATUSES } from '../config';
import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, differenceInCalendarDays } from 'date-fns';
import { getSimulatedNow, isQuotationExpired } from '../engine';

/**
 * Pure Selector for Quotation KPI Cards
 * Respects branch scope and date range, but NOT the table status or search filters.
 */
export function getQuotationsKpis(
  quotations = [],
  branchId = 'br-blr-central',
  dateRange = {},
  referenceDate = getSimulatedNow()
) {
  const { startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1), endDate = referenceDate } = dateRange;

  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Filter quotations strictly in branch scope and date range
  const inScope = quotations.filter((q) => {
    if (branchId && branchId !== 'all') {
      if (q.branchId && q.branchId !== branchId) return false;
    }

    if (!q.createdAt) return false;
    const created = typeof q.createdAt === 'string' ? parseISO(q.createdAt) : new Date(q.createdAt);
    if (!isValid(created)) return false;

    return isWithinInterval(created, { start, end });
  });

  const totalQuotations = inScope.length;

  // Converted to Booking (Strictly CONVERTED status only, not Approved)
  const convertedQuotations = inScope.filter((q) => q.status === QUOTATION_STATUSES.CONVERTED);
  const convertedCount = convertedQuotations.length;
  const conversionRate = totalQuotations > 0 ? Math.round((convertedCount / totalQuotations) * 1000) / 10 : 0;

  // Pending Approval count
  const pendingApprovalCount = inScope.filter(
    (q) => q.status === QUOTATION_STATUSES.PENDING_APPROVAL
  ).length;

  // Expired count
  const expiredCount = inScope.filter(
    (q) => q.status === QUOTATION_STATUSES.EXPIRED || isQuotationExpired(q, referenceDate)
  ).length;

  // Expiring within 3 days count
  const expiringSoonCount = inScope.filter((q) => {
    if (q.status === QUOTATION_STATUSES.CONVERTED || q.status === QUOTATION_STATUSES.CANCELLED || q.status === QUOTATION_STATUSES.EXPIRED) {
      return false;
    }
    if (!q.validUntil) return false;
    const vDate = typeof q.validUntil === 'string' ? parseISO(q.validUntil) : new Date(q.validUntil);
    if (!isValid(vDate)) return false;
    const daysLeft = differenceInCalendarDays(endOfDay(vDate), referenceDate);
    return daysLeft >= 0 && daysLeft <= 3;
  }).length;

  return {
    totalQuotations,
    totalCount: totalQuotations,
    convertedCount,
    conversionRate,
    conversionRatePercent: conversionRate,
    conversionRateText: `${conversionRate}% of quotations converted`,
    pendingApprovalCount,
    expiredCount,
    expiringSoonCount,
    expiredSubtext: `${expiringSoonCount} more expire within 3 days`,
  };
}
