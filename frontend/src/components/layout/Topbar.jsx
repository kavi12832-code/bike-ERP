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
import { motion } from 'framer-motion';

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
    <header className="glass-topbar h-14 shrink-0 px-3.5 sm:px-4 flex items-center justify-between z-30 transition-all gap-2 sm:gap-4 rounded-[24px]">
      {/* Left: Mobile hamburger & Branch & GSTIN */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-white/30 lg:hidden shrink-0 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <BranchSwitcher />

        {/* GSTIN Badge Chip */}
        {showGstin && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-white/10 border border-white/35 dark:border-white/20 text-[11px] font-mono text-slate-700 dark:text-slate-200 shrink-0 shadow-xs">
            <span className="font-sans font-medium text-slate-500 dark:text-slate-400 text-[10px]">GSTIN:</span>
            <span className="text-slate-900 dark:text-white font-semibold tracking-tight text-[11px]">
              {currentBranch?.gstin || '29AABCB1829M1ZK'}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Global Search Input with grouped dropdown */}
      <div className="flex-1 max-w-xs md:max-w-sm xl:max-w-md min-w-[160px] mx-2 xl:mx-4">
        <GlobalSearchInput />
      </div>

      {/* Right Tools: Live Clock, Language, Theme, Notifications, Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Live Clock Pill */}
        <div className="hidden md:flex">
          <LiveClock />
        </div>

        {/* Language Switcher Glass Pill */}
        <div className="flex items-center border border-white/35 dark:border-white/20 rounded-full overflow-hidden text-xs bg-white/20 dark:bg-white/10 p-0.5 shrink-0 shadow-xs">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
              i18n.language === 'en'
                ? 'bg-[#0b1220] dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('ta')}
            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
              i18n.language === 'ta'
                ? 'bg-[#0b1220] dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tamil (தமிழ்)"
          >
            தமிழ்
          </button>
          <button
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
              i18n.language === 'hi'
                ? 'bg-[#0b1220] dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hindi (हिन्दी)"
          >
            हिन्दी
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/35 border border-white/35 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs shrink-0 cursor-pointer"
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
