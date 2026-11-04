import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ServerCrash } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileBottomNav';
import { RouteErrorBoundary, ErrorBoundary } from './RouteErrorBoundary';
import { useAppStore } from '../../store';
import { backend } from '../../services/api/backend';
import { onUnauthorized } from '../../services/api/client';

const BACKEND_REFRESH_MS = 120_000;

function FullScreenMessage({ icon: Icon, title, children, spin }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <Icon className={`w-10 h-10 mx-auto text-primary ${spin ? 'animate-spin' : ''}`} />
        <h1 className="mt-4 text-base font-bold text-text-main">{title}</h1>
        {children && <div className="mt-2 text-xs text-text-muted leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export function AppShell() {
  const theme = useAppStore((state) => state.theme);
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);
  const backendStatus = useAppStore((state) => state.backendStatus);
  const lastSyncedAt = useAppStore((state) => state.lastSyncedAt);
  const navigate = useNavigate();
  const location = useLocation();
  // checking -> (no session) login | (session) loading -> ready | error
  const [phase, setPhase] = useState(backend.isLoggedIn() && lastSyncedAt ? 'ready' : 'checking');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Restore the session from the httpOnly refresh cookie, then load all data from the API.
  // Runs once per "checking" phase: the sequence itself moves the phase forward, so it must not be
  // cancelled by its own phase change (nor run twice under React StrictMode's double effects).
  const startup = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!backend.enabled() || phase !== 'checking' || startup.current) return;
    startup.current = true;
    (async () => {
      const ok = backend.isLoggedIn() || (await backend.restoreSession());
      if (!ok) {
        if (mounted.current) setPhase('login');
        return;
      }
      if (mounted.current) setPhase('loading');
      const loaded = await refreshFromBackend();
      if (mounted.current) setPhase(loaded ? 'ready' : backend.isLoggedIn() ? 'error' : 'login');
    })();
  }, [phase, refreshFromBackend]);

  const retry = () => {
    startup.current = false;
    setPhase('checking');
  };

  // Keep data fresh for multi-user use, and return to login when the session ends.
  useEffect(() => {
    if (phase !== 'ready') return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshFromBackend();
    }, BACKEND_REFRESH_MS);
    const unsubscribe = onUnauthorized(() => navigate('/login', { replace: true }));
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [phase, refreshFromBackend, navigate]);

  if (!backend.enabled()) {
    return (
      <FullScreenMessage icon={ServerCrash} title="Backend not configured">
        Set <code className="font-mono">VITE_API_BASE_URL</code> in <code className="font-mono">frontend/.env.local</code>{' '}
        (for example <code className="font-mono">http://localhost:8030/api/v1</code>) and restart{' '}
        <code className="font-mono">npm run dev</code>. All data is stored in the database.
      </FullScreenMessage>
    );
  }
  if (phase === 'login') return <Navigate to="/login" replace />;
  if (phase === 'checking' || phase === 'loading') {
    return <FullScreenMessage icon={Loader2} spin title={phase === 'checking' ? 'Signing you in…' : 'Loading your data…'} />;
  }
  if (phase === 'error') {
    return (
      <FullScreenMessage icon={ServerCrash} title="Cannot reach the server">
        The API did not respond ({backendStatus}). Check that the backend is running, then{' '}
        <button className="text-primary font-semibold underline" onClick={retry}>
          try again
        </button>
        .
      </FullScreenMessage>
    );
  }

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
          {/* key: a crash in one module must not block navigating to the others */}
          <ErrorBoundary key={location.pathname} fallback={<RouteErrorBoundary />}>
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
