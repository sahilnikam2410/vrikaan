import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO, { faqSchema } from "../../components/SEO";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  white: "#f1f5f9", muted: "#94a3b8", green: "#22c55e",
  red: "#ef4444", border: "rgba(148,163,184,0.1)",
  cyan: "#14e3c5", accent: "#6366f1", gold: "#eab308",
};

// SEO-grade competitor comparison data. Numbers are public, marketed
// pricing — do not invent claims that can't be sourced from the
// competitor's homepage.
const COMPETITORS = {
  norton: {
    name: "Norton 360",
    tagline: "Vrikaan vs Norton 360 — affordable cybersecurity for individuals and small teams",
    intro: "Norton 360 is a household name in consumer antivirus. VRIKAAN is built for the modern threat landscape — phishing, AI scams, dark-web exposure, identity theft — at a fraction of Norton's price.",
    competitor: {
      pricing: "$59.99/yr ≈ ₹4,990/yr",
      audience: "Consumers, families",
      strengths: ["Antivirus", "VPN", "Cloud backup", "Brand recognition"],
      gaps: ["Limited fraud analysis", "No identity X-ray", "No dark web AI signals", "Pricier annual lock-in"],
    },
    rows: [
      { f: "Real-time threat detection",   v: true,  c: true  },
      { f: "AI fraud / phishing analyzer", v: true,  c: false },
      { f: "Dark web monitoring",          v: true,  c: true  },
      { f: "Identity X-ray",               v: true,  c: false },
      { f: "Password vault",               v: true,  c: true  },
      { f: "Vulnerability scanner",        v: true,  c: false },
      { f: "Phishing trainer",             v: true,  c: false },
      { f: "Browser fingerprint check",    v: true,  c: false },
      { f: "DNS leak test",                v: true,  c: false },
      { f: "VPN",                          v: false, c: true,  cnote: "via paid bundle" },
      { f: "Cloud backup",                 v: false, c: true  },
      { f: "Antivirus engine",             v: false, c: true,  cnote: "Norton specializes here" },
      { f: "Annual price (Standard)",      v: "₹490",  c: "₹4,990+" },
      { f: "Free tier",                    v: true,  c: false },
      { f: "Student discount",             v: "50%", c: false },
    ],
    faqs: [
      { q: "Is VRIKAAN a Norton replacement?", a: "VRIKAAN focuses on the threats that hit individuals first today: phishing, fraud, identity exposure, and breached credentials. Norton excels at on-device antivirus. Many users run VRIKAAN alongside Windows Defender (which is already free) instead of paying for Norton's bundle." },
      { q: "Why is VRIKAAN cheaper?", a: "We're cloud-native, no agents to ship and update, no enterprise sales motion. Lower overhead means lower prices." },
      { q: "Does VRIKAAN have a VPN?", a: "Not yet. Norton bundles a VPN; we recommend pairing VRIKAAN with a privacy-focused VPN like Mullvad or ProtonVPN for under ₹500/month combined." },
    ],
  },
  lastpass: {
    name: "LastPass",
    tagline: "Vrikaan vs LastPass — beyond just passwords",
    intro: "LastPass is a password manager. VRIKAAN includes a built-in vault plus the rest of the security stack — fraud detection, dark web monitoring, identity X-ray, and 15+ tools.",
    competitor: {
      pricing: "$3/mo ≈ ₹250/mo (Premium)",
      audience: "Individuals + families",
      strengths: ["Password vault", "Browser autofill", "Encrypted notes"],
      gaps: ["No fraud analysis", "No threat intelligence", "Multiple breaches in 2022", "Single-purpose"],
    },
    rows: [
      { f: "Password vault",                v: true,  c: true  },
      { f: "AI fraud / phishing analyzer",  v: true,  c: false },
      { f: "Dark web monitoring",           v: true,  c: true,  cnote: "Premium only" },
      { f: "Breach alerts",                 v: true,  c: true  },
      { f: "Identity X-ray",                v: true,  c: false },
      { f: "Vulnerability scanner",         v: true,  c: false },
      { f: "Phishing trainer",              v: true,  c: false },
      { f: "Threat map",                    v: true,  c: false },
      { f: "Browser autofill",              v: false, c: true  },
      { f: "Free tier",                     v: true,  c: true  },
      { f: "Monthly price",                 v: "₹49", c: "₹250" },
      { f: "Open security history",         v: true,  c: false, cnote: "LastPass: 2022 vault breach" },
    ],
    faqs: [
      { q: "Should I move from LastPass to VRIKAAN?", a: "If you only need a password manager, Bitwarden (free, open-source) is an excellent alternative. If you want passwords plus the broader security toolkit (fraud, identity, breach, training), VRIKAAN consolidates everything into one subscription." },
      { q: "Is VRIKAAN's password vault as feature-rich?", a: "Our vault covers core needs — generation, breach checks, secure storage. We don't offer browser-side autofill yet; that's on the roadmap." },
    ],
  },
  bitdefender: {
    name: "Bitdefender",
    tagline: "Vrikaan vs Bitdefender — modern security beyond antivirus",
    intro: "Bitdefender is a strong antivirus suite. VRIKAAN complements it with phishing analysis, dark web exposure, and identity tools that AV products typically don't cover.",
    competitor: {
      pricing: "₹1,799/yr (Internet Security)",
      audience: "Consumers, SMB",
      strengths: ["Antivirus engine", "Anti-ransomware", "Webcam protection"],
      gaps: ["No phishing trainer", "No identity X-ray", "No public scam database"],
    },
    rows: [
      { f: "AI fraud / phishing analyzer", v: true,  c: false },
      { f: "Dark web monitoring",          v: true,  c: true  },
      { f: "Identity X-ray",               v: true,  c: false },
      { f: "Antivirus engine",             v: false, c: true  },
      { f: "Anti-ransomware",              v: false, c: true  },
      { f: "Phishing trainer",             v: true,  c: false },
      { f: "Vulnerability scanner",        v: true,  c: true,  cnote: "system only" },
      { f: "Public scam database",         v: true,  c: false },
      { f: "Free tier",                    v: true,  c: false },
      { f: "Annual price",                 v: "₹490", c: "₹1,799" },
    ],
    faqs: [
      { q: "Do I need both?", a: "VRIKAAN doesn't replace your AV. Run Windows Defender (free + built-in) alongside VRIKAAN for the best of both worlds." },
    ],
  },
};

