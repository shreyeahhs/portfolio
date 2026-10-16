/**
 * Health check, for uptime monitors and keep-alive pings (FastCron hits this).
 *
 * Cheap on purpose: it never calls Gemini or Brevo and is not rate limited, so a
 * ping every minute costs nothing. It reports whether each feature has the
 * configuration it needs, without revealing any of it. Always 200 while the app
 * is up, so a pinger never gives up on it; "degraded" means a feature is missing
 * its settings and will refuse requests until they are added in Vercel.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function checks() {
  return {
    chat: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    contact: Boolean(process.env.BREVO_API_KEY && process.env.CONTACT_FROM_EMAIL && process.env.CONTACT_TO_EMAIL),
    sharedRateLimits: Boolean(
      (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
        (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN),
    ),
  };
}

export function GET() {
  const c = checks();
  return Response.json(
    { status: c.chat && c.contact ? "ok" : "degraded", time: new Date().toISOString(), checks: c },
    { headers: NO_STORE },
  );
}

/** Some monitors only send HEAD. Same answer, no body. */
export function HEAD() {
  return new Response(null, { headers: NO_STORE });
}
