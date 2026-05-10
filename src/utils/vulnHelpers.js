/**
 * Pure helpers extracted from the vulnerability scanner so they can be
 * unit-tested without spinning up Vercel, Firestore, or any HTTP call.
 */

export const SEVERITY_RANK = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

/** Return numeric rank for a severity string. Unknown → 0. */
export function severityRank(s) {
  return SEVERITY_RANK[s] ?? 0;
}

/** Pick the higher of two severity strings. */
export function maxSeverity(a, b) {
  return severityRank(a) >= severityRank(b) ? a : b;
}

/** Convert numeric score (0-100) to letter grade A-F. */
export function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Compute total deduction given an array of check results. */
export function computeDeduction(checks) {
  let d = 0;
  for (const c of checks || []) {
    if (c.severity === "critical") d += 25;
    else if (c.severity === "high") d += 12;
    else if (c.severity === "medium") d += 6;
    else if (c.severity === "low") d += 2;
  }
  return d;
}

/** Compute a score from a list of checks. Floored at 0. */
export function scoreFromChecks(checks) {
  return Math.max(0, 100 - computeDeduction(checks));
}

/**
 * Normalize raw user input ("example.com", "https://x.com", "x.com/path") to
 * { origin, hostname, fullUrl }. Returns null on invalid input.
 */
export function normalizeTarget(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch { return null; }
  if (!url.hostname.includes(".")) return null;
  return {
    origin: url.origin,
    hostname: url.hostname.replace(/^www\./, ""),
    fullUrl: url.toString(),
  };
}

/**
 * Identify "risky" subdomains from a list — anything containing dev/staging/
 * test/internal/admin/qa/sandbox/preview/beta as a token in any subdomain
 * label.
 */
const RISKY_SUB_KEYWORDS = ["dev", "staging", "test", "uat", "internal", "admin", "qa", "sandbox", "preview", "beta"];

export function findRiskySubdomains(subs, host) {
  return (subs || []).filter((s) => {
    if (!s.endsWith(host)) return false;
    const sub = s.replace(`.${host}`, "");
    return RISKY_SUB_KEYWORDS.some((k) => sub.split(".").some((part) => part === k || part.startsWith(`${k}-`) || part.endsWith(`-${k}`)));
  });
}
