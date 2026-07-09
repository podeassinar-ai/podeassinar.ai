export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentType = 'DIAGNOSTIC' | 'CERTIFICATE_REQUEST' | 'LEGAL_SERVICE' | 'SUBSCRIPTION';

export interface Payment {
  id: string;
  // A payment references EITHER a transaction (diagnostic) OR a subscription
  // (plan) — exactly one is set (enforced by a DB CHECK constraint).
  transactionId?: string;
  subscriptionId?: string;
  userId: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  externalId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createPayment(params: {
  id: string;
  transactionId?: string;
  subscriptionId?: string;
  userId: string;
  type: PaymentType;
  amount: number;
  currency?: string;
}): Payment {
  if (!params.transactionId && !params.subscriptionId) {
    throw new Error('createPayment requires either transactionId or subscriptionId');
  }
  if (params.transactionId && params.subscriptionId) {
    throw new Error('createPayment cannot reference both a transaction and a subscription');
  }
  const now = new Date();
  return {
    id: params.id,
    transactionId: params.transactionId,
    subscriptionId: params.subscriptionId,
    userId: params.userId,
    type: params.type,
    status: 'PENDING',
    amount: params.amount,
    currency: params.currency ?? 'BRL',
    createdAt: now,
    updatedAt: now,
  };
}

export function isCompleted(payment: Payment): boolean {
  return payment.status === 'COMPLETED';
}

export function canBeRefunded(payment: Payment): boolean {
  return payment.status === 'COMPLETED';
}
