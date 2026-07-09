/**
 * Next.js instrumentation hook — runs once when the server process boots.
 * We fail fast here if required server env vars are missing, so misconfiguration
 * surfaces at deploy/boot with one clear message instead of deep inside a request.
 */
export async function register() {
  // Only validate on the Node.js server runtime (not Edge, which lacks some vars
  // and runs a different bundle).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertServerEnv, optionalIntegrations } = await import('@infrastructure/config/env');
    assertServerEnv();

    const integrations = optionalIntegrations();
    const disabled = Object.entries(integrations)
      .filter(([, on]) => !on)
      .map(([name]) => name);
    if (disabled.length > 0) {
      console.warn(`[env] Optional integrations not configured (using fallbacks): ${disabled.join(', ')}`);
    }
  }
}
