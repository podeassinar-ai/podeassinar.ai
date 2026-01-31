import {
  IAuditService,
  AuditLogEntry,
  AuditAction,
  AuditResource,
} from '@domain/interfaces/audit-service';
import { getSupabaseServiceClient } from '../database/supabase-client';
import { v4 as uuidv4 } from 'uuid';

interface AuditLogRow {
  id: string;
  user_id: string;
  action: AuditAction;
  resource: AuditResource;
  resource_id: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

function toEntity(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    metadata: row.metadata ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseAuditService implements IAuditService {
  private tableName = 'audit_logs';

  async log(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<void> {
    const supabase = getSupabaseServiceClient();
    
    const { error } = await supabase
      .from(this.tableName)
      .insert({
        id: uuidv4(),
        user_id: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        metadata: entry.metadata ?? null,
        ip_address: entry.ipAddress ?? null,
        user_agent: entry.userAgent ?? null,
      });

    if (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  async findByResource(resource: AuditResource, resourceId: string): Promise<AuditLogEntry[]> {
    const supabase = getSupabaseServiceClient();
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('resource', resource)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to find audit logs: ${error.message}`);
    return data.map(toEntity);
  }

  async findByUser(userId: string, limit = 100): Promise<AuditLogEntry[]> {
    const supabase = getSupabaseServiceClient();
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to find audit logs: ${error.message}`);
    return data.map(toEntity);
  }

  async findAll(filters: {
    startDate?: Date;
    endDate?: Date;
    action?: AuditAction;
    resource?: AuditResource;
  }): Promise<AuditLogEntry[]> {
    const supabase = getSupabaseServiceClient();
    
    let query = supabase
      .from(this.tableName)
      .select()
      .order('created_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to find audit logs: ${error.message}`);
    return data.map(toEntity);
  }
}
