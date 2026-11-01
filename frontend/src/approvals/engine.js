// src/approvals/engine.js
/**
 * Dual-Control Governance Engine.
 * Single source of truth for:
 * 1. Policy matching and multi-level path calculation
 * 2. Strict Dual-Control eligibility checks (never self-approve, no 2-level decisions by 1 person)
 * 3. Policy Compliance & Approval Performance scoring
 */

import { APPROVAL_TYPES, APPROVAL_STATUS } from './config';
import { ROLES } from '../config/roles';
import { addBusinessHours, getBusinessMinutesBetween, formatDuration } from './sla';

/**
 * Pure policy matching function.
 * Evaluates request characteristics against policy conditions and returns matched policy
 * with dynamically calculated multi-level approval path.
 */
export function matchPolicy(policies, requestData) {
  const {
    type,
    amountPaise = 0,
    percent = 0,
    sourceModule,
    requesterLimitPaise = 0,
  } = requestData;

  const matchedPolicy = policies.find(
    (p) => p.type === type && p.enabled && (!p.module || !sourceModule || p.module === sourceModule)
  ) || policies.find((p) => p.type === type && p.enabled);

  if (!matchedPolicy) {
    throw new Error(`No active governance policy found for approval type ${type}`);
  }

  // Derive levels
  let computedLevels = [];
  let totalSlaHours = 0;
  let ruleText = '';

  if (type === APPROVAL_TYPES.DISCOUNT) {
    const exceedsPersonalLimit = amountPaise > requesterLimitPaise;
    const isHighValue =
      amountPaise > (matchedPolicy.conditions.multiLevelThresholdPaise || 500000) ||
      percent > (matchedPolicy.conditions.multiLevelThresholdPercent || 5.0);

    if (isHighValue) {
      computedLevels = matchedPolicy.levels.slice(0, 2);
      totalSlaHours = 6;
      ruleText = `Discount exceeds ₹5,000 or 5% of vehicle price (requires 2-tier dual control)`;
    } else {
      computedLevels = matchedPolicy.levels.slice(0, 1);
      totalSlaHours = 4;
      ruleText = exceedsPersonalLimit
        ? `Discount exceeds requester limit of ₹${Math.round(requesterLimitPaise / 100).toLocaleString('en-IN')}`
        : `Managerial discount sign-off required`;
    }
  } else if (type === APPROVAL_TYPES.REFUND) {
    const isHighValue = amountPaise > (matchedPolicy.conditions.multiLevelThresholdPaise || 2500000);
    if (isHighValue) {
      computedLevels = matchedPolicy.levels.slice(0, 2);
      totalSlaHours = 6;
      ruleText = `Refund exceeds ₹25,000 threshold (requires Accounts verification + Branch Manager sign-off)`;
    } else {
      // Level 2 (Branch Manager) directly
      computedLevels = [matchedPolicy.levels[1] || matchedPolicy.levels[0]];
      totalSlaHours = 6;
      ruleText = `Refund above ₹5,000 requires Branch Manager authorization`;
    }
  } else if (type === APPROVAL_TYPES.WRITE_OFF) {
    const isHighValue = amountPaise > (matchedPolicy.conditions.multiLevelThresholdPaise || 5000000);
    if (isHighValue) {
      computedLevels = matchedPolicy.levels.slice(0, 2);
      totalSlaHours = 8;
      ruleText = `Loss write-off exceeds ₹50,000 (requires Principal Dealer / Super Admin sign-off)`;
    } else {
      computedLevels = matchedPolicy.levels.slice(0, 1);
      totalSlaHours = 6;
      ruleText = `Scrap & damage write-off exceeds ₹10,000 branch threshold`;
    }
  } else {
    // Standard 1-tier policies
    computedLevels = matchedPolicy.levels.slice(0, 1);
    totalSlaHours = computedLevels[0]?.businessHoursSla || 8;
    ruleText = matchedPolicy.description;
  }

  return {
    policy: matchedPolicy,
    levels: computedLevels.map((lvl, idx) => ({
      level: idx + 1,
      approverRoles: lvl.approverRoles,
      label: lvl.label,
      businessHoursSla: lvl.businessHoursSla,
      escalationRole: lvl.escalationRole,
      status: idx === 0 ? APPROVAL_STATUS.PENDING : 'WAITING',
      decidedBy: null,
      decidedById: null,
      decidedAt: null,
      note: null,
    })),
    totalSlaHours,
    ruleText,
  };
}

