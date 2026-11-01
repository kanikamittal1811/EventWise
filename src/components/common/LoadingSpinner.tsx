import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-charcoal-600">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

