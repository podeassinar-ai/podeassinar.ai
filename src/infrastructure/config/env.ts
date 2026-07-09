/**
 * Centralized environment validation. Import `serverEnv` / `publicEnv` instead of
 * reading process.env ad hoc, so a missing/misconfigured variable fails with ONE
 * clear message instead of an obscure runtime error deep in a request.
 *
 * Required vs optional is intentional: the app must have Supabase + AbacatePay +
 * OpenAI to function; Upstash/Resend/Inngest-Cloud are optional (graceful
 * fallbacks exist).
 */

type EnvShape = Record<string, string | undefined>;

function requireVars(source: EnvShape, keys: string[], context: string): void {
  const missing = keys.filter((key) => !source[key] || source[key]!.trim() === '');
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required ${context} environment variable(s): ${missing.join(', ')}. ` +
        `Set them in .env.local (dev) or your Vercel project settings (prod).`
    );
  }
}

/** Server-only required vars. Throws at first access if any are missing. */
export function assertServerEnv(): void {
  requireVars(
    process.env,
    [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'ABACATEPAY_API_KEY',
      'ABACATEPAY_WEBHOOK_SECRET',
    ],
    'server'
  );
}

/** Public (browser-safe) required vars. */
export function assertPublicEnv(): void {
  requireVars(process.env, ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'], 'public');
}

/**
 * Optional integrations — returns which are configured, for feature gating and
 * clearer logs (never throws).
 */
export function optionalIntegrations() {
  return {
    upstashRateLimit: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ),
    resendEmail: Boolean(process.env.RESEND_API_KEY),
    inngestCloud: Boolean(process.env.INNGEST_EVENT_KEY),
    cron: Boolean(process.env.CRON_SECRET),
  };
}
