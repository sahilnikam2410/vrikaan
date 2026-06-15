import { applyRateLimit } from "./_rateLimit.js";
import { getAdminFirestore, getAdminAuth } from "./_firebaseAdmin.js";
import { waitUntil } from "@vercel/functions";

// ─── Tier gate (server-trusted) ─────────────────────────────────────
// Map each action → required plan tier.
// "free" = anyone (including unauthenticated)
// "pro"  = paid Pro plan OR allowed daily free-quota slots
// "enterprise" = Enterprise plan only, no free quota
const ACTION_TIERS = {
  // FREE tier (educational, public utility)
  whois:               "free",
  ip:                  "free",
  "breach-check":      "free",
  "password-check":    "free",
  "weekly-digest":     "free", // cron auth handled separately inside handler
  "leak-check":        "free",
  "newsletter-subscribe": "free",
  "enterprise-lead": "free",
  "coupon-validate": "free",
  "whatsapp-inbound": "free",  // Twilio webhook — no user auth, rate-limited by phone

  // PRO tier (AI, data-heavy, paid value)
  "scam-check":         "pro",
  "scam-dna":           "free",  // free → grows the community scam-intel network (the moat)
  "scambait":           "free",  // free → viral + harvests scam intel into Scam DNA
  "scam-dna-api":       "enterprise", // B2B: programmatic scam-intel for fintechs/banks (paid)
  "whatsapp":           "free",  // Meta Cloud API webhook (scam-check via WhatsApp)
  "risk-score":         "free",  // lead-gen — free to drive signups + upgrade intent
  "headers-fix":        "pro",
  "deepfake-audio":     "pro",
  "security-headers":   "pro",
  "file-hash-check":    "pro",
  "ai-explain":         "pro",
  "vuln-scan":          "pro",
  "vuln-synthesize":    "pro",

  // ENTERPRISE tier (team / webhooks / refunds / 2FA admin)
  "team-create":         "enterprise",
  "team-invite":         "enterprise",
  "team-accept-invite":  "enterprise",
  "team-remove-member":  "enterprise",
  // Family — accept/info/set-mode open to any plan (invited members may be
  // free-tier). create/invite/remove are owner-only and require Family plan.
  "family-create":         "family",
  "family-invite":         "family",
  "family-remove-member":  "family",
  "family-set-mode":       "family",
  "family-add-seat":       "family",
  "family-accept-invite":  "free",
  "family-info":           "free",
  "webhook-set":         "enterprise",
  "webhook-clear":       "enterprise",
  "webhook-test":        "enterprise",
  refund:                "enterprise",
  "totp-setup":          "free",  // 2FA available to all
  "totp-confirm":        "free",
  "totp-verify":         "free",
  "totp-disable":        "free",
};

// family = same Pro-tool access + family-specific features. Mirror of
// src/lib/toolTiers.js TIER_LEVEL — drift here = silent UI/backend mismatch.
const TIER_LEVEL = { free: 0, starter: 0, pro: 1, family: 1, enterprise: 2 };
function planMeetsTier(plan, required) {
  return (TIER_LEVEL[plan || "free"] ?? 0) >= (TIER_LEVEL[required || "free"] ?? 0);
}

// Daily free-quota for Pro tools — per-uid for authed users, per-IP fallback.
// 3 free uses per tool per day. In-memory; resets on cold start (acceptable).
const PRO_FREE_QUOTA_PER_DAY = 3;
const _quotaCounter = new Map(); // key: `${uid|ip}|${tool}|${YYYY-MM-DD}` → count
function _quotaKey(scope, tool) {
  const day = new Date().toISOString().slice(0, 10);
  return `${scope}|${tool}|${day}`;
}
function getFreeQuota(scope, tool) {
  const k = _quotaKey(scope, tool);
  const used = _quotaCounter.get(k) || 0;
  return { used, limit: PRO_FREE_QUOTA_PER_DAY, remaining: Math.max(0, PRO_FREE_QUOTA_PER_DAY - used) };
}
function bumpFreeQuota(scope, tool) {
  const k = _quotaKey(scope, tool);
  _quotaCounter.set(k, (_quotaCounter.get(k) || 0) + 1);
}

/**
 * Resolve caller plan from request — try Firebase ID token first
 * (browser users) then API token (external clients). Returns:
 *   { plan, uid, source } where source = "id-token" | "api-token" | "anon"
 */
async function resolveCaller(req) {
  const header = req.headers["authorization"] || "";
  // 1) Firebase ID token (Authorization: Bearer <jwt> from browser)
  const jwtMatch = /^Bearer\s+(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)\s*$/i.exec(header);
  if (jwtMatch) {
    const auth = getAdminAuth();
    const fs = getAdminFirestore();
    if (auth && fs) {
      try {
        const decoded = await auth.verifyIdToken(jwtMatch[1]);
        const uid = decoded.uid;
        let plan = "free";
        try {
          const snap = await fs.collection("users").doc(uid).get();
          plan = snap.exists ? (snap.data().plan || "free") : "free";
        } catch {}
        return { plan, uid, source: "id-token" };
      } catch {
        // Invalid/expired ID token → fall through to API token then anon
      }
    }
  }
  // 2) Long-lived API token (existing flow)
  const apiTok = await validateApiToken(header);
  if (apiTok.valid) return { plan: apiTok.plan || "free", uid: apiTok.uid, source: "api-token" };
  // 3) Anonymous
  return { plan: "free", uid: null, source: "anon" };
}

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

    // MalwareBazaar now requires a free Auth-Key (set ABUSECH_API_KEY in env).
    const mbKey = process.env.ABUSECH_API_KEY;
    const mbResponse = await fetch("https://mb-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: mbKey ? { "Auth-Key": mbKey } : {},
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    const mbData = await mbResponse.json();

    // Auth failure (missing/invalid key) → honest message, not silent "unknown".
    if (mbData.error || mbData.query_status === "unauthorized" || mbData.query_status === "illegal_auth") {
      console.error("MalwareBazaar auth error:", mbData.error || mbData.query_status);
      return res.status(503).json({ error: "Malware database needs configuration (ABUSECH_API_KEY). Try again later.", hash: hash.trim() });
    }

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

// ─── GEMINI helper: shared call wrapper ─────────────────────────────
// Used by all AI features below. Returns { ok, text, status, detail }.
// Pass json:true to force application/json response (no markdown fences,
// no prose) — required for any handler that does JSON.parse on the result.
// Model cascade — try primary first, fall back to older models on overload
// (503) or rate-limit (429). Gemini 2.5 Flash frequently returns "high demand"
// 503s; 2.0 / 1.5 Flash absorb the spillover. Each is a separate quota pool.
// All must be valid v1beta generateContent models. gemini-1.5-flash was
// removed from v1beta (404). gemini-flash-latest is a stable alias that
// always points at a live Flash model — safest tail of the cascade.
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

async function _geminiOnce(model, apiKey, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    let detail = "";
    try { detail = (JSON.parse(text)?.error?.message) || ""; } catch { detail = text.slice(0, 200); }
    return { ok: false, status: r.status, detail };
  }
  const data = await r.json();
  const out = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
  return out ? { ok: true, text: out, model } : { ok: false, status: 502, detail: "empty response" };
}

async function callGemini(prompt, { temperature = 0.4, maxOutputTokens = 1500, parts, json = false, models } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, status: 503, detail: "AI not configured" };
  const modelList = Array.isArray(models) && models.length ? models : GEMINI_MODELS;
  const reqParts = parts || [{ text: prompt }];
  const generationConfig = { temperature, maxOutputTokens };
  if (json) generationConfig.responseMimeType = "application/json";
  const body = {
    contents: [{ role: "user", parts: reqParts }],
    generationConfig,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const isTransient = (res) => res.status === 503 || res.status === 429
    || /high demand|overloaded|unavailable|exhausted/i.test(res.detail || "");

  // Run the full model cascade once. Returns first OK, or the last error.
  const runCascade = async () => {
    let last = { ok: false, status: 502, detail: "no model attempted" };
    for (const model of modelList) {
      try {
        const res = await _geminiOnce(model, apiKey, body);
        if (res.ok) return res;
        last = res;
        // Hard errors (400 bad request, 403 key) won't improve on another
        // model — bail immediately. Only keep cascading on transient capacity.
        if (!isTransient(res)) return res;
      } catch (err) {
        last = { ok: false, status: 502, detail: err.name === "TimeoutError" ? "timeout" : err.message };
      }
    }
    return last;
  };

  // First pass, then up to 2 more passes with growing backoff. Free-tier
  // capacity spikes ("high demand" 503) usually clear within a few seconds;
  // retrying the whole cascade with backoff absorbs most of them.
  let result = await runCascade();
  const backoffs = [1200, 3000];
  for (const wait of backoffs) {
    if (result.ok || !isTransient(result)) break;
    await new Promise((r) => setTimeout(r, wait));
    result = await runCascade();
  }
  return result;
}

// Tries to coerce Gemini's text into a JSON object — strips ```json fences.
function tryParseJson(text) {
  if (!text) return null;
  let s = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```\s*$/, "");
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  try { return JSON.parse(s); } catch { /* fall through to repair */ }

  // Repair pass: token-truncated responses often cut off mid-array/object.
  // Walk from the start, track string/brace/bracket depth, and close any
  // open structures at the last safe point. Salvages a partial-but-valid
  // object instead of returning null on a near-complete response.
  try {
    let body = s.slice(s.indexOf("{"));
    if (!body.startsWith("{")) return null;
    const stack = [];
    let inStr = false, esc = false, lastSafe = -1;
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
      else if (c === "}" || c === "]") stack.pop();
      // A comma or closing brace at depth 1 marks a boundary between
      // complete top-level key/value pairs — safe to truncate here.
      if (!inStr && stack.length === 1 && (c === "," )) lastSafe = i;
      if (!inStr && stack.length === 0) lastSafe = i; // full object already closed
    }
    if (lastSafe < 0) return null;
    let repaired = body.slice(0, lastSafe).replace(/,\s*$/, "");
    // Close whatever is still open, innermost first.
    // Recompute depth on the trimmed string.
    const open = [];
    let inS = false, es = false;
    for (let i = 0; i < repaired.length; i++) {
      const c = repaired[i];
      if (inS) { if (es) es = false; else if (c === "\\") es = true; else if (c === '"') inS = false; continue; }
      if (c === '"') inS = true;
      else if (c === "{") open.push("}");
      else if (c === "[") open.push("]");
      else if (c === "}" || c === "]") open.pop();
    }
    while (open.length) repaired += open.pop();
    return JSON.parse(repaired);
  } catch {
    return null;
  }
}

// ─── #20 SCAM ANALYZER ──────────────────────────────────────────────
// Paste an SMS / email / WhatsApp message, get verdict + red flags.
async function handleScamCheck(req, res) {
  const { text, channel = "unknown" } = req.body || {};
  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return res.status(400).json({ error: "text required (min 5 chars)" });
  }
  const trimmed = text.slice(0, 2000);
  const prompt = `You are a cybersecurity expert helping an Indian user. Analyze this ${channel} message for scam / phishing indicators. Common India-specific scams: UPI fraud, KYC update SMS, fake parcel-delivery, OTP requests, fake bank alerts, electricity-bill disconnection threats, fake GST/income-tax notices.

Message:
"""
${trimmed}
"""

Reply ONLY with a strict JSON object — no markdown fences, no commentary — matching this shape:
{
  "verdict": "safe" | "suspicious" | "dangerous",
  "score": 0-100 (higher = more dangerous),
  "category": "phishing" | "upi-fraud" | "scam" | "spam" | "legitimate" | "unknown",
  "redFlags": [string, ...],   // 0-6 short bullet points naming specific suspicious elements
  "reasoning": "1-2 sentence summary in plain English (or Hindi if message was Hindi)",
  "advice": [string, ...]       // 2-4 short actionable steps the user should take
}`;
  const r = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 1500, json: true });
  if (!r.ok) return res.status(r.status || 502).json({ error: r.detail || "AI unavailable" });
  const parsed = tryParseJson(r.text);
  if (!parsed || typeof parsed.verdict !== "string") {
    console.error("scam-check parse failed. raw:", r.text?.slice(0, 600));
    return res.status(502).json({ error: "AI returned malformed result", raw: r.text?.slice(0, 600) });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    verdict: parsed.verdict,
    score: Number(parsed.score) || 0,
    category: parsed.category || "unknown",
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.slice(0, 6) : [],
    reasoning: parsed.reasoning || "",
    advice: Array.isArray(parsed.advice) ? parsed.advice.slice(0, 4) : [],
    model: "gemini-2.5-flash",
  });
}

// ─── PERSONALIZED CYBER RISK SCORE ──────────────────────────────────
// Takes a lightweight self-assessment signal set (breach hits, tools used,
// habits) and returns an AI-generated 0-100 risk score + prioritized
// action plan. Drives upgrade intent (high risk → "fix with Pro tools").
async function handleRiskScore(req, res) {
  const { signals } = req.body || {};
  if (!signals || typeof signals !== "object") {
    return res.status(400).json({ error: "signals object required" });
  }
  // Whitelist + clamp the inputs we accept (never trust client blindly).
  const s = {
    breachCount: Math.max(0, Math.min(50, Number(signals.breachCount) || 0)),
    reusesPasswords: !!signals.reusesPasswords,
    has2FA: !!signals.has2FA,
    usesVPN: !!signals.usesVPN,
    clickedScamRecently: !!signals.clickedScamRecently,
    sharesOTP: !!signals.sharesOTP,
    oldDevices: !!signals.oldDevices,
    publicWifi: !!signals.publicWifi,
    familyExposed: !!signals.familyExposed,
    upiHeavy: !!signals.upiHeavy,
    ageBand: ["under25", "25-40", "40-60", "60plus"].includes(signals.ageBand) ? signals.ageBand : "25-40",
  };
  const prompt = `You are an Indian cybersecurity analyst. Given this user's self-reported security posture, compute a personalized cyber RISK score (0-100, higher = more at risk) and a prioritized action plan. Weight India-specific threats: UPI fraud, OTP-sharing, deepfake voice scams targeting families, public-wifi MITM, password reuse.

User signals (JSON): ${JSON.stringify(s)}

Return a JSON object with these exact keys:
- "score": integer 0-100 (higher = more at risk)
- "band": one of "low", "moderate", "high", "critical"
- "headline": one punchy plain-English sentence summarizing their risk
- "topRisks": array of 3 to 5 objects, worst first, each {"risk": short name, "why": one line, "severity": "low" | "medium" | "high"}
- "quickWins": array of 3 to 5 objects, each {"action": short imperative, "tool": a VRIKAAN tool path like "/password-vault" or null, "effortMins": integer}
- "proPitch": one sentence naming the VRIKAAN Pro or Family feature that would most reduce this user's risk

Keep every string under 90 characters. topRisks and quickWins must each have at most 4 items. Output only compact minified JSON on a single line with no extra whitespace, no newlines, no indentation.`;
  const r = await callGemini(prompt, { temperature: 0.3, maxOutputTokens: 4096, json: true });
  if (!r.ok) return res.status(r.status || 502).json({ error: r.detail || "AI unavailable" });
  const parsed = tryParseJson(r.text);
  if (!parsed || typeof parsed.score === "undefined") {
    console.error("risk-score parse failed. raw:", (r.text || "").slice(0, 800));
    return res.status(502).json({ error: "AI returned malformed result", raw: (r.text || "").slice(0, 300) });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    band: parsed.band || "moderate",
    headline: parsed.headline || "",
    topRisks: Array.isArray(parsed.topRisks) ? parsed.topRisks.slice(0, 5) : [],
    quickWins: Array.isArray(parsed.quickWins) ? parsed.quickWins.slice(0, 5) : [],
    proPitch: parsed.proPitch || "",
    model: "gemini-2.5-flash",
  });
}

// ─── #24 SECURITY HEADERS — AUTO-FIX RECOMMENDER ────────────────────
// Given a security-headers scan result, generate copy-paste-ready fixed CSP / HSTS / etc.
async function handleHeadersFix(req, res) {
  const { url, headers, missing } = req.body || {};
  if (!url) return res.status(400).json({ error: "url required" });
  const prompt = `You are a security engineer. The following site has security-header issues. Provide copy-paste-ready replacement headers in standard format (one header per line, "Header-Name: value").

Site: ${url}
Current headers: ${JSON.stringify(headers || {}).slice(0, 1500)}
Missing/weak: ${JSON.stringify(missing || []).slice(0, 600)}

Reply ONLY with a strict JSON object — no markdown fences:
{
  "fixedHeaders": "Content-Security-Policy: ...\\nStrict-Transport-Security: ...\\n...",   // multi-line string, ready to copy
  "explanations": [ { "header": "Content-Security-Policy", "why": "1-line reason" }, ... ],
  "platformTips": {
    "vercel": "...",      // how to set on Vercel
    "nginx":  "...",      // and Nginx
    "apache": "..."       // and Apache
  }
}`;
  const r = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 4000, json: true });
  if (!r.ok) return res.status(r.status || 502).json({ error: r.detail || "AI unavailable" });
  const parsed = tryParseJson(r.text);
  if (!parsed || !parsed.fixedHeaders) {
    console.error("headers-fix parse failed. raw:", r.text?.slice(0, 1000));
    return res.status(502).json({ error: "AI returned malformed fix", raw: r.text?.slice(0, 1000) });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    fixedHeaders: parsed.fixedHeaders,
    explanations: Array.isArray(parsed.explanations) ? parsed.explanations : [],
    platformTips: parsed.platformTips || {},
    model: "gemini-2.5-flash",
  });
}

// ─── #21 DEEPFAKE / SCAM-AUDIO DETECTOR ─────────────────────────────
// Accepts a base64 audio clip + mime type, returns verdict + reasoning.
// Uses Gemini multimodal (inlineData parts).
async function handleDeepfakeAudio(req, res) {
  const { audioBase64, mimeType, transcript } = req.body || {};
  if (!audioBase64 || !mimeType) return res.status(400).json({ error: "audioBase64 and mimeType required" });
  // Hard cap: 5 MB base64 (~3.7 MB binary). Prevents request-size blowups.
  if (audioBase64.length > 7_000_000) return res.status(413).json({ error: "Audio too large (max ~5 MB)" });
  const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/m4a", "audio/mp4"];
  if (!allowed.some((m) => mimeType.startsWith(m.split("/")[0]) && mimeType.includes(m.split("/")[1].split(";")[0]))) {
    // be permissive — Gemini supports most audio types
  }
  const prompt = `You are a cautious cybersecurity analyst screening audio for AI-generated voice (deepfake) and for vishing / scam-call scripts.

CRITICAL CALIBRATION — read carefully:
- Modern text-to-speech (ElevenLabs, PlayHT, OpenAI, etc.) produces CLEAN, natural-sounding voice WITH realistic breaths, pauses and prosody. Clean, smooth, studio-quality, single-speaker narration (e.g. a documentary voiceover) is EXACTLY what high-end AI voice sounds like. Therefore "it sounds natural / no artifacts" is NOT evidence that it is a real human. Do NOT output "likely-real" just because the audio is clean.
- Only choose "likely-real" when there is positive evidence of liveness: spontaneous unscripted speech, natural disfluencies (um/uh, false starts, stutters), overlapping speakers, irregular background/room noise, mouth/lip sounds, or call-quality phone artifacts — i.e. things current TTS rarely reproduces.
- If the audio is clean, scripted, smooth narration with no liveness cues, you CANNOT confirm it is human — return "uncertain" (NOT "likely-real").
- Only choose "likely-deepfake" when you hear concrete synthesis artifacts (robotic cadence, pitch glitches, unnatural splice/word boundaries, no breaths at all, metallic timbre).
- Be honest about the limit: acoustic deepfake detection is unreliable for high-quality TTS; when unsure, say uncertain.

Also detect social-engineering / vishing scripts (urgency, authority impersonation, OTP/UPI-PIN requests, payment demands, fake bank/police/courier/tax-officer). If a scam script is present, that is the dominant risk regardless of voice authenticity.

${transcript ? `Provided transcript (context only, do not trust absolutely):\n"""\n${transcript.slice(0, 2000)}\n"""\n` : ""}

Reply ONLY with a strict JSON object — no markdown fences:
{
  "verdict": "likely-real" | "likely-deepfake" | "scam-script" | "uncertain",
  "score": 0-100 (risk; clean unverifiable narration = ~45-60 uncertain, NOT near 0),
  "indicators": [string, ...],          // 0-6 specific things you heard (cite liveness cues or their ABSENCE)
  "transcript": "best-effort transcript of what the speaker says",
  "scamCategory": "vishing" | "fake-bank" | "fake-courier" | "fake-tax" | "fake-police" | "investment-scam" | "none",
  "advice": [string, ...]               // 2-4 next steps
}`;
  const parts = [
    { inlineData: { mimeType, data: audioBase64 } },
    { text: prompt },
  ];
  // Audio is heaviest on gemini-2.5-flash (most-demanded pool). Try the
  // less-congested 2.0-flash first, then 2.5, then the stable alias.
  const r = await callGemini("", {
    temperature: 0.2, maxOutputTokens: 2500, parts, json: true,
    models: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"],
  });
  if (!r.ok) {
    const transient = r.status === 503 || r.status === 429
      || /high demand|overloaded|unavailable|exhausted|timeout/i.test(r.detail || "");
    if (transient) {
      return res.status(503).json({
        error: "Our AI is briefly overloaded with requests. Please tap Analyze again in a few seconds.",
        retryable: true,
      });
    }
    return res.status(r.status || 502).json({ error: r.detail || "AI unavailable" });
  }
  const parsed = tryParseJson(r.text);
  if (!parsed || typeof parsed.verdict !== "string") {
    console.error("deepfake-audio parse failed. raw:", r.text?.slice(0, 600));
    return res.status(502).json({ error: "AI returned malformed result", raw: r.text?.slice(0, 600) });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    verdict: parsed.verdict,
    score: Number(parsed.score) || 0,
    indicators: Array.isArray(parsed.indicators) ? parsed.indicators.slice(0, 6) : [],
    transcript: parsed.transcript || "",
    scamCategory: parsed.scamCategory || "none",
    advice: Array.isArray(parsed.advice) ? parsed.advice.slice(0, 4) : [],
    model: "gemini-2.5-flash",
  });
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

// ─── PASSWORD CHECK (HIBP k-anonymity range) ───────────────────────

async function handlePasswordCheck(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  const { hash } = req.body || {};
  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{5}$/.test(hash)) {
    return res.status(400).json({ error: "Invalid hash prefix. Send exactly 5 hex characters." });
  }
  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hash.toUpperCase()}`,
      { headers: { "User-Agent": "VRIKAAN/1.0" } }
    );
    if (!response.ok) throw new Error(`HIBP API returned ${response.status}`);
    const text = await response.text();
    return res.status(200).send(text);
  } catch {
    return res.status(502).json({ error: "Password check service temporarily unavailable" });
  }
}

