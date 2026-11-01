import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-2xl',
  };

  const variantClasses = {
    primary:
      'bg-primary text-white hover:bg-primary-800 focus:ring-primary-400 shadow-sm shadow-primary/20',
    secondary:
      'bg-secondary-100 text-charcoal hover:bg-secondary-200 focus:ring-secondary-300',
    outline:
      'border border-charcoal-200 bg-white text-charcoal hover:bg-charcoal-50 focus:ring-primary-300',
    ghost:
      'text-charcoal hover:bg-charcoal-100 focus:ring-charcoal-200',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-400 border border-red-200',
    accent:
      'bg-accent text-white hover:bg-accent-600 focus:ring-accent-400 shadow-sm shadow-accent/20',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4" aria-hidden="true" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
};

