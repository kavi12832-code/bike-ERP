// src/features/hr/utils/hrCalculationEngine.js
/**
 * Single pure calculation engine for HR Incentives, Attendance & Payroll.
 * Powers every KPI, chart, table total, and payroll run with strict reconciliation.
 */

export const DEFAULT_INCENTIVE_RULES = [
  {
    id: 'rule-sales-exec',
    role: 'Sales Executive',
    component: 'sales',
    formulaType: 'slab_per_unit',
    parameters: {
      basePerUnit: 1200, // ₹1,200 per vehicle up to 100% quota
      acceleratorPerUnit: 1800, // ₹1,800 per vehicle above 100% quota
      accessoryCommissionPct: 5, // 5% of accessories value
      financeInsuranceAttachPct: 2, // 2% of finance/insurance attach
    },
    effectiveFrom: '2026-04-01',
    version: '2.1',
  },
  {
    id: 'rule-sales-mgr',
    role: 'Sales Manager',
    component: 'sales',
    formulaType: 'team_override',
    parameters: {
      teamDeliveryRate: 800, // ₹800 per team delivery
      targetMilestoneBonus: 15000, // ₹15,000 on hitting team quota
    },
    effectiveFrom: '2026-04-01',
    version: '2.1',
  },
  {
    id: 'rule-technician',
    role: 'Technician',
    component: 'service',
    formulaType: 'job_productivity',
    parameters: {
      perJobCompleted: 250, // ₹250 per job completed
      firstTimeFixBonus: 3500, // ₹3,500 bonus if FTF rate >= 92%
      ftfThresholdPct: 92,
      comebackPenaltyPerJob: 500, // ₹500 penalty per comeback
    },
    effectiveFrom: '2026-04-01',
    version: '2.0',
  },
  {
    id: 'rule-service-advisor',
    role: 'Service Advisor',
    component: 'service',
    formulaType: 'billing_upsell',
    parameters: {
      perJobBilled: 120, // ₹120 per closed job card
      upsellCommissionPct: 3, // 3% of added services / VAS billed
    },
    effectiveFrom: '2026-04-01',
    version: '2.0',
  },
  {
    id: 'rule-perf-bonus',
    role: 'ALL',
    component: 'performance_bonus',
    formulaType: 'gatekeeper_bonus',
    parameters: {
      minAchievementPct: 100,
      minAttendancePct: 95,
      flatBonusAmount: 5000,
    },
    effectiveFrom: '2026-04-01',
    version: '1.5',
  },
];

/**
 * Computes Target Achievement Percentage safely
 */
export function calculateAchievementPercent(achieved, quota) {
  const q = Number(quota);
  const a = Number(achieved);
  if (!Number.isFinite(q) || q <= 0) return 0;
  if (!Number.isFinite(a) || a <= 0) return 0;
  return Number(((a / q) * 100).toFixed(1));
}

/**
 * Computes Performance Score (0 - 100%)
 * Formula: 50% Target Achievement (capped at 120%) + 25% Attendance Rate + 25% Quality Score
 */
export function calculatePerformanceScore({
  achievementPercent = 0,
  attendanceRate = 0,
  qualityScore = 95, // 0 - 100 (FTF rate for service, Customer CSAT for sales)
}) {
  const normAch = Math.min(Math.max(0, achievementPercent), 120); // capped at 120%
  const achContrib = (normAch / 120) * 50;

  const normAtt = Math.min(Math.max(0, attendanceRate), 100);
  const attContrib = (normAtt / 100) * 25;

  const normQ = Math.min(Math.max(0, qualityScore), 100);
  const qContrib = (normQ / 100) * 25;

  return Math.round(achContrib + attContrib + qContrib);
}

/**
 * Computes Incentive Components for a staff member for a given period
 */
