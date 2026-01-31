interface MainContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainContainer({ children, title, subtitle }: MainContainerProps) {
  return (
    <main className="ml-64 min-h-screen">
      <div className="max-w-4xl mx-auto px-8 py-10">
        {(title || subtitle) && (
          <header className="mb-8">
            {title && (
              <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-1 text-text-secondary">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}
