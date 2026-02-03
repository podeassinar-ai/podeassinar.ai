'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminDashboardStats, AdminDashboardStats } from '@app/actions/admin-actions';

function StatCard({
  title,
  value,
  href,
  color
}: {
  title: string;
  value: number;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="block">
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">Clique para ver detalhes</p>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500">Visão geral das operações do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Aguardando Revisão"
          value={stats?.pendingReviews ?? 0}
          href="/admin/revisao"
          color="border-yellow-500"
        />
        <StatCard
          title="Pedidos de Certidões"
          value={stats?.pendingFulfillments ?? 0}
          href="/admin/certidoes"
          color="border-blue-500"
        />
        <StatCard
          title="Processando IA"
          value={stats?.processingTransactions ?? 0}
          href="/admin/revisao"
          color="border-purple-500"
        />
        <StatCard
          title="Entregues Hoje"
          value={stats?.completedToday ?? 0}
          href="/admin/dashboard"
          color="border-green-500"
        />
        {stats?.totalUsers !== undefined && (
          <StatCard
            title="Usuários Registrados"
            value={stats.totalUsers}
            href="/admin/usuarios"
            color="border-orange-500"
          />
        )}
        {stats?.totalClients !== undefined && (
          <StatCard
            title="Total de Clientes"
            value={stats.totalClients}
            href="/admin/usuarios"
            color="border-pink-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/admin/revisao"
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Revisar Diagnósticos</p>
                  <p className="text-sm text-gray-500">Aprovar análises geradas pela IA</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats?.pendingReviews ?? 0} pendentes
                </span>
              </div>
            </Link>
            <Link
              href="/admin/certidoes"
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Pedidos de Certidões</p>
                  <p className="text-sm text-gray-500">Processar solicitações de matrículas</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats?.pendingFulfillments ?? 0} pendentes
                </span>
              </div>
            </Link>
            {stats?.totalUsers !== undefined && (
              <Link
                href="/admin/usuarios"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Gerenciar Usuários</p>
                    <p className="text-sm text-gray-500">Controlar permissões e papéis do sistema</p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {stats.totalUsers} usuários
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Serviço de IA</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Operacional</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Banco de Dados</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Operacional</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Gateway de Pagamento</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Operacional</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
