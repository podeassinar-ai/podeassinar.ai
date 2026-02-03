'use server';

import { createClient } from '@infrastructure/database/supabase-server';

import {
  SupabaseTransactionRepository,
  SupabaseDiagnosisRepository,
  SupabaseFulfillmentRepository,
  SupabaseUserRepository,
  SupabaseDocumentRepository,
} from '@infrastructure/repositories';
import { LegalDiagnosis, RiskItem, LegalPathway } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { FulfillmentRequest } from '@domain/entities/fulfillment-request';
import { Document } from '@domain/entities/document';

async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const userRepo = new SupabaseUserRepository(supabase);
  const dbUser = await userRepo.findById(user.id);

  if (!dbUser || !['SYSTEM_ADMIN', 'ADMIN', 'LAWYER'].includes(dbUser.role)) {
    throw new Error('Access denied: Admin or Lawyer role required');
  }

  return { user, supabase, dbUser };
}

async function verifySystemAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const userRepo = new SupabaseUserRepository(supabase);
  const dbUser = await userRepo.findById(user.id);

  if (!dbUser || dbUser.role !== 'SYSTEM_ADMIN') {
    throw new Error('Access denied: System Admin role required');
  }

  return { user, supabase, dbUser };
}

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


export interface PendingReviewItem {
  diagnosis: LegalDiagnosis;
  transaction: Transaction;
  userName: string;
  userEmail: string;
}

export async function getPendingReviews(): Promise<PendingReviewItem[]> {
  const { supabase } = await verifyAdminAccess();

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const userRepo = new SupabaseUserRepository(supabase);

  const pendingDiagnoses = await diagnosisRepo.findPendingReview();
  const results: PendingReviewItem[] = [];

  for (const diagnosis of pendingDiagnoses) {
    const transaction = await transactionRepo.findById(diagnosis.transactionId);
    if (!transaction) continue;

    const user = await userRepo.findById(transaction.userId);
    if (!user) continue;

    results.push({
      diagnosis,
      transaction,
      userName: user.name,
      userEmail: user.email,
    });
  }

  return results;
}

export async function approveDiagnosis(diagnosisId: string): Promise<LegalDiagnosis> {
  const { user, supabase } = await verifyAdminAccess();

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  return diagnosisRepo.markReviewed(diagnosisId, user.id);
}

export async function getPendingFulfillments(): Promise<(FulfillmentRequest & { userName: string; userEmail: string })[]> {
  const { supabase } = await verifyAdminAccess();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
  const userRepo = new SupabaseUserRepository(supabase);

  const pending = await fulfillmentRepo.findPending();
  const results = [];

  for (const request of pending) {
    const user = await userRepo.findById(request.userId);
    results.push({
      ...request,
      userName: user?.name ?? 'Usuário desconhecido',
      userEmail: user?.email ?? '',
    });
  }

  return results;
}

export async function assignFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
  const { user, supabase } = await verifyAdminAccess();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
  return fulfillmentRepo.assign(fulfillmentId, user.id);
}

export async function completeFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
  const { supabase } = await verifyAdminAccess();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
  return fulfillmentRepo.markCompleted(fulfillmentId);
}

export async function addFulfillmentNotes(fulfillmentId: string, notes: string): Promise<FulfillmentRequest> {
  const { supabase } = await verifyAdminAccess();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
  return fulfillmentRepo.addNotes(fulfillmentId, notes);
}

// ================== NOTIFICATION ACTIONS ==================

import { AdminNotification } from '@domain/entities/admin-notification';
import { SupabaseNotificationRepository } from '@infrastructure/repositories';

export async function getAdminNotifications(limit = 20): Promise<AdminNotification[]> {
  const { user, supabase } = await verifyAdminAccess();

  const notificationRepo = new SupabaseNotificationRepository(supabase);
  return notificationRepo.findByRecipientId(user.id, limit);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { user, supabase } = await verifyAdminAccess();

  const notificationRepo = new SupabaseNotificationRepository(supabase);
  return notificationRepo.countUnreadByRecipientId(user.id);
}

