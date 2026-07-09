import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { IStorageService } from '@domain/interfaces/storage-service';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface PurgeExpiredDocumentsResult {
  documentsPurged: number;
  storageObjectsDeleted: number;
}

/**
 * LGPD retention enforcement: permanently remove documents whose `expires_at`
 * has passed. Deletes the STORAGE object first, then the DB row, so a failure
 * never leaves an orphaned storage object with no DB record pointing at it.
 * Intended to run on a schedule (Vercel Cron -> /api/cron/purge-expired-documents).
 */
export class PurgeExpiredDocumentsUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageService: IStorageService,
    private auditService: IAuditService
  ) {}

  async execute(): Promise<PurgeExpiredDocumentsResult> {
    const expired = await this.documentRepository.findExpired();
    if (expired.length === 0) {
      return { documentsPurged: 0, storageObjectsDeleted: 0 };
    }

    // 1. Delete storage objects in bulk (idempotent — removing an already-gone
    //    object is a no-op for Supabase Storage).
    const storageRefs = expired.map((doc) => doc.storageRef).filter(Boolean);
    if (storageRefs.length > 0) {
      await this.storageService.deleteMany(storageRefs);
    }

    // 2. Delete the DB rows and audit each removal.
    let purged = 0;
    for (const doc of expired) {
      await this.documentRepository.delete(doc.id);
      purged++;
      // Best-effort audit; never let an audit failure abort the purge.
      try {
        await this.auditService.log({
          userId: null, // system/automated actor (retention purge)
          action: 'DELETE',
          resource: 'DOCUMENT',
          resourceId: doc.id,
          metadata: {
            reason: 'lgpd_retention_expired',
            transactionId: doc.transactionId,
            storageRef: doc.storageRef,
            expiresAt: doc.expiresAt?.toISOString?.() ?? String(doc.expiresAt),
          },
        });
      } catch {
        /* audit best-effort */
      }
    }

    return { documentsPurged: purged, storageObjectsDeleted: storageRefs.length };
  }
}
