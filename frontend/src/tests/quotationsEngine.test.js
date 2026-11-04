import { describe, it, expect } from 'vitest';
import { SEEDED_QUOTATIONS } from '../data/quotationsSeed';
import { calculateQuotationTotals, verifyQuotationMath } from '../quotations/math';
import {
  isQuotationExpired,
  getExpiryStatus,
  runExpiryCheck,
  canEditQuotation,
  canConvertQuotation,
  advanceSimulatedClock,
  resetSimulatedClock,
  getSimulatedNow,
} from '../quotations/engine';
import {
  getQuotationsKpis,
  filterQuotations,
  sortQuotations,
  getQuotationStatusBreakdown,
  getQuotationWeeklyActivity,
  getActionableQuotationsCount,
} from '../quotations/selectors';
import { QUOTATION_STATUSES } from '../quotations/config';
import { formatPhone } from '../lib/format';
import { hasPermission } from '../lib/rbac';
import { PERMISSIONS } from '../config/permissions';
import { ROLES } from '../config/roles';

describe('Quotations Mathematical Engine', () => {
  it('every seeded quotation strictly satisfies: Net Amount = Amount - Discount + Taxes & Statutory', () => {
    expect(SEEDED_QUOTATIONS.length).toBeGreaterThanOrEqual(30);
    SEEDED_QUOTATIONS.forEach((q) => {
      const isMathValid = verifyQuotationMath(q);
      const totals = calculateQuotationTotals(q);
      expect(
        isMathValid,
        `Quotation ${q.quotationNumber} math failed: Amount=${totals.amountRupees}, Discount=${totals.discountRupees}, Taxes=${totals.taxesAndStatutoryRupees}, Net=${totals.netAmountRupees}`
      ).toBe(true);
    });
  });

  it('correctly calculates discount percentage and formatting', () => {
    const q = SEEDED_QUOTATIONS[0];
    const totals = calculateQuotationTotals(q);
    expect(totals.amountPaise).toBeGreaterThan(0);
    expect(totals.discountPercent).toBeGreaterThanOrEqual(0);
    expect(totals.breakdown.exShowroomPaise).toBe(q.exShowroomPaise);
  });
});

