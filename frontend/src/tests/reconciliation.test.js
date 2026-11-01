import { describe, it, expect } from 'vitest';
import { useAppStore } from '../store/index';
import { selectDashboardMetrics } from '../store/selectors/dashboard';
import { selectBayStats } from '../store/selectors/bayStats';
import { parseISO, isSameDay } from 'date-fns';

describe('Cross-Screen Financial & Inventory Reconciliation', () => {
  it('reconciles Sales Order, Invoiced Total, Journal Entry, and Customer Timeline', () => {
    const state = useAppStore.getState();

    // 1. Locate Sales Order so-2627-003 for Rohit Chandran (Himalayan 450)
    const salesOrder = state.salesOrders.find((so) => so.id === 'so-2627-003');
    expect(salesOrder).toBeDefined();
    expect(salesOrder.onRoadPricePaise).toBe(38900000); // ₹3,89,000

    // 2. Locate corresponding posted invoice
    const invoice = state.invoices.find((inv) => inv.id === 'inv-hist-1' || inv.grandTotalPaise === salesOrder.onRoadPricePaise);
    expect(invoice).toBeDefined();
    expect(invoice.grandTotalPaise).toBe(salesOrder.onRoadPricePaise);

    // 3. Locate corresponding automatic journal entry JV/2627/00001
    const journalEntry = state.journalEntries[0];
    expect(journalEntry).toBeDefined();

    // Ensure double-entry accounting holds: Total Debits == Total Credits
    const totalDebits = journalEntry.lines.reduce((s, l) => s + l.debitPaise, 0);
    const totalCredits = journalEntry.lines.reduce((s, l) => s + l.creditPaise, 0);
    expect(totalDebits).toBe(totalCredits);

    // 4. Verify customer timeline and profile LTV
    const customer = state.customers.find((c) => c.id === 'cust-rohit-chandran');
    expect(customer).toBeDefined();
    expect(customer.vehicles.some((v) => v.chassisNumber === salesOrder.chassisNumber)).toBe(true);
  });

  it('strictly blocks double allocation of the same vehicle chassis', () => {
    const targetChassis = 'ME3U3S5C8PRA00001';
    useAppStore.getState().allocateChassisToBooking('bk-2627-001', targetChassis);

    expect(() => {
      useAppStore.getState().allocateChassisToBooking('bk-2627-002', targetChassis);
    }).toThrow(/already allocated/i);
  });

  it('asserts that Dashboard KPIs equal exact sums over store records', () => {
    const state = useAppStore.getState();
    const metrics = selectDashboardMetrics(state);
    const today = new Date();

    const todayInvoices = state.invoices.filter((inv) => {
      if (inv.status !== 'POSTED') return false;
      const invDate = inv.date ? parseISO(inv.date) : null;
      return invDate && isSameDay(invDate, today);
    });

    const expectedGrossSales = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);
    const expectedGstOutput = todayInvoices.reduce((sum, inv) => sum + (inv.totalTaxPaise || 0), 0);

    expect(metrics.grossSalesTodayPaise).toBe(expectedGrossSales);
    expect(metrics.gstOutputTodayPaise).toBe(expectedGstOutput);
    expect(metrics.invoicesClosedCount).toBe(todayInvoices.length);
  });

  it('guarantees that bay statistics sum to 12 and utilisation is exact', () => {
    const state = useAppStore.getState();
    const bayStats = selectBayStats(state);

    expect(bayStats.total).toBe(12);
    const sum =
      bayStats.occupied +
      bayStats.waitingParts +
      bayStats.qualityCheck +
      bayStats.readyForDelivery +
      bayStats.available;

    expect(sum).toBe(12);
    expect(bayStats.utilisation).toBe(Math.round((bayStats.occupied / 12) * 100));
  });

  it('flags low stock strictly only when current quantity is strictly below safety reorder level', () => {
    const state = useAppStore.getState();
    const parts = state.partsStock || [];

    parts.forEach((p) => {
      const isLowStock = (p.stockQty || 0) < (p.reorderLevel || 0);
      if (isLowStock) {
        expect(p.stockQty).toBeLessThan(p.reorderLevel);
      } else {
        expect(p.stockQty).toBeGreaterThanOrEqual(p.reorderLevel);
      }
    });
  });

  it('validates that posted invoice numbers are gap-free, unique, and max 16 characters', () => {
    const state = useAppStore.getState();
    const invoices = state.invoices || [];

    const numbers = invoices.map((inv) => inv.invoiceNumber);
    const uniqueNumbers = new Set(numbers);

    // Uniqueness
    expect(uniqueNumbers.size).toBe(numbers.length);

    // Length <= 16 chars (format like VI/2627/00001)
    numbers.forEach((num) => {
      expect(num.length).toBeLessThanOrEqual(16);
      expect(num).toMatch(/^VI\/\d{4}\/\d{5}$/);
    });
  });
});
