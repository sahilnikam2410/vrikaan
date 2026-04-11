export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, type } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }

  const results = { url, threats: [], safe: true, score: 100, sources: [] };

  try {
    // 1. Check URLhaus (abuse.ch) - free, no key needed
    try {
      const urlhausRes = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=${encodeURIComponent(url)}`,
      });
      const urlhausData = await urlhausRes.json();

      if (urlhausData.query_status === "listed") {
        results.safe = false;
        results.score -= 60;
        results.threats.push({
          source: "URLhaus",
          type: "malware",
          severity: "critical",
          detail: `Listed as malware distribution: ${urlhausData.threat || "unknown threat"}`,
          tags: urlhausData.tags || [],
          dateAdded: urlhausData.date_added || "",
        });
      }
      results.sources.push("URLhaus");
    } catch {}

    // 2. Check Google Safe Browsing (if API key configured)
    const gsbKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
    if (gsbKey) {
      try {
        const gsbRes = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${gsbKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client: { clientId: "secuvion", clientVersion: "1.0" },
              threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url }],
              },
            }),
          }
        );
        const gsbData = await gsbRes.json();
        if (gsbData.matches && gsbData.matches.length > 0) {
          results.safe = false;
          results.score -= 40;
          gsbData.matches.forEach((match) => {
            results.threats.push({
              source: "Google Safe Browsing",
              type: match.threatType.toLowerCase().replace(/_/g, " "),
              severity: "high",
              detail: `Flagged as ${match.threatType.replace(/_/g, " ").toLowerCase()}`,
            });
          });
        }
        results.sources.push("Google Safe Browsing");
      } catch {}
    }

    // 3. Check VirusTotal (if API key configured)
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    if (vtKey) {
      try {
        // Submit URL for scanning
        const vtScanRes = await fetch("https://www.virustotal.com/api/v3/urls", {
          method: "POST",
          headers: { "x-apikey": vtKey, "Content-Type": "application/x-www-form-urlencoded" },
          body: `url=${encodeURIComponent(url)}`,
        });
        const vtScanData = await vtScanRes.json();
        const analysisId = vtScanData.data?.id;

        if (analysisId) {
          // Wait briefly then get results
          await new Promise((r) => setTimeout(r, 3000));
          const vtResultRes = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            { headers: { "x-apikey": vtKey } }
          );
          const vtResultData = await vtResultRes.json();
          const stats = vtResultData.data?.attributes?.stats || {};
          const malicious = stats.malicious || 0;
          const suspicious = stats.suspicious || 0;

          if (malicious > 0 || suspicious > 0) {
            results.safe = false;
            results.score -= Math.min(50, (malicious + suspicious) * 5);
            results.threats.push({
              source: "VirusTotal",
              type: "multi-engine scan",
              severity: malicious > 3 ? "critical" : malicious > 0 ? "high" : "medium",
              detail: `${malicious} engines flagged as malicious, ${suspicious} as suspicious out of ${stats.harmless + malicious + suspicious + (stats.undetected || 0)} total`,
              malicious,
              suspicious,
              harmless: stats.harmless || 0,
            });
          }
        }
        results.sources.push("VirusTotal");
      } catch {}
    }

    // 4. Basic SSL/HTTPS check
    if (url.startsWith("http://")) {
      results.score -= 15;
      results.threats.push({
        source: "SECUVION",
        type: "insecure connection",
        severity: "medium",
        detail: "Site uses HTTP instead of HTTPS — data is not encrypted in transit",
      });
    }

    // 5. Check for suspicious URL patterns
    const suspiciousPatterns = [
      { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|buff\.ly/i, msg: "URL shortener detected — destination is hidden" },
      { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, msg: "IP address used instead of domain name" },
      { pattern: /paypal|amazon|apple|google|microsoft|facebook|netflix/i, msg: "Contains well-known brand name — verify authenticity" },
      { pattern: /@/, msg: "Contains @ symbol — possible URL obfuscation" },
      { pattern: /\.exe|\.zip|\.scr|\.bat|\.cmd|\.msi/i, msg: "Points to executable/archive file" },
    ];

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Check homograph attacks (mixed scripts in domain)
      if (/xn--/.test(hostname)) {
        results.score -= 20;
        results.threats.push({
          source: "SECUVION",
          type: "homograph attack",
          severity: "high",
          detail: "Internationalized domain name (IDN) — possible homograph/lookalike attack",
        });
      }

      suspiciousPatterns.forEach(({ pattern, msg }) => {
        if (pattern.test(url)) {
          results.score -= 10;
          results.threats.push({
            source: "SECUVION",
            type: "suspicious pattern",
            severity: "low",
            detail: msg,
          });
        }
      });
    } catch {}

    results.score = Math.max(0, Math.min(100, results.score));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(results);
  } catch {
    return res.status(502).json({ error: "URL scanning service temporarily unavailable" });
  }
}