const VRIKAAN_FEATURES = [
  "AI fraud + phishing analyzer",
  "Dark web monitoring",
  "Identity X-ray",
  "Vulnerability scanner",
  "Password vault",
  "Phishing trainer",
  "Threat map",
  "Free tier with daily quota",
  "₹49/mo Standard plan",
  "50% student discount",
];

function CheckOrCross({ on, label }) {
  return on
    ? <span style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>✓{label ? ` ${label}` : ""}</span>
    : <span style={{ color: T.red, fontWeight: 700, fontSize: 14 }}>✗{label ? ` ${label}` : ""}</span>;
}

function Cell({ value, note }) {
  if (typeof value === "boolean") {
    return <CheckOrCross on={value} label={note} />;
  }
  return (
    <span style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>
      {value}{note && <span style={{ color: T.muted, fontWeight: 400, fontSize: 11 }}> ({note})</span>}
    </span>
  );
}

export default function Compare() {
  const { competitor } = useParams();
  const data = COMPETITORS[competitor];
  if (!data) return <Navigate to="/pricing" replace />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title={`VRIKAAN vs ${data.name} — Cybersecurity Comparison`}
        description={`Side-by-side comparison: ${data.tagline}. Features, pricing, and which to pick.`}
        path={`/vs/${competitor}`}
        keywords={`vrikaan vs ${data.name.toLowerCase()}, ${data.name.toLowerCase()} alternative, cybersecurity comparison`}
        jsonLd={faqSchema(data.faqs)}
      />
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        {/* Hero */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 40px", textAlign: "center" }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 20,
            background: "rgba(99,102,241,0.12)", color: T.accent,
            fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18,
          }}>Comparison</span>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: T.white,
            margin: "0 0 14px", fontFamily: "'Vrikaan Sans', sans-serif", lineHeight: 1.1,
          }}>
            VRIKAAN <span style={{ color: T.muted, fontWeight: 400 }}>vs</span> {data.name}
          </h1>
          <p style={{ fontSize: 17, color: T.muted, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            {data.intro}
          </p>
        </section>

        {/* Quick verdict */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 40px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}>
            <div style={{
              padding: 24, borderRadius: 16,
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.06))",
              border: `1px solid ${T.accent}40`,
            }}>
              <div style={{ fontSize: 12, color: T.cyan, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>VRIKAAN</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.white, margin: "6px 0 4px" }}>₹49/mo</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>15+ tools, AI-powered, free tier</div>
              <Link to="/pricing" style={{
                display: "inline-block", padding: "10px 18px", borderRadius: 8,
                background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>See Plans →</Link>
            </div>
            <div style={{
              padding: 24, borderRadius: 16,
              background: T.card, border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{data.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.white, margin: "6px 0 4px" }}>{data.competitor.pricing}</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>{data.competitor.audience}</div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                Strengths: {data.competitor.strengths.join(", ")}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 40px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans', sans-serif" }}>Feature-by-feature</h2>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
              padding: "12px 18px",
              background: "rgba(15,23,42,0.6)",
              borderBottom: `1px solid ${T.border}`,
              fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1,
            }}>
              <div>Feature</div>
              <div style={{ textAlign: "center", color: T.cyan }}>VRIKAAN</div>
              <div style={{ textAlign: "center" }}>{data.name}</div>
            </div>
            {data.rows.map((row, i) => (
              <div key={row.f} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                padding: "12px 18px", alignItems: "center",
                borderBottom: i === data.rows.length - 1 ? "none" : `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 14, color: T.white }}>{row.f}</div>
                <div style={{ textAlign: "center" }}><Cell value={row.v} note={row.vnote} /></div>
                <div style={{ textAlign: "center" }}><Cell value={row.c} note={row.cnote} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* When to pick which */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 40px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans', sans-serif" }}>Pick VRIKAAN if you need</h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}>
            {VRIKAAN_FEATURES.map((feat) => (
              <div key={feat} style={{
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(20,227,197,0.05)",
                border: `1px solid rgba(20,227,197,0.18)`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ color: T.cyan, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: T.white }}>{feat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 40px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans', sans-serif" }}>FAQ</h2>
          {data.faqs.map((f, i) => (
            <details key={i} style={{
              padding: 18, marginBottom: 8,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 12, color: T.white, cursor: "pointer",
            }}>
              <summary style={{ fontSize: 15, fontWeight: 600, listStyle: "none" }}>{f.q}</summary>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "10px 0 0" }}>{f.a}</p>
            </details>
          ))}
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{
            padding: 32, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.06))",
            border: `1px solid ${T.accent}30`,
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: T.white, margin: "0 0 8px", fontFamily: "'Vrikaan Sans', sans-serif" }}>
              Try VRIKAAN free for 7 days
            </h3>
            <p style={{ fontSize: 14, color: T.muted, margin: "0 0 18px" }}>
              No credit card. Cancel anytime. All Advanced features unlocked.
            </p>
            <Link to="/pricing" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>Start Free Trial →</Link>
          </div>
        </section>

        {/* Other comparisons */}
        <section style={{ maxWidth: 920, margin: "40px auto 0", padding: "0 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 14, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Other Comparisons</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.keys(COMPETITORS).filter(k => k !== competitor).map((k) => (
              <Link key={k} to={`/vs/${k}`} style={{
                padding: "8px 16px", borderRadius: 100,
                background: T.card, border: `1px solid ${T.border}`,
                color: T.white, fontSize: 13, textDecoration: "none",
                fontWeight: 600,
              }}>VRIKAAN vs {COMPETITORS[k].name}</Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
