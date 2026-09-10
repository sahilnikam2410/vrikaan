// In-memory rate limiter — IP and per-user buckets.
// NOTE: Serverless cold starts reset this map. For stricter cross-invocation
// limits, back this with Upstash Redis or Vercel KV.

const ipBucket = new Map();
const userBucket = new Map();

// Periodic cleanup so maps don't grow unbounded in long-lived instances.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function maybeCleanup(now) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [k, v] of ipBucket) {
    if (now - v.start > v.windowMs) ipBucket.delete(k);
  }
  for (const [k, v] of userBucket) {
    if (now - v.start > v.windowMs) userBucket.delete(k);
  }
}

function checkBucket(bucket, key, limit, windowMs) {
  const now = Date.now();
  maybeCleanup(now);
  const record = bucket.get(key);

  if (!record || now - record.start > windowMs) {
    bucket.set(key, { start: now, count: 1, windowMs });
    return { allowed: true, remaining: limit - 1, limit, windowMs };
  }

  record.count++;
  if (record.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      windowMs,
      retryAfter: Math.ceil((record.start + windowMs - now) / 1000),
    };
  }

  return { allowed: true, remaining: limit - record.count, limit, windowMs };
}

/**
 * IP-based rate limit. Default: 30 requests per minute.
 */
export function checkRateLimit(ip, limit = 30, windowMs = 60000) {
  return checkBucket(ipBucket, `ip:${ip}`, limit, windowMs);
}

/**
 * User-based rate limit (by uid). Default: 60 per minute (higher than IP
 * because a user might be on a shared IP — home / office / mobile).
 * Skips limiting when uid is falsy (anonymous request — fall back to IP limit).
 */
export function checkUserRateLimit(uid, limit = 60, windowMs = 60000) {
  if (!uid) return { allowed: true, remaining: limit, limit, windowMs, skipped: true };
  return checkBucket(userBucket, `u:${uid}`, limit, windowMs);
}

/**
 * Convenience: apply both IP and (optional) user limits. Returns the stricter
 * result so callers get one decision. Sets Retry-After when available.
 *
 * Usage in a handler:
 *   const decision = applyRateLimit(req, { ipLimit: 20, userLimit: 60 });
 *   if (!decision.allowed) return res.status(429).json({ error: ..., retryAfter: decision.retryAfter });
 */
export function applyRateLimit(
  req,
  { ipLimit = 30, userLimit = 60, windowMs = 60000, uid: verifiedUid = null } = {}
) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  // The uid MUST come from the caller the dispatcher already verified, never
  // from the request itself. An `x-user-id` header is attacker-chosen:
  // rotating it handed out a fresh bucket every call, and setting it to
  // someone else's uid burned that user's allowance for them.
  const uid = verifiedUid || null;

  const ipResult = checkRateLimit(ip, ipLimit, windowMs);
  const userResult = checkUserRateLimit(uid, userLimit, windowMs);

  // If either bucket denies, return the one with the longest retryAfter.
  if (!ipResult.allowed || !userResult.allowed) {
    const worst = [ipResult, userResult]
      .filter((r) => !r.allowed)
      .reduce((a, b) => ((b.retryAfter || 0) > (a.retryAfter || 0) ? b : a));
    return { ...worst, ip, uid };
  }

  return {
    allowed: true,
    remaining: Math.min(ipResult.remaining, userResult.remaining),
    ip,
    uid,
  };
}
