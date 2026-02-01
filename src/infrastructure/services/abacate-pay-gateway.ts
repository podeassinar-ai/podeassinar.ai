import AbacatePay from '@abacatepay/sdk';
import {
  IPaymentGateway,
  CreateCheckoutParams,
  CheckoutResult,
  CheckoutDetails,
  CheckoutStatus,
  PixStatus,
  StoreInfo,
  RevenueMetrics,
  PaymentWebhookEvent,
  PaymentWebhookEventType,
} from '@domain/interfaces/payment-gateway';
import { createHmac, timingSafeEqual } from 'crypto';

interface AbacatePayWebhookPayload {
  event: string;
  data: {
    id: string;
    metadata?: Record<string, string>;
    status: string;
  };
}

export class AbacatePayGateway implements IPaymentGateway {
  private client: any; // Using any for now to bypass SDK type issues if they persist
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
      cellphone: params.customer.cellphone,
      taxId: params.customer.taxId,
    });

    const checkout = await this.client.checkouts.create({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      items: [
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
      checkoutId: checkout.data.id,
      checkoutUrl: checkout.data.url,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.error('SECURITY: ABACATEPAY_WEBHOOK_SECRET not configured - rejecting webhook');
      return false;
    }

    if (!signature) {
      return false;
    }

    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
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
    console.warn('Refund not implemented for v2 yet');
  }

  async getCheckout(id: string): Promise<CheckoutDetails> {
    const checkout = await this.client.checkouts.get(id);
    
    const statusMap: Record<string, CheckoutStatus> = {
      'PENDING': 'PENDING',
      'EXPIRED': 'EXPIRED',
      'COMPLETED': 'COMPLETED',
      'PAID': 'COMPLETED',
    };

    return {
      id: checkout.data.id,
      url: checkout.data.url,
      status: statusMap[checkout.data.status] || 'PENDING',
      amount: checkout.data.amount || 0,
      metadata: checkout.data.metadata as Record<string, string> | undefined,
      createdAt: new Date(checkout.data.createdAt),
    };
  }

  async listCheckouts(): Promise<CheckoutDetails[]> {
    const checkouts = await this.client.checkouts.list();
    
    const statusMap: Record<string, CheckoutStatus> = {
      'PENDING': 'PENDING',
      'EXPIRED': 'EXPIRED',
      'COMPLETED': 'COMPLETED',
      'PAID': 'COMPLETED',
    };

    return checkouts.data.map((checkout: any) => ({
      id: checkout.id,
      url: checkout.url,
      status: statusMap[checkout.status] || 'PENDING',
      amount: checkout.amount || 0,
      metadata: checkout.metadata as Record<string, string> | undefined,
      createdAt: new Date(checkout.createdAt),
    }));
  }

  async checkPixStatus(pixId: string): Promise<PixStatus> {
    const status = await this.client.pix.status(pixId);
    
    const pixStatusMap: Record<string, 'PENDING' | 'PAID' | 'EXPIRED'> = {
      'PENDING': 'PENDING',
      'PAID': 'PAID',
      'EXPIRED': 'EXPIRED',
      'COMPLETED': 'PAID',
    };

    return {
      id: status.data.id,
      status: pixStatusMap[status.data.status] || 'PENDING',
      amount: status.data.amount || 0,
      paidAt: status.data.paidAt ? new Date(status.data.paidAt) : undefined,
    };
  }

  async simulatePixPayment(pixId: string): Promise<PixStatus> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Payment simulation is not allowed in production');
    }

    const result = await this.client.pix.simulate(pixId);
    
    return {
      id: result.data.id,
      status: 'PAID',
      amount: result.data.amount || 0,
      paidAt: new Date(),
    };
  }

  async getStoreInfo(): Promise<StoreInfo> {
    const store = await this.client.store.get();
    
    return {
      id: store.data.id,
      name: store.data.name,
      balance: store.data.balance || 0,
    };
  }

  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const merchant = await this.client.mrr.merchant();
    
    return {
      mrr: merchant.data.mrr || 0,
      totalRevenue: merchant.data.totalRevenue || 0,
    };
  }
}