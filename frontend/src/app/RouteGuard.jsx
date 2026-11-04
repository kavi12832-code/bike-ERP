import React from 'react';
import { useAppStore } from '../store';
import { hasPermission } from '../lib/rbac';
import { ShieldAlert } from 'lucide-react';

/**
 * Hides screens the signed-in user's role may not use. This is for usability only: the API
 * enforces the same rules server-side, so bypassing it in the browser grants nothing.
 */
export function RouteGuard({ permission, children }) {
  const currentUser = useAppStore((state) => state.currentUser);

  if (!permission || hasPermission(currentUser, permission)) return children;

  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-card border border-border shadow-card">
      <div className="w-14 h-14 rounded-full bg-amber-100 text-status-amber flex items-center justify-center mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-text-main mb-1.5">Access Restricted</h3>
      <p className="text-xs text-text-muted max-w-md leading-relaxed">
        Your role (<strong>{currentUser?.role || 'Guest'}</strong>) does not have the{' '}
        <code className="px-1.5 py-0.5 rounded bg-surface-muted text-text-main font-mono text-[11px]">{permission}</code>{' '}
        permission. Ask an administrator to change your role if you need this screen.
      </p>
    </div>
  );
}
