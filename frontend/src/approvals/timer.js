// src/approvals/timer.js
/**
 * Idempotent SLA Timer & Background Evaluator.
 * Ticks every 30 seconds while app is running, and on initial app mount.
 * Handles:
 * 1. 50% and 80% SLA reminder triggers
 * 2. SLA breach automatic escalation
 * 3. 24h approval validity expiration
 */

import { APPROVAL_STATUS } from './config';
import { getSimulatedNow, getBusinessMinutesBetween } from './sla';
import { approvalsEvents, APPROVAL_EVENTS } from './events';
import { useAppStore } from '../store';

let timerInterval = null;

export function evaluateApprovalsTick() {
  const state = useAppStore.getState();
  const approvals = state.approvals || [];
  const now = getSimulatedNow();
  let hasModifications = false;

  const updatedApprovals = approvals.map((req) => {
    // 1. Check Approved Requests for Validity Expiry
    if (req.status === APPROVAL_STATUS.APPROVED && req.validUntil) {
      const validUntilDate = new Date(req.validUntil);
      if (now > validUntilDate) {
        hasModifications = true;
        const expiredReq = {
          ...req,
          status: APPROVAL_STATUS.EXPIRED,
          history: [
            ...(req.history || []),
            {
              event: 'APPROVAL_EXPIRED',
              timestamp: now.toISOString(),
              note: 'Approval validity window (24h) elapsed without source execution.',
            },
          ],
        };
        approvalsEvents.emit(APPROVAL_EVENTS.EXPIRED, expiredReq);
        if (state.logAudit) {
          state.logAudit('APPROVAL_EXPIRED', 'APPROVAL', req.id, { status: req.status }, { status: APPROVAL_STATUS.EXPIRED });
        }
        return expiredReq;
      }
    }

    // 2. Check Open Requests for SLA Reminders and Escalation
    if ([APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(req.status)) {
      const dueAt = req.sla?.dueAt ? new Date(req.sla.dueAt) : null;
      if (!dueAt) return req;

      const isBreached = now > dueAt;

      // SLA Breach & Escalation
      if (isBreached && req.status === APPROVAL_STATUS.PENDING) {
        hasModifications = true;
        const escalationTarget = req.sla?.escalationTarget || 'Branch Manager';
        const escalatedReq = {
          ...req,
          status: APPROVAL_STATUS.ESCALATED,
          slaBreached: true,
          breachedAt: now.toISOString(),
          escalations: [
            ...(req.escalations || []),
            {
              escalatedAt: now.toISOString(),
              fromRole: req.levels?.[(req.currentLevel || 1) - 1]?.approverRoles?.[0] || 'Reviewer',
              toRole: escalationTarget,
              reason: 'Automatic SLA breach timeout',
            },
          ],
          history: [
            ...(req.history || []),
            {
              event: 'SLA_BREACHED_ESCALATED',
              timestamp: now.toISOString(),
              note: `SLA target breached. Automatically escalated to ${escalationTarget}.`,
            },
          ],
        };

        approvalsEvents.emit(APPROVAL_EVENTS.ESCALATED, escalatedReq);
        if (state.logAudit) {
          state.logAudit(
            'APPROVAL_ESCALATED',
            'APPROVAL',
            req.id,
            { status: req.status },
            { status: APPROVAL_STATUS.ESCALATED, escalationTarget }
          );
        }
        return escalatedReq;
      }

      // Reminders (50% and 80%)
      if (!isBreached) {
        const createdAt = new Date(req.createdAt);
        const totalBusinessMins = req.sla?.businessMinutes || 360;
        const elapsedMins = getBusinessMinutesBetween(createdAt, now);
        const elapsedRatio = elapsedMins / totalBusinessMins;

        const remindersSent = req.remindersSent || [];

        if (elapsedRatio >= 0.8 && !remindersSent.includes('80_PERCENT')) {
          hasModifications = true;
          return {
            ...req,
            remindersSent: [...remindersSent, '80_PERCENT'],
            history: [
              ...(req.history || []),
              {
                event: 'REMINDER_SENT_80',
                timestamp: now.toISOString(),
                note: 'Urgent SLA Reminder dispatched to approver (80% window elapsed).',
              },
            ],
          };
        } else if (elapsedRatio >= 0.5 && !remindersSent.includes('50_PERCENT')) {
          hasModifications = true;
          return {
            ...req,
            remindersSent: [...remindersSent, '50_PERCENT'],
            history: [
              ...(req.history || []),
              {
                event: 'REMINDER_SENT_50',
                timestamp: now.toISOString(),
                note: 'Scheduled SLA Reminder dispatched to approver (50% window elapsed).',
              },
            ],
          };
        }
      }
    }

    return req;
  });

  if (hasModifications) {
    useAppStore.setState({ approvals: updatedApprovals });
  }
}

export function startApprovalsScheduler() {
  if (timerInterval) return;
  // Run catch-up immediately
  evaluateApprovalsTick();
  // Tick every 30s
  timerInterval = setInterval(evaluateApprovalsTick, 30000);
}

export function stopApprovalsScheduler() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

