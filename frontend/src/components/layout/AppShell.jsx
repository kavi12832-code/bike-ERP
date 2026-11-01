import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileBottomNav';
import { RouteErrorBoundary, ErrorBoundary } from './RouteErrorBoundary';
import { useAppStore } from '../../store';
import { backend } from '../../services/api/backend';
import { onUnauthorized } from '../../services/api/client';

const BACKEND_REFRESH_MS = 60_000;

export function AppShell() {
  const theme = useAppStore((state) => state.theme);
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);
  const navigate = useNavigate();
  const mustLogin = backend.enabled() && !backend.isLoggedIn();

  // Sync data-theme attribute on root element for Tailwind dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Django backend: load server data on entry, keep it fresh, and bounce to login when the JWT expires.
  useEffect(() => {
    if (!backend.enabled() || mustLogin) return undefined;
    refreshFromBackend();
    const timer = setInterval(refreshFromBackend, BACKEND_REFRESH_MS);
    const unsubscribe = onUnauthorized(() => navigate('/login'));
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [mustLogin, refreshFromBackend, navigate]);

  if (mustLogin) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-full w-full overflow-hidden bg-background fixed inset-0">
      {/* Deep Navy Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden">
        {/* Top Operational Bar */}
        <Topbar />

        {/* Dynamic Page Canvas */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-8">
          <ErrorBoundary fallback={<RouteErrorBoundary />}>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Mobile First Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>

      {/* Global Interactive Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
