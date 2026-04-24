import { checkRateLimit } from "./_rateLimit.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(clientIP, 20, 60000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  const report = {
    threatLevel: "elevated",
    feeds: [],
    stats: { totalThreats: 0, malwareUrls: 0, botnets: 0, countries: {} },
    topCountries: [],
    recentMalware: [],
    recentBotnets: [],
    fetchedAt: new Date().toISOString(),
  };

  // ── 1. URLhaus Recent Threats (abuse.ch) — free, no key ──
  try {
    const urlhausRes = await fetch("https://urlhaus-api.abuse.ch/v1/urls/recent/limit/50/", {
      method: "POST",
      headers: { "User-Agent": "VRIKAAN/1.0" },
    });
    if (urlhausRes.ok) {
      const data = await urlhausRes.json();
      const urls = (data.urls || []).slice(0, 30);
      report.stats.malwareUrls = urls.length;
      report.recentMalware = urls.map((u) => ({
        url: u.url || "",
        threat: u.threat || "malware",
        status: u.url_status || "online",
        country: u.country || "Unknown",
        dateAdded: u.date_added || "",
        tags: u.tags || [],
      }));
      // Count countries
      urls.forEach((u) => {
        const c = u.country || "Unknown";
        report.stats.countries[c] = (report.stats.countries[c] || 0) + 1;
      });
      report.feeds.push("URLhaus");
    }
  } catch {}

  // ── 2. Feodo Tracker — Botnet C&C servers (abuse.ch) — free ──
  try {
    const feodoRes = await fetch("https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.json", {
      headers: { "User-Agent": "VRIKAAN/1.0" },
    });
    if (feodoRes.ok) {
      const text = await feodoRes.text();
      try {
        const data = JSON.parse(text);
        const entries = Array.isArray(data) ? data.slice(0, 30) : [];
        report.stats.botnets = entries.length;
        report.recentBotnets = entries.map((e) => ({
          ip: e.ip_address || e.dst_ip || "",
          port: e.dst_port || e.port || 0,
          malware: e.malware || "Unknown",
          country: e.country || "",
          firstSeen: e.first_seen || e.first_seen_utc || "",
          lastOnline: e.last_online || "",
          status: e.status || "online",
        }));
        entries.forEach((e) => {
          const c = e.country || "Unknown";
          report.stats.countries[c] = (report.stats.countries[c] || 0) + 1;
        });
        report.feeds.push("Feodo Tracker");
      } catch {}
    }
  } catch {}

  // ── 3. Try alternate Feodo endpoint ──
  if (report.recentBotnets.length === 0) {
    try {
      const feodoRes2 = await fetch("https://feodotracker.abuse.ch/downloads/ipblocklist.json", {
        headers: { "User-Agent": "VRIKAAN/1.0" },
      });
      if (feodoRes2.ok) {
        const data2 = await feodoRes2.json();
        const entries2 = Array.isArray(data2) ? data2.slice(0, 20) : [];
        report.stats.botnets = entries2.length;
        report.recentBotnets = entries2.map((e) => ({
          ip: e.ip_address || "",
          port: e.dst_port || 0,
          malware: e.malware || "Unknown",
          country: e.country || "",
          firstSeen: e.first_seen || "",
          status: "active",
        }));
        if (entries2.length > 0) report.feeds.push("Feodo Tracker");
      }
    } catch {}
  }

  // ── Calculate totals ──
  report.stats.totalThreats = report.stats.malwareUrls + report.stats.botnets;

  // ── Top countries ──
  report.topCountries = Object.entries(report.stats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  // ── Threat level based on actual data ──
  if (report.stats.totalThreats > 40) report.threatLevel = "critical";
  else if (report.stats.totalThreats > 20) report.threatLevel = "elevated";
  else if (report.stats.totalThreats > 5) report.threatLevel = "guarded";
  else report.threatLevel = "low";

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(report);
}
