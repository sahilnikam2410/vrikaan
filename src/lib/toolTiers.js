/**
 * Central tool-tier registry.
 *
 * Each entry maps a route path → { tier, name }.
 *
 * Tiers (rising in privilege):
 *   - "free"        — anyone (logged-in or out)
 *   - "pro"         — paid Pro plan (₹990/yr) or 7-day trial active
 *   - "enterprise"  — Enterprise plan only
 *
 * Used by:
 *   - Footer SmartToolLink — render tier badge + intercept clicks for non-eligible users
 *   - TierGate component  — wrap tool pages, hard-gate access at page level
 *   - Navbar Tools dropdown (future) — same logic
 */

export const TIERS = ["free", "pro", "family", "enterprise"];
// family = same access level as pro (all Pro tools) plus family-specific features.
const TIER_LEVEL = { free: 0, starter: 0, pro: 1, family: 1, enterprise: 2 };

/**
 * Check if a user's plan satisfies the required tier.
 * Treats null/undefined user-plan as "free".
 */
export function userMeetsTier(userPlan, requiredTier) {
  const u = TIER_LEVEL[userPlan || "free"] ?? 0;
  const r = TIER_LEVEL[requiredTier || "free"] ?? 0;
  return u >= r;
}

/** Human-friendly tier label */
export function tierLabel(tier) {
  if (tier === "pro") return "PRO";
  if (tier === "family") return "FAMILY";
  if (tier === "enterprise") return "ENTERPRISE";
  return "FREE";
}

/** Tier brand color (cyan free, indigo pro, pink family, gold enterprise) */
export function tierColor(tier) {
  if (tier === "pro") return "#6366F1";
  if (tier === "family") return "#EC4899";
  if (tier === "enterprise") return "#EAB308";
  return "#14b8a6";
}

