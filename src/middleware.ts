import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

  // 1. Rate Limiting for API
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
    // Continue to next steps (Auth) for API or return? 
    // Usually API routes are also protected by Auth, so we continue.
    // However, rate limiter sets headers on response. We need to carry them over.
    // For simplicity, we'll let the response be created later and just check rate limit here.
  }

  // 2. Supabase Auth & Protected Routes
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/diagnostico', '/documentos', '/meus-diagnosticos', '/perfil'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Add Rate Limit headers if it was an API request
  if (pathname.startsWith('/api/')) {
    // We'd need to re-run check or pass result? 
    // Since we didn't return above, we can assume allowed.
    // To keep it clean, we skip adding headers here for now as response object was recreated.
    // Ideally we merge them.
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
