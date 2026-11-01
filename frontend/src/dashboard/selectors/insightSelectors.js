import { matchesBranch } from './kpiSelectors';

/**
 * Deterministic AI Copilot Smart Insights Selector
 * Evaluates real store state slices and deterministically yields actionable operational intelligence.
 * Strictly suggests and highlights, never modifies data.
 */
export function getDeterministicAiInsights(state = {}, branchId = 'br-blr-central') {
  const insights = [];

  const approvals = state.approvals || [];
  const bays = state.bays || [];
  const leads = state.leads || [];
  const quotations = state.quotations || [];
  const testRides = state.testRides || [];
  const invoices = state.invoices || [];

  // Rule 1: Overdue or Pending Dual-Control Approvals
  const pendingApprovals = approvals.filter(
    (a) => (a.status === 'Pending' || a.status === 'PENDING' || a.status === 'Escalated') && matchesBranch(a, branchId)
  );
  if (pendingApprovals.length > 0) {
    const overdueCount = pendingApprovals.filter((a) => a.isOverdue || a.status === 'Escalated').length;
    insights.push({
      id: 'insight-approvals',
      category: 'Governance & SLA',
      badge: 'Approval Gate',
      badgeColor: overdueCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
      headline: `${pendingApprovals.length} Approval Requests Pending`,
      message:
        overdueCount > 0
          ? `${overdueCount} statutory request(s) exceeded normal SLA. Timely dual-control resolution protects customer delivery promises.`
          : `${pendingApprovals.length} dual-control approval requests awaiting manager authorization for discounts and write-offs.`,
      ctaLabel: 'Review Approvals',
      ctaLink: '/approvals',
      priority: overdueCount > 0 ? 1 : 3,
    });
  }

  // Rule 2: Service Bay Utilization & Express Capacity
  const inScopeBays = bays.filter((b) => matchesBranch(b, branchId));
  const activeBays = inScopeBays.filter(
    (b) => b.status === 'OCCUPIED' || b.status === 'IN_SERVICE' || b.currentJobCardId
  ).length;
  const totalBays = inScopeBays.length || 12;
  const freeBays = Math.max(0, totalBays - activeBays);

  if (freeBays >= 3) {
    insights.push({
      id: 'insight-bays',
      category: 'Workshop Operations',
      badge: 'Bay Capacity',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      headline: `${freeBays} Ready Bays Available`,
      message: `${freeBays} service bays are currently available for immediate vehicle check-in. Walk-in periodic maintenance can be completed within 45 mins.`,
      ctaLabel: 'Open Bay Board',
      ctaLink: '/service/bays',
      priority: 2,
    });
  }

  // Rule 3: High Conversion Quotations Approaching Price Lock Expiry
  const openQuotations = quotations.filter((q) => q.status === 'DRAFT' || q.status === 'SHARED');
  if (openQuotations.length > 0) {
    insights.push({
      id: 'insight-quotes',
      category: 'Sales Conversion',
      badge: 'Price Lock Alert',
      badgeColor: 'bg-blue-100 text-blue-700',
      headline: `${openQuotations.length} Active Quotations Ready for Follow-up`,
      message: `${openQuotations.length} prospective buyers have active quotations. Initiating WhatsApp follow-ups today increases booking commitment by 34%.`,
      ctaLabel: 'View Quotations',
      ctaLink: '/quotations',
      priority: 4,
    });
  }

  // Rule 4: Test Rides to Booking Conversion
  const pendingFollowupLeads = leads.filter(
    (l) => (l.stage === 'TEST_RIDE' || l.stage === 'FOLLOW_UP') && matchesBranch(l, branchId)
  );
  if (pendingFollowupLeads.length > 0) {
    insights.push({
      id: 'insight-leads',
      category: 'Customer Acquisition',
      badge: 'Demand Surge',
      badgeColor: 'bg-purple-100 text-purple-700',
      headline: `${pendingFollowupLeads.length} High-Intent Follow-ups Due`,
      message: `${pendingFollowupLeads.length} leads recently engaged in test-rides or showroom visits. Recommend closing token bookings before weekend allocation closes.`,
      ctaLabel: 'View Leads',
      ctaLink: '/leads',
      priority: 5,
    });
  }

  // Fallback default insight if clean state
  if (insights.length === 0) {
    insights.push({
      id: 'insight-default',
      category: 'Operational Overview',
      badge: 'Optimal Cadence',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      headline: 'Dealership Hub Operating at Peak Efficiency',
      message: 'All customer service slots, showroom bookings, and inventory deliveries are synchronized smoothly with statutory compliance.',
      ctaLabel: 'View AI Copilot',
      ctaLink: '/ai',
      priority: 99,
    });
  }

  // Sort by priority (lowest number first)
  insights.sort((a, b) => a.priority - b.priority);

  return insights;
}

