declare module '@abacatepay/sdk' {
  // NOTE: The real @abacatepay/sdk ships no type declarations. This ambient
  // module matches the RUNTIME shape: `AbacatePay` is a FACTORY function that
  // takes `{ secret }` and returns a client exposing resource namespaces. It is
  // NOT a class — calling it with `new` throws at runtime.

  interface AbacatePayFactoryOptions {
    secret: string;
    rest?: unknown;
  }

  // The returned client exposes: rest, customers, checkouts, pix, coupons,
  // store, mrr, payouts, subscriptions, products. We type it loosely because
  // the gateway wraps it and maps the responses itself.
  interface AbacatePayClient {
    customers: Record<string, (...args: any[]) => Promise<any>>;
    checkouts: Record<string, (...args: any[]) => Promise<any>>;
    pix: Record<string, (...args: any[]) => Promise<any>>;
    store: Record<string, (...args: any[]) => Promise<any>>;
    mrr: Record<string, (...args: any[]) => Promise<any>>;
    coupons: Record<string, (...args: any[]) => Promise<any>>;
    payouts: Record<string, (...args: any[]) => Promise<any>>;
    subscriptions: Record<string, (...args: any[]) => Promise<any>>;
    products: Record<string, (...args: any[]) => Promise<any>>;
    rest: unknown;
    [key: string]: unknown;
  }

  export function AbacatePay(options: AbacatePayFactoryOptions): AbacatePayClient;

  export class AbacatePayError extends Error {}
  export class HTTPError extends Error {}
  export const version: string;
}
