import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught exception:', error, errorInfo);
    if (import.meta.env?.DEV) {
      console.error('[ErrorBoundary dev-log] Component Stack:', errorInfo?.componentStack);
      if (error?.stack) console.error('[ErrorBoundary dev-log] Error Stack:', error.stack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-card border border-border shadow-card m-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-status-red flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-2">Something went wrong</h2>
          <p className="text-xs text-text-muted max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
          </p>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Module
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
