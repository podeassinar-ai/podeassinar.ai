'use server';

import { verifyAdminAccess } from './auth-helpers';
import {
    SupabaseDiagnosisRepository,
    SupabaseTransactionRepository,
    SupabaseUserRepository,
    SupabaseDocumentRepository,
    SupabaseNotificationRepository,
} from '@infrastructure/repositories';
import { LegalDiagnosis, RiskItem, LegalPathway } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { Document } from '@domain/entities/document';
import { ResendEmailService } from '@infrastructure/services/email-service';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { NotificationDispatcher } from '@application/services/notification-dispatcher';

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
    const transactionRepo = new SupabaseTransactionRepository(supabase);

    // 1. Mark as reviewed (APPROVED)
    const diagnosis = await diagnosisRepo.markReviewed(diagnosisId, user.id);

    // 2. Update transaction status to COMPLETED
    await transactionRepo.updateStatus(diagnosis.transactionId, 'COMPLETED');

    // 3. Mark as delivered to the user
    const finalDiagnosis = await diagnosisRepo.markDelivered(diagnosisId);

    // 4. Notify the customer
    try {
        const userRepo = new SupabaseUserRepository(supabase);
        const notificationRepo = new SupabaseNotificationRepository(supabase);
        const emailService = new ResendEmailService();
        const auditService = new SupabaseAuditService();
        const transaction = await transactionRepo.findById(finalDiagnosis.transactionId);
        const customer = await userRepo.findById(transaction?.userId || '');

        if (transaction && customer) {
            const dispatcher = new NotificationDispatcher(
                notificationRepo,
                userRepo,
                emailService,
                auditService
            );
            await dispatcher.onDiagnosisApproved(finalDiagnosis, transaction, customer);
        }
    } catch (error) {
        console.error('Failed to notify customer after approval:', error);
    }

    return finalDiagnosis;
}

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
    const { supabase } = await verifyAdminAccess();

    const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
    return diagnosisRepo.updateContent(diagnosisId, updates);
}
