import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon: Icon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : generatedId);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={clsx(
              'w-full bg-white border text-charcoal placeholder-charcoal-500 text-sm rounded-xl py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary',
              Icon ? 'pl-10 pr-3.5' : 'px-3.5',
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : 'border-charcoal-200',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-charcoal-600">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

