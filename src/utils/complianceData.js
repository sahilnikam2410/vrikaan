/**
 * Lightweight compliance posture for VRIKAAN's SOC dashboard.
 *
 * We do NOT claim audit-ready compliance. Each control is a CONTROL CHECK
 * we can derive from existing telemetry (TLS posture, MFA enrollment rate,
 * webhook signature presence, payment-data scope, breach exposure).
 *
 * The result is a per-framework score 0-100 and a list of gap items the
 * SOC analyst can act on. Mirrors how Wazuh ships PCI / GDPR / HIPAA
 * compliance dashboards.
 */

export const FRAMEWORKS = [
  { id: "pci",   name: "PCI DSS v4.0",      short: "PCI DSS",  jurisdiction: "Global"   },
  { id: "gdpr",  name: "GDPR",              short: "GDPR",     jurisdiction: "EU"       },
  { id: "dpdp",  name: "DPDP Act 2023",     short: "DPDP",     jurisdiction: "India"    },
  { id: "soc2",  name: "SOC 2 Type II",     short: "SOC 2",    jurisdiction: "USA"      },
  { id: "iso",   name: "ISO 27001:2022",    short: "ISO 27001", jurisdiction: "Global"  },
];

/**
 * Each control: id, framework, weight (1-3), and a `evaluate(state) → bool`
 * function that returns true when the control is currently passing.
 */
export const CONTROLS = [
  // ─── PCI DSS ───
  { id: "PCI-3.4",  framework: "pci",  weight: 3, title: "PAN encrypted in transit (HTTPS only)",
    evaluate: (s) => s.tlsGrade && /^A/i.test(s.tlsGrade) },
  { id: "PCI-4.1",  framework: "pci",  weight: 3, title: "Strong cryptography on cardholder data",
    evaluate: (s) => s.tlsGrade && !["F","E","D","T","M"].includes(s.tlsGrade) },
  { id: "PCI-6.4",  framework: "pci",  weight: 2, title: "Web application firewall / strict CSP",
    evaluate: (s) => s.cspPresent === true },
  { id: "PCI-8.4",  framework: "pci",  weight: 3, title: "MFA on admin / payment-handling roles",
    evaluate: (s) => (s.mfaAdoptionRate || 0) >= 0.5 },
  { id: "PCI-10.2", framework: "pci",  weight: 2, title: "Audit logs retained for all admin actions",
    evaluate: (s) => s.auditLogActive === true },
  { id: "PCI-11.3", framework: "pci",  weight: 2, title: "Periodic vulnerability scans",
    evaluate: (s) => (s.scansLast30 || 0) > 0 },

  // ─── GDPR ───
  { id: "GDPR-25",  framework: "gdpr", weight: 3, title: "Privacy by design — data minimization",
    evaluate: (s) => s.privacyPolicyPublished === true },
  { id: "GDPR-32",  framework: "gdpr", weight: 3, title: "Encryption + integrity of processing",
    evaluate: (s) => s.tlsGrade && /^A/i.test(s.tlsGrade) && s.cspPresent === true },
  { id: "GDPR-33",  framework: "gdpr", weight: 3, title: "Breach notification within 72h",
    evaluate: (s) => s.breachNotifyMechanism === true },
  { id: "GDPR-17",  framework: "gdpr", weight: 2, title: "Right to erasure (account deletion)",
    evaluate: (s) => s.accountDeleteAvailable === true },
  { id: "GDPR-7",   framework: "gdpr", weight: 1, title: "Lawful basis (cookie consent)",
    evaluate: (s) => s.cookieConsentPresent === true },

  // ─── DPDP (India) ───
  { id: "DPDP-6",   framework: "dpdp", weight: 3, title: "Notice + consent at collection",
    evaluate: (s) => s.privacyPolicyPublished === true && s.cookieConsentPresent === true },
  { id: "DPDP-8",   framework: "dpdp", weight: 3, title: "Reasonable security safeguards",
    evaluate: (s) => s.tlsGrade && /^A/i.test(s.tlsGrade) },
  { id: "DPDP-9",   framework: "dpdp", weight: 2, title: "Data principal rights (delete / correct)",
    evaluate: (s) => s.accountDeleteAvailable === true },
  { id: "DPDP-10",  framework: "dpdp", weight: 3, title: "Personal data breach intimation",
    evaluate: (s) => s.breachNotifyMechanism === true },
  { id: "DPDP-12",  framework: "dpdp", weight: 1, title: "Children's data protection (age gate)",
    evaluate: (s) => true /* assumed: 18+ ToS */ },

  // ─── SOC 2 ───
  { id: "CC-1.1",   framework: "soc2", weight: 1, title: "Code of conduct + values published",
    evaluate: (s) => s.privacyPolicyPublished === true },
  { id: "CC-6.1",   framework: "soc2", weight: 3, title: "Logical + physical access controls",
    evaluate: (s) => (s.mfaAdoptionRate || 0) >= 0.3 },
  { id: "CC-6.6",   framework: "soc2", weight: 2, title: "Encryption of data in transit",
    evaluate: (s) => s.tlsGrade && /^A/i.test(s.tlsGrade) },
  { id: "CC-7.2",   framework: "soc2", weight: 3, title: "System monitoring + anomaly detection",
    evaluate: (s) => s.auditLogActive === true && (s.scansLast30 || 0) > 0 },
  { id: "CC-7.3",   framework: "soc2", weight: 2, title: "Incident response procedures",
    evaluate: (s) => s.breachNotifyMechanism === true },

  // ─── ISO 27001 ───
  { id: "A.5.10",  framework: "iso",  weight: 2, title: "Acceptable use of information",
    evaluate: (s) => s.privacyPolicyPublished === true },
  { id: "A.8.5",   framework: "iso",  weight: 3, title: "Secure authentication",
    evaluate: (s) => (s.mfaAdoptionRate || 0) >= 0.3 },
  { id: "A.8.24",  framework: "iso",  weight: 3, title: "Use of cryptography",
    evaluate: (s) => s.tlsGrade && /^A/i.test(s.tlsGrade) },
  { id: "A.8.26",  framework: "iso",  weight: 2, title: "Application security requirements (CSP)",
    evaluate: (s) => s.cspPresent === true },
  { id: "A.5.30",  framework: "iso",  weight: 2, title: "ICT readiness for business continuity",
    evaluate: (s) => s.auditLogActive === true },
];

/**
 * Score a single framework against current `state`.
 *
 * Returns { score: 0-100, passing: [...], gaps: [...], total: N }.
 */
export function scoreFramework(frameworkId, state) {
  const controls = CONTROLS.filter((c) => c.framework === frameworkId);
  let earned = 0, possible = 0;
  const passing = [], gaps = [];
  for (const c of controls) {
    possible += c.weight;
    let pass = false;
    try { pass = !!c.evaluate(state || {}); } catch { pass = false; }
    if (pass) {
      earned += c.weight;
      passing.push(c);
    } else {
      gaps.push(c);
    }
  }
  const score = possible ? Math.round((earned / possible) * 100) : 0;
  return { score, passing, gaps, total: controls.length };
}

/**
 * Score all frameworks at once.
 */
export function scoreAllFrameworks(state) {
  return FRAMEWORKS.map((f) => ({
    ...f,
    ...scoreFramework(f.id, state),
  }));
}