// ─── IP LOOKUP ──────────────────────────────────────────────────────

async function handleIpLookup(req, res) {
  const fields = "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,proxy,hosting";
  const q = req.query?.q || req.body?.q;
  const clientIP = q || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.headers["x-real-ip"] || "";
  const endpoint = clientIP
    ? `http://ip-api.com/json/${encodeURIComponent(clientIP)}?fields=${fields}`
    : `http://ip-api.com/json/?fields=${fields}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ status: "fail", message: "IP lookup service unavailable" });
  }
}

// ─── WEEKLY DIGEST CRON ─────────────────────────────────────────────

const DIGEST_TIPS = [
  "Rotate any password you reused on a service that's been in the news for a breach in the last 30 days.",
  "Run a Dark Web check on your two most-used email addresses; treat hits as homework.",
  "Review your phone's installed apps — uninstall anything you haven't opened in 90 days.",
  "Confirm 2FA is on for email, banking, primary social account, and any account holding payment info.",
  "Audit browser extensions; remove anything with broad permissions you don't recognize.",
];
const DIGEST_TOOLS = [
  { name: "Phishing Trainer", desc: "5 min quiz, real-world examples" },
  { name: "Security Audit", desc: "Personal score with action items" },
  { name: "Vulnerability Scanner", desc: "Spot risky open ports and outdated services" },
];

function digestWeekIdx(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / 86400000 / 7);
}

function buildDigestMsg(name, weekIdx) {
  const tip = DIGEST_TIPS[weekIdx % DIGEST_TIPS.length];
  const tool = DIGEST_TOOLS[weekIdx % DIGEST_TOOLS.length];
  return `Hi ${name || "there"},

Your weekly security digest from VRIKAAN.

🎯 This week's action item:
${tip}

🛠 Tool highlight: ${tool.name}
${tool.desc}
Try it: https://vrikaan.com/dashboard

📊 Quick health checks (2 min each):
- Have any accounts been breached? https://vrikaan.com/dark-web-monitor
- Is your DNS leaking? https://vrikaan.com/dns-leak-test
- Has your security headers grade slipped? https://vrikaan.com/security-headers

Stay safe,
The VRIKAAN Team`;
}

// Delete activity-log + tool-history entries older than RETENTION_DAYS across
// all users. Uses Admin SDK (FIREBASE_SERVICE_ACCOUNT). Returns counts.
// Designed to be called from the weekly cron piggy-back so we don't burn a
// dedicated function slot.
async function runActivityCleanup({ retentionDays = 90, batchLimit = 500 } = {}) {
  let admin;
  try {
    admin = await import("./_firebaseAdmin.js");
  } catch (e) {
    return { error: "admin import failed: " + e.message };
  }
  const fs = admin.getAdminFirestore();
  if (!fs) return { error: "FIREBASE_SERVICE_ACCOUNT not set" };

  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const cutoffTs = admin.getAdminFirestore && fs ? new Date(cutoffMs) : null;

  let activityDeleted = 0, historyDeleted = 0, usersScanned = 0;
  try {
    const usersSnap = await fs.collection("users").select().limit(2000).get();
    for (const userDoc of usersSnap.docs) {
      usersScanned++;
      // activity
      const aSnap = await fs.collection("users").doc(userDoc.id).collection("activity")
        .where("timestamp", "<", cutoffTs).limit(batchLimit).get();
      if (!aSnap.empty) {
        const batch = fs.batch();
        aSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        activityDeleted += aSnap.size;
      }
      // toolHistory
      const tSnap = await fs.collection("users").doc(userDoc.id).collection("toolHistory")
        .where("timestamp", "<", cutoffTs).limit(batchLimit).get();
      if (!tSnap.empty) {
        const batch = fs.batch();
        tSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        historyDeleted += tSnap.size;
      }
    }
    return { usersScanned, activityDeleted, historyDeleted, retentionDays };
  } catch (e) {
    return { error: e.message, usersScanned, activityDeleted, historyDeleted };
  }
}

async function handleWeeklyDigest(req, res) {
  // Cron auth
  const expected = process.env.CRON_SECRET;
  const got = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  if (!expected || got !== expected) return res.status(401).json({ error: "Unauthorized" });

  // Always run activity-log cleanup (cheap; piggy-backs on the weekly slot)
  const cleanup = await runActivityCleanup();
  console.log("weekly-digest: cleanup result:", JSON.stringify(cleanup));

  const isMonday = new Date().getUTCDay() === 1;
  const force = String(req.query?.force || "") === "1";
  if (!isMonday && !force) return res.status(200).json({ skipped: true, reason: "not Monday UTC", cleanup });

  // Read opt-in list via Admin SDK (server-only — no public read needed, so
  // digest_subscribers can be locked down to owner-only in firestore.rules).
  const _adminMod = await import("./_firebaseAdmin.js");
  const _fs = _adminMod.getAdminFirestore();
  if (!_fs) return res.status(500).json({ error: "Admin SDK not configured" });

  try {
    const _snap = await _fs.collection("digest_subscribers").limit(2000).get();
    const users = _snap.docs
      .map((d) => ({ email: d.data().email || "", name: d.data().name || "" }))
      .filter((u) => u.email);

    // Sanity-check EmailJS env vars early so the failure mode is visible.
    const sid = process.env.VITE_EMAILJS_SERVICE_ID;
    const tpl = process.env.VITE_EMAILJS_NOTIFY_TEMPLATE;
    const pub = process.env.VITE_EMAILJS_PUBLIC_KEY;
    const priv = process.env.EMAILJS_PRIVATE_KEY; // server-side only, optional
    if (!sid || !tpl || !pub) {
      const missing = [
        !sid && "VITE_EMAILJS_SERVICE_ID",
        !tpl && "VITE_EMAILJS_NOTIFY_TEMPLATE",
        !pub && "VITE_EMAILJS_PUBLIC_KEY",
      ].filter(Boolean).join(", ");
      console.error("weekly-digest: missing EmailJS env vars:", missing);
      return res.status(500).json({ error: `Missing env: ${missing}` });
    }

    const weekIdx = digestWeekIdx(new Date());
    const subject = `Your VRIKAAN weekly digest — wk ${weekIdx}`;
    const lastErrors = [];
    let ok = 0, fail = 0;
    for (const u of users) {
      try {
        const payload = {
          service_id: sid,
          template_id: tpl,
          user_id: pub,
          ...(priv ? { accessToken: priv } : {}),
          template_params: {
            to_name: u.name || "User",
            to_email: u.email,
            from_name: "VRIKAAN",
            subject,
            message: buildDigestMsg(u.name, weekIdx),
          },
        };
        const er = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", origin: "https://www.vrikaan.com" },
          body: JSON.stringify(payload),
        });
        if (er.ok) {
          ok++;
        } else {
          const body = await er.text();
          console.warn(`EmailJS ${er.status} for ${u.email}:`, body.slice(0, 300));
          if (lastErrors.length < 3) lastErrors.push({ status: er.status, body: body.slice(0, 200) });
          fail++;
        }
      } catch (e) {
        console.warn(`EmailJS exception for ${u.email}:`, e.message);
        if (lastErrors.length < 3) lastErrors.push({ exception: e.message });
        fail++;
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    console.log(`weekly-digest: ok=${ok} fail=${fail} total=${users.length}`);
    return res.status(200).json({ sent: ok, failed: fail, total: users.length, errors: lastErrors, cleanup });
  } catch (err) {
    console.error("weekly-digest error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── LEAK CHECK ─────────────────────────────────────────────────────

async function handleLeakCheck(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    "";
  const out = { ip: {}, trace: "" };
  try {
    // ipinfo.io — free tier (50k/month) returns ip/city/region/country/org without a token
    const url = ip ? `https://ipinfo.io/${ip}/json` : "https://ipinfo.io/json";
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
    const j = await r.json();
    out.ip = {
      ip: j.ip,
      city: j.city,
      region: j.region,
      country: j.country,
      country_name: j.country, // ipinfo returns country code only; client uses either field
      org: j.org || "",
    };
  } catch (e) {
    out.ip = { error: e.message };
  }
  try {
    // Cloudflare trace from server gives the egress IP/colo that the Vercel
    // function exits through — useful as a sanity check but NOT the user's resolver.
    const r = await fetch("https://1.1.1.1/cdn-cgi/trace", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    out.trace = await r.text();
  } catch (e) {
    out.trace = "";
    out.traceError = e.message;
  }
  return res.status(200).json(out);
}

// ─── TEAMS / ORG ACCOUNTS ───────────────────────────────────────────

// Create a team. Caller becomes owner + admin member.
async function handleTeamCreate(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { name } = req.body || {};
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Team name required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const teamRef = await fs.collection("teams").add({
    name: name.trim().slice(0, 60),
    ownerUid: me.uid,
    ownerEmail: me.email,
    members: { [me.uid]: "admin" },
    memberEmails: [me.email],
    createdAt: new Date(),
  });
  // Stamp current team on user
  await fs.collection("users").doc(me.uid).set({ currentTeamId: teamRef.id }, { merge: true });
  return res.status(200).json({ success: true, teamId: teamRef.id });
}

