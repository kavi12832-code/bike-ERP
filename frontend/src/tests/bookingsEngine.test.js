import { describe, it, expect } from 'vitest';
import { BOOKING_STATUSES, STATUS_CONFIG, SHOW_KPI_TRENDS, VIN_REGEX } from '../bookings/config.js';
import {
  isValidVin,
  getMinimumTokenPaise,
  getDeliveryFlag,
  isHoldExpired,
  calculateCancellationRefund,
} from '../bookings/engine.js';
import {
  getBookingsKpis,
  getBookingTabCounts,
  filterBookings,
  getBookingStatusBreakdown,
  getBookingWeeklyActivity,
  getActionableBookingsCount,
} from '../bookings/selectors/index.js';
import { SEEDED_BOOKINGS } from '../data/bookingsSeed.js';
import { SEEDED_VEHICLE_STOCK } from '../data/stockSeed.js';

describe('Bookings Engine', () => {
  it('Config & Constraints Verification', () => {
    expect(SHOW_KPI_TRENDS).toBe(false);
  });

  it('Stock Seed Verification', () => {
    expect(SEEDED_VEHICLE_STOCK.length).toBe(84);
    const uniqueVins = new Set(SEEDED_VEHICLE_STOCK.map((u) => u.vin));
    expect(uniqueVins.size).toBe(84);
    SEEDED_VEHICLE_STOCK.forEach((u) => {
      expect(isValidVin(u.vin)).toBe(true);
    });
  });

  it('Bookings Seed & Tab Counts Reconciliation', () => {
    expect(SEEDED_BOOKINGS.length).toBe(40);
    const tabCounts = getBookingTabCounts(SEEDED_BOOKINGS, 'all');
    expect(tabCounts.all).toBe(40);
    expect(tabCounts.confirmed).toBe(20);
    expect(tabCounts.pending).toBe(8);
    expect(tabCounts.delivered).toBe(8);
    expect(tabCounts.cancelled).toBe(4);
    expect(tabCounts.confirmed + tabCounts.pending + tabCounts.delivered + tabCounts.cancelled).toBe(tabCounts.all);
  });

  it('KPIs Verification', () => {
    const kpis = getBookingsKpis(SEEDED_BOOKINGS, 'all');
    expect(kpis.totalCount).toBe(40);
    expect(kpis.confirmedCount).toBe(20);
    expect(kpis.pendingCount).toBe(8);
    expect(kpis.deliveredCount).toBe(8);
    expect(kpis.cancelledCount).toBe(4);
  });

  it('Status Breakdown 100% Sum Verification', () => {
    const breakdown = getBookingStatusBreakdown(SEEDED_BOOKINGS);
    const totalPct = breakdown.rows.reduce((acc, row) => acc + row.percentage, 0);
    expect(totalPct).toBe(100);
  });

  it('Actionable Bookings Count for Sidebar Badge', () => {
    const superAdminUser = { id: 'usr-001', role: 'SUPER_ADMIN' };
    const actionableCount = getActionableBookingsCount(SEEDED_BOOKINGS, superAdminUser);
    expect(actionableCount).toBeGreaterThan(0);
  });

  it('Engine Single-Unit Gate & VIN Validation', () => {
    expect(isValidVin('ME3UJ3S5C8PRA1002')).toBe(true);
    expect(isValidVin('ME3UJ3S5C8PRA100')).toBe(false);
    expect(isValidVin('ME3UJ3S5C8PRA100022')).toBe(false);
    expect(isValidVin('ME3UJ3S5C8PRA100I')).toBe(false);
    expect(isValidVin('ME3UJ3S5C8PRA100O')).toBe(false);
    expect(isValidVin('ME3UJ3S5C8PRA100Q')).toBe(false);
  });

  it('Cancellation Refund Calculation', () => {
    const sampleBooking = SEEDED_BOOKINGS[0];
    const refund = calculateCancellationRefund(sampleBooking, 'Customer opted for another brand');
    expect(refund.refundPaise).toBeGreaterThanOrEqual(0);
  });
});
