import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  useEffect(() => {
    if (!isOpen) return;

    // Save triggering element to return focus on modal close
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the modal or the container
    const focusTimer = setTimeout(() => {
      if (dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null); // only visible elements

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original trigger element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={clsx(
            'relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full p-6 sm:p-8 z-10 border border-charcoal-100 focus:outline-none',
            maxWidthClasses[maxWidth]
          )}
        >
          <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
            <div>
              <h2 id={titleId} className="text-lg font-serif font-semibold text-charcoal">
                {title}
              </h2>
              {description && (
                <p id={descId} className="text-xs text-charcoal-600 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-charcoal-400 hover:text-charcoal p-1.5 rounded-full hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

