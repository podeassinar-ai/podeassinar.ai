import { MobileNav } from './mobile-nav';

interface MainContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function MainContainer({ children, title, subtitle, action }: MainContainerProps) {
  return (
    <>
      <main className="w-full min-h-screen bg-white pb-24 md:pb-12 md:pt-16 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
          {(title || subtitle) && (
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="animate-fade-up">
                {title && (
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">{subtitle}</p>
                )}
              </div>
              {action && (
                <div className="animate-fade-up animate-delay-100 self-start">
                  {action}
                </div>
              )}
            </header>
          )}
          <div className="animate-fade-up animate-delay-200">
            {children}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}