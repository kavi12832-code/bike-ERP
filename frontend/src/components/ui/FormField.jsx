import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Accessible FormField wrapper component
 * Renders label with required asterisk, helper text, and accessible error message
 */
export function FormField({
  label,
  id,
  required = false,
  error = null,
  helperText = null,
  className = '',
  children,
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-text-main">
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p id={id ? `${id}-error` : undefined} className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={id ? `${id}-helper` : undefined} className="text-[11px] text-text-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
