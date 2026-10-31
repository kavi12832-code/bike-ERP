import { QUOTATION_STATUSES, STATUS_CONFIG } from '../config';
import { calculateQuotationTotals } from '../math';

/**
 * Quotation Status Overview Selector (Plain List, NO GRAPH)
 * Computes count, percentage share (summing strictly to 100%), and quoted value.
 */
export function getQuotationStatusBreakdown(quotations = []) {
  const totalCount = quotations.length;

  const statusList = [
    QUOTATION_STATUSES.DRAFT,
    QUOTATION_STATUSES.PENDING_APPROVAL,
    QUOTATION_STATUSES.APPROVED,
    QUOTATION_STATUSES.SENT,
    QUOTATION_STATUSES.CONVERTED,
    QUOTATION_STATUSES.EXPIRED,
    QUOTATION_STATUSES.REJECTED,
    QUOTATION_STATUSES.CANCELLED,
  ];

  // Group and compute totals
  const grouped = {};
  statusList.forEach((st) => {
    grouped[st] = {
      status: st,
      count: 0,
      totalQuotedRupees: 0,
      config: STATUS_CONFIG[st],
    };
  });

  quotations.forEach((q) => {
    const st = q.status || QUOTATION_STATUSES.DRAFT;
    if (grouped[st]) {
      grouped[st].count += 1;
      const totals = calculateQuotationTotals(q);
      grouped[st].totalQuotedRupees += totals.netAmountRupees;
    }
  });

  // Calculate percentages summing to 100 using largest remainder method
  const items = Object.values(grouped).map((item) => {
    const rawPct = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
    const floorPct = Math.floor(rawPct);
    const remainder = rawPct - floorPct;
    return {
      ...item,
      rawPct,
      floorPct,
      remainder,
    };
  });

  if (totalCount > 0) {
    const sumFloors = items.reduce((acc, it) => acc + it.floorPct, 0);
    let diff = 100 - sumFloors;
    // Sort descending by remainder
    items.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < items.length && diff > 0; i++) {
      items[i].floorPct += 1;
      diff--;
    }
  }

  // Restore presentation order
  items.sort((a, b) => statusList.indexOf(a.status) - statusList.indexOf(b.status));

  const breakdown = items.map((it) => ({
    status: it.status,
    count: it.count,
    percentage: it.floorPct,
    formattedShare: `${it.count} (${it.floorPct}%)`,
    totalQuotedRupees: it.totalQuotedRupees,
    formattedQuotedValue: `₹ ${it.totalQuotedRupees.toLocaleString('en-IN')}`,
    dotColor: it.config.dotColor,
    badgeClass: it.config.badgeClass,
    icon: it.config.icon,
  }));

  return {
    totalQuotations: totalCount,
    totalCount,
    headerText: `${totalCount} ${totalCount === 1 ? 'quotation' : 'quotations'} total`,
    breakdown,
    rows: breakdown,
  };
}
