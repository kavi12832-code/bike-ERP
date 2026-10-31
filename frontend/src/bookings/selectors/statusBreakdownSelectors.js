import { BOOKING_STATUSES, STATUS_CONFIG } from '../config.js';
import { getTokenSummary } from '../engine.js';

/**
 * Pure Selector for Booking Status Distribution (Plain list, strictly NO GRAPH)
 * Shares strictly sum to 100% using Largest Remainder Method
 */
export function getBookingStatusBreakdown(bookings = []) {
  const totalCount = bookings.length;

  const statuses = [
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.DELIVERED,
    BOOKING_STATUSES.CANCELLED,
  ];

  if (totalCount === 0) {
    return {
      totalCount: 0,
      totalTokenCollectedRupees: 0,
      rows: statuses.map((status) => ({
        status,
        count: 0,
        percentage: 0,
        tokenCollectedRupees: 0,
      })),
    };
  }

  let totalTokenCollectedPaise = 0;

  const rawRows = statuses.map((status) => {
    const matching = bookings.filter((b) => b.status === status);
    const count = matching.length;
    const tokenPaise = matching.reduce((sum, b) => sum + getTokenSummary(b).clearedPaise, 0);
    totalTokenCollectedPaise += tokenPaise;

    const exactPct = (count / totalCount) * 100;
    const floorPct = Math.floor(exactPct);
    const remainder = exactPct - floorPct;

    return {
      status,
      count,
      exactPct,
      floorPct,
      remainder,
      tokenCollectedRupees: Math.round(tokenPaise / 100),
    };
  });

  // Largest remainder method to guarantee sum strictly equals 100%
  const currentSum = rawRows.reduce((sum, r) => sum + r.floorPct, 0);
  const diff = 100 - currentSum;

  const sortedIndices = rawRows
    .map((r, i) => ({ index: i, remainder: r.remainder }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < diff; i++) {
    const idx = sortedIndices[i % sortedIndices.length].index;
    rawRows[idx].floorPct += 1;
  }

  const rows = rawRows.map((r) => ({
    status: r.status,
    count: r.count,
    percentage: r.floorPct,
    tokenCollectedRupees: r.tokenCollectedRupees,
  }));

  return {
    totalCount,
    totalTokenCollectedRupees: Math.round(totalTokenCollectedPaise / 100),
    rows,
  };
}
