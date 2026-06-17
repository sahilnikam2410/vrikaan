import { Link } from "react-router-dom";
import { LuCode, LuShieldCheck, LuZap, LuDatabase, LuArrowRight } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const ENDPOINTS = [
  { m: "check", d: "Look up one phone / UPI ID / URL against the network", color: "#14b8a6" },
  { m: "bulk-check", d: "Score up to 50 identifiers in one call", color: "#6366f1" },
  { m: "feed", d: "Trending scams across India, live", color: "#8b5cf6" },
  { m: "report", d: "Contribute confirmed fraud back to the network", color: "#f59e0b" },
];

const CODE = `curl -X POST "https://www.vrikaan.com/api/tools?tool=scam-dna-api" \\
  -H "Authorization: Bearer vrk_********************************" \\
  -H "Content-Type: application/json" \\
  -d '{ "action": "check", "identifier": "refund@okaxis" }'

# → { "result": { "known": true, "riskScore": 88,
#       "category": "upi-fraud", "reports": 6, "lossTotal": 41000 } }`;

export default function Developers() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO title="Scam DNA API — Real-time scam intelligence for fintechs | VRIKAAN" description="Plug VRIKAAN's crowdsourced Scam DNA network into your product. Check any UPI ID, phone or URL for fraud risk in real time. Built for fintechs, banks, wallets & telcos in India." path="/developers" />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120 }}>
        <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 100, border: `1px solid ${alpha(T.accent, 0.35)}`, background: alpha(T.accent, 0.08), color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            <LuCode size={15} /> Scam DNA · B2B API
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px,5vw,60px)", fontWeight: 800, color: T.white, lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.03em" }}>
            Stop fraud <span style={{ color: T.cyan }}>at the transaction.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: T.muted, lineHeight: 1.6 }}>
            Check any UPI ID, phone number or URL against India's largest crowdsourced scam network — in one API call. Built for fintechs, banks, wallets & telcos.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
            <Link to="/contact?intent=enterprise" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, background: T.cyan, color: "#042f2a", fontWeight: 800 }}>Get API access <LuArrowRight size={17} /></Link>
            <Link to="/scam-feed" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, color: T.white, fontWeight: 600 }}>See live feed</Link>
          </div>
        </div>

        {/* value props */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, maxWidth: 1000, margin: "48px auto 0" }}>
          {[[LuZap, "Real-time", "Sub-second lookups at checkout, onboarding or in-app."], [LuDatabase, "Compounding intel", "Every report from millions of users sharpens the data."], [LuShieldCheck, "Built for scale", "Enterprise auth, rate limits, bulk endpoints, 99.9% uptime."]].map(([Ic, h, d], i) => (
            <Card key={i} style={{ padding: 22 }}>
              <Ic size={24} color={T.cyan} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: T.white, margin: "12px 0 6px" }}>{h}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{d}</div>
            </Card>
          ))}
        </div>

        {/* code + endpoints */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20, maxWidth: 1000, margin: "32px auto 0", alignItems: "start" }} className="dev-grid">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} /><span style={{ width: 11, height: 11, borderRadius: "50%", background: "#eab308" }} /><span style={{ width: 11, height: 11, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: T.mutedDark }}>scam-dna-api</span>
            </div>
            <pre style={{ margin: 0, padding: "18px 20px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6, overflow: "auto" }}>{CODE}</pre>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ENDPOINTS.map((e) => (
              <Card key={e.m} style={{ padding: 16, borderLeft: `3px solid ${e.color}` }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: e.color }}>{e.m}</span>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: T.muted, marginTop: 4, lineHeight: 1.45 }}>{e.d}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* integration uses */}
        <div style={{ maxWidth: 1000, margin: "40px auto 0" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: T.white, textAlign: "center", marginBottom: 20 }}>Where partners plug it in</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            {[["Payments", "Warn or step-up when the payee UPI is high-risk."], ["Onboarding / KYC", "Bulk-check a new user's phone + profile links."], ["Support & chat", "Instantly check numbers/links customers report."], ["Telecom", "Flag scam-origin numbers before the call connects."]].map(([h, d]) => (
              <Card key={h} style={{ padding: 18 }}><div style={{ fontWeight: 700, color: T.white, fontFamily: "var(--font-body)", marginBottom: 6 }}>{h}</div><div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>{d}</div></Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48, padding: "40px 24px", borderRadius: 20, background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(99,102,241,0.10))", border: `1px solid ${alpha(T.cyan, 0.3)}`, maxWidth: 1000, margin: "48px auto 0" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: T.white, margin: "0 0 10px" }}>Protect your customers at the source</h2>
          <p style={{ color: T.muted, fontSize: 16, margin: "0 0 22px" }}>Usage-based pricing with volume tiers for banks & telcos. Talk to the founders.</p>
          <Link to="/contact?intent=enterprise" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: T.cyan, color: "#042f2a", fontWeight: 800 }}>Request API access <LuArrowRight size={17} /></Link>
        </div>
      </Section>
      <style>{`@media (max-width: 820px){ .dev-grid{ grid-template-columns: 1fr !important; } }`}</style>
      <Footer />
    </div>
  );
}
