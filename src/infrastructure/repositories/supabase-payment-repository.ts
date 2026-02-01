import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { Payment, PaymentStatus } from '@domain/entities/payment';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePaymentRepository implements IPaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByTransactionId(transactionId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId);

    if (error || !data) return [];

    return data.map(this.mapToEntity);
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('external_id', externalId)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async create(payment: Payment): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert({
        id: payment.id,
        transaction_id: payment.transactionId,
        user_id: payment.userId,
        type: payment.type,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        external_id: payment.externalId,
        paid_at: payment.paidAt?.toISOString(),
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapToEntity(data);
  }

  async update(payment: Payment): Promise<Payment> {
    const { error } = await this.supabase
      .from('payments')
      .update({
        status: payment.status,
        external_id: payment.externalId,
        paid_at: payment.paidAt?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (error) throw new Error(error.message);

    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus, externalId?: string): Promise<Payment> {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (externalId) updates.external_id = externalId;

    const { data, error } = await this.supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  async markPaid(id: string, externalId: string): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status: 'COMPLETED',
        external_id: externalId,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  private mapToEntity(data: any): Payment {
    return {
      id: data.id,
      transactionId: data.transaction_id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      externalId: data.external_id,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}