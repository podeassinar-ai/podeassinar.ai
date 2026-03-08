'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { createBrowserClient } from '@supabase/ssr';
import { NotificationBadge } from '@/components/admin/notification-badge';
import { CommandPalette } from '@/components/admin/command-palette';

// Icons as components for cleaner usage
const Icons = {
  Chart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clipboard: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Document: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Bell: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Users: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Logout: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Compliance: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Control Room', icon: Icons.Chart },
  { href: '/admin/revisao', label: 'Fila de Revisão', icon: Icons.Clipboard },
  { href: '/admin/certidoes', label: 'Certidões', icon: Icons.Document },
  { href: '/admin/notificacoes', label: 'Notificações', icon: Icons.Bell, showBadge: true },
  { href: '/admin/usuarios', label: 'Acesso & Usuários', icon: Icons.Users, systemAdminOnly: true },
  { href: '/admin/compliance', label: 'Compliance & LGPD', icon: Icons.Compliance, systemAdminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!dbUser || !['SYSTEM_ADMIN', 'ADMIN', 'LAWYER'].includes(dbUser.role)) {
        router.push('/');
        return;
      }

      setUserRole(dbUser.role);
      setHasAccess(true);
      setLoading(false);
    }

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <span className="text-slate-400 text-sm animate-pulse">Carregando Control Room...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      <CommandPalette />
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"
          aria-label="Abrir navegação do admin"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Menu
        </button>
        <span className="text-sm font-bold text-white">Control Room</span>
      </div>

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Fechar navegação do admin"
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-50 shadow-xl transition-transform duration-200',
          'md:translate-x-0',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold font-mono shadow-lg shadow-orange-900/50">
              P
            </div>
            <div>
              <span className="text-white font-bold tracking-tight text-sm block">PodeAssinar.ai</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Control Room</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminNavItems
            .filter((item) => !('systemAdminOnly' in item && item.systemAdminOnly) || userRole === 'SYSTEM_ADMIN')
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 translate-x-1'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {'showBadge' in item && item.showBadge && (
                    <NotificationBadge />
                  )}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <Link href="/meus-diagnosticos">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700">
              <Icons.Logout className="w-4 h-4" />
              Sair para o App
            </button>
          </Link>
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {userRole?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">Admin User</p>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{userRole?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 pt-24 md:p-8 md:pt-8 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" style={{
          backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
