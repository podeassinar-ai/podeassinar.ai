'use server';

import { verifyAdminAccess } from './auth-helpers';
import {
    SupabaseDiagnosisRepository,
    SupabaseFulfillmentRepository,
} from '@infrastructure/repositories';

export interface AdminDashboardStats {
    pendingReviews: number;
    pendingFulfillments: number;
    processingTransactions: number;
    completedToday: number;
    totalUsers?: number;
    totalClients?: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const { supabase, dbUser } = await verifyAdminAccess();

    const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
    const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);

    const pendingReviews = await diagnosisRepo.findPendingReview();
    const pendingFulfillments = await fulfillmentRepo.findPending();

    const { data: processingData } = await supabase
        .from('transactions')
        .select('id')
        .eq('status', 'PROCESSING');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: completedData } = await supabase
        .from('diagnoses')
        .select('id')
        .eq('status', 'DELIVERED')
        .gte('delivered_at', today.toISOString());

    const stats: AdminDashboardStats = {
        pendingReviews: pendingReviews.length,
        pendingFulfillments: pendingFulfillments.length,
        processingTransactions: processingData?.length ?? 0,
        completedToday: completedData?.length ?? 0,
    };

    // Add user stats only for System Admin
    if (dbUser.role === 'SYSTEM_ADMIN') {
        const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: clientCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'CLIENT');

        stats.totalUsers = userCount ?? 0;
        stats.totalClients = clientCount ?? 0;
    }

    return stats;
}

export interface DashboardActivityItem {
    id: string;
    type: 'TRANSACTION' | 'USER' | 'DIAGNOSIS' | 'SYSTEM';
    title: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
    href?: string;
}

export async function getRecentActivity(): Promise<DashboardActivityItem[]> {
    const { dbUser, supabase } = await verifyAdminAccess();

    const activities: DashboardActivityItem[] = [];

    // 1. Recent Transactions (limit 5)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id, created_at, type, status, property_address, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

    if (transactions) {
        for (const tx of transactions) {
            activities.push({
                id: `tx-${tx.id}`,
                type: 'TRANSACTION',
                title: 'Nova Transação Iniciada',
                description: `${tx.type} - ${tx.property_address || 'Endereço não informado'}`,
                timestamp: new Date(tx.created_at),
                status: 'info',
                href: `/admin/revisao`,
            });
        }
    }

    // 2. Recent Diagnoses updates (limit 5)
    const { data: diagnoses } = await supabase
        .from('diagnoses')
        .select('id, updated_at, status, ai_confidence, transaction_id')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (diagnoses) {
        for (const d of diagnoses) {
            if (d.status === 'PENDING_REVIEW') {
                activities.push({
                    id: `dg-${d.id}`,
                    type: 'DIAGNOSIS',
                    title: 'Diagnóstico Aguardando Revisão',
                    description: `Confiança da IA: ${Math.round((d.ai_confidence || 0) * 100)}%`,
                    timestamp: new Date(d.updated_at),
                    status: 'warning',
                    href: `/admin/revisao`,
                });
            } else if (d.status === 'DELIVERED') {
                activities.push({
                    id: `dg-${d.id}`,
                    type: 'DIAGNOSIS',
                    title: 'Diagnóstico Entregue',
                    description: `Análise finalizada e enviada ao cliente.`,
                    timestamp: new Date(d.updated_at),
                    status: 'success',
                    href: `/admin/revisao`,
                });
            }
        }
    }

    // 3. New Users (System Admin Only)
    if (dbUser.role === 'SYSTEM_ADMIN') {
        const { data: users } = await supabase
            .from('users')
            .select('id, created_at, email, name, role')
            .order('created_at', { ascending: false })
            .limit(3);

        if (users) {
            for (const u of users) {
                activities.push({
                    id: `usr-${u.id}`,
                    type: 'USER',
                    title: 'Novo Usuário Registrado',
                    description: `${u.name} (${u.email}) - ${u.role}`,
                    timestamp: new Date(u.created_at),
                    status: 'success',
                    href: `/admin/usuarios`,
                });
            }
        }
    }

    // Sort merged list by timestamp desc
    return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
}
