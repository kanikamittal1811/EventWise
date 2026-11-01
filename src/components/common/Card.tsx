import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-background-card rounded-2xl border border-charcoal-100 shadow-card p-5 sm:p-6 transition-all duration-200',
        hoverable && 'hover:shadow-float hover:border-charcoal-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