// Invite a member by email. Creates a pending invite the invitee accepts on
// next sign-in (handled by team-accept-invite called from the client).
async function handleTeamInvite(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { teamId, email } = req.body || {};
  if (!teamId || !email) return res.status(400).json({ error: "teamId and email required" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Invalid email" });

  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const teamSnap = await fs.collection("teams").doc(teamId).get();
  if (!teamSnap.exists) return res.status(404).json({ error: "Team not found" });
  const team = teamSnap.data();
  if (team.members?.[me.uid] !== "admin") return res.status(403).json({ error: "Only team admins can invite" });
  if (team.memberEmails?.includes(email)) return res.status(400).json({ error: "Already a member" });

  // Idempotent — if a pending invite exists, return it
  const existing = await fs.collection("teamInvites")
    .where("teamId", "==", teamId).where("email", "==", email).where("status", "==", "pending").limit(1).get();
  if (!existing.empty) {
    return res.status(200).json({ success: true, inviteId: existing.docs[0].id, alreadyInvited: true });
  }
  const inv = await fs.collection("teamInvites").add({
    teamId, email, invitedBy: me.uid, invitedByEmail: me.email,
    teamName: team.name, status: "pending", createdAt: new Date(),
  });
  return res.status(200).json({ success: true, inviteId: inv.id });
}

// Accept a pending invite (caller must match invite.email).
async function handleTeamAcceptInvite(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { inviteId } = req.body || {};
  if (!inviteId) return res.status(400).json({ error: "inviteId required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const invSnap = await fs.collection("teamInvites").doc(inviteId).get();
  if (!invSnap.exists) return res.status(404).json({ error: "Invite not found" });
  const inv = invSnap.data();
  if (inv.status !== "pending") return res.status(400).json({ error: "Invite already used" });
  if ((inv.email || "").toLowerCase() !== (me.email || "").toLowerCase()) {
    return res.status(403).json({ error: "Invite is for a different email" });
  }

  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  await fs.collection("teams").doc(inv.teamId).update({
    [`members.${me.uid}`]: "member",
    memberEmails: FieldValue.arrayUnion(me.email),
  });
  await invSnap.ref.update({ status: "accepted", acceptedAt: new Date(), acceptedBy: me.uid });
  await fs.collection("users").doc(me.uid).set({ currentTeamId: inv.teamId }, { merge: true });
  return res.status(200).json({ success: true, teamId: inv.teamId });
}

// Remove a member. Owner only. Cannot remove yourself if owner (use delete-team flow instead — out of MVP scope).
async function handleTeamRemoveMember(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { teamId, uid } = req.body || {};
  if (!teamId || !uid) return res.status(400).json({ error: "teamId and uid required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const teamSnap = await fs.collection("teams").doc(teamId).get();
  if (!teamSnap.exists) return res.status(404).json({ error: "Team not found" });
  const team = teamSnap.data();
  if (team.ownerUid !== me.uid) return res.status(403).json({ error: "Only the owner can remove members" });
  if (uid === team.ownerUid) return res.status(400).json({ error: "Cannot remove owner" });
  const memberSnap = await fs.collection("users").doc(uid).get();
  const memberEmail = memberSnap.data()?.email;
  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  await teamSnap.ref.update({
    [`members.${uid}`]: FieldValue.delete(),
    memberEmails: FieldValue.arrayRemove(memberEmail),
  });
  // Clear team pointer on removed user if it pointed to this team
  if (memberSnap.data()?.currentTeamId === teamId) {
    await fs.collection("users").doc(uid).update({ currentTeamId: null });
  }
  return res.status(200).json({ success: true });
}

// ─── FAMILY PLAN (multi-seat, kid/senior modes) ─────────────────────
// Shared model: families/{id} doc holds owner + member map + per-member modes.
// Invites use familyInvites/{id} (same shape as teamInvites). Server-side
// plan-check on create/invite — must be on Family plan and respect seatLimit.

async function _getFamilyByOwner(fs, uid) {
  const snap = await fs.collection("families").where("ownerUid", "==", uid).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function _userPlan(fs, uid) {
  const u = await fs.collection("users").doc(uid).get();
  return u.exists ? (u.data().plan || "free") : "free";
}

// Create a family doc for the caller (must be on Family plan).
// Idempotent — returns existing family if already created.
async function handleFamilyCreate(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const plan = await _userPlan(fs, me.uid);
  if (plan !== "family") return res.status(403).json({ error: "Family plan required" });

  const existing = await _getFamilyByOwner(fs, me.uid);
  if (existing) return res.status(200).json({ success: true, familyId: existing.id, existed: true });

  const ref = await fs.collection("families").add({
    ownerUid: me.uid,
    ownerEmail: me.email,
    seatLimit: 5,                  // default; bump via add-on purchase
    members: { [me.uid]: "owner" },
    memberEmails: [me.email],
    modes: { [me.uid]: { kidMode: false, seniorMode: false } },
    billingPlan: "family",
    createdAt: new Date(),
  });
  await fs.collection("users").doc(me.uid).set({ currentFamilyId: ref.id }, { merge: true });
  return res.status(200).json({ success: true, familyId: ref.id });
}

// Invite a member by email + role. Owner only. Respects seatLimit.
async function handleFamilyInvite(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { familyId, email, role } = req.body || {};
  if (!familyId || !email) return res.status(400).json({ error: "familyId and email required" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Invalid email" });
  const validRole = ["member", "kid", "senior"].includes(role) ? role : "member";

  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const famSnap = await fs.collection("families").doc(familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family not found" });
  const fam = famSnap.data();
  if (fam.ownerUid !== me.uid) return res.status(403).json({ error: "Only the owner can invite" });
  if (fam.memberEmails?.includes(email)) return res.status(400).json({ error: "Already a member" });
  const seatsUsed = Object.keys(fam.members || {}).length;
  if (seatsUsed >= (fam.seatLimit || 5)) {
    return res.status(400).json({ error: `Seat limit reached (${fam.seatLimit}). Buy extra seats at ₹49/mo each.` });
  }

  // Idempotent — return existing pending invite if any. Also RESEND the
  // email so a first-attempt Brevo failure can be recovered by clicking
  // "Send invite" again (previously the resend silently no-op'd).
  const existing = await fs.collection("familyInvites")
    .where("familyId", "==", familyId).where("email", "==", email).where("status", "==", "pending").limit(1).get();
  if (!existing.empty) {
    const existingInv = existing.docs[0];
    _sendFamilyInviteEmail({
      toEmail: email,
      ownerName: me.displayName || fam.ownerEmail.split("@")[0],
      ownerEmail: fam.ownerEmail,
      role: existingInv.data().role || validRole,
      inviteId: existingInv.id,
      appUrl: (req.headers["origin"] || "https://vrikaan.com").replace(/\/$/, ""),
    }).catch(err => console.warn("family-invite mail resend failed:", err.message));
    return res.status(200).json({ success: true, inviteId: existingInv.id, alreadyInvited: true, resent: true });
  }
  const inv = await fs.collection("familyInvites").add({
    familyId, email, role: validRole, invitedBy: me.uid, invitedByEmail: me.email,
    ownerEmail: fam.ownerEmail, status: "pending", createdAt: new Date(),
  });

  // Fire-and-forget Brevo transactional email. Don't block invite creation on
  // mail failure — invite still works via in-app banner on accept page.
  _sendFamilyInviteEmail({
    toEmail: email,
    ownerName: me.displayName || fam.ownerEmail.split("@")[0],
    ownerEmail: fam.ownerEmail,
    role: validRole,
    inviteId: inv.id,
    appUrl: (req.headers["origin"] || "https://vrikaan.com").replace(/\/$/, ""),
  }).catch(err => console.warn("family-invite mail send failed:", err.message));

  return res.status(200).json({ success: true, inviteId: inv.id });
}

// Send Brevo transactional invite email. Inline HTML — no template ID needed.
// Uses BREVO_API_KEY env var. Silently no-ops if key missing.
async function _sendFamilyInviteEmail({ toEmail, ownerName, ownerEmail, role, inviteId, appUrl }) {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) return;

  const roleCopy = role === "kid" ? "as a kid (scam-block + safe browsing)"
    : role === "senior" ? "as a senior (UPI guard + voice alerts)"
    : "as an adult member";
  const acceptUrl = `${appUrl}/family?invite=${encodeURIComponent(inviteId)}`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f1f5f9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#030712">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" style="max-width:560px;background:#0f172a;border:1px solid rgba(148,163,184,0.12);border-radius:18px;overflow:hidden">
        <tr><td style="padding:36px 36px 0">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ec4899;margin-bottom:14px">VRIKAAN · Family Invite</div>
          <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 14px;line-height:1.3">
            ${escapeHtml(ownerName)} added you to their VRIKAAN Family
          </h1>
          <p style="font-size:15px;color:#94a3b8;line-height:1.7;margin:0 0 22px">
            You've been invited ${roleCopy} on the VRIKAAN Family plan — India's AI cyber defense for individuals, families and seniors.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 28px">
          <a href="${acceptUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#ec4899,#6366f1);color:#fff;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;letter-spacing:0.3px">
            Accept invite →
          </a>
        </td></tr>
        <tr><td style="padding:0 36px 28px">
          <div style="padding:14px 18px;background:rgba(20,227,197,0.06);border:1px solid rgba(20,227,197,0.18);border-radius:10px;font-size:12px;color:#cbd5e1;line-height:1.6">
            <strong style="color:#14e3c5">What you get:</strong> real-time scam detection · dark-web monitoring · family scam-alert broadcast · shared safe-word vault · ${role === "kid" ? "safe browsing" : role === "senior" ? "UPI scam guard" : "identity monitoring"}.
          </div>
        </td></tr>
        <tr><td style="padding:0 36px 32px;border-top:1px solid rgba(148,163,184,0.08)">
          <p style="font-size:11px;color:#64748b;margin:18px 0 6px;line-height:1.6">
            Invited by <a href="mailto:${escapeHtml(ownerEmail)}" style="color:#94a3b8;text-decoration:none">${escapeHtml(ownerEmail)}</a> · If you don't recognise them, ignore this email.
          </p>
          <p style="font-size:11px;color:#64748b;margin:0;line-height:1.6">
            VRIKAAN — India's AI cyber defense. <a href="${appUrl}" style="color:#14e3c5;text-decoration:none">vrikaan.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const textFallback = `${ownerName} added you to their VRIKAAN Family plan ${roleCopy}.\n\nAccept the invite: ${acceptUrl}\n\nIf you don't recognise them, ignore this email.\n\n— VRIKAAN`;

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "VRIKAAN", email: "noreply@vrikaan.com" },
      to: [{ email: toEmail }],
      replyTo: { email: ownerEmail, name: ownerName },
      subject: `${ownerName} invited you to their VRIKAAN Family`,
      htmlContent: html,
      textContent: textFallback,
      tags: ["family-invite"],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Brevo ${resp.status}: ${t.slice(0, 200)}`);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Accept invite. Caller email must match invite.email. Re-checks seatLimit.
async function handleFamilyAcceptInvite(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { inviteId } = req.body || {};
  if (!inviteId) return res.status(400).json({ error: "inviteId required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const invSnap = await fs.collection("familyInvites").doc(inviteId).get();
  if (!invSnap.exists) return res.status(404).json({ error: "Invite not found" });
  const inv = invSnap.data();
  if (inv.status !== "pending") return res.status(400).json({ error: "Invite already used" });
  if ((inv.email || "").toLowerCase() !== (me.email || "").toLowerCase()) {
    return res.status(403).json({ error: "Invite is for a different email" });
  }

  const famSnap = await fs.collection("families").doc(inv.familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family no longer exists" });
  const fam = famSnap.data();
  const seatsUsed = Object.keys(fam.members || {}).length;
  if (seatsUsed >= (fam.seatLimit || 5)) {
    return res.status(400).json({ error: "Family is full — owner must free a seat or buy add-on." });
  }

  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  await famSnap.ref.update({
    [`members.${me.uid}`]: inv.role || "member",
    [`modes.${me.uid}`]: {
      kidMode: inv.role === "kid",
      seniorMode: inv.role === "senior",
    },
    memberEmails: FieldValue.arrayUnion(me.email),
  });
  await invSnap.ref.update({ status: "accepted", acceptedAt: new Date(), acceptedBy: me.uid });
  await fs.collection("users").doc(me.uid).set({
    currentFamilyId: inv.familyId,
    familyRole: inv.role || "member",
  }, { merge: true });
  return res.status(200).json({ success: true, familyId: inv.familyId, role: inv.role });
}

// Remove member. Owner only. Cannot remove self.
async function handleFamilyRemoveMember(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { familyId, uid } = req.body || {};
  if (!familyId || !uid) return res.status(400).json({ error: "familyId and uid required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const famSnap = await fs.collection("families").doc(familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family not found" });
  const fam = famSnap.data();
  if (fam.ownerUid !== me.uid) return res.status(403).json({ error: "Only the owner can remove members" });
  if (uid === fam.ownerUid) return res.status(400).json({ error: "Cannot remove owner" });

  const memberSnap = await fs.collection("users").doc(uid).get();
  const memberEmail = memberSnap.data()?.email;
  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  const updatePayload = {
    [`members.${uid}`]: FieldValue.delete(),
    [`modes.${uid}`]: FieldValue.delete(),
  };
  // arrayRemove(undefined) throws — only include when email actually known.
  if (memberEmail) updatePayload.memberEmails = FieldValue.arrayRemove(memberEmail);
  await famSnap.ref.update(updatePayload);
  if (memberSnap.data()?.currentFamilyId === familyId) {
    await fs.collection("users").doc(uid).update({ currentFamilyId: null, familyRole: null });
  }
  return res.status(200).json({ success: true });
}

// Owner-only: toggle kid/senior mode for a member.
async function handleFamilySetMode(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { familyId, uid, kidMode, seniorMode } = req.body || {};
  if (!familyId || !uid) return res.status(400).json({ error: "familyId and uid required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const famSnap = await fs.collection("families").doc(familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family not found" });
  const fam = famSnap.data();
  if (fam.ownerUid !== me.uid) return res.status(403).json({ error: "Only the owner can change modes" });
  if (!fam.members?.[uid]) return res.status(404).json({ error: "Member not in family" });
  await famSnap.ref.update({
    [`modes.${uid}`]: { kidMode: !!kidMode, seniorMode: !!seniorMode },
  });
  return res.status(200).json({ success: true });
}

// Family owner buys an extra seat (₹49/mo). Caller supplies a Cashfree
// orderId for plan=family_addon_*. Endpoint verifies w/ Cashfree, bumps
// seatLimit by 1. Idempotent — records processed orderId on the family doc
// so the same purchase can't add multiple seats on retry.
async function handleFamilyAddSeat(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { familyId, orderId } = req.body || {};
  if (!familyId || !orderId) return res.status(400).json({ error: "familyId and orderId required" });

  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  const famSnap = await fs.collection("families").doc(familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family not found" });
  const fam = famSnap.data();
  if (fam.ownerUid !== me.uid) return res.status(403).json({ error: "Only the owner can buy seats" });
  if ((fam.seatAddonOrderIds || []).includes(orderId)) {
    return res.status(200).json({ success: true, alreadyApplied: true, seatLimit: fam.seatLimit });
  }

  // Verify w/ Cashfree
  const CF_API = process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";
  const cfResp = await fetch(`${CF_API}/${orderId}`, {
    headers: {
      "x-api-version": "2023-08-01",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    },
  });
  const cfData = await cfResp.json();
  if (!cfResp.ok) return res.status(400).json({ error: "Cashfree verify failed" });
  if (cfData.order_status !== "PAID") return res.status(400).json({ error: "Payment not completed" });
  const cfPlan = cfData.order_tags?.plan || "";
  if (!cfPlan.startsWith("family_addon")) {
    return res.status(400).json({ error: "Order is not a family seat add-on" });
  }

  const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
  await famSnap.ref.update({
    seatLimit: FieldValue.increment(1),
    seatAddonOrderIds: FieldValue.arrayUnion(orderId),
    seatAddonUpdatedAt: new Date(),
  });

  return res.status(200).json({ success: true, seatLimit: (fam.seatLimit || 5) + 1 });
}

// Get family info — caller must be a member or owner.
async function handleFamilyInfo(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });

  let { familyId } = req.body || {};
  if (!familyId) {
    const u = await fs.collection("users").doc(me.uid).get();
    familyId = u.data()?.currentFamilyId;
  }
  if (!familyId) return res.status(404).json({ error: "Not in any family" });
  const famSnap = await fs.collection("families").doc(familyId).get();
  if (!famSnap.exists) return res.status(404).json({ error: "Family not found" });
  const fam = famSnap.data();
  if (!fam.members?.[me.uid]) return res.status(403).json({ error: "Not a member of this family" });

  // Enrich members w/ emails from users collection
  const memberUids = Object.keys(fam.members);
  const memberDocs = await Promise.all(memberUids.map(u => fs.collection("users").doc(u).get()));
  const memberDetails = memberDocs.map((d, i) => ({
    uid: memberUids[i],
    role: fam.members[memberUids[i]],
    email: d.data()?.email || null,
    displayName: d.data()?.displayName || null,
    kidMode: fam.modes?.[memberUids[i]]?.kidMode || false,
    seniorMode: fam.modes?.[memberUids[i]]?.seniorMode || false,
  }));

  // Pending invites (owner only sees these)
  let pendingInvites = [];
  if (fam.ownerUid === me.uid) {
    const invs = await fs.collection("familyInvites")
      .where("familyId", "==", familyId).where("status", "==", "pending").get();
    pendingInvites = invs.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return res.status(200).json({
    success: true,
    family: {
      id: familyId,
      ownerUid: fam.ownerUid,
      ownerEmail: fam.ownerEmail,
      seatLimit: fam.seatLimit || 5,
      seatsUsed: memberUids.length,
      members: memberDetails,
      pendingInvites,
      isOwner: fam.ownerUid === me.uid,
    },
  });
}

// ─── OUTBOUND WEBHOOKS ──────────────────────────────────────────────

import crypto from "node:crypto";

// Persist a webhook URL + auto-generated HMAC secret on the user doc.
async function handleWebhookSet(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { url } = req.body || {};
  if (!url || !/^https:\/\//.test(url)) return res.status(400).json({ error: "url must start with https://" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const secret = "whk_" + crypto.randomBytes(24).toString("hex");
  await fs.collection("users").doc(me.uid).set({
    webhook: { url, secret, createdAt: new Date(), enabled: true },
  }, { merge: true });
  return res.status(200).json({ success: true, secret });
}

async function handleWebhookClear(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  await fs.collection("users").doc(me.uid).update({
    webhook: { url: null, secret: null, enabled: false, removedAt: new Date() },
  });
  return res.status(200).json({ success: true });
}

// Fire a webhook event to the user's registered URL. Used by the test button
// and by other handlers that want to notify on events. Returns the receiver's
// status code so we can surface delivery failures.
async function fireWebhook({ uid, event, data }) {
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return { ok: false, error: "no admin" };
  const snap = await fs.collection("users").doc(uid).get();
  const wh = snap.data()?.webhook;
  if (!wh?.url || !wh?.enabled) return { ok: false, error: "no webhook" };
  const body = JSON.stringify({ event, ts: new Date().toISOString(), data });
  const sig = crypto.createHmac("sha256", wh.secret).update(body).digest("hex");
  try {
    const r = await fetch(wh.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Vrikaan-Webhook/1.0",
        "X-Vrikaan-Event": event,
        "X-Vrikaan-Signature": "sha256=" + sig,
      },
      body,
      // Limit how long a slow receiver can stall the function
      signal: AbortSignal.timeout(8000),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function handleWebhookTest(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const result = await fireWebhook({
    uid: me.uid,
    event: "test.ping",
    data: { message: "Hello from VRIKAAN — your webhook is wired up.", at: new Date().toISOString() },
  });
  return res.status(200).json(result);
}

// ─── 2FA / TOTP ─────────────────────────────────────────────────────

// Verify a Bearer Firebase ID token and return { uid, email } or null.
async function verifyIdTokenFromHeader(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!idToken) return null;
  try {
    const adminMod = await import("./_firebaseAdmin.js");
    const auth = adminMod.getAdminAuth();
    if (!auth) return null;
    const decoded = await auth.verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

// Generate a new TOTP secret + otpauth:// URL + QR data URI for enrollment.
// Does NOT yet enroll the user — the client must call totp-confirm with a valid
// 6-digit code before the secret is persisted (proves the user typed it correctly).
async function handleTotpSetup(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const otpauth = await import("otpauth");
  const QR = (await import("qrcode")).default;
  const secret = new otpauth.Secret({ size: 20 }); // 160-bit
  const totp = new otpauth.TOTP({
    issuer: "VRIKAAN",
    label: me.email || me.uid,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const url = totp.toString();
  const qrDataUri = await QR.toDataURL(url, { margin: 1, width: 220 });
  // Return secret base32 so client can pass it back in the confirm step.
  // (Server is stateless — we don't keep it until confirmed.)
  return res.status(200).json({ secret: secret.base32, otpauthUrl: url, qrDataUri });
}

// Verify a 6-digit code against the supplied secret. On success, persists the
// secret + a set of one-time backup codes to /users/{uid}.mfa.
async function handleTotpConfirm(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { secret, code } = req.body || {};
  if (!secret || !code) return res.status(400).json({ error: "secret and code required" });
  const otpauth = await import("otpauth");
  try {
    const totp = new otpauth.TOTP({ issuer: "VRIKAAN", secret: otpauth.Secret.fromBase32(secret), digits: 6, period: 30 });
    // window: 1 = accept previous and next 30s as well (clock skew tolerance)
    const delta = totp.validate({ token: String(code).trim(), window: 1 });
    if (delta === null) return res.status(400).json({ error: "Invalid code" });

    // Generate 10 backup codes (8 chars each, base32-ish)
    const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const backupCodes = Array.from({ length: 10 }, () =>
      Array.from({ length: 8 }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join("")
    );

    const adminMod = await import("./_firebaseAdmin.js");
    const fs = adminMod.getAdminFirestore();
    if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
    await fs.collection("users").doc(me.uid).set({
      mfa: {
        enabled: true,
        secret, // base32; server-side only, never sent to client after this
        backupCodes,
        enrolledAt: new Date(),
      },
    }, { merge: true });
    return res.status(200).json({ success: true, backupCodes });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Verify a TOTP / backup code on login (called AFTER password sign-in).
// Returns { ok: true } if valid; consumes a backup code on use.
async function handleTotpVerify(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "code required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  const snap = await fs.collection("users").doc(me.uid).get();
  const mfa = snap.data()?.mfa;
  if (!mfa?.enabled || !mfa.secret) return res.status(400).json({ error: "MFA not enrolled" });

  const trimmed = String(code).trim().toUpperCase();
  // Backup code path
  if (mfa.backupCodes && mfa.backupCodes.includes(trimmed)) {
    const remaining = mfa.backupCodes.filter((c) => c !== trimmed);
    await fs.collection("users").doc(me.uid).update({ "mfa.backupCodes": remaining });
    return res.status(200).json({ ok: true, used: "backup", remaining: remaining.length });
  }

  const otpauth = await import("otpauth");
  const totp = new otpauth.TOTP({ issuer: "VRIKAAN", secret: otpauth.Secret.fromBase32(mfa.secret), digits: 6, period: 30 });
  const delta = totp.validate({ token: trimmed, window: 1 });
  if (delta === null) return res.status(400).json({ error: "Invalid code" });
  return res.status(200).json({ ok: true, used: "totp" });
}

// Disable MFA. Requires fresh sign-in (verified by ID token age check).
async function handleTotpDisable(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "FIREBASE_SERVICE_ACCOUNT not set" });
  await fs.collection("users").doc(me.uid).update({
    mfa: { enabled: false, secret: null, backupCodes: [], disabledAt: new Date() },
  });
  return res.status(200).json({ success: true });
}

// ─── REFUND ─────────────────────────────────────────────────────────

// Self-serve refund. Requires Authorization: Bearer <id-token> from a
// signed-in user. Verifies the user owns the payment doc before calling
// Cashfree's refund API. Records the refund attempt back to Firestore.
async function handleRefund(req, res) {
  const { orderId, reason } = req.body || {};
  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "orderId required" });
  }

  // Verify caller via Firebase ID token
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!idToken) return res.status(401).json({ error: "Sign-in required" });

  let uid;
  try {
    const adminMod = await import("./_firebaseAdmin.js");
    const { getAdminAuth, getAdminFirestore } = adminMod;
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    uid = decoded.uid;
    const fs = getAdminFirestore();

    // Confirm this user owns the payment + it's eligible for refund.
    // Checkout writes the docs with field `transactionId` (not `orderId`) and
    // `createdAt` (not `date`) — query/age-check must match those names.
    const payDoc = await fs.collection("users").doc(uid)
      .collection("payments").where("transactionId", "==", orderId).limit(1).get();
    if (payDoc.empty) return res.status(404).json({ error: "Payment not found" });
    const pay = payDoc.docs[0].data();
    const paidAt = pay.createdAt?.toMillis ? pay.createdAt.toMillis()
      : pay.date?.toMillis ? pay.date.toMillis()
      : 0;
    const ageMs = Date.now() - paidAt;
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (!paidAt) return res.status(400).json({ error: "Payment timestamp missing — contact support" });
    if (ageMs > SEVEN_DAYS) return res.status(400).json({ error: "Refund window (7 days) elapsed" });
    if (pay.refunded) return res.status(400).json({ error: "Already refunded" });

    // Call Cashfree refund API
    const base = process.env.CASHFREE_ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";
    const refundResp = await fetch(`${base}/${orderId}/refunds`, {
      method: "POST",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refund_amount: pay.amount,
        refund_id: `rf_${orderId}_${Date.now()}`,
        refund_note: (reason || "User-requested refund").slice(0, 200),
      }),
    });
    const refundData = await refundResp.json();
    if (!refundResp.ok) {
      return res.status(refundResp.status).json({ error: refundData.message || "Refund failed", details: refundData });
    }

    // Mark Firestore payment as refunded + downgrade plan
    await payDoc.docs[0].ref.update({
      refunded: true,
      refundedAt: new Date(),
      refundId: refundData.refund_id,
      refundReason: reason || "",
    });
    await fs.collection("users").doc(uid).update({ plan: "free" });

    // Best-effort outbound webhook (don't fail the refund if delivery fails)
    fireWebhook({
      uid,
      event: "payment.refunded",
      data: { orderId, amount: pay.amount, refundId: refundData.refund_id, reason: reason || "" },
    }).catch(() => {});

    return res.status(200).json({ success: true, refundId: refundData.refund_id, status: refundData.refund_status });
  } catch (e) {
    if (e.code === "auth/id-token-expired" || e.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("refund error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}

// ─── VULNERABILITY SCANNER — 14 passive checks ─────────────────────
// All checks run in parallel from one handler. None of these touch the
// target server with anything more aggressive than a single GET request,
// so we do not require explicit consent and we never trigger IPS/IDS.

// Helper: fetch with hard timeout that returns null on any failure
async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  try {
    return await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
  } catch { return null; }
}

// Normalize input — accept "example.com", "https://example.com", "https://www.example.com/path".
function normalizeTarget(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch { return null; }
  return {
    origin: url.origin,
    hostname: url.hostname.replace(/^www\./, ""),
    fullUrl: url.toString(),
  };
}

// ─── Check 1: SSL Labs grade ────────────────────────────────────────
// Cached server-side by SSL Labs; cheap to call. May queue first time
// (returns READY/IN_PROGRESS); we ask for cached results only.
async function checkSslLabs(host) {
  const r = await fetchWithTimeout(
    `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(host)}&fromCache=on&maxAge=24`,
    { headers: { "User-Agent": "Vrikaan-VulnScan" } },
    12000,
  );
  if (!r || !r.ok) return { name: "tls", ok: false, severity: "info", note: "SSL Labs not yet cached — queue scan at ssllabs.com to populate" };
  const data = await r.json().catch(() => null);
  if (!data) return { name: "tls", ok: false, severity: "info", note: "SSL Labs response unavailable" };
  if (data.status !== "READY") {
    return { name: "tls", ok: false, severity: "info", note: `SSL Labs status: ${data.status}` };
  }
  const grades = (data.endpoints || []).map((e) => e.grade).filter(Boolean);
  if (!grades.length) return { name: "tls", ok: false, severity: "info", note: "No SSL Labs endpoints" };
  const worst = grades.sort()[grades.length - 1];
  const sev = ["F", "T", "M"].includes(worst) ? "critical"
    : ["E", "D"].includes(worst) ? "high"
    : ["C"].includes(worst) ? "medium"
    : ["B"].includes(worst) ? "low"
    : "info";
  return {
    name: "tls", ok: sev === "info", severity: sev,
    grade: worst,
    findings: grades.length > 1 ? grades.map((g, i) => `Endpoint ${i + 1}: grade ${g}`) : [],
    note: `SSL Labs grade: ${worst}`,
  };
}

// ─── Check 2: HTTP security headers ─────────────────────────────────
// Reuses the existing internal handleSecurityHeaders by issuing a self-call.
async function checkHeaders(fullUrl) {
  const r = await fetchWithTimeout(fullUrl, { redirect: "follow" }, 8000);
  if (!r) return { name: "headers", ok: false, severity: "info", note: "Site unreachable" };
  const expected = {
    "content-security-policy": "high",
    "strict-transport-security": "high",
    "x-frame-options": "medium",
    "x-content-type-options": "low",
    "referrer-policy": "low",
    "permissions-policy": "low",
  };
  const findings = [];
  let worstSev = "info";
  for (const [h, sev] of Object.entries(expected)) {
    if (!r.headers.get(h)) {
      findings.push(`Missing ${h}`);
      if (severityRank(sev) > severityRank(worstSev)) worstSev = sev;
    }
  }
  return {
    name: "headers", ok: !findings.length, severity: findings.length ? worstSev : "info",
    findings,
    note: findings.length ? `${findings.length} security headers missing` : "All key headers present",
  };
}

function severityRank(s) {
  return { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[s] || 0;
}

// ─── Check 3: DNS health (SPF / DMARC / DKIM via DoH) ───────────────
async function dnsResolve(name, type) {
  const r = await fetchWithTimeout(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { Accept: "application/dns-json" } },
    5000,
  );
  if (!r || !r.ok) return [];
  const data = await r.json().catch(() => ({}));
  return (data.Answer || []).map((a) => a.data);
}

async function checkDnsHealth(host) {
  const [spfRecords, dmarcRecords, mxRecords] = await Promise.all([
    dnsResolve(host, "TXT"),
    dnsResolve(`_dmarc.${host}`, "TXT"),
    dnsResolve(host, "MX"),
  ]);
  const findings = [];
  let worstSev = "info";

  const hasMx = mxRecords.length > 0;
  const spf = spfRecords.find((t) => t.toLowerCase().includes("v=spf1"));
  const dmarc = dmarcRecords.find((t) => t.toLowerCase().includes("v=dmarc1"));

  if (hasMx && !spf) {
    findings.push("Missing SPF record — easy to spoof email from this domain");
    worstSev = "high";
  }
  if (hasMx && !dmarc) {
    findings.push("Missing DMARC record — no email-spoofing policy");
    if (severityRank("high") > severityRank(worstSev)) worstSev = "high";
  } else if (dmarc) {
    if (/p=none/i.test(dmarc)) {
      findings.push("DMARC policy is p=none — monitoring only, spoofing not blocked");
      if (severityRank("medium") > severityRank(worstSev)) worstSev = "medium";
    }
  }
  if (spf && /\+all|\sall/i.test(spf) && !/-all|~all/i.test(spf)) {
    findings.push("SPF policy ends in +all or all — anyone can send mail as this domain");
    worstSev = "critical";
  }
  return {
    name: "dns",
    ok: !findings.length,
    severity: findings.length ? worstSev : "info",
    findings,
    note: hasMx ? `${findings.length} email-auth issues` : "No MX records — domain not used for email",
    spf: spf || null,
    dmarc: dmarc || null,
  };
}

// ─── Check 4: Subdomain leak hunt via crt.sh ────────────────────────
async function checkSubdomains(host) {
  const r = await fetchWithTimeout(
    `https://crt.sh/?q=%25.${encodeURIComponent(host)}&output=json`,
    { headers: { "User-Agent": "Vrikaan-VulnScan" } },
    10000,
  );
  if (!r || !r.ok) return { name: "subdomains", ok: true, severity: "info", note: "crt.sh unavailable" };
  const data = await r.json().catch(() => []);
  const subs = new Set();
  for (const row of data) {
    const cn = (row.common_name || "").toLowerCase().trim();
    const nameValue = (row.name_value || "").toLowerCase();
    [cn, ...nameValue.split("\n")].forEach((s) => {
      const v = s.trim();
      if (v && v.endsWith(host) && !v.includes("*")) subs.add(v);
    });
  }
  const list = Array.from(subs).sort();
  // Flag any subdomain containing dev/staging/test/internal/admin keywords as risky exposure.
  const RISKY = ["dev", "staging", "test", "uat", "internal", "admin", "qa", "sandbox", "preview", "beta"];
  const flagged = list.filter((s) => {
    const sub = s.replace(`.${host}`, "");
    return RISKY.some((k) => sub.split(".").some((part) => part === k || part.startsWith(`${k}-`) || part.endsWith(`-${k}`)));
  });
  return {
    name: "subdomains",
    ok: flagged.length === 0,
    severity: flagged.length ? (flagged.length > 5 ? "high" : "medium") : "info",
    findings: flagged.slice(0, 12),
    note: `${list.length} subdomains found in CT logs (${flagged.length} risky)`,
    total: list.length,
  };
}

// ─── Check 5: Tech-stack fingerprint ────────────────────────────────
function fingerprintTech(headers, html) {
  const tech = [];
  const server = headers.get("server");
  const xPoweredBy = headers.get("x-powered-by");
  if (server) tech.push({ category: "server", value: server });
  if (xPoweredBy) tech.push({ category: "framework", value: xPoweredBy });
  // CMS/library hints from HTML
  if (/wp-content|wp-includes|\/wp-json/i.test(html)) tech.push({ category: "cms", value: "WordPress" });
  if (/<meta name="generator" content="Drupal/i.test(html)) tech.push({ category: "cms", value: "Drupal" });
  if (/<meta name="generator" content="Joomla/i.test(html)) tech.push({ category: "cms", value: "Joomla" });
  if (/data-react|__NEXT_DATA__|<div id="root"/i.test(html)) tech.push({ category: "frontend", value: "React" });
  if (/<div id="app"|data-v-[a-f0-9]{8}/i.test(html)) tech.push({ category: "frontend", value: "Vue" });
  if (/window\.__NUXT__|\/_nuxt\//i.test(html)) tech.push({ category: "frontend", value: "Nuxt" });
  if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) tech.push({ category: "ecommerce", value: "Shopify" });
  // Versioned signatures the CVE check can use
  const versionedHints = [];
  const wpVer = html.match(/<meta name="generator" content="WordPress (\d+\.\d+(?:\.\d+)?)"/i);
  if (wpVer) versionedHints.push({ name: "wordpress", version: wpVer[1] });
  const drupVer = html.match(/<meta name="generator" content="Drupal (\d+(?:\.\d+)?)"/i);
  if (drupVer) versionedHints.push({ name: "drupal", version: drupVer[1] });
  const jVer = html.match(/<meta name="generator" content="Joomla! - Open Source Content Management - Version (\d+\.\d+\.\d+)"/i);
  if (jVer) versionedHints.push({ name: "joomla", version: jVer[1] });
  // Nginx/Apache/etc with version
  if (server) {
    const m = server.match(/(nginx|Apache|caddy|Microsoft-IIS|cloudflare|LiteSpeed)\/(\d+\.\d+(?:\.\d+)?)/i);
    if (m) versionedHints.push({ name: m[1].toLowerCase(), version: m[2] });
  }
  return { tech, versionedHints };
}

// ─── Check 6: CVE matching against NVD ──────────────────────────────
// Uses NVD's free 2.0 search API — no key needed, 5 req/30s public.
async function checkCves(versionedHints) {
  if (!versionedHints?.length) return { name: "cves", ok: true, severity: "info", note: "No versioned tech detected" };
  const allCves = [];
  for (const hint of versionedHints.slice(0, 4)) {
    const cpeName = `cpe:2.3:a:*:${hint.name}:${hint.version}:*:*:*:*:*:*:*`;
    const r = await fetchWithTimeout(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=${encodeURIComponent(cpeName)}&resultsPerPage=20`,
      { headers: { "User-Agent": "Vrikaan-VulnScan" } },
      10000,
    );
    if (!r || !r.ok) continue;
    const data = await r.json().catch(() => null);
    if (!data?.vulnerabilities) continue;
    for (const v of data.vulnerabilities) {
      const id = v.cve?.id;
      const desc = v.cve?.descriptions?.find((d) => d.lang === "en")?.value;
      const score = v.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
        ?? v.cve?.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore
        ?? v.cve?.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore
        ?? 0;
      if (id) allCves.push({ id, score, desc: (desc || "").slice(0, 220), tech: hint.name, version: hint.version });
    }
  }
  allCves.sort((a, b) => b.score - a.score);
  const top = allCves.slice(0, 10);
  const max = top[0]?.score || 0;
  const sev = max >= 9 ? "critical" : max >= 7 ? "high" : max >= 4 ? "medium" : max > 0 ? "low" : "info";
  return {
    name: "cves",
    ok: !top.length,
    severity: sev,
    findings: top.map((c) => `${c.id} (CVSS ${c.score}) — ${c.tech} ${c.version}: ${c.desc}`),
    note: `${allCves.length} CVE(s) matched detected versions`,
  };
}

// ─── Checks 7-13: bundle them under one HTTP fetch ──────────────────
async function checkHttpResponse(fullUrl) {
  const r = await fetchWithTimeout(fullUrl, { redirect: "follow" }, 8000);
  if (!r) return null;
  const html = await r.text().catch(() => "");
  return { headers: r.headers, status: r.status, html };
}

// ─── Check 8: Mixed-content audit ───────────────────────────────────
function checkMixedContent(html, originIsHttps) {
  if (!originIsHttps) return { name: "mixed-content", ok: true, severity: "info", note: "Site not served over HTTPS — N/A" };
  const httpResources = [];
  const re = /(?:src|href|srcset|action)=["']http:\/\/([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null && httpResources.length < 20) {
    if (!m[1].includes("schema.org") && !m[1].includes("w3.org")) httpResources.push(`http://${m[1]}`);
  }
  return {
    name: "mixed-content",
    ok: httpResources.length === 0,
    severity: httpResources.length ? "medium" : "info",
    findings: httpResources.slice(0, 10),
    note: httpResources.length ? `${httpResources.length} HTTP resources loaded over HTTPS` : "No mixed content",
  };
}

// ─── Check 9: Cookie security ───────────────────────────────────────
function checkCookieSecurity(headers, originIsHttps) {
  const setCookie = headers.get("set-cookie") || "";
  if (!setCookie) return { name: "cookies", ok: true, severity: "info", note: "No Set-Cookie header" };
  const cookies = setCookie.split(/,(?=\s*[A-Za-z0-9_-]+=)/);
  const findings = [];
  let worstSev = "info";
  cookies.forEach((c) => {
    const name = c.split("=")[0].trim();
    const lower = c.toLowerCase();
    if (originIsHttps && !lower.includes("secure")) {
      findings.push(`${name}: missing Secure flag`);
      if (severityRank("medium") > severityRank(worstSev)) worstSev = "medium";
    }
    if (!lower.includes("httponly")) {
      findings.push(`${name}: missing HttpOnly flag`);
      if (severityRank("medium") > severityRank(worstSev)) worstSev = "medium";
    }
    if (!/samesite=/i.test(lower)) {
      findings.push(`${name}: no SameSite attribute`);
      if (severityRank("low") > severityRank(worstSev)) worstSev = "low";
    }
  });
  return { name: "cookies", ok: !findings.length, severity: findings.length ? worstSev : "info", findings: findings.slice(0, 10), note: `${cookies.length} cookies inspected` };
}

// ─── Check 10: CORS misconfig probe ─────────────────────────────────
async function checkCors(fullUrl) {
  const r = await fetchWithTimeout(fullUrl, {
    method: "OPTIONS",
    headers: { Origin: "https://evil.example.com", "Access-Control-Request-Method": "GET" },
  }, 6000);
  if (!r) return { name: "cors", ok: true, severity: "info", note: "OPTIONS not supported" };
  const acao = r.headers.get("access-control-allow-origin") || "";
  const acac = r.headers.get("access-control-allow-credentials") || "";
  const findings = [];
  let sev = "info";
  if (acao === "*" && acac.toLowerCase() === "true") {
    findings.push("ACAO: * combined with Allow-Credentials: true (browsers reject this combo, but indicates intent)");
    sev = "high";
  }
  if (acao === "https://evil.example.com") {
    findings.push("Origin reflected in ACAO — server echoes any origin (CORS misconfig)");
    sev = "high";
  }
  return { name: "cors", ok: !findings.length, severity: sev, findings, note: `ACAO: ${acao || "(none)"}` };
}

// ─── Check 11: robots / sitemap leak ────────────────────────────────
async function checkRobots(origin) {
  const r = await fetchWithTimeout(`${origin}/robots.txt`, {}, 5000);
  if (!r || !r.ok) return { name: "robots", ok: true, severity: "info", note: "No robots.txt" };
  const text = (await r.text().catch(() => "")).slice(0, 6000);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const SENSITIVE = [/admin/i, /\.git/i, /\.env/i, /backup/i, /private/i, /test/i, /staging/i, /api[/_]key/i, /\/secret/i];
  const flagged = lines.filter((l) => /^Disallow:|^Allow:/i.test(l) && SENSITIVE.some((re) => re.test(l)));
  return {
    name: "robots",
    ok: !flagged.length,
    severity: flagged.length ? "low" : "info",
    findings: flagged.slice(0, 12),
    note: flagged.length ? `${flagged.length} sensitive paths in robots.txt` : "robots.txt clean",
  };
}

// ─── Check 12: Email spoofing risk (synthesized from DNS) ──────────
function checkEmailSpoofRisk(dns) {
  if (dns.findings && dns.findings.length) {
    return { name: "email-spoof", ok: false, severity: dns.severity, findings: dns.findings, note: "Email-spoofing risk inherited from DNS findings" };
  }
  return { name: "email-spoof", ok: true, severity: "info", note: "No email-spoofing risk detected" };
}

// ─── Check 13: HSTS preload status ──────────────────────────────────
async function checkHstsPreload(host) {
  const r = await fetchWithTimeout(
    `https://hstspreload.org/api/v2/status?domain=${encodeURIComponent(host)}`,
    {}, 6000,
  );
  if (!r || !r.ok) return { name: "hsts-preload", ok: true, severity: "info", note: "Preload status unavailable" };
  const data = await r.json().catch(() => ({}));
  const status = data.status || "unknown";
  // unknown/pending/preloaded
  return {
    name: "hsts-preload",
    ok: status === "preloaded",
    severity: status === "preloaded" ? "info" : "low",
    note: `HSTS preload status: ${status}`,
  };
}

// ─── Check 14: WordPress-specific (only if WP detected) ────────────
async function checkWordPress(origin, isWp) {
  if (!isWp) return { name: "wordpress", ok: true, severity: "info", note: "Not WordPress" };
  const findings = [];
  let worst = "info";
  // /wp-json should normally be open but exposes user enumeration
  const r1 = await fetchWithTimeout(`${origin}/wp-json/wp/v2/users`, {}, 6000);
  if (r1 && r1.ok) {
    const data = await r1.json().catch(() => null);
    if (Array.isArray(data) && data.length) {
      findings.push(`WP REST API exposes ${data.length} usernames at /wp-json/wp/v2/users`);
      worst = "high";
    }
  }
  // ?author=1 enumeration
  const r2 = await fetchWithTimeout(`${origin}/?author=1`, { redirect: "manual" }, 6000);
  if (r2 && (r2.status === 301 || r2.status === 302)) {
    const loc = r2.headers.get("location") || "";
    const m = loc.match(/\/author\/([^/?]+)/);
    if (m) {
      findings.push(`Author enumeration via ?author=1 reveals username: ${m[1]}`);
      if (severityRank("medium") > severityRank(worst)) worst = "medium";
    }
  }
  return { name: "wordpress", ok: !findings.length, severity: findings.length ? worst : "info", findings, note: findings.length ? `${findings.length} WordPress-specific issues` : "WordPress hardening OK" };
}

// ─── Main vuln-scan handler ────────────────────────────────────────
async function handleVulnScan(req, res) {
  const target = normalizeTarget(req.body?.target || req.query?.target);
  if (!target) return res.status(400).json({ error: "target URL or domain required" });

  // Run cheap checks in parallel; the HTTP body is reused for several.
  const [httpResp, ssl, dns, subs, hsts, robots, cors] = await Promise.all([
    checkHttpResponse(target.fullUrl),
    checkSslLabs(target.hostname),
    checkDnsHealth(target.hostname),
    checkSubdomains(target.hostname),
    checkHstsPreload(target.hostname),
    checkRobots(target.origin),
    checkCors(target.fullUrl),
  ]);

  const headersResult = !httpResp
    ? { name: "headers", ok: false, severity: "info", note: "Site unreachable" }
    : (() => {
        const expected = {
          "content-security-policy": "high",
          "strict-transport-security": "high",
          "x-frame-options": "medium",
          "x-content-type-options": "low",
          "referrer-policy": "low",
          "permissions-policy": "low",
        };
        const findings = [];
        let worst = "info";
        for (const [h, sev] of Object.entries(expected)) {
          if (!httpResp.headers.get(h)) {
            findings.push(`Missing ${h}`);
            if (severityRank(sev) > severityRank(worst)) worst = sev;
          }
        }
        return { name: "headers", ok: !findings.length, severity: findings.length ? worst : "info", findings, note: findings.length ? `${findings.length} security headers missing` : "All key headers present" };
      })();

  const originIsHttps = target.origin.startsWith("https://");
  const fingerprint = httpResp ? fingerprintTech(httpResp.headers, httpResp.html) : { tech: [], versionedHints: [] };
  const cves = await checkCves(fingerprint.versionedHints);
  const mixed = httpResp ? checkMixedContent(httpResp.html, originIsHttps) : { name: "mixed-content", ok: true, severity: "info", note: "N/A" };
  const cookies = httpResp ? checkCookieSecurity(httpResp.headers, originIsHttps) : { name: "cookies", ok: true, severity: "info", note: "N/A" };
  const isWp = fingerprint.tech.some((t) => t.value === "WordPress");
  const wp = await checkWordPress(target.origin, isWp);
  const emailSpoof = checkEmailSpoofRisk(dns);

  const checks = [ssl, headersResult, dns, subs, fingerprint.tech.length ? { name: "tech", ok: true, severity: "info", findings: fingerprint.tech.map((t) => `${t.category}: ${t.value}`), note: `${fingerprint.tech.length} technologies detected` } : { name: "tech", ok: true, severity: "info", note: "No tech detected" }, cves, hsts, mixed, cookies, cors, robots, emailSpoof, wp];

  // Summary score: 100 minus 25 per critical, 12 per high, 6 per medium, 2 per low.
  let deduction = 0;
  for (const c of checks) {
    if (c.severity === "critical") deduction += 25;
    else if (c.severity === "high") deduction += 12;
    else if (c.severity === "medium") deduction += 6;
    else if (c.severity === "low") deduction += 2;
  }
  const score = Math.max(0, 100 - deduction);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    target,
    score, grade,
    summary: {
      critical: checks.filter((c) => c.severity === "critical").length,
      high:     checks.filter((c) => c.severity === "high").length,
      medium:   checks.filter((c) => c.severity === "medium").length,
      low:      checks.filter((c) => c.severity === "low").length,
      ok:       checks.filter((c) => c.severity === "info").length,
    },
    checks,
  });
}

// ─── AI synthesis on raw scan output ───────────────────────────────
async function handleVulnSynthesize(req, res) {
  const { scan } = req.body || {};
  if (!scan?.checks) return res.status(400).json({ error: "scan.checks required" });
  const findings = scan.checks
    .filter((c) => c.severity && c.severity !== "info")
    .map((c) => ({ name: c.name, severity: c.severity, note: c.note, findings: (c.findings || []).slice(0, 5) }));
  const prompt = `You are a senior security engineer producing an executive risk summary for a non-technical site owner.

Target: ${scan.target?.hostname || "unknown"}
Score: ${scan.score}/100 (Grade ${scan.grade})

Raw findings:
${JSON.stringify(findings, null, 2).slice(0, 3000)}

Reply ONLY with strict JSON (no markdown fences):
{
  "headline": "1-line summary suitable for a dashboard tile",
  "topRisks": [{ "title": "...", "severity": "critical|high|medium|low", "explanation": "1-2 sentences", "fix": "concrete remediation step" }],
  "executiveSummary": "2-3 sentence plain-English explanation a CEO can understand",
  "complianceImpact": "1-2 sentences on PCI/GDPR/DPDP/SOC2 implications if any",
  "next30Days": ["3-5 prioritized actions for the next 30 days"]
}`;
  const r = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 2500, json: true });
  if (!r.ok) return res.status(r.status || 502).json({ error: r.detail || "AI unavailable" });
  const parsed = tryParseJson(r.text);
  if (!parsed) {
    console.error("vuln-synthesize parse failed. raw:", r.text?.slice(0, 800));
    return res.status(502).json({ error: "AI returned malformed result" });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ...parsed, model: "gemini-2.5-flash" });
}

// ─── ROUTER ─────────────────────────────────────────────────────────

// ── Newsletter subscribe — Brevo + Firestore log (server-side, key never in browser) ──
// ─── BREVO TRANSACTIONAL EMAIL HELPER ─────────────────────────────────
// Sends a single transactional email via Brevo. `sender.email` must be a
// VERIFIED sender/domain in your Brevo account or Brevo rejects the send.
async function _brevoEmail({ to, subject, html, replyTo, sender }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, skipped: "no-brevo-key" };
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        sender: sender || { name: "VRIKAAN", email: "hello@vrikaan.com" },
        to: (Array.isArray(to) ? to : [to]).map((e) => (typeof e === "string" ? { email: e } : e)),
        subject,
        htmlContent: html,
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      }),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); console.warn("brevo email", r.status, d?.message); }
    return { ok: r.ok, status: r.status };
  } catch (e) { console.error("brevo email failed:", e.message); return { ok: false, error: e.message }; }
}

// ─── ENTERPRISE LEAD — the full mail chain ────────────────────────────
// Enterprise "Request walkthrough" form. Records a structured lead, adds the
// contact to Brevo CRM, EMAILS the founders (reply-to = the lead), and sends
// the lead an auto-reply. Replaces cramming everything into newsletter source.
const LEAD_NOTIFY_TO = ["hello@vrikaan.com", "sahilnikam133@gmail.com"]; // founders' inbox(es)
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function handleEnterpriseLead(req, res) {
  const b = req.body || {};
  const email = String(b.email || "").trim().toLowerCase().slice(0, 254);
  const name = String(b.name || "").trim().slice(0, 120);
  const company = String(b.company || "").trim().slice(0, 160);
  if (!name || !company || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Name, work email and company are required." });
  }
  const lead = {
    name, email, company,
    role: String(b.role || "").slice(0, 120),
    employees: String(b.employees || "").slice(0, 60),
    tier: String(b.tier || "").slice(0, 40),
    message: String(b.message || "").slice(0, 1000),
    createdAt: new Date().toISOString(),
    ip: (req.headers?.["x-forwarded-for"]?.split(",")[0] || "").trim().slice(0, 64),
    ua: (req.headers?.["user-agent"] || "").slice(0, 200),
  };

  // 1) Firestore record (structured — server-only via Admin SDK)
  try {
    const db = getAdminFirestore();
    if (db) await db.collection("leads").add(lead);
  } catch (e) { console.warn("lead: firestore write failed:", e.message); }

  // 2) Brevo CRM contact (so it also lands in the list)
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email, updateEnabled: true,
          ...(process.env.BREVO_LIST_ID ? { listIds: [Number(process.env.BREVO_LIST_ID)] } : {}),
          attributes: { FIRSTNAME: name, COMPANY: company, ROLE: lead.role, LEAD_TIER: lead.tier, SOURCE: "enterprise-walkthrough" },
        }),
      });
    } catch (e) { console.warn("lead: brevo contact failed:", e.message); }
  }

  // 3) Founder notification email (reply-to = the lead → reply goes straight back)
  const founderHtml = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <div style="background:#090e1a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
        <div style="font-size:13px;letter-spacing:2px;color:#14b8a6;font-weight:700">VRIKAAN · NEW ENTERPRISE LEAD</div>
        <div style="font-size:22px;font-weight:800;margin-top:6px">${esc(company)}</div>
        <div style="font-size:13px;color:#94a3b8">${esc(lead.tier || "tier n/a")} · ${esc(lead.employees || "size n/a")}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
        <tr><td style="padding:10px 24px;color:#64748b;width:120px">Name</td><td style="padding:10px 24px;font-weight:600">${esc(name)}</td></tr>
        <tr><td style="padding:10px 24px;color:#64748b">Email</td><td style="padding:10px 24px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:10px 24px;color:#64748b">Role</td><td style="padding:10px 24px">${esc(lead.role || "—")}</td></tr>
        <tr><td style="padding:10px 24px;color:#64748b">Interest</td><td style="padding:10px 24px">${esc(lead.tier || "—")}</td></tr>
        <tr><td style="padding:10px 24px;color:#64748b;vertical-align:top">Notes</td><td style="padding:10px 24px;white-space:pre-wrap">${esc(lead.message || "—")}</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;margin:16px 0 0">Reply to this email to respond directly. Promised SLA: 24h.</p>
    </div>`;
  await _brevoEmail({ to: LEAD_NOTIFY_TO, replyTo: email, subject: `🔥 Enterprise lead — ${company} (${lead.tier || "?"})`, html: founderHtml });

  // 4) Lead auto-reply
  const replyHtml = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <div style="background:#090e1a;color:#fff;padding:22px 26px;border-radius:12px">
        <div style="font-size:20px;letter-spacing:4px;font-weight:800">VRIKAAN</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:2px">AI Cyber Defense · Made in India</div>
      </div>
      <div style="padding:22px 4px">
        <p style="font-size:15px;line-height:1.6">Hi ${esc(name.split(" ")[0] || name)},</p>
        <p style="font-size:15px;line-height:1.6">Thanks for requesting a walkthrough for <b>${esc(company)}</b>. One of the founders — Sahil or Khushi — will email you within <b>24 hours</b> with 3 calendar slots.</p>
        <p style="font-size:15px;line-height:1.6">It's a live sandbox demo at <b>soc.vrikaan.com</b> with synthetic attacks running — you'll see real alerts in real time. No slides.</p>
        <p style="font-size:15px;line-height:1.6">— Team VRIKAAN</p>
        <p style="font-size:12px;color:#64748b;margin-top:18px">We never sell your data · DPDP compliant · <a href="https://vrikaan.com">vrikaan.com</a></p>
      </div>
    </div>`;
  await _brevoEmail({ to: email, subject: "VRIKAAN — your 20-min walkthrough request", html: replyHtml });

  return res.status(200).json({ ok: true });
}

async function handleNewsletterSubscribe(req, res) {
  const { email, source } = req.body || {};
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  const cleanEmail = email.trim().toLowerCase().slice(0, 254);
  const cleanSource = String(source || "unknown").slice(0, 64);
  const userAgent = (req.headers?.["user-agent"] || "").slice(0, 200);
  const ip = (req.headers?.["x-forwarded-for"]?.split(",")[0] || "").trim().slice(0, 64);

  // ── Step 1: Write to Firestore for audit / fallback ────────────
  try {
    const db = getAdminFirestore();
    if (db) {
      await db.collection("newsletter").doc(cleanEmail).set({
        email: cleanEmail,
        source: cleanSource,
        subscribedAt: new Date(),
        userAgent,
        ip,
      }, { merge: true });
    }
  } catch (err) {
    console.warn("newsletter: firestore write failed:", err.message);
    // Don't bail — Brevo is the primary channel
  }

  // ── Step 2: Push to Brevo (server-side, BREVO_API_KEY never in browser) ────
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoList = process.env.BREVO_LIST_ID;
  if (!brevoKey || !brevoList) {
    // Brevo not configured — Firestore-only mode
    return res.status(200).json({ ok: true, channel: "firestore" });
  }

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        listIds: [Number(brevoList)],
        attributes: {
          SOURCE: cleanSource,
          SIGNED_UP_AT: new Date().toISOString(),
        },
        updateEnabled: true,  // idempotent — updates existing contact
      }),
    });

    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ ok: true, channel: "brevo" });
    }

    const data = await brevoRes.json().catch(() => ({}));
    // Treat duplicate as success
    if (data?.code === "duplicate_parameter") {
      return res.status(200).json({ ok: true, channel: "brevo", note: "already-subscribed" });
    }
    console.warn("newsletter: brevo error", brevoRes.status, data?.message);
    // Brevo failed but Firestore succeeded → still report success to user
    return res.status(200).json({ ok: true, channel: "firestore", brevoStatus: brevoRes.status });
  } catch (err) {
    console.error("newsletter: brevo fetch failed:", err.message);
    return res.status(200).json({ ok: true, channel: "firestore" });
  }
}

