// src/features/approvals/pages/ApprovalsPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CountUp } from '../../../components/ui/CountUp';
import { staggerContainer, cardEntranceVariants, cardHoverProps } from '../../../lib/motion';
import { useAppStore } from '../../../store';
import {
  APPROVAL_STATUS,
  APPROVAL_TYPES,
  APPROVAL_MODULES,
  STATUS_COLORS,
  TYPE_COLORS,
  SHOW_KPI_TRENDS,
} from '../../../approvals/config';
import { canUserDecide, evaluateCompliance, evaluatePerformance } from '../../../approvals/engine';
import { computeRequestSla, getSimulatedNow, advanceDevClock, resetDevClock } from '../../../approvals/sla';
import { startApprovalsScheduler, stopApprovalsScheduler } from '../../../approvals/timer';
import { formatMoney } from '../../../lib/format';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import { ApprovalDetailsDrawer } from '../components/ApprovalDetailsDrawer';
import { PolicyGuideDrawer } from '../components/PolicyGuideDrawer';
import { ManageRulesModal } from '../components/ManageRulesModal';
import { BulkActionModal } from '../components/BulkActionModal';
import { DelegateModal } from '../components/DelegateModal';
import { ExportApprovalsModal } from '../components/ExportApprovalsModal';
import {
  Home,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  User,
  Users,
  Search,
  Filter,
  Download,
  BookOpen,
  Sliders,
  MoreVertical,
  Eye,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  ExternalLink,
  History,
  Send,
  Zap,
  FastForward,
} from 'lucide-react';
import { toast } from 'sonner';

