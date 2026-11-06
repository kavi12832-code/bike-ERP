import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store';
import { BRANCHES } from '../../config/constants';
import { PERMISSIONS } from '../../config/permissions';
import { hasPermission } from '../../lib/rbac';
import { MapPin, ChevronDown, Check } from 'lucide-react';

export function BranchSwitcher() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const setActiveBranch = useAppStore((state) => state.setActiveBranch);
  const currentUser = useAppStore((state) => state.currentUser);
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync from URL params on load if present
  useEffect(() => {
    const urlBranch = searchParams.get('branch');
    if (urlBranch && urlBranch !== activeBranchId) {
      if (urlBranch === 'all' || BRANCHES.some((b) => b.id === urlBranch)) {
        setActiveBranch(urlBranch);
      }
    }
  }, [searchParams, activeBranchId, setActiveBranch]);

  // Check permission for "All branches"
  const canViewAllBranches = hasPermission(currentUser, PERMISSIONS.DASHBOARD_VIEW_ALL_BRANCHES);

  // Allowed branches for current user
  const allowedBranches = BRANCHES.filter((branch) => {
    if (canViewAllBranches) return true;
    if (currentUser?.branchId && branch.id === currentUser.branchId) return true;
    if (Array.isArray(currentUser?.branchIds) && currentUser.branchIds.includes(branch.id)) return true;
    // Default fallback to show branches if no specific branch restriction configured
    return !currentUser?.branchId;
  });

  const currentBranch =
    activeBranchId === 'all'
      ? { id: 'all', name: 'All Branches (Consolidated)', type: 'Network Consolidated View', bays: 24 }
      : allowedBranches.find((b) => b.id === activeBranchId) || allowedBranches[0] || BRANCHES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBranch = (branchId) => {
    setActiveBranch(branchId);
    setOpen(false);

    // Update query params preserving existing ones
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('branch', branchId);
      return next;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 dark:bg-white/10 border border-white/35 dark:border-white/20 hover:bg-white/30 text-xs font-medium text-slate-800 dark:text-white transition-colors shrink-0 shadow-xs cursor-pointer"
        aria-label="Select dealership branch hub"
        aria-expanded={open}
      >
        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
        <span className="font-semibold max-w-[130px] sm:max-w-[160px] xl:max-w-[210px] truncate">
          {currentBranch.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-slate-300 opacity-70 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white/85 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Dealership Branch Hubs</span>
            {canViewAllBranches && <span className="text-[9px] bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">Multi-Branch</span>}
          </div>

          <div className="py-1">
            {canViewAllBranches && (
              <button
                onClick={() => handleSelectBranch('all')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors border-b border-border/50 ${
                  activeBranchId === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main'
                }`}
              >
                <div>
                  <div className="font-medium flex items-center gap-1.5">
                    <span>All Branches (Consolidated)</span>
                  </div>
                  <div className="text-[10px] text-text-muted">Consolidated Network Overview (4 Hubs)</div>
                </div>
                {activeBranchId === 'all' && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            )}

            {allowedBranches.map((branch) => {
              const isSelected = branch.id === activeBranchId;
              return (
                <button
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main'
                  }`}
                >
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-[10px] text-text-muted">
                      {branch.type} ({branch.bays} Bays)
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchSwitcher;
