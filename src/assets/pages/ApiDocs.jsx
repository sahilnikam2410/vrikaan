import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

/**
 * /api — public developer docs + free-trial signup for the VRIKAAN API.
 * Lists the 12 production endpoints exposed via /api/tools router. Each
 * shows method, params, sample response, and a curl example.
 *
 * Trial CTA → /signup?intent=api (post-signup, user generates token from
 * /user-dashboard's API Token panel).
 */

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.6)", white: "#f1f5f9",
  muted: "#94a3b8", mutedDark: "#64748b",
  accent: "#6366f1", cyan: "#14b8a6", green: "#22c55e", yellow: "#fbbf24",
  border: "rgba(148,163,184,0.10)",
};

const ENDPOINTS = [
  {
    tier: "free", method: "POST", action: "scam-check",
    desc: "AI classifies any SMS / WhatsApp message / URL as scam vs safe with reasoning.",
    body: { message: "Your KYC will expire today. Click http://kyc-update.in..." },
    response: { verdict: "scam", confidence: 0.96, reason: "Urgency + suspicious .in shortlink + KYC-impersonation pattern", risk: "high" },
  },
  {
    tier: "free", method: "POST", action: "breach-check",
    desc: "Check if an email has been in known data breaches.",
    body: { email: "user@example.com" },
    response: { found: true, breaches: 3, sources: ["LinkedIn 2021", "Adobe 2013"] },
  },
  {
    tier: "free", method: "POST", action: "password-check",
    desc: "Test password strength + leak status via k-anonymity HIBP API.",
    body: { password: "qwerty123" },
    response: { strength: "very weak", leakedCount: 8200, suggestions: ["Use 16+ chars", "Add symbols"] },
  },
  {
    tier: "free", method: "GET", action: "ip",
    desc: "IP geolocation, ISP, reverse DNS, threat intel.",
    body: "?ip=8.8.8.8",
    response: { ip: "8.8.8.8", country: "US", isp: "Google LLC", asn: "AS15169", threatScore: 0 },
  },
  {
    tier: "free", method: "POST", action: "whois",
    desc: "Domain registration data, expiry, registrar.",
    body: { domain: "vrikaan.com" },
    response: { domain: "vrikaan.com", registrar: "GoDaddy", created: "2024-...", expires: "2026-..." },
  },
  {
    tier: "free", method: "POST", action: "leak-check",
    desc: "Search dark-web leak databases for a string (email, phone, name).",
    body: { query: "user@example.com" },
    response: { hits: 2, sources: ["combolist-2024", "ru-marketplace-2023"] },
  },
  {
    tier: "pro", method: "POST", action: "deepfake-audio",
    desc: "Detect AI-generated/cloned voice in an uploaded audio clip.",
    body: { audioUrl: "https://..." },
    response: { isDeepfake: true, confidence: 0.87, model: "ElevenLabs", segments: [{ start: 1.2, end: 4.8 }] },
  },
  {
    tier: "pro", method: "POST", action: "vuln-scan",
    desc: "14-point passive vulnerability scan on any URL — headers, TLS, CORS, mixed content, etc.",
    body: { url: "https://example.com" },
    response: { score: 72, findings: [{ id: "missing-hsts", severity: "medium", desc: "..." }] },
  },
  {
    tier: "pro", method: "POST", action: "security-headers",
    desc: "Audit response headers (CSP, HSTS, X-Frame-Options, etc.) with severity scoring.",
    body: { url: "https://example.com" },
    response: { grade: "B", headers: { csp: { present: true, weakness: "unsafe-inline" } } },
  },
  {
    tier: "pro", method: "POST", action: "file-hash-check",
    desc: "Look up SHA-256 of a file against malware databases.",
    body: { sha256: "abc123..." },
    response: { knownMalware: false, vtScore: "0/72", lastSeen: null },
  },
  {
    tier: "pro", method: "POST", action: "ai-explain",
    desc: "AI-explains a security alert / log line / vulnerability in plain English. Optional Hindi output.",
    body: { input: "TLS handshake failed: cert chain incomplete", language: "en" },
    response: { explanation: "The server's TLS certificate is missing intermediate...", actions: ["Reinstall full chain"] },
  },
  {
    tier: "enterprise", method: "POST", action: "webhook-test",
    desc: "Fire a test event to your configured webhook URL with HMAC signature.",
    body: { event: "scam.detected" },
    response: { delivered: true, statusCode: 200, latencyMs: 142 },
  },
];