// ── Tool registry ────────────────────────────────────────────────────
// Use lowercase paths. Wildcards allowed via trailing "*" (e.g. "/admin/*").
export const TOOL_TIERS = {
  // ── FREE TIER (educational, low-cost, public utility) ──
  "/threat-map":           { tier: "free", name: "Threat Map" },
  "/threats":              { tier: "free", name: "Threat Directory" },
  "/cyber-news":           { tier: "free", name: "Cyber News" },
  "/learn":                { tier: "free", name: "Learn Academy" },
  "/blog":                 { tier: "free", name: "Blog" },
  "/security-checklist":   { tier: "free", name: "Security Checklist" },
  "/scam-database":        { tier: "free", name: "Scam Database" },
  "/emergency-help":       { tier: "free", name: "Emergency Help" },
  "/2fa-guide":            { tier: "free", name: "2FA Setup Guide" },
  "/phishing-trainer":     { tier: "free", name: "Phishing Trainer" },
  "/password-checker":     { tier: "free", name: "Password Checker" },
  "/risk-score":           { tier: "free", name: "Cyber Risk Score" },
  "/cyber-risk":           { tier: "free", name: "Cyber Risk Score" },
  "/security-checkup":     { tier: "free", name: "Cyber Risk Score" },
  "/ip-lookup":            { tier: "free", name: "IP Lookup" },
  "/whois-lookup":         { tier: "free", name: "WHOIS Lookup" },
  "/qr-scanner":           { tier: "free", name: "QR Scanner" },
  "/dns-leak-test":        { tier: "free", name: "DNS Leak Test" },
  "/browser-fingerprint":  { tier: "free", name: "Browser Fingerprint" },
  "/referral":             { tier: "free", name: "Refer & Earn" },
  "/aadhaar-mask":         { tier: "free", name: "Aadhaar Mask Tool" },
  "/aadhaar-mask-tool":    { tier: "free", name: "Aadhaar Mask Tool" },
  "/festival-fraud":       { tier: "free", name: "Festival Fraud Forecast" },
  "/festival-fraud-forecast": { tier: "free", name: "Festival Fraud Forecast" },
  "/scam-recovery":        { tier: "free", name: "Scam Recovery Hotline" },
  "/hacked":               { tier: "free", name: "Scam Recovery Hotline" },
  "/scammed":              { tier: "free", name: "Scam Recovery Hotline" },
  "/recovery":             { tier: "free", name: "Scam Recovery Hotline" },
  "/safe-word":            { tier: "free", name: "Family Safe-Word Vault" },
  "/family-safe-word":     { tier: "free", name: "Family Safe-Word Vault" },
  "/safeword-vault":       { tier: "free", name: "Family Safe-Word Vault" },
  "/whatsapp-audit":       { tier: "free", name: "WhatsApp Group Auditor" },
  "/group-audit":          { tier: "free", name: "WhatsApp Group Auditor" },
  "/whatsapp-group-audit": { tier: "free", name: "WhatsApp Group Auditor" },
  "/receipt-audit":        { tier: "free", name: "Receipt Authenticity" },
  "/bill-check":           { tier: "free", name: "Receipt Authenticity" },
  "/desktop":              { tier: "free", name: "VRIKAAN Desktop" },
  "/download":             { tier: "free", name: "VRIKAAN Desktop" },
  "/desktop-app":          { tier: "free", name: "VRIKAAN Desktop" },
  "/otp-decay":            { tier: "free", name: "OTP Decay Emergency" },
  "/shared-otp":           { tier: "free", name: "OTP Decay Emergency" },
  "/block-card":           { tier: "free", name: "OTP Decay Emergency" },
  "/upi-lookup":           { tier: "free", name: "UPI Scam Lookup" },
  "/upi-check":            { tier: "free", name: "UPI Scam Lookup" },
  "/voiceprint":           { tier: "free", name: "Voiceprint Vault" },
  "/voiceprint-vault":     { tier: "free", name: "Voiceprint Vault" },
  "/stolen-phone":         { tier: "free", name: "Stolen Phone Recovery" },
  "/lost-phone":           { tier: "free", name: "Stolen Phone Recovery" },
  "/phone-stolen":         { tier: "free", name: "Stolen Phone Recovery" },
  "/loan-app-check":       { tier: "free", name: "Loan App Profiler" },
  "/loan-app-profiler":    { tier: "free", name: "Loan App Profiler" },
  "/check-loan-app":       { tier: "free", name: "Loan App Profiler" },
  "/responsible-disclosure":{ tier: "free", name: "Responsible Disclosure" },
  "/bug-bounty":           { tier: "free", name: "Responsible Disclosure" },
  "/security/hall-of-fame":{ tier: "free", name: "Security Hall of Fame" },
  "/hall-of-fame":         { tier: "free", name: "Security Hall of Fame" },
  "/hi":                   { tier: "free", name: "VRIKAAN हिन्दी" },
  "/hindi":                { tier: "free", name: "VRIKAAN हिन्दी" },
  "/in":                   { tier: "free", name: "VRIKAAN हिन्दी" },
  "/enterprise":           { tier: "free", name: "Enterprise SOC" },
  "/soc-services":         { tier: "free", name: "Enterprise SOC" },
  "/business":             { tier: "free", name: "Enterprise SOC" },
  "/pricing":              { tier: "free", name: "Pricing" },
  "/about":                { tier: "free", name: "About" },
  "/founder":              { tier: "free", name: "Founder" },
  "/contact":              { tier: "free", name: "Contact" },
  "/careers":              { tier: "free", name: "Careers" },
  "/press":                { tier: "free", name: "Press" },
  "/features":             { tier: "free", name: "Features" },
  "/status":               { tier: "free", name: "Status" },
  "/dashboard":            { tier: "free", name: "Dashboard" },
  "/user-dashboard":       { tier: "free", name: "Profile" },
  "/family":               { tier: "free", name: "Family Dashboard" },
  "/family-dashboard":     { tier: "free", name: "Family Dashboard" },
  "/parent-dashboard":     { tier: "free", name: "Family Dashboard" },

  // ── PRO TIER (AI-heavy, data-heavy, deeper protection) ──
  "/fraud-analyzer":         { tier: "pro", name: "Fraud Analyzer" },
  "/vulnerability-scanner":  { tier: "pro", name: "Vulnerability Scanner" },
  "/vulnerability-scan":     { tier: "pro", name: "Vulnerability Scan" },
  "/dark-web-monitor":       { tier: "pro", name: "Dark Web Monitor" },
  "/password-vault":         { tier: "pro", name: "Password Vault" },
  "/email-analyzer":         { tier: "pro", name: "Email Analyzer" },
  "/identity-xray":          { tier: "pro", name: "Identity X-Ray" },
  "/security-headers":       { tier: "pro", name: "Security Headers" },
  "/file-hash-scanner":      { tier: "pro", name: "File Hash Scanner" },
  "/security-audit":         { tier: "pro", name: "Security Audit" },
  "/security-score":         { tier: "pro", name: "Security Score" },
  "/scam-check":             { tier: "pro", name: "Scam Check (AI)" },
  "/deepfake-audio":         { tier: "pro", name: "Deepfake Audio Detector" },
  "/device-scan":            { tier: "pro", name: "Device Scanner" },
  "/device-scanner":         { tier: "pro", name: "Device Scanner" },

  // ── ENTERPRISE TIER (SOC, team, bulk, integrations) ──
  "/admin/soc":            { tier: "enterprise", name: "SOC Dashboard" },
  "/bulk-scanner":         { tier: "enterprise", name: "Bulk Scanner" },
  "/team":                 { tier: "enterprise", name: "Team Management" },
  "/admin":                { tier: "enterprise", name: "Admin Dashboard" },
};

// Routes blocked for Family-plan "kid" role members. These surface
// scary / adult / dark-web content that's inappropriate for children.
// Parent dashboard sets the kid flag — enforcement in ProtectedRoute.
export const KID_BLOCKED_PATHS = new Set([
  "/dark-web-monitor",
  "/identity-xray",
  "/deepfake-audio",
  "/scam-database",
  "/threats",
  "/threat-map",
  "/cyber-news",
]);

export function isKidBlocked(path) {
  if (!path) return false;
  const clean = path.split("?")[0].split("#")[0].toLowerCase();
  return KID_BLOCKED_PATHS.has(clean);
}

/**
 * Look up tier metadata for an arbitrary path.
 * Falls back to "free" when no entry exists (safer default for public pages).
 */
export function getToolTier(path) {
  if (!path) return { tier: "free", name: "" };
  const clean = path.split("?")[0].split("#")[0].toLowerCase();
  if (TOOL_TIERS[clean]) return TOOL_TIERS[clean];
  // Wildcard lookup
  for (const key of Object.keys(TOOL_TIERS)) {
    if (key.endsWith("*") && clean.startsWith(key.slice(0, -1))) {
      return TOOL_TIERS[key];
    }
  }
  return { tier: "free", name: "" };
}
