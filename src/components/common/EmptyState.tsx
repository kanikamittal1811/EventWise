import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  aiSuggestedPrompt?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  aiSuggestedPrompt,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-charcoal-200/80 rounded-3xl bg-background-subtle/40">
      <div className="w-12 h-12 rounded-2xl bg-white border border-charcoal-200 shadow-subtle flex items-center justify-center text-primary mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h4 className="text-base font-semibold text-charcoal">{title}</h4>
      <p className="text-sm text-charcoal-600 max-w-sm mt-1 mb-5">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="sm">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
      {aiSuggestedPrompt && (
        <p className="mt-4 text-xs text-charcoal-500 italic">
          Tip: You can ask AI: &quot;{aiSuggestedPrompt}&quot;
        </p>
      )}
    </div>
  );
};

