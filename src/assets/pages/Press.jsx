import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import EmailRouting from "../../components/EmailRouting";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", gold: "#eab308",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.1)",
};

const FACTS = [
  { label: "Founded", value: "2024" },
  { label: "Headquarters", value: "India" },
  { label: "Founder & CEO", value: "Sahil Anil Nikam" },
  { label: "Co-Founder (SOC & Research)", value: "Khushi Ishwar Raigade" },
  { label: "Category", value: "Cybersecurity / SaaS" },
  { label: "Mission", value: "Empower defenders for a safer digital future" },
  { label: "Audience", value: "Individuals, students, SMBs, family offices" },
];

const ASSETS = [
  { name: "Wolf Mark (PNG, transparent)", file: "/wolf-mark.png", desc: "Primary brand mark, square crop, transparent background." },
  { name: "Wolf Compact (PNG)", file: "/wolf-compact.png", desc: "Tight head crop for navbars, social avatars." },
  { name: "Wolf Icon (PNG, dark base)", file: "/wolf-icon.png", desc: "iOS / PWA / app store rounded base." },
  { name: "Open Graph Banner", file: "/og-image.png", desc: "1200×630 social preview card used on link shares." },
  { name: "Favicon (SVG)", file: "/favicon.svg", desc: "Vector favicon, scales without artifacts." },
];

const QUOTES = [
  {
    name: "Sahil Anil Nikam",
    role: "Founder & CEO · SOC Analyst & Cybersecurity Researcher",
    quote: "The internet's threat model has shifted. Phishing, identity theft, and AI-powered fraud now hit individuals first — not enterprises. VRIKAAN puts enterprise-grade defense in the hands of one person, one family, one small team.",
  },
  {
    name: "Khushi Ishwar Raigade",
    role: "Co-Founder · SOC Analyst & Cybersecurity Researcher",
    quote: "Detection beats reaction. Real defenders find the attacker before they find the data — that's the philosophy we build VRIKAAN's SOC, MITRE ATT&CK mapping, and threat-intelligence pipeline around.",
  },
];

