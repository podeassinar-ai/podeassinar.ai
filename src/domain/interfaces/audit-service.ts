export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'DOWNLOAD'
  | 'EXPORT';

export type AuditResource =
  | 'TRANSACTION'
  | 'DOCUMENT'
  | 'DIAGNOSIS'
  | 'USER'
  | 'PAYMENT'
  | 'ADMIN_NOTIFICATION'
  | 'EMAIL_NOTIFICATION';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IAuditService {
  log(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<void>;
  findByResource(resource: AuditResource, resourceId: string): Promise<AuditLogEntry[]>;
  findByUser(userId: string, limit?: number): Promise<AuditLogEntry[]>;
  findAll(filters: {
    startDate?: Date;
    endDate?: Date;
    action?: AuditAction;
    resource?: AuditResource;
  }): Promise<AuditLogEntry[]>;
}