// ─── WHATSAPP BOT (Twilio webhook) ──────────────────────────────────
// Inbound: Twilio POSTs form-encoded WhatsApp messages to
// /api/tools?tool=whatsapp-inbound. We parse intent, call relevant tool,
// reply via Twilio REST. Returns empty TwiML (we send the reply ourselves
// via REST API for richer formatting + delivery tracking).

const WA_INTENTS = {
  "scam check": "scam-check",
  "scam:":      "scam-check",
  "breach":     "breach-check",
  "breach:":    "breach-check",
  "leak":       "leak-check",
  "leak:":      "leak-check",
  "ip":         "ip",
  "whois":      "whois",
  "help":       "help",
  "menu":       "help",
  "start":      "help",
};

const WA_HELP = `🛡 *VRIKAAN Cyber Defence Bot*

Send me any of:

📩 *scam check: <message>* — AI scam analysis
🔓 *breach: your@email* — breach lookup
🌐 *whois example.com* — domain lookup
📍 *ip 8.8.8.8* — IP geo + threat
🩸 *leak: phone-or-email* — dark-web search

*menu* — show this again.
Full tools + Family Plan (₹149/mo) at vrikaan.com`;

function _waParseIntent(body) {
  const text = (body || "").trim().toLowerCase();
  if (!text) return { intent: "help" };
  for (const [trigger, action] of Object.entries(WA_INTENTS)) {
    if (text.startsWith(trigger)) {
      return { intent: action, payload: text.slice(trigger.length).replace(/^[:\s]+/, "").trim() };
    }
  }
  return { intent: "scam-check", payload: body }; // free-form = scam check
}

