export type TransactionType = 
  | 'SALE'
  | 'PURCHASE'
  | 'RENTAL'
  | 'FINANCING'
  | 'REFINANCING'
  | 'REGULARIZATION';

export type TransactionStatus = 
  | 'PENDING_QUESTIONNAIRE'
  | 'PENDING_DOCUMENTS'
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  propertyAddress?: string;
  registryNumber?: string;
  registryOffice?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createTransaction(params: {
  id: string;
  userId: string;
  type: TransactionType;
  propertyAddress?: string;
  registryNumber?: string;
  registryOffice?: string;
}): Transaction {
  const now = new Date();
  return {
    id: params.id,
    userId: params.userId,
    type: params.type,
    status: 'PENDING_QUESTIONNAIRE',
    propertyAddress: params.propertyAddress,
    registryNumber: params.registryNumber,
    registryOffice: params.registryOffice,
    createdAt: now,
    updatedAt: now,
  };
}

export function canAdvanceToDocuments(transaction: Transaction): boolean {
  return transaction.status === 'PENDING_QUESTIONNAIRE';
}

export function canAdvanceToPayment(transaction: Transaction): boolean {
  return transaction.status === 'PENDING_DOCUMENTS';
}

export function canStartProcessing(transaction: Transaction): boolean {
  return transaction.status === 'PENDING_PAYMENT';
}
