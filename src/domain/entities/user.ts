export type UserRole =
  | 'CLIENT'
  | 'LAWYER'
  | 'ADMIN'
  | 'DPO'
  | 'SYSTEM_ADMIN'
  | 'COMPANY_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  documentNumber?: string;
  organizationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createUser(params: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  documentNumber?: string;
}): User {
  const now = new Date();
  return {
    id: params.id,
    email: params.email,
    name: params.name,
    role: 'CLIENT',
    phone: params.phone,
    documentNumber: params.documentNumber,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createPrivilegedUser(params: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  documentNumber?: string;
}): User {
  const now = new Date();
  return {
    id: params.id,
    email: params.email,
    name: params.name,
    role: params.role,
    phone: params.phone,
    documentNumber: params.documentNumber,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

// ==================== ROLE HELPERS ====================

/** Staff roles that can access the admin dashboard */
export function isStaff(user: User): boolean {
  return ['SYSTEM_ADMIN', 'ADMIN', 'LAWYER', 'DPO'].includes(user.role);
}

/** Platform owner with full control */
export function isSystemAdmin(user: User): boolean {
  return user.role === 'SYSTEM_ADMIN';
}

/** Can review AI-generated diagnoses */
export function canReviewDiagnosis(user: User): boolean {
  return ['SYSTEM_ADMIN', 'LAWYER', 'ADMIN'].includes(user.role);
}

/** Can access audit logs and LGPD-related data */
export function canAccessAuditLogs(user: User): boolean {
  return ['SYSTEM_ADMIN', 'DPO', 'ADMIN'].includes(user.role);
}

/** Can manage users (change roles, deactivate) */
export function canManageUsers(user: User): boolean {
  return user.role === 'SYSTEM_ADMIN';
}

/** Can handle certificate fulfillment requests */
export function canFulfillCertificates(user: User): boolean {
  return ['SYSTEM_ADMIN', 'ADMIN'].includes(user.role);
}

/** Human-readable role labels for UI */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    CLIENT: 'Cliente',
    LAWYER: 'Advogado',
    ADMIN: 'Administrador',
    DPO: 'DPO',
    SYSTEM_ADMIN: 'Super Admin',
    COMPANY_ADMIN: 'Admin Empresa',
  };
  return labels[role];
}
