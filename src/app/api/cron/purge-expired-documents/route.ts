import { NextRequest, NextResponse } from 'next/server';
import { PurgeExpiredDocumentsUseCase } from '@application/use-cases/purge-expired-documents';
import { SupabaseDocumentRepository } from '@infrastructure/repositories';
import { SupabaseStorageService } from '@infrastructure/services/supabase-storage-service';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';

// LGPD retention cron. Scheduled via vercel.json (daily). Vercel Cron sends
// `Authorization: Bearer <CRON_SECRET>`; we reject anything else so the endpoint
// can't be triggered by the public.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const useCase = new PurgeExpiredDocumentsUseCase(
      new SupabaseDocumentRepository(supabase),
      new SupabaseStorageService(),
      new SupabaseAuditService()
    );

    const result = await useCase.execute();
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error('Expired-document purge failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
