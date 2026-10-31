import React from 'react';
import { useAppStore } from '../../store';
import { hasPermission } from '../../lib/rbac';
import { ShieldAlert } from 'lucide-react';

/**
 * PermissionGate wrapper component (Section 2.2 & Section 4)
 * Selectively renders children based on user permissions with optional fallback
 */
export function PermissionGate({
  permission,
  fallback = null,
  showNotice = false,
  children,
}) {
  const currentUser = useAppStore((state) => state.currentUser);

  if (!permission) return children;

  const allowed = hasPermission(currentUser, permission);

  if (allowed) return children;

  if (fallback) return fallback;

  if (showNotice) {
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Your current role ({currentUser?.role || 'Staff'}) does not have permission to view or manage this action.</span>
      </div>
    );
  }

  return null;
}
