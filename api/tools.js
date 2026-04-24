import { applyRateLimit } from "./_rateLimit.js";

// ─── WHOIS ──────────────────────────────────────────────────────────

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const RDAP_ENDPOINTS = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
};
const RDAP_FALLBACK = "https://rdap.org/domain/";

function extractEvents(events) {
  const result = {};
  if (!Array.isArray(events)) return result;
  for (const event of events) {
    if (event.eventAction === "registration") result.creationDate = event.eventDate;
    if (event.eventAction === "expiration") result.expiryDate = event.eventDate;
    if (event.eventAction === "last changed") result.updatedDate = event.eventDate;
  }
  return result;
}

function extractRegistrar(entities) {
  if (!Array.isArray(entities)) return null;
  for (const entity of entities) {
    if (entity.roles && entity.roles.includes("registrar")) {
      if (entity.vcardArray && Array.isArray(entity.vcardArray[1])) {
        for (const field of entity.vcardArray[1]) {
          if (field[0] === "fn") return field[3];
        }
      }
      if (entity.handle) return entity.handle;
      if (entity.publicIds && entity.publicIds.length > 0) {
        return entity.publicIds[0].identifier || null;
      }
    }
  }
  return null;
}

function extractNameservers(nameservers) {
  if (!Array.isArray(nameservers)) return [];
  return nameservers.map((ns) => ns.ldhName || ns.unicodeName || null).filter(Boolean);
}

async function handleWhois(req, res) {
  const { domain } = req.body || {};
  if (!domain || typeof domain !== "string") {
    return res.status(400).json({ error: "Domain parameter required" });
  }

  let cleanDomain = domain.trim().toLowerCase();
  try {
    const parsed = new URL(cleanDomain.includes("://") ? cleanDomain : `https://${cleanDomain}`);
    cleanDomain = parsed.hostname;
  } catch {
    // keep as-is and let regex validate
  }

  if (!DOMAIN_REGEX.test(cleanDomain)) {
    return res.status(400).json({ error: "Invalid domain format" });
  }

  try {
    const tld = cleanDomain.split(".").pop();
    const rdapBase = RDAP_ENDPOINTS[tld] || RDAP_FALLBACK;
    const rdapUrl = `${rdapBase}${encodeURIComponent(cleanDomain)}`;

    let data = null;
    try {
      const rdapRes = await fetch(rdapUrl, {
        headers: { Accept: "application/rdap+json", "User-Agent": "VRIKAAN/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (rdapRes.ok) data = await rdapRes.json();
    } catch { /* primary failed */ }

    if (!data && RDAP_ENDPOINTS[tld]) {
      try {
        const fallbackRes = await fetch(`${RDAP_FALLBACK}${encodeURIComponent(cleanDomain)}`, {
          headers: { Accept: "application/rdap+json", "User-Agent": "VRIKAAN/1.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (fallbackRes.ok) data = await fallbackRes.json();
      } catch { /* fallback also failed */ }
    }

    if (!data) {
      return res.status(404).json({ error: "WHOIS data not found for this domain" });
    }

    const events = extractEvents(data.events);
    const registrar = extractRegistrar(data.entities);
    const nameservers = extractNameservers(data.nameservers);
    const status = Array.isArray(data.status) ? data.status : [];

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      domain: data.ldhName || cleanDomain,
      registrar: registrar || "Unknown",
      creationDate: events.creationDate || null,
      expiryDate: events.expiryDate || null,
      updatedDate: events.updatedDate || null,
      status,
      nameservers,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(502).json({ error: "WHOIS lookup service temporarily unavailable" });
  }
}

// ─── SECURITY HEADERS ───────────────────────────────────────────────

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const SECURITY_HEADERS = [
  {
    name: "Strict-Transport-Security", key: "strict-transport-security", weight: 15,
    description: "Enforces HTTPS connections, preventing protocol downgrade attacks and cookie hijacking.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/max-age=\d{8,}/.test(value) && /includeSubDomains/i.test(value)) return { status: "present", score: 15 };
      if (/max-age=\d+/.test(value)) {
        const maxAge = parseInt(value.match(/max-age=(\d+)/)[1], 10);
        if (maxAge < 31536000) return { status: "misconfigured", score: 8, note: "max-age should be at least 31536000 (1 year)" };
        return { status: "present", score: 12 };
      }
      return { status: "misconfigured", score: 5 };
    },
  },
  {
    name: "Content-Security-Policy", key: "content-security-policy", weight: 15,
    description: "Prevents XSS, clickjacking, and other code injection attacks by controlling resource loading.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/unsafe-inline|unsafe-eval/.test(value)) return { status: "misconfigured", score: 7, note: "Contains unsafe-inline or unsafe-eval directives" };
      if (/default-src/.test(value)) return { status: "present", score: 15 };
      return { status: "present", score: 10 };
    },
  },
  {
    name: "X-Content-Type-Options", key: "x-content-type-options", weight: 10,
    description: "Prevents MIME-type sniffing, reducing exposure to drive-by download attacks.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "nosniff") return { status: "present", score: 10 };
      return { status: "misconfigured", score: 3, note: "Value should be 'nosniff'" };
    },
  },
  {
    name: "X-Frame-Options", key: "x-frame-options", weight: 10,
    description: "Prevents clickjacking by controlling whether the site can be embedded in frames.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const v = value.toUpperCase().trim();
      if (v === "DENY" || v === "SAMEORIGIN") return { status: "present", score: 10 };
      if (v.startsWith("ALLOW-FROM")) return { status: "present", score: 8 };
      return { status: "misconfigured", score: 3, note: "Value should be DENY or SAMEORIGIN" };
    },
  },
  {
    name: "X-XSS-Protection", key: "x-xss-protection", weight: 5,
    description: "Legacy XSS filter for older browsers. Modern browsers use CSP instead.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (/1;\s*mode=block/i.test(value)) return { status: "present", score: 5 };
      if (value.trim() === "0") return { status: "present", score: 4, note: "Disabled — acceptable if CSP is set" };
      if (value.trim() === "1") return { status: "misconfigured", score: 2, note: "Should use '1; mode=block' or '0'" };
      return { status: "present", score: 3 };
    },
  },
  {
    name: "Referrer-Policy", key: "referrer-policy", weight: 10,
    description: "Controls how much referrer information is sent with requests, protecting user privacy.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const good = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin", "same-origin"];
      if (good.includes(value.toLowerCase().trim())) return { status: "present", score: 10 };
      if (value.toLowerCase().trim() === "unsafe-url") return { status: "misconfigured", score: 3, note: "unsafe-url leaks full URL to all origins" };
      return { status: "present", score: 7 };
    },
  },
  {
    name: "Permissions-Policy", key: "permissions-policy", weight: 10,
    description: "Controls which browser features and APIs can be used, reducing the attack surface.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const restrictedFeatures = (value.match(/=\(\)/g) || []).length;
      if (restrictedFeatures >= 3) return { status: "present", score: 10 };
      return { status: "present", score: 7 };
    },
  },
  {
    name: "Cross-Origin-Opener-Policy", key: "cross-origin-opener-policy", weight: 8,
    description: "Isolates the browsing context, preventing cross-origin attacks like Spectre.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "same-origin") return { status: "present", score: 8 };
      if (value.toLowerCase().trim() === "same-origin-allow-popups") return { status: "present", score: 6 };
      return { status: "present", score: 4 };
    },
  },
  {
    name: "Cross-Origin-Resource-Policy", key: "cross-origin-resource-policy", weight: 8,
    description: "Prevents other origins from loading your resources, mitigating side-channel attacks.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      const v = value.toLowerCase().trim();
      if (v === "same-origin") return { status: "present", score: 8 };
      if (v === "same-site") return { status: "present", score: 6 };
      if (v === "cross-origin") return { status: "present", score: 3 };
      return { status: "present", score: 4 };
    },
  },
  {
    name: "Cross-Origin-Embedder-Policy", key: "cross-origin-embedder-policy", weight: 9,
    description: "Prevents loading cross-origin resources without explicit permission, enabling cross-origin isolation.",
    validate(value) {
      if (!value) return { status: "missing", score: 0 };
      if (value.toLowerCase().trim() === "require-corp") return { status: "present", score: 9 };
      if (value.toLowerCase().trim() === "credentialless") return { status: "present", score: 7 };
      return { status: "present", score: 4 };
    },
  },
];