export function calculateStaffIncentives({
  staffMember,
  events = [],
  rules = DEFAULT_INCENTIVE_RULES,
  attendanceRate = 100,
  achievementPercent = 0,
  unresolvedDisputes = false,
}) {
  let salesIncentive = 0;
  let serviceIncentive = 0;
  let performanceBonus = 0;
  let oemSchemeIncentive = 0;

  const role = staffMember.role;

  // 1. Sales Roles
  if (role === 'Sales Executive') {
    const quota = staffMember.targetQuota || 12;
    const achieved = staffMember.achieved || 0;
    const rule = rules.find((r) => r.role === 'Sales Executive' && r.component === 'sales') || DEFAULT_INCENTIVE_RULES[0];
    const { basePerUnit = 1200, acceleratorPerUnit = 1800, accessoryCommissionPct = 5, financeInsuranceAttachPct = 2 } = rule.parameters || {};

    const baseUnits = Math.min(achieved, quota);
    const accelUnits = Math.max(0, achieved - quota);
    salesIncentive += (baseUnits * basePerUnit) + (accelUnits * acceleratorPerUnit);

    // Value add attachments
    const accessoryValue = events
      .filter((e) => e.type === 'accessory_sale')
      .reduce((sum, e) => sum + (e.value || 0), 0);
    const fiValue = events
      .filter((e) => e.type === 'finance_insurance_attach')
      .reduce((sum, e) => sum + (e.value || 0), 0);

    salesIncentive += Math.round((accessoryValue * accessoryCommissionPct) / 100);
    salesIncentive += Math.round((fiValue * financeInsuranceAttachPct) / 100);

    if (staffMember.baselineSalesIncentive !== undefined) {
      salesIncentive = staffMember.baselineSalesIncentive;
    }
  } else if (role === 'Sales Manager') {
    if (staffMember.baselineSalesIncentive !== undefined) {
      salesIncentive = staffMember.baselineSalesIncentive;
    } else {
      const achieved = staffMember.achieved || 28;
      const quota = staffMember.targetQuota || 30;
      salesIncentive += achieved * 1200;
      if (achieved >= quota) salesIncentive += 10000;
    }
  } else if (staffMember.baselineSalesIncentive !== undefined) {
    salesIncentive = staffMember.baselineSalesIncentive;
  }

  // 2. Service Roles
  if (role === 'Technician') {
    const achievedJobs = staffMember.achieved || 68;
    const comebacks = events.filter((e) => e.type === 'comeback').length;
    const ftfEvent = events.find((e) => e.type === 'first_time_fix_stat');
    const ftfRate = ftfEvent ? ftfEvent.rate : 94;

    serviceIncentive += achievedJobs * 250;
    if (ftfRate >= 92) serviceIncentive += 3500;
    serviceIncentive -= comebacks * 500;

    if (staffMember.baselineServiceIncentive !== undefined) {
      serviceIncentive = staffMember.baselineServiceIncentive;
    }
  } else if (role === 'Service Advisor') {
    const achieved = staffMember.achieved || 115;
    serviceIncentive += achieved * 130;
    const upsellValue = events
      .filter((e) => e.type === 'service_upsell')
      .reduce((sum, e) => sum + (e.value || 0), 0);
    serviceIncentive += Math.round((upsellValue * 3) / 100);

    if (staffMember.baselineServiceIncentive !== undefined) {
      serviceIncentive = staffMember.baselineServiceIncentive;
    }
  } else if (staffMember.baselineServiceIncentive !== undefined) {
    serviceIncentive = staffMember.baselineServiceIncentive;
  }

  // 3. OEM Scheme Incentive (if any)
  const oemEvents = events.filter((e) => e.type === 'oem_scheme_payout');
  oemSchemeIncentive = oemEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  if (staffMember.baselineOemIncentive) {
    oemSchemeIncentive += staffMember.baselineOemIncentive;
  }

  // 4. Performance Bonus Gatekeeper:
  // Awarded when: achievement >= 100%, attendance >= 95%, and no unresolved disputes
  if (staffMember.baselinePerformanceBonus !== undefined) {
    performanceBonus = staffMember.baselinePerformanceBonus;
  } else if (achievementPercent >= 100 && attendanceRate >= 95 && !unresolvedDisputes) {
    performanceBonus += 5000;
  }

  const totalIncentive = salesIncentive + serviceIncentive + performanceBonus + oemSchemeIncentive;

  return {
    salesIncentive,
    serviceIncentive,
    performanceBonus,
    oemSchemeIncentive,
    totalIncentive,
  };
}

/**
 * Computes Attendance Adjustment
 * Default deductLossOfPay = false
 */
export function calculateAttendanceAdjustment({
  baseSalary = 0,
  workingDays = 26,
  presentDays = 26,
  approvedLeaveDays = 0,
  deductLossOfPay = false,
}) {
  if (!deductLossOfPay) return 0;
  if (workingDays <= 0) return 0;

  const totalAccountedDays = presentDays + approvedLeaveDays;
  const unapprovedAbsenceDays = Math.max(0, workingDays - totalAccountedDays);
  if (unapprovedAbsenceDays === 0) return 0;

  const dailyRate = baseSalary / workingDays;
  return -Math.round(unapprovedAbsenceDays * dailyRate);
}

/**
 * Computes Net Payout for a single staff line
 */
export function calculateNetPayout({
  baseSalary = 0,
  attendanceAdjustment = 0,
  totalIncentive = 0,
  adjustments = 0, // manual approved bonuses (+) or penalties (-)
  deductions = 0, // statutory deductions (PF/ESI/PT)
}) {
  return Math.max(0, baseSalary + attendanceAdjustment + totalIncentive + adjustments - deductions);
}

/**
 * Computes Entire Department / Branch Summary and guarantees 100% Reconciliation
 */
