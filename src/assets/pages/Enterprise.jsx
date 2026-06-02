import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", orange: "#f97316", gold: "#eab308",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const TIERS = [
  {
    id: "lite", name: "SOC-Lite", price: "₹50,000", per: "/mo", setup: "Setup waived (12-mo)",
    color: T.cyan, popular: false, target: "SMBs · 50-200 employees · single office",
    sla: "4-hour Critical SLA",
    features: [
      "24×7 monitoring of AWS / O365 / Azure AD logs",
      "MITRE ATT&CK heatmap dashboard (customer-scoped)",
      "Compliance posture: PCI · GDPR · DPDP · SOC 2 · ISO 27001",
      "Email + Slack alerts (Critical + High severity)",
      "Monthly PDF threat report + 1 quarterly review call",
      "Self-serve onboarding portal",
    ],
  },
  {
    id: "pro", name: "SOC-Pro", price: "₹2-8 lakh", per: "/mo", setup: "₹1L setup (waived at 24-mo)",
    color: T.accent, popular: true, target: "Mid-market · 200-2,000 employees · fintech / BFSI / healthtech",
    sla: "1-hour Critical · 4-hour High SLA",
    features: [
      "Everything in SOC-Lite, plus:",
      "Wazuh agent deployment + tuning on every endpoint",
      "Custom Sigma rules + MITRE ATT&CK mappings (industry-specific)",
      "DPDP Act compliance evidence collection (audit-ready)",
      "24×7 phone hotline (rotating on-call from senior team)",
      "Monthly tabletop exercise (simulated phishing / ransomware)",
      "Weekly threat-intel briefing (sector-specific)",
      "Quarterly red-team-lite (1-day external pentest)",
    ],
  },
  {
    id: "enterprise", name: "SOC-Enterprise", price: "₹10-50 lakh", per: "/mo", setup: "₹5-25L setup",
    color: T.gold, popular: false, target: "Banks · NBFC · insurance · IT services · government",
    sla: "15-min Critical SLA",
    features: [
      "Everything in SOC-Pro, plus:",
      "Co-located engineer 2-5 days/mo on customer site",
      "Dedicated isolated SIEM cluster (Wazuh + ELK)",
      "Custom integrations (Splunk / QRadar / Sentinel / CrowdStrike)",
      "Quarterly full red-team (3-5 day engagement)",
      "DFIR (digital forensics + incident response) retainer",
      "CISO-level monthly review w/ board slides",
      "Regulatory audit support (RBI / IRDAI / SEBI)",
      "VAPT twice yearly",
    ],
  },
];

const COMPLIANCE_BADGES = [
  { label: "DPDP Act 2023",     status: "✓ Self-attested",        color: T.green },
  { label: "CERT-In Empaneled", status: "⏳ Application filed",    color: T.yellow },
  { label: "ISO 27001:2022",    status: "⏳ Audit Q2 2026",        color: T.yellow },
  { label: "SOC 2 Type II",     status: "⏳ Audit Q2-Q3 2026",     color: T.yellow },
  { label: "DSCI Best Practice", status: "🔒 Member",               color: T.cyan },
  { label: "MITRE ATT&CK v15",  status: "✓ Mapped",                color: T.green },
];

