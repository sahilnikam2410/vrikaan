/**
 * Maps VRIKAAN events into Wazuh-style security events.
 *
 * Wazuh uses a 0-15 severity scale (rule.level):
 *   0     — informational, ignored by default
 *   1-3   — informational
 *   4-7   — low
 *   8-11  — medium
 *   12-13 — high
 *   14-15 — critical
 *
 * Each event also carries a MITRE ATT&CK tactic + technique reference so
 * the SOC dashboard can render a heat-map matrix.
 */

export const SEVERITY_BANDS = [
  { min: 0,  max: 3,  label: "info",     color: "#64748b" },
  { min: 4,  max: 7,  label: "low",      color: "#a3e635" },
  { min: 8,  max: 11, label: "medium",   color: "#fbbf24" },
  { min: 12, max: 13, label: "high",     color: "#f97316" },
  { min: 14, max: 15, label: "critical", color: "#ef4444" },
];

export function severityBand(level) {
  return SEVERITY_BANDS.find((b) => level >= b.min && level <= b.max) || SEVERITY_BANDS[0];
}

/**
 * Mapping table — each VRIKAAN event class to a Wazuh-style rule.
 * Keys are matched against `event.type` (case-insensitive); first match wins.
 */
export const EVENT_RULES = [
  // Authentication events
  { match: /^login_failed/i,           level: 8,  ruleId: 5710, tactic: "TA0001", technique: "T1110", desc: "Failed login attempt" },
  { match: /^login_success|^login\b/i, level: 3,  ruleId: 5715, tactic: "TA0001", technique: "T1078", desc: "Successful authentication" },
  { match: /^logout/i,                 level: 2,  ruleId: 5716, tactic: "TA0001", technique: "T1078", desc: "User logout" },
  { match: /^signup/i,                 level: 4,  ruleId: 5717, tactic: "TA0003", technique: "T1136", desc: "New account created" },
  { match: /^password_reset/i,         level: 6,  ruleId: 5720, tactic: "TA0006", technique: "T1098", desc: "Password reset" },
  { match: /^totp_enrolled|^mfa_enabled/i, level: 3, ruleId: 5723, tactic: "TA0006", technique: "T1556", desc: "MFA enrolled (defensive control)" },
  { match: /^totp_disabled|^mfa_disabled/i, level: 10, ruleId: 5724, tactic: "TA0005", technique: "T1556", desc: "MFA disabled (suspicious)" },
  { match: /^magic_link_used/i,        level: 4,  ruleId: 5725, tactic: "TA0001", technique: "T1078.004", desc: "Magic-link sign-in" },
  { match: /^admin_login/i,            level: 5,  ruleId: 5730, tactic: "TA0004", technique: "T1078.003", desc: "Admin login" },
  { match: /^admin_step_up/i,          level: 4,  ruleId: 5731, tactic: "TA0006", technique: "T1556", desc: "Admin step-up auth" },

  // Tool / scan events
  { match: /^scan_run|^tool_run/i,     level: 3,  ruleId: 31100, tactic: "TA0007", technique: "T1595", desc: "User-initiated scan" },
  { match: /^vuln_scan/i,              level: 4,  ruleId: 31101, tactic: "TA0007", technique: "T1595.002", desc: "Vulnerability scan" },
  { match: /^breach_check/i,           level: 4,  ruleId: 31102, tactic: "TA0001", technique: "T1078.004", desc: "Breach lookup" },
  { match: /^scam_check/i,             level: 5,  ruleId: 31103, tactic: "TA0001", technique: "T1566", desc: "Scam-message analysis" },
  { match: /^deepfake_check|^audio_check/i, level: 5, ruleId: 31104, tactic: "TA0001", technique: "T1566.004", desc: "Deepfake / vishing check" },
  { match: /^dns_leak|^leak_check/i,   level: 4,  ruleId: 31105, tactic: "TA0007", technique: "T1590.002", desc: "DNS leak inspection" },
  { match: /^header_scan/i,            level: 3,  ruleId: 31106, tactic: "TA0007", technique: "T1595.001", desc: "Security headers scan" },

  // Threat detections
  { match: /^breach_found|^breach_detected/i, level: 12, ruleId: 31200, tactic: "TA0009", technique: "T1530", desc: "Data breach exposure detected" },
  { match: /^phishing_detected|^scam_detected/i, level: 13, ruleId: 31201, tactic: "TA0001", technique: "T1566", desc: "Phishing / scam content detected" },
  { match: /^malware/i,                level: 14, ruleId: 31202, tactic: "TA0002", technique: "T1204", desc: "Malware indicator" },
  { match: /^suspicious_login/i,       level: 12, ruleId: 31203, tactic: "TA0001", technique: "T1078", desc: "Suspicious sign-in (impossible travel / new device)" },
  { match: /^rate_limit_exceeded/i,    level: 9,  ruleId: 31204, tactic: "TA0040", technique: "T1499", desc: "Rate limit hit (potential abuse)" },
  { match: /^csp_violation/i,          level: 7,  ruleId: 31205, tactic: "TA0002", technique: "T1059.007", desc: "CSP violation reported" },
  { match: /^bot_detected/i,           level: 6,  ruleId: 31206, tactic: "TA0007", technique: "T1595.002", desc: "Bot traffic detected" },
  { match: /^webhook_signature_failed/i, level: 11, ruleId: 31207, tactic: "TA0006", technique: "T1556.005", desc: "Webhook signature verification failed" },

  // Payment / financial
  { match: /^payment_success/i,        level: 3,  ruleId: 41100, tactic: "TA0001", technique: "T1078", desc: "Payment completed" },
  { match: /^payment_failed/i,         level: 6,  ruleId: 41101, tactic: "TA0001", technique: "T1078", desc: "Payment failed" },
  { match: /^refund_requested/i,       level: 5,  ruleId: 41102, tactic: "TA0001", technique: "T1078", desc: "Refund requested" },
  { match: /^chargeback/i,             level: 11, ruleId: 41103, tactic: "TA0001", technique: "T1078", desc: "Chargeback (possible fraud)" },

  // Device / config
  { match: /^device_added/i,           level: 4,  ruleId: 51100, tactic: "TA0003", technique: "T1098.005", desc: "New device registered" },
  { match: /^device_removed/i,         level: 4,  ruleId: 51101, tactic: "TA0005", technique: "T1098", desc: "Device removed" },
  { match: /^webhook_set/i,            level: 5,  ruleId: 51102, tactic: "TA0011", technique: "T1102", desc: "Outbound webhook configured" },
  { match: /^team_invite/i,            level: 4,  ruleId: 51103, tactic: "TA0001", technique: "T1078.004", desc: "Team invitation issued" },
];

