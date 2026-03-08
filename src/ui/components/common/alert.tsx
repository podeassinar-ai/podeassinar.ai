import React from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// Institutional palette for alerts
const variants: Record<AlertVariant, { bg: string; border: string; icon: string }> = {
  info: { 
    bg: 'bg-primary/5', 
    border: 'border-primary/10', 
    icon: 'text-primary' 
  },
  success: { 
    bg: 'bg-secondary/5', 
    border: 'border-secondary/10', 
    icon: 'text-secondary' 
  },
  warning: { 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200', 
    icon: 'text-yellow-600' 
  },
  error: { 
    bg: 'bg-red-50', 
    border: 'border-red-200', 
    icon: 'text-red-600' 
  },
};

const icons: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const styles = variants[variant];

  return (
    <div className={`${styles.bg} ${styles.border} border rounded p-4 ${className}`}>
      <div className="flex gap-3">
        <div className={`mt-0.5 ${styles.icon}`}>{icons[variant]}</div>
        <div className="flex-1">
          {title && <h4 className="font-semibold text-text-primary mb-1 text-sm uppercase tracking-wide opacity-90">{title}</h4>}
          <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