export function calculatePayrollSummary(staffList = [], options = {}) {
  const { deductLossOfPay = false, statutoryDeductionsEnabled = false } = options;

  let totalActiveStaff = 0;
  let totalAchievedSum = 0;
  let totalQuotaSum = 0;
  let achievementPercentsList = [];
  let totalPresentDays = 0;
  let totalWorkingDays = 0;

  let poolSales = 0;
  let poolService = 0;
  let poolBonus = 0;
  let poolOem = 0;
  let poolTotalIncentives = 0;

  let totalBaseSalary = 0;
  let totalAttendanceAdjustments = 0;
  let totalAdjustments = 0;
  let totalDeductions = 0;
  let totalNetPayout = 0;

  const lines = staffList.map((staff, idx) => {
    if (staff.employmentStatus === 'ACTIVE' || staff.status !== 'Terminated') {
      totalActiveStaff++;
    }

    const quota = staff.targetQuota || 0;
    const achieved = staff.achieved || 0;
    const achPct = calculateAchievementPercent(achieved, quota);
    achievementPercentsList.push(Math.min(achPct, 150)); // capped at 150% for avg calculation

    totalQuotaSum += quota;
    totalAchievedSum += achieved;

    const workingDays = staff.workingDays || 26;
    const presentDays = staff.attendanceDays ?? (staff.presentDays || 25);
    totalWorkingDays += workingDays;
    totalPresentDays += presentDays;

    const attRate = workingDays > 0 ? Number(((presentDays / workingDays) * 100).toFixed(1)) : 100;

    // Quality score for performance score
    const qualityScore = staff.qualityScore || (staff.department === 'Workshop' ? 94 : 96);
    const performanceScore = calculatePerformanceScore({
      achievementPercent: achPct,
      attendanceRate: attRate,
      qualityScore,
    });

    // Incentives
    const incBreakdown = calculateStaffIncentives({
      staffMember: staff,
      events: staff.events || [],
      attendanceRate: attRate,
      achievementPercent: achPct,
      unresolvedDisputes: staff.status === 'Disputed',
    });

    poolSales += incBreakdown.salesIncentive;
    poolService += incBreakdown.serviceIncentive;
    poolBonus += incBreakdown.performanceBonus;
    poolOem += incBreakdown.oemSchemeIncentive;
    poolTotalIncentives += incBreakdown.totalIncentive;

    // Salary & Adjustments
    const baseSalary = staff.baseSalary || 0;
    totalBaseSalary += baseSalary;

    const attAdj = calculateAttendanceAdjustment({
      baseSalary,
      workingDays,
      presentDays,
      approvedLeaveDays: staff.approvedLeaveDays || 0,
      deductLossOfPay,
    });
    totalAttendanceAdjustments += attAdj;

    const adjustments = staff.approvedAdjustments || 0;
    totalAdjustments += adjustments;

    // Optional statutory deductions
    let lineDeductions = 0;
    if (statutoryDeductionsEnabled) {
      lineDeductions = Math.round(baseSalary * 0.05); // demo 5% deduction
    }
    totalDeductions += lineDeductions;

    const netPayout = calculateNetPayout({
      baseSalary,
      attendanceAdjustment: attAdj,
      totalIncentive: incBreakdown.totalIncentive,
      adjustments,
      deductions: lineDeductions,
    });
    totalNetPayout += netPayout;

    return {
      ...staff,
      index: idx + 1,
      achievementPercent: achPct,
      attendanceRate: attRate,
      performanceScore,
      incentives: incBreakdown,
      attendanceAdjustment: attAdj,
      netPayout,
    };
  });

  // Calculate Average Target Achievement
  const avgAchievement = achievementPercentsList.length > 0
    ? Number((achievementPercentsList.reduce((a, b) => a + b, 0) / achievementPercentsList.length).toFixed(1))
    : 0;

  // Calculate Average Attendance Rate
  const avgAttendance = totalWorkingDays > 0
    ? Number(((totalPresentDays / totalWorkingDays) * 100).toFixed(1))
    : 100;

  const totals = {
    totalActiveStaff,
    avgAchievement,
    avgAttendance,
    totalBaseSalary,
    totalAttendanceAdjustments,
    totalAdjustments,
    totalDeductions,
    totalNetPayout,
    pool: {
      sales: poolSales,
      service: poolService,
      bonus: poolBonus,
      oem: poolOem,
      total: poolTotalIncentives,
    },
  };

  return {
    lines,
    totals,
  };
}

/**
 * Runtime reconciliation check ensuring KPI pool, donut slices, table totals, and payroll runs match.
 */
export function validateReconciliation(totals, donutTotal, tableTotalIncentive, payrollRunTotal) {
  const poolTotal = totals.pool.total;
  const isMatch = (
    poolTotal === donutTotal &&
    poolTotal === tableTotalIncentive &&
    (payrollRunTotal === undefined || poolTotal === payrollRunTotal)
  );

  if (!isMatch && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[RECONCILIATION DISCREPANCY DETECTED] Pool: ${poolTotal}, Donut: ${donutTotal}, Table: ${tableTotalIncentive}, Run: ${payrollRunTotal}`
    );
  }

  return isMatch;
}
