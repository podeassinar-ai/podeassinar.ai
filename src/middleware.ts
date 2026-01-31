import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultRateLimiters } from '@infrastructure/services/rate-limiter';

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIp(request);
    
    let limiter = defaultRateLimiters.api;
    let limitKey = `api:${clientIp}`;

    if (pathname.includes('/auth/')) {
      limiter = defaultRateLimiters.auth;
      limitKey = `auth:${clientIp}`;
    } else if (pathname.includes('/webhook')) {
      limiter = defaultRateLimiters.webhook;
      limitKey = `webhook:${clientIp}`;
    }

    const result = await limiter.check(limitKey);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toISOString(),
            'Retry-After': String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
