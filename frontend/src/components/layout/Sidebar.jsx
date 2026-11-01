import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import { NAVIGATION_GROUPS } from '../../config/navigation';
import { hasPermission } from '../../lib/rbac';
import { canUserDecide } from '../../approvals/engine';
import { getActionableQuotationsCount } from '../../quotations/selectors';
import { getActionableBookingsCount } from '../../bookings/selectors';
import { BrandLogo } from '../domain/BrandLogo';
import * as LucideIcons from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const state = useAppStore();
  const currentUser = state.currentUser;
  const dealership = state.dealership;
  const sidebarCollapsed = state.sidebarCollapsed;
  const toggleSidebar = state.toggleSidebar;
  const setCommandPaletteOpen = state.setCommandPaletteOpen;

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
      } catch {}
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
      } catch {}
      return next;
    });
  };

  // Collect all navigable items across groups
  const allNavItems = NAVIGATION_GROUPS.flatMap((g) => g.items);
  const pinnedItems = allNavItems.filter(
    (item) => pinnedIds.includes(item.id) && (!item.permission || hasPermission(currentUser, item.permission))
  );

  // Helper for badge display - Approvals badge is orange with pending count, hidden if 0
  const getItemBadge = (itemId) => {
    if (itemId === 'approvals' && pendingApprovalsCount > 0) {
      return { text: pendingApprovalsCount, color: 'bg-amber-500 text-slate-900 font-bold' };
    }
    if (itemId === 'complaints' && openComplaintsCount > 0) {
      return { text: openComplaintsCount, color: 'bg-red-500 text-white font-bold' };
    }
    if (itemId === 'leads' && overdueFollowupsCount > 0) {
      return { text: overdueFollowupsCount, color: 'bg-blue-500 text-white font-medium' };
    }
    if (itemId === 'quotations' && actionableQuotationsCount > 0) {
      return { text: actionableQuotationsCount, color: 'bg-blue-600 text-white font-semibold' };
    }
    if (itemId === 'bookings' && actionableBookingsCount > 0) {
      return { text: actionableBookingsCount, color: 'bg-blue-600 text-white font-semibold' };
    }
    return null;
  };

  return (
    <aside
      className={`bg-sidebar text-white flex flex-col shrink-0 transition-all duration-200 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } h-full`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <BrandLogo className="w-8 h-8 rounded-lg shadow-soft shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-xs tracking-tight text-white uppercase truncate">
                AKASH BAJAJ
              </span>
              <span className="text-[10px] text-blue-200/70 font-medium tracking-tight truncate">
                ERP & Service Hub
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Desktop / Close Drawer Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
        <div className="px-3 pt-3 pb-1 border-b border-white/5">
          <div className="relative">
            <LucideIcons.Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-blue-200/50" />
            <input
              type="text"
              placeholder="Filter menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-blue-200/40 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-blue-200/50 hover:text-white text-xs"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
        {/* Pinned Section (if not searching and items are pinned) */}
        {!searchQuery && pinnedItems.length > 0 && (
          <div className="space-y-1 pb-3 border-b border-white/10">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-2 py-0.5 text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <LucideIcons.Pin className="w-3 h-3 rotate-45" />
                  Quick Access
                </span>
                <span className="text-[9px] text-white/40">{pinnedItems.length}</span>
              </div>
            )}

            <div className="space-y-0.5">
              {pinnedItems.map((item) => {
                const IconComponent = LucideIcons[item.icon] || LucideIcons.Circle;
                const badge = getItemBadge(item.id);

                return (
                  <NavLink
                    key={`pinned-${item.id}`}
                    to={item.path}
                    end={item.path === '/' || item.path === '/dashboard'}
                    title={sidebarCollapsed ? t(item.labelKey, item.label) : undefined}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-2.5 py-1.5 rounded-button text-xs font-medium transition-all duration-150 select-none ${
                        isActive
                          ? 'bg-sidebar-active text-white font-semibold shadow-soft'
                          : 'text-slate-200 hover:bg-sidebar-hover hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent className="w-4 h-4 shrink-0 text-current" />
                      {!sidebarCollapsed && (
                        <span className="truncate">{t(item.labelKey, item.label)}</span>
                      )}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-1">
                        {badge && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${badge.color}`}>
                            {badge.text}
                          </span>
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

        {/* Regular Nav Groups (OPERATIONS, WORKSHOP, ADMINISTRATION, etc.) */}
        {NAVIGATION_GROUPS.map((group) => {
          // Strictly filter items by permission
          let visibleItems = group.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(currentUser, item.permission);
          });

          // Filter by search query if present
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
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-blue-200/70 uppercase tracking-wider hover:text-blue-100 transition-colors"
                >
                  <span>{t(group.titleKey, group.title)}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Computed count matching only visible items for user's role */}
                    <span className="text-[10px] text-blue-300/60 tabular-nums font-mono">
                      {visibleItems.length}
                    </span>
                    <LucideIcons.ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${
                        isGroupCollapsed ? '-rotate-90' : ''
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

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        end={item.path === '/' || item.path === '/dashboard'}
                        title={t(item.labelKey, item.label)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-2.5 py-1.5 rounded-button text-xs font-medium transition-all duration-150 select-none ${
                            isActive
                              ? 'bg-sidebar-active text-white font-semibold shadow-soft'
                              : 'text-slate-200 hover:bg-sidebar-hover hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <IconComponent className="w-4 h-4 shrink-0 text-current" />
                          {!sidebarCollapsed && (
                            <span className="truncate">{t(item.labelKey, item.label)}</span>
                          )}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}
                              >
                                {badge.text}
                              </span>
                            )}
                            <button
                              onClick={(e) => togglePin(e, item.id)}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 ${
                                isPinned ? 'text-amber-300' : 'text-blue-300/40 hover:text-white'
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

      {/* User Persona Footer with Initials Avatar & Green Online Dot */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-navy-950/50">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary-light flex items-center justify-center font-bold text-xs">
              {currentUser?.avatar || 'RV'}
            </div>
            {/* Green Online Dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-navy-950"
              title="Online"
            />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <span>{currentUser?.name || 'Rajesh Varma'}</span>
              </div>
              <div className="text-[10px] text-blue-200/70 truncate">{currentUser?.role || 'Super Admin'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
