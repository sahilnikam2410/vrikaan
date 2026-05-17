import { auth } from "../firebase/config";

/**
 * apiFetch — `fetch` wrapper that auto-injects the current Firebase ID token
 * as `Authorization: Bearer <jwt>`. Backend api/tools.js uses it to resolve
 * the caller's plan (free / pro / enterprise) for server-side tier gating.
 *
 * Usage — identical to native fetch:
 *   const res = await apiFetch("/api/tools?tool=scam-check", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ text }),
 *   });
 *
 * Falls through to plain fetch (no Authorization header) when:
 *   - User is logged out
 *   - getIdToken() throws (network blip)
 *   - Caller passed an explicit Authorization header (we don't override)
 */
export async function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const alreadyAuthed = headers.has("authorization") || headers.has("Authorization");

  if (!alreadyAuthed && auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken(/* forceRefresh */ false);
      if (idToken) headers.set("Authorization", `Bearer ${idToken}`);
    } catch {
      // ignore — fall through w/o auth
    }
  }

  return fetch(input, { ...init, headers });
}

/**
 * Helper: read tier-rejection metadata from a failed response.
 * Returns null if response is OK or not a tier rejection.
 *   { code: "TIER_QUOTA_EXHAUSTED" | "TIER_ENTERPRISE_REQUIRED",
 *     requiredTier, used, limit, upgradeUrl }
 */
export async function parseTierError(res) {
  if (res.ok) return null;
  if (res.status !== 402) return null;
  try {
    const body = await res.clone().json();
    if (body?.code?.startsWith?.("TIER_")) return body;
  } catch {}
  return null;
}