const TIER_COLOR = { free: "#14b8a6", pro: "#6366f1", enterprise: "#fbbf24" };

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{
        background: "transparent", border: `1px solid ${T.border}`,
        color: copied ? T.green : T.muted,
        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        cursor: "pointer", fontFamily: "ui-monospace, monospace",
      }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ children, lang = "json" }) {
  const text = typeof children === "string" ? children : JSON.stringify(children, null, 2);
  return (
    <div style={{ position: "relative", marginTop: 12 }}>
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: T.mutedDark, textTransform: "uppercase", letterSpacing: 1 }}>{lang}</span>
        <CopyBtn text={text} />
      </div>
      <pre style={{
        background: "#020617", border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "16px 18px", margin: 0, overflow: "auto",
        fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5,
        color: "#cbd5e1", lineHeight: 1.6,
      }}>{text}</pre>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="VRIKAAN API — AI cybersecurity endpoints for developers & SMBs"
        description="12 production endpoints: scam detection, deepfake audio, breach lookup, vulnerability scan, file-hash check. Free tier 100 calls/day · paid tier from ₹99/mo. cURL + REST docs."
        path="/api"
        keywords="cybersecurity api india, scam detection api, deepfake api, breach check api, vulnerability scanner api"
      />
      <Navbar />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 60 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 100,
            background: `${T.accent}10`, border: `1px solid ${T.accent}30`,
            fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 18, letterSpacing: 0.5,
          }}>API · v1 · Production</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 800,
            letterSpacing: "-0.03em", margin: "0 0 18px", lineHeight: 1.1,
          }}>
            Ship cyber defense<br/>
            <span style={{ background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              in 10 lines of code.
            </span>
          </h1>
          <p style={{ color: T.muted, fontSize: 17, lineHeight: 1.7, maxWidth: 640, margin: "0 0 28px" }}>
            12 endpoints. Real-time AI scam detection, deepfake audio detection, breach lookup, vulnerability scans. Built for fintechs, banks, e-commerce, SaaS, govt portals. Pay-as-you-go from ₹99/mo.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <Link to="/signup?intent=api" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px",
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff", borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 700, fontFamily: "'Vrikaan Sans', sans-serif",
              boxShadow: `0 8px 24px ${T.accent}33`,
            }}>
              Get free API key →
            </Link>
            <a href="#endpoints" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 22px", borderRadius: 10,
              border: `1px solid ${T.border}`,
              color: T.white, textDecoration: "none",
              fontSize: 14, fontWeight: 600,
            }}>
              See endpoints
            </a>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: T.mutedDark }}>
            <span>✓ Free tier: 100 calls/day</span>
            <span>✓ &lt;200ms p50 latency</span>
            <span>✓ India + global edge</span>
            <span>✓ SLA-backed on Enterprise</span>
          </div>
        </div>

        {/* Quickstart */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 26, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.02em",
          }}>Quickstart</h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 18px" }}>
            1. <Link to="/signup?intent=api" style={{ color: T.cyan }}>Sign up</Link> (free, 30 sec).
            2. Generate API token from <Link to="/user-dashboard" style={{ color: T.cyan }}>dashboard</Link>.
            3. Call any endpoint:
          </p>
          <CodeBlock lang="bash">{`curl -X POST 'https://vrikaan.com/api/tools?tool=scam-check' \\
  -H 'Authorization: Bearer vrk_live_xxxxxxxxxxxxxxxxx' \\
  -H 'Content-Type: application/json' \\
  -d '{"message":"Your KYC will expire today. Click http://kyc-update.in"}'`}</CodeBlock>
          <CodeBlock>{JSON.stringify({ verdict: "scam", confidence: 0.96, reason: "Urgency + suspicious .in shortlink + KYC impersonation", risk: "high" }, null, 2)}</CodeBlock>
        </section>

        {/* Auth */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 26, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.02em",
          }}>Authentication</h2>
          <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: "0 0 14px" }}>
            All requests authenticate via <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>Authorization: Bearer &lt;token&gt;</code>. Tokens start with <code>vrk_live_</code> for production. Rate limits and tier access are derived from the token's plan.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
            {[
              { tier: "Free",       limit: "100 req/day",       price: "₹0",   color: T.cyan },
              { tier: "Pro",        limit: "10,000 req/day",    price: "₹99/mo",  color: T.accent },
              { tier: "Enterprise", limit: "Unlimited + SLA",   price: "₹199/mo+", color: T.yellow },
            ].map((t) => (
              <div key={t.tier} style={{
                background: T.card, border: `1px solid ${t.color}33`,
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.color, marginBottom: 6 }}>{t.tier.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.white }}>{t.price}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{t.limit}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 26, fontWeight: 700, margin: "0 0 18px", letterSpacing: "-0.02em",
          }}>Endpoints</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ENDPOINTS.map((e) => (
              <details key={e.action} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "18px 22px",
              }}>
                <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1, color: TIER_COLOR[e.tier],
                    padding: "3px 8px", borderRadius: 4, background: `${TIER_COLOR[e.tier]}15`,
                    border: `1px solid ${TIER_COLOR[e.tier]}33`,
                  }}>{e.tier.toUpperCase()}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark, fontFamily: "ui-monospace, monospace" }}>{e.method}</span>
                  <code style={{ fontSize: 13, color: T.white, fontFamily: "ui-monospace, monospace" }}>/api/tools?tool={e.action}</code>
                  <span style={{ fontSize: 13, color: T.muted, flex: 1, minWidth: 200 }}>— {e.desc}</span>
                </summary>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: T.mutedDark, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Request body</div>
                  <CodeBlock>{e.body}</CodeBlock>
                  <div style={{ fontSize: 11, color: T.mutedDark, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase", marginTop: 14, marginBottom: 6 }}>Sample response</div>
                  <CodeBlock>{e.response}</CodeBlock>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SDK plug */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 26, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.02em",
          }}>SDKs</h2>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 18 }}>Official SDKs coming Q3. Until then, the REST API is one-line in any language:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <CodeBlock lang="node">{`// Node.js
const r = await fetch('https://vrikaan.com/api/tools?tool=scam-check', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${process.env.VRIKAAN_KEY}\`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: input }),
});
const result = await r.json();`}</CodeBlock>
            <CodeBlock lang="python">{`# Python
import requests
r = requests.post(
  'https://vrikaan.com/api/tools?tool=scam-check',
  headers={'Authorization': f'Bearer {os.environ["VRIKAAN_KEY"]}'},
  json={'message': input}
)
result = r.json()`}</CodeBlock>
          </div>
        </section>

        {/* Use cases */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 26, fontWeight: 700, margin: "0 0 18px", letterSpacing: "-0.02em",
          }}>Built for</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { icon: "🏦", who: "Fintechs / Neobanks", use: "Real-time scam-check on UPI/transfer notes; deepfake-audio check on KYC calls." },
              { icon: "🛒", who: "E-commerce", use: "Phishing-URL detection on chat support; breach-check on customer signup." },
              { icon: "💬", who: "SaaS / Messaging", use: "AI moderation: scam links in chats, deepfake audio in voice notes." },
              { icon: "🏛️", who: "Govt portals", use: "Aadhaar-mask, vuln-scan citizen-facing endpoints, leak-check public officials." },
            ].map((u) => (
              <div key={u.who} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{u.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 4 }}>{u.who}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{u.use}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          textAlign: "center", padding: "44px 32px",
          background: `linear-gradient(135deg, ${T.accent}10, ${T.cyan}06)`,
          border: `1px solid ${T.accent}22`,
          borderRadius: 20,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Start with 100 free calls/day
          </h2>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>
            No credit card. Upgrade anytime. Cancel anytime.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup?intent=api" style={{
              display: "inline-block", padding: "13px 32px",
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff", borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 700, fontFamily: "'Vrikaan Sans', sans-serif",
              boxShadow: `0 8px 24px ${T.accent}33`,
            }}>
              Get API key (free)
            </Link>
            <Link to="/contact?intent=enterprise-api" style={{
              display: "inline-block", padding: "13px 32px",
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted, borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 600,
            }}>
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
