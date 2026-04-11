export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { host } = req.query;
  if (!host) {
    return res.status(400).json({ error: "Host parameter required" });
  }

  // Clean the host - extract domain only
  let domain = host;
  try {
    const url = new URL(host.includes("://") ? host : `https://${host}`);
    domain = url.hostname;
  } catch {}

  const result = {
    host: domain,
    ssl: null,
    headers: null,
    score: 0,
    grade: "?",
    issues: [],
  };

  try {
    // 1. SSL Labs API (free, no key needed)
    try {
      const sslRes = await fetch(
        `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`,
        { headers: { "User-Agent": "SECUVION/1.0" } }
      );

      if (sslRes.ok) {
        const sslData = await sslRes.json();

        if (sslData.status === "READY" && sslData.endpoints && sslData.endpoints.length > 0) {
          const endpoint = sslData.endpoints[0];
          result.ssl = {
            grade: endpoint.grade || "?",
            gradeTrustIgnored: endpoint.gradeTrustIgnored || endpoint.grade || "?",
            hasWarnings: endpoint.hasWarnings || false,
            isExceptional: endpoint.isExceptional || false,
            delegation: endpoint.delegation || 0,
            protocol: sslData.protocol || "",
          };
          result.grade = endpoint.grade || "?";

          // Score based on SSL grade
          const gradeScores = { "A+": 100, A: 95, "A-": 90, B: 75, C: 60, D: 40, E: 20, F: 0, T: 10 };
          result.score = gradeScores[endpoint.grade] || 50;

          if (endpoint.hasWarnings) {
            result.issues.push("SSL configuration has warnings");
          }
        } else if (sslData.status === "IN_PROGRESS" || sslData.status === "DNS") {
          // Analysis is still running, return what we have
          result.ssl = { grade: "Scanning...", status: sslData.status };
          result.score = -1; // indicates scanning
        } else if (sslData.status === "ERROR") {
          result.issues.push(sslData.statusMessage || "SSL analysis failed");
          result.score = 0;
        }
      }
    } catch {}

    // 2. Check security headers by fetching the actual site
    try {
      const siteRes = await fetch(`https://${domain}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });

      const headers = {};
      const secHeaders = [
        "strict-transport-security",
        "content-security-policy",
        "x-content-type-options",
        "x-frame-options",
        "x-xss-protection",
        "referrer-policy",
        "permissions-policy",
        "cross-origin-opener-policy",
        "cross-origin-resource-policy",
      ];

      secHeaders.forEach((h) => {
        const val = siteRes.headers.get(h);
        headers[h] = val || null;
      });

      result.headers = {
        present: Object.entries(headers).filter(([, v]) => v !== null).map(([k]) => k),
        missing: Object.entries(headers).filter(([, v]) => v === null).map(([k]) => k),
        details: headers,
      };

      // Deduct for missing important headers
      if (!headers["strict-transport-security"]) result.issues.push("Missing HSTS header");
      if (!headers["content-security-policy"]) result.issues.push("Missing Content-Security-Policy");
      if (!headers["x-content-type-options"]) result.issues.push("Missing X-Content-Type-Options");
      if (!headers["x-frame-options"]) result.issues.push("Missing X-Frame-Options (clickjacking risk)");

      // Adjust score for headers
      const headerScore = (result.headers.present.length / secHeaders.length) * 100;
      if (result.score > 0) {
        result.score = Math.round(result.score * 0.6 + headerScore * 0.4);
      }
    } catch {
      result.issues.push("Could not fetch site headers (site may be down or blocking requests)");
    }

    // 3. Check if site supports HTTPS
    try {
      const httpRes = await fetch(`http://${domain}`, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      const location = httpRes.headers.get("location") || "";
      if (httpRes.status >= 300 && httpRes.status < 400 && location.startsWith("https")) {
        // Good - redirects to HTTPS
      } else if (httpRes.ok) {
        result.issues.push("HTTP does not redirect to HTTPS");
        result.score = Math.max(0, result.score - 10);
      }
    } catch {}

    result.score = Math.max(0, Math.min(100, result.score));

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({ error: "Security scanning service temporarily unavailable" });
  }
}
