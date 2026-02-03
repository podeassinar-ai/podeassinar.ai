'use server';

import { createClient } from '@infrastructure/database/supabase-server';

import {
  SupabaseTransactionRepository,
  SupabaseDiagnosisRepository,
  SupabaseFulfillmentRepository,
  SupabaseUserRepository,
} from '@infrastructure/repositories';
import { LegalDiagnosis } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { FulfillmentRequest } from '@domain/entities/fulfillment-request';

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
