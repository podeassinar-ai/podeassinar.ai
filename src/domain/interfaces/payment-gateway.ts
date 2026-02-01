export interface CreateCheckoutParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customer: {
    email: string;
    name: string;
    cellphone: string;
    taxId: string;
  };
}

export interface CheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
}

export type CheckoutStatus = 'PENDING' | 'EXPIRED' | 'COMPLETED';

export interface CheckoutDetails {
  id: string;
  url: string;
  status: CheckoutStatus;
  amount: number;
  metadata?: Record<string, string>;
  createdAt: Date;
}

export interface PixStatus {
  id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  amount: number;
  paidAt?: Date;
}

export interface StoreInfo {
  id: string;
  name: string;
  balance: number;
}

export interface RevenueMetrics {
  mrr: number;
  totalRevenue: number;
}

export type PaymentWebhookEventType = 
  | 'billing.paid'
  | 'billing.expired'
  | 'billing.refunded'
  | 'billing.created';

export interface PaymentWebhookEvent {
  type: PaymentWebhookEventType;
  externalId: string;
  metadata: Record<string, string>;
}

export interface IPaymentGateway {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string): PaymentWebhookEvent;
  refund(externalId: string): Promise<void>;
  getCheckout(id: string): Promise<CheckoutDetails>;
  listCheckouts(): Promise<CheckoutDetails[]>;
  checkPixStatus(pixId: string): Promise<PixStatus>;
  simulatePixPayment(pixId: string): Promise<PixStatus>;
  getStoreInfo(): Promise<StoreInfo>;
  getRevenueMetrics(): Promise<RevenueMetrics>;
}