export async function markNotificationAsRead(notificationId: string): Promise<AdminNotification> {
  const { user, supabase } = await verifyAdminAccess();

  const notificationRepo = new SupabaseNotificationRepository(supabase);
  const notification = await notificationRepo.findById(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.recipientId !== user.id) {
    throw new Error('Unauthorized');
  }

  return notificationRepo.markAsRead(notificationId);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { user, supabase } = await verifyAdminAccess();

  const notificationRepo = new SupabaseNotificationRepository(supabase);
  const unread = await notificationRepo.findUnreadByRecipientId(user.id);

  for (const notification of unread) {
    await notificationRepo.markAsRead(notification.id);
  }
}

// ================== USER MANAGEMENT ACTIONS (SYSTEM_ADMIN ONLY) ==================

import { User, UserRole, getRoleLabel } from '@domain/entities/user';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  isActive: boolean;
  createdAt: Date;
}

export async function getAllUsers(): Promise<UserListItem[]> {
  const { supabase } = await verifySystemAdminAccess();

  const userRepo = new SupabaseUserRepository(supabase);
  const users = await userRepo.findAll(200);

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    roleLabel: getRoleLabel(u.role),
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<User> {
  const { dbUser, supabase } = await verifySystemAdminAccess();

  // Prevent self-demotion
  if (dbUser.id === userId && newRole !== 'SYSTEM_ADMIN') {
    throw new Error('Cannot demote yourself');
  }

  const userRepo = new SupabaseUserRepository(supabase);
  return userRepo.updateRole(userId, newRole);
}

export async function deactivateUser(userId: string): Promise<void> {
  const { dbUser, supabase } = await verifySystemAdminAccess();

  // Prevent self-deactivation
  if (dbUser.id === userId) {
    throw new Error('Cannot deactivate yourself');
  }

  const userRepo = new SupabaseUserRepository(supabase);
  await userRepo.deactivate(userId);
}

// ================== ACTIVITY FEED ==================

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
        href: `/admin/revisao`, // TODO: Link to specific transaction details
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

// ================== DIAGNOSIS DETAILS & EDITING ==================

export interface DetailedDiagnosisItem extends PendingReviewItem {
  documents: (Document & { signedUrl: string })[];
}

export async function getDiagnosisDetails(diagnosisId: string): Promise<DetailedDiagnosisItem | null> {
  const { supabase } = await verifyAdminAccess();

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const userRepo = new SupabaseUserRepository(supabase);
  const documentRepo = new SupabaseDocumentRepository(supabase);

  const diagnosis = await diagnosisRepo.findById(diagnosisId);
  if (!diagnosis) return null;

  const transaction = await transactionRepo.findById(diagnosis.transactionId);
  if (!transaction) return null;

  const user = await userRepo.findById(transaction.userId);
  if (!user) return null;

  const documents = await documentRepo.findByTransactionId(transaction.id);

  // Generate signed URLs for documents
  const documentsWithUrls = await Promise.all(documents.map(async (doc) => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storageRef, 3600); // 1 hour validity

    return {
      ...doc,
      signedUrl: data?.signedUrl || '',
    };
  }));

  return {
    diagnosis,
    transaction,
    userName: user.name,
    userEmail: user.email,
    documents: documentsWithUrls,
  };
}

export async function updateDiagnosis(
  diagnosisId: string,
  updates: {
    summary?: string;
    risks?: RiskItem[];
    pathways?: LegalPathway[];
    aiConfidence?: number;
  }
): Promise<LegalDiagnosis> {
  const { user, supabase } = await verifyAdminAccess();
  // Here we could verify if user has permission to edit, but admin access is enough for now.

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  return diagnosisRepo.updateContent(diagnosisId, updates);
}

