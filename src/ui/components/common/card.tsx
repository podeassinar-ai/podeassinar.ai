interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || description) && (
        <div className="mb-6 pb-4 border-b border-border/50">
          {title && <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}