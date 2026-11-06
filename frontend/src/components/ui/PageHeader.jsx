import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Glass Admin PageHeader component
 * Follows glass design specifications:
 * Clean integrated header within the glass panel + Breadcrumbs + Title + Subtitle + Meta Badges + Pill Actions
 */
export function PageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  badges = [],
  primaryAction = null, // { label, icon: Icon, onClick, permission, variant }
  secondaryActions = [], // Array of { label, icon: Icon, onClick, variant, disabled }
  actions = null, // React element or array of action objects
  children,
}) {
  return (
    <div className="mb-6 pb-4 border-b border-white/20">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-glass-muted dark:text-slate-300 mb-2 font-medium">
          <Link to="/dashboard" className="hover:text-text-glass-main dark:hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5 opacity-70" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-text-glass-muted/50 dark:text-slate-400" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-text-glass-main dark:hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-glass-main dark:text-white font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-glass-main dark:text-white truncate">
              {title}
            </h1>
            {badges.map((b, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                  b.variant === 'success'
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40'
                    : b.variant === 'warning'
                    ? 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40'
                    : b.variant === 'danger'
                    ? 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-800 dark:text-rose-300 border border-rose-500/30 dark:border-rose-400/40'
                    : 'bg-blue-500/15 dark:bg-cyan-500/25 text-blue-800 dark:text-cyan-300 border border-blue-500/30 dark:border-cyan-400/40'
                }`}
              >
                {b.icon && <b.icon className="w-3.5 h-3.5" />}
                {b.label}
              </span>
            ))}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-text-glass-muted dark:text-slate-300 font-medium">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions && (
            React.isValidElement(actions) ? (
              actions
            ) : Array.isArray(actions) ? (
              actions.map((action, idx) => {
                const Icon = action.icon;
                const isPrimary = action.variant === 'primary';
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ y: -1, scale: isPrimary ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={
                      isPrimary
                        ? `px-5 py-2.5 rounded-full bg-[#0b1220] dark:bg-blue-600 hover:bg-[#162033] dark:hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer ${action.className || ''}`
                        : `px-4 py-2 rounded-full border border-white/40 dark:border-white/20 bg-white/30 dark:bg-white/10 text-text-glass-main dark:text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md disabled:opacity-50 transition-colors cursor-pointer ${action.className || ''}`
                    }
                  >
                    {Icon && <Icon className={`w-4 h-4 ${isPrimary ? 'text-white' : 'text-text-glass-main dark:text-white'}`} />}
                    <span>{action.label}</span>
                  </motion.button>
                );
              })
            ) : null
          )}

          {secondaryActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-4 py-2 rounded-full border border-white/40 dark:border-white/20 bg-white/30 dark:bg-white/10 text-text-glass-main dark:text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md disabled:opacity-50 transition-colors cursor-pointer ${action.className || ''}`}
              >
                {Icon && <Icon className="w-4 h-4 text-text-glass-main dark:text-white" />}
                <span>{action.label}</span>
              </motion.button>
            );
          })}

          {primaryAction && (
            <motion.button
              type="button"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className={`px-5 py-2.5 rounded-full bg-[#0b1220] dark:bg-blue-600 hover:bg-[#162033] dark:hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer ${primaryAction.className || ''}`}
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 text-white" />}
              <span>{primaryAction.label}</span>
            </motion.button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
