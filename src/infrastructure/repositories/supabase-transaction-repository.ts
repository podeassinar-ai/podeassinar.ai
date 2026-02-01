import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@domain/entities/transaction';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface TransactionRow {
  id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  property_address: string | null;
  registry_number: string | null;
  registry_office: string | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    propertyAddress: row.property_address ?? undefined,
    registryNumber: row.registry_number ?? undefined,
    registryOffice: row.registry_office ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(entity: Transaction): Omit<TransactionRow, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: entity.id,
    user_id: entity.userId,
    type: entity.type,
    status: entity.status,
    property_address: entity.propertyAddress ?? null,
    registry_number: entity.registryNumber ?? null,
    registry_office: entity.registryOffice ?? null,
  };
}

export class SupabaseTransactionRepository implements ITransactionRepository {
  private tableName = 'transactions';

  constructor(private supabase: SupabaseClient) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(transaction))
      .select()
      .single();

    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return toEntity(data);
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find transaction: ${error.message}`);
    }
    return toEntity(data);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to find transactions: ${error.message}`);
    return data.map(toEntity);
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update transaction status: ${error.message}`);
    return toEntity(data);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const allowedFields = {
      property_address: transaction.propertyAddress ?? null,
      registry_number: transaction.registryNumber ?? null,
      registry_office: transaction.registryOffice ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(allowedFields)
      .eq('id', transaction.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update transaction: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}
