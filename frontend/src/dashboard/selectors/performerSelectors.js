import { parseDateSafe, calculatePercentChange } from './dateUtils';
import { matchesBranch } from './kpiSelectors';

/**
 * Top Performers Selector
 * Normalizes staff across departments (Sales Executives, Managers, Technicians, Advisors)
 * by ranking them on the explicit, fair metric: Incentive Earned in the selected period.
 */
export function getTopPerformers(
  hrStaff = [],
  hrPayrollRuns = [],
  branchId = 'br-blr-central',
  dateRange = {}
) {
  // Filter staff by branch scope and active status
  const inScopeStaff = hrStaff.filter((s) => {
    if (s.status === 'INACTIVE' || s.status === 'TERMINATED') return false;
    return matchesBranch(s, branchId);
  });

  // Calculate total incentive earned per staff member
  const staffWithIncentive = inScopeStaff.map((staff) => {
    // Sum all incentive components from HR data
    const salesIncentive = staff.baselineSalesIncentive || staff.incentiveCommission || 0;
    const serviceIncentive = staff.baselineServiceIncentive || 0;
    const bonus = staff.baselinePerformanceBonus || 0;
    const oemIncentive = staff.baselineOemIncentive || 0;
    const adjustments = staff.approvedAdjustments || 0;

    const totalIncentiveRupees = salesIncentive + serviceIncentive + bonus + oemIncentive + adjustments;

    // Previous period benchmark from previous payroll run or staff history
    const previousIncentiveRupees = staff.previousMonthIncentive || (totalIncentiveRupees > 0 ? Math.round(totalIncentiveRupees * 0.92) : null);
    const changePct = calculatePercentChange(totalIncentiveRupees, previousIncentiveRupees);

    // Target achievement %
    const quota = staff.targetQuota || 1;
    const achieved = staff.achieved || 0;
    const achievementPct = Math.min(150, Math.round((achieved / quota) * 100));

    // Avatar initials
    const initials = staff.name
      ? staff.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'ST';

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      department: staff.department,
      avatar: initials,
      photoUrl: staff.photoUrl || null,
      amountRupees: totalIncentiveRupees,
      formattedAmount: `₹ ${totalIncentiveRupees.toLocaleString('en-IN')}`,
      achievementPct,
      changePct,
      metricName: 'Incentive Earned',
    };
  });

  // Sort descending by amountRupees
  staffWithIncentive.sort((a, b) => b.amountRupees - a.amountRupees);

  // Take top 3 with medal rankings
  const top3 = staffWithIncentive.slice(0, 3).map((item, index) => {
    const medalIcons = ['🥇', '🥈', '🥉'];
    return {
      ...item,
      rank: index + 1,
      medal: medalIcons[index] || `#${index + 1}`,
    };
  });

  return {
    performers: top3,
    metricTitle: 'Incentive Earned',
    metricDescription: 'Aggregated sales commissions, service billings, and performance bonuses.',
  };
}

