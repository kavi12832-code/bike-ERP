import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Bell, AlertTriangle, AlertCircle, Info, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationPanel() {
  const notifications = useAppStore((state) => state.notifications || []);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors"
        title="Operational Alerts & Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-status-red text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-main">Operational Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-100 text-status-red font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">No active notifications</div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || '/notifications'}
                  onClick={() => {
                    if (markNotificationRead) markNotificationRead(notif.id);
                    setOpen(false);
                  }}
                  className={`block px-4 py-3 hover:bg-surface-subtle transition-colors text-xs ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {notif.severity === 'HIGH' ? (
                      <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
                    ) : notif.severity === 'MEDIUM' ? (
                      <AlertTriangle className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-main flex items-center justify-between">
                        <span className="truncate">{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-status-red shrink-0 ml-1.5" />}
                      </div>
                      <div className="text-text-muted mt-0.5 leading-relaxed text-[11px] line-clamp-2">
                        {notif.message}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
