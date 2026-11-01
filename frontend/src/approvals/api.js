// src/approvals/api.js
/**
 * Public Integration Contract & Service API for Dual-Control Approvals.
 * Utilized by Quotations, Invoices, Campaigns, HR, and Users modules.
 */

import { useAppStore } from '../store';
import { APPROVAL_STATUS, DEFAULT_APPROVAL_VALIDITY_HOURS } from './config';
import { matchPolicy, canUserDecide } from './engine';
import { addBusinessHours, getSimulatedNow } from './sla';
import { approvalsEvents, APPROVAL_EVENTS } from './events';
import { DEFAULT_POLICIES } from './policies';
import { ROLES } from '../config/roles';

export const approvalsApi = {
  /**
   * Create a new Dual-Control Approval Request.
   */
  createRequest({
    type,
    sourceModule,
    sourceId,
    sourceRef,
    title,
    summary,
    justification,
    amountPaise = 0,
    percent = 0,
    payload = null,
    attachments = [],
    urgency = 'NORMAL', // NORMAL, HIGH, CRITICAL
    beneficiaryId = null,
  }) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const policies = state.approvalPolicies || DEFAULT_POLICIES;
    const now = getSimulatedNow();

    const requesterLimitPaise = (currentUser?.limits?.discountLimit || 0) * 100;

    const { policy, levels, totalSlaHours, ruleText } = matchPolicy(policies, {
      type,
      amountPaise,
      percent,
      sourceModule,
      requesterLimitPaise,
    });

    const dueAt = addBusinessHours(now, totalSlaHours);

    const existingCount = (state.approvals || []).length;
    const refNumber = String(existingCount + 1).padStart(4, '0');
    const newId = `APR-2026-${refNumber}`;

    const newRequest = {
      id: newId,
      legacyId: `appr-${Date.now().toString().slice(-4)}`,
      type,
      sourceModule: sourceModule || policy.module,
      sourceId: sourceId || null,
      sourceRef: sourceRef || {
        module: sourceModule || policy.module,
        id: sourceId,
        route: sourceId ? `/${(sourceModule || 'sales').toLowerCase()}/${sourceId}` : null,
      },
      title,
      summary: summary || title,
      justification: justification || 'Requested under operational requirements.',
      amountPaise,
      percent,
      beneficiaryId,
      requesterId: currentUser?.id || 'staff',
      requesterName: currentUser?.name || 'Staff Member',
      requesterRole: currentUser?.role || 'Sales Executive',
      requesterEmail: currentUser?.email || 'staff@akashbajaj.com',
      branchId: currentUser?.primaryBranchId || state.activeBranchId || 'br-blr-central',
      branchName: currentUser?.primaryBranchName || 'Bangalore Central Flagship',
      createdAt: now.toISOString(),
      payloadSnapshot: payload || {},
      policyId: policy.id,
      policyVersion: policy.version,
      ruleText,
      levels,
      currentLevel: 1,
      status: APPROVAL_STATUS.PENDING,
      urgency,
      sla: {
        dueAt: dueAt.toISOString(),
        businessMinutes: totalSlaHours * 60,
        pausedAt: null,
        breachedAt: null,
        escalationTarget: levels[0]?.escalationRole || 'Branch Manager',
      },
      escalations: [],
      delegation: null,
      attachments: attachments || [],
      comments: [],
      validUntil: null,
      isEmergencyOverride: false,
      history: [
        {
          event: 'REQUEST_CREATED',
          timestamp: now.toISOString(),
          actor: currentUser?.name || 'Requester',
          note: `Approval request submitted. Initial review assigned to ${levels[0]?.approverRoles?.join(', ')}.`,
        },
      ],
    };

    useAppStore.setState((s) => ({
      approvals: [newRequest, ...(s.approvals || [])],
    }));

    approvalsEvents.emit(APPROVAL_EVENTS.CREATED, newRequest);

    if (state.logAudit) {
      state.logAudit('APPROVAL_REQUESTED', 'APPROVAL', newRequest.id, null, newRequest);
    }

    return newRequest;
  },

  /**
   * Decide on a request (APPROVE, REJECT, RETURN).
   */
  decideRequest(approvalId, decision, { note = '', actor = null } = {}) {
    const state = useAppStore.getState();
    const currentUser = actor || state.currentUser;
    const policies = state.approvalPolicies || DEFAULT_POLICIES;
    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId || r.legacyId === approvalId);

    if (!request) {
      throw new Error(`Approval request "${approvalId}" not found.`);
    }

    const policy = policies.find((p) => p.id === request.policyId) || DEFAULT_POLICIES[0];

    // Evaluate Dual-Control Eligibility
    const check = canUserDecide(currentUser, request, policy);
    if (!check.canDecide) {
      throw new Error(check.reason || 'You are not eligible to decide this approval request.');
    }

    const now = getSimulatedNow();
    const currentLevelIdx = (request.currentLevel || 1) - 1;
    const levels = [...(request.levels || [])];
    const currentLevel = { ...levels[currentLevelIdx] };

    // Update current level decision record
    currentLevel.decidedBy = currentUser.name;
    currentLevel.decidedById = currentUser.id;
    currentLevel.decidedAt = now.toISOString();
    currentLevel.note = note || null;

    if (decision === 'APPROVE') {
      currentLevel.status = APPROVAL_STATUS.APPROVED;
      levels[currentLevelIdx] = currentLevel;

      // Check if another level exists
      if (currentLevelIdx + 1 < levels.length) {
        // Advance to next tier
        levels[currentLevelIdx + 1].status = APPROVAL_STATUS.PENDING;
        const updated = {
          ...request,
          levels,
          currentLevel: request.currentLevel + 1,
          history: [
            ...(request.history || []),
            {
              event: 'LEVEL_APPROVED',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              note: `Level ${currentLevel.level} approved. Advanced to Level ${currentLevel.level + 1} (${levels[currentLevelIdx + 1].label}).`,
            },
          ],
        };

        useAppStore.setState({
          approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
        });

        approvalsEvents.emit(APPROVAL_EVENTS.DECIDED, updated);
        if (state.logAudit) {
          state.logAudit('APPROVAL_LEVEL_APPROVED', 'APPROVAL', request.id, request, updated);
        }
        return updated;
      } else {
        // Final tier approved -> Request fully approved
        const validUntil = new Date(
          now.getTime() + (policy.approvalValidityHours || DEFAULT_APPROVAL_VALIDITY_HOURS) * 3600000
        ).toISOString();

        const updated = {
          ...request,
          levels,
          status: APPROVAL_STATUS.APPROVED,
          decidedBy: currentUser.name,
          decidedById: currentUser.id,
          decidedAt: now.toISOString(),
          decisionNote: note || 'Approved under managerial authority.',
          validUntil,
          history: [
            ...(request.history || []),
            {
              event: 'APPROVAL_GRANTED',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              note: `Final statutory approval granted. Action valid until ${new Date(validUntil).toLocaleString()}.`,
            },
          ],
        };

        useAppStore.setState({
          approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
        });

        approvalsEvents.emit(APPROVAL_EVENTS.DECIDED, updated);
        if (state.logAudit) {
          state.logAudit('APPROVAL_GRANTED', 'APPROVAL', request.id, request, updated);
        }
        return updated;
      }
    } else if (decision === 'REJECT') {
      if (!note || !note.trim()) {
        throw new Error('A mandatory justification note is required when rejecting an approval request.');
      }

      currentLevel.status = APPROVAL_STATUS.REJECTED;
      levels[currentLevelIdx] = currentLevel;

      const updated = {
        ...request,
        levels,
        status: APPROVAL_STATUS.REJECTED,
        decidedBy: currentUser.name,
        decidedById: currentUser.id,
        decidedAt: now.toISOString(),
        decisionNote: note,
        history: [
          ...(request.history || []),
          {
            event: 'APPROVAL_REJECTED',
            timestamp: now.toISOString(),
            actor: currentUser.name,
            note: `Request rejected: "${note}"`,
          },
        ],
      };

      useAppStore.setState({
        approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
      });

      approvalsEvents.emit(APPROVAL_EVENTS.DECIDED, updated);
      if (state.logAudit) {
        state.logAudit('APPROVAL_REJECTED', 'APPROVAL', request.id, request, updated);
      }
      return updated;
    } else if (decision === 'RETURN') {
      if (!note || !note.trim()) {
        throw new Error('A specific explanation of required changes is mandatory when returning a request.');
      }

      currentLevel.status = APPROVAL_STATUS.RETURNED;
      levels[currentLevelIdx] = currentLevel;

      const updated = {
        ...request,
        levels,
        status: APPROVAL_STATUS.RETURNED,
        decidedBy: currentUser.name,
        decidedById: currentUser.id,
        decidedAt: now.toISOString(),
        decisionNote: note,
        sla: {
          ...request.sla,
          pausedAt: now.toISOString(),
        },
        history: [
          ...(request.history || []),
          {
            event: 'APPROVAL_RETURNED',
            timestamp: now.toISOString(),
            actor: currentUser.name,
            note: `Returned for revision: "${note}". SLA clock paused.`,
          },
        ],
      };

      useAppStore.setState({
        approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
      });

      approvalsEvents.emit(APPROVAL_EVENTS.RETURNED, updated);
      if (state.logAudit) {
        state.logAudit('APPROVAL_RETURNED', 'APPROVAL', request.id, request, updated);
      }
      return updated;
    }

    throw new Error(`Unsupported decision action: ${decision}`);
  },

  /**
   * Resubmit a previously RETURNED request.
   */
  resubmitRequest(approvalId, resubmissionNote) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId);

    if (!request || request.status !== APPROVAL_STATUS.RETURNED) {
      throw new Error('Only returned requests can be resubmitted.');
    }

    const now = getSimulatedNow();
    const updated = {
      ...request,
      status: APPROVAL_STATUS.PENDING,
      sla: {
        ...request.sla,
        pausedAt: null,
      },
      history: [
        ...(request.history || []),
        {
          event: 'REQUEST_RESUBMITTED',
          timestamp: now.toISOString(),
          actor: currentUser?.name || 'Requester',
          note: `Request revised and resubmitted: "${resubmissionNote || 'Revised based on reviewer comments'}". SLA clock resumed.`,
        },
      ],
    };

    useAppStore.setState({
      approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
    });

    approvalsEvents.emit(APPROVAL_EVENTS.CREATED, updated);
    return updated;
  },

  /**
   * Cancel / withdraw request (by requester).
   */
  cancelRequest(approvalId, reason = 'Withdrawn by requester') {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId);

    if (!request) return null;

    const now = getSimulatedNow();
    const updated = {
      ...request,
      status: APPROVAL_STATUS.CANCELLED,
      history: [
        ...(request.history || []),
        {
          event: 'REQUEST_CANCELLED',
          timestamp: now.toISOString(),
          actor: currentUser?.name || 'Requester',
          note: `Request cancelled: "${reason}".`,
        },
      ],
    };

    useAppStore.setState({
      approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
    });

    if (state.logAudit) {
      state.logAudit('APPROVAL_CANCELLED', 'APPROVAL', request.id, request, updated);
    }
    return updated;
  },

  /**
   * Emergency Super Admin Override.
   */
  emergencyOverride(approvalId, overrideReason) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;

    if (currentUser?.role !== ROLES.SUPER_ADMIN && currentUser?.role !== 'Super Admin') {
      throw new Error('Only Super Admin is permitted to invoke statutory emergency overrides.');
    }

    if (!overrideReason || !overrideReason.trim()) {
      throw new Error('A mandatory business justification is required for emergency overrides.');
    }

    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId);
    if (!request) throw new Error(`Request ${approvalId} not found.`);

    const now = getSimulatedNow();
    const updated = {
      ...request,
      status: APPROVAL_STATUS.APPROVED,
      isEmergencyOverride: true,
      emergencyReason: overrideReason,
      decidedBy: currentUser.name,
      decidedById: currentUser.id,
      decidedAt: now.toISOString(),
      decisionNote: `[EMERGENCY OVERRIDE] ${overrideReason}`,
      history: [
        ...(request.history || []),
        {
          event: 'EMERGENCY_OVERRIDE_INVOKED',
          timestamp: now.toISOString(),
          actor: currentUser.name,
          note: `Principal Dealer Emergency Override: "${overrideReason}". Flagged for compliance review.`,
        },
      ],
    };

    useAppStore.setState({
      approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
    });

    approvalsEvents.emit(APPROVAL_EVENTS.DECIDED, updated);
    if (state.logAudit) {
      state.logAudit('APPROVAL_EMERGENCY_OVERRIDE', 'APPROVAL', request.id, request, updated);
    }
    return updated;
  },

  /**
   * Add comment to comments thread.
   */
  addComment(approvalId, text) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId);
    if (!request || !text.trim()) return;

    const now = getSimulatedNow();
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorId: currentUser?.id,
      authorName: currentUser?.name || 'Staff',
      authorRole: currentUser?.role || 'Staff',
      text,
      createdAt: now.toISOString(),
    };

    const updated = {
      ...request,
      comments: [...(request.comments || []), newComment],
    };

    useAppStore.setState({
      approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
    });

    return newComment;
  },

  /**
   * Delegate approval authority.
   */
  delegateApproval(approvalId, { toUserId, toUserName, validUntil, reason }) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const request = currentList.find((r) => r.id === approvalId);
    if (!request) return;

    const now = getSimulatedNow();
    const delegation = {
      fromUserId: currentUser?.id,
      fromUserName: currentUser?.name,
      toUserId,
      toUserName,
      validUntil,
      reason,
      delegatedAt: now.toISOString(),
    };

    const updated = {
      ...request,
      delegation,
      history: [
        ...(request.history || []),
        {
          event: 'APPROVAL_DELEGATED',
          timestamp: now.toISOString(),
          actor: currentUser?.name,
          note: `Approval delegated to ${toUserName} until ${new Date(validUntil).toLocaleDateString()}: "${reason}".`,
        },
      ],
    };

    useAppStore.setState({
      approvals: currentList.map((r) => (r.id === request.id ? updated : r)),
    });

    return updated;
  },
};

