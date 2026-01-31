import AbacatePay from '@abacatepay/sdk';
import {
  IPaymentGateway,
  CreateCheckoutParams,
  CheckoutResult,
  PaymentWebhookEvent,
  PaymentWebhookEventType,
} from '@domain/interfaces/payment-gateway';
import { createHmac } from 'crypto';

interface AbacatePayWebhookPayload {
  event: string;
  data: {
    id: string;
    metadata?: Record<string, string>;
    status: string;
  };
}

export class AbacatePayGateway implements IPaymentGateway {
  private client: AbacatePay;
  private webhookSecret: string;

  constructor() {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      throw new Error('ABACATEPAY_API_KEY environment variable is required');
    }

    this.webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET || '';
    this.client = new AbacatePay(apiKey);
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const customer = await this.client.customers.create({
      email: params.customer.email,
      name: params.customer.name,
      cellphone: '',
      taxId: params.customer.taxId || '',
    });

    const billing = await this.client.billing.create({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [
        {
          externalId: params.metadata.transactionId || 'diagnostic',
          name: params.description,
          quantity: 1,
          price: params.amount,
        },
      ],
      metadata: params.metadata,
      customerId: customer.data.id,
      returnUrl: params.successUrl,
      completionUrl: params.successUrl,
    });

    return {
      checkoutId: billing.data.id,
      checkoutUrl: billing.data.url,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('ABACATEPAY_WEBHOOK_SECRET not configured, skipping signature verification');
      return true;
    }

    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  parseWebhookEvent(payload: string): PaymentWebhookEvent {
    const data: AbacatePayWebhookPayload = JSON.parse(payload);
    
    const eventTypeMap: Record<string, PaymentWebhookEventType> = {
      'billing.paid': 'billing.paid',
      'billing.expired': 'billing.expired',
      'billing.refunded': 'billing.refunded',
      'billing.created': 'billing.created',
      'BILLING_PAID': 'billing.paid',
      'BILLING_EXPIRED': 'billing.expired',
    };

    const eventType = eventTypeMap[data.event] || 'billing.created';

    return {
      type: eventType,
      externalId: data.data.id,
      metadata: data.data.metadata || {},
    };
  }

  async refund(externalId: string): Promise<void> {
    await this.client.billing.refund(externalId);
  }
}