export const FALLBACK_RULE = {
  level: 3, ruleId: 1000, tactic: "TA0007", technique: "T1595", desc: "Generic event",
};

/**
 * Map a single Firestore event-like row into a Wazuh-style alert.
 * `row` is expected to have at least { id, type, detail, timestamp }.
 */
export function mapEvent(row) {
  const type = String(row.type || row.action || row.tool || "").trim();
  const rule = EVENT_RULES.find((r) => r.match.test(type)) || FALLBACK_RULE;
  const ts = row.timestamp?.toDate ? row.timestamp.toDate() : (row.timestamp ? new Date(row.timestamp) : new Date());
  return {
    id: row.id || `${ts.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: ts,
    rule: { id: rule.ruleId, level: rule.level, description: rule.desc },
    severity: severityBand(rule.level).label,
    tactic: rule.tactic,
    technique: rule.technique,
    type,
    description: row.detail || row.input || rule.desc,
    agent: row.agent || row.uid || "vrikaan-default",
    raw: row,
  };
}

export function mapEvents(rows) {
  return (rows || []).map(mapEvent);
}

/**
 * Aggregate events into the dashboard summary tiles.
 */
export function summarizeEvents(events) {
  const sev = { info: 0, low: 0, medium: 0, high: 0, critical: 0 };
  const byTactic = {};
  const byRuleId = {};
  for (const e of events) {
    sev[e.severity]++;
    byTactic[e.tactic] = (byTactic[e.tactic] || 0) + 1;
    byRuleId[e.rule.id] = (byRuleId[e.rule.id] || 0) + 1;
  }
  const topTactics = Object.entries(byTactic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));
  const topRules = Object.entries(byRuleId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id: Number(id), count }));
  return { total: events.length, severity: sev, topTactics, topRules };
}

/**
 * Bucket events into N time slots (for sparkline / histogram).
 * Returns an array of length `bins` with counts.
 */
export function bucketByTime(events, bins = 24, windowMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const start = now - windowMs;
  const slot = windowMs / bins;
  const out = Array(bins).fill(0);
  for (const e of events) {
    const t = e.timestamp.getTime();
    if (t < start || t > now) continue;
    const idx = Math.min(bins - 1, Math.floor((t - start) / slot));
    out[idx]++;
  }
  return out;
}
