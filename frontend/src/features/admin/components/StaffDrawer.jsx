// src/features/admin/components/StaffDrawer.jsx
import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  History,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Briefcase,
  Monitor,
  Smartphone,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { getRoleCapabilities } from '../../../config/usersConfig';
import { BRANCHES } from '../../../config/constants';

export function StaffDrawer({
  isOpen,
  onClose,
  user,
  currentUser,
  onLock,
  onUnlock,
  onResetPassword,
  onToggle2FA,
  onForceLogout,
  onDeactivate,
  auditLogs = [],
}) {
  if (!user) return null;

  const [activeTab, setActiveTab] = useState('profile'); // profile | access | security | activity
  const [copiedText, setCopiedText] = useState(false);

  const getInitials = (n) => {
    if (!n) return '??';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const isSelf = currentUser?.id === user.id;
  const isSuperAdmin = user.role === 'Super Admin';

  const roleCaps = useMemo(() => getRoleCapabilities(user.role), [user.role]);

  // Filter audit logs for this user
  const userAuditLogs = useMemo(() => {
    return (auditLogs || []).filter(
      (log) => log.entityId === user.id || log.targetId === user.id || log.details?.name === user.name
    );
  }, [auditLogs, user]);

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${user.fullName || user.name} - Account Overview`}
      size="lg"
    >
      <div className="space-y-6 text-xs">
        {/* Profile Card Summary Header */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(user.fullName || user.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-main">{user.fullName || user.name}</h3>
                {isSelf && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    You (Active Session)
                  </span>
                )}
              </div>
              <div className="text-text-muted mt-0.5">
                {user.role} • {user.department || 'Operations'}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {user.primaryBranchName || 'Bangalore Central Flagship'} • Emp Code: {user.employeeCode || 'EMP-0100'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : user.status === 'Locked'
                  ? 'bg-rose-100 text-rose-800'
                  : user.status === 'Invited'
                  ? 'bg-blue-100 text-blue-800'
                  : user.status === 'Pending approval'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {user.status}
            </span>
            <div className="text-[11px] text-text-muted mt-1">
              2FA: {user.twoFactor?.enabled ? 'Enforced' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* 4 Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'access', label: 'Access & Permissions', icon: Shield },
            { id: 'security', label: 'Security & Sessions', icon: Lock },
            { id: 'activity', label: 'Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-surface hover:bg-surface-subtle text-text-muted hover:text-text-main border border-border/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Official Email</span>
                <div className="font-semibold text-text-main flex items-center justify-between">
                  <span>{user.email}</span>
                  <button onClick={() => copyToClipboard(user.email)} className="text-text-muted hover:text-primary">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Mobile Phone</span>
                <div className="font-semibold text-text-main font-mono flex items-center justify-between">
                  <span>{user.phone || '+91 98450 00000'}</span>
                  <button onClick={() => copyToClipboard(user.phone)} className="text-text-muted hover:text-primary">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Primary Branch Hub</span>
                <div className="font-semibold text-text-main">{user.primaryBranchName || 'Bangalore Central Flagship'}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Additional Allocated Hubs</span>
                <div className="font-semibold text-text-main">
                  {user.additionalBranchIds && user.additionalBranchIds.length > 0
                    ? user.additionalBranchIds.map((bid) => BRANCHES.find((b) => b.id === bid)?.name || bid).join(', ')
                    : 'None (Single branch restricted)'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Employment Type</span>
                <div className="font-semibold text-text-main">{user.employmentType || 'Full-time'} • {user.shift || 'General'}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Linked HR Profile</span>
                <div className="font-semibold text-text-main flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enrolled (Attendance &amp; Quota Active)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACCESS & PERMISSIONS */}
        {activeTab === 'access' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-text-muted">Assigned Security Persona</span>
                <div className="text-base font-bold text-primary mt-0.5">{user.role}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Data Scope: {user.dataScope || 'Assigned Branch'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-surface-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase">Retail Discount Authority</span>
                <div className="text-base font-bold text-text-main mt-0.5">
                  ₹ {(user.limits?.discountLimit || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase">Financial Sign-Off Limit</span>
                <div className="text-base font-bold text-text-main mt-0.5">
                  ₹ {(user.limits?.approvalLimit || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Can Do vs Cannot See */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5">
                <div className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Operational Privileges Granted:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-text-main pl-5 list-disc">
                  {roleCaps.canDo.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5">
                <div className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span>System Boundaries &amp; Data Restrictions:</span>
                </div>
                {roleCaps.cannotSee.length === 0 ? (
                  <p className="text-[11px] text-text-muted italic pl-5">Root administrator access across entire dealer group.</p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-text-muted pl-5 list-disc">
                    {roleCaps.cannotSee.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & SESSIONS */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Lockout status */}
            {user.status === 'Locked' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Account Currently Locked Out</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Reason: {user.lockReason || 'Too many consecutive failed login attempts.'}
                </p>
                <div className="text-[10px] text-rose-700">
                  Locked At: {user.lockedAt ? new Date(user.lockedAt).toLocaleString('en-IN') : 'Recently'}
                </div>
              </div>
            )}

            {/* 2FA Status */}
            <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
              <div>
                <div className="font-bold text-text-main flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Two-Factor Authentication (2FA)</span>
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Method: {user.twoFactor?.method || 'TOTP'} • Status: {user.twoFactor?.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggle2FA(user.id, !user.twoFactor?.enabled)}
              >
                {user.twoFactor?.enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>

            {/* Active Sessions */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-main">Simulated Active Sessions</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onForceLogout(user.id)}
                  className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Force Logout All Sessions
                </Button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-bold text-text-main">Windows 11 / Chrome 130</div>
                      <div className="text-text-muted">Bangalore Flagship LAN (192.168.1.104) • Active now</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Current
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-text-muted" />
                    <div>
                      <div className="font-bold text-text-main">Mobile App / Android 15</div>
                      <div className="text-text-muted">Airtel 5G • Last seen 2 hours ago</div>
                    </div>
                  </div>
                  <span className="text-text-muted text-[10px]">Idle</span>
                </div>
              </div>
            </div>

            {/* Security Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={KeyRound}
                onClick={() => onResetPassword(user.id)}
              >
                Reset Password
              </Button>

              {user.status === 'Locked' ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Unlock}
                  onClick={() => onUnlock(user.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Unlock Account
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Lock}
                  disabled={isSelf}
                  onClick={() => onLock(user.id)}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Lock Account
                </Button>
              )}

              {user.status === 'Active' && !isSelf && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDeactivate(user)}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Deactivate User
                </Button>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-text-main">User-Specific Audit Trail</span>
              <span className="text-[11px] text-text-muted">{userAuditLogs.length} Events Logged</span>
            </div>

            {userAuditLogs.length === 0 ? (
              <div className="p-6 text-center text-text-muted border border-border rounded-xl">
                No recent security actions logged for this staff member.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {userAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-surface hover:bg-surface-subtle transition-colors text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-main">{log.action}</span>
                      <span className="text-text-muted">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Recently'}
                      </span>
                    </div>
                    <div className="text-text-muted mt-0.5">
                      Actor: {log.actor || 'System Admin'} • IP: {log.ipAddress || '192.168.1.1'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default StaffDrawer;

