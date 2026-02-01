'use client';

import Link from 'next/link';
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
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/documentos',
    label: 'Documentos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
];

export function Sidebar() {
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
  const userEmail = user?.email || '';
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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-border flex-col shadow-lg z-50">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-hover transition-all duration-300">
                 <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
            </div>
            <div>
              <span className="block font-bold text-xl text-text-primary tracking-tight leading-none group-hover:text-primary transition-colors">PodeAssinar</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest font-mono">AI ENGINE</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 border border-border/50 hover:bg-orange-50/50 hover:border-primary/20 transition-all">
            {loading ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 flex-shrink-0 bg-white rounded-lg flex items-center justify-center text-primary font-bold shadow-sm border border-border font-mono">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate font-mono">{userName}</p>
                    <p className="text-xs text-text-muted truncate font-mono">{userEmail}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-text-muted hover:text-red-500 transition-colors p-1"
                  title="Sair"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <TransactionTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}