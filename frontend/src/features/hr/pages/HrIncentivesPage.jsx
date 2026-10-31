import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Columns,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Briefcase,
  UserCheck,
  Check,
  X,
  Plus,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Lock,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  History,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import {
  calculatePayrollSummary,
  calculateAchievementPercent,
  calculatePerformanceScore,
  validateReconciliation,
} from '../utils/hrCalculationEngine';

// Colors matching the design tokens and reference mockup
const COLORS = {
  sales: '#2563EB', // Blue
  service: '#16A34A', // Green
  bonus: '#9333EA', // Purple
  oem: '#F59E0B', // Amber
  attendanceLine: '#2563EB',
  achievementLine: '#16A34A',
};

export function HrIncentivesPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const rawStaff = useAppStore((state) => state.hrStaff) || [];
  const performanceTrend = useAppStore((state) => state.hrPerformanceTrend) || [];
  const payrollRuns = useAppStore((state) => state.hrPayrollRuns) || [];
  const incentiveRules = useAppStore((state) => state.hrIncentiveRules) || [];
  const attendanceGrid = useAppStore((state) => state.hrAttendance) || {};

  // Store actions
  const updateStaffAttendance = useAppStore((state) => state.updateStaffAttendance);
  const updateStaffTarget = useAppStore((state) => state.updateStaffTarget);
  const updateIncentiveRule = useAppStore((state) => state.updateIncentiveRule);
  const calculateMonthlyPayroll = useAppStore((state) => state.calculateMonthlyPayroll);
  const submitPayrollForApproval = useAppStore((state) => state.submitPayrollForApproval);
  const approvePayrollRun = useAppStore((state) => state.approvePayrollRun);
  const markPayrollPaid = useAppStore((state) => state.markPayrollPaid);
  const raiseStaffDispute = useAppStore((state) => state.raiseStaffDispute);
  const addStaffAdjustment = useAppStore((state) => state.addStaffAdjustment);

  // Permissions
  const canViewSalary = hasPermission(currentUser, PERMISSIONS.HR_VIEW_SALARY);
  const canEditAttendance = hasPermission(currentUser, PERMISSIONS.HR_EDIT_ATTENDANCE);
  const canManageTargets = hasPermission(currentUser, PERMISSIONS.HR_MANAGE_TARGETS);
  const canManageRules = hasPermission(currentUser, PERMISSIONS.HR_MANAGE_RULES);
  const canRunPayroll = hasPermission(currentUser, PERMISSIONS.HR_RUN_PAYROLL);
  const canApprovePayroll = hasPermission(currentUser, PERMISSIONS.HR_APPROVE_PAYOUT);
  const canExport = hasPermission(currentUser, PERMISSIONS.HR_EXPORT);
  const isViewOwnOnly =
    hasPermission(currentUser, PERMISSIONS.HR_VIEW_OWN) &&
    !hasPermission(currentUser, PERMISSIONS.HR_VIEW_ALL) &&
    !hasPermission(currentUser, PERMISSIONS.HR_VIEW_TEAM);

  // Tabs state: overview | attendance | targets | payroll
  const [activeTab, setActiveTab] = useState('overview');

  // Date range filter
  const [selectedDateRange, setSelectedDateRange] = useState('This Month (Oct 2026)');
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);

  // Export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showColumnsPopover, setShowColumnsPopover] = useState(false);

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState({
    attendance: true,
    quota: true,
    achieved: true,
    incentivePct: true,
    baseSalary: true,
    incentiveCommission: true,
    netPayout: true,
    status: true,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawers & Modals
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Attendance Cell Edit Modal
  const [editingAttendanceCell, setEditingAttendanceCell] = useState(null); // { staff, day, currentStatus }
  const [editCellStatus, setEditCellStatus] = useState('P');
  const [editCellReason, setEditCellReason] = useState('');

  // Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeComment, setDisputeComment] = useState('');

  // Manual Adjustment Modal
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjType, setAdjType] = useState('BONUS');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // Target Edit Modal
  const [editingTargetStaff, setEditingTargetStaff] = useState(null);
  const [newTargetQuota, setNewTargetQuota] = useState('');

  // 1. Calculate payroll summary across all active staff
  const summary = useMemo(() => {
    return calculatePayrollSummary(rawStaff);
  }, [rawStaff]);

  // Self-view filter if non-manager
  const displayedLines = useMemo(() => {
    let list = summary.lines;
    if (isViewOwnOnly) {
      list = list.filter((l) => l.name.toLowerCase() === currentUser?.name?.toLowerCase() || l.userId === currentUser?.id);
    }
    return list;
  }, [summary.lines, isViewOwnOnly, currentUser]);

  // Filtered staff list for the table
  const filteredStaff = useMemo(() => {
    return displayedLines.filter((staff) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = staff.name.toLowerCase().includes(q);
        const matchesRole = staff.role.toLowerCase().includes(q);
        const matchesCode = (staff.employeeCode || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesCode) return false;
      }
      if (roleFilter !== 'ALL' && staff.role !== roleFilter) return false;
      if (deptFilter !== 'ALL' && staff.department !== deptFilter) return false;
      if (statusFilter !== 'ALL' && staff.status !== statusFilter) return false;
      return true;
    });
  }, [displayedLines, searchQuery, roleFilter, deptFilter, statusFilter]);

  // Paginated staff
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));

  // Top performers for leaderboard & top 3 cards
  const sortedPerformers = useMemo(() => {
    return [...summary.lines].sort((a, b) => {
      const scoreA = a.displayScore || a.performanceScore;
      const scoreB = b.displayScore || b.performanceScore;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.netPayout - a.netPayout;
    });
  }, [summary.lines]);

  const top3 = sortedPerformers.slice(0, 3);

  // Incentive distribution data for Donut Chart
  const donutData = useMemo(() => {
    const pool = summary.totals.pool;
    const data = [
      { name: 'Sales Incentive', value: pool.sales, color: COLORS.sales, pct: '47%' },
      { name: 'Service Incentive', value: pool.service, color: COLORS.service, pct: '30%' },
      { name: 'Performance Bonus', value: pool.bonus, color: COLORS.bonus, pct: '23%' },
    ];
    if (pool.oem > 0) {
      data.push({ name: 'OEM Scheme Incentive', value: pool.oem, color: COLORS.oem, pct: '0%' });
    }
    return data;
  }, [summary.totals.pool]);

  // Formatting helpers
  const formatINR = (val) => {
    if (!Number.isFinite(val)) return '₹ 0';
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  const formatLakhs = (val) => {
    const lakhs = val / 100000;
    return `₹ ${lakhs.toFixed(2)} Lakhs`;
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Actions
  const handleOpenStaffDrawer = (staff) => {
    setSelectedStaff(staff);
    setIsStaffDrawerOpen(true);
  };

  const handleExport = (type) => {
    setShowExportDropdown(false);
    if (!canExport) {
      toast.error('You do not have permission to export HR payroll data.');
      return;
    }

    if (type === 'CSV') {
      const headers = ['#', 'Employee Code', 'Staff Name', 'Role', 'Department', 'Attendance Days', 'Target Quota', 'Achieved', 'Incentive %', 'Base Salary', 'Commission', 'Net Payout', 'Status'];
      const rows = filteredStaff.map((s, idx) => [
        idx + 1,
        s.employeeCode || '',
        s.name,
        s.role,
        s.department,
        `${s.attendanceDays} / 26`,
        s.targetQuota,
        s.achieved,
        `${s.achievementPercent}%`,
        canViewSalary ? s.baseSalary : 'MASKED',
        s.incentives.totalIncentive,
        canViewSalary ? s.netPayout : 'MASKED',
        s.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `HR_Payroll_Report_Oct2026_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloaded HR Staff Incentive CSV Report!');
    } else if (type === 'EXCEL') {
      toast.success('Simulated Excel report generation complete (.xlsx). Download started!');
    } else {
      toast.success('Simulated Executive Payroll Disbursal PDF summary generated!');
    }
  };

  const handleDownloadPayslip = (staff) => {
    const payslipContent = `
============================================================
              AKASH BAJAJ - OFFICIAL PAYSLIP
               Bangalore Central Flagship
                 Period: October 2026
============================================================

Employee Details:
------------------------------------------------------------
Staff Name    : ${staff.name}
Employee Code : ${staff.employeeCode || 'EMP-0100'}
Designation   : ${staff.role}
Department    : ${staff.department}
Bank Account  : ${staff.bankMasked || '•••• 0000'} (Verified)
Working Days  : 26 Days
Days Present  : ${staff.attendanceDays} Days
Target Quota  : ${staff.targetQuota} Units / Jobs
Achieved      : ${staff.achieved} (${staff.achievementPercent}%)

Earnings Breakdown:
------------------------------------------------------------
1. Base Salary                   : ${canViewSalary ? formatINR(staff.baseSalary) : '₹ ••••••'}
2. Sales Volume Commission       : ${formatINR(staff.incentives.salesIncentive)}
3. Service Productivity Bonus    : ${formatINR(staff.incentives.serviceIncentive)}
4. Performance Gatekeeper Bonus  : ${formatINR(staff.incentives.performanceBonus)}
5. Approved Adjustments          : ${formatINR(staff.approvedAdjustments || 0)}
------------------------------------------------------------
Gross Payout                     : ${canViewSalary ? formatINR(staff.netPayout) : '₹ ••••••'}
Loss of Pay (LOP) Deduction      : ${formatINR(Math.abs(staff.attendanceAdjustment || 0))}
------------------------------------------------------------
NET TAKE-HOME DISBURSAL          : ${canViewSalary ? formatINR(staff.netPayout) : '₹ ••••••'}
============================================================
Status: ${staff.status.toUpperCase()}
Generated under Akash Bajaj ERP Statutory Payroll System
`;

    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${staff.name.replace(/\s+/g, '_')}_Oct2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Payslip for ${staff.name} downloaded successfully!`);
  };

  const handleSaveAttendanceCell = () => {
    if (!editCellReason.trim()) {
      toast.error('A mandatory audit reason is required for manual attendance override.');
      return;
    }
    updateStaffAttendance(editingAttendanceCell.staff.id, editingAttendanceCell.day, editCellStatus, editCellReason);
    toast.success(`Attendance updated for Day ${editingAttendanceCell.day} (${editingAttendanceCell.staff.name})`);
    setEditingAttendanceCell(null);
    setEditCellReason('');
  };

  const handleSaveDispute = () => {
    if (!disputeComment.trim()) {
      toast.error('Please enter a description for the incentive dispute.');
      return;
    }
    raiseStaffDispute(selectedStaff.id, '2026-10', disputeComment);
    toast.success(`Incentive calculation dispute submitted for ${selectedStaff.name}. Status marked as Disputed.`);
    setDisputeModalOpen(false);
    setDisputeComment('');
  };

  const handleSaveAdjustment = () => {
    const num = Number(adjAmount);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error('Please enter a valid positive adjustment amount.');
      return;
    }
    if (!adjReason.trim()) {
      toast.error('Please enter an approved reason for this adjustment.');
      return;
    }
    addStaffAdjustment(selectedStaff.id, num, adjType, adjReason);
    toast.success(`Adjustment of ${formatINR(num)} recorded for ${selectedStaff.name}`);
    setAdjustmentModalOpen(false);
    setAdjAmount('');
    setAdjReason('');
  };

  const handleSaveTarget = () => {
    const num = Number(newTargetQuota);
    if (!Number.isFinite(num) || num < 0) {
      toast.error('Please enter a valid target quota.');
      return;
    }
    updateStaffTarget(editingTargetStaff.id, num);
    toast.success(`Monthly target for ${editingTargetStaff.name} updated to ${num} units/jobs`);
    setEditingTargetStaff(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <span className="hover:text-text-main cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted/60" />
        <span className="text-text-main font-medium">HR & Incentives</span>
      </div>

      {/* 2. Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-main tracking-tight">
              Staff Incentives, Attendance & Productivity
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Monitor performance, track incentives and manage payroll benchmarks.
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-main hover:bg-surface-subtle shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Oct 01, 2026 - Oct 31, 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {showDateRangeDropdown && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg bg-surface border border-border shadow-dialog z-30 py-1 text-xs">
                {['This Month (Oct 2026)', 'Last Month (Sep 2026)', 'Last 3 Months (Aug - Oct 2026)', 'Financial Year (FY 2026-27)', 'Custom Range...'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedDateRange(opt);
                      setShowDateRangeDropdown(false);
                      toast.info(`Active reporting period updated to ${opt}`);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-surface-subtle flex items-center justify-between ${
                      selectedDateRange === opt ? 'font-bold text-primary bg-primary/5' : 'text-text-main'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedDateRange === opt && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Dropdown */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-1.5"
            >
              <span>Export Report</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </Button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-1 w-52 rounded-lg bg-surface border border-border shadow-dialog z-30 py-1 text-xs">
                <button
                  onClick={() => handleExport('PDF')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle flex items-center gap-2 text-text-main"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-semibold">PDF Summary</div>
                    <div className="text-[10px] text-text-muted">Executive payroll brief</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('EXCEL')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle flex items-center gap-2 text-text-main"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-semibold">Excel Spreadsheet</div>
                    <div className="text-[10px] text-text-muted">Full staff calculation matrix</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('CSV')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-subtle flex items-center gap-2 text-text-main"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold">CSV Raw Export</div>
                    <div className="text-[10px] text-text-muted">Comma-delimited text data</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Additional Pill Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'attendance', label: 'Attendance', icon: UserCheck },
          { id: 'targets', label: 'Targets & Incentive Rules', icon: Award },
          { id: 'payroll', label: 'Payroll Runs', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-text-main hover:bg-surface-muted border border-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Staff */}
            <Card className="p-4 flex items-center gap-3.5 bg-surface border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Active Staff
                </div>
                <div className="text-2xl font-bold text-text-main tabular-nums mt-0.5">
                  {summary.totals.totalActiveStaff}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-status-green mt-0.5">
                  <span>↑ 2% vs last month</span>
                </div>
              </div>
            </Card>

            {/* Card 2: Average Target Achievement */}
            <Card className="p-4 flex items-center gap-3.5 bg-surface border-border">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Average Target Achievement
                </div>
                <div className="text-2xl font-bold text-status-green tabular-nums mt-0.5">
                  {summary.totals.avgAchievement}%
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-status-green mt-0.5">
                  <span>↑ 1.5%</span>
                </div>
              </div>
            </Card>

            {/* Card 3: Monthly Incentive Pool */}
            <Card className="p-4 flex items-center gap-3.5 bg-surface border-border">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Monthly Incentive Pool
                </div>
                <div className="text-2xl font-bold text-primary tabular-nums mt-0.5">
                  {formatLakhs(summary.totals.pool.total)}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-status-green mt-0.5">
                  <span>↑ 8%</span>
                </div>
              </div>
            </Card>

            {/* Card 4: Avg Attendance Rate */}
            <Card className="p-4 flex items-center gap-3.5 bg-surface border-border">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Avg Attendance Rate
                </div>
                <div className="text-2xl font-bold text-text-main tabular-nums mt-0.5">
                  {summary.totals.avgAttendance}%
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-status-green mt-0.5">
                  <span>↑ 0.3%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle 3-card Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Card 1: Performance Overview (Recharts Area/Line chart) */}
            <Card className="lg:col-span-5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                      Performance Overview
                    </h3>
                  </div>
                  {/* Legend dots */}
                  <div className="flex items-center gap-3 text-[11px] font-medium text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                      Attendance %
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
                      Target Achievement %
                    </span>
                  </div>
                </div>

                {/* Highlight Badges on top of chart */}
                <div className="flex justify-end gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                    98.1%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-green-600 text-white font-bold text-[10px]">
                    96.2%
                  </span>
                </div>

                {/* Chart container */}
                <div className="h-52 w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceTrend}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="achGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[60, 100]}
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E293B',
                          borderRadius: '8px',
                          color: '#F8FAFC',
                          fontSize: '11px',
                        }}
                        formatter={(val, name) => [`${val}%`, name]}
                      />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        name="Attendance %"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#attGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="achievement"
                        name="Target Achievement %"
                        stroke="#16A34A"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#achGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Card 2: Incentive Distribution (Donut Chart) */}
            <Card className="lg:col-span-4 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                    Incentive Distribution
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  {/* Donut Chart with center label */}
                  <div className="relative w-40 h-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-extrabold text-text-main tracking-tight">
                        ₹ 3.84L
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-text-muted">
                        Total
                      </span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-3 flex-1 pl-2">
                    {donutData.map((d) => (
                      <div key={d.name} className="flex items-start gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-text-main truncate">
                            {d.name}
                          </div>
                          <div className="text-[11px] text-text-muted tabular-nums">
                            ₹ {(d.value / 100000).toFixed(2)}L ({d.pct})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 3: Top Performers */}
            <Card className="lg:col-span-3 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                      Top Performers
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3 mt-3">
                  {top3.map((staff, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const medalBg = ['bg-amber-100 text-amber-800', 'bg-slate-100 text-slate-800', 'bg-orange-100 text-orange-800'];
                    const score = staff.displayScore || staff.performanceScore;
                    const displayAmt = staff.displayTopPayout || staff.netPayout;

                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleOpenStaffDrawer(staff)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar Initials */}
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(staff.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-text-main truncate group-hover:text-primary transition-colors">
                              {staff.name}
                            </div>
                            <div className="text-[10px] text-text-muted truncate">
                              {staff.role}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Medal Icon Badge */}
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${medalBg[idx]}`}>
                            {medals[idx]}
                          </span>

                          {/* Payout */}
                          <span className="text-xs font-bold text-text-main tabular-nums">
                            {formatINR(displayAmt)}
                          </span>

                          {/* Score Chip */}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* 6. Staff Details Table */}
          <Card className="overflow-hidden p-0 border-border">
            {/* Table Header controls */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text-main">Staff Details</h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted text-[11px] font-semibold">
                  {filteredStaff.length} Staff Members
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterPopover(!showFilterPopover)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-xs font-semibold text-text-main shadow-xs transition-colors"
                  >
                    <Filter className="w-3.5 h-3.5 text-text-muted" />
                    <span>Filter</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {showFilterPopover && (
                    <div className="absolute right-0 mt-1 w-64 rounded-xl bg-surface border border-border shadow-dialog z-30 p-3 space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase">Department</label>
                        <select
                          value={deptFilter}
                          onChange={(e) => setDeptFilter(e.target.value)}
                          className="w-full mt-1 p-1.5 rounded border border-border bg-surface-subtle text-xs text-text-main"
                        >
                          <option value="ALL">All Departments</option>
                          <option value="Sales">Sales</option>
                          <option value="Service">Service</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Parts & Spares">Parts & Spares</option>
                          <option value="Accounts">Accounts</option>
                          <option value="Management">Management</option>
                          <option value="Customer Care">Customer Care</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase">Role</label>
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="w-full mt-1 p-1.5 rounded border border-border bg-surface-subtle text-xs text-text-main"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="Sales Executive">Sales Executive</option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Technician">Technician</option>
                          <option value="Service Advisor">Service Advisor</option>
                          <option value="Accountant">Accountant</option>
                          <option value="Parts Specialist">Parts Specialist</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full mt-1 p-1.5 rounded border border-border bg-surface-subtle text-xs text-text-main"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="On hold">On hold</option>
                          <option value="Disputed">Disputed</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-border flex justify-end">
                        <button
                          onClick={() => {
                            setDeptFilter('ALL');
                            setRoleFilter('ALL');
                            setStatusFilter('ALL');
                            setShowFilterPopover(false);
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columns Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColumnsPopover(!showColumnsPopover)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-xs font-semibold text-text-main shadow-xs transition-colors"
                  >
                    <Columns className="w-3.5 h-3.5 text-text-muted" />
                    <span>Columns</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {showColumnsPopover && (
                    <div className="absolute right-0 mt-1 w-48 rounded-xl bg-surface border border-border shadow-dialog z-30 p-2.5 space-y-1.5 text-xs">
                      {Object.keys(visibleColumns).map((col) => (
                        <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-surface-subtle p-1 rounded">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col]}
                            onChange={(e) =>
                              setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                            }
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role & Dept</th>
                    {visibleColumns.attendance && <th className="p-3">Attendance</th>}
                    {visibleColumns.quota && <th className="p-3">Target Quota</th>}
                    {visibleColumns.achieved && <th className="p-3">Achieved</th>}
                    {visibleColumns.incentivePct && <th className="p-3">Incentive %</th>}
                    {visibleColumns.baseSalary && <th className="p-3">Base Salary</th>}
                    {visibleColumns.incentiveCommission && <th className="p-3">Incentive Commission</th>}
                    {visibleColumns.netPayout && <th className="p-3">Net Payout</th>}
                    {visibleColumns.status && <th className="p-3">Status</th>}
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedStaff.map((staff, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const achPct = staff.achievementPercent;

                    // Incentive badge style: green >= 100%, blue 80-99%, amber < 80%
                    let badgeClass = 'bg-amber-100 text-amber-800';
                    if (achPct >= 100) badgeClass = 'bg-emerald-100 text-emerald-800';
                    else if (achPct >= 80) badgeClass = 'bg-blue-100 text-blue-800';

                    // Status badge style
                    const statusDot = {
                      Paid: 'bg-emerald-500',
                      Pending: 'bg-blue-500',
                      'On hold': 'bg-amber-500',
                      Disputed: 'bg-red-500',
                    }[staff.status] || 'bg-slate-400';

                    return (
                      <tr key={staff.id} className="hover:bg-surface-subtle/70 transition-colors">
                        <td className="p-3 text-text-muted font-medium tabular-nums">{rowNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-text-main flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-surface-muted text-text-main font-semibold text-[10px] flex items-center justify-center shrink-0">
                              {getInitials(staff.name)}
                            </span>
                            <span>{staff.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-text-main">{staff.role}</div>
                          <div className="text-[10px] text-text-muted">{staff.department}</div>
                        </td>
                        {visibleColumns.attendance && (
                          <td className="p-3 tabular-nums text-text-main font-medium">
                            {staff.attendanceDays} / 26 Days
                          </td>
                        )}
                        {visibleColumns.quota && (
                          <td className="p-3 tabular-nums text-text-muted">
                            {staff.targetQuota} Units/Jobs
                          </td>
                        )}
                        {visibleColumns.achieved && (
                          <td className="p-3 tabular-nums font-bold text-text-main">
                            {staff.achieved}
                          </td>
                        )}
                        {visibleColumns.incentivePct && (
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                              {Math.round(achPct)}%
                            </span>
                          </td>
                        )}
                        {visibleColumns.baseSalary && (
                          <td className="p-3 tabular-nums text-text-muted">
                            {canViewSalary ? formatINR(staff.baseSalary) : '₹ ••••••'}
                          </td>
                        )}
                        {visibleColumns.incentiveCommission && (
                          <td className="p-3 tabular-nums font-semibold text-text-main">
                            {formatINR(staff.incentives.totalIncentive)}
                          </td>
                        )}
                        {visibleColumns.netPayout && (
                          <td className="p-3 tabular-nums font-bold text-text-main">
                            {canViewSalary ? formatINR(staff.netPayout) : '₹ ••••••'}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-subtle text-text-main border border-border/60">
                              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                              <span>{staff.status}</span>
                            </span>
                          </td>
                        )}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenStaffDrawer(staff)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-primary hover:bg-primary/10 font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Table Totals Row */}
                <tfoot>
                  <tr className="bg-surface-subtle/80 font-bold border-t-2 border-border text-text-main text-[11px]">
                    <td className="p-3">Σ</td>
                    <td className="p-3" colSpan={visibleColumns.attendance && visibleColumns.quota && visibleColumns.achieved ? 4 : 2}>
                      Total for {filteredStaff.length} Staff
                    </td>
                    {visibleColumns.incentivePct && <td className="p-3">Avg {summary.totals.avgAchievement}%</td>}
                    {visibleColumns.baseSalary && (
                      <td className="p-3 tabular-nums">
                        {canViewSalary
                          ? formatINR(filteredStaff.reduce((sum, s) => sum + s.baseSalary, 0))
                          : '₹ ••••••'}
                      </td>
                    )}
                    {visibleColumns.incentiveCommission && (
                      <td className="p-3 tabular-nums text-primary font-extrabold">
                        {formatINR(filteredStaff.reduce((sum, s) => sum + s.incentives.totalIncentive, 0))}
                      </td>
                    )}
                    {visibleColumns.netPayout && (
                      <td className="p-3 tabular-nums text-primary font-extrabold">
                        {canViewSalary
                          ? formatINR(filteredStaff.reduce((sum, s) => sum + s.netPayout, 0))
                          : '₹ ••••••'}
                      </td>
                    )}
                    {visibleColumns.status && <td className="p-3"></td>}
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-surface">
              <div className="text-text-muted font-medium">
                Showing{' '}
                <span className="font-bold text-text-main">
                  {filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredStaff.length)}
                </span>{' '}
                of <span className="font-bold text-text-main">{filteredStaff.length}</span> entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2 py-1 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40"
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2 py-1 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-border bg-surface text-text-main hover:bg-surface-subtle'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2 py-1 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40"
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2 py-1 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40"
                >
                  »
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: ATTENDANCE MONTH GRID */}
      {activeTab === 'attendance' && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-text-main">
                October 2026 Monthly Attendance Matrix
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Click any cell to perform an audited manual override (P: Present, A: Absent, L: Leave, H: Holiday, HD: Half Day, W: Weekly Off).
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">P = Present</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">A = Absent</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">L = Leave</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">H = Holiday</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">W = Off</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-center text-[11px] border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-bold">
                  <th className="p-2.5 text-left sticky left-0 bg-surface-subtle z-10 w-44">Staff Member</th>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <th key={d} className="p-1.5 w-7 text-center font-mono">
                      {d}
                    </th>
                  ))}
                  <th className="p-2 w-16">P</th>
                  <th className="p-2 w-16">A</th>
                  <th className="p-2 w-16">Att %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rawStaff.map((staff) => {
                  const staffAtt = attendanceGrid[staff.id] || { days: {} };
                  const attRate = ((staff.attendanceDays / 26) * 100).toFixed(1);

                  return (
                    <tr key={staff.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="p-2 text-left font-bold text-text-main sticky left-0 bg-surface z-10 border-r border-border truncate max-w-[180px]">
                        {staff.name}
                      </td>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const cell = staffAtt.days?.[day] || { status: 'P' };
                        const st = cell.status;

                        let color = 'bg-emerald-100 text-emerald-800 font-bold';
                        if (st === 'A') color = 'bg-rose-100 text-rose-800 font-bold';
                        else if (st === 'L') color = 'bg-amber-100 text-amber-800 font-bold';
                        else if (st === 'H') color = 'bg-purple-100 text-purple-800';
                        else if (st === 'W') color = 'bg-slate-100 text-slate-500 font-normal';
                        else if (st === 'HD') color = 'bg-orange-100 text-orange-800 font-bold';

                        return (
                          <td
                            key={day}
                            onClick={() => {
                              if (canEditAttendance) {
                                setEditingAttendanceCell({ staff, day, currentStatus: st });
                                setEditCellStatus(st);
                              } else {
                                toast.error('You lack hr.edit_attendance permission to modify records.');
                              }
                            }}
                            className={`p-1 cursor-pointer hover:ring-1 hover:ring-primary ${color}`}
                            title={`Day ${day}: ${cell.label || st} (Click to edit)`}
                          >
                            {st}
                          </td>
                        );
                      })}
                      <td className="p-2 font-bold text-emerald-700 bg-emerald-50/50 tabular-nums">
                        {staff.attendanceDays}
                      </td>
                      <td className="p-2 font-bold text-rose-700 bg-rose-50/50 tabular-nums">
                        {26 - staff.attendanceDays}
                      </td>
                      <td className="p-2 font-bold text-text-main tabular-nums">
                        {attRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: TARGETS & INCENTIVE RULES */}
      {activeTab === 'targets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Targets Quota Editor */}
          <Card className="lg:col-span-7 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-text-main">
                  Monthly Target Quotas (October 2026)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Set baseline quotas per person or role. Direct driver of incentive calculations.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                Effective: 2026-10-01
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-text-muted font-bold text-[10px] uppercase">
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Quota Metric</th>
                    <th className="p-3">Current Quota</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rawStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-surface-subtle/50">
                      <td className="p-3 font-bold text-text-main">{staff.name}</td>
                      <td className="p-3 text-text-muted">{staff.role}</td>
                      <td className="p-3 text-text-muted">
                        {staff.role.includes('Sales')
                          ? 'Vehicle Deliveries'
                          : staff.role.includes('Technician')
                          ? 'Job Cards Closed'
                          : 'SLA Milestone'}
                      </td>
                      <td className="p-3 font-extrabold text-primary tabular-nums">
                        {staff.targetQuota} Units/Jobs
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (!canManageTargets) {
                              toast.error('You lack hr.manage_targets permission.');
                              return;
                            }
                            setEditingTargetStaff(staff);
                            setNewTargetQuota(staff.targetQuota);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Edit Quota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Incentive Rules Slabs & Formula Configuration */}
          <Card className="lg:col-span-5 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-text-main">Incentive Rules Engine</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Statutory commission slabs, attach rules, and gatekeepers.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                v2.1 Approved
              </span>
            </div>

            <div className="space-y-4">
              {incentiveRules.map((rule) => (
                <div key={rule.id} className="p-3 rounded-xl border border-border bg-surface-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text-main">{rule.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">{rule.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text-main pt-1 border-t border-border/50">
                    <span>Effective: {rule.effectiveFrom}</span>
                    <span className="text-primary font-bold">Status: {rule.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: PAYROLL RUNS & DISBURSAL */}
      {activeTab === 'payroll' && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Statutory Payroll & Disbursal Schedules
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Workflow: Draft → Calculated → Under Review → Approved → Paid (Dual control required).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => {
                  toast.success('Generated HDFC Corporate NetBanking NEFT Batch Advice (.txt/.csv)');
                }}
              >
                Bank Transfer Advice
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={() => {
                  if (!canRunPayroll) {
                    toast.error('You lack hr.run_payroll permission.');
                    return;
                  }
                  calculateMonthlyPayroll('2026-10');
                  toast.success('Recalculated October 2026 payroll benchmarks to the rupee.');
                }}
              >
                Run Calculation
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-bold text-[10px] uppercase">
                  <th className="p-3">Month</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Staff</th>
                  <th className="p-3">Total Base</th>
                  <th className="p-3">Total Incentives</th>
                  <th className="p-3">Net Payout</th>
                  <th className="p-3">Workflow Status</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payrollRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-surface-subtle/50">
                    <td className="p-3 font-bold text-text-main">{run.monthLabel || run.month}</td>
                    <td className="p-3 text-text-muted">{run.branch}</td>
                    <td className="p-3 font-semibold text-text-main">{run.staffCount}</td>
                    <td className="p-3 tabular-nums text-text-muted">
                      {canViewSalary ? formatINR(run.totalBaseSalary) : '₹ ••••••'}
                    </td>
                    <td className="p-3 tabular-nums font-bold text-primary">
                      {formatINR(run.totalIncentives)}
                    </td>
                    <td className="p-3 tabular-nums font-extrabold text-text-main">
                      {canViewSalary ? formatINR(run.totalNetPayout) : '₹ ••••••'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          run.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : run.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : run.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-text-muted">{run.submittedBy || '—'}</td>
                    <td className="p-3 text-right space-x-1.5">
                      {run.status === 'Calculated' && (
                        <button
                          onClick={() => {
                            submitPayrollForApproval(run.id);
                            toast.success('Submitted October 2026 payroll to Approvals Center for dual-control review!');
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Submit Approval
                        </button>
                      )}
                      {run.status === 'Under Review' && (
                        <button
                          onClick={() => {
                            if (!canApprovePayroll) {
                              toast.error('You lack hr.approve_payout permission.');
                              return;
                            }
                            try {
                              approvePayrollRun(run.id, currentUser?.name);
                              toast.success('Dual-control approval granted! Run is ready for bank disbursal.');
                            } catch (err) {
                              toast.error(err.message);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {run.status === 'Approved' && (
                        <button
                          onClick={() => {
                            const ref = prompt('Enter Bank NEFT / RTGS Reference Number:', `HDFC-NEFT-${Date.now().toString().slice(-8)}`);
                            if (ref) {
                              markPayrollPaid(run.id, ref);
                              toast.success(`Payroll disbursal completed under reference ${ref}!`);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {run.status === 'Paid' && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* DRAWER: STAFF VIEW DRILL-DOWN */}
      <Drawer
        isOpen={isStaffDrawerOpen}
        onClose={() => setIsStaffDrawerOpen(false)}
        title={selectedStaff ? `${selectedStaff.name} - Incentive & Productivity Profile` : 'Staff Details'}
        size="lg"
      >
        {selectedStaff && (
          <div className="space-y-6 text-xs">
            {/* Top Profile Card */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(selectedStaff.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">{selectedStaff.name}</h3>
                  <div className="text-text-muted mt-0.5">
                    {selectedStaff.role} • {selectedStaff.department}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {selectedStaff.branch} • Emp Code: {selectedStaff.employeeCode}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {selectedStaff.status}
                </span>
                <div className="text-[11px] text-text-muted mt-1">
                  Bank: {selectedStaff.bankMasked}
                </div>
              </div>
            </div>

            {/* Target vs Achieved Progress Bar */}
            <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-text-main">Monthly Target Attainment</span>
                <span className="text-primary">{selectedStaff.achieved} / {selectedStaff.targetQuota} Units/Jobs</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, selectedStaff.achievementPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>0</span>
                <span className="font-bold text-emerald-600">{selectedStaff.achievementPercent}% Attainment</span>
                <span>{selectedStaff.targetQuota} (Target)</span>
              </div>
            </div>

            {/* Payout Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted uppercase font-bold">Base Salary</div>
                <div className="text-sm font-bold text-text-main mt-0.5">
                  {canViewSalary ? formatINR(selectedStaff.baseSalary) : '₹ ••••••'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted uppercase font-bold">Incentives</div>
                <div className="text-sm font-bold text-primary mt-0.5">
                  {formatINR(selectedStaff.incentives.totalIncentive)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted uppercase font-bold">Adjustments</div>
                <div className="text-sm font-bold text-text-main mt-0.5">
                  {formatINR(selectedStaff.approvedAdjustments || 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-[10px] text-blue-700 uppercase font-bold">Net Payout</div>
                <div className="text-base font-extrabold text-blue-800 mt-0.5">
                  {canViewSalary ? formatINR(selectedStaff.netPayout) : '₹ ••••••'}
                </div>
              </div>
            </div>

            {/* Event Source Breakdown */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                <h4 className="font-bold text-text-main">Incentive Event Source Log</h4>
                <span className="text-[11px] text-text-muted">{selectedStaff.events?.length || 0} Events Logged</span>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-surface-subtle text-text-muted font-bold border-b border-border">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Event Description</th>
                      <th className="p-2">Ref ID</th>
                      <th className="p-2 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(selectedStaff.events || []).map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface-subtle/50">
                        <td className="p-2 text-text-muted">{ev.date}</td>
                        <td className="p-2 font-medium text-text-main">{ev.label}</td>
                        <td className="p-2 font-mono text-text-muted">{ev.referenceId || '—'}</td>
                        <td className="p-2 text-right font-bold text-emerald-600">
                          +{formatINR(ev.commission || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDisputeModalOpen(true)}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Raise Dispute
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAdjustmentModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Adjustment
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => handleDownloadPayslip(selectedStaff)}
              >
                Download Payslip (PDF)
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* DRAWER: TOP PERFORMERS LEADERBOARD */}
      <Drawer
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        title="Showroom Staff Productivity Leaderboard"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Ranked staff productivity benchmarks for October 2026. Ranked by Composite Performance Score (50% Achievement, 25% Attendance, 25% Quality).
          </p>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-subtle text-text-muted font-bold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="p-3 w-12 text-center">Rank</th>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Target Attainment</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Net Payout</th>
                  <th className="p-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedPerformers.map((staff, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const score = staff.displayScore || staff.performanceScore;
                  const displayAmt = staff.displayTopPayout || staff.netPayout;

                  return (
                    <tr
                      key={staff.id}
                      onClick={() => {
                        setIsLeaderboardOpen(false);
                        handleOpenStaffDrawer(staff);
                      }}
                      className="hover:bg-surface-subtle/70 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-sm">
                        {idx < 3 ? medals[idx] : idx + 1}
                      </td>
                      <td className="p-3 font-bold text-text-main flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {getInitials(staff.name)}
                        </span>
                        <span>{staff.name}</span>
                      </td>
                      <td className="p-3 text-text-muted">{staff.role}</td>
                      <td className="p-3 font-semibold text-text-main tabular-nums">
                        {staff.achieved} / {staff.targetQuota} ({staff.achievementPercent}%)
                      </td>
                      <td className="p-3 tabular-nums text-text-muted">
                        {staff.attendanceDays} / 26
                      </td>
                      <td className="p-3 font-bold text-text-main tabular-nums">
                        {formatINR(displayAmt)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>

      {/* MODAL: ATTENDANCE CELL OVERRIDE */}
      <Modal
        isOpen={Boolean(editingAttendanceCell)}
        onClose={() => setEditingAttendanceCell(null)}
        title="Manual Attendance Override"
        size="sm"
      >
        {editingAttendanceCell && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <div className="font-bold text-text-main">{editingAttendanceCell.staff.name}</div>
              <div className="text-text-muted text-[11px]">
                Date: October {editingAttendanceCell.day}, 2026 • Current: {editingAttendanceCell.currentStatus}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase">Select Status</label>
              <select
                value={editCellStatus}
                onChange={(e) => setEditCellStatus(e.target.value)}
                className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main"
              >
                <option value="P">P - Present</option>
                <option value="A">A - Absent (Unplanned)</option>
                <option value="L">L - Approved Leave</option>
                <option value="HD">HD - Half Day</option>
                <option value="H">H - Statutory Holiday</option>
                <option value="W">W - Weekly Off</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase">
                Audited Reason for Change *
              </label>
              <input
                type="text"
                placeholder="e.g. Approved medical certificate / Biometric sync failure"
                value={editCellReason}
                onChange={(e) => setEditCellReason(e.target.value)}
                className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setEditingAttendanceCell(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAttendanceCell}>
                Save Override
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DISPUTE */}
      <Modal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        title="Raise Incentive Disbursal Dispute"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Log a formal calculation dispute. This will flag the staff record as <strong>Disputed</strong> and alert the branch accountant.
          </p>
          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase">Dispute Notes *</label>
            <textarea
              rows={3}
              placeholder="e.g. 2 Dominar deliveries on Oct 28 were not credited to incentive slab."
              value={disputeComment}
              onChange={(e) => setDisputeComment(e.target.value)}
              className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={() => setDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveDispute}>
              Submit Dispute
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: MANUAL ADJUSTMENT */}
      <Modal
        isOpen={adjustmentModalOpen}
        onClose={() => setAdjustmentModalOpen(false)}
        title="Record Approved Adjustment / Bonus"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAdjType('BONUS')}
                className={`py-1.5 text-xs font-bold rounded-lg border ${
                  adjType === 'BONUS'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                + Bonus (+)
              </button>
              <button
                type="button"
                onClick={() => setAdjType('DEDUCTION')}
                className={`py-1.5 text-xs font-bold rounded-lg border ${
                  adjType === 'DEDUCTION'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                - Deduction (-)
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase">Amount (INR) *</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
              className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase">Reason & Approval Ref *</label>
            <input
              type="text"
              placeholder="e.g. Festive special performance incentive approved by GM"
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={() => setAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdjustment}>
              Save Adjustment
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: TARGET QUOTA EDIT */}
      <Modal
        isOpen={Boolean(editingTargetStaff)}
        onClose={() => setEditingTargetStaff(null)}
        title="Edit Monthly Target Quota"
        size="sm"
      >
        {editingTargetStaff && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <div className="font-bold text-text-main">{editingTargetStaff.name}</div>
              <div className="text-text-muted text-[11px]">
                Role: {editingTargetStaff.role} • Current Quota: {editingTargetStaff.targetQuota}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase">
                New Target Quota (Units/Jobs) *
              </label>
              <input
                type="number"
                value={newTargetQuota}
                onChange={(e) => setNewTargetQuota(e.target.value)}
                className="w-full mt-1.5 p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setEditingTargetStaff(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveTarget}>
                Update Target
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default HrIncentivesPage;
