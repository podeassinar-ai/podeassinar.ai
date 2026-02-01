interface TechBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  outline: 'bg-transparent text-text-secondary border-border',
};

export function TechBadge({ children, variant = 'default', className = '' }: TechBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium font-mono border
        uppercase tracking-tight
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}