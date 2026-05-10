/**
 * Pure helpers extracted from the AI feature pipeline so they can be
 * unit-tested without React, jsdom, Firestore, or a live network call.
 */

/**
 * Build the verdict-meta record (color + emoji + label) used by both
 * the scam-check and deepfake-audio result panels.
 *
 * Centralised so a single change cascades everywhere.
 */
export const SCAM_VERDICTS = ["safe", "suspicious", "dangerous"];
export const DEEPFAKE_VERDICTS = ["likely-real", "likely-deepfake", "scam-script", "uncertain"];

/**
 * Coerce an arbitrary score value to an int in [0, 100].
 * Handles strings, undefined, negatives, > 100, and NaN.
 */
export function clampScore(raw) {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

/**
 * Try to extract a strict JSON object from a Gemini response that may
 * be wrapped in ```json ``` fences or contain prose around the object.
 *
 * Returns null on any failure — never throws.
 */
export function tryParseJson(text) {
  if (!text || typeof text !== "string") return null;
  let s = text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```\s*$/, "");
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  try { return JSON.parse(s); } catch { return null; }
}

/**
 * Strip markdown formatting from a string before sending it to a
 * speech-synthesis engine. Bold, italics, code, links, and headings
 * disappear; newlines collapse to short pauses.
 */
export function stripMarkdownForSpeech(text) {
  return String(text || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")     // **bold**
    .replace(/[*_`#>]/g, "")               // bare markdown chars
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link](url) → link
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, ". ")                 // line breaks → pause
    .replace(/\s{2,}/g, " ")               // collapse whitespace
    .trim();
}

/**
 * Decide which colour + emoji + label to show for a scam-check verdict.
 * Falls back to "suspicious" for unknown verdict strings.
 */
export const SCAM_VERDICT_META = {
  safe:       { color: "#22c55e", emoji: "✅", label: "Looks safe" },
  suspicious: { color: "#fbbf24", emoji: "⚠️", label: "Suspicious" },
  dangerous:  { color: "#ef4444", emoji: "🚨", label: "Dangerous — likely scam" },
};

export function scamVerdictMeta(verdict) {
  return SCAM_VERDICT_META[verdict] || SCAM_VERDICT_META.suspicious;
}
