import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CountUp } from '../../../components/ui/CountUp';
import { staggerContainer, cardEntranceVariants, cardHoverProps } from '../../../lib/motion';
import { useAppStore } from '../../../store';
import { ROLES } from '../../../config/roles';
import { BRANCHES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';
import {
  SHOW_KPI_TRENDS,
  SECURITY_POLICY,
  PRIVILEGED_ROLES,
  canAssignRole,
  isPrivilegedRole,
} from '../../../config/usersConfig';
import { computeSecurityOverview } from '../utils/securityOverview';
import { AddStaffModal } from '../components/AddStaffModal';
import { StaffDrawer } from '../components/StaffDrawer';
import { ReassignDialog } from '../components/ReassignDialog';
import { QuickActionConfirmDialog } from '../components/QuickActionConfirmDialog';
import { ExportUsersModal } from '../components/ExportUsersModal';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Download,
  History,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  Edit2,
  LogOut,
  RotateCcw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export function UsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Store state and actions
  const users = useAppStore((state) => state.users || []);
  const branches = useAppStore((state) => state.branches || BRANCHES);
  const currentUser = useAppStore((state) => state.currentUser);
  const auditLogs = useAppStore((state) => state.auditLogs || []);
  const userDrafts = useAppStore((state) => state.userDrafts || []);

  const createUser = useAppStore((state) => state.createUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const lockUser = useAppStore((state) => state.lockUser);
  const unlockUser = useAppStore((state) => state.unlockUser);
  const toggleUser2FA = useAppStore((state) => state.toggleUser2FA);
  const deactivateUser = useAppStore((state) => state.deactivateUser);
  const reactivateUser = useAppStore((state) => state.reactivateUser);
  const resetUserPassword = useAppStore((state) => state.resetUserPassword);
  const forceLogoutUser = useAppStore((state) => state.forceLogoutUser);
  const resendUserInvite = useAppStore((state) => state.resendUserInvite);
  const bulkUpdateUsers = useAppStore((state) => state.bulkUpdateUsers);

  // Modals and dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDrawerUserId, setSelectedDrawerUserId] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reassigningUser, setReassigningUser] = useState(null);
  const [quickActionType, setQuickActionType] = useState(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);

  // Table selection & pagination state
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    staffMember: true,
    roleDept: true,
    branch: true,
    twoFactor: true,
    status: true,
    lastActive: true,
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Filters from URL Query Params
  const searchQuery = searchParams.get('q') || '';
  const roleFilter = searchParams.get('role') || 'ALL';
  const branchFilter = searchParams.get('branch') || 'ALL';
  const statusFilter = searchParams.get('status') || 'ALL';
  const twoFactorFilter = searchParams.get('twoFactor') || 'ALL';
  const dateMode = searchParams.get('dateMode') || 'lastActive';
  const dateRange = searchParams.get('dateRange') || 'ALL';
  const sortBy = searchParams.get('sort') || 'name';
  const sortOrder = searchParams.get('order') || 'asc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('size') || '10', 10);

  // Helper to update URL params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === 'ALL' || val === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(val));
      }
    });
    // Reset page to 1 on filter/search change unless page is explicitly set
    if (!('page' in updates) && updates.page === undefined) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSelectedUserIds([]);
    setSelectAllAcrossPages(false);
  };

  const isFiltered = Boolean(
    searchQuery ||
    roleFilter !== 'ALL' ||
    branchFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    twoFactorFilter !== 'ALL' ||
    dateRange !== 'ALL'
  );

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.user-row-menu')) {
        setActiveMenuUserId(null);
      }
      if (!e.target.closest('.column-picker-container')) {
        setIsColumnPickerOpen(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Compute security overview
  const securityOverview = useMemo(() => {
    return computeSecurityOverview(users);
  }, [users]);

  // Compute KPI metrics (strictly plain numbers + text, no graphs)
  const kpis = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter((u) => u.status === 'Active').length;
    const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

    const twoFactorCount = users.filter((u) => u.twoFactor?.enabled).length;
    const twoFactorPct = total > 0 ? ((twoFactorCount / total) * 100).toFixed(1) : '0';
    const privilegedWithout2FA = users.filter(
      (u) => isPrivilegedRole(u.role) && !u.twoFactor?.enabled && u.status !== 'Inactive'
    ).length;

    const lockedCount = users.filter((u) => u.status === 'Locked').length;

    // Last active today
    const now = new Date();
    const todayActiveCount = users.filter((u) => {
      if (!u.lastActiveAt) return false;
      const d = new Date(u.lastActiveAt);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
    const todayActivePct = total > 0 ? ((todayActiveCount / total) * 100).toFixed(1) : '0';

    return {
      total,
      activeCount,
      inactiveCount,
      twoFactorCount,
      twoFactorPct,
      privilegedWithout2FA,
      lockedCount,
      todayActiveCount,
      todayActivePct,
    };
  }, [users]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (user.name || user.fullName || '').toLowerCase().includes(q);
        const matchesEmail = (user.email || '').toLowerCase().includes(q);
        const matchesPhone = (user.phone || '').toLowerCase().includes(q);
        const matchesCode = (user.employeeCode || '').toLowerCase().includes(q);
        const matchesRole = (user.role || '').toLowerCase().includes(q);
        const matchesBranch = (user.primaryBranchName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCode && !matchesRole && !matchesBranch) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== 'ALL' && user.role !== roleFilter) {
        return false;
      }

      // Branch filter
      if (branchFilter !== 'ALL' && user.primaryBranchId !== branchFilter && !user.additionalBranchIds?.includes(branchFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && user.status !== statusFilter) {
        return false;
      }

      // 2FA filter
      if (twoFactorFilter !== 'ALL') {
        if (twoFactorFilter === 'Enabled' && !user.twoFactor?.enabled) return false;
        if (twoFactorFilter === 'Disabled' && user.twoFactor?.enabled) return false;
        if (twoFactorFilter === 'Required' && !user.twoFactor?.required) return false;
      }

      // Date Range filter
      if (dateRange !== 'ALL') {
        const targetDateStr = dateMode === 'createdOn' ? user.createdAt : user.lastActiveAt;
        if (!targetDateStr) return false;
        const targetDate = new Date(targetDateStr);
        const now = new Date();
        const diffMs = now - targetDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === 'TODAY' && diffDays > 1) return false;
        if (dateRange === 'LAST_7_DAYS' && diffDays > 7) return false;
        if (dateRange === 'LAST_30_DAYS' && diffDays > 30) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, branchFilter, statusFilter, twoFactorFilter, dateMode, dateRange]);

  // Sort
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = (a.name || a.fullName || '').toLowerCase();
        valB = (b.name || b.fullName || '').toLowerCase();
      } else if (sortBy === 'role') {
        valA = (a.role || '').toLowerCase();
        valB = (b.role || '').toLowerCase();
      } else if (sortBy === 'branch') {
        valA = (a.primaryBranchName || '').toLowerCase();
        valB = (b.primaryBranchName || '').toLowerCase();
      } else if (sortBy === 'status') {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      } else if (sortBy === 'lastActive') {
        valA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        valB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      } else {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  // Pagination
  const totalEntries = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  // Page selection calculations
  const currentPageIds = useMemo(() => paginatedUsers.map((u) => u.id), [paginatedUsers]);
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedUserIds.includes(id));
  const isSomeCurrentPageSelected =
    currentPageIds.some((id) => selectedUserIds.includes(id)) && !isAllCurrentPageSelected;

  const handleToggleCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
      setSelectAllAcrossPages(false);
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setSelectAllAcrossPages(false);
  };

  const handleSelectAllAcrossFiltered = () => {
    setSelectAllAcrossPages(true);
    setSelectedUserIds(sortedUsers.map((u) => u.id));
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
    setSelectAllAcrossPages(false);
  };

  // Sort click handler
  const handleSort = (field) => {
    if (sortBy === field) {
      updateParams({ sort: field, order: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sort: field, order: 'asc' });
    }
  };

  // Action handlers
  const handleQuickActionClick = (type) => {
    if (selectedUserIds.length === 0) return;
    setQuickActionType(type);
    setIsQuickActionOpen(true);
  };

  const handleExecuteQuickAction = (action, targetIds) => {
    bulkUpdateUsers(action, targetIds);
    setIsQuickActionOpen(false);
    setSelectedUserIds([]);
    setSelectAllAcrossPages(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleSaveStaff = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
      toast.success(`User ${userData.name || userData.fullName} updated`);
    } else {
      createUser(userData);
      toast.success(`User ${userData.name || userData.fullName} created`);
    }
    setEditingUser(null);
    setIsAddModalOpen(false);
  };

  const handleDeactivateClick = (user) => {
    // Check if user has dependencies
    const leads = useAppStore.getState().leads || [];
    const assignedLeads = leads.filter((l) => l.assignedToId === user.id || l.assignedTo === user.name);
    if (assignedLeads.length > 0) {
      setReassigningUser(user);
    } else {
      deactivateUser(user.id);
    }
  };

  // Avatar helper
  const renderAvatar = (user) => {
    const name = user.name || user.fullName || 'Staff Member';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');

    const colors = [
      'bg-blue-600 text-white',
      'bg-indigo-600 text-white',
      'bg-slate-700 text-white',
      'bg-teal-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
    ];
    const colorIndex = (user.id?.charCodeAt(user.id.length - 1) || 0) % colors.length;

    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={name}
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
        />
      );
    }

    return (
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs tracking-wider border border-white/20 shadow-sm ${colors[colorIndex]}`}
      >
        {initials || 'U'}
      </div>
    );
  };

  // Recent user activity from audit logs
  const recentUserActivity = useMemo(() => {
    const userLogEvents = [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_PASSWORD_RESET',
      'USER_LOCKED',
      'USER_UNLOCKED',
      'USER_DEACTIVATED',
      'USER_REACTIVATED',
      'USER_2FA_TOGGLED',
      'USER_FORCE_LOGOUT',
      'USER_INVITE_RESENT',
      'USER_BULK_UPDATE',
    ];

    const logs = auditLogs.filter(
      (log) =>
        userLogEvents.includes(log.action) ||
        log.entityType === 'USER' ||
        log.entityType === 'STAFF' ||
        log.category === 'SECURITY'
    );

    return logs.slice(0, 5).map((log) => {
      const getFriendlyText = () => {
        switch (log.action) {
          case 'USER_CREATED':
            return `New user added — ${log.newValue?.fullName || log.newValue?.name || log.entityId}`;
          case 'USER_2FA_TOGGLED':
            return `2FA ${log.newValue?.twoFactor?.enabled ? 'enabled' : 'disabled'} — ${log.newValue?.name || log.entityId}`;
          case 'USER_LOCKED':
            return `Account locked — ${log.entityId} (${log.newValue?.lockReason || 'security policy'})`;
          case 'USER_UNLOCKED':
            return `Account unlocked — ${log.entityId}`;
          case 'USER_PASSWORD_RESET':
            return `Password reset issued — ${log.entityId}`;
          case 'USER_DEACTIVATED':
            return `Staff deactivated — ${log.entityId}`;
          case 'USER_REACTIVATED':
            return `Staff reactivated — ${log.entityId}`;
          default:
            return `${log.action?.replace(/_/g, ' ') || 'User updated'} — ${log.entityId}`;
        }
      };

      const formatRelativeTime = (timestamp) => {
        if (!timestamp) return 'Recent';
        const d = new Date(timestamp);
        const now = new Date();
        const diffMins = Math.floor((now - d) / (1000 * 60));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      };

      return {
        id: log.id,
        text: getFriendlyText(),
        time: formatRelativeTime(log.timestamp),
      };
    });
  }, [auditLogs]);

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
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-text-glass-main font-semibold">Users &amp; Staff Administration</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-blue-700 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-glass-main tracking-tight">
                Users &amp; Staff Account Administration
              </h1>
              <p className="text-xs text-text-glass-muted">
                Manage staff credentials, 2-Factor Authentication enforcement, lockout states and branch allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-text-glass-muted" />
              <span>Export Users</span>
            </button>

            <button
              onClick={() => navigate('/admin/audit')}
              className="px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-text-glass-main text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-98"
            >
              <History className="w-3.5 h-3.5 text-text-glass-muted" />
              <span>Activity Logs</span>
            </button>

            <button
              onClick={() => {
                setEditingUser(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-[#0b1220] hover:bg-[#162033] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff User</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. KPI Cards (Plain Text & Numbers Only, No Graph / Ring / Arrow) */}
      <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff Users */}
        <motion.div
          {...cardHoverProps}
          onClick={() => updateParams({ status: 'ALL', role: 'ALL' })}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Total Staff Users</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.total} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">
                Active: <span className="font-semibold text-emerald-700">{kpis.activeCount}</span>
                {' · '}
                Inactive: <span className="font-semibold text-text-glass-muted">{kpis.inactiveCount}</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-blue-700 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* 2FA Enabled */}
        <motion.div
          {...cardHoverProps}
          onClick={() => updateParams({ twoFactor: 'Enabled' })}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">2FA Enabled</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.twoFactorCount} />
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-text-glass-muted font-medium">
                  {kpis.twoFactorPct}% of users
                </span>
                {kpis.privilegedWithout2FA > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                    {kpis.privilegedWithout2FA} privileged without 2FA
                  </span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-emerald-700 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Locked Accounts */}
        <motion.div
          {...cardHoverProps}
          onClick={() => updateParams({ status: 'Locked' })}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Locked Accounts</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.lockedCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">
                {kpis.lockedCount > 0 ? (
                  <span className="text-rose-700 font-semibold">Require review</span>
                ) : (
                  <span className="text-text-glass-muted">All accounts normal</span>
                )}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-purple-700 shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Last Active Today */}
        <motion.div
          {...cardHoverProps}
          onClick={() => updateParams({ dateMode: 'lastActive', dateRange: 'TODAY' })}
          className="glass-card glass-card-interactive !rounded-[24px] !p-5 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-text-glass-main uppercase tracking-wider">Last Active Today</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-glass-main mt-1 tabular-nums">
                <CountUp value={kpis.todayActiveCount} />
              </h3>
              <p className="text-xs text-text-glass-muted mt-1">
                <span className="font-semibold text-text-glass-main">{kpis.todayActivePct}%</span> of staff
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-amber-700 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Filter Bar & Search */}
      <Card className="p-3.5 bg-white border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, employee code, role, or branch..."
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

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Roles */}
            <select
              value={roleFilter}
              onChange={(e) => updateParams({ role: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Roles</option>
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {/* Branches */}
            <select
              value={branchFilter}
              onChange={(e) => updateParams({ branch: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => updateParams({ status: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Pending approval">Pending approval</option>
              <option value="Locked">Locked</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* 2FA Status */}
            <select
              value={twoFactorFilter}
              onChange={(e) => updateParams({ twoFactor: e.target.value })}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All 2FA Status</option>
              <option value="Enabled">2FA Enabled</option>
              <option value="Disabled">2FA Disabled</option>
              <option value="Required">2FA Required</option>
            </select>

            {/* Date Preset Filter */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    dateMode: dateMode === 'lastActive' ? 'createdOn' : 'lastActive',
                  })
                }
                title="Click to toggle filter mode between Last Active and Created On"
                className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium border-r border-slate-200 flex items-center gap-1"
              >
                <span>{dateMode === 'lastActive' ? 'Active' : 'Created'}</span>
              </button>
              <select
                value={dateRange}
                onChange={(e) => updateParams({ dateRange: e.target.value })}
                className="bg-transparent px-2 py-2 text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
              </select>
            </div>

            {/* Clear Filters */}
            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-2"
              >
                Clear filters
              </button>
            )}

            {/* Local Drafts Chip */}
            {userDrafts.length > 0 && (
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsAddModalOpen(true);
                }}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Drafts ({userDrafts.length})
              </button>
            )}

            {/* Column Picker */}
            <div className="relative column-picker-container">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsColumnPickerOpen(!isColumnPickerOpen);
                }}
                className="text-xs h-8 px-2.5 text-slate-600 border-slate-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                Columns
              </Button>
              {isColumnPickerOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 p-2 text-xs space-y-1">
                  <p className="font-semibold text-slate-700 px-2 py-1 border-b border-slate-100">
                    Visible Columns
                  </p>
                  {Object.entries({
                    roleDept: 'Role & Dept',
                    branch: 'Assigned Branch',
                    twoFactor: '2FA Status',
                    status: 'Status / Lockout',
                    lastActive: 'Last Active',
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={columnVisibility[key]}
                        onChange={(e) =>
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Selection Banner (When Rows Selected) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {selectAllAcrossPages
                ? `All ${sortedUsers.length} staff selected across all pages.`
                : `${selectedUserIds.length} staff selected on this page.`}
            </span>
            {!selectAllAcrossPages && sortedUsers.length > paginatedUsers.length && (
              <button
                onClick={handleSelectAllAcrossFiltered}
                className="underline font-bold text-blue-700 hover:text-blue-900 ml-1"
              >
                Select all {sortedUsers.length} staff in filter results
              </button>
            )}
          </div>
          <button
            onClick={handleClearSelection}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* 5. Main Staff Table */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeCurrentPageSelected;
                    }}
                    onChange={handleToggleCurrentPage}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Staff Member</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
                {columnVisibility.roleDept && (
                  <th
                    onClick={() => handleSort('role')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Role &amp; Dept</span>
                      {sortBy === 'role' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.branch && (
                  <th
                    onClick={() => handleSort('branch')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Branch</span>
                      {sortBy === 'branch' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.twoFactor && <th className="py-3 px-4">2FA Status</th>}
                {columnVisibility.status && (
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status / Lockout</span>
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.lastActive && (
                  <th
                    onClick={() => handleSort('lastActive')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Last Active</span>
                      {sortBy === 'lastActive' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                )}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-medium text-slate-600">No staff users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing or adjusting your search filters.
                    </p>
                    {isFiltered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-3 text-xs"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const rowNumber = startIndex + idx + 1;
                  const isLocked = user.status === 'Locked';
                  const isCurrentUser = currentUser?.id === user.id;

                  // Branch pills
                  const primaryBranch = user.primaryBranchName || 'Bangalore Central Flagship';
                  const extraBranches = (user.additionalBranchIds || [])
                    .map((id) => branches.find((b) => b.id === id)?.name)
                    .filter(Boolean);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleUser(user.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-3.5 px-2 text-center font-medium text-slate-400 text-[11px]">
                        {rowNumber}
                      </td>

                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {renderAvatar(user)}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => setSelectedDrawerUserId(user.id)}
                                className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                              >
                                {user.name || user.fullName}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-slate-400">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      {columnVisibility.roleDept && (
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              user.role === 'Super Admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : user.role === 'Sales Manager'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : user.role === 'Service Manager'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : user.role === 'Accountant'
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {user.role}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            {user.department || 'Operations'}
                          </div>
                        </td>
                      )}

                      {/* Assigned Branch */}
                      {columnVisibility.branch && (
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-xs">
                            {primaryBranch}
                          </div>
                          {extraBranches.length > 0 && (
                            <span
                              title={`Additional: ${extraBranches.join(', ')}`}
                              className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded cursor-help font-medium"
                            >
                              +{extraBranches.length} more
                            </span>
                          )}
                        </td>
                      )}

                      {/* 2FA Status */}
                      {columnVisibility.twoFactor && (
                        <td className="py-3.5 px-4">
                          {user.twoFactor?.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Enabled
                            </span>
                          ) : user.twoFactor?.required ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <Shield className="w-3 h-3 text-slate-400" />
                              Disabled
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status / Lockout */}
                      {columnVisibility.status && (
                        <td className="py-3.5 px-4">
                          {isLocked ? (
                            <div
                              title={`Locked: ${user.lockReason || 'Excessive failed logins'} (${user.failedAttempts || 0} failed attempts)${user.lockedAt ? ` at ${new Date(user.lockedAt).toLocaleTimeString()}` : ''}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 cursor-help"
                            >
                              <Lock className="w-3 h-3 text-red-600" />
                              <span>Locked</span>
                              {user.failedAttempts > 0 && (
                                <span className="text-[10px] text-red-500 font-mono">
                                  ({user.failedAttempts} failed)
                                </span>
                              )}
                            </div>
                          ) : user.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : user.status === 'Invited' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Invited
                            </span>
                          ) : user.status === 'Pending approval' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </td>
                      )}

                      {/* Last Active */}
                      {columnVisibility.lastActive && (
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {user.lastLogin || (user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Never')}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 relative user-row-menu">
                          <button
                            type="button"
                            onClick={() => setSelectedDrawerUserId(user.id)}
                            className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* ⋮ Dropdown Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuUserId === user.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                                {/* Reset Password */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    resetUserPassword(user.id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Reset Password</span>
                                </button>

                                {/* 2FA Toggle */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    toggleUser2FA(user.id, !user.twoFactor?.enabled);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    {user.twoFactor?.enabled ? 'Disable 2FA' : 'Enforce 2FA'}
                                  </span>
                                </button>

                                {/* Lock / Unlock */}
                                {isLocked ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuUserId(null);
                                      unlockUser(user.id);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Unlock Account</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuUserId(null);
                                      lockUser(user.id, 'Administrative security lock');
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-red-500" />
                                    <span>Lock Account</span>
                                  </button>
                                )}

                                {/* Force Logout */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    forceLogoutUser(user.id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Force Sign Out</span>
                                </button>

                                {/* Resend Invite (if invited) */}
                                {user.status === 'Invited' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuUserId(null);
                                      resendUserInvite(user.id);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                  >
                                    <Send className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Resend Invitation</span>
                                  </button>
                                )}

                                <div className="border-t border-slate-100 my-1" />

                                {/* Deactivate / Reactivate */}
                                {user.status === 'Inactive' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuUserId(null);
                                      reactivateUser(user.id);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Reactivate Staff</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuUserId(null);
                                      handleDeactivateClick(user);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-red-500" />
                                    <span>Deactivate Staff</span>
                                  </button>
                                )}

                                {/* View Audit History */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    navigate(`/admin/audit?q=${encodeURIComponent(user.email || user.name)}`);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <History className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Audit History</span>
                                </button>
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

        {/* Pagination & Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(startIndex + pageSize, totalEntries)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{totalEntries}</span> entries
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
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

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => updateParams({ page: safeCurrentPage - 1 })}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Simple windowing if many pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: pageNum })}
                      className={`min-w-[28px] h-7 px-2 rounded text-xs font-semibold ${
                        safeCurrentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === safeCurrentPage - 2 || pageNum === safeCurrentPage + 2) {
                  return (
                    <span key={pageNum} className="text-slate-400 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => updateParams({ page: safeCurrentPage + 1 })}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Bottom Row: Quick Actions, Security Overview, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Quick Actions (Operates strictly on selected rows) */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedUserIds.length} staff selected
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Apply administrative security updates directly across selected staff accounts.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Reset Password */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedUserIds.length === 0}
                  onClick={() => handleQuickActionClick('RESET_PASSWORD')}
                  className="w-full text-xs font-semibold gap-1.5 h-10 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-40"
                >
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Reset Password</span>
                </Button>
                {selectedUserIds.length === 0 && (
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow whitespace-nowrap z-20">
                    Select staff first
                  </div>
                )}
              </div>

              {/* Enable 2FA */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedUserIds.length === 0}
                  onClick={() => handleQuickActionClick('ENABLE_2FA')}
                  className="w-full text-xs font-semibold gap-1.5 h-10 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-40"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enable 2FA</span>
                </Button>
                {selectedUserIds.length === 0 && (
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow whitespace-nowrap z-20">
                    Select staff first
                  </div>
                )}
              </div>

              {/* Unlock Account */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedUserIds.length === 0}
                  onClick={() => handleQuickActionClick('UNLOCK')}
                  className="w-full text-xs font-semibold gap-1.5 h-10 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 disabled:opacity-40"
                >
                  <Unlock className="w-4 h-4 text-purple-600" />
                  <span>Unlock Account</span>
                </Button>
                {selectedUserIds.length === 0 && (
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow whitespace-nowrap z-20">
                    Select staff first
                  </div>
                )}
              </div>

              {/* Export Report */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedUserIds.length === 0}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full text-xs font-semibold gap-1.5 h-10 border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Export Report</span>
                </Button>
                {selectedUserIds.length === 0 && (
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow whitespace-nowrap z-20">
                    Select staff first
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Security Overview (Computed dynamic findings) */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Security Overview</h3>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  securityOverview.overallState === 'Secure'
                    ? 'bg-emerald-100 text-emerald-800'
                    : securityOverview.overallState === 'Needs attention'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {securityOverview.overallState}
              </span>
            </div>

            {/* Checklist of Findings */}
            {securityOverview.findings.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">System Secure</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All systems are running normally. No security policy warnings found.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {securityOverview.findings.map((finding) => (
                  <div
                    key={finding.id}
                    onClick={() => {
                      if (finding.filter) {
                        updateParams(finding.filter);
                      }
                    }}
                    className="p-2 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          finding.severity === 'HIGH'
                            ? 'bg-red-500'
                            : finding.severity === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {finding.title}
                          </p>
                          <span className="text-[10px] font-semibold text-blue-600 hover:underline">
                            Filter →
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Recent Activity (From audit logs) */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => navigate('/admin/audit')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {recentUserActivity.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No recent user administration events logged.
                </p>
              ) : (
                recentUserActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium truncate">{activity.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 7. Modals and Drawers */}
      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <AddStaffModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveStaff}
          editingUser={editingUser}
        />
      )}

      {/* Staff Drawer */}
      {selectedDrawerUserId && (
        <StaffDrawer
          userId={selectedDrawerUserId}
          isOpen={Boolean(selectedDrawerUserId)}
          onClose={() => setSelectedDrawerUserId(null)}
          onEdit={(user) => {
            setSelectedDrawerUserId(null);
            handleEditUser(user);
          }}
        />
      )}

      {/* Workload Reassignment Dialog before deactivation */}
      {reassigningUser && (
        <ReassignDialog
          isOpen={Boolean(reassigningUser)}
          user={reassigningUser}
          onClose={() => setReassigningUser(null)}
          onReassignAndDeactivate={(workloadMap) => {
            deactivateUser(reassigningUser.id, workloadMap);
            setReassigningUser(null);
          }}
        />
      )}

      {/* Quick Action Confirmation Dialog */}
      {isQuickActionOpen && (
        <QuickActionConfirmDialog
          isOpen={isQuickActionOpen}
          actionType={quickActionType}
          selectedIds={selectedUserIds}
          onClose={() => setIsQuickActionOpen(false)}
          onConfirm={handleExecuteQuickAction}
        />
      )}

      {/* Export Users Modal */}
      {isExportModalOpen && (
        <ExportUsersModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          filteredUsers={selectedUserIds.length > 0 ? users.filter((u) => selectedUserIds.includes(u.id)) : sortedUsers}
        />
      )}
    </motion.div>
  );
}

export default UsersPage;
