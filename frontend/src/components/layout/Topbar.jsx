import React from 'react';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { BranchSwitcher } from './BranchSwitcher';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationPanel } from './NotificationPanel';
import { GlobalSearchInput } from './GlobalSearchInput';
import { LiveClock } from './LiveClock';
import { hasPermission } from '../../lib/rbac';
import { Sun, Moon, Menu } from 'lucide-react';

export function Topbar() {
  const { i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const branches = useAppStore((state) => state.branches || []);
  const currentUser = useAppStore((state) => state.currentUser);

  const currentBranch =
    activeBranchId === 'all'
      ? { gstin: '29AABCB1829M1ZK' }
      : branches.find((b) => b.id === activeBranchId) || branches[0];

  // GSTIN chip visible for roles dealing with tax, billing, accounts, or admin
  const showGstin =
    hasPermission(currentUser, 'accounting:view') ||
    hasPermission(currentUser, 'billing:create') ||
    hasPermission(currentUser, 'admin:manage') ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('account');

  return (
    <header className="h-14 shrink-0 bg-surface border-b border-border px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors gap-2 sm:gap-4">
      {/* Left: Mobile hamburger & Branch & GSTIN */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle lg:hidden shrink-0"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <BranchSwitcher />

        {/* GSTIN Badge Chip - Visible only for accounting, billing & admin roles */}
        {showGstin && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-[11px] font-mono text-text-muted shrink-0 shadow-xs">
            <span className="font-sans font-medium text-text-subtle text-[10px]">GSTIN:</span>
            <span className="text-text-main font-semibold tracking-tight text-[11px]">
              {currentBranch?.gstin || '29AABCB1829M1ZK'}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Global Search Input with grouped dropdown */}
      <div className="flex-1 max-w-xs md:max-w-sm xl:max-w-md min-w-[160px] mx-2 xl:mx-4">
        <GlobalSearchInput />
      </div>

      {/* Right Tools: Isolated Live Clock, Language, Theme, Notifications, Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Isolated Live IST Clock */}
        <div className="hidden md:flex">
          <LiveClock />
        </div>

        {/* Language Switcher */}
        <div className="flex items-center border border-border rounded-button overflow-hidden text-xs bg-surface-subtle shrink-0">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'en' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('ta')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'ta' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
            title="Tamil (தமிழ்)"
          >
            தமிழ்
          </button>
          <button
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'hi' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
            title="Hindi (हिन्दी)"
          >
            हिन्दी
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors shrink-0"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell */}
        <NotificationPanel />

        {/* User / Role Presets Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
}

export default Topbar;
