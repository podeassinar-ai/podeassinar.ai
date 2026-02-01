import {
  FulfillmentRequest,
  FulfillmentStatus,
} from '@domain/entities/fulfillment-request';
import { IFulfillmentRepository } from '@domain/interfaces/fulfillment-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface FulfillmentRow {
  id: string;
  transaction_id: string;
  user_id: string;
  registry_number: string;
  registry_office: string;
  request_type: string;
  status: FulfillmentStatus;
  notes: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: FulfillmentRow): FulfillmentRequest {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    userId: row.user_id,
    registryNumber: row.registry_number,
    registryOffice: row.registry_office,
    requestType: row.request_type,
    status: row.status,
    notes: row.notes ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(
  entity: FulfillmentRequest
): Omit<FulfillmentRow, 'created_at' | 'updated_at'> {
  return {
    id: entity.id,
    transaction_id: entity.transactionId,
    user_id: entity.userId,
    registry_number: entity.registryNumber,
    registry_office: entity.registryOffice,
    request_type: entity.requestType,
    status: entity.status,
    notes: entity.notes ?? null,
    assigned_to: entity.assignedTo ?? null,
    completed_at: entity.completedAt?.toISOString() ?? null,
  };
}

export class SupabaseFulfillmentRepository implements IFulfillmentRepository {
  private tableName = 'fulfillment_requests';

  constructor(private supabase: SupabaseClient) {}

  async create(request: FulfillmentRequest): Promise<FulfillmentRequest> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(request))
      .select()
      .single();

    if (error) throw new Error(`Failed to create fulfillment request: ${error.message}`);
    return toEntity(data);
  }

  async findById(id: string): Promise<FulfillmentRequest | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find fulfillment request: ${error.message}`);
    }
    return toEntity(data);
  }

  async findByTransactionId(transactionId: string): Promise<FulfillmentRequest | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find fulfillment request: ${error.message}`);
    }
    return toEntity(data);
  }

  async findByStatus(status: FulfillmentStatus): Promise<FulfillmentRequest[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to find fulfillment requests: ${error.message}`);
    return data.map(toEntity);
  }

  async findPending(): Promise<FulfillmentRequest[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .in('status', ['PENDING', 'IN_PROGRESS'])
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to find pending fulfillment requests: ${error.message}`);
    return data.map(toEntity);
  }

  async updateStatus(id: string, status: FulfillmentStatus): Promise<FulfillmentRequest> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update fulfillment status: ${error.message}`);
    return toEntity(data);
  }

  async assign(id: string, assignedTo: string): Promise<FulfillmentRequest> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        assigned_to: assignedTo,
        status: 'IN_PROGRESS',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to assign fulfillment request: ${error.message}`);
    return toEntity(data);
  }

  async markCompleted(id: string): Promise<FulfillmentRequest> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete fulfillment request: ${error.message}`);
    return toEntity(data);
  }

  async addNotes(id: string, notes: string): Promise<FulfillmentRequest> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to add notes: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);

    if (error) throw new Error(`Failed to delete fulfillment request: ${error.message}`);
  }
}
