import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Avatar } from '../ui/Avatar';
import { User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcher() {
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-border hover:bg-surface-subtle bg-surface transition-colors"
        title="User profile & settings"
        aria-label="User profile menu"
        aria-expanded={open}
      >
        <Avatar name={currentUser?.name || 'Staff User'} size="sm" />
        <div className="text-left hidden sm:block max-w-[120px] truncate leading-tight">
          <div className="text-xs font-semibold text-text-main truncate">
            {currentUser?.name || 'User'}
          </div>
          <div className="text-[10px] text-text-muted truncate">
            {currentUser?.role || 'Staff'}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 divide-y divide-border animate-in fade-in zoom-in-95 duration-100">
          {/* User Details Header */}
          <div className="p-3 bg-surface-subtle/50">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser?.name || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-main truncate">
                  {currentUser?.name || 'Signed-in user'}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {currentUser?.email || ''}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    {currentUser?.role || 'Staff'}
                  </span>
                  {currentUser?.department && (
                    <span className="text-[10px] text-text-subtle">
                      • {currentUser.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/admin/users');
              }}
              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-text-main hover:bg-surface-subtle transition-colors"
            >
              <User className="w-3.5 h-3.5 text-text-muted" />
              <span>User & Team Management</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate('/login');
              }}
              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-status-red hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
