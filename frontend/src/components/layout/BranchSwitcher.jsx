import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { BRANCHES } from '../../config/constants';
import { MapPin, ChevronDown } from 'lucide-react';

export function BranchSwitcher() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const setActiveBranch = useAppStore((state) => state.setActiveBranch);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentBranch = BRANCHES.find((b) => b.id === activeBranchId) || BRANCHES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button bg-surface-subtle border border-border hover:bg-surface-muted text-xs font-medium text-text-main transition-colors shrink-0"
      >
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-medium max-w-[130px] sm:max-w-[160px] xl:max-w-[210px] truncate">{currentBranch.name}</span>
        <ChevronDown className="w-3 h-3 text-text-muted opacity-70 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Dealership Branch Hubs
          </div>
          <div className="py-1">
            {BRANCHES.map((branch) => {
              const isSelected = branch.id === activeBranchId;
              return (
                <button
                  key={branch.id}
                  onClick={() => {
                    setActiveBranch(branch.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main'
                  }`}
                >
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-[10px] text-text-muted">{branch.type} ({branch.bays} Bays)</div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
