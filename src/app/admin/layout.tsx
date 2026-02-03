'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { NotificationBadge } from '@/components/admin/notification-badge';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'chart' },
  { href: '/admin/revisao', label: 'Fila de Revisão', icon: 'clipboard' },
  { href: '/admin/certidoes', label: 'Pedidos de Certidões', icon: 'document' },
  { href: '/admin/notificacoes', label: 'Notificações', icon: 'bell', showBadge: true },
  { href: '/admin/usuarios', label: 'Usuários', icon: 'users', systemAdminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                  <div className="relative w-20 h-20 -my-4">
                    <Image
                      src="/logo.png"
                      alt="PodeAssinar Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold text-primary -ml-2">Admin</span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {adminNavItems
                  .filter((item) => !('systemAdminOnly' in item && item.systemAdminOnly) || userRole === 'SYSTEM_ADMIN')
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    >
                      {item.label}
                      {'showBadge' in item && item.showBadge && <NotificationBadge />}
                    </Link>
                  ))}
              </div>


            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Voltar ao App
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
