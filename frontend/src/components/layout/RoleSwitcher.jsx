import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { ROLE_PRESETS } from '../../config/roles';
import { Avatar } from '../ui/Avatar';
import { User, ChevronDown, LogOut, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/api/backend';

export function RoleSwitcher() {
  const currentUser = useAppStore((state) => state.currentUser);
  const loginAsRole = useAppStore((state) => state.loginAsRole);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  const serverAuth = backend.enabled();
  const [open, setOpen] = useState(false);
  const [demoExpanded, setDemoExpanded] = useState(false);
  const dropdownRef = useRef(null);

  // Check if current user is Super Admin
  const isSuperAdmin =
    currentUser?.role?.toLowerCase() === 'super admin' ||
    currentUser?.role?.toLowerCase() === 'super_admin' ||
    currentUser?.id === 'admin';

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
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-white/35 hover:bg-white/30 bg-white/20 transition-all shadow-xs"
        title="User profile & settings"
        aria-label="User profile menu"
        aria-expanded={open}
      >
        <Avatar name={currentUser?.name || 'Staff User'} size="sm" />
        <div className="text-left hidden sm:block max-w-[120px] truncate leading-tight">
          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
            {currentUser?.name || 'User'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300 truncate">
            {currentUser?.role || 'Staff'}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white/85 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl z-50 py-1.5 divide-y divide-slate-200/60 animate-in fade-in zoom-in-95 duration-100">
          {/* User Details Header */}
          <div className="p-3 bg-white/30">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser?.name || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-main truncate">
                  {currentUser?.name || 'Rajesh Varma'}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {currentUser?.email || 'admin@akashbajaj.com'}
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

          {/* Super Admin Demo Persona Switcher (Collapsible) */}
          {!serverAuth && isSuperAdmin && (
            <div className="py-1">
              <button
                onClick={() => setDemoExpanded(!demoExpanded)}
                className="w-full px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between hover:bg-surface-subtle"
              >
                <span>Demo Personas</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${demoExpanded ? 'rotate-90' : ''}`} />
              </button>

              {demoExpanded && (
                <div className="max-h-60 overflow-y-auto py-1">
                  {ROLE_PRESETS.map((preset) => {
                    const isSelected = currentUser?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          loginAsRole(preset.id);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-xs">{preset.name}</div>
                          <div className="text-[10px] text-text-muted">
                            {preset.role} • {preset.department}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
