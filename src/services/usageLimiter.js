import { apiFetch } from "../lib/apiFetch";

/**
 * Daily usage limits per plan tier.
 *
 * These values are for DISPLAY ONLY — "3 of 5 left today". Whether a run is
 * allowed is decided server-side (api/tools.js usage-consume), and
 * usage/{uid}_{date} is write-protected in firestore.rules. Keep this table in
 * sync with USAGE_PLAN_LIMITS in api/tools.js; drift shows up as a wrong
 * remaining-count in the UI, never as a wrong verdict.
 */
const PLAN_LIMITS = {
  free:       { scan: 5,  lookup: 10, ai: 3,  export: 2  },
  family:     { scan: 100, lookup: 200, ai: 50, export: 50 },
  starter:    { scan: 25, lookup: 50, ai: 20, export: 10 },
  standard:   { scan: 25, lookup: 50, ai: 20, export: 10 },
  pro:        { scan: 100, lookup: 200, ai: 50, export: 50 },
  advanced:   { scan: 100, lookup: 200, ai: 50, export: 50 },
  enterprise: { scan: -1, lookup: -1, ai: -1, export: -1 }, // unlimited
};

/**
 * Map tool names to usage categories.
 */
const TOOL_CATEGORY = {
  "breach":            "scan",
  "security-headers":  "scan",
  "ssl":               "scan",
  "security-audit":    "scan",
  "vulnerability":     "scan",
  "file-hash":         "scan",
  "whois":             "lookup",
  "ip-lookup":         "lookup",
  "dns-leak":          "lookup",
  "email-analyzer":    "lookup",
  "dark-web":          "scan",
  "fraud-analyzer":    "ai",
  "ai-chat":           "ai",
  "phishing-trainer":  "lookup",
  "browser-fingerprint": "lookup",
  "qr-scanner":        "lookup",
  "password-checker":  "lookup",
  "export-pdf":        "export",
};

/**
 * Check if the user can use a tool, and increment usage if allowed.
 * @param {string} uid - User's Firebase UID
 * @param {string} plan - User's current plan
 * @param {string} toolId - The tool being used (key from TOOL_CATEGORY)
 * @returns {{ allowed: boolean, remaining: number, limit: number, category: string }}
 */
export async function checkAndTrackUsage(uid, plan, toolId) {
  const category = TOOL_CATEGORY[toolId] || "lookup";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const dailyLimit = limits[category];

  // Unlimited
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1, limit: -1, category };
  }

  try {
    // Check and increment happen together, in a Firestore transaction on the
    // server. Doing both here — against a document the rules let the owner
    // write — meant the limit could be reset, or skipped entirely.
    const res = await apiFetch("/api/tools?tool=usage-consume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId }),
    });
    const out = await res.json().catch(() => ({}));

    if (res.status === 402) {
      return { allowed: false, remaining: 0, limit: out.limit ?? dailyLimit, category: out.category || category };
    }
    if (!res.ok) throw new Error(out.error || "usage-consume failed");

    return {
      allowed: out.allowed !== false,
      remaining: out.remaining ?? dailyLimit,
      limit: out.limit ?? dailyLimit,
      category: out.category || category,
    };
  } catch (err) {
    console.warn("Usage tracking error:", err);
    // Allow on transport error so a network blip doesn't block a paying user.
    // The tool's own /api/tools call still enforces the tier gate.
    return { allowed: true, remaining: dailyLimit, limit: dailyLimit, category };
  }
}

/**
 * Get current usage stats for a user today.
 *
 * Read-only, and read from the server: the counters live in the `quotas`
 * collection now, keyed by a hash the client can't reconstruct, so reading
 * usage/{uid}_{date} directly would always come back empty.
 *
 * @param {string} uid
 * @param {string} plan
 * @returns {object} { scan: { used, limit }, lookup: { used, limit }, ai: { used, limit }, export: { used, limit } }
 */
export async function getUsageStats(uid, plan) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const empty = {
    scan:   { used: 0, limit: limits.scan },
    lookup: { used: 0, limit: limits.lookup },
    ai:     { used: 0, limit: limits.ai },
    export: { used: 0, limit: limits.export },
  };
  if (!uid) return empty;

  try {
    const res = await apiFetch("/api/tools?tool=usage-read");
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      scan:   { used: data.scan?.used || 0,   limit: data.scan?.limit ?? limits.scan },
      lookup: { used: data.lookup?.used || 0, limit: data.lookup?.limit ?? limits.lookup },
      ai:     { used: data.ai?.used || 0,     limit: data.ai?.limit ?? limits.ai },
      export: { used: data.export?.used || 0, limit: data.export?.limit ?? limits.export },
    };
  } catch {
    return empty;
  }
}

export { PLAN_LIMITS, TOOL_CATEGORY };