async function _waCallTool(action, payload, origin) {
  switch (action) {
    case "scam-check":   return _fetchToolJson(origin, "scam-check", { message: payload });
    case "breach-check": return _fetchToolJson(origin, "breach-check", { email: payload });
    case "leak-check":   return _fetchToolJson(origin, "leak-check", { query: payload });
    case "whois":        return _fetchToolJson(origin, "whois", { domain: payload });
    case "ip": {
      const r = await fetch(`${origin}/api/tools?tool=ip&ip=${encodeURIComponent(payload)}`);
      return r.json();
    }
    default: return { error: "Unknown intent" };
  }
}

async function _fetchToolJson(origin, tool, body) {
  const r = await fetch(`${origin}/api/tools?tool=${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function _waFormat(action, data) {
  if (data?.error) return `❌ ${data.error}`;
  switch (action) {
    case "scam-check": {
      const emoji = data.verdict === "scam" ? "🚨" : data.verdict === "suspicious" ? "⚠️" : "✅";
      return `${emoji} *${(data.verdict || "unknown").toUpperCase()}*  (${Math.round((data.confidence || 0) * 100)}% confidence)\n\n${data.reason || data.explanation || ""}${data.risk ? `\n\nRisk: *${String(data.risk).toUpperCase()}*` : ""}`;
    }
    case "breach-check":
      return data.found
        ? `🚨 Found in *${data.breaches}* breaches:\n${(data.sources || []).slice(0, 5).map(s => `• ${s}`).join("\n")}\n\nChange passwords where this email is used.`
        : `✅ Not found in known breaches.`;
    case "leak-check":
      return data.hits > 0
        ? `🩸 Found *${data.hits}* hits:\n${(data.sources || []).slice(0, 5).map(s => `• ${s}`).join("\n")}`
        : `✅ Clean — not found in dark-web sources.`;
    case "whois":
      return `🌐 *${data.domain}*\nRegistrar: ${data.registrar || "—"}\nCreated: ${data.created || "—"}\nExpires: ${data.expires || "—"}`;
    case "ip":
      return `📍 *${data.ip}*\n${data.country || "?"} · ${data.isp || "?"}\nASN: ${data.asn || "?"}\nThreat: ${data.threatScore != null ? data.threatScore : "?"}`;
    case "help": return WA_HELP;
    default: return JSON.stringify(data).slice(0, 800);
  }
}

async function _waSendReply(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    console.warn("WA: Twilio creds missing");
    return;
  }
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!resp.ok) console.error("WA Twilio send failed:", resp.status, (await resp.text().catch(() => "")).slice(0, 200));
}

async function handleWhatsappInbound(req, res) {
  // Twilio posts URL-encoded form. Vercel parses based on Content-Type;
  // handle both shapes defensively.
  const body = typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : Object.fromEntries(new URLSearchParams(req.body || ""));
  const messageBody = body.Body || body.body || "";
  const from = body.From || body.from || "";
  if (!from) {
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }
  try {
    const { intent, payload } = _waParseIntent(messageBody);
    const origin = `https://${req.headers.host}`;
    const reply = intent === "help" ? WA_HELP : _waFormat(intent, await _waCallTool(intent, payload, origin));
    await _waSendReply(from, reply);
  } catch (e) {
    console.error("whatsapp-inbound error:", e.message);
  }
  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
}