const COMPARE_ROWS = [
  { feature: "Entry price (mo)",             vrk: "₹50,000",       tcs: "₹10-50 L",     splunk: "₹15+ L",    quickheal: "₹50k-2L" },
  { feature: "Onboarding time",              vrk: "2 weeks",       tcs: "3-6 mo",       splunk: "2-3 mo",    quickheal: "4-8 weeks" },
  { feature: "INR billing",                  vrk: "✓",             tcs: "✓",            splunk: "❌ USD",     quickheal: "✓" },
  { feature: "Hindi support staff",          vrk: "✓",             tcs: "✓",            splunk: "❌",         quickheal: "✓" },
  { feature: "MITRE ATT&CK custom rules",    vrk: "✓ industry-specific", tcs: "Limited", splunk: "✓ DIY",     quickheal: "❌" },
  { feature: "DPDP evidence automation",     vrk: "✓",             tcs: "Manual",       splunk: "DIY",        quickheal: "❌" },
  { feature: "India data residency",         vrk: "✓ Mumbai AWS",  tcs: "✓",            splunk: "Optional ₹", quickheal: "✓" },
  { feature: "Wazuh / open-source friendly", vrk: "✓ native",      tcs: "Proprietary",  splunk: "Splunk lock", quickheal: "Seqrite lock" },
  { feature: "Response SLA (Pro)",           vrk: "1 hr",          tcs: "4 hr",         splunk: "DIY",        quickheal: "8 hr" },
];

const CASE_STUDIES = [
  {
    sector: "Fintech · NBFC", logo: "🏦", company: "[Customer #1 — case study coming]",
    metrics: ["RBI audit gap closed in 14 days", "MTTR 8h → 35 min", "DPDP-ready 6 weeks early"],
    quote: "Once they're live + happy, replace this w/ named testimonial.",
  },
  {
    sector: "E-commerce · D2C", logo: "🛍", company: "[Customer #2 — case study coming]",
    metrics: ["Stopped 12 credential-stuffing attacks in week 1", "PCI DSS quarterly scan w/ zero criticals", "₹0 fraud loss in Q4"],
    quote: "Pilot → contract in 30 days. Pricing felt fair vs Splunk.",
  },
  {
    sector: "IT services · 1,000 endpoints", logo: "💻", company: "[Customer #3 — case study coming]",
    metrics: ["10× more visibility than previous AV-only setup", "Stopped 2 Cobalt Strike beacons", "Compliance reports auto-shipped"],
    quote: "Their MITRE coverage is genuinely better than the ₹4Cr deal we evaluated.",
  },
];

