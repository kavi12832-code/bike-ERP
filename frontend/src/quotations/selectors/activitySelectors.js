import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { QUOTATION_STATUSES } from '../config';
import { calculateQuotationTotals } from '../math';

/**
 * Quotation Activity Selector (Plain Table, NO GRAPH)
 * Groups quotation creation & outcomes by week across the active date range.
 */
export function getQuotationWeeklyActivity(
  quotations = [],
  branchId = 'br-blr-central',
  dateRange = {}
) {
  const { startDate = new Date(), endDate = new Date() } = dateRange;
  const rangeStart = startOfDay(startDate);
  const rangeEnd = endOfDay(endDate);

  const startDay = rangeStart.getDate();
  const endDay = rangeEnd.getDate();
  const totalDays = endDay - startDay + 1;

  // Build weekly segments (e.g. Days 1-7, 8-14, 15-21, 22-28, 29-end)
  const weeks = [];
  let currentStart = new Date(rangeStart);

  let weekNum = 1;
  while (currentStart <= rangeEnd) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    const cappedEnd = currentEnd > rangeEnd ? new Date(rangeEnd) : currentEnd;

    weeks.push({
      weekLabel: `Week ${weekNum}`,
      dateRangeLabel: `${format(currentStart, 'dd')} to ${format(cappedEnd, 'dd MMM')}`,
      start: startOfDay(currentStart),
      end: endOfDay(cappedEnd),
      createdCount: 0,
      approvedCount: 0,
      convertedCount: 0,
      expiredCount: 0,
      quotedValueRupees: 0,
    });

    currentStart = new Date(cappedEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    weekNum++;
  }

  // Aggregate into weeks
  let grandTotalCreated = 0;
  let grandTotalApproved = 0;
  let grandTotalConverted = 0;
  let grandTotalExpired = 0;
  let grandTotalQuotedValue = 0;

  quotations.forEach((q) => {
    if (branchId && branchId !== 'all') {
      if (q.branchId && q.branchId !== branchId) return false;
    }

    if (!q.createdAt) return;
    const created = typeof q.createdAt === 'string' ? parseISO(q.createdAt) : new Date(q.createdAt);
    if (!isValid(created)) return;

    // Find corresponding week
    const targetWeek = weeks.find((w) => isWithinInterval(created, { start: w.start, end: w.end }));
    if (targetWeek) {
      targetWeek.createdCount += 1;
      grandTotalCreated += 1;

      const totals = calculateQuotationTotals(q);
      targetWeek.quotedValueRupees += totals.netAmountRupees;
      grandTotalQuotedValue += totals.netAmountRupees;

      if (q.status === QUOTATION_STATUSES.APPROVED) {
        targetWeek.approvedCount += 1;
        grandTotalApproved += 1;
      } else if (q.status === QUOTATION_STATUSES.CONVERTED) {
        targetWeek.convertedCount += 1;
        grandTotalConverted += 1;
      } else if (q.status === QUOTATION_STATUSES.EXPIRED) {
        targetWeek.expiredCount += 1;
        grandTotalExpired += 1;
      }
    }
  });

  return {
    weeks: weeks.map((w) => ({
      ...w,
      formattedQuotedValue: `₹ ${w.quotedValueRupees.toLocaleString('en-IN')}`,
    })),
    totals: {
      weekLabel: 'Total (Selected Range)',
      dateRangeLabel: `${format(rangeStart, 'dd MMM')} – ${format(rangeEnd, 'dd MMM')}`,
      createdCount: grandTotalCreated,
      approvedCount: grandTotalApproved,
      convertedCount: grandTotalConverted,
      expiredCount: grandTotalExpired,
      quotedValueRupees: grandTotalQuotedValue,
      formattedQuotedValue: `₹ ${grandTotalQuotedValue.toLocaleString('en-IN')}`,
    },
  };
}