// ─── COUPON VALIDATE ────────────────────────────────────────────────
// Server-side coupon lookup. Replaces client-side getDoc(coupons/CODE) which
// let any anonymous user enumerate/probe coupon catalogue via Firestore SDK.
// Now /coupons/* read should be locked behind admin-only rules.
async function handleCouponValidate(req, res) {
  const { code, plan } = req.body || {};
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code required" });
  }
  const cleanCode = code.trim().toUpperCase().slice(0, 32);
  if (!/^[A-Z0-9_-]{2,32}$/.test(cleanCode)) {
    return res.status(400).json({ error: "Invalid code format" });
  }
  try {
    const adminMod = await import("./_firebaseAdmin.js");
    const fs = adminMod.getAdminFirestore();
    if (!fs) return res.status(500).json({ error: "Server config missing" });
    const snap = await fs.collection("coupons").doc(cleanCode).get();
    if (!snap.exists) return res.status(404).json({ error: "Invalid code" });
    const c = snap.data();
    if (!c.active) return res.status(400).json({ error: "Code disabled" });
    const exp = c.expiresAt?.toMillis ? c.expiresAt.toMillis()
      : c.expiresAt?.toDate ? c.expiresAt.toDate().getTime()
      : c.expiresAt ? new Date(c.expiresAt).getTime()
      : 0;
    if (exp && exp < Date.now()) return res.status(400).json({ error: "Code expired" });
    if (c.plans && plan && !c.plans.includes(plan)) {
      return res.status(400).json({ error: "Not valid for this plan" });
    }
    return res.status(200).json({
      valid: true,
      code: cleanCode,
      percentOff: c.percentOff || 0,
      flatOff: c.flatOff || 0,
      plans: c.plans || null,
    });
  } catch (e) {
    console.error("coupon-validate error:", e.message);
    return res.status(500).json({ error: "Validation failed" });
  }
}

// ─── SCAM DNA — crowdsourced live India scam-intelligence network ──────
// Paste a suspicious message → Gemini fingerprints it → we group reports by
// the scammer's reusable identifiers (UPI / phone / URL) or a signature hash,
// and return real-time community intel: how many people hit this, when it was
// first/last seen, how many reported losing money. Server-only Firestore
// (Admin SDK), so no client rules needed. Free tier → grows the network.
function _sanitizeId(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9@._-]/g, "").slice(0, 120);
}
// Verified known-scam templates (server constant) used to seed the network so
// it's useful from day one. Honest: count starts at 1 and they're flagged
// verified — NOT fabricated user/loss numbers.
const SCAM_SEED = [
  { category: "kyc", tactic: "Fake KYC-expiry deadline", keyPhrases: ["kyc expires today", "account will be blocked", "update kyc"], sample: "Dear customer, your bank KYC expires today. Update now or your account will be permanently blocked." },
  { category: "phishing", tactic: "Electricity disconnection threat", keyPhrases: ["electricity will be disconnected", "previous month bill", "update at once"], sample: "Dear consumer, your electricity will be disconnected tonight 9:30 as previous month bill not updated. Call our officer immediately." },
  { category: "fake-courier", tactic: "Parcel held by customs / FedEx", keyPhrases: ["parcel held", "customs", "illegal items found", "your aadhaar"], sample: "Your FedEx parcel is held by customs — illegal items found linked to your Aadhaar. Press 1 to speak to an officer." },
  { category: "fake-police", tactic: "Digital arrest by CBI / police", keyPhrases: ["digital arrest", "aadhaar misused", "money laundering case", "do not disconnect"], sample: "This is CBI. Your Aadhaar is linked to a money-laundering case. You are under digital arrest — do not disconnect the video call." },
  { category: "upi-fraud", tactic: "Collect-request disguised as refund", keyPhrases: ["accept to receive refund", "approve the request", "scan to get money"], sample: "Sir your refund of Rs 4,999 is ready. Just approve the UPI request / scan this QR and enter PIN to RECEIVE the money." },
  { category: "job-scam", tactic: "Paid like-and-subscribe task scam", keyPhrases: ["work from home", "like youtube videos", "earn 5000 daily", "telegram"], sample: "Hi! Part-time work from home. Just like YouTube videos, earn Rs 5000 daily. Join our Telegram to start." },
  { category: "lottery-prize", tactic: "KBC / lottery winner", keyPhrases: ["you have won", "kbc lottery", "lucky draw", "processing fee"], sample: "Congratulations! Your number won Rs 25,00,000 in the KBC WhatsApp lucky draw. To claim, pay the small GST processing fee." },
  { category: "loan-app", tactic: "Instant pre-approved loan", keyPhrases: ["pre-approved loan", "instant disbursal", "no documents", "processing fee"], sample: "Your loan of Rs 2,00,000 is pre-approved! Instant disbursal, no documents. Pay small processing fee to release the amount." },
  { category: "fake-bank", tactic: "Account blocked — share OTP", keyPhrases: ["account blocked", "share otp", "debit card expired", "reactivate"], sample: "Your account is temporarily blocked. Your debit card has expired. Share the OTP sent to verify and reactivate immediately." },
  { category: "investment", tactic: "Money-doubling / crypto scheme", keyPhrases: ["double your money", "guaranteed returns", "trading group", "expert madam"], sample: "Join our trading group — double your money in 15 days, guaranteed returns. Start with just Rs 5000." },
  { category: "other", tactic: "Fake army OLX buyer", keyPhrases: ["i am in army", "posted at border", "scan qr advance", "olx"], sample: "I am army personnel posted at border. I'll pay advance for your OLX item — just scan this QR / approve request to receive payment." },
  { category: "vishing", tactic: "TRAI SIM-block threat", keyPhrases: ["sim will be blocked", "trai", "illegal activity on your number", "press 1"], sample: "This is TRAI. Your SIM will be blocked in 2 hours due to illegal activity on your number. Press 1 to talk to the officer." },
];

