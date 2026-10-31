import { describe, it, expect } from 'vitest';
import {
  SHOW_KPI_TRENDS,
  APPROVAL_STATUS,
  APPROVAL_TYPES,
  APPROVAL_MODULES,
  BUSINESS_HOURS,
} from '../approvals/config';
import { DEFAULT_POLICIES } from '../approvals/policies';
import {
  matchPolicy,
  canUserDecide,
  evaluateCompliance,
  evaluatePerformance,
} from '../approvals/engine';
import {
  isWithinBusinessHours,
  addBusinessHours,
  getBusinessMinutesBetween,
  computeRequestSla,
  formatDuration,
} from '../approvals/sla';
import { SEEDED_APPROVALS } from '../data/approvalsSeed';
import { ROLES } from '../config/roles';

describe('Dual-Control Approvals Engine & Governance Tests', () => {
  describe('1. Configuration & Explicit No-Graph Requirement', () => {
    it('enforces SHOW_KPI_TRENDS = false to satisfy explicit requirement', () => {
      expect(SHOW_KPI_TRENDS).toBe(false);
    });

    it('has standard business hours configured (09:30 - 19:00 IST, Mon-Sat)', () => {
      expect(BUSINESS_HOURS.START_HOUR).toBe(9);
      expect(BUSINESS_HOURS.START_MINUTE).toBe(30);
      expect(BUSINESS_HOURS.END_HOUR).toBe(19);
      expect(BUSINESS_HOURS.MINUTES_PER_DAY).toBe(570);
      expect(BUSINESS_HOURS.WORKING_DAYS).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('2. Pure Policy Matching & Path Computation', () => {
    it('matches single-tier discount policy for amounts below ₹5,000 / 5%', () => {
      const result = matchPolicy(DEFAULT_POLICIES, {
        type: APPROVAL_TYPES.DISCOUNT,
        amountPaise: 300000, // ₹3,000
        percent: 1.2,
        requesterLimitPaise: 200000, // ₹2,000
      });

      expect(result.policy.id).toBe('pol-discount');
      expect(result.levels.length).toBe(1);
      expect(result.levels[0].approverRoles).toContain(ROLES.SALES_MANAGER);
      expect(result.totalSlaHours).toBe(4);
    });

    it('matches 2-tier dual-control discount policy for amounts exceeding ₹5,000 or 5%', () => {
      const result = matchPolicy(DEFAULT_POLICIES, {
        type: APPROVAL_TYPES.DISCOUNT,
        amountPaise: 6500000, // ₹65,000
        percent: 6.2,
        requesterLimitPaise: 200000,
      });

      expect(result.policy.id).toBe('pol-discount');
      expect(result.levels.length).toBe(2);
      expect(result.levels[0].approverRoles).toContain(ROLES.SALES_MANAGER);
      expect(result.levels[1].approverRoles).toContain(ROLES.BRANCH_MANAGER);
      expect(result.totalSlaHours).toBe(6);
    });

    it('matches 2-tier refund policy for amounts exceeding ₹25,000 (Accounts + Branch Manager)', () => {
      const result = matchPolicy(DEFAULT_POLICIES, {
        type: APPROVAL_TYPES.REFUND,
        amountPaise: 3500000, // ₹35,000
      });

      expect(result.policy.id).toBe('pol-refund');
      expect(result.levels.length).toBe(2);
      expect(result.levels[0].approverRoles).toContain(ROLES.ACCOUNTANT);
      expect(result.levels[1].approverRoles).toContain(ROLES.BRANCH_MANAGER);
    });

    it('matches high-value write-off policy (>₹50,000) requiring Super Admin sign-off', () => {
      const result = matchPolicy(DEFAULT_POLICIES, {
        type: APPROVAL_TYPES.WRITE_OFF,
        amountPaise: 6000000, // ₹60,000
      });

      expect(result.policy.id).toBe('pol-write-off');
      expect(result.levels.length).toBe(2);
      expect(result.levels[1].approverRoles).toEqual([ROLES.SUPER_ADMIN]);
      expect(result.totalSlaHours).toBe(8);
    });
  });

  describe('3. Strict Dual-Control Eligibility & Self-Approval Block', () => {
    const sampleDiscountPolicy = DEFAULT_POLICIES.find((p) => p.id === 'pol-discount');

    it('STRICTLY BLOCKS a requester from approving their own request (even Super Admin!)', () => {
      const superAdminUser = {
        id: 'usr-001',
        name: 'Rajesh Varma',
        role: ROLES.SUPER_ADMIN,
        primaryBranchId: 'br-blr-central',
      };

      const ownRequest = {
        id: 'APR-2026-9999',
        requesterId: 'usr-001',
        requesterName: 'Rajesh Varma',
        status: APPROVAL_STATUS.PENDING,
        currentLevel: 1,
        levels: [{ level: 1, approverRoles: [ROLES.SUPER_ADMIN] }],
        branchId: 'br-blr-central',
      };

      const decision = canUserDecide(superAdminUser, ownRequest, sampleDiscountPolicy);
      expect(decision.canDecide).toBe(false);
      expect(decision.reason).toContain('Dual-control violation');
    });

    it('blocks a user who already approved Level 1 from approving Level 2 on the same request', () => {
      const branchManager = {
        id: 'usr-013',
        name: 'Shalini Nair',
        role: ROLES.BRANCH_MANAGER,
        primaryBranchId: 'br-blr-central',
      };

      const multiTierRequest = {
        id: 'APR-2026-5555',
        requesterId: 'usr-006',
        requesterName: 'Vikram Malhotra',
        status: APPROVAL_STATUS.PENDING,
        currentLevel: 2,
        levels: [
          {
            level: 1,
            approverRoles: [ROLES.BRANCH_MANAGER],
            status: APPROVAL_STATUS.APPROVED,
            decidedById: 'usr-013', // Shalini approved Level 1
            decidedBy: 'Shalini Nair',
          },
          {
            level: 2,
            approverRoles: [ROLES.BRANCH_MANAGER, ROLES.SUPER_ADMIN],
            status: APPROVAL_STATUS.PENDING,
          },
        ],
        branchId: 'br-blr-central',
      };

      const decision = canUserDecide(branchManager, multiTierRequest, sampleDiscountPolicy);
      expect(decision.canDecide).toBe(false);
      expect(decision.reason).toContain('already decided a previous level');
    });

    it('blocks named beneficiary from deciding the request', () => {
      const beneficiaryUser = {
        id: 'usr-007',
        name: 'Deepak Rao',
        role: ROLES.SALES_MANAGER,
        primaryBranchId: 'br-blr-central',
      };

      const incentiveRequest = {
        id: 'APR-2026-7777',
        requesterId: 'usr-003',
        requesterName: 'Pooja Iyer',
        beneficiaryId: 'usr-007', // Deepak is beneficiary
        status: APPROVAL_STATUS.PENDING,
        currentLevel: 1,
        levels: [{ level: 1, approverRoles: [ROLES.SALES_MANAGER] }],
        branchId: 'br-blr-central',
      };

      const decision = canUserDecide(beneficiaryUser, incentiveRequest, sampleDiscountPolicy);
      expect(decision.canDecide).toBe(false);
      expect(decision.reason).toContain('named beneficiary');
    });

    it('blocks approvers from different branch (unless Super Admin)', () => {
      const otherBranchManager = {
        id: 'usr-012',
        name: 'Girish Patil',
        role: ROLES.BRANCH_MANAGER,
        primaryBranchId: 'br-indiranagar', // Different branch
      };

      const centralRequest = {
        id: 'APR-2026-1111',
        requesterId: 'usr-007',
        requesterName: 'Deepak Rao',
        status: APPROVAL_STATUS.PENDING,
        currentLevel: 1,
        levels: [{ level: 1, approverRoles: [ROLES.BRANCH_MANAGER] }],
        branchId: 'br-blr-central', // Central Flagship
      };

      const decision = canUserDecide(otherBranchManager, centralRequest, sampleDiscountPolicy);
      expect(decision.canDecide).toBe(false);
      expect(decision.reason).toContain('Branch mismatch');
    });

    it('allows eligible supervisor to decide valid request', () => {
      const salesManager = {
        id: 'usr-002',
        name: 'Anand Kumar',
        role: ROLES.SALES_MANAGER,
        primaryBranchId: 'br-blr-central',
      };

      const validRequest = {
        id: 'APR-2026-0001',
        requesterId: 'usr-007',
        requesterName: 'Deepak Rao',
        status: APPROVAL_STATUS.PENDING,
        currentLevel: 1,
        levels: [{ level: 1, approverRoles: [ROLES.SALES_MANAGER] }],
        branchId: 'br-blr-central',
      };

      const decision = canUserDecide(salesManager, validRequest, sampleDiscountPolicy);
      expect(decision.canDecide).toBe(true);
    });
  });

  describe('4. Business-Hours SLA Calculation & Clock States', () => {
    it('checks business hours boundaries correctly (Mon-Sat 09:30 - 19:00 IST)', () => {
      // Wednesday 10:30 AM IST (within business hours)
      const workTime = new Date('2026-10-28T05:00:00Z'); // 10:30 AM IST is 05:00 UTC
      expect(isWithinBusinessHours(workTime)).toBe(true);

      // Sunday 11:00 AM IST (non-working day)
      const sundayTime = new Date('2026-10-25T05:30:00Z');
      expect(isWithinBusinessHours(sundayTime)).toBe(false);
    });

    it('adds business hours properly advancing across day boundaries', () => {
      const start = new Date('2026-10-28T09:30:00'); // Wed 09:30
      const due = addBusinessHours(start, 4); // 4 business hours -> 13:30 same day
      expect(due.getHours()).toBe(13);
      expect(due.getMinutes()).toBe(30);
    });

    it('closed requests NEVER show SLA remaining or overdue (explicit requirement)', () => {
      const closedApprovedRequest = {
        id: 'APR-2026-0002',
        status: APPROVAL_STATUS.APPROVED,
        createdAt: '2026-10-31T08:00:00Z',
        decidedAt: '2026-10-31T10:15:00Z',
        sla: { dueAt: '2026-10-31T14:00:00Z', businessMinutes: 360 },
      };

      const slaState = computeRequestSla(closedApprovedRequest);
      expect(slaState.isClosed).toBe(true);
      expect(slaState.isOverdue).toBeUndefined();
      expect(slaState.remainingMinutes).toBeUndefined();
      expect(slaState.turnaroundText).toBeDefined();
      expect(slaState.wasWithinSla).toBe(true);
    });

    it('open overdue requests show overdue status with formatted duration', () => {
      const overdueRequest = {
        id: 'APR-2026-0008',
        status: APPROVAL_STATUS.ESCALATED,
        createdAt: '2026-10-30T10:00:00Z',
        sla: { dueAt: '2026-10-30T14:00:00Z', businessMinutes: 240, escalationTarget: 'Branch Manager' },
      };

      const referenceNow = new Date('2026-10-31T10:00:00Z'); // Next day
      const slaState = computeRequestSla(overdueRequest, referenceNow);

      expect(slaState.isClosed).toBe(false);
      expect(slaState.isOverdue).toBe(true);
      expect(slaState.label).toContain('Overdue');
    });

    it('paused requests (Returned for changes) show paused SLA clock', () => {
      const returnedRequest = {
        id: 'APR-2026-0009',
        status: APPROVAL_STATUS.RETURNED,
        createdAt: '2026-10-31T09:15:00Z',
        sla: { pausedAt: '2026-10-31T10:00:00Z' },
      };

      const slaState = computeRequestSla(returnedRequest);
      expect(slaState.isClosed).toBe(false);
      expect(slaState.isPaused).toBe(true);
      expect(slaState.label).toBe('Clock paused');
    });
  });

  describe('5. Policy Compliance & Approval Performance Scoring', () => {
    it('calculates approval performance from decided requests', () => {
      const decided = SEEDED_APPROVALS.filter((r) =>
        [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(r.status)
      );

      const perf = evaluatePerformance(decided);
      expect(perf.totalDecided).toBeGreaterThan(0);
      expect(perf.performanceRate).toBeGreaterThan(0);
      expect(perf.avgTurnaroundFormatted).toBeDefined();
      expect(perf.medianTurnaroundFormatted).toBeDefined();
    });

    it('identifies emergency overrides and compliance exceptions', () => {
      const decided = SEEDED_APPROVALS.filter((r) =>
        [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(r.status)
      );

      const comp = evaluateCompliance(decided);
      expect(comp.totalDecided).toBeGreaterThan(0);

      // APR-2026-0012 has isEmergencyOverride = true -> must be flagged as exception
      const overrideException = comp.exceptions.find((e) => e.requestId === 'APR-2026-0012');
      expect(overrideException).toBeDefined();
      expect(overrideException.rule).toContain('Emergency Override');
      expect(comp.complianceRate).toBeLessThan(100); // Cannot be 100% when exceptions exist
    });
  });

  describe('6. Bulk Approval Validation Rules', () => {
    it('prohibits bulk approval on requests exceeding policy bulkLimit', () => {
      const discountPolicy = DEFAULT_POLICIES.find((p) => p.type === APPROVAL_TYPES.DISCOUNT);
      expect(discountPolicy.bulkLimitPaise).toBe(500000); // ₹5,000 max

      const highValueReq = {
        id: 'APR-2026-0005',
        type: APPROVAL_TYPES.DISCOUNT,
        amountPaise: 6500000, // ₹65,000 > ₹5,000
      };

      const isBulkEligible = highValueReq.amountPaise <= discountPolicy.bulkLimitPaise;
      expect(isBulkEligible).toBe(false);
    });

    it('prohibits bulk approval for campaign requests (statutory individual review)', () => {
      const campaignPolicy = DEFAULT_POLICIES.find((p) => p.type === APPROVAL_TYPES.CAMPAIGN);
      expect(campaignPolicy.bulkLimitPaise).toBe(0); // Prohibited
    });
  });
});

