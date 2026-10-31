import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Standard enterprise PageHeader component
 * Follows section 2.3 page template specifications:
 * Breadcrumb + Title + Subtitle + Meta Badges + Actions
 */
export function PageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  badges = [],
  primaryAction = null, // { label, icon: Icon, onClick, permission, variant }
  secondaryActions = [], // Array of { label, icon: Icon, onClick, variant, disabled }
  children,
}) {
  return (
    <div className="bg-surface border-b border-border -mx-4 -mt-4 lg:-mx-6 lg:-mt-6 px-4 py-4 lg:px-6 lg:py-5 mb-5 shadow-xs transition-colors">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-medium">
          <Link to="/dashboard" className="hover:text-text-main flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-border" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-text-main transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-main font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main truncate">
              {title}
            </h1>
            {badges.map((b, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                  b.variant === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : b.variant === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : b.variant === 'danger'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {b.icon && <b.icon className="w-3 h-3" />}
                {b.label}
              </span>
            ))}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-text-muted">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {secondaryActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-3.5 py-2 rounded-lg border border-border bg-surface text-text-main font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer ${action.className || ''}`}
              >
                {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                <span>{action.label}</span>
              </button>
            );
          })}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className={`px-4 py-2 rounded-lg bg-brand-primary text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer ${primaryAction.className || ''}`}
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
