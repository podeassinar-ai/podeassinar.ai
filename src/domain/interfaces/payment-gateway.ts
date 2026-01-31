export interface CreateCheckoutParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
}

export interface PaymentWebhookEvent {
  type: 'payment.completed' | 'payment.failed' | 'payment.refunded';
  externalId: string;
  metadata: Record<string, string>;
}

export interface IPaymentGateway {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string): PaymentWebhookEvent;
  refund(externalId: string): Promise<void>;
}
