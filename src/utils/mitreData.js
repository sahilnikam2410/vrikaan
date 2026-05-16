/**
 * MITRE ATT&CK Enterprise — 14 tactics + most-relevant techniques.
 * Source: https://attack.mitre.org/matrices/enterprise/
 *
 * For VRIKAAN's SOC dashboard we surface the techniques most likely to be
 * triggered by a consumer-facing SaaS — credential access, initial access,
 * impact, exfiltration. Full 600+ technique list omitted to keep bundle small.
 */

export const MITRE_TACTICS = [
  { id: "TA0001", name: "Initial Access",        short: "Initial Access",   url: "https://attack.mitre.org/tactics/TA0001" },
  { id: "TA0002", name: "Execution",             short: "Execution",        url: "https://attack.mitre.org/tactics/TA0002" },
  { id: "TA0003", name: "Persistence",           short: "Persistence",      url: "https://attack.mitre.org/tactics/TA0003" },
  { id: "TA0004", name: "Privilege Escalation",  short: "Priv Escalation",  url: "https://attack.mitre.org/tactics/TA0004" },
  { id: "TA0005", name: "Defense Evasion",       short: "Defense Evasion",  url: "https://attack.mitre.org/tactics/TA0005" },
  { id: "TA0006", name: "Credential Access",     short: "Cred Access",      url: "https://attack.mitre.org/tactics/TA0006" },
  { id: "TA0007", name: "Discovery",             short: "Discovery",        url: "https://attack.mitre.org/tactics/TA0007" },
  { id: "TA0008", name: "Lateral Movement",      short: "Lateral Movement", url: "https://attack.mitre.org/tactics/TA0008" },
  { id: "TA0009", name: "Collection",            short: "Collection",       url: "https://attack.mitre.org/tactics/TA0009" },
  { id: "TA0011", name: "Command & Control",     short: "C2",               url: "https://attack.mitre.org/tactics/TA0011" },
  { id: "TA0010", name: "Exfiltration",          short: "Exfiltration",     url: "https://attack.mitre.org/tactics/TA0010" },
  { id: "TA0040", name: "Impact",                short: "Impact",           url: "https://attack.mitre.org/tactics/TA0040" },
];

// Top techniques per tactic (subset). id format: T#### or T####.###.
export const MITRE_TECHNIQUES = {
  TA0001: [
    { id: "T1566",     name: "Phishing" },
    { id: "T1078",     name: "Valid Accounts" },
    { id: "T1078.004", name: "Valid Accounts: Cloud" },
    { id: "T1190",     name: "Exploit Public-Facing App" },
    { id: "T1133",     name: "External Remote Services" },
  ],
  TA0002: [
    { id: "T1059",     name: "Command & Scripting" },
    { id: "T1059.007", name: "JavaScript" },
    { id: "T1204",     name: "User Execution" },
    { id: "T1203",     name: "Exploitation for Client" },
  ],
  TA0003: [
    { id: "T1136",     name: "Create Account" },
    { id: "T1098",     name: "Account Manipulation" },
    { id: "T1098.005", name: "Device Registration" },
    { id: "T1505.003", name: "Web Shell" },
  ],
  TA0004: [
    { id: "T1078.003", name: "Local Accounts" },
    { id: "T1068",     name: "Exploit for Priv Esc" },
  ],
  TA0005: [
    { id: "T1556",     name: "Modify Authentication" },
    { id: "T1098",     name: "Account Manipulation" },
    { id: "T1027",     name: "Obfuscated Files" },
  ],
  TA0006: [
    { id: "T1110",     name: "Brute Force" },
    { id: "T1556",     name: "Modify Authentication" },
    { id: "T1556.005", name: "Reversible Encryption" },
    { id: "T1098",     name: "Account Manipulation" },
    { id: "T1539",     name: "Steal Web Session Cookie" },
  ],
  TA0007: [
    { id: "T1595",     name: "Active Scanning" },
    { id: "T1595.001", name: "Scanning IP Blocks" },
    { id: "T1595.002", name: "Vulnerability Scanning" },
    { id: "T1590",     name: "Gather Network Info" },
    { id: "T1590.002", name: "DNS" },
    { id: "T1518",     name: "Software Discovery" },
  ],
  TA0008: [
    { id: "T1021",     name: "Remote Services" },
    { id: "T1021.001", name: "RDP" },
  ],
  TA0009: [
    { id: "T1530",     name: "Cloud Storage Object Data" },
    { id: "T1213",     name: "Data from Info Repos" },
  ],
  TA0011: [
    { id: "T1102",     name: "Web Service" },
    { id: "T1071",     name: "Application Layer Protocol" },
  ],
  TA0010: [
    { id: "T1567",     name: "Exfil Over Web Service" },
    { id: "T1041",     name: "Exfil Over C2" },
  ],
  TA0040: [
    { id: "T1499",     name: "Endpoint DoS" },
    { id: "T1485",     name: "Data Destruction" },
    { id: "T1496",     name: "Resource Hijacking" },
  ],
};

/**
 * Build a heat-map matrix: for each (tactic, technique) cell, return the
 * count of events that triggered it. Used by the MITRE matrix view.
 */
export function buildMitreHeatmap(events) {
  const heat = {}; // tactic -> { techniqueId -> count }
  for (const e of events || []) {
    if (!e.tactic) continue;
    if (!heat[e.tactic]) heat[e.tactic] = {};
    heat[e.tactic][e.technique] = (heat[e.tactic][e.technique] || 0) + 1;
  }
  return heat;
}

/**
 * Pick the tactic with the highest event count.
 */
export function topTactic(events) {
  const counts = {};
  for (const e of events || []) counts[e.tactic] = (counts[e.tactic] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const tactic = MITRE_TACTICS.find((t) => t.id === top[0]);
  return tactic ? { ...tactic, count: top[1] } : null;
}
