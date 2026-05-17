/**
 * Daily free-tier quota for Pro tools.
 *
 * Free users get 3 uses per Pro tool per day. After that, the tool shows the
 * UpgradeModal instead of running. Resets at local midnight.
 *
 * Storage: localStorage. Not server-trusted (client-side gate only). Backend
 * tier enforcement in api/tools.js handles bypass attempts via curl.
 *
 * Public API:
 *   quotaState(planTier, requiredTier, toolPath) -> {
 *     unlimited, used, limit, remaining, resetAt
 *   }
 *   recordUse(toolPath)            // call after successful tool run
 *   FREE_TOOL_LIMIT_PER_DAY = 3
 */

const KEY = "vrk_quota_v1";
export const FREE_TOOL_LIMIT_PER_DAY = 3;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) || {};
    // Garbage-collect stale days
    const today = todayISO();
    const fresh = {};
    for (const [path, rec] of Object.entries(parsed)) {
      if (rec?.day === today) fresh[path] = rec;
    }
    return fresh;
  } catch { return {}; }
}

function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

function midnightISO() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
}

/**
 * Check current quota for a given tool given the user's plan vs the tool's tier.
 *
 *   - If user's plan satisfies the tool's tier → unlimited: true
 *   - If user is free and tool is pro/enterprise → enforce daily limit
 *
 * Always safe to call (no side-effects). Use recordUse() after the tool runs.
 */
export function quotaState({ userPlan = "free", requiredTier = "free", toolPath = "" } = {}) {
  // Free tools or higher-than-required plan → no quota
  if (requiredTier === "free") {
    return { unlimited: true, used: 0, limit: Infinity, remaining: Infinity, resetAt: null };
  }
  const TIER_LEVEL = { free: 0, pro: 1, enterprise: 2 };
  const u = TIER_LEVEL[userPlan] ?? 0;
  const r = TIER_LEVEL[requiredTier] ?? 0;
  if (u >= r) {
    return { unlimited: true, used: 0, limit: Infinity, remaining: Infinity, resetAt: null };
  }

  // Enterprise-required tools have NO free quota (enterprise must subscribe)
  if (requiredTier === "enterprise") {
    return { unlimited: false, used: 0, limit: 0, remaining: 0, resetAt: midnightISO() };
  }

  // Free user vs Pro tool → daily limit
  const state = load();
  const used = state[toolPath]?.count || 0;
  const limit = FREE_TOOL_LIMIT_PER_DAY;
  return {
    unlimited: false,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: midnightISO(),
  };
}

/**
 * Record one use of a tool. Call after the tool's main action completes
 * successfully (e.g. after a scan returns). Idempotent re-calls bump the count.
 */
export function recordUse(toolPath) {
  if (!toolPath) return;
  const state = load();
  const cur = state[toolPath]?.count || 0;
  state[toolPath] = { day: todayISO(), count: cur + 1 };
  save(state);
}

/**
 * Pretty time-until-reset string. Returns "in 4h 12m" / "in 38 min" / "soon".
 */
export function timeUntilReset(resetAtISO) {
  if (!resetAtISO) return "";
  const now = Date.now();
  const reset = new Date(resetAtISO).getTime();
  const ms = reset - now;
  if (ms < 60_000) return "in <1 min";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `in ${hrs}h ${remMins}m`;
}
