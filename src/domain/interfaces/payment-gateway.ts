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
    taxId?: string;
  };
}

export interface CheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
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
}
