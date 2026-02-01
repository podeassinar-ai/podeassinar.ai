declare module '@abacatepay/sdk' {
  interface CustomerCreateParams {
    email: string;
    name: string;
    cellphone: string;
    taxId: string;
  }

  interface CustomerResponse {
    data: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface BillingProduct {
    externalId: string;
    name: string;
    quantity: number;
    price: number;
  }

  interface BillingCreateParams {
    frequency: 'ONE_TIME' | 'MULTIPLE';
    methods: ('PIX' | 'CREDIT_CARD')[];
    products: BillingProduct[];
    metadata?: Record<string, string>;
    customerId: string;
    returnUrl: string;
    completionUrl: string;
  }

  interface BillingResponse {
    data: {
      id: string;
      url: string;
      status: string;
    };
  }

  interface Customers {
    create(params: CustomerCreateParams): Promise<CustomerResponse>;
  }

  interface Billing {
    create(params: BillingCreateParams): Promise<BillingResponse>;
    refund(billingId: string): Promise<void>;
  }

  export class AbacatePay {
    customers: Customers;
    billing: Billing;
    constructor(apiKey: string);
  }
}
