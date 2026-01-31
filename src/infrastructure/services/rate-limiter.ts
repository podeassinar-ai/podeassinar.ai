export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.config.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: new Date(resetAt),
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt),
      };
    }

    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetAt: new Date(entry.resetAt),
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

export const defaultRateLimiters = {
  api: new InMemoryRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
  }),
  auth: new InMemoryRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),
  webhook: new InMemoryRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),
};
