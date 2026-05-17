import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToolTier } from "../lib/toolTiers";
import { quotaState, recordUse } from "../lib/quota";

/**
 * useToolQuota — React hook for any Pro tool page.
 *
 *   const { allowed, used, limit, remaining, resetAt, run } = useToolQuota({ path });
 *
 *   <button onClick={() => run(() => doScan())} disabled={!allowed}>
 *
 * Wrap the tool action via `run(fn)` — it records a use *after* `fn` resolves.
 * If quota exhausted, returns allowed=false and run() refuses (returns null).
 */
export function useToolQuota({ path: overridePath } = {}) {
  const { user } = useAuth();
  const location = useLocation();
  const path = overridePath || location.pathname;
  const { tier } = getToolTier(path);
  const userPlan = user?.plan || "free";

  // Recompute on each render so localStorage changes elsewhere reflect here
  const [tick, setTick] = useState(0);
  const state = quotaState({ userPlan, requiredTier: tier, toolPath: path });

  // Auto-refresh at reset time
  useEffect(() => {
    if (!state.resetAt) return;
    const ms = new Date(state.resetAt).getTime() - Date.now();
    if (ms < 0 || ms > 24 * 3600 * 1000) return;
    const id = setTimeout(() => setTick(t => t + 1), ms + 500);
    return () => clearTimeout(id);
  }, [state.resetAt]);

  const run = useCallback(async (fn) => {
    if (state.unlimited) {
      return fn?.();
    }
    if (state.remaining <= 0) {
      return null;
    }
    try {
      const out = await fn?.();
      recordUse(path);
      setTick(t => t + 1);
      return out;
    } catch (err) {
      throw err;
    }
  }, [state.unlimited, state.remaining, path]);

  return {
    tier,
    userPlan,
    unlimited: state.unlimited,
    used: state.used,
    limit: state.limit,
    remaining: state.remaining,
    resetAt: state.resetAt,
    allowed: state.unlimited || state.remaining > 0,
    run,
    /** Force a re-render (e.g. after manual recordUse) */
    refresh: () => setTick(t => t + 1),
    _tick: tick,
  };
}
