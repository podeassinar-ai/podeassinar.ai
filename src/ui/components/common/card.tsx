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
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-text-primary">{title}</h3>}
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
