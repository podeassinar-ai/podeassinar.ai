'use client';

import { Button } from './button';
import Link from 'next/link';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
}

/**
 * Shared error-state chrome for route `error.tsx` boundaries: warning icon,
 * title, message, a "try again" button and an optional secondary link. Keeps the
 * visual treatment consistent across routes instead of copy-pasting per boundary.
 */
export function ErrorState({ title, message, onRetry, secondaryHref, secondaryLabel }: ErrorStateProps) {
  return (
    <div className="text-center py-12 max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-7.938 4h15.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref}>
            <Button variant="secondary">{secondaryLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
