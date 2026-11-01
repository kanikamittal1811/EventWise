import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
}) => {
  const variantClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    accent: 'bg-accent-50 text-accent-700 border-accent-200',
    neutral: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center border tracking-wide uppercase',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {children}
    </span>
  );
};

