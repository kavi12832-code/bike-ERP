import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store';
import { NAVIGATION_GROUPS } from '../../config/navigation';
import { hasPermission } from '../../lib/rbac';
import { canUserDecide } from '../../approvals/engine';
import { getActionableQuotationsCount } from '../../quotations/selectors';
import { getActionableBookingsCount } from '../../bookings/selectors';
import { BrandLogo } from '../domain/BrandLogo';
import * as LucideIcons from 'lucide-react';
import { springTransition, sidebarEntranceVariants, sidebarItemVariants } from '../../lib/motion';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = useAppStore();
  const currentUser = state.currentUser;
  const sidebarCollapsed = state.sidebarCollapsed;
  const toggleSidebar = state.toggleSidebar;

  // Live count badges computed from store
  const approvals = state.approvals || [];
  const policies = state.approvalPolicies || [];
  const pendingApprovalsCount = approvals.filter((a) => {
    if (a.status !== 'Pending' && a.status !== 'PENDING' && a.status !== 'Escalated') return false;
    const policy = policies.find((p) => p.id === a.policyId);
    return canUserDecide(currentUser, a, policy).canDecide;
  }).length;

  const complaints = state.complaints || [];
  const openComplaintsCount = complaints.filter(
    (c) => c.status !== 'CLOSED' && c.status !== 'RESOLVED'
  ).length;

  const leads = state.leads || [];
  const overdueFollowupsCount = leads.filter(
    (l) => l.stage === 'FOLLOW_UP' || l.stage === 'CONTACTED'
  ).length;

  const quotations = state.quotations || [];
  const actionableQuotationsCount = getActionableQuotationsCount(quotations, currentUser);

  const bookings = state.bookings || [];
  const actionableBookingsCount = getActionableBookingsCount(bookings, currentUser);

  // Menu search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Group collapse state with persistence
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('bikeerp_collapsed_nav_groups');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem('bikeerp_collapsed_nav_groups', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  // Pinned items with persistence per user
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const storageKey = `bikeerp_pinned_nav_items_${currentUser?.id || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const togglePin = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      try {
        const storageKey = `bikeerp_pinned_nav_items_${currentUser?.id || 'default'}`;
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  // Collect all navigable items across groups
  const allNavItems = NAVIGATION_GROUPS.flatMap((g) => g.items);
  const pinnedItems = allNavItems.filter(
    (item) => pinnedIds.includes(item.id) && (!item.permission || hasPermission(currentUser, item.permission))
  );

  // Deterministically find the single best matching navigation item for current path
  const activeNavItemId = useMemo(() => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/dashboard') {
      return allNavItems.find((item) => item.path === '/' || item.path === '/dashboard')?.id || 'dashboard';
    }

    // 1. Check exact match
    const exactMatch = allNavItems.find((item) => item.path === currentPath);
    if (exactMatch) return exactMatch.id;

    // 2. Otherwise find longest prefix match on a segment boundary
    const prefixMatches = allNavItems
      .filter((item) => item.path !== '/' && item.path !== '/dashboard')
      .filter((item) => currentPath.startsWith(`${item.path}/`))
      .sort((a, b) => b.path.length - a.path.length);

    return prefixMatches[0]?.id || null;
  }, [location.pathname, allNavItems]);

  // Helper for badge display
  const getItemBadge = (itemId) => {
    if (itemId === 'approvals' && pendingApprovalsCount > 0) {
      return { text: pendingApprovalsCount, color: 'bg-amber-400 text-slate-900 font-bold' };
    }
    if (itemId === 'complaints' && openComplaintsCount > 0) {
      return { text: openComplaintsCount, color: 'bg-rose-500 text-white font-bold' };
    }
    if (itemId === 'leads' && overdueFollowupsCount > 0) {
      return { text: overdueFollowupsCount, color: 'bg-cyan-500 text-white font-medium' };
    }
    if (itemId === 'quotations' && actionableQuotationsCount > 0) {
      return { text: actionableQuotationsCount, color: 'bg-blue-500 text-white font-semibold' };
    }
    if (itemId === 'bookings' && actionableBookingsCount > 0) {
      return { text: actionableBookingsCount, color: 'bg-blue-500 text-white font-semibold' };
    }
    return null;
  };

  return (
    <motion.aside
      variants={sidebarEntranceVariants}
      initial="initial"
      animate="animate"
      className={`glass-sidebar text-white flex flex-col shrink-0 z-40 transition-all duration-200 select-none ${sidebarCollapsed ? 'w-16' : 'w-[240px]'
        } h-full relative overflow-hidden`}
    >
      {/* Brand Header Chip */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1 rounded-xl bg-white/10 border border-white/20 shadow-soft shrink-0 backdrop-blur-md">
            <BrandLogo className="w-7 h-7 rounded-lg" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-xs tracking-wider text-white uppercase truncate">
                AKASH BAJAJ
              </span>
              <span className="text-[10px] text-cyan-200/80 font-medium tracking-tight truncate">
                ERP & Service Hub
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Desktop / Close Drawer Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <LucideIcons.ChevronRight className="w-4 h-4" />
          ) : (
            <LucideIcons.ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu Search Box (when expanded) */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3 pb-1 border-b border-white/5 shrink-0">
          <div className="relative">
            <LucideIcons.Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Filter menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-full pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:bg-white/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-white/40 hover:text-white text-xs"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {/* Pinned Quick Access */}
        {!searchQuery && pinnedItems.length > 0 && (
          <div className="space-y-1 pb-3 border-b border-white/10">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-2.5 py-0.5 text-[10px] font-bold text-amber-300/90 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <LucideIcons.Pin className="w-3 h-3 rotate-45 text-amber-300" />
                  Quick Access
                </span>
                <span className="text-[9px] text-white/40 font-mono">{pinnedItems.length}</span>
              </div>
            )}

            <div className="space-y-1">
              {pinnedItems.map((item) => {
                const IconComponent = LucideIcons[item.icon] || LucideIcons.Circle;
                const badge = getItemBadge(item.id);
                const isActive = activeNavItemId === item.id;

                return (
                  <NavLink
                    key={`pinned-${item.id}`}
                    to={item.path}
                    end={item.path === '/' || item.path === '/dashboard'}
                    title={sidebarCollapsed ? t(item.labelKey, item.label) : undefined}
                    className="relative group flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-colors select-none"
                  >
                    {/* Sliding Bright Blue Active Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="pinnedSidebarActivePill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1496e8] to-[#0a74c9] border border-white/40 shadow-[0_0_20px_rgba(20,150,232,0.45)] -z-10"
                        transition={springTransition}
                      />
                    )}

                    <div
                      className={`flex items-center gap-2.5 truncate ${isActive
                          ? 'text-white font-semibold'
                          : 'text-white/80 group-hover:text-white'
                        }`}
                    >
                      <IconComponent className="w-4 h-4 shrink-0 text-current" />
                      {!sidebarCollapsed && (
                        <span className="truncate">{t(item.labelKey, item.label)}</span>
                      )}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-1">
                        {badge && (
                          <motion.span
                            initial={{ scale: 0.6 }}
                            animate={{ scale: 1 }}
                            transition={springTransition}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] ${badge.color}`}
                          >
                            {badge.text}
                          </motion.span>
                        )}
                        <button
                          onClick={(e) => togglePin(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-amber-300 hover:text-white transition-opacity p-0.5"
                          title="Unpin"
                        >
                          <LucideIcons.PinOff className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Nav Groups (DASHBOARD, OPERATIONS, WORKSHOP, BUSINESS, SYSTEM) */}
        {NAVIGATION_GROUPS.map((group) => {
          let visibleItems = group.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(currentUser, item.permission);
          });

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            visibleItems = visibleItems.filter((item) => {
              const label = t(item.labelKey, item.label).toLowerCase();
              return label.includes(q) || item.path.toLowerCase().includes(q);
            });
          }

          if (visibleItems.length === 0) return null;
          const isGroupCollapsed = collapsedGroups[group.id] && !searchQuery;

          return (
            <div key={group.id} className="space-y-1">
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest hover:text-white/80 transition-colors"
                >
                  <span>{t(group.titleKey, group.title)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/40 tabular-nums font-mono">
                      {visibleItems.length}
                    </span>
                    <LucideIcons.ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${isGroupCollapsed ? '-rotate-90' : ''
                        }`}
                    />
                  </div>
                </button>
              )}

              {!isGroupCollapsed && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const IconComponent = LucideIcons[item.icon] || LucideIcons.Circle;
                    const badge = getItemBadge(item.id);
                    const isPinned = pinnedIds.includes(item.id);
                    const isActive = activeNavItemId === item.id;

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        end={item.path === '/' || item.path === '/dashboard'}
                        title={t(item.labelKey, item.label)}
                        className="relative group flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-colors select-none"
                      >
                        {/* Gliding Active Pill with Spring Animation */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActivePill"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1496e8] to-[#0a74c9] border border-white/40 shadow-[0_0_20px_rgba(20,150,232,0.45)] -z-10"
                            transition={springTransition}
                          />
                        )}

                        <div
                          className={`flex items-center gap-2.5 truncate ${isActive
                              ? 'text-white font-semibold'
                              : 'text-white/80 group-hover:text-white'
                            }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0 text-current" />
                          {!sidebarCollapsed && (
                            <span className="truncate">{t(item.labelKey, item.label)}</span>
                          )}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {badge && (
                              <motion.span
                                initial={{ scale: 0.6 }}
                                animate={{ scale: 1 }}
                                transition={springTransition}
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}
                              >
                                {badge.text}
                              </motion.span>
                            )}
                            <button
                              onClick={(e) => togglePin(e, item.id)}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 ${isPinned ? 'text-amber-300' : 'text-white/40 hover:text-white'
                                }`}
                              title={isPinned ? 'Unpin item' : 'Pin to top'}
                            >
                              <LucideIcons.Pin className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan-Usage Progress Block pinned to bottom */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-semibold text-white/90 mb-1.5">
              <span>Cloud Enterprise ERP</span>
              <span className="text-cyan-300 font-mono">88% Quota</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* User Persona Footer with Initials Avatar & Green Online Dot */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.avatar || 'RV'}
            </div>
            {/* Green Online Dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#06182c]"
              title="Online"
            />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <span>{currentUser?.name || 'Rajesh Varma'}</span>
              </div>
              <div className="text-[10px] text-cyan-200/70 truncate">
                {currentUser?.role || 'Super Admin'}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
