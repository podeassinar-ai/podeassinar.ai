'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAdminDashboardStats,
  getRecentActivity,
  AdminDashboardStats,
  DashboardActivityItem
} from '@app/actions/admin-actions';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { SystemStatus } from '@/components/admin/system-status';

function StatCard({
  title,
  value,
  href,
  color,
  trend,
  icon: Icon
}: {
  title: string;
  value: number;
  href: string;
  color: string;
  trend?: string;
  icon: any;
}) {
  const colorStyles: Record<string, string> = {
    // Light theme variants
    orange: 'bg-orange-50 text-orange-600 border-orange-100 group-hover:border-orange-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:border-amber-200',
    slate: 'bg-white text-slate-600 border-slate-200 group-hover:border-slate-300',
  };

  const style = colorStyles[color] || colorStyles.slate;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative overflow-hidden rounded-xl p-6 border transition-all duration-300
        bg-white shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-orange-500/30
      `}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${style}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {trend}
            </span>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold font-mono tracking-tight mb-1 text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
      </div>
    </Link>
  );
}

const Icons = {
  Review: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Cert: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Process: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, activityData] = await Promise.all([
          getAdminDashboardStats(),
          getRecentActivity()
        ]);
        setStats(statsData);
        setActivities(activityData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-slate-200 rounded-xl border border-slate-300"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl border border-slate-300"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 bg-red-50 px-4 py-2 rounded inline-block border border-red-200">
          Erro ao carregar dashboard: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control Room</h1>
          <p className="text-slate-500 mt-1">Visão geral das operações jurídicas</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema On-line
          </span>
          <span className="text-slate-400 text-sm font-mono">
            v1.2-b
          </span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Aguardando Revisão"
          value={stats?.pendingReviews ?? 0}
          href="/admin/revisao"
          color="amber"
          icon={Icons.Review}
          trend={stats?.pendingReviews && stats.pendingReviews > 5 ? 'Alta demanda' : undefined}
        />
        <StatCard
          title="Pedidos de Certidões"
          value={stats?.pendingFulfillments ?? 0}
          href="/admin/certidoes"
          color="indigo"
          icon={Icons.Cert}
        />
        <StatCard
          title="Processando IA"
          value={stats?.processingTransactions ?? 0}
          href="/admin/revisao"
          color="orange"
          icon={Icons.Process}
        />
        <StatCard
          title="Entregues Hoje"
          value={stats?.completedToday ?? 0}
          href="/admin/dashboard"
          color="emerald"
          icon={Icons.Check}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Atividade Recente</h3>
              <Link href="/admin/revisao" className="text-xs text-orange-600 hover:text-orange-700 transition-colors font-medium">
                Ver tudo
              </Link>
            </div>
            <div className="p-4">
              <ActivityFeed items={activities} />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link href="/admin/revisao" className="block w-full text-center py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm font-bold tracking-wide">
                Nova Revisão Manual
              </Link>
              {stats?.pendingFulfillments && stats.pendingFulfillments > 0 ? (
                <Link href="/admin/certidoes" className="block w-full text-center py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors text-sm font-medium">
                  Emitir Certidões ({stats.pendingFulfillments})
                </Link>
              ) : null}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Status do Sistema</h3>
            <SystemStatus services={[
              { name: 'IA Engine (LangChain)', status: 'operational', latency: '45ms' },
              { name: 'Database (Supabase)', status: 'operational', latency: '12ms' },
              { name: 'Payment Gateway', status: 'operational' },
              { name: 'Storage', status: 'operational' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
