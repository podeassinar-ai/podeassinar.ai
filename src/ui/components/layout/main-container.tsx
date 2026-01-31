interface MainContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function MainContainer({ children, title, subtitle, action }: MainContainerProps) {
  return (
    <main className="ml-64 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-10 py-12">
        {(title || subtitle) && (
          <header className="mb-10 border-b border-border pb-6 flex justify-between items-start">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-2 text-text-secondary text-lg font-light">{subtitle}</p>
              )}
            </div>
            {action && (
              <div>{action}</div>
            )}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}