import React, { useState } from 'react';
import { useRouteError, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Database,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const resetToDefaultSeed = useAppStore((s) => s.resetToDefaultSeed);

  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorMessage =
    error?.message ||
    (typeof error === 'string' ? error : null) ||
    error?.statusText ||
    'An unexpected runtime exception interrupted this module.';

  const errorStack = error?.stack || (error?.status ? `HTTP Status ${error.status}: ${error.statusText}` : '');

  const handleCopyDiagnostics = () => {
    const payload = `Route: ${location.pathname}\nTimestamp: ${new Date().toISOString()}\nError: ${errorMessage}\n\nStack:\n${errorStack}`;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset local state to fresh demo seed? Any unsaved edits will be restored.')) {
      if (resetToDefaultSeed) resetToDefaultSeed();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-lg overflow-hidden transition-colors">
        {/* Header Bar */}
        <div className="bg-[#0B1F4B] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                Module Recovery Console
              </h2>
              <p className="text-xs text-blue-200/80">
                Active Route: <code className="text-amber-300 font-mono">{location.pathname}</code>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            UI Guard
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-main">
                The current module encountered an unexpected issue
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                The interface was protected from crashing. You can refresh this module, navigate back to the operational dashboard, or reload sample seed data.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-primary text-white font-medium text-xs sm:text-sm hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Module</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-text-main font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-text-main font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Reset Seed Data</span>
            </button>
          </div>

          {/* Error Message Snippet */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-lg text-rose-900 text-xs font-mono break-words">
            <span className="font-bold text-rose-700 block mb-0.5">Caught Exception:</span>
            {errorMessage}
          </div>

          {/* Collapsible Technical Details */}
          {errorStack && (
            <div className="border border-border rounded-lg overflow-hidden bg-slate-50/60 text-xs">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-slate-700 font-medium hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <span>Technical Diagnostics & Stack Trace</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showDetails && (
                <div className="p-4 border-t border-border bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopyDiagnostics}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Diagnostics</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">{errorStack}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 my-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-rose-900 mb-1">
            {this.props.title || 'Component could not be rendered'}
          </h4>
          <p className="text-xs text-rose-700/80 mb-3 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected error occurred in this view section.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

