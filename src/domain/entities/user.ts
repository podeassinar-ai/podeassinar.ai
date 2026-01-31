export type UserRole = 'CLIENT' | 'LAWYER' | 'ADMIN' | 'DPO';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  documentNumber?: string;
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

export function canReviewDiagnosis(user: User): boolean {
  return user.role === 'LAWYER' || user.role === 'ADMIN';
}

export function canAccessAuditLogs(user: User): boolean {
  return user.role === 'DPO' || user.role === 'ADMIN';
}