export default function Press() {
  const [copied, setCopied] = useState("");

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Press Kit"
        description="Brand assets, founder bio, fact sheet, and quotes for journalists, analysts, and partners covering VRIKAAN."
        path="/press"
      />
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        {/* Hero */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px", textAlign: "center" }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 20,
            background: "rgba(99,102,241,0.12)", color: T.accent,
            fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18,
          }}>Press & Media</span>
          <h1 style={{
            fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 800, color: T.white,
            margin: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1,
          }}>
            Press Kit
          </h1>
          <p style={{ fontSize: 17, color: T.muted, maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Everything you need to write about VRIKAAN — brand assets, founder bio, fact sheet, and quotable lines. Free to use, attribution appreciated.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:hello@vrikaan.com?subject=Press%20inquiry%20—%20VRIKAAN" style={{
              padding: "12px 24px", borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>📧 Press inquiries</a>
            <a href="#assets" style={{
              padding: "12px 24px", borderRadius: 10,
              background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`,
              color: T.white, fontSize: 14, fontWeight: 600, textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>Download brand assets ↓</a>
          </div>
        </section>

        {/* Fact sheet */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Fact Sheet</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}>
            {FACTS.map((f) => (
              <div key={f.label} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "16px 18px",
              }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginTop: 4 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Boilerplate */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Company Boilerplate</h2>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: 24, position: "relative",
          }}>
            <p style={{ fontSize: 14, color: T.white, lineHeight: 1.8, margin: 0 }}>
              VRIKAAN is an AI-powered cybersecurity platform built for individuals, students, and small teams.
              It bundles enterprise-grade tools — phishing analysis, dark web monitoring, vulnerability scanning,
              breach checks, password vault, identity X-ray, MITRE ATT&CK-mapped SOC dashboard, and live threat
              intelligence — into a single, affordable subscription. Founded in 2024 by Sahil Anil Nikam (CEO) and
              co-founded by Khushi Ishwar Raigade (SOC Analyst &amp; Cybersecurity Researcher), VRIKAAN's mission is to
              put serious cyber defense in reach of anyone, not just Fortune 500 SOCs. Headquartered in India, the
              platform currently serves users globally across web and PWA.
            </p>
            <button
              onClick={() => copy(
                "VRIKAAN is an AI-powered cybersecurity platform built for individuals, students, and small teams. It bundles enterprise-grade tools — phishing analysis, dark web monitoring, vulnerability scanning, breach checks, password vault, identity X-ray, MITRE ATT&CK-mapped SOC dashboard, and live threat intelligence — into a single, affordable subscription. Founded in 2024 by Sahil Anil Nikam (CEO) and co-founded by Khushi Ishwar Raigade (SOC Analyst & Cybersecurity Researcher), VRIKAAN's mission is to put serious cyber defense in reach of anyone, not just Fortune 500 SOCs. Headquartered in India, the platform currently serves users globally across web and PWA.",
                "boilerplate"
              )}
              style={{
                position: "absolute", top: 16, right: 16,
                padding: "6px 12px", borderRadius: 6,
                background: copied === "boilerplate" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.08)",
                border: `1px solid ${T.border}`, cursor: "pointer",
                color: copied === "boilerplate" ? T.green : T.muted,
                fontSize: 11, fontWeight: 600, fontFamily: "inherit",
              }}
            >{copied === "boilerplate" ? "✓ Copied" : "Copy"}</button>
          </div>
        </section>

        {/* Founder quote */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Founder Quote</h2>
          {QUOTES.map((q, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 28,
              borderLeft: `4px solid ${T.cyan}`,
            }}>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: T.white, margin: "0 0 14px", fontStyle: "italic" }}>
                "{q.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 2, background: T.cyan }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{q.role}, VRIKAAN</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Brand assets */}
        <section id="assets" style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>Brand Assets</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20, lineHeight: 1.6 }}>
            Right-click → Save image, or click any tile to download. Maintain ample padding around the wolf mark and avoid recoloring the gradient.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}>
            {ASSETS.map((a) => (
              <a
                key={a.file}
                href={a.file}
                download
                style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: 18, textDecoration: "none",
                  display: "flex", flexDirection: "column", gap: 12,
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  width: "100%", aspectRatio: "16 / 9",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.06))",
                  borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${T.border}`,
                }}>
                  <img src={a.file} alt={a.name} style={{ maxWidth: "60%", maxHeight: "80%", objectFit: "contain" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{a.desc}</div>
                </div>
                <span style={{
                  alignSelf: "flex-start",
                  fontSize: 11, fontWeight: 600, color: T.cyan,
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(20,227,197,0.08)",
                }}>↓ Download</span>
              </a>
            ))}
          </div>
        </section>

        {/* Brand colors */}
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Brand Colors</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}>
            {[
              { name: "Indigo", hex: "#6366F1", desc: "Primary accent" },
              { name: "Cyan", hex: "#14E3C5", desc: "Secondary accent" },
              { name: "Ink", hex: "#030712", desc: "Background" },
              { name: "Slate", hex: "#94A3B8", desc: "Muted text" },
              { name: "Snow", hex: "#F1F5F9", desc: "Body text" },
              { name: "Gold", hex: "#EAB308", desc: "Highlights" },
            ].map((c) => (
              <button
                key={c.hex}
                onClick={() => copy(c.hex, c.hex)}
                style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: 14, textAlign: "left",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <div style={{ width: "100%", height: 56, borderRadius: 8, background: c.hex, marginBottom: 10, border: `1px solid ${T.border}` }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.desc}</div>
                <div style={{ fontSize: 11, color: copied === c.hex ? T.green : T.cyan, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                  {copied === c.hex ? "✓ Copied" : c.hex}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 48px", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.06))",
            border: `1px solid ${T.accent}30`,
            borderRadius: 16, padding: 32,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 8px", fontFamily: "'Space Grotesk', sans-serif" }}>
              Need anything else?
            </h3>
            <p style={{ fontSize: 14, color: T.muted, margin: "0 0 20px" }}>
              Custom screenshots, founder interview, embargoed coverage — happy to help.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:hello@vrikaan.com" style={{
                padding: "10px 20px", borderRadius: 10,
                background: T.cyan, color: "#030712",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>hello@vrikaan.com</a>
              <Link to="/contact" style={{
                padding: "10px 20px", borderRadius: 10,
                background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`,
                color: T.white, fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>General Contact</Link>
            </div>
          </div>
        </section>

        {/* Email routing block */}
        <section style={{ padding: "0 0 80px" }}>
          <EmailRouting highlight="general" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