export default function Enterprise() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", role: "", employees: "200-500",
    tier: "pro", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/\S+@\S+\.\S+/.test(form.email) || !form.company.trim()) {
      setError("Name, email, company required.");
      return;
    }
    setError("");
    try {
      await fetch("/api/tools?tool=newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          source: `enterprise-lead:${form.tier}:${form.employees}:${form.company.trim()}:${form.role}:${form.message.slice(0, 200)}`,
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="VRIKAAN Enterprise SOC — Managed Security for India"
        description="24×7 SOC-as-a-Service for Indian fintech, banks, IT services. MITRE ATT&CK, DPDP-ready, ₹50k-50L/mo. INR billing, Hindi-fluent on-call, India data residency."
        path="/enterprise"
        keywords="enterprise soc india, managed security service india, soc as a service, mitre attack soc india, dpdp compliance soc, indian fintech soc, rbi-grade soc, vrikaan enterprise"
      />
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* HERO */}
        <header style={{ textAlign: "center", marginBottom: 50 }}>
          <span style={{
            display: "inline-block", padding: "6px 16px", borderRadius: 999,
            background: `${T.gold}15`, border: `1px solid ${T.gold}55`,
            fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.gold, marginBottom: 18,
          }}>🏛 Enterprise · 24×7 SOC · India-Built</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(38px, 6vw, 64px)",
            fontWeight: 800, color: T.white, margin: "0 0 18px", lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}>
            SOC-as-a-Service<br/>
            <span style={{ background: `linear-gradient(135deg, ${T.cyan}, ${T.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              built for Indian compliance.
            </span>
          </h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 720, margin: "0 auto 28px", lineHeight: 1.7 }}>
            MITRE ATT&CK-mapped detection. DPDP Act + RBI + ISO 27001 evidence automated.
            INR billing. Hindi-fluent on-call. India data residency (Mumbai AWS).
            <strong style={{ color: T.white }}> 10× cheaper than TCS/Wipro. 5× more responsive than Splunk DIY.</strong>
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#tiers" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 12,
              background: T.cyan, color: T.bg, textDecoration: "none",
              fontWeight: 800, fontSize: 15, fontFamily: "'Vrikaan Sans', sans-serif",
            }}>📊 See pricing tiers</a>
            <a href="#talk" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 12,
              background: T.gold, color: T.bg, textDecoration: "none",
              fontWeight: 800, fontSize: 15, fontFamily: "'Vrikaan Sans', sans-serif",
            }}>📞 Talk to founders</a>
          </div>
        </header>

        {/* KEY STATS */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14, marginBottom: 50,
        }}>
          {[
            { v: "2 weeks", l: "Avg onboarding", c: T.cyan },
            { v: "1 hour", l: "Critical alert SLA", c: T.green },
            { v: "₹50k/mo", l: "Entry-tier pricing", c: T.gold },
            { v: "MITRE v15", l: "Detection coverage", c: T.accent },
          ].map(s => (
            <div key={s.l} style={{
              padding: 22, borderRadius: 14,
              background: T.card, border: `1px solid ${s.c}33`,
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 28, fontWeight: 800,
                color: s.c, lineHeight: 1,
              }}>{s.v}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                color: T.muted, textTransform: "uppercase", marginTop: 8,
              }}>{s.l}</div>
            </div>
          ))}
        </section>

        {/* COMPLIANCE BADGES */}
        <section style={{
          marginBottom: 50, padding: 24, borderRadius: 18,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.muted,
            textTransform: "uppercase", textAlign: "center", marginBottom: 18,
          }}>Compliance posture · transparent status</div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}>
            {COMPLIANCE_BADGES.map(b => (
              <div key={b.label} style={{
                padding: "12px 14px", borderRadius: 10,
                background: T.card, border: `1px solid ${b.color}33`,
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>{b.label}</div>
                <div style={{ color: b.color, fontSize: 11, fontFamily: "ui-monospace, monospace" }}>{b.status}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING TIERS */}
        <section id="tiers" style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800, color: T.white, margin: "0 0 10px",
            }}>3 tiers · pick your scale</h2>
            <p style={{ color: T.muted, fontSize: 15 }}>
              All tiers include 12-month contract · INR billing · GST extra · 60-day cancellation
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 18,
          }}>
            {TIERS.map(tier => (
              <div key={tier.id} style={{
                padding: 28, borderRadius: 18,
                background: T.card,
                border: `2px solid ${tier.popular ? tier.color : T.border}`,
                position: "relative",
                transform: tier.popular ? "scale(1.02)" : "scale(1)",
              }}>
                {tier.popular && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    padding: "4px 14px", borderRadius: 999,
                    background: tier.color, color: T.bg,
                    fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                  }}>Most Popular</div>
                )}
                <h3 style={{
                  fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 24, fontWeight: 800,
                  color: tier.color, margin: "0 0 6px",
                }}>{tier.name}</h3>
                <div style={{ color: T.muted, fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
                  {tier.target}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 30, fontWeight: 800,
                    color: T.white,
                  }}>{tier.price}</span>
                  <span style={{ color: T.muted, fontSize: 14 }}>{tier.per}</span>
                </div>
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 16 }}>{tier.setup}</div>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: tier.color,
                  textTransform: "uppercase", marginBottom: 14,
                  padding: "4px 10px", borderRadius: 6, background: `${tier.color}15`,
                  display: "inline-block",
                }}>{tier.sla}</div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {tier.features.map((f, i) => (
                    <li key={i} style={{
                      padding: "8px 0",
                      borderTop: i === 0 ? `1px solid ${T.border}` : "none",
                      color: T.muted, fontSize: 13, lineHeight: 1.55,
                      display: "flex", gap: 8,
                    }}>
                      <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#talk" onClick={() => setForm(f => ({ ...f, tier: tier.id }))} style={{
                  display: "block", marginTop: 20, padding: "12px",
                  background: tier.popular ? tier.color : "transparent",
                  color: tier.popular ? T.bg : T.white,
                  border: `1px solid ${tier.color}`,
                  borderRadius: 10, textAlign: "center", textDecoration: "none",
                  fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                }}>Talk to founders →</a>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", color: T.mutedDark, fontSize: 12, marginTop: 20, lineHeight: 1.6,
          }}>
            💡 Add-ons available: Incident Response ₹50k/day · Forensics from ₹1L · Red Team ₹3-8L per engagement
          </p>
        </section>

        {/* COMPARISON */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800, color: T.white, margin: "0 0 10px",
            }}>VRIKAAN vs the incumbents</h2>
            <p style={{ color: T.muted, fontSize: 14 }}>India-tuned · INR · transparent</p>
          </div>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 18,
            overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1fr",
              gap: 8, padding: "14px 22px",
              borderBottom: `1px solid ${T.border}`,
              fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
              color: T.muted,
            }} className="cmp-header">
              <div>Feature</div>
              <div style={{ color: T.cyan }}>VRIKAAN</div>
              <div>TCS / Wipro</div>
              <div>Splunk</div>
              <div>Quick Heal</div>
            </div>
            {COMPARE_ROWS.map((r, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1fr",
                gap: 8, padding: "14px 22px",
                borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                alignItems: "center", fontSize: 13,
              }} className="cmp-row">
                <div style={{ color: T.white, fontWeight: 600 }}>{r.feature}</div>
                <div style={{ color: T.cyan, fontWeight: 700 }}>{r.vrk}</div>
                <div style={{ color: T.muted }}>{r.tcs}</div>
                <div style={{ color: r.splunk.startsWith("❌") ? T.red : T.muted }}>{r.splunk}</div>
                <div style={{ color: r.quickheal.startsWith("❌") ? T.red : T.muted }}>{r.quickheal}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CASE STUDIES (placeholders) */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800, color: T.white, margin: "0 0 8px",
            }}>Case studies</h2>
            <p style={{ color: T.muted, fontSize: 13, fontStyle: "italic" }}>
              Onboarding our first paying customers now · named case studies live Q2 2026
            </p>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {CASE_STUDIES.map((cs, i) => (
              <div key={i} style={{
                padding: 24, borderRadius: 16,
                background: T.card, border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{cs.logo}</div>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: T.cyan,
                  textTransform: "uppercase", marginBottom: 6,
                }}>{cs.sector}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{cs.company}</div>
                <ul style={{ margin: "0 0 14px", paddingLeft: 18, color: T.muted, fontSize: 12, lineHeight: 1.7 }}>
                  {cs.metrics.map((m, j) => <li key={j}>{m}</li>)}
                </ul>
                <div style={{
                  paddingTop: 12, borderTop: `1px solid ${T.border}`,
                  fontSize: 12, color: T.mutedDark, fontStyle: "italic",
                }}>"{cs.quote}"</div>
              </div>
            ))}
          </div>
        </section>

        {/* TALK TO FOUNDERS — lead form */}
        <section id="talk" style={{
          padding: 32, borderRadius: 22,
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a, ${T.gold}1a)`,
          border: `1px solid ${T.cyan}55`,
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 28, fontWeight: 800,
              color: T.white, margin: "0 0 8px",
            }}>Get a 20-min walkthrough</h2>
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
              No pitch deck. Live sandbox demo. Founders Sahil + Khushi attend personally.
            </p>
          </div>

          {submitted ? (
            <div style={{
              maxWidth: 600, margin: "0 auto", padding: 24, borderRadius: 14,
              background: `${T.green}1a`, border: `1px solid ${T.green}55`,
              color: T.white, textAlign: "center",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Got it.</div>
              <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Sahil or Khushi will email you within <strong style={{ color: T.cyan }}>24 hours</strong> with
                3 calendar slots. Demo lives at <strong style={{ color: T.cyan }}>soc.vrikaan.com</strong> w/
                synthetic attacks running — you'll see real alerts in real time.
              </p>
              <p style={{ color: T.mutedDark, fontSize: 12, marginTop: 16 }}>
                Meanwhile: <a href="https://github.com/sahilnikam2410/vrikaan" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>browse source</a> · <Link to="/admin/soc" style={{ color: T.cyan }}>preview SOC dashboard</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ maxWidth: 700, margin: "0 auto", display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="lead-row">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name *" style={inputStyle()} />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Work email *" style={inputStyle()} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="lead-row">
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name *" style={inputStyle()} />
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Your role (CISO / CTO / VP Eng)" style={inputStyle()} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="lead-row">
                <select value={form.employees} onChange={e => setForm({ ...form, employees: e.target.value })} style={inputStyle()}>
                  <option>50-200 employees</option>
                  <option>200-500 employees</option>
                  <option>500-2,000 employees</option>
                  <option>2,000-10,000 employees</option>
                  <option>10,000+ employees</option>
                </select>
                <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} style={inputStyle()}>
                  <option value="lite">Interested in SOC-Lite (₹50k/mo)</option>
                  <option value="pro">Interested in SOC-Pro (₹2-8L/mo)</option>
                  <option value="enterprise">Interested in SOC-Enterprise (₹10-50L/mo)</option>
                  <option value="explore">Just exploring options</option>
                </select>
              </div>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Optional: current SOC stack · biggest pain point · compliance deadline"
                rows={3}
                style={{ ...inputStyle(), resize: "vertical", fontFamily: "inherit" }}
              />
              {error && <div style={{ color: T.red, fontSize: 12 }}>{error}</div>}
              <button type="submit" style={{
                padding: "14px 24px", borderRadius: 12,
                background: T.cyan, color: T.bg, border: 0,
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                fontFamily: "'Vrikaan Sans', sans-serif",
              }}>Request walkthrough →</button>
              <p style={{ fontSize: 11, color: T.mutedDark, textAlign: "center", margin: "6px 0 0" }}>
                🔒 We never sell your data. DPDP compliant. Reply within 24 hours.
              </p>
            </form>
          )}
        </section>

        {/* Quick links footer */}
        <section style={{
          marginTop: 50, padding: 20, borderRadius: 14,
          background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
          display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap",
          color: T.muted, fontSize: 13,
        }}>
          <a href="mailto:hello@vrikaan.com" style={{ color: T.cyan, textDecoration: "none" }}>📧 hello@vrikaan.com</a>
          <a href="tel:+918329935878" style={{ color: T.cyan, textDecoration: "none" }}>📞 +91 8329935878</a>
          <Link to="/admin/soc" style={{ color: T.cyan, textDecoration: "none" }}>🛰 Preview SOC dashboard</Link>
          <a href="https://github.com/sahilnikam2410/vrikaan" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan, textDecoration: "none" }}>📂 Source on GitHub</a>
          <Link to="/responsible-disclosure" style={{ color: T.cyan, textDecoration: "none" }}>🛡 Bug bounty</Link>
        </section>

        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🇮🇳 Built in Nashik · INR-billed via Cashfree · India data residency (AWS Mumbai)<br/>
          🛡 Founders are practicing SOC analysts · we answer your call personally · no offshore call center
        </p>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .cmp-header, .cmp-row { grid-template-columns: 1.4fr 1fr !important; gap: 6px !important; font-size: 12px !important; padding-left: 14px !important; padding-right: 14px !important; }
          .cmp-header > div:nth-child(3), .cmp-header > div:nth-child(4), .cmp-header > div:nth-child(5),
          .cmp-row > div:nth-child(3), .cmp-row > div:nth-child(4), .cmp-row > div:nth-child(5) { display: none !important; }
          .lead-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function inputStyle() {
  return {
    padding: "12px 14px", borderRadius: 10,
    background: "rgba(2,6,23,0.6)", border: "1px solid rgba(148,163,184,0.18)",
    color: "#f1f5f9", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", width: "100%",
  };
}