const MAX_SCORE = SECURITY_HEADERS.reduce((sum, h) => sum + h.weight, 0);

function calculateGrade(score) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  if (pct >= 20) return "E";
  return "F";
}

async function handleSecurityHeaders(req, res) {
  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter required" });
  }

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) targetUrl = `https://${targetUrl}`;

  if (!URL_REGEX.test(targetUrl)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "VRIKAAN-SecurityHeadersChecker/1.0" },
    });

    let totalScore = 0;
    const headers = [];

    for (const header of SECURITY_HEADERS) {
      const value = fetchRes.headers.get(header.key);
      const result = header.validate(value);
      totalScore += result.score;
      headers.push({
        name: header.name,
        value: value || null,
        status: result.status,
        description: header.description,
        ...(result.note ? { note: result.note } : {}),
      });
    }

    const grade = calculateGrade(totalScore);
    const scorePercent = Math.round((totalScore / MAX_SCORE) * 100);

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({
      url: targetUrl,
      grade,
      score: scorePercent,
      maxScore: 100,
      headers,
      summary: {
        present: headers.filter((h) => h.status === "present").length,
        missing: headers.filter((h) => h.status === "missing").length,
        misconfigured: headers.filter((h) => h.status === "misconfigured").length,
        total: headers.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err.name === "TimeoutError"
      ? "Request timed out — site may be unreachable"
      : "Could not reach the target URL";
    return res.status(502).json({ error: message });
  }
}

// ─── FILE HASH CHECK ────────────────────────────────────────────────

async function handleFileHashCheck(req, res) {
  const { hash } = req.body || {};
  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{32,128}$/.test(hash.trim())) {
    return res.status(400).json({ error: "Invalid hash format" });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("query", "get_info");
    formData.append("hash", hash.trim());

    const mbResponse = await fetch("https://mb-api.abuse.ch/api/v1/", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    const mbData = await mbResponse.json();

    if (mbData.query_status === "hash_not_found") {
      return res.status(200).json({ status: "clean", message: "No malware match found", hash: hash.trim(), detections: 0, engines: 0 });
    }

    if (mbData.query_status === "ok" && mbData.data && mbData.data.length > 0) {
      const sample = mbData.data[0];
      return res.status(200).json({
        status: "malicious",
        hash: hash.trim(),
        fileName: sample.file_name || "Unknown",
        fileType: sample.file_type || "Unknown",
        fileSize: sample.file_size || 0,
        signature: sample.signature || "Unknown",
        firstSeen: sample.first_seen || null,
        lastSeen: sample.last_seen || null,
        tags: sample.tags || [],
        detections: sample.intelligence?.uploads ? parseInt(sample.intelligence.uploads) : 1,
        engines: 1,
        reporter: sample.reporter || "Unknown",
      });
    }

    return res.status(200).json({ status: "unknown", message: "Could not determine file safety", hash: hash.trim(), detections: 0, engines: 0 });
  } catch (err) {
    console.error("Hash check error:", err.message);
    return res.status(500).json({ error: "Hash check service unavailable" });
  }
}

// ─── GEMINI AI EXPLAIN ──────────────────────────────────────────────

async function handleGeminiExplain(req, res) {
  const { toolName, input, result } = req.body || {};
  if (!toolName || !result) {
    return res.status(400).json({ error: "toolName and result are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI explanation is not configured" });
  }

  const safeInput = String(input || "").slice(0, 500);
  const safeResult = JSON.stringify(result).slice(0, 3000);

  const prompt = `You are a cybersecurity expert writing for a non-technical user. Tool: ${toolName}. Input scanned: ${safeInput}. Scan result JSON: ${safeResult}.

Write a concise analysis in plain English (max 180 words) with:
1. A one-sentence verdict (safe / suspicious / dangerous).
2. 2-3 specific reasons backed by the scan data.
3. 2-3 concrete next steps the user should take.

Format as markdown with short bullet points. Do not repeat the raw JSON. Do not use jargon.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const gRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!gRes.ok) {
      const text = await gRes.text().catch(() => "");
      console.error("Gemini error:", gRes.status, text.slice(0, 300));
      // Surface Gemini's own message so the client can display it for debugging.
      // Gemini error bodies don't contain the API key, so this is safe to echo.
      let detail = "";
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.error?.message || parsed?.error?.status || "";
      } catch {
        detail = text.slice(0, 200);
      }
      return res.status(502).json({
        error: `AI service unavailable (Gemini ${gRes.status}${detail ? `: ${detail}` : ""})`,
      });
    }

    const data = await gRes.json();
    const explanation = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    if (!explanation) {
      return res.status(502).json({ error: "AI returned empty response" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ explanation, model: "gemini-2.5-flash" });
  } catch (err) {
    const message = err.name === "TimeoutError" ? "AI request timed out" : "AI service error";
    console.error("Gemini explain error:", err.message);
    return res.status(502).json({ error: message });
  }
}

// ─── BREACH CHECK (XposedOrNot, free, no key) ───────────────────────

async function handleBreachCheck(req, res) {
  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required" });
  }
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const r = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(clean)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    // 404 from XposedOrNot = not found in any known breach = good news.
    if (r.status === 404) {
      res.setHeader("Cache-Control", "public, max-age=600");
      return res.status(200).json({
        email: clean,
        breached: false,
        count: 0,
        breaches: [],
      });
    }

    if (!r.ok) {
      console.error("XposedOrNot error:", r.status);
      return res.status(502).json({ error: "Breach database unavailable" });
    }

    const data = await r.json();
    // API returns { breaches: [["Canva","Linkedin",...]] } on hits.
    const flat =
      Array.isArray(data?.breaches) && Array.isArray(data.breaches[0])
        ? data.breaches[0]
        : [];

    res.setHeader("Cache-Control", "public, max-age=600");
    return res.status(200).json({
      email: clean,
      breached: flat.length > 0,
      count: flat.length,
      breaches: flat.slice(0, 20),
    });
  } catch (err) {
    const msg = err.name === "TimeoutError" ? "Breach check timed out" : "Breach check failed";
    console.error("breach-check error:", err.message);
    return res.status(502).json({ error: msg });
  }
}

// ─── ROUTER ─────────────────────────────────────────────────────────

const HANDLERS = {
  whois: handleWhois,
  "security-headers": handleSecurityHeaders,
  "file-hash-check": handleFileHashCheck,
  "ai-explain": handleGeminiExplain,
  "breach-check": handleBreachCheck,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = applyRateLimit(req, { ipLimit: 20, userLimit: 60, windowMs: 60000 });
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  const tool = req.query.tool;
  const fn = HANDLERS[tool];

  if (!fn) {
    return res.status(400).json({ error: `Unknown tool: ${tool}. Valid: ${Object.keys(HANDLERS).join(", ")}` });
  }

  return fn(req, res);
}