async function handleScamDna(req, res) {
  const { text, action = "analyze", lostMoney, amount } = req.body || {};

  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "Scam DNA unavailable (DB not configured)" });
  const col = fs.collection("scamSignatures");

  // ── PURGE: one-time pre-launch cleanup of unverified test entries. Deletes
  // every signal NOT in the verified known-scam library. Safe pre-launch (no
  // real user reports yet); after launch, do not call (would wipe real reports).
  if (action === "purge-unverified") {
    let deleted = 0;
    try {
      // Scan all (Firestore "!=" skips docs missing the field, which our test
      // entries are) and delete anything not flagged verified.
      const all = await col.limit(1000).get();
      const batch = fs.batch();
      all.docs.forEach((d) => { if (d.data().verified !== true) { batch.delete(d.ref); deleted++; } });
      await batch.commit();
    } catch (e2) { return res.status(500).json({ error: e2.message }); }
    return res.status(200).json({ deleted });
  }

  // ── SEED: write the verified known-scam library (idempotent; data is a
  // server constant, not user input, so this is safe to call openly once). ──
  if (action === "seed") {
    const cryptoMod = await import("crypto");
    const { FieldValue } = await import("firebase-admin/firestore");
    const now = Date.now();
    let n = 0;
    for (let i = 0; i < SCAM_SEED.length; i++) {
      const p = SCAM_SEED[i];
      const docId = "seed_" + cryptoMod.createHash("sha1").update(p.category + "|" + p.keyPhrases.join("|")).digest("hex").slice(0, 20);
      const seenAt = new Date(now - Math.floor(Math.random() * 72) * 3600000 - i * 600000);
      try {
        await col.doc(docId).set({
          category: p.category, tactic: p.tactic, sampleText: p.sample.slice(0, 200),
          keyPhrases: p.keyPhrases, idents: FieldValue.arrayUnion("_none"),
          verified: true, source: "VRIKAAN known-scam library",
          count: 1, lossCount: 0, lossTotal: 0,
          firstSeen: seenAt, lastSeen: seenAt,
        }, { merge: true });
        n++;
      } catch (e) { console.error("seed:", e.message); }
    }
    return res.status(200).json({ seeded: n });
  }

  // ── FEED: today's trending scams ──
  if (action === "feed") {
    try {
      const snap = await col.orderBy("lastSeen", "desc").limit(12).get();
      const items = snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id, category: x.category || "scam", tactic: x.tactic || "",
          count: x.count || 1, lossCount: x.lossCount || 0,
          verified: !!x.verified,
          lastSeen: x.lastSeen?.toMillis?.() || x.lastSeen || null,
          sample: (x.sampleText || "").slice(0, 140),
        };
      });
      return res.status(200).json({ items });
    } catch (e) {
      return res.status(200).json({ items: [] });
    }
  }

  // ── CHECK: free, read-only lookup of one identifier (phone/UPI/URL).
  // Powers the browser extension + lightweight client checks. No AI, no write.
  if (action === "check") {
    const id = _sanitizeId(String(req.body?.identifier || ""));
    if (id.length < 4) return res.status(400).json({ error: "identifier too short", known: false, riskScore: 0 });
    try {
      const snap = await col.doc(`id_${id}`.slice(0, 200)).get();
      if (!snap.exists) return res.status(200).json({ known: false, riskScore: 0, identifier: id });
      const x = snap.data();
      const reports = x.count || 0;
      const risk = x.verified ? 95 : Math.min(90, 40 + reports * 8 + (x.lossCount || 0) * 5);
      return res.status(200).json({
        known: true, riskScore: risk, identifier: id,
        category: x.category || "other", tactic: x.tactic || "",
        reports, verified: !!x.verified,
      });
    } catch (e) { return res.status(200).json({ known: false, riskScore: 0 }); }
  }

  // ── ANALYZE: fingerprint + match + contribute ──
  if (!text || typeof text !== "string" || text.trim().length < 8) {
    return res.status(400).json({ error: "Paste the suspicious message (min 8 chars)." });
  }
  const clean = text.trim().slice(0, 4000);

  const prompt = `You are an India-focused scam analyst. Analyze this message/transcript and return STRICT JSON (no markdown). Extract reusable scammer identifiers and a short fingerprint.
{"verdict":"scam"|"likely-scam"|"suspicious"|"probably-safe","riskScore":0-100,"category":"upi-fraud"|"phishing"|"vishing"|"loan-app"|"job-scam"|"investment"|"lottery-prize"|"fake-bank"|"fake-courier"|"fake-police"|"kyc"|"other","tactic":"one short phrase","paymentHandles":["upi ids / wallet ids if any"],"phones":["phone numbers if any"],"urls":["links if any"],"keyPhrases":["2-4 short distinctive phrases that identify this scam template"],"advice":["2-3 short next steps"]}
Message:"""${clean}"""`;

  const r = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 900, json: true });
  if (!r.ok) {
    const transient = r.status === 503 || r.status === 429 || /high demand|overloaded|unavailable/i.test(r.detail || "");
    return res.status(transient ? 503 : 502).json({ error: transient ? "AI is briefly busy — tap Check again in a few seconds." : (r.detail || "AI unavailable"), retryable: transient });
  }
  const p = tryParseJson(r.text) || {};
  const idents = [
    ...(Array.isArray(p.paymentHandles) ? p.paymentHandles : []),
    ...(Array.isArray(p.phones) ? p.phones : []),
    ...(Array.isArray(p.urls) ? p.urls : []),
  ].map(_sanitizeId).filter((x) => x.length >= 4).slice(0, 8);

  // Group key: strongest reusable identifier, else a signature hash of
  // category + sorted key phrases (so the same scam template clusters).
  const phrases = (Array.isArray(p.keyPhrases) ? p.keyPhrases : []).map((s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim()).filter(Boolean).sort();
  let sigBasis = idents[0] || `${p.category || "other"}|${phrases.join("|")}`;
  const crypto = await import("crypto");
  const docId = idents[0] ? `id_${idents[0]}`.slice(0, 200) : "sig_" + crypto.createHash("sha1").update(sigBasis).digest("hex").slice(0, 24);

  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = col.doc(docId);

  let community = { seenCount: 0, firstSeen: null, lastSeen: null, lossCount: 0, lossTotal: 0, isNew: true };
  try {
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : null;
    const addLoss = lostMoney ? 1 : 0;
    const addAmt = lostMoney && Number(amount) > 0 ? Number(amount) : 0;

    await ref.set({
      category: p.category || (existing?.category) || "other",
      tactic: p.tactic || existing?.tactic || "",
      sampleText: existing?.sampleText || clean.slice(0, 200),
      idents: FieldValue.arrayUnion(...(idents.length ? idents : ["_none"])),
      keyPhrases: existing?.keyPhrases || phrases.slice(0, 4),
      count: FieldValue.increment(1),
      lossCount: FieldValue.increment(addLoss),
      lossTotal: FieldValue.increment(addAmt),
      firstSeen: existing?.firstSeen || FieldValue.serverTimestamp(),
      lastSeen: FieldValue.serverTimestamp(),
    }, { merge: true });

    community = {
      seenCount: (existing?.count || 0) + 1,
      firstSeen: existing?.firstSeen?.toMillis?.() || null,
      lastSeen: Date.now(),
      lossCount: (existing?.lossCount || 0) + addLoss,
      lossTotal: (existing?.lossTotal || 0) + addAmt,
      verified: !!existing?.verified,
      isNew: !existing,
    };
  } catch (e) {
    console.error("scam-dna db error:", e.message);
  }

  return res.status(200).json({
    verdict: p.verdict || "suspicious",
    riskScore: Number(p.riskScore) || 50,
    category: p.category || "other",
    tactic: p.tactic || "",
    extracted: { paymentHandles: p.paymentHandles || [], phones: p.phones || [], urls: p.urls || [] },
    advice: Array.isArray(p.advice) ? p.advice.slice(0, 3) : [],
    community,
    matchedBy: idents[0] ? (idents[0].includes("@") ? "UPI ID" : idents[0].match(/^[0-9]+$/) ? "phone number" : "link/identifier") : "scam pattern",
    sigId: docId,
  });
}

// ─── SCAM DNA — B2B INTELLIGENCE API ──────────────────────────────────
// Authenticated, programmatic read/contribute access to the Scam DNA network
// for fintechs, banks, telcos and wallets. Auth = a long-lived vrk_ API token
// on an enterprise plan; the main dispatcher enforces the tier + rate limits
// (ACTION_TIERS["scam-dna-api"] = "enterprise"). This monetizes the moat:
// partners query our crowdsourced scam-intel in real time at txn/onboarding.
//   POST /api/tools?tool=scam-dna-api   Authorization: Bearer vrk_...
//   { action: "check",      identifier: "scammer@upi" }
//   { action: "bulk-check", identifiers: ["+9198…","bad-link.in"] }   // ≤50
//   { action: "feed",       limit: 20 }                               // trending
//   { action: "report",     identifier, category, tactic, sample, keyPhrases }
async function handleScamDnaApi(req, res) {
  const { action = "check" } = req.body || {};
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "Scam DNA unavailable (DB not configured)" });
  const col = fs.collection("scamSignatures");

  // Look up one identifier against the network. Uses the SAME normalization +
  // doc-id scheme as analyze/_recordScamSignal so keys line up exactly.
  const lookup = async (raw) => {
    const id = _sanitizeId(String(raw || ""));
    if (id.length < 4) return { identifier: raw, known: false, riskScore: 0, error: "identifier too short" };
    const snap = await col.doc(`id_${id}`.slice(0, 200)).get();
    if (!snap.exists) return { identifier: raw, normalized: id, known: false, riskScore: 0 };
    const x = snap.data();
    const reports = x.count || 0;
    // Risk model: verified known-scam = 95; else scale with report volume + losses.
    const risk = x.verified ? 95 : Math.min(90, 40 + reports * 8 + (x.lossCount || 0) * 5);
    return {
      identifier: raw, normalized: id, known: true, riskScore: risk,
      category: x.category || "other", tactic: x.tactic || "",
      reports, lossReports: x.lossCount || 0, lossTotal: x.lossTotal || 0,
      verified: !!x.verified,
      firstSeen: x.firstSeen?.toMillis?.() || null,
      lastSeen: x.lastSeen?.toMillis?.() || null,
    };
  };

  if (action === "check") {
    const { identifier } = req.body || {};
    if (!identifier) return res.status(400).json({ error: "identifier required (phone / UPI id / URL)" });
    return res.status(200).json({ result: await lookup(identifier) });
  }

  if (action === "bulk-check") {
    const ids = Array.isArray(req.body?.identifiers) ? req.body.identifiers.slice(0, 50) : null;
    if (!ids || !ids.length) return res.status(400).json({ error: "identifiers[] required (1–50)" });
    const results = await Promise.all(ids.map(lookup));
    return res.status(200).json({ count: results.length, results });
  }

  if (action === "feed") {
    const limit = Math.min(50, Math.max(1, Number(req.body?.limit) || 20));
    try {
      const snap = await col.orderBy("lastSeen", "desc").limit(limit).get();
      const items = snap.docs.map((d) => { const x = d.data(); return {
        id: d.id, category: x.category || "scam", tactic: x.tactic || "",
        reports: x.count || 1, lossReports: x.lossCount || 0, verified: !!x.verified,
        lastSeen: x.lastSeen?.toMillis?.() || null,
      }; });
      return res.status(200).json({ count: items.length, items });
    } catch { return res.status(200).json({ count: 0, items: [] }); }
  }

  if (action === "report") {
    const { identifier, identifiers, category, tactic, sample, keyPhrases } = req.body || {};
    const idents = [identifier, ...(Array.isArray(identifiers) ? identifiers : [])].filter(Boolean);
    if (!idents.length && !category) return res.status(400).json({ error: "identifier(s) or category required" });
    const sigId = await _recordScamSignal(fs, {
      idents, category, tactic,
      sample: String(sample || "").slice(0, 200),
      keyPhrases: Array.isArray(keyPhrases) ? keyPhrases : [],
    });
    return res.status(200).json({ success: true, sigId });
  }

  return res.status(400).json({ error: "Unknown action. Use: check | bulk-check | feed | report." });
}

// ─── FAMILY MESH — one member's scam alerts the whole family ──────────
// Phase 3 of Scam DNA: when a family member hits a scam, every member gets a
// real-time heads-up. Alerts live under families/{fid}/alerts (server-only via
// Admin SDK; members read through the API, so no extra client rules).
async function _resolveFamily(fs, uid) {
  const u = await fs.collection("users").doc(uid).get();
  const name = u.exists ? (u.data().displayName || u.data().name || null) : null;
  const fid = u.exists ? u.data().currentFamilyId : null;
  if (fid) {
    const fam = await fs.collection("families").doc(fid).get();
    if (fam.exists) return { familyId: fid, family: fam.data(), name };
  }
  const owned = await _getFamilyByOwner(fs, uid);
  if (owned) return { familyId: owned.id, family: owned.data(), name };
  return null;
}

