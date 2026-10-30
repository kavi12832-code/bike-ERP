import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { BranchSwitcher } from './BranchSwitcher';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationPanel } from './NotificationPanel';
import { Search, Sun, Moon, Globe, Clock, Menu } from 'lucide-react';
import { format } from 'date-fns';

export function Topbar() {
  const { i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const branches = useAppStore((state) => state.branches || []);

  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // Live IST Clock with flashing colon
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isEvenSecond = time.getSeconds() % 2 === 0;

  return (
    <header className="h-14 bg-surface border-b border-border px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors gap-2 sm:gap-4">
      {/* Left: Mobile hamburger & Branch & GSTIN */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <BranchSwitcher />

        {/* GSTIN Badge Chip - Always visible in Topbar */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-[11px] font-mono text-text-muted shrink-0 shadow-xs">
          <span className="font-sans font-medium text-text-subtle text-[10px]">GSTIN:</span>
          <span className="text-text-main font-semibold tracking-tight text-[11px]">{currentBranch?.gstin || '29AABCB1829M1ZK'}</span>
        </div>
      </div>

      {/* Middle: Command Palette Search Input (Ctrl+K) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs md:max-w-sm xl:max-w-md min-w-[160px] mx-2 xl:mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-9 flex items-center justify-between px-3 py-1.5 rounded-input bg-surface-subtle border border-border text-xs text-text-muted hover:border-primary/40 hover:bg-surface-muted transition-colors overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <span className="truncate whitespace-nowrap text-left text-xs">
              <span className="hidden xl:inline">Search leads, VIN, jobs...</span>
              <span className="inline xl:hidden">Search...</span>
            </span>
          </div>
          <kbd className="ml-2 px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-text-muted shadow-xs shrink-0 whitespace-nowrap">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Tools: Clock, Language, Theme, Notifications, Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Live IST Clock - only show on large 2xl screens (>= 1536px) to avoid taking precious space on laptops */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-xs text-text-main font-medium tabular-nums shrink-0 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            {format(time, 'hh')}
            <span className={isEvenSecond ? 'opacity-100' : 'opacity-20'}>:</span>
            {format(time, 'mm')}
          </span>
          <span className="text-[10px] text-text-muted uppercase ml-0.5">{format(time, 'a')} IST</span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center border border-border rounded-button overflow-hidden text-xs bg-surface-subtle shrink-0">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'en' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('ta')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'ta' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'hi' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors shrink-0"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell */}
        <NotificationPanel />

        {/* Role Presets Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
}