export function ApprovalsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Store state & actions
  const approvals = useAppStore((state) => state.approvals || []);
  const policies = useAppStore((state) => state.approvalPolicies || []);
  const currentUser = useAppStore((state) => state.currentUser);
  const decideApproval = useAppStore((state) => state.decideApproval);
  const cancelApproval = useAppStore((state) => state.cancelApproval);
  const bulkDecideApprovals = useAppStore((state) => state.bulkDecideApprovals);

  // Background timer tick
  useEffect(() => {
    startApprovalsScheduler();
    return () => stopApprovalsScheduler();
  }, []);

  // Check if current user has permission to decide approvals
  const canViewPendingTab = useMemo(() => {
    return hasPermission(currentUser, PERMISSIONS.APPROVALS_VIEW_PENDING) ||
      ['Super Admin', 'Branch Manager', 'Sales Manager', 'Service Manager', 'Accountant'].includes(currentUser?.role);
  }, [currentUser]);

  // URL Query Params state
  const activeTab = searchParams.get('tab') || (canViewPendingTab ? 'PENDING_ME' : 'REQUESTED_ME');
  const searchQuery = searchParams.get('q') || '';
  const moduleFilter = searchParams.get('module') || 'ALL';
  const statusFilter = searchParams.get('status') || 'ALL';
  const dateRange = searchParams.get('dateRange') || 'ALL';
  const limitPendingDate = searchParams.get('limitPendingDate') === 'true';
  const filterExceptionsOnly = searchParams.get('exceptionsOnly') === 'true';
  const sortBy = searchParams.get('sort') || 'createdAt';
  const sortOrder = searchParams.get('order') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('size') || '10', 10);
  const openRequestId = searchParams.get('request') || null;

  // Local drawer / modal states
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isManageRulesOpen, setIsManageRulesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [delegatingRequest, setDelegatingRequest] = useState(null);
  const [bulkActionType, setBulkActionType] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Helper to update search params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === 'ALL' || val === '' || val === false) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(val));
      }
    });
    if (!('page' in updates) && updates.page === undefined) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (newTab) => {
    updateParams({ tab: newTab, page: 1, exceptionsOnly: null });
    setSelectedUserIds([]);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.row-action-menu')) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Compute 4 KPI counts (strictly plain numbers, no graphs, no sparklines)
  const kpis = useMemo(() => {
    const now = getSimulatedNow();
    const todayStr = now.toISOString().slice(0, 10);

    // 1. Pending for Me: open requests current user is eligible to decide
    const pendingForMeCount = approvals.filter((req) => {
      if (![APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(req.status)) return false;
      const policy = policies.find((p) => p.id === req.policyId);
      return canUserDecide(currentUser, req, policy).canDecide;
    }).length;

    // 2. Requested by Me: my requests still open
    const requestedByMeCount = approvals.filter((req) => {
      const isMine =
        req.requesterId === currentUser?.id ||
        (req.requesterEmail && req.requesterEmail.toLowerCase() === (currentUser?.email || '').toLowerCase()) ||
        req.requesterName === currentUser?.name;
      return isMine && [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED, APPROVAL_STATUS.RETURNED].includes(req.status);
    }).length;

    // 3. Approved Today within visibility scope
    const approvedTodayCount = approvals.filter((req) => {
      if (req.status !== APPROVAL_STATUS.APPROVED) return false;
      const d = req.decidedAt ? req.decidedAt.slice(0, 10) : '';
      return d === todayStr;
    }).length;

    // 4. Rejected Today within visibility scope
    const rejectedTodayCount = approvals.filter((req) => {
      if (req.status !== APPROVAL_STATUS.REJECTED) return false;
      const d = req.decidedAt ? req.decidedAt.slice(0, 10) : '';
      return d === todayStr;
    }).length;

    return {
      pendingForMeCount,
      requestedByMeCount,
      approvedTodayCount,
      rejectedTodayCount,
    };
  }, [approvals, policies, currentUser]);

  // Bottom 4 Cards Metrics (Performance, Avg Time, Compliance)
  const bottomMetrics = useMemo(() => {
    const decidedRequests = approvals.filter((r) =>
      [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(r.status)
    );

    const compliance = evaluateCompliance(decidedRequests);
    const performance = evaluatePerformance(decidedRequests);

    return {
      compliance,
      performance,
    };
  }, [approvals]);

  // Filtered requests based on active tab and filters
  const filteredApprovals = useMemo(() => {
    const now = getSimulatedNow();

    return approvals.filter((req) => {
      const isMine =
        req.requesterId === currentUser?.id ||
        (req.requesterEmail && req.requesterEmail.toLowerCase() === (currentUser?.email || '').toLowerCase()) ||
        req.requesterName === currentUser?.name;

      const policy = policies.find((p) => p.id === req.policyId);
      const isEligibleToDecide = canUserDecide(currentUser, req, policy).canDecide;

      // 1. Tab Scoping
      if (activeTab === 'PENDING_ME') {
        if (![APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(req.status)) return false;
        if (!isEligibleToDecide) return false;
      } else if (activeTab === 'REQUESTED_ME') {
        if (!isMine) return false;
      } else if (activeTab === 'HISTORY') {
        // Closed requests or decisions history
        if ([APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(req.status)) return false;

        // Staff can only see their own history
        if (!canViewPendingTab && !isMine) return false;
      }

      // Filter exceptions only (from Policy Compliance card click)
      if (filterExceptionsOnly) {
        if (!req.isEmergencyOverride && !(req.slaBreached && req.status === APPROVAL_STATUS.APPROVED)) {
          return false;
        }
      }

      // 2. Module Filter
      if (moduleFilter !== 'ALL' && req.sourceModule !== moduleFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL' && req.status !== statusFilter) {
        return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (req.id || '').toLowerCase().includes(q) || (req.legacyId || '').toLowerCase().includes(q);
        const matchesTitle = (req.title || '').toLowerCase().includes(q);
        const matchesRequester = (req.requesterName || '').toLowerCase().includes(q);
        const matchesType = (req.type || '').toLowerCase().includes(q);
        const matchesCustomer = (req.customerName || '').toLowerCase().includes(q);
        const matchesVehicle = (req.vehicleModel || '').toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesRequester && !matchesType && !matchesCustomer && !matchesVehicle) {
          return false;
        }
      }

      // 5. Date Range Filter
      // Rule: In Pending for Me, date range is ignored unless "limitPendingDate" is toggled
      if (dateRange !== 'ALL') {
        if (activeTab === 'PENDING_ME' && !limitPendingDate) {
          // Ignore date filter on pending
        } else {
          const targetDateStr = activeTab === 'HISTORY' ? req.decidedAt || req.createdAt : req.createdAt;
          if (targetDateStr) {
            const targetDate = new Date(targetDateStr);
            const diffDays = (now - targetDate) / (1000 * 60 * 60 * 24);

            if (dateRange === 'TODAY' && diffDays > 1) return false;
            if (dateRange === 'LAST_7_DAYS' && diffDays > 7) return false;
            if (dateRange === 'LAST_30_DAYS' && diffDays > 30) return false;
          }
        }
      }

      return true;
    });
  }, [
    approvals,
    policies,
    currentUser,
    activeTab,
    canViewPendingTab,
    filterExceptionsOnly,
    moduleFilter,
    statusFilter,
    searchQuery,
    dateRange,
    limitPendingDate,
  ]);

  // Sort
  const sortedApprovals = useMemo(() => {
    return [...filteredApprovals].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'amount') {
        valA = a.amountPaise || 0;
        valB = b.amountPaise || 0;
      } else if (sortBy === 'requester') {
        valA = (a.requesterName || '').toLowerCase();
        valB = (b.requesterName || '').toLowerCase();
      } else if (sortBy === 'type') {
        valA = (a.type || '').toLowerCase();
        valB = (b.type || '').toLowerCase();
      } else if (sortBy === 'status') {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      } else {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredApprovals, sortBy, sortOrder]);

  // Pagination
  const totalEntries = sortedApprovals.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedApprovals = sortedApprovals.slice(startIndex, startIndex + pageSize);

  // Table row selection
  const currentPageIds = paginatedApprovals.map((r) => r.id);
  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedUserIds.includes(id));

  const handleToggleCurrentPage = () => {
    if (isAllCurrentSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      updateParams({ sort: field, order: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sort: field, order: 'asc' });
    }
  };

  // Quick action buttons
  const handleQuickDecision = (request, decision) => {
    try {
      decideApproval(request.id, decision, {
        note: decision === 'APPROVE' ? 'Approved under managerial authority.' : '',
      });
      toast.success(`${request.id} ${decision.toLowerCase()}d successfully.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExecuteBulkAction = (action, targetIds, note) => {
    const results = bulkDecideApprovals(targetIds, action, note);
    const successCount = results.filter((r) => r.success).length;
    toast.success(`Bulk ${action.toLowerCase()} completed for ${successCount} requests.`);
    setBulkActionType(null);
    setSelectedUserIds([]);
  };

  const handleManualRefresh = () => {
    setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    toast.success('Approvals cache synchronized.');
  };

  // Dev clock advance
  const handleAdvanceClock = (mins) => {
    advanceDevClock(mins);
    toast.info(`Simulated clock advanced by ${mins} minutes. Background timers updated.`);
    // Trigger tick
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const renderInitials = (name) => {
    return (name || 'Staff')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-2 sm:p-4 max-w-[1600px] mx-auto space-y-6"
    >
      {/* 1. Breadcrumb & Header */}
      <motion.div variants={cardEntranceVariants} className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-text-glass-muted font-medium">
          <Home className="w-3.5 h-3.5 text-text-glass-muted" />
          <span>&gt;</span>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-text-glass-main font-semibold">Approvals Center</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-emerald-700 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-glass-main tracking-tight flex items-center gap-2">
                Dual-Control Approvals Center
              </h1>
              <p className="text-xs text-text-glass-muted">
                Strict statutory governance: discounts, refunds, write-offs, journal entries, and campaigns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dev Clock helper (subtle, clearly marked for testing) */}
            <div className="hidden lg:flex items-center bg-white/20 border border-white/30 rounded-full p-1 text-[11px] font-semibold text-text-glass-main shadow-xs">
              <span className="px-2 text-text-glass-muted">Dev Clock:</span>
              <button
                type="button"
                onClick={() => handleAdvanceClock(60)}
                title="Advance clock by 1 hour to test SLA countdown and reminders"
                className="px-2.5 py-0.5 bg-white/40 hover:bg-white/60 rounded-full border border-white/40 text-blue-900 mr-1 cursor-pointer transition-colors"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceClock(240)}
                title="Advance clock by 4 hours to test SLA breach and auto-escalation"
                className="px-2.5 py-0.5 bg-white/40 hover:bg-white/60 rounded-full border border-white/40 text-amber-900 mr-1 cursor-pointer transition-colors"
              >
                +4h (Breach)
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDevClock();
                  window.location.reload();
                }}
                title="Reset simulated clock back to current time"
                className="px-2 py-0.5 text-text-glass-muted hover:text-black cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-98"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>Approval Policy Guide</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Four KPI Cards (Plain Design: Icon, Label, Big Number, Subtext. No Graphs/Rings/Arrows) */}
      <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending for Me */}
        <motion.div
          {...cardHoverProps}
          onClick={() => handleTabChange('PENDING_ME')}
          className={`glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover ${activeTab === 'PENDING_ME' ? 'border-blue-500 ring-2 ring-blue-400/40' : ''
            }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Pending for Me</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.pendingForMeCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">Requires your approval</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-blue-700 shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Requested by Me */}
        <motion.div
          {...cardHoverProps}
          onClick={() => handleTabChange('REQUESTED_ME')}
          className={`glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover ${activeTab === 'REQUESTED_ME' ? 'border-emerald-500 ring-2 ring-emerald-400/40' : ''
            }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Requested by Me</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.requestedByMeCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">Awaiting other approval</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-emerald-700 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Approved Today */}
        <motion.div
          {...cardHoverProps}
          onClick={() => {
            handleTabChange('HISTORY');
            updateParams({ status: APPROVAL_STATUS.APPROVED, dateRange: 'TODAY' });
          }}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Approved Today</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.approvedTodayCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">Decisions made today (IST)</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-purple-700 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Rejected Today */}
        <motion.div
          {...cardHoverProps}
          onClick={() => {
            handleTabChange('HISTORY');
            updateParams({ status: APPROVAL_STATUS.REJECTED, dateRange: 'TODAY' });
          }}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Rejected Today</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.rejectedTodayCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">Decisions made today (IST)</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-rose-700 shadow-xs">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Navigation Tabs */}
      <motion.div variants={cardEntranceVariants} className="flex items-center overflow-x-auto no-scrollbar py-1">
        <nav className="p-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center gap-1 shadow-xs" aria-label="Approvals Tabs">
          {canViewPendingTab && (
            <button
              type="button"
              onClick={() => handleTabChange('PENDING_ME')}
              className={`relative whitespace-nowrap py-1.5 px-4 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer z-10 ${activeTab === 'PENDING_ME' ? 'text-white' : 'text-text-glass-main hover:text-black hover:bg-white/10'
                }`}
            >
              {activeTab === 'PENDING_ME' && (
                <motion.div
                  layoutId="approvalsActiveTab"
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className="absolute inset-0 bg-[#0b1220] rounded-full shadow-sm -z-10"
                />
              )}
              <span>Pending for Me</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpis.pendingForMeCount > 0 ? 'bg-amber-400 text-slate-950' : 'bg-white/30 text-text-glass-main'
                  }`}
              >
                {kpis.pendingForMeCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange('REQUESTED_ME')}
            className={`relative whitespace-nowrap py-1.5 px-4 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer z-10 ${activeTab === 'REQUESTED_ME' ? 'text-white' : 'text-text-glass-main hover:text-black hover:bg-white/10'
              }`}
          >
            {activeTab === 'REQUESTED_ME' && (
              <motion.div
                layoutId="approvalsActiveTab"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="absolute inset-0 bg-[#0b1220] rounded-full shadow-sm -z-10"
              />
            )}
            <span>Requested by Me</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpis.requestedByMeCount > 0 ? 'bg-blue-500/30 text-blue-900' : 'bg-white/30 text-text-glass-main'
                }`}
            >
              {kpis.requestedByMeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('HISTORY')}
            className={`relative whitespace-nowrap py-1.5 px-4 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer z-10 ${activeTab === 'HISTORY' ? 'text-white' : 'text-text-glass-main hover:text-black hover:bg-white/10'
              }`}
          >
            {activeTab === 'HISTORY' && (
              <motion.div
                layoutId="approvalsActiveTab"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="absolute inset-0 bg-[#0b1220] rounded-full shadow-sm -z-10"
              />
            )}
            <span>Approval History</span>
            {filterExceptionsOnly && (
              <span className="text-[10px] bg-red-500/20 text-red-900 font-bold px-2 py-0.5 rounded-full border border-red-400/30">
                Exceptions
              </span>
            )}
          </button>
        </nav>
      </motion.div>

      {/* 4. Filter Bar */}
      <Card className="p-3.5 bg-white border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request ID, title, requester name, customer, or type..."
              value={searchQuery}
              onChange={(e) => updateParams({ q: e.target.value })}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => updateParams({ q: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Modules */}
            <select
              value={moduleFilter}
              onChange={(e) => updateParams({ module: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Modules</option>
              {Object.values(APPROVAL_MODULES).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => updateParams({ status: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              {Object.values(APPROVAL_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => updateParams({ dateRange: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
            </select>

            {/* Toggle in Pending for Me: "Limit to this period" */}
            {activeTab === 'PENDING_ME' && dateRange !== 'ALL' && (
              <label className="flex items-center gap-1.5 text-xs text-slate-600 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={limitPendingDate}
                  onChange={(e) => updateParams({ limitPendingDate: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Limit to period</span>
              </label>
            )}

            {/* Clear Filters */}
            {(searchQuery || moduleFilter !== 'ALL' || statusFilter !== 'ALL' || dateRange !== 'ALL' || filterExceptionsOnly) && (
              <button
                onClick={() => updateParams({ q: '', module: 'ALL', status: 'ALL', dateRange: 'ALL', exceptionsOnly: null })}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-2"
              >
                Clear filters
              </button>
            )}

            {/* Manual Refresh Button */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Refresh approvals data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                Updated {lastRefreshedTime}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Bulk Actions Bar (When Rows Selected) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {selectedUserIds.length} request{selectedUserIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setBulkActionType('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-3 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionType('REJECT')}
              className="bg-white border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs h-7 px-3"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionType('RETURN')}
              className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs h-7 px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Return Selected
            </Button>

            <button
              onClick={() => setSelectedUserIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 6. Main Approvals Table */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleToggleCurrentPage}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Ref ID</span>
                    {sortBy === 'id' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800"
                >
                  Type
                </th>
                <th className="py-3 px-4">Request Summary</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('requester')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                >
                  Requester
                </th>
                <th className="py-3 px-4">Triggered Governance Rule</th>

                {/* Conditional Columns depending on Tab */}
                {activeTab === 'HISTORY' ? (
                  <>
                    <th className="py-3 px-3">Decided By</th>
                    <th className="py-3 px-3">Decided At</th>
                    <th className="py-3 px-3">Turnaround</th>
                  </>
                ) : (
                  <th className="py-3 px-3">SLA / Escalation</th>
                )}

                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800"
                >
                  Status
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedApprovals.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-bold text-slate-700 text-sm">
                      {activeTab === 'PENDING_ME'
                        ? 'Nothing waiting for you'
                        : activeTab === 'REQUESTED_ME'
                          ? 'No open requests initiated by you'
                          : 'No approval history found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeTab === 'PENDING_ME'
                        ? 'All statutory approval workflows are currently up to date.'
                        : 'Adjust or clear your search filters above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedApprovals.map((req) => {
                  const isSelected = selectedUserIds.includes(req.id);
                  const sla = computeRequestSla(req);
                  const policy = policies.find((p) => p.id === req.policyId);
                  const check = canUserDecide(currentUser, req, policy);

                  return (
                    <tr
                      key={req.id}
                      onClick={() => updateParams({ request: req.id })}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/40' : ''
                        }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRow(req.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(req.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Ref ID */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-900 hover:text-blue-600">
                          {req.id}
                        </span>
                        {req.legacyId && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {req.legacyId}
                          </span>
                        )}
                      </td>

                      {/* Type Chip */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_COLORS[req.type] || 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {req.type}
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{req.title}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {req.summary || req.justification}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {req.amountPaise ? formatMoney(req.amountPaise) : 'N/A'}
                        {req.percent > 0 && (
                          <span className="block text-[10px] font-medium text-blue-600">
                            {req.percent}% of price
                          </span>
                        )}
                      </td>

                      {/* Requester */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {renderInitials(req.requesterName)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block truncate max-w-[130px]">
                              {req.requesterName}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                              {req.requesterRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rule */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-600 font-medium line-clamp-1" title={req.ruleText}>
                          {req.ruleText}
                        </span>
                      </td>

                      {/* SLA or Decided Info depending on tab */}
                      {activeTab === 'HISTORY' ? (
                        <>
                          <td className="py-3.5 px-3 font-medium text-slate-800">
                            {req.decidedBy || 'System'}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {req.decidedAt
                              ? new Date(req.decidedAt).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                              : '—'}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${sla.statusColor}`}
                            >
                              {sla.turnaroundText}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td className="py-3.5 px-3">
                          <span
                            title={sla.escalationText}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${sla.pillColor}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{sla.label}</span>
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5 relative row-action-menu">
                          {/* If in Pending for Me & user can decide */}
                          {activeTab === 'PENDING_ME' && check.canDecide ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickDecision(req, 'APPROVE')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDecision(req, 'REJECT')}
                                className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded text-xs font-bold"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateParams({ request: req.id })}
                              className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}

                          {/* ⋮ Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === req.id ? null : req.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === req.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    updateParams({ request: req.id });
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>

                                {check.canDecide && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setDelegatingRequest(req);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Delegate Authority</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    const link = `${window.location.origin}/approvals?request=${req.id}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success('Approval link copied.');
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Link</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/audit?q=${req.id}`);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <History className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Audit Trail</span>
                                </button>

                                {/* Cancel request if mine and open */}
                                {(req.requesterId === currentUser?.id || req.requesterName === currentUser?.name) &&
                                  [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED, APPROVAL_STATUS.RETURNED].includes(req.status) && (
                                    <>
                                      <div className="border-t border-slate-100 my-1" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          cancelApproval(req.id, 'Withdrawn by requester');
                                          toast.info(`Request ${req.id} cancelled.`);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <X className="w-3.5 h-3.5 text-red-500" />
                                        <span>Withdraw Request</span>
                                      </button>
                                    </>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(startIndex + pageSize, totalEntries)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{totalEntries}</span> entries
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => updateParams({ size: e.target.value, page: 1 })}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-medium"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => updateParams({ page: safeCurrentPage - 1 })}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: pageNum })}
                      className={`min-w-[28px] h-7 px-2 rounded text-xs font-semibold ${safeCurrentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => updateParams({ page: safeCurrentPage + 1 })}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 7. Bottom Row: Approval Performance, Avg Approval Time, Policy Compliance, Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Approval Performance */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Approval Performance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {bottomMetrics.performance.performanceRate}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {bottomMetrics.performance.withinSlaCount} of {bottomMetrics.performance.totalDecided} within SLA
            </p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100" title="Percentage of closed requests that were decided before their statutory business-hours SLA window elapsed.">
            SLA window based on Mon-Sat 09:30-19:00 IST
          </div>
        </Card>

        {/* Card 2: Avg Approval Time */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Avg Approval Time</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {bottomMetrics.performance.avgTurnaroundFormatted}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Median turnaround: <span className="font-semibold text-slate-700">{bottomMetrics.performance.medianTurnaroundFormatted}</span>
            </p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Calculated over actual business hours
          </div>
        </Card>

        {/* Card 3: Policy Compliance */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Policy Compliance</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${bottomMetrics.compliance.complianceRate === 100
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                  }`}
              >
                {bottomMetrics.compliance.complianceRate === 100 ? '100% Verified' : 'Exceptions Found'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {bottomMetrics.compliance.complianceRate}%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {bottomMetrics.compliance.exceptionsCount === 0 ? (
                <span className="text-emerald-600 font-semibold">Zero exceptions detected</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('HISTORY');
                    updateParams({ exceptionsOnly: true });
                  }}
                  className="text-red-600 font-bold hover:underline"
                >
                  {bottomMetrics.compliance.exceptionsCount} exception{bottomMetrics.compliance.exceptionsCount > 1 ? 's' : ''} (Click to filter)
                </button>
              )}
            </p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            Enforces dual-control, notes &amp; attachments
          </div>
        </Card>

        {/* Card 4: Quick Actions */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-2">Governance Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports?dataset=approvals')}
                className="text-xs h-9 font-semibold border-slate-200 hover:bg-slate-50"
              >
                View Reports
              </Button>

              <Button
                size="sm"
                onClick={() => setIsManageRulesOpen(true)}
                className="text-xs h-9 font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                Manage Rules
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Configure thresholds, Maker-Checker &amp; simulators
          </p>
        </Card>
      </div>

      {/* 8. Modals & Slide-Over Drawers */}
      {/* Details Drawer */}
      {openRequestId && (
        <ApprovalDetailsDrawer
          requestId={openRequestId}
          isOpen={Boolean(openRequestId)}
          onClose={() => updateParams({ request: null })}
          onActionCompleted={() => {
            updateParams({ request: null });
            setSelectedUserIds([]);
          }}
        />
      )}

      {/* Policy Guide Drawer */}
      {isGuideOpen && (
        <PolicyGuideDrawer isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      )}

      {/* Manage Rules Modal */}
      {isManageRulesOpen && (
        <ManageRulesModal
          isOpen={isManageRulesOpen}
          onClose={() => setIsManageRulesOpen(false)}
        />
      )}

      {/* Bulk Action Modal */}
      {bulkActionType && (
        <BulkActionModal
          isOpen={Boolean(bulkActionType)}
          actionType={bulkActionType}
          selectedIds={selectedUserIds}
          onClose={() => setBulkActionType(null)}
          onConfirm={handleExecuteBulkAction}
        />
      )}

      {/* Delegation Modal */}
      {delegatingRequest && (
        <DelegateModal
          isOpen={Boolean(delegatingRequest)}
          request={delegatingRequest}
          onClose={() => setDelegatingRequest(null)}
        />
      )}

      {/* Export Report Modal */}
      {isExportOpen && (
        <ExportApprovalsModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          filteredApprovals={filteredApprovals}
        />
      )}
    </motion.div>
  );
}

export default ApprovalsPage;
