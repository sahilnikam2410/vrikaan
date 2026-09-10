/**
 * Shared-secret gate for cron and admin-only handlers.
 * --------------------------------------------------------------
 * The secret is accepted ONLY in the Authorization header. It used to
 * also be read from `?key=`, which leaks it into Vercel access logs,
 * CDN logs, browser history and Referer headers — a URL that grants
 * blog deletion and a 5,000-recipient WhatsApp broadcast should never
 * be recoverable from a log line.
 *
 * Comparison is constant-time; a plain `!==` on a secret leaks length
 * and prefix information to a patient caller.
 *
 * Underscore-prefixed so Vercel does not expose it as a function.
 */
import crypto from "crypto";

/** Constant-time string compare that tolerates length mismatch. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  // timingSafeEqual throws on unequal lengths, so hash first: both
  // digests are 32 bytes, and the compare stays constant-time.
  const hashA = crypto.createHash("sha256").update(bufA).digest();
  const hashB = crypto.createHash("sha256").update(bufB).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * @returns {boolean} true when the request carries the correct CRON_SECRET.
 * Returns false when CRON_SECRET is unset — an unconfigured deployment
 * must not expose these handlers to everyone.
 */
export function hasCronSecret(req) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers?.["authorization"] || "";
  const got = header.replace(/^Bearer\s+/i, "").trim();
  if (!got) return false;
  return safeEqual(got, expected);
}

/**
 * Guard for handler bodies. Writes the 401 and returns false when the
 * caller is not the cron runner:
 *
 *   if (!requireCronSecret(req, res)) return;
 */
export function requireCronSecret(req, res) {
  if (hasCronSecret(req)) return true;
  res.status(401).json({
    error: "Unauthorized",
    hint: "Send the shared secret as `Authorization: Bearer <CRON_SECRET>`. Query parameters are no longer accepted.",
  });
  return false;
}
