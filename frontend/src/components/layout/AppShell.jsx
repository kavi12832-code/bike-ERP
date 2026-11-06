import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileBottomNav';
import { RouteErrorBoundary, ErrorBoundary } from './RouteErrorBoundary';
import { useAppStore } from '../../store';
import { backend } from '../../services/api/backend';
import { onUnauthorized } from '../../services/api/client';
import { pageTransitionVariants } from '../../lib/motion';

const BACKEND_REFRESH_MS = 60_000;

export function AppShell() {
  const theme = useAppStore((state) => state.theme);
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);
  const navigate = useNavigate();
  const location = useLocation();
  const mustLogin = backend.enabled() && !backend.isLoggedIn();

  // Sync data-theme attribute and dark class on root element for Tailwind dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
    <>
      {/* 1) Fixed Full-Viewport Background with 3 Ambient Drifting Glows */}
      <div className="glass-viewport" aria-hidden="true">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="ambient-glow-3" />
      </div>

      {/* 2) Floating Glass Shell Container (Outer padding 16-24px) */}
      <div className="glass-shell fixed inset-0 flex h-full w-full overflow-hidden p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 z-10 box-border">
        {/* Floating Glass Sidebar (240px, radius 28px, persistent) */}
        <Sidebar />

        {/* Main Workspace Column */}
        <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden gap-3 sm:gap-4">
          {/* Floating Glass Topbar (radius 24px, persistent) */}
          <Topbar />

          {/* ONE Large Frosted Content Panel (radius 32px) */}
          <main className="glass-panel flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-7 relative scrollbar-thin scrollbar-thumb-white/20">
            <ErrorBoundary fallback={<RouteErrorBoundary />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>

          {/* Mobile Bottom Nav */}
          <MobileBottomNav />
        </div>

        {/* Interactive Command Palette */}
        <CommandPalette />
      </div>
    </>
  );
}
