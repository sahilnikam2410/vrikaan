/**
 * Durable, shared quota counters.
 *
 * The old counter was a module-level Map. On Vercel that is per-lambda-instance
 * and dies on cold start, so a documented "3 free uses per day" was in practice
 * unbounded — a caller only had to spread requests across instances. Counters
 * now live in Firestore at /quotas/{day_tool_scope} and are incremented inside
 * a transaction, so every instance sees the same number.
 *
 * Underscore-prefixed so Vercel ignores it as a function.
 */
import crypto from "node:crypto";

// In-memory fallback, used ONLY when the Admin SDK is unavailable (missing
// FIREBASE_SERVICE_ACCOUNT). Same weak guarantees as before — better than
// letting a config gap take the endpoint down entirely.
const _memCounter = new Map();

const day = () => new Date().toISOString().slice(0, 10);
// Scope can be a uid or a raw IP — hash it so we don't store IPs in plaintext.
const scopeHash = (scope) =>
  crypto.createHash("sha256").update(String(scope)).digest("hex").slice(0, 32);

function quotaDocId(scope, tool) {
  return `${day()}_${String(tool).replace(/[^a-z0-9-]/gi, "")}_${scopeHash(scope)}`;
}

/**
 * Read the current usage without consuming any.
 * @returns {Promise<{used:number, limit:number, remaining:number}>}
 */
export async function peekQuota(fs, scope, tool, limit) {
  if (!fs) {
    const used = _memCounter.get(quotaDocId(scope, tool)) || 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  }
  try {
    const snap = await fs.collection("quotas").doc(quotaDocId(scope, tool)).get();
    const used = snap.exists ? snap.data().used || 0 : 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  } catch {
    return { used: 0, limit, remaining: limit };
  }
}

/**
 * Atomically consume one unit if the caller is under `limit`.
 * Returns allowed:false (and does not increment) once the limit is reached.
 *
 * `expiresAt` is set so a Firestore TTL policy on the `quotas` collection can
 * reap yesterday's docs — without one, the collection grows forever.
 *
 * @returns {Promise<{allowed:boolean, used:number, limit:number, remaining:number}>}
 */
export async function consumeQuota(fs, scope, tool, limit) {
  const id = quotaDocId(scope, tool);

  if (!fs) {
    const used = _memCounter.get(id) || 0;
    if (used >= limit) return { allowed: false, used, limit, remaining: 0 };
    _memCounter.set(id, used + 1);
    return { allowed: true, used: used + 1, limit, remaining: limit - used - 1 };
  }

  const ref = fs.collection("quotas").doc(id);
  try {
    return await fs.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const used = snap.exists ? snap.data().used || 0 : 0;
      if (used >= limit) return { allowed: false, used, limit, remaining: 0 };
      tx.set(ref, {
        used: used + 1,
        tool,
        day: day(),
        // 48h out — covers the day boundary in every timezone we serve.
        expiresAt: new Date(Date.now() + 172800000),
      }, { merge: true });
      return { allowed: true, used: used + 1, limit, remaining: limit - used - 1 };
    });
  } catch (e) {
    console.error("quota:", e.message);
    // Transaction failed (contention, transient outage). Don't hand out a free
    // pass — treat as exhausted so the ceiling still means something.
    return { allowed: false, used: limit, limit, remaining: 0 };
  }
}

/** Caller identity for quota scoping: uid when known, else client IP. */
export function quotaScope(req, uid) {
  if (uid) return `uid:${uid}`;
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "ip-unknown")
    .split(",")[0].trim();
  return `ip:${ip}`;
}
