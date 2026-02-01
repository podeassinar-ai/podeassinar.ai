import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface IRateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements IRateLimiter {
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

export class UpstashRateLimiter implements IRateLimiter {
  private ratelimit: Ratelimit;
  private windowMs: number;

  constructor(config: RateLimitConfig) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const windowSeconds = Math.ceil(config.windowMs / 1000);
    this.windowMs = config.windowMs;

    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSeconds} s`),
      analytics: true,
      prefix: 'podeassinar',
    });
  }

  async check(key: string): Promise<RateLimitResult> {
    const { success, remaining, reset } = await this.ratelimit.limit(key);

    return {
      allowed: success,
      remaining,
      resetAt: new Date(reset),
    };
  }
}

function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function createRateLimiter(config: RateLimitConfig): IRateLimiter {
  if (isUpstashConfigured()) {
    return new UpstashRateLimiter(config);
  }
  return new InMemoryRateLimiter(config);
}

export const defaultRateLimiters = {
  api: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
  }),
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),
  webhook: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),
};
