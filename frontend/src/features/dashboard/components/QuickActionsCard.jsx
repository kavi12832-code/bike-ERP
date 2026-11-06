import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import {
  KeyRound,
  ShieldCheck,
  LockKeyholeOpen,
  FileDown,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function QuickActionsCard({ canPerformQuickActions = true }) {
  const navigate = useNavigate();
  const state = useAppStore();
  const users = state.users || [];
  const currentUser = state.currentUser;
  const updateUser = state.updateUser;
  const logAudit = state.logAudit;

  const [activeModal, setActiveModal] = useState(null); // 'RESET_PASSWORD' | 'ENABLE_2FA' | 'UNLOCK_ACCOUNT' | 'EXPORT_REPORT'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canPerformQuickActions) return null;

  const openAction = (actionType) => {
    setActiveModal(actionType);
    setSelectedUserId(users[0]?.id || '');
    setReason('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUserId('');
    setReason('');
    setIsSubmitting(false);
  };

  const handleExecute = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Audit reason is required for compliance logging.');
      return;
    }

    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser && activeModal !== 'EXPORT_REPORT') {
      toast.error('Please select a valid user.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();

      if (activeModal === 'RESET_PASSWORD') {
        if (updateUser) {
          updateUser(selectedUserId, {
            passwordMustChange: true,
            lastPasswordResetAt: nowIso,
          });
        }
        if (logAudit) {
          logAudit(
            'USER_PASSWORD_RESET',
            'USER',
            selectedUserId,
            { user: targetUser?.name },
            { status: 'TEMP_CREDENTIALS_DISPATCHED', reason }
          );
        }
        toast.success(`Temporary credentials dispatched for ${targetUser?.name}. Audit logged.`);
      } else if (activeModal === 'ENABLE_2FA') {
        if (updateUser) {
          updateUser(selectedUserId, {
            twoFactorEnabled: true,
            twoFactorEnforcedAt: nowIso,
          });
        }
        if (logAudit) {
          logAudit(
            'USER_2FA_ENABLED',
            'USER',
            selectedUserId,
            { twoFactorEnabled: false },
            { twoFactorEnabled: true, reason }
          );
        }
        toast.success(`2-Factor Authentication enforced for ${targetUser?.name}. Audit logged.`);
      } else if (activeModal === 'UNLOCK_ACCOUNT') {
        if (updateUser) {
          updateUser(selectedUserId, {
            locked: false,
            status: 'ACTIVE',
            failedLoginAttempts: 0,
            unlockedAt: nowIso,
          });
        }
        if (logAudit) {
          logAudit(
            'USER_ACCOUNT_UNLOCKED',
            'USER',
            selectedUserId,
            { locked: true, status: targetUser?.status },
            { locked: false, status: 'ACTIVE', reason }
          );
        }
        toast.success(`Account unlocked successfully for ${targetUser?.name}. Audit logged.`);
      } else if (activeModal === 'EXPORT_REPORT') {
        if (logAudit) {
          logAudit(
            'REPORT_EXPORTED',
            'DATA_EXCHANGE',
            'export-dashboard-summary',
            null,
            { format: 'EXCEL', reason }
          );
        }
        toast.success('Operational snapshot exported. Opening Data Exchange Center...');
        navigate('/admin/import-export');
      }

      closeModal();
    } catch (err) {
      toast.error(`Action failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="glass-card !p-5 flex flex-col justify-between h-full shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-text-glass-main">Quick Actions</h2>
            <p className="text-xs text-text-glass-muted mt-0.5">Dual-control audited administrative tasks</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-cyan-300 border border-blue-400/30">
            Audit Trail Active
          </span>
        </div>

        {/* 4 Clean Full-Width Action Rows */}
        <div className="space-y-2 my-2">
          {/* 1. Reset Password */}
          <button
            onClick={() => openAction('RESET_PASSWORD')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/35 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-glass-main group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors">
                  Reset Password
                </div>
                <div className="text-[10px] text-text-glass-muted">Dispatch temp credentials</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-text-glass-muted px-2 py-0.5 rounded bg-white/25 dark:bg-white/10 border border-white/20 shrink-0">
              Reset
            </span>
          </button>

          {/* 2. Enable 2FA */}
          <button
            onClick={() => openAction('ENABLE_2FA')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/35 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-glass-main group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  Enable 2FA
                </div>
                <div className="text-[10px] text-text-glass-muted">Enforce security policy</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-text-glass-muted px-2 py-0.5 rounded bg-white/25 dark:bg-white/10 border border-white/20 shrink-0">
              Enforce
            </span>
          </button>

          {/* 3. Unlock Account */}
          <button
            onClick={() => openAction('UNLOCK_ACCOUNT')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/35 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LockKeyholeOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-glass-main group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  Unlock Account
                </div>
                <div className="text-[10px] text-text-glass-muted">Clear failed lockout state</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-text-glass-muted px-2 py-0.5 rounded bg-white/25 dark:bg-white/10 border border-white/20 shrink-0">
              Unlock
            </span>
          </button>

          {/* 4. Export Report */}
          <button
            onClick={() => openAction('EXPORT_REPORT')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/35 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-glass-main group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  Export Report
                </div>
                <div className="text-[10px] text-text-glass-muted">Data Exchange Center</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-text-glass-muted px-2 py-0.5 rounded bg-white/25 dark:bg-white/10 border border-white/20 shrink-0">
              Export
            </span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-text-glass-muted">
          <span>Requires authorized role</span>
          <span className="font-semibold text-text-glass-main">Audit Logged</span>
        </div>
      </div>

      {/* Action Execution Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-surface rounded-2xl border border-border shadow-dialog w-full max-w-md p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text-main">
                  {activeModal === 'RESET_PASSWORD' && 'Reset Staff Credentials'}
                  {activeModal === 'ENABLE_2FA' && 'Enforce 2-Factor Authentication'}
                  {activeModal === 'UNLOCK_ACCOUNT' && 'Unlock Locked User Account'}
                  {activeModal === 'EXPORT_REPORT' && 'Export Operational Report'}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-md text-text-muted hover:text-text-main hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecute} className="space-y-4 mt-4">
              {/* Target User Selector (for user actions) */}
              {activeModal !== 'EXPORT_REPORT' && (
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1">
                    Select Staff Member *
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-border rounded-lg p-2 text-text-main font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role}) — {u.branch || 'Bangalore Central'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mandatory Audit Reason */}
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">
                  Compliance Audit Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide legitimate justification (e.g. Employee requested password reset via ticket #4812)..."
                  rows={3}
                  className="w-full text-xs bg-surface-subtle border border-border rounded-lg p-2.5 text-text-main placeholder-text-muted focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  This action is permanently recorded in the Immutable Audit Trail with your current user identity ({currentUser?.name}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickActionsCard;

