// src/features/admin/components/QuickActionConfirmDialog.jsx
import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export function QuickActionConfirmDialog({
  isOpen,
  onClose,
  actionType,
  selectedUsers = [],
  currentUser,
  onConfirm,
}) {
  if (!isOpen) return null;

  const actionMeta = {
    RESET_PASSWORD: {
      title: 'Bulk Reset Password',
      desc: 'This will invalidate existing passwords and flag users to set a new password on their next sign-in.',
      btnLabel: 'Reset Passwords',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    ENABLE_2FA: {
      title: 'Bulk Enable 2-Factor Authentication',
      desc: 'Enforces 2FA setup for the selected users. Users will be required to configure TOTP or SMS verification.',
      btnLabel: 'Enforce 2FA',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
    UNLOCK: {
      title: 'Bulk Unlock Accounts',
      desc: 'Clears lockout states and resets failed login counters to 0 for all selected users.',
      btnLabel: 'Unlock Accounts',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
  }[actionType] || {
    title: 'Confirm Bulk Action',
    desc: 'Are you sure you want to proceed with this bulk update?',
    btnLabel: 'Confirm Action',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
  };

  // Evaluate affected vs skipped
  const affected = [];
  const skipped = [];

  selectedUsers.forEach((u) => {
    if (u.id === currentUser?.id && ['LOCK', 'DEACTIVATE'].includes(actionType)) {
      skipped.push({ name: u.fullName || u.name, reason: 'Current active user' });
      return;
    }
    if (u.role === 'Super Admin' && ['LOCK', 'DEACTIVATE'].includes(actionType)) {
      skipped.push({ name: u.fullName || u.name, reason: 'Super Admin protection' });
      return;
    }
    affected.push(u);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionMeta.title} size="md">
      <div className="space-y-4 text-xs">
        <p className="text-text-muted leading-relaxed">{actionMeta.desc}</p>

        {/* Affected Summary */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between font-semibold">
          <span className="text-text-main">Selected Accounts:</span>
          <span className="text-primary font-bold">{selectedUsers.length} Users</span>
        </div>

        {/* Skipped Warnings */}
        {skipped.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{skipped.length} Protected User(s) Will Be Skipped:</span>
            </div>
            <ul className="text-[11px] space-y-1 pl-5 list-disc text-amber-800">
              {skipped.map((s, idx) => (
                <li key={idx}>
                  <strong>{s.name}</strong>: {s.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-text-main">
          Will execute action on <strong>{affected.length}</strong> eligible accounts.
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={affected.length === 0}
            onClick={() => {
              onConfirm(affected.map((u) => u.id));
              onClose();
            }}
            className={actionMeta.btnColor}
          >
            {actionMeta.btnLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default QuickActionConfirmDialog;