async function handleFamilyAlert(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const { category, tactic, sample, sigId } = req.body || {};
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "DB not configured" });
  const found = await _resolveFamily(fs, me.uid);
  if (!found) return res.status(400).json({ error: "You're not part of a family yet. Set up a Family plan to use mesh alerts." });
  const byName = found.name || me.email?.split("@")[0] || "A family member";
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = await fs.collection("families").doc(found.familyId).collection("alerts").add({
    byUid: me.uid, byName,
    category: category || "scam", tactic: String(tactic || "").slice(0, 80),
    sample: String(sample || "").slice(0, 160), sigId: sigId || null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return res.status(200).json({ success: true, alertId: ref.id, memberCount: Object.keys(found.family.members || {}).length });
}

async function handleFamilyAlerts(req, res) {
  const me = await verifyIdTokenFromHeader(req);
  if (!me) return res.status(401).json({ error: "Sign-in required" });
  const adminMod = await import("./_firebaseAdmin.js");
  const fs = adminMod.getAdminFirestore();
  if (!fs) return res.status(500).json({ error: "DB not configured" });
  const found = await _resolveFamily(fs, me.uid);
  if (!found) return res.status(200).json({ alerts: [], inFamily: false });
  let docs = [];
  try {
    const snap = await fs.collection("families").doc(found.familyId).collection("alerts").orderBy("createdAt", "desc").limit(20).get();
    docs = snap.docs;
  } catch { /* no alerts yet */ }
  const alerts = docs.map((d) => {
    const x = d.data();
    return { id: d.id, byUid: x.byUid, byName: x.byName, category: x.category, tactic: x.tactic, sample: x.sample, sigId: x.sigId || null, createdAt: x.createdAt?.toMillis?.() || null, mine: x.byUid === me.uid };
  });
  return res.status(200).json({ alerts, inFamily: true });
}

// Shared: upsert a scam signal into the Scam DNA network (used by Scam DNA +
// Scambaiter). Keys by the scammer's strongest reusable identifier, else a
// signature hash. Returns the doc id.
async function _recordScamSignal(fs, { idents, category, tactic, sample, keyPhrases }) {
  const clean = (idents || []).map(_sanitizeId).filter((x) => x.length >= 4).slice(0, 8);
  let docId;
  if (clean[0]) {
    docId = `id_${clean[0]}`.slice(0, 200);
  } else {
    const crypto = await import("crypto");
    docId = "sig_" + crypto.createHash("sha1").update(`${category || "other"}|${(keyPhrases || []).join("|")}`).digest("hex").slice(0, 24);
  }
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = fs.collection("scamSignatures").doc(docId);
  try {
    const snap = await ref.get();
    const ex = snap.exists ? snap.data() : null;
    await ref.set({
      category: category || ex?.category || "other",
      tactic: tactic || ex?.tactic || "",
      sampleText: ex?.sampleText || (sample || "").slice(0, 200),
      keyPhrases: ex?.keyPhrases || (keyPhrases || []).slice(0, 4),
      idents: FieldValue.arrayUnion(...(clean.length ? clean : ["_none"])),
      count: FieldValue.increment(1),
      firstSeen: ex?.firstSeen || FieldValue.serverTimestamp(),
      lastSeen: FieldValue.serverTimestamp(),
      viaScambait: ex?.viaScambait || undefined,
    }, { merge: true });
  } catch (e) { console.error("recordScamSignal:", e.message); }
  return docId;
}

// ─── AI SCAMBAITER — waste scammers' time, harvest their playbook ──────
// Paste the scammer's message → an AI honeypot persona replies to keep them
// talking and quietly extract their reusable identifiers + script, which feed
// the Scam DNA network. HARD ethics: the persona never shares a real OTP /
// PIN / money — only believable stalling.
async function handleScambait(req, res) {
  const { messages, persona } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "Provide the conversation so far." });
  }
  const convo = messages.slice(-14).map((m) =>
    `${m.role === "scammer" ? "SCAMMER" : "ME"}: ${String(m.text || "").slice(0, 800)}`
  ).join("\n");

  const prompt = `You run a cybersecurity HONEYPOT. Goal: waste a scammer's time and quietly extract their reusable identifiers (UPI IDs, phone numbers, bank account numbers, links) and their scam script — WITHOUT ever giving them anything real.

Play a persona: a polite, slightly confused but cooperative Indian ${persona || "middle-aged person"} who looks like an easy target. Act interested, ask innocent clarifying questions, and STALL with believable excuses (phone hanging, asking your son/daughter, OTP not arriving, bank app slow, poor network). Keep replies SHORT, human, casual (Indian English; light Hinglish fine).

HARD RULES — never break:
- Never share a real OTP, PIN, password, CVV, card number, Aadhaar, or send real money. If pushed, deflect with a plausible fake problem ("OTP not coming yaar, network issue").
- Stay safe + non-abusive. You are stalling, not threatening.

Conversation so far:
${convo}

EXTRACTION (important): scan EVERY "SCAMMER:" line above and pull out ALL reusable identifiers the scammer mentioned — UPI IDs (anything like name@bank / name@paytm / name@okaxis), phone numbers, bank account numbers, and links — even if you are also stalling. Put them in the arrays. Empty arrays ONLY if the scammer truly gave none yet.

Return STRICT JSON (no markdown):
{"reply":"the next short message I should send the scammer","extracted":{"paymentHandles":["every UPI/wallet id the SCAMMER gave"],"phones":["every phone number the SCAMMER gave"],"urls":["every link the SCAMMER gave"],"bankAccounts":["every account number the SCAMMER gave"]},"tactic":"short label of their scam","category":"upi-fraud|phishing|vishing|loan-app|job-scam|investment|lottery-prize|fake-bank|fake-courier|fake-police|kyc|other","wasted":"one short line on how this reply wastes their time"}`;

  let r = await callGemini(prompt, { temperature: 0.75, maxOutputTokens: 1200, json: true });
  let p = r.ok ? (tryParseJson(r.text) || null) : null;
  // One retry if the model returned unparseable/truncated JSON (keeps the turn
  // useful instead of a generic fallback that drops harvested intel).
  if (r.ok && (!p || !p.reply)) {
    r = await callGemini(prompt, { temperature: 0.5, maxOutputTokens: 1200, json: true });
    p = r.ok ? (tryParseJson(r.text) || null) : p;
  }
  if (!r.ok) {
    const transient = r.status === 503 || r.status === 429 || /high demand|overloaded|unavailable/i.test(r.detail || "");
    return res.status(transient ? 503 : 502).json({ error: transient ? "AI is briefly busy — try again in a few seconds." : (r.detail || "AI unavailable"), retryable: transient });
  }
  p = p || {};
  const ex = p.extracted || {};
  const idents = [
    ...(ex.paymentHandles || []), ...(ex.phones || []), ...(ex.urls || []), ...(ex.bankAccounts || []),
  ].filter(Boolean);

  // Feed the Scam DNA network if the scammer revealed anything reusable.
  let fedSigId = null;
  if (idents.length) {
    try {
      const adminMod = await import("./_firebaseAdmin.js");
      const fs = adminMod.getAdminFirestore();
      if (fs) {
        fedSigId = await _recordScamSignal(fs, {
          idents, category: p.category || "other", tactic: p.tactic || "",
          sample: messages.find((m) => m.role === "scammer")?.text || "",
        });
      }
    } catch (e) { console.error("scambait feed:", e.message); }
  }

  return res.status(200).json({
    reply: p.reply || "Sorry, my phone is hanging… one minute.",
    extracted: { paymentHandles: ex.paymentHandles || [], phones: ex.phones || [], urls: ex.urls || [], bankAccounts: ex.bankAccounts || [] },
    tactic: p.tactic || "",
    category: p.category || "other",
    wasted: p.wasted || "",
    fedScamDna: !!fedSigId,
  });
}

// ─── WHATSAPP BOT (Meta Cloud API) — scam-check by forwarding a message ──
// Webhook: POST /api/tools?tool=whatsapp. Parses inbound text, runs the scam
// fingerprint, replies via Graph API, and feeds the Scam DNA network.
async function _waSend(to, body) {
  const token = process.env.WHATSAPP_TOKEN, phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) { console.warn("WhatsApp env missing"); return; }
  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4000), preview_url: false } }),
    });
  } catch (e) { console.error("wa send:", e.message); }
}

async function handleWhatsapp(req, res) {
  const body = req.body || {};
  let msg = null, from = null;
  try {
    const v = body.entry?.[0]?.changes?.[0]?.value;
    const m = v?.messages?.[0];
    if (m && m.type === "text") { msg = m.text?.body || ""; from = m.from; }
  } catch { /* ignore */ }

  // ACK Meta IMMEDIATELY — it requires a 200 within ~5s or it retries the
  // webhook and eventually throttles/disables it. The AI work below runs after
  // the response is flushed (Vercel keeps the function alive until this async
  // handler resolves), so Gemini latency never delays Meta's acknowledgement.
  res.status(200).json({ ok: true }); // instant ack — Meta needs a 200 in ~5s
  if (from && msg) waitUntil(_processWhatsapp(from, msg));
}

// Runs AFTER the response is flushed. waitUntil keeps the Vercel function alive
// until this resolves, so Gemini latency never delays Meta's acknowledgement
// (Vercel buffers the HTTP response until the handler returns — without this,
// the slow AI work would push the 200 past Meta's timeout → retries/throttle).
async function _processWhatsapp(from, msg) {
  // greeting / help — match common openers even with a name ("hello vrikaan"),
  // but skip if it carries a URL / number / @ (that's a message to analyze).
  const _t = msg.trim();
  if (/^(hi+|hello|hey+|start|help|namaste|hlo|hii|yo|good (morning|evening|afternoon))\b/i.test(_t)
      && _t.length < 30 && !/https?:|www\.|\d{6,}|@|\.(com|in|net|org)/i.test(_t)) {
    await _waSend(from, "🛡 VRIKAAN Scam Check\n\nForward me any suspicious SMS, WhatsApp, or UPI message and I'll tell you in seconds if it's a scam — free.\n\nJust paste the message here. 👇");
    return;
  }

  try {
    const prompt = `India scam analyst. Analyze this forwarded message. STRICT JSON, no markdown:
{"verdict":"scam"|"likely-scam"|"suspicious"|"probably-safe","riskScore":0-100,"category":"upi-fraud|phishing|vishing|loan-app|job-scam|lottery-prize|fake-bank|fake-courier|kyc|other","tactic":"short","paymentHandles":[],"phones":[],"urls":[],"advice":["1-2 short actions"]}
Message:"""${msg.slice(0, 3000)}"""`;
    const r = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 700, json: true });
    if (!r.ok) { await _waSend(from, "⚠ Our AI is briefly busy. Please resend the message in a few seconds."); return; }
    const p = tryParseJson(r.text) || {};
    const emoji = { "scam": "🚨", "likely-scam": "🚨", "suspicious": "⚠", "probably-safe": "✅" }[p.verdict] || "⚠";
    const label = { "scam": "SCAM", "likely-scam": "LIKELY SCAM", "suspicious": "SUSPICIOUS", "probably-safe": "PROBABLY SAFE" }[p.verdict] || "SUSPICIOUS";
    const advice = (Array.isArray(p.advice) ? p.advice : []).slice(0, 2).map((a) => `• ${a}`).join("\n");
    const ids = [...(p.paymentHandles || []), ...(p.phones || []), ...(p.urls || [])].slice(0, 4);

    // feed Scam DNA
    try {
      const adminMod = await import("./_firebaseAdmin.js");
      const fs = adminMod.getAdminFirestore();
      if (fs) await _recordScamSignal(fs, { idents: ids, category: p.category, tactic: p.tactic, sample: msg });
    } catch { /* ignore */ }

    let reply = `${emoji} *${label}* — risk ${p.riskScore ?? "?"}/100\n${p.tactic ? `Type: ${p.tactic}\n` : ""}`;
    if (ids.length) reply += `\nScammer details: ${ids.join(", ")}`;
    if (advice) reply += `\n\nWhat to do:\n${advice}`;
    reply += `\n\nNever share OTP/UPI PIN. Verify on official numbers only.\n— VRIKAAN`;
    await _waSend(from, reply);
  } catch (e) {
    console.error("whatsapp handler:", e.message);
    try { await _waSend(from, "Sorry, something went wrong. Please try again."); } catch { /* ignore */ }
  }
  return;
}

const HANDLERS = {
  whois: handleWhois,
  "newsletter-subscribe": handleNewsletterSubscribe,
  "enterprise-lead": handleEnterpriseLead,
  "coupon-validate": handleCouponValidate,
  "whatsapp-inbound": handleWhatsappInbound,
  "security-headers": handleSecurityHeaders,
  "file-hash-check": handleFileHashCheck,
  "ai-explain": handleGeminiExplain,
  "breach-check": handleBreachCheck,
  "password-check": handlePasswordCheck,
  ip: handleIpLookup,
  "weekly-digest": handleWeeklyDigest,
  "leak-check": handleLeakCheck,
  refund: handleRefund,
  "totp-setup": handleTotpSetup,
  "totp-confirm": handleTotpConfirm,
  "totp-verify": handleTotpVerify,
  "totp-disable": handleTotpDisable,
  "webhook-set": handleWebhookSet,
  "webhook-clear": handleWebhookClear,
  "webhook-test": handleWebhookTest,
  "team-create": handleTeamCreate,
  "team-invite": handleTeamInvite,
  "team-accept-invite": handleTeamAcceptInvite,
  "team-remove-member": handleTeamRemoveMember,
  "family-create": handleFamilyCreate,
  "family-invite": handleFamilyInvite,
  "family-accept-invite": handleFamilyAcceptInvite,
  "family-remove-member": handleFamilyRemoveMember,
  "family-set-mode": handleFamilySetMode,
  "family-add-seat": handleFamilyAddSeat,
  "family-info": handleFamilyInfo,
  "family-alert": handleFamilyAlert,
  "family-alerts": handleFamilyAlerts,
  "scam-check": handleScamCheck,
  "scam-dna": handleScamDna,
  "scam-dna-api": handleScamDnaApi,
  "scambait": handleScambait,
  "whatsapp": handleWhatsapp,
  "risk-score": handleRiskScore,
  "headers-fix": handleHeadersFix,
  "deepfake-audio": handleDeepfakeAudio,
  "vuln-scan": handleVulnScan,
  "vuln-synthesize": handleVulnSynthesize,
};

// Some tools accept GET (ip lookup, cron pings); others require POST.
const GET_ALLOWED = new Set(["ip", "weekly-digest", "leak-check"]);
// Tools that bypass shared rate-limit (cron uses its own auth)
const RL_EXEMPT = new Set(["weekly-digest"]);

/**
 * Validate an incoming Bearer token against /api_tokens/{token} in
 * Firestore using the public REST API. Returns { valid, uid, plan }.
 */
async function validateApiToken(authHeader) {
  if (!authHeader) return { valid: false };
  const m = /^Bearer\s+(vrk_[a-f0-9]{48})\s*$/i.exec(authHeader);
  if (!m) return { valid: false };
  const token = m[1];
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return { valid: false };
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/api_tokens/${encodeURIComponent(token)}?key=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) return { valid: false };
    const doc = await r.json();
    const f = doc.fields || {};
    if (f.active?.booleanValue !== true) return { valid: false };
    return { valid: true, uid: f.uid?.stringValue, plan: f.plan?.stringValue || "starter" };
  } catch {
    return { valid: false };
  }
}

export default async function handler(req, res) {
  // WhatsApp Cloud API webhook verification (Meta GET with hub.* params).
  if (req.method === "GET" && req.query["hub.mode"] === "subscribe") {
    if (req.query["hub.verify_token"] && req.query["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(req.query["hub.challenge"]);
    }
    return res.status(403).end();
  }

  const tool = req.query.tool;
  if (!tool || !HANDLERS[tool]) {
    // Don't enumerate available actions in the response — reduces attack surface
    // visibility. Log the attempted name server-side so we can spot probing.
    if (tool) console.warn(`[api/tools] unknown action requested: ${String(tool).slice(0, 64)}`);
    return res.status(400).json({ error: "Missing or unknown tool parameter" });
  }

  const allowGet = GET_ALLOWED.has(tool);
  if (req.method !== "POST" && !(allowGet && req.method === "GET")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Caller auth — Firebase ID token (browser) or long-lived API token
  const caller = await resolveCaller(req);
  req.apiClient = { valid: caller.source !== "anon", uid: caller.uid, plan: caller.plan, source: caller.source };

  // Tier gate — refuse Pro/Enterprise actions for under-tier callers.
  // Free callers get a daily 3-use quota on Pro actions (scoped by uid or IP).
  const required = ACTION_TIERS[tool] || "free";
  if (!planMeetsTier(caller.plan, required)) {
    if (required === "enterprise") {
      return res.status(402).json({
        error: "Enterprise plan required",
        code: "TIER_ENTERPRISE_REQUIRED",
        requiredTier: "enterprise",
        callerPlan: caller.plan,
        upgradeUrl: "/contact?intent=enterprise",
      });
    }
    if (required === "family") {
      return res.status(402).json({
        error: "Family plan required",
        code: "TIER_FAMILY_REQUIRED",
        requiredTier: "family",
        callerPlan: caller.plan,
        upgradeUrl: "/family-plan",
        // Diagnostic — surfaces when admin SDK fails token verify silently.
        hint: caller.source === "anon" ? "Server could not verify your sign-in. Check that FIREBASE_SERVICE_ACCOUNT env var is set in Vercel." : undefined,
      });
    }
    // required === "pro" → check daily free quota
    const scope = caller.uid || (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "ip-unknown").split(",")[0].trim();
    const q = getFreeQuota(scope, tool);
    if (q.remaining <= 0) {
      res.setHeader("X-Quota-Used", String(q.used));
      res.setHeader("X-Quota-Limit", String(q.limit));
      return res.status(402).json({
        error: "Pro plan required (daily free quota exhausted)",
        code: "TIER_QUOTA_EXHAUSTED",
        requiredTier: "pro",
        callerPlan: caller.plan,
        used: q.used,
        limit: q.limit,
        upgradeUrl: "/pricing",
      });
    }
    bumpFreeQuota(scope, tool);
    res.setHeader("X-Quota-Used", String(q.used + 1));
    res.setHeader("X-Quota-Limit", String(q.limit));
    res.setHeader("X-Quota-Remaining", String(q.remaining - 1));
  }

  if (!RL_EXEMPT.has(tool)) {
    const rateLimits = (caller.plan === "pro" || caller.plan === "enterprise")
      ? { ipLimit: 200, userLimit: 600, windowMs: 60000 }   // Pro+
      : { ipLimit: 20, userLimit: 60, windowMs: 60000 };    // Free / anon
    const rl = applyRateLimit(req, rateLimits);
    if (!rl.allowed) {
      res.setHeader("Retry-After", rl.retryAfter);
      return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
    }
  }

  return HANDLERS[tool](req, res);
}
