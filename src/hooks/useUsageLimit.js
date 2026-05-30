import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { checkAndTrackUsage } from "../services/usageLimiter";

/**
 * Hook to check and enforce usage limits before running a tool.
 * Usage:
 *   const { checkLimit, limitError, clearLimitError } = useUsageLimit("breach");
 *   const run = async () => {
 *     const ok = await checkLimit();
 *     if (!ok) return; // limitError will be set
 *     // proceed with tool
 *   };
 */
export function useUsageLimit(toolId) {
  const { user } = useAuth();
  const [limitError, setLimitError] = useState(null);
  // Structured upgrade trigger (audit #18) — tools can render a real
  // "Upgrade to Pro" CTA + remaining-uses nudge, not just a flat error string.
  const [limitInfo, setLimitInfo] = useState(null);

  const checkLimit = useCallback(async () => {
    if (!user?.uid) {
      setLimitError("Please log in to use this tool.");
      setLimitInfo({ reason: "auth", cta: "Sign in", href: "/login" });
      return false;
    }
    const plan = user.plan || "free";
    const result = await checkAndTrackUsage(user.uid, plan, toolId);
    if (!result.allowed) {
      setLimitError(
        `Daily ${result.category} limit reached (${result.limit}/${result.limit}). Upgrade your plan for more.`
      );
      setLimitInfo({
        reason: "quota",
        category: result.category,
        limit: result.limit,
        used: result.limit,
        cta: plan === "free" ? "Upgrade to Pro — ₹99/mo" : "Upgrade plan",
        href: "/pricing",
      });
      return false;
    }
    setLimitError(null);
    setLimitInfo(
      // Surface a soft nudge while quota still remaining (e.g. "2 of 3 left today")
      typeof result.remaining === "number" && result.remaining <= 1 && (user.plan || "free") === "free"
        ? { reason: "low", remaining: result.remaining, category: result.category, cta: "Go unlimited — ₹99/mo", href: "/pricing" }
        : null
    );
    return true;
  }, [user, toolId]);

  const clearLimitError = useCallback(() => { setLimitError(null); setLimitInfo(null); }, []);

  return { checkLimit, limitError, limitInfo, clearLimitError };
}
