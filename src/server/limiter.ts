/**
 * Rate limiting for the two public endpoints.
 *
 * Both spend real money (a Gemini key, a Brevo sending quota) and neither is
 * authenticated, so an unthrottled endpoint is a standing invitation.
 *
 * On Vercel each request may land on a different short-lived instance, so a
 * count kept in memory only limits what one instance sees. Connect an Upstash
 * Redis database (Vercel Marketplace, free tier) and the counts are shared by
 * every instance: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (the
 * KV_REST_API_URL and KV_REST_API_TOKEN names the integration also sets work
 * too). Without it, or if Redis cannot be reached, the in-memory window is used:
 * weaker, never absent.
 */

export class Limited extends Error {
  constructor(readonly retryAfter: number) {
    super("Too many requests. Please wait a moment and try again.");
  }
}

/* ------------------------------------------------------------ the client */

function trustedProxies() {
  const n = Number.parseInt(process.env.TRUSTED_PROXIES ?? "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * The address to rate-limit on.
 *
 * Vercel overwrites X-Forwarded-For and X-Real-IP with the address it actually
 * saw, so on Vercel either can be believed. Anywhere else the header is a list
 * the client can write to: only the last TRUSTED_PROXIES entries came from
 * proxies, and by default (0) it is ignored altogether, so one header can never
 * buy a fresh bucket.
 */
export function clientKey(headers: Headers): string {
  if (process.env.VERCEL) {
    const real = headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0];
    if (real?.trim()) return real.trim();
  }
  const hops = trustedProxies();
  const forwarded = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (hops && forwarded.length) return forwarded.length >= hops ? forwarded[forwarded.length - hops] : forwarded[0];
  return "local";
}

/* ------------------------------------------------------------- in memory */

const hits = new Map<string, number[]>();

function inMemory(key: string, limit: number, windowMs: number, now: number) {
  const bucket = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
  if (bucket.length >= limit) {
    hits.set(key, bucket);
    throw new Limited(Math.max(1, Math.ceil((bucket[0] + windowMs - now) / 1000)));
  }
  bucket.push(now);
  hits.set(key, bucket);

  // Opportunistic cleanup so idle keys do not accumulate for the life of the instance.
  if (hits.size > 2048) {
    for (const [k, v] of hits) if (!v.some((t) => t > now - windowMs)) hits.delete(k);
  }
}

/* ----------------------------------------------------------------- Redis */

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

type Reply = { result?: unknown; error?: string };

async function exec(db: { url: string; token: string }, commands: (string | number)[][]) {
  const res = await fetch(`${db.url}/multi-exec`, {
    method: "POST",
    headers: { Authorization: `Bearer ${db.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands.map((c) => c.map(String))),
    signal: AbortSignal.timeout(1500),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis answered ${res.status}`);
  return (await res.json()) as Reply[];
}

/**
 * A sliding window as a sorted set of timestamps: drop what has aged out, add
 * this request, count. A request over the limit is taken back out, so being
 * refused never pushes the window further away.
 */
async function shared(db: { url: string; token: string }, key: string, limit: number, windowMs: number, now: number) {
  const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;
  const k = `ratelimit:${key}`;
  const replies = await exec(db, [
    ["ZREMRANGEBYSCORE", k, 0, now - windowMs],
    ["ZADD", k, now, member],
    ["ZCARD", k],
    ["ZRANGE", k, 0, 0, "WITHSCORES"],
    ["PEXPIRE", k, windowMs],
  ]);
  const count = Number(replies[2]?.result ?? 0);
  if (count <= limit) return;

  await exec(db, [["ZREM", k, member]]).catch(() => undefined);
  const oldest = Number((replies[3]?.result as string[] | undefined)?.[1] ?? now);
  throw new Limited(Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)));
}

/* ------------------------------------------------------------------- API */

/**
 * Throws `Limited` once `limit` requests have arrived in the window: from this
 * client, or with `perClient: false`, from everyone together. The shared form is
 * a ceiling on total spend that holds however many addresses an abuser has.
 */
export async function enforce(
  headers: Headers,
  { limit, windowSeconds, label, perClient = true }: { limit: number; windowSeconds: number; label: string; perClient?: boolean },
) {
  const key = perClient ? `${label}:${clientKey(headers)}` : `${label}:*`;
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const db = redis();

  if (db) {
    try {
      await shared(db, key, limit, windowMs, now);
      return;
    } catch (err) {
      if (err instanceof Limited) throw err;
      console.warn("Rate limit store unreachable, counting in memory:", (err as Error).message);
    }
  }
  inMemory(key, limit, windowMs, now);
}

/** The response for a refused request: 429, with how long to wait. */
export function limitedResponse(err: Limited) {
  return Response.json(
    { detail: err.message },
    { status: 429, headers: { "Retry-After": String(err.retryAfter) } },
  );
}
