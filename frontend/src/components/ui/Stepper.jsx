import React from 'react';
import { Check } from 'lucide-react';

/**
 * Enterprise Stepper Component for multi-step wizards & long forms
 */
export function Stepper({
  steps = [], // Array of { title, description }
  activeStep = 0,
  onStepClick = null,
  className = '',
}) {
  return (
    <div className={`w-full py-3 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-1" />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isClickable = onStepClick && idx <= activeStep;

          return (
            <div
              key={idx}
              onClick={() => isClickable && onStepClick(idx)}
              className={`flex flex-col items-center bg-surface px-2 ${
                isClickable ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-brand-primary border-brand-primary text-white ring-4 ring-blue-100'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>

              <div className="text-center mt-1.5 hidden sm:block">
                <span
                  className={`text-xs font-bold block ${
                    isCurrent ? 'text-brand-primary' : isCompleted ? 'text-text-main' : 'text-text-muted'
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[10px] text-text-muted block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
