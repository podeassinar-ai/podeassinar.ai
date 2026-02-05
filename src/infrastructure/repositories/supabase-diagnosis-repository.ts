import {
  LegalDiagnosis,
  DiagnosisStatus,
  RiskItem,
  LegalPathway,
} from '@domain/entities/diagnosis';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface DiagnosisRow {
  id: string;
  transaction_id: string;
  status: DiagnosisStatus;
  property_status: string;
  risks: RiskItem[];
  pathways: LegalPathway[];
  summary: string;
  ai_confidence: number | null;
  ai_generated_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: DiagnosisRow): LegalDiagnosis {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    status: row.status,
    propertyStatus: row.property_status,
    risks: row.risks ?? [],
    pathways: row.pathways ?? [],
    summary: row.summary,
    aiConfidence: row.ai_confidence ?? undefined,
    aiGeneratedAt: row.ai_generated_at ? new Date(row.ai_generated_at) : undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(
  entity: LegalDiagnosis
): Omit<DiagnosisRow, 'created_at' | 'updated_at'> {
  return {
    id: entity.id,
    transaction_id: entity.transactionId,
    status: entity.status,
    property_status: entity.propertyStatus,
    risks: entity.risks,
    pathways: entity.pathways,
    summary: entity.summary,
    ai_confidence: entity.aiConfidence ?? null,
    ai_generated_at: entity.aiGeneratedAt?.toISOString() ?? null,
    reviewed_by: entity.reviewedBy ?? null,
    reviewed_at: entity.reviewedAt?.toISOString() ?? null,
    delivered_at: entity.deliveredAt?.toISOString() ?? null,
  };
}

export class SupabaseDiagnosisRepository implements IDiagnosisRepository {
  private tableName = 'diagnoses';

  constructor(private supabase: SupabaseClient) { }

  async create(diagnosis: LegalDiagnosis): Promise<LegalDiagnosis> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(diagnosis))
      .select()
      .single();

    if (error) throw new Error(`Failed to create diagnosis: ${error.message}`);
    return toEntity(data);
  }

  async findById(id: string): Promise<LegalDiagnosis | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find diagnosis: ${error.message}`);
    }
    return toEntity(data);
  }

  async findByTransactionId(transactionId: string): Promise<LegalDiagnosis | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find diagnosis by transaction: ${error.message}`);
    }
    return toEntity(data);
  }

  async updateStatus(id: string, status: DiagnosisStatus): Promise<LegalDiagnosis> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'AI_GENERATED') {
      updateData.ai_generated_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update diagnosis status: ${error.message}`);
    return toEntity(data);
  }

  async updateContent(
    id: string,
    content: {
      propertyStatus?: string;
      risks?: RiskItem[];
      pathways?: LegalPathway[];
      summary?: string;
      aiConfidence?: number;
    }
  ): Promise<LegalDiagnosis> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (content.propertyStatus !== undefined) {
      updateData.property_status = content.propertyStatus;
    }
    if (content.risks !== undefined) {
      updateData.risks = content.risks;
    }
    if (content.pathways !== undefined) {
      updateData.pathways = content.pathways;
    }
    if (content.summary !== undefined) {
      updateData.summary = content.summary;
    }
    if (content.aiConfidence !== undefined) {
      updateData.ai_confidence = content.aiConfidence;
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update diagnosis content: ${error.message}`);
    return toEntity(data);
  }

  async markReviewed(id: string, reviewerId: string): Promise<LegalDiagnosis> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        status: 'APPROVED',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark diagnosis as reviewed: ${error.message}`);
    return toEntity(data);
  }

  async markDelivered(id: string): Promise<LegalDiagnosis> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        status: 'DELIVERED',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark diagnosis as delivered: ${error.message}`);
    return toEntity(data);
  }

  async findPendingReview(): Promise<LegalDiagnosis[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .in('status', ['DRAFT', 'AI_GENERATED'])
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to find pending reviews: ${error.message}`);
    return data.map(toEntity);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);

    if (error) throw new Error(`Failed to delete diagnosis: ${error.message}`);
  }
}
