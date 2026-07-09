import { AbacatePay } from '@abacatepay/sdk';
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

/**
 * Thrown when a webhook event type is not one we handle. The route should ack
 * (200) and ignore rather than mutating payment state or 500-ing.
 */
export class UnknownWebhookEventError extends Error {
  constructor(public readonly eventType: string) {
    super(`Unhandled AbacatePay webhook event: ${eventType}`);
    this.name = 'UnknownWebhookEventError';
  }
}

// AbacatePay webhook payloads vary slightly across API versions. v2 nests the
// billing under data.billing; older shapes put id/status/metadata directly on
// data. Parse defensively so a real webhook is never silently dropped.
interface AbacatePayWebhookPayload {
  id?: string;
  event: string;
  apiVersion?: number;
  devMode?: boolean;
  data: {
    id?: string;
    status?: string;
    metadata?: Record<string, string>;
    billing?: {
      id?: string;
      status?: string;
      metadata?: Record<string, string>;
    };
    payment?: {
      id?: string;
      status?: string;
      metadata?: Record<string, string>;
    };
  };
}

export class AbacatePayGateway implements IPaymentGateway {
  private _client: any = null; // AbacatePay() is a FACTORY, not a constructor
  private webhookSecret: string;

  constructor() {
    // Webhook verification/parsing must work even if the API key is absent, so
    // the SDK client is created lazily (see `client`), and only API-calling
    // methods require ABACATEPAY_API_KEY.
    this.webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET || '';
  }

  /** Lazily builds the AbacatePay SDK client. `AbacatePay` is a factory fn. */
  private get client(): any {
    if (this._client) return this._client;

    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      throw new Error('ABACATEPAY_API_KEY environment variable is required');
    }
    // NOTE: AbacatePay is a factory that takes `{ secret }` — NOT `new`, and NOT
    // a positional string (that would leave secret undefined and the SDK would
    // throw "We could not find any AbacatePay secret").
    this._client = AbacatePay({ secret: apiKey });
    return this._client;
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

  /**
   * AbacatePay's primary webhook auth: it appends `?webhookSecret=<secret>` to
   * the configured webhook URL. We compare that against our stored secret in
   * constant time. Returns false if either side is missing/mismatched.
   */
  verifyWebhookSecret(providedSecret: string | null): boolean {
    if (!this.webhookSecret) {
      console.error('SECURITY: ABACATEPAY_WEBHOOK_SECRET not configured - rejecting webhook');
      return false;
    }
    if (!providedSecret) {
      return false;
    }

    const providedBuffer = Buffer.from(providedSecret, 'utf8');
    const expectedBuffer = Buffer.from(this.webhookSecret, 'utf8');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  /**
   * Optional secondary auth: an HMAC-SHA256 of the raw body, delivered in the
   * X-Webhook-Signature header (hex-encoded). Used only if a signature header
   * is present; the query-string secret is the documented primary mechanism.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.error('SECURITY: ABACATEPAY_WEBHOOK_SECRET not configured - rejecting webhook');
      return false;
    }
    if (!signature) {
      return false;
    }

    const normalizedSignature = signature.replace(/^sha256=/i, '').trim();
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    let signatureBuffer: Buffer;
    try {
      signatureBuffer = Buffer.from(normalizedSignature, 'hex');
    } catch {
      return false;
    }
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  parseWebhookEvent(payload: string): PaymentWebhookEvent {
    const parsed: AbacatePayWebhookPayload = JSON.parse(payload);

    const eventTypeMap: Record<string, PaymentWebhookEventType> = {
      'billing.paid': 'billing.paid',
      'billing.expired': 'billing.expired',
      'billing.refunded': 'billing.refunded',
      'billing.created': 'billing.created',
      'BILLING_PAID': 'billing.paid',
      'BILLING_EXPIRED': 'billing.expired',
      'BILLING_REFUNDED': 'billing.refunded',
      'BILLING_CREATED': 'billing.created',
      // v2 checkout event names map to the same lifecycle.
      'checkout.completed': 'billing.paid',
      'checkout.paid': 'billing.paid',
      'checkout.expired': 'billing.expired',
    };

    const eventType = eventTypeMap[parsed.event];
    if (!eventType) {
      // Do NOT silently coerce unknown events into a state mutation. Surface it
      // so the route can ack-and-ignore rather than corrupting payment state.
      throw new UnknownWebhookEventError(parsed.event);
    }

    // The billing object can live at data, data.billing, or data.payment.
    const billing = parsed.data.billing ?? parsed.data.payment ?? parsed.data;

    return {
      type: eventType,
      externalId: billing.id ?? parsed.data.id ?? '',
      metadata: billing.metadata ?? parsed.data.metadata ?? {},
    };
  }

  async refund(externalId: string): Promise<void> {
    console.warn(`Refund not implemented for v2 yet (ID: ${externalId})`);
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