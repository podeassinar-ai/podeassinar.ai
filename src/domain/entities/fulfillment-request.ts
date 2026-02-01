export type FulfillmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface FulfillmentRequest {
  id: string;
  transactionId: string;
  userId: string;
  registryNumber: string;
  registryOffice: string;
  requestType: string;
  status: FulfillmentStatus;
  notes?: string;
  assignedTo?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createFulfillmentRequest(params: {
  id: string;
  transactionId: string;
  userId: string;
  registryNumber: string;
  registryOffice: string;
  requestType?: string;
}): FulfillmentRequest {
  const now = new Date();
  return {
    id: params.id,
    transactionId: params.transactionId,
    userId: params.userId,
    registryNumber: params.registryNumber,
    registryOffice: params.registryOffice,
    requestType: params.requestType ?? 'MATRICULA_ATUALIZADA',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
}