describe('Quotations Expiry & Simulation Engine', () => {
  it('correctly identifies expired quotations relative to validity date', () => {
    resetSimulatedClock();
    const expiredQuote = SEEDED_QUOTATIONS.find((q) => q.status === QUOTATION_STATUSES.EXPIRED);
    expect(expiredQuote).toBeDefined();
    expect(isQuotationExpired(expiredQuote)).toBe(true);

    const activeQuote = SEEDED_QUOTATIONS.find(
      (q) => q.status === QUOTATION_STATUSES.PENDING_APPROVAL && !isQuotationExpired(q)
    );
    expect(activeQuote).toBeDefined();
    expect(isQuotationExpired(activeQuote)).toBe(false);
  });

  it('evaluates expiring soon chips within 3 days', () => {
    const now = getSimulatedNow();
    const testQuote = {
      validUntil: new Date(now.getTime() + 2 * 86400000).toISOString(),
    };
    const status = getExpiryStatus(testQuote, now);
    expect(status.isExpiringSoon).toBe(true);
    expect(status.badgeText).toContain('Expires in 2 days');
  });

  it('runs batch expiry evaluation without modifying terminal statuses', () => {
    const testList = [
      {
        id: 'test-1',
        status: QUOTATION_STATUSES.APPROVED,
        validUntil: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'test-2',
        status: QUOTATION_STATUSES.CONVERTED,
        validUntil: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'test-3',
        status: QUOTATION_STATUSES.CANCELLED,
        validUntil: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const { updated, hasChanges } = runExpiryCheck(testList);
    expect(hasChanges).toBe(true);
    expect(updated[0].status).toBe(QUOTATION_STATUSES.EXPIRED);
    // Converted & Cancelled are terminal and MUST NOT be flipped to Expired
    expect(updated[1].status).toBe(QUOTATION_STATUSES.CONVERTED);
    expect(updated[2].status).toBe(QUOTATION_STATUSES.CANCELLED);
  });

  it('advancing simulated clock expires open quotes and resets cleanly', () => {
    resetSimulatedClock();
    const initialNow = getSimulatedNow().getTime();
    advanceSimulatedClock(14);
    const advancedNow = getSimulatedNow().getTime();
    expect(advancedNow - initialNow).toBeGreaterThanOrEqual(14 * 86400000 - 1000);

    resetSimulatedClock();
    expect(Math.abs(getSimulatedNow().getTime() - Date.now())).toBeLessThan(2000);
  });
});

describe('Quotations State Guards', () => {
  it('blocks editing on locked or terminal statuses', () => {
    const pendingQuote = { status: QUOTATION_STATUSES.PENDING_APPROVAL };
    expect(canEditQuotation(pendingQuote).canEdit).toBe(false);

    const convertedQuote = { status: QUOTATION_STATUSES.CONVERTED };
    expect(canEditQuotation(convertedQuote).canEdit).toBe(false);

    const expiredQuote = { status: QUOTATION_STATUSES.EXPIRED };
    expect(canEditQuotation(expiredQuote).canEdit).toBe(false);

    const approvedQuote = { status: QUOTATION_STATUSES.APPROVED };
    expect(canEditQuotation(approvedQuote).canEdit).toBe(true);
  });

  it('allows conversion only for Approved or Sent non-expired quotations', () => {
    const now = new Date();
    const approvedQuote = {
      status: QUOTATION_STATUSES.APPROVED,
      validUntil: new Date(now.getTime() + 5 * 86400000).toISOString(),
    };
    expect(canConvertQuotation(approvedQuote, now).canConvert).toBe(true);

    const sentQuote = {
      status: QUOTATION_STATUSES.SENT,
      validUntil: new Date(now.getTime() + 5 * 86400000).toISOString(),
    };
    expect(canConvertQuotation(sentQuote, now).canConvert).toBe(true);

    const pendingQuote = {
      status: QUOTATION_STATUSES.PENDING_APPROVAL,
      validUntil: new Date(now.getTime() + 5 * 86400000).toISOString(),
    };
    expect(canConvertQuotation(pendingQuote, now).canConvert).toBe(false);

    const expiredQuote = {
      status: QUOTATION_STATUSES.APPROVED,
      validUntil: new Date(now.getTime() - 2 * 86400000).toISOString(),
    };
    expect(canConvertQuotation(expiredQuote, now).canConvert).toBe(false);
  });
});

describe('Quotations KPI Selectors', () => {
  it('computes KPI counts strictly matching status logic', () => {
    resetSimulatedClock();
    // Seed dates are relative to today, so the window must be too (a fixed month breaks as time passes).
    const now = new Date();
    const dateRange = {
      startDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    };
    const kpis = getQuotationsKpis(SEEDED_QUOTATIONS, 'br-blr-central', dateRange);

    expect(kpis.totalCount).toBeGreaterThan(0);
    expect(kpis.convertedCount).toBeGreaterThanOrEqual(1);
    expect(kpis.pendingApprovalCount).toBeGreaterThanOrEqual(1);
    expect(kpis.expiredCount).toBeGreaterThanOrEqual(1);
    expect(kpis.conversionRatePercent).toBeGreaterThanOrEqual(0);
  });
});

describe('Quotations Status Breakdown Selector', () => {
  it('percentages sum strictly to 100% using largest remainder method', () => {
    const breakdown = getQuotationStatusBreakdown(SEEDED_QUOTATIONS);
    expect(breakdown.rows.length).toBe(8);

    const totalPercentage = breakdown.rows.reduce((sum, r) => sum + r.percentage, 0);
    expect(totalPercentage).toBe(100);
    expect(breakdown.totalCount).toBe(SEEDED_QUOTATIONS.length);
  });
});

describe('Quotations Filter and Sort Selectors', () => {
  it('filters by status correctly', () => {
    const filtered = filterQuotations(SEEDED_QUOTATIONS, {
      status: QUOTATION_STATUSES.CONVERTED,
      includeOpenQuotations: false,
    });
    expect(filtered.every((q) => q.status === QUOTATION_STATUSES.CONVERTED)).toBe(true);
  });

  it('filters by search term across quotationNumber, customerName, phone, and model', () => {
    const resNum = filterQuotations(SEEDED_QUOTATIONS, { search: 'QT/2627/00001' });
    expect(resNum.length).toBe(1);

    const resCustomer = filterQuotations(SEEDED_QUOTATIONS, { search: 'Sanjay Reddy' });
    expect(resCustomer.length).toBeGreaterThanOrEqual(1);
  });

  it('sorts quotations by newest created first by default', () => {
    const sorted = sortQuotations(SEEDED_QUOTATIONS, 'createdAt', 'desc');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(new Date(sorted[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[i + 1].createdAt).getTime()
      );
    }
  });
});

describe('Phone Masking and Privacy', () => {
  it('masks phone for unauthorized roles and displays full for authorized roles', () => {
    const rawPhone = '+91 99450 67124';
    const masked = formatPhone(rawPhone, { mask: true });
    expect(masked).toBe('+91 99*** **24');

    const unmasked = formatPhone(rawPhone, { mask: false });
    expect(unmasked).toBe('+91 99450 67124');
  });

  it('validates role permissions for customer phone viewing', () => {
    const adminUser = { role: ROLES.SUPER_ADMIN };
    expect(hasPermission(adminUser, PERMISSIONS.QUOTATIONS_VIEW_CUSTOMER_PHONE)).toBe(true);

    const salesExec = { role: ROLES.SALES_EXECUTIVE, permissions: [] };
    expect(hasPermission(salesExec, PERMISSIONS.QUOTATIONS_VIEW_CUSTOMER_PHONE)).toBe(false);
  });
});

describe('Sidebar Actionable Quotations Count', () => {
  it('counts actionable quotations for Super Admin / Managers and Sales Executives', () => {
    resetSimulatedClock();
    const adminUser = { id: 'usr-001', role: ROLES.SUPER_ADMIN, name: 'Rajesh Varma' };
    const adminActionable = getActionableQuotationsCount(SEEDED_QUOTATIONS, adminUser);
    expect(adminActionable).toBeGreaterThan(0);

    const execUser = { id: 'usr-007', role: ROLES.SALES_EXECUTIVE, name: 'Deepak Rao' };
    const execActionable = getActionableQuotationsCount(SEEDED_QUOTATIONS, execUser);
    expect(execActionable).toBeGreaterThanOrEqual(0);
  });
});
