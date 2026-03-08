'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TransactionTypeModal } from './transaction-type-modal';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  protected?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/diagnostico',
    label: 'Nova Due Diligence',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/meus-diagnosticos',
    label: 'Minhas Análises',
    protected: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/planos',
    label: 'Planos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/documentos',
    label: 'Documentos',
    protected: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
];

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = userName.slice(0, 2).toUpperCase();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '/diagnostico') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 px-4 lg:px-8 items-center justify-between no-print">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-4 group min-w-fit">
          {/* Container pequeno para o layout, mas logo grande transbordando */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute w-24 h-24 -top-7 -left-7">
              <Image
                src="/logo.png"
                alt="PodeAssinar Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="block font-bold text-lg text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors">PodeAssinar.ai</span>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav className="flex items-center gap-1 mx-4">
          {navItems
            .filter((item) => !item.protected || user)
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive
                    ? 'bg-orange-50 text-primary'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4 min-w-fit justify-end">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-text-primary truncate font-mono">{userName}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold font-mono text-sm border border-primary/20">
                {userInitials}
              </div>
              <button
                onClick={handleLogout}
                aria-label="Sair da conta"
                className="text-text-muted hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-sm text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Entrar
            </Link>
          )}
        </div>
      </header>

      <TransactionTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
