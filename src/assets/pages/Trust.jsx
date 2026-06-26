import { Link } from "react-router-dom";
import { LuShieldCheck, LuLock, LuServer, LuFileCheck, LuScale, LuBug, LuClock, LuMapPin, LuArrowRight } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const PILLARS = [
  { icon: LuLock, color: T.cyan, title: "Data Protection", body: "AES-256 encryption at rest, TLS 1.3 in transit. Zero-knowledge vaults where applicable — your master secrets never leave your device." },
  { icon: LuMapPin, color: T.accent, title: "India Data Residency", body: "Primary data stored in India (AWS Mumbai, ap-south-1). Built for DPDP Act 2023 and India-first compliance from day one." },
  { icon: LuScale, color: T.green, title: "DPDP-Ready Privacy", body: "Digital Personal Data Protection Act 2023 aligned. Clear consent, purpose limitation, data-minimization, and user deletion rights." },
  { icon: LuBug, color: T.gold, title: "Responsible Disclosure", body: "Public bug-bounty program with INR payouts + Hall of Fame. 48-hour acknowledgement SLA for reported vulnerabilities." },
];

const COMPLIANCE = [
  { label: "DPDP Act 2023", status: "Aligned", color: T.green },
  { label: "ISO/IEC 27001", status: "In progress", color: T.gold },
  { label: "SOC 2 Type II", status: "Planned", color: T.muted },
  { label: "CERT-In practices", status: "Aligned", color: T.green },
  { label: "GDPR (EU users)", status: "Aligned", color: T.green },
  { label: "PCI scope", status: "Outsourced to Cashfree", color: T.cyan },
];

const SUBPROCESSORS = [
  { name: "Vercel", use: "Web hosting & edge / serverless functions", region: "Global edge" },
  { name: "Google Firebase / Cloud", use: "Auth, database (Firestore), storage", region: "asia-south1" },
  { name: "Google Gemini", use: "AI scam/fraud analysis (stateless)", region: "API" },
  { name: "Cashfree Payments", use: "Payments & billing (PCI-DSS)", region: "India" },
  { name: "Brevo / EmailJS", use: "Transactional & digest email", region: "EU/Global" },
  { name: "Datadog", use: "Monitoring & error tracking (RUM)", region: "US5" },
  { name: "Meta / Twilio", use: "WhatsApp scam-check bot delivery", region: "Global" },
];

const PRACTICES = [
  "Least-privilege access; server-only writes for plans, roles, orders & certificates (client-locked Firestore rules).",
  "Idempotent, server-verified payment grants — no client-trusted plan upgrades.",
  "Secrets stored as encrypted environment variables; never committed to source.",
  "Strict Content-Security-Policy, HSTS preload, COOP/CORP headers on every response.",
  "Crowdsourced threat intel (Scam DNA) stored as anonymized fingerprints — not personal chat logs.",
  "Continuous dependency + build pipeline; regular security review of the changed surface.",
];