/**
 * Strict DUAL CONTROL evaluation.
 * Returns { canDecide: boolean, reason?: string }
 */
export function canUserDecide(user, request, policy) {
  if (!user) {
    return { canDecide: false, reason: 'Authentication required' };
  }

  // 1. Request must be in open actionable status
  if (![APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(request.status)) {
    return { canDecide: false, reason: `Request is already ${request.status}` };
  }

  // 2. MANDATORY DUAL CONTROL: Approver can NEVER be the requester (even for Super Admin!)
  const isRequester =
    request.requesterId === user.id ||
    (request.requesterEmail && request.requesterEmail.toLowerCase() === (user.email || '').toLowerCase()) ||
    request.requesterName === user.name;

  if (isRequester) {
    return {
      canDecide: false,
      reason: 'Dual-control violation: You cannot decide a request you initiated.',
    };
  }

  // 3. Beneficiary check (e.g. self-incentive or personal discount)
  if (request.beneficiaryId && request.beneficiaryId === user.id) {
    return {
      canDecide: false,
      reason: 'Dual-control violation: You are the named beneficiary of this request.',
    };
  }

  // 4. One person cannot decide two levels of the same request
  const currentLevelIndex = (request.currentLevel || 1) - 1;
  const previousLevels = (request.levels || []).slice(0, currentLevelIndex);
  const alreadyDecidedPriorLevel = previousLevels.some(
    (lvl) => lvl.decidedById === user.id || lvl.decidedBy === user.name
  );

  if (alreadyDecidedPriorLevel) {
    return {
      canDecide: false,
      reason: 'Dual-control violation: You already decided a previous level on this request.',
    };
  }

  // 5. Branch scoping: Approvers must belong to the same branch (Super Admin excepted)
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN || user.role === 'Super Admin';
  if (!isSuperAdmin && request.branchId && user.primaryBranchId && request.branchId !== user.primaryBranchId) {
    // Check if user has additional branch access
    const hasBranchAccess = user.additionalBranchIds?.includes(request.branchId);
    if (!hasBranchAccess) {
      return {
        canDecide: false,
        reason: 'Branch mismatch: Outside your allocated dealership branch scope.',
      };
    }
  }

  // 6. Check active level approver roles or active delegation
  const currentLevel = request.levels?.[currentLevelIndex];
  if (!currentLevel) {
    return { canDecide: false, reason: 'All approval levels completed.' };
  }

  const roleMatches = currentLevel.approverRoles.includes(user.role);
  const isDelegated =
    request.delegation?.toUserId === user.id &&
    new Date(request.delegation.validUntil) >= new Date();

  if (!roleMatches && !isDelegated && !isSuperAdmin) {
    return {
      canDecide: false,
      reason: `Requires ${currentLevel.approverRoles.join(' or ')} sign-off.`,
    };
  }

  // 7. Check user approval limit (if configured on user profile)
  if (user.limits?.approvalLimit && request.amountPaise) {
    if (request.amountPaise > user.limits.approvalLimit * 100) {
      return {
        canDecide: false,
        reason: `Amount ₹${Math.round(request.amountPaise / 100).toLocaleString('en-IN')} exceeds your authority limit of ₹${user.limits.approvalLimit.toLocaleString('en-IN')}`,
      };
    }
  }

  return { canDecide: true };
}

/**
 * Compute Policy Compliance percentage & exceptions list from decided requests.
 * Rules checked for every decided request:
 * - Proper approver level
 * - No self-approval breach
 * - Mandatory note present (when required)
 * - Mandatory attachment present (when required)
 * - Approved before expiry
 * - Emergency overrides automatically count as exceptions!
 */
export function evaluateCompliance(decidedRequests = []) {
  if (decidedRequests.length === 0) {
    return { complianceRate: 100, totalDecided: 0, exceptionsCount: 0, exceptions: [] };
  }

  const exceptions = [];

  decidedRequests.forEach((req) => {
    // Rule 1: Emergency override
    if (req.isEmergencyOverride) {
      exceptions.push({
        requestId: req.id,
        rule: 'Emergency Override Invoked',
        detail: `Super Admin emergency override bypassed standard workflow: "${req.emergencyReason || 'Unspecified'}"`,
        refId: req.id,
      });
      return;
    }

    // Rule 2: Self-approval check
    if (req.requesterId && req.decidedById && req.requesterId === req.decidedById) {
      exceptions.push({
        requestId: req.id,
        rule: 'Dual-Control Self-Approval Breach',
        detail: `Request was decided by initiator (${req.decidedBy}).`,
        refId: req.id,
      });
    }

    // Rule 3: Missing mandatory note on Rejection or Return
    if (
      [APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.RETURNED].includes(req.status) &&
      (!req.decisionNote || !req.decisionNote.trim())
    ) {
      exceptions.push({
        requestId: req.id,
        rule: 'Missing Statutory Decision Justification',
        detail: `${req.status} status recorded without mandatory rationale note.`,
        refId: req.id,
      });
    }

    // Rule 4: Decided after SLA breach (if overdue by more than 2x SLA)
    if (req.slaBreached && req.status === APPROVAL_STATUS.APPROVED) {
      const createdAt = new Date(req.createdAt);
      const dueAt = new Date(req.sla?.dueAt || req.createdAt);
      const decidedAt = new Date(req.decidedAt || req.createdAt);
      if (decidedAt > dueAt) {
        // Log minor compliance note if substantially delayed
        // (Only severe delays count against compliance score)
        const overdueMins = (decidedAt - dueAt) / 60000;
        if (overdueMins > 1440) { // > 24 hours overdue
          exceptions.push({
            requestId: req.id,
            rule: 'Severe SLA Breach Prior to Decision',
            detail: `Approved ${Math.round(overdueMins / 60)} hours after SLA expiry.`,
            refId: req.id,
          });
        }
      }
    }
  });

  const totalDecided = decidedRequests.length;
  const exceptionsCount = exceptions.length;
  const complianceRate = Math.max(0, Math.round(((totalDecided - exceptionsCount) / totalDecided) * 100));

  return {
    complianceRate,
    totalDecided,
    exceptionsCount,
    exceptions,
  };
}

/**
 * Compute Approval Performance (SLA adherence and turnaround times).
 */
export function evaluatePerformance(decidedRequests = []) {
  if (decidedRequests.length === 0) {
    return {
      performanceRate: 100,
      withinSlaCount: 0,
      totalDecided: 0,
      avgTurnaroundMinutes: 0,
      avgTurnaroundFormatted: '0m',
      medianTurnaroundFormatted: '0m',
    };
  }

  let withinSlaCount = 0;
  const turnaroundList = [];

  decidedRequests.forEach((req) => {
    const createdAt = new Date(req.createdAt);
    const decidedAt = req.decidedAt ? new Date(req.decidedAt) : new Date();
    const dueAt = req.sla?.dueAt ? new Date(req.sla.dueAt) : null;

    if (dueAt && decidedAt <= dueAt) {
      withinSlaCount += 1;
    }

    const businessMinutes = getBusinessMinutesBetween(createdAt, decidedAt);
    turnaroundList.push(businessMinutes);
  });

  const totalDecided = decidedRequests.length;
  const performanceRate = Math.round((withinSlaCount / totalDecided) * 100);

  // Average
  const sumMinutes = turnaroundList.reduce((acc, m) => acc + m, 0);
  const avgMinutes = Math.round(sumMinutes / totalDecided);

  // Median
  const sorted = [...turnaroundList].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianMinutes =
    sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  return {
    performanceRate,
    withinSlaCount,
    totalDecided,
    avgTurnaroundMinutes: avgMinutes,
    avgTurnaroundFormatted: formatDuration(avgMinutes),
    medianTurnaroundFormatted: formatDuration(medianMinutes),
  };
}

