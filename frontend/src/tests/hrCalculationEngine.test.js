import { describe, it, expect } from 'vitest';
import {
  calculateAchievementPercent,
  calculatePerformanceScore,
  calculateStaffIncentives,
  calculateAttendanceAdjustment,
  calculateNetPayout,
  calculatePayrollSummary,
  validateReconciliation,
} from '../features/hr/utils/hrCalculationEngine.js';
import { SEEDED_HR_STAFF } from '../data/hrSeed.js';

describe('HR Calculation Engine', () => {
  describe('calculateAchievementPercent', () => {
    it('calculates achievement percentage correctly', () => {
      expect(calculateAchievementPercent(10, 12)).toBe(83.3);
      expect(calculateAchievementPercent(28, 30)).toBe(93.3);
      expect(calculateAchievementPercent(68, 60)).toBe(113.3);
      expect(calculateAchievementPercent(115, 120)).toBe(95.8);
    });

    it('handles zero or negative quota safely', () => {
      expect(calculateAchievementPercent(5, 0)).toBe(0);
      expect(calculateAchievementPercent(0, 0)).toBe(0);
      expect(calculateAchievementPercent(-2, 10)).toBe(0);
    });
  });

  describe('calculatePerformanceScore', () => {
    it('calculates composite performance score (50% achievement + 25% attendance + 25% quality)', () => {
      // 100% achievement (capped at 120), 100% attendance, 100% quality -> 41.67 + 25 + 25 = 91.67 -> 92
      // 120% achievement gives (120/120)*50 = 50 + 25 + 25 = 100
      expect(calculatePerformanceScore({ achievementPercent: 120, attendanceRate: 100, qualityScore: 100 })).toBe(100);

      // Capped at 120% achievement: 150% achievement gives (120/120)*50 = 50 + 25 + 25 = 100
      expect(calculatePerformanceScore({ achievementPercent: 150, attendanceRate: 100, qualityScore: 100 })).toBe(100);

      // Score for 83.3% ach, 92.3% att, 97% quality:
      // ach: (83.3/120)*50 = 34.71; att: 92.3*0.25 = 23.075; quality: 97*0.25 = 24.25; total = 82.03 -> 82
      const score = calculatePerformanceScore({ achievementPercent: 83.3, attendanceRate: 92.3, qualityScore: 97 });
      expect(score).toBe(82);
    });
  });

  describe('calculateAttendanceAdjustment', () => {
    it('calculates Loss of Pay (LOP) when enabled and attendance < working days', () => {
      // 28,000 / 26 * 2 days absent = 2153.8 -> 2154
      const lop = calculateAttendanceAdjustment({
        baseSalary: 28000,
        workingDays: 26,
        presentDays: 24,
        approvedLeaveDays: 0,
        deductLossOfPay: true,
      });
      expect(lop).toBe(-2154);
    });

    it('returns 0 when LOP is disabled or attendance is full', () => {
      expect(
        calculateAttendanceAdjustment({
          baseSalary: 28000,
          workingDays: 26,
          presentDays: 24,
          deductLossOfPay: false,
        })
      ).toBe(0);

      expect(
        calculateAttendanceAdjustment({
          baseSalary: 28000,
          workingDays: 26,
          presentDays: 26,
          deductLossOfPay: true,
        })
      ).toBe(0);
    });
  });

  describe('calculatePayrollSummary and Seed Data Reconciliation', () => {
    it('strictly reconciles exactly 28 staff members with mockup values', () => {
      const summary = calculatePayrollSummary(SEEDED_HR_STAFF);

      // 1. Exactly 28 active staff
      expect(summary.totals.totalActiveStaff).toBe(28);

      // 2. Average Target Achievement matches 96.2%
      expect(summary.totals.avgAchievement).toBe(96.2);

      // 3. Average Attendance matches 98.1%
      expect(summary.totals.avgAttendance).toBe(98.1);

      // 4. Monthly Incentive Pool matches ₹ 3.84 Lakhs
      expect(summary.totals.pool.total).toBe(384000);

      // 5. Incentive pool distribution matches:
      // Sales: 1.82L (47%)
      // Service: 1.15L (30%)
      // Bonus: 0.87L (23%)
      expect(summary.totals.pool.sales).toBe(182000);
      expect(summary.totals.pool.service).toBe(115000);
      expect(summary.totals.pool.bonus).toBe(87000);
      expect(summary.totals.pool.oem).toBe(0);

      // 6. Reconciliation check passes 100%
      const donutTotal = summary.totals.pool.sales + summary.totals.pool.service + summary.totals.pool.bonus + summary.totals.pool.oem;
      const tableTotalIncentive = summary.lines.reduce((acc, l) => acc + l.incentives.totalIncentive, 0);
      const isReconciled = validateReconciliation(summary.totals, donutTotal, tableTotalIncentive, summary.totals.pool.total);
      expect(isReconciled).toBe(true);
    });

    it('verifies first 4 staff members match mockup rows exactly', () => {
      const deepak = SEEDED_HR_STAFF[0];
      const vikram = SEEDED_HR_STAFF[1];
      const manoj = SEEDED_HR_STAFF[2];
      const ananya = SEEDED_HR_STAFF[3];

      // Deepak Rao: Sales Executive, 24 / 26 Days, 12 Quota, 10 Achieved, Base: 28k, Commission: 18.5k, Payout: 46.5k
      expect(deepak.name).toBe('Deepak Rao');
      expect(deepak.attendanceDays).toBe(24);
      expect(deepak.targetQuota).toBe(12);
      expect(deepak.achieved).toBe(10);
      expect(deepak.baseSalary).toBe(28000);
      expect(deepak.baselineSalesIncentive).toBe(18500);
      expect(deepak.baseSalary + deepak.baselineSalesIncentive).toBe(46500);

      // Vikram Sethi: Sales Manager, 25 / 26 Days, 30 Quota, 28 Achieved, Base: 55k, Commission: 42k, Payout: 97k
      expect(vikram.name).toBe('Vikram Sethi');
      expect(vikram.attendanceDays).toBe(25);
      expect(vikram.targetQuota).toBe(30);
      expect(vikram.achieved).toBe(28);
      expect(vikram.baseSalary).toBe(55000);
      expect(vikram.baselineSalesIncentive).toBe(42000);
      expect(vikram.baseSalary + vikram.baselineSalesIncentive).toBe(97000);

      // Manoj Kumar: Technician, 26 / 26 Days, 60 Quota, 68 Achieved, Base: 25k, Commission: 21.5k, Payout: 46.5k
      expect(manoj.name).toBe('Manoj Kumar');
      expect(manoj.attendanceDays).toBe(26);
      expect(manoj.targetQuota).toBe(60);
      expect(manoj.achieved).toBe(68);
      expect(manoj.baseSalary).toBe(25000);
      expect(manoj.baselineServiceIncentive).toBe(21500);
      expect(manoj.baseSalary + manoj.baselineServiceIncentive).toBe(46500);

      // Ananya Sharma: Service Advisor, 25 / 26 Days, 120 Quota, 115 Achieved, Base: 32k, Commission: 16.5k, Payout: 48.5k
      expect(ananya.name).toBe('Ananya Sharma');
      expect(ananya.attendanceDays).toBe(25);
      expect(ananya.targetQuota).toBe(120);
      expect(ananya.achieved).toBe(115);
      expect(ananya.baseSalary).toBe(32000);
      expect(ananya.baselineServiceIncentive).toBe(16500);
      expect(ananya.baseSalary + ananya.baselineServiceIncentive).toBe(48500);
    });
  });
});