const card = { padding: 22 };
const h2 = { fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", color: T.text, margin: "0 0 6px", fontWeight: 700 };
const sub = { color: T.muted, fontSize: 15, margin: "0 0 22px", maxWidth: 720 };

export default function Trust() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Trust & Security Center — VRIKAAN"
        description="How VRIKAAN protects your data: AES-256 encryption, India data residency (AWS Mumbai), DPDP Act 2023 alignment, responsible disclosure, sub-processors and security practices. Built for banks, fintech & enterprises."
        path="/trust"
      />
      <Navbar />
      <Aurora />

      <Section style={{ paddingTop: 120, maxWidth: 1100 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
            <LuShieldCheck size={15} /> Trust & Security Center
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,52px)", color: T.text, margin: 0, lineHeight: 1.1 }}>Security is the product. So is your trust.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>How VRIKAAN protects your data and earns the confidence of families, banks, fintechs and enterprises across India.</p>
        </div>

        {/* Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 56 }}>
          {PILLARS.map((p) => {
            const Ic = p.icon;
            return (
              <Card key={p.title} style={card}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: alpha(p.color, 0.12), border: `1px solid ${alpha(p.color, 0.3)}`, marginBottom: 14 }}>
                  <Ic size={22} color={p.color} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>{p.title}</div>
                <div style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6 }}>{p.body}</div>
              </Card>
            );
          })}
        </div>

        {/* Compliance */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LuFileCheck size={22} color={T.cyan} /><h2 style={h2}>Compliance & certifications</h2>
          </div>
          <p style={sub}>We are transparent about where we are. Certifications in progress are marked honestly — no overclaiming.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {COMPLIANCE.map((c) => (
              <Card key={c.label} style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{c.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: c.color, background: alpha(c.color, 0.12), border: `1px solid ${alpha(c.color, 0.3)}`, padding: "4px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>{c.status}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Practices */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LuServer size={22} color={T.accent} /><h2 style={h2}>Security practices</h2>
          </div>
          <p style={sub}>Engineering controls baked into how we build and run VRIKAAN.</p>
          <Card style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 14 }}>
              {PRACTICES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <LuShieldCheck size={18} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sub-processors */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={h2}>Sub-processors</h2>
          <p style={sub}>Third parties that may process data on our behalf, and what they do. Enterprise customers can request our current list and a Data Processing Agreement.</p>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr style={{ background: alpha("#94a3b8", 0.06) }}>
                    {["Provider", "Purpose", "Region"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((s, i) => (
                    <tr key={s.name} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: "12px 18px", color: T.text, fontWeight: 600, fontSize: 14 }}>{s.name}</td>
                      <td style={{ padding: "12px 18px", color: T.muted, fontSize: 13.5 }}>{s.use}</td>
                      <td style={{ padding: "12px 18px", color: T.muted, fontSize: 13.5, whiteSpace: "nowrap" }}>{s.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick links + uptime */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 56 }}>
          {[
            { icon: LuScale, label: "Privacy Policy", to: "/privacy", note: "DPDP & GDPR aligned" },
            { icon: LuFileCheck, label: "Terms of Service", to: "/terms", note: "Acceptable use" },
            { icon: LuBug, label: "Report a Vulnerability", to: "/responsible-disclosure", note: "Bug bounty · INR payouts" },
            { icon: LuClock, label: "Security Hall of Fame", to: "/security/hall-of-fame", note: "Credited researchers" },
          ].map((l) => {
            const Ic = l.icon;
            return (
              <Link key={l.to} to={l.to} style={{ textDecoration: "none" }}>
                <Card hover style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                  <Ic size={20} color={T.cyan} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontWeight: 600, fontSize: 14.5 }}>{l.label}</div>
                    <div style={{ color: T.dim, fontSize: 12 }}>{l.note}</div>
                  </div>
                  <LuArrowRight size={16} color={T.muted} />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <Card style={{ padding: 30, textAlign: "center", border: `1px solid ${alpha(T.cyan, 0.3)}`, background: `linear-gradient(180deg, ${alpha(T.cyan, 0.05)}, transparent)`, marginBottom: 40 }}>
          <h2 style={{ ...h2, marginBottom: 8 }}>Security questionnaire or DPA?</h2>
          <p style={{ color: T.muted, fontSize: 15, maxWidth: 560, margin: "0 auto 18px" }}>Banks, fintechs and enterprises evaluating VRIKAAN SOC-as-a-Service — request our security pack, sub-processor list, and a Data Processing Agreement.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/enterprise" style={{ padding: "12px 24px", borderRadius: 10, background: T.cyan, color: T.onAccent, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>Enterprise & SOC →</Link>
            <a href="mailto:security@vrikaan.com" style={{ padding: "12px 24px", borderRadius: 10, background: alpha(T.cyan, 0.1), border: `1px solid ${alpha(T.cyan, 0.4)}`, color: T.cyan, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>security@vrikaan.com</a>
          </div>
        </Card>
      </Section>

      <Footer />
    </div>
  );
}
