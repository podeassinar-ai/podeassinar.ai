import React from 'react';
import Link from 'next/link';
import { MobileNav } from './mobile-nav';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function MainContainer({ children, title, subtitle, action, breadcrumbs }: MainContainerProps) {
  return (
    <>
      <main className="w-full min-h-screen bg-white pb-24 md:pb-12 md:pt-16 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 animate-fade-up">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted font-mono">
                {breadcrumbs.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {item.href ? (
                      <Link href={item.href} className="hover:text-primary transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && <span>/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
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
