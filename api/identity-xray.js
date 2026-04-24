import { checkRateLimit } from "./_rateLimit.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(clientIP, 10, 60000); // 10 per minute (heavy endpoint)
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const domain = email.split("@")[1];
  const report = {
    email,
    domain,
    scannedAt: new Date().toISOString(),
    breaches: { found: false, count: 0, list: [], riskLevel: "low" },
    domainSecurity: { spf: false, dmarc: false, mx: [], score: 0, grade: "F" },
    exposureAnalysis: { pasteCount: 0, socialRisk: "unknown", domainAge: "unknown" },
    attackPath: [],
    riskScore: 0,
    riskLevel: "low",
    actionPlan: [],
  };

  // ── 1. Breach Check (XposedOrNot) ──
  try {
    const breachRes = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { headers: { Accept: "application/json", "User-Agent": "VRIKAAN-XRay/1.0" } }
    );
    if (breachRes.ok) {
      const data = await breachRes.json();
      const breaches = (data.breaches || []).map((b) => ({
        name: b.breach || b.name || "Unknown",
        date: b.xposed_date || b.date || "",
        records: b.xposed_records || 0,
        dataTypes: b.xposed_data ? b.xposed_data.split(",").map((s) => s.trim()) : [],
      }));
      report.breaches.found = breaches.length > 0;
      report.breaches.count = breaches.length;
      report.breaches.list = breaches.slice(0, 15); // top 15
      report.breaches.riskLevel =
        breaches.length === 0 ? "safe" : breaches.length <= 2 ? "moderate" : breaches.length <= 5 ? "high" : "critical";
    } else if (breachRes.status === 404) {
      report.breaches.found = false;
      report.breaches.riskLevel = "safe";
    }
  } catch {}

  // ── 2. Domain Security (DNS TXT records for SPF/DMARC) ──
  try {
    // Check SPF
    const spfRes = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    if (spfRes.ok) {
      const spfData = await spfRes.json();
      const txtRecords = (spfData.Answer || []).map((a) => a.data || "");
      report.domainSecurity.spf = txtRecords.some((r) => r.includes("v=spf1"));
    }

    // Check DMARC
    const dmarcRes = await fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`);
    if (dmarcRes.ok) {
      const dmarcData = await dmarcRes.json();
      const dmarcRecords = (dmarcData.Answer || []).map((a) => a.data || "");
      report.domainSecurity.dmarc = dmarcRecords.some((r) => r.includes("v=DMARC1"));
    }

    // Check MX
    const mxRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    if (mxRes.ok) {
      const mxData = await mxRes.json();
      report.domainSecurity.mx = (mxData.Answer || []).map((a) => a.data || "").slice(0, 5);
    }

    // Score domain security
    let dScore = 0;
    if (report.domainSecurity.spf) dScore += 40;
    if (report.domainSecurity.dmarc) dScore += 40;
    if (report.domainSecurity.mx.length > 0) dScore += 20;
    report.domainSecurity.score = dScore;
    report.domainSecurity.grade = dScore >= 80 ? "A" : dScore >= 60 ? "B" : dScore >= 40 ? "C" : dScore >= 20 ? "D" : "F";
  } catch {}

  // ── 3. Paste / Exposure Check (XposedOrNot analytics) ──
  try {
    const pasteRes = await fetch(
      `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`,
      { headers: { Accept: "application/json", "User-Agent": "VRIKAAN-XRay/1.0" } }
    );
    if (pasteRes.ok) {
      const pasteData = await pasteRes.json();
      if (pasteData.exposedBreaches || pasteData.breaches_details) {
        const details = pasteData.breaches_details || pasteData.exposedBreaches || [];
        report.exposureAnalysis.pasteCount = Array.isArray(details) ? details.length : 0;
      }
      if (pasteData.pastes_count !== undefined) {
        report.exposureAnalysis.pasteCount = pasteData.pastes_count;
      }
    }
  } catch {}

  // ── 4. Build Hacker Attack Path ──
  const attackSteps = [];

  attackSteps.push({
    step: 1,
    title: "Email Discovery",
    desc: `Attacker finds ${email} in public sources or breach databases`,
    risk: report.breaches.found ? "high" : "low",
    icon: "search",
  });

  if (report.breaches.found) {
    const dataTypesExposed = [...new Set(report.breaches.list.flatMap((b) => b.dataTypes))];
    attackSteps.push({
      step: 2,
      title: "Credential Harvesting",
      desc: `${report.breaches.count} breach(es) found. Exposed data: ${dataTypesExposed.slice(0, 5).join(", ") || "Unknown"}`,
      risk: "high",
      icon: "key",
    });

    if (dataTypesExposed.some((t) => /password/i.test(t))) {
      attackSteps.push({
        step: 3,
        title: "Password Reuse Attack",
        desc: "Leaked passwords are tested against other services (credential stuffing)",
        risk: "critical",
        icon: "unlock",
      });
    }

    attackSteps.push({
      step: attackSteps.length + 1,
      title: "Account Takeover",
      desc: "Attacker gains access to email, social media, or financial accounts",
      risk: "critical",
      icon: "alert",
    });
  }

  if (!report.domainSecurity.dmarc) {
    attackSteps.push({
      step: attackSteps.length + 1,
      title: "Email Spoofing",
      desc: `No DMARC on ${domain} — attacker can send emails pretending to be you`,
      risk: "high",
      icon: "mail",
    });
  }

  if (!report.domainSecurity.spf) {
    attackSteps.push({
      step: attackSteps.length + 1,
      title: "Phishing Campaign",
      desc: `No SPF on ${domain} — makes phishing attacks using your domain easier`,
      risk: "medium",
      icon: "phishing",
    });
  }

  attackSteps.push({
    step: attackSteps.length + 1,
    title: "Identity Theft",
    desc: "With enough data, attacker can impersonate you for financial fraud",
    risk: report.breaches.count > 3 ? "critical" : report.breaches.found ? "high" : "low",
    icon: "identity",
  });

  report.attackPath = attackSteps;

  // ── 5. Calculate Overall Risk Score ──
  let risk = 20; // base

  // Breach impact (0-40 points)
  risk += Math.min(40, report.breaches.count * 8);

  // Domain security impact (0-20 points)
  risk += (100 - report.domainSecurity.score) / 5;

  // Paste exposure (0-10 points)
  risk += Math.min(10, report.exposureAnalysis.pasteCount * 2);

  // Data type severity
  const allTypes = report.breaches.list.flatMap((b) => b.dataTypes);
  if (allTypes.some((t) => /password/i.test(t))) risk += 10;
  if (allTypes.some((t) => /phone/i.test(t))) risk += 5;
  if (allTypes.some((t) => /ssn|social.security|passport/i.test(t))) risk += 15;
  if (allTypes.some((t) => /payment|credit.card|bank/i.test(t))) risk += 15;

  report.riskScore = Math.min(100, Math.max(0, Math.round(risk)));
  report.riskLevel =
    report.riskScore <= 25 ? "low" : report.riskScore <= 50 ? "moderate" : report.riskScore <= 75 ? "high" : "critical";

  // ── 6. Personalized Action Plan ──
  const actions = [];

  if (report.breaches.found) {
    actions.push({
      priority: "critical",
      title: "Change Compromised Passwords",
      desc: `Your email was found in ${report.breaches.count} breach(es). Change passwords for all affected services immediately.`,
      tool: "/password-vault",
    });
  }

  if (allTypes.some((t) => /password/i.test(t))) {
    actions.push({
      priority: "critical",
      title: "Check Password Exposure",
      desc: "Passwords were exposed in breaches. Verify none of your current passwords are compromised.",
      tool: "/password-checker",
    });
  }

  actions.push({
    priority: report.breaches.found ? "critical" : "high",
    title: "Enable Two-Factor Authentication",
    desc: "Add 2FA to all important accounts (email, banking, social media) to prevent unauthorized access.",
    tool: "/security-checklist",
  });

  if (!report.domainSecurity.dmarc || !report.domainSecurity.spf) {
    actions.push({
      priority: "high",
      title: "Improve Email Domain Security",
      desc: `Your email domain (${domain}) is missing ${[!report.domainSecurity.spf && "SPF", !report.domainSecurity.dmarc && "DMARC"].filter(Boolean).join(" and ")}. This makes spoofing easier.`,
      tool: "/vulnerability-scanner",
    });
  }

  actions.push({
    priority: "medium",
    title: "Monitor Dark Web Continuously",
    desc: "Set up ongoing monitoring for your email across dark web databases and paste sites.",
    tool: "/dark-web-monitor",
  });

  actions.push({
    priority: "medium",
    title: "Scan for Fraud Threats",
    desc: "Regularly check suspicious links, emails, and messages you receive.",
    tool: "/fraud-analyzer",
  });

  if (report.riskScore > 50) {
    actions.push({
      priority: "high",
      title: "Run Full Security Assessment",
      desc: "Your risk score is elevated. Complete a comprehensive security checklist to identify all vulnerabilities.",
      tool: "/security-score",
    });
  }

  report.actionPlan = actions;

  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  return res.status(200).json(report);
}
