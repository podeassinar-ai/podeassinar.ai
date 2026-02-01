import { IUserRepository } from '@domain/interfaces/user-repository';
import { User } from '@domain/entities/user';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      documentNumber: data.document_number,
      phone: data.phone,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      documentNumber: data.document_number,
      phone: data.phone,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async findByRole(role: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', role);

    if (error || !data) return [];

    return data.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      documentNumber: u.document_number,
      phone: u.phone,
      isActive: u.is_active,
      createdAt: new Date(u.created_at),
      updatedAt: new Date(u.updated_at),
    }));
  }

  async create(user: User): Promise<User> {
    const { error } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        document_number: user.documentNumber,
        phone: user.phone,
        is_active: user.isActive,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return user;
  }

  async update(user: User): Promise<User> {
    const { error } = await this.supabase
      .from('users')
      .update({
        name: user.name,
        document_number: user.documentNumber,
        phone: user.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return user;
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}