import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : generatedId);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={clsx(
              'w-full appearance-none bg-white border text-charcoal text-sm rounded-xl py-2.5 pl-3.5 pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary cursor-pointer',
              error ? 'border-red-400 focus:border-red-500' : 'border-charcoal-200',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-charcoal-400">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
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

Select.displayName = 'Select';

