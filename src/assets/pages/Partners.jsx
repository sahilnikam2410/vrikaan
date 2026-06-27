import { useState } from "react";
import { LuHandshake, LuCheck } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const TRACKS = [
  { icon: "🛡️", t: "MSPs & MSSPs", d: "Resell VRIKAAN's 24×7 SOC and Scam DNA feed to your clients under your service." },
  { icon: "🤝", t: "Resellers & Channel", d: "Earn margin reselling Pro, Family and Enterprise plans across India." },
  { icon: "🏛️", t: "Government & PSU", d: "Co-branded citizen-safety programs — awareness, scam registry, event safety." },
  { icon: "❤️", t: "NGOs & Awareness", d: "Bring regional-language scam education to communities and senior citizens." },
  { icon: "🏦", t: "Banks & Fintech", d: "Embed scam-check APIs and threat intelligence into your apps." },
];

const BENEFITS = [
  "Revenue share + deal registration",
  "Co-marketing & 'Official Safety Partner' badge",
  "API access, sandbox & technical onboarding",
  "Priority support and a named partner contact",
];

export default function Partners() {
  const [f, setF] = useState({ name: "", org: "", email: "", track: "Reseller", message: "" });
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !/.+@.+\..+/.test(f.email)) return;
    try {
      await fetch("/api/tools?tool=enterprise-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(), email: f.email.trim(), company: f.org.trim() || "—",
          role: "Partner inquiry", tier: "partner",
          message: `Partner track: ${f.track}\n${f.message}`,
        }),
      });
    } catch { /* */ }
    setSent(true);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Partner Program — Resell & Co-build with VRIKAAN"
        description="Partner with VRIKAAN: MSPs, resellers, government, NGOs, banks & fintech. Revenue share, co-marketing, API access and an 'Official Safety Partner' badge. Build India's scam defense together."
        path="/partners"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 1000 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}><LuHandshake size={15} /> Partner Program</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,50px)", color: T.text, margin: 0, lineHeight: 1.1 }}>Build India's scam defense together.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>Resell, embed or co-brand VRIKAAN. We bring the technology and 24×7 SOC; you bring the reach.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 40 }}>
          {TRACKS.map((t) => (
            <Card key={t.t} style={{ padding: 22 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{t.t}</div>
              <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{t.d}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, alignItems: "start" }}>
          {/* Benefits */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 14 }}>What partners get</div>
            <div style={{ display: "grid", gap: 12 }}>
              {BENEFITS.map((b) => (
                <div key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: alpha(T.cyan, 0.14), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><LuCheck size={14} color={T.cyan} /></span>
                  <span style={{ color: T.muted, fontSize: 14.5, lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <Card style={{ padding: 26 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🐺</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>Thanks — we'll be in touch</div>
                <p style={{ color: T.muted, fontSize: 14, marginTop: 8 }}>Our team will reach out about the partnership. Usually within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 2 }}>Become a partner</div>
                <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name *" style={inp} />
                <input value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} placeholder="Organisation" style={inp} />
                <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Work email *" style={inp} />
                <select value={f.track} onChange={(e) => setF({ ...f, track: e.target.value })} style={inp}>
                  {["Reseller", "MSP / MSSP", "Government / PSU", "NGO / Awareness", "Bank / Fintech", "Other"].map((o) => <option key={o} style={{ background: "#0b1220" }}>{o}</option>)}
                </select>
                <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Tell us about your reach / clients" rows={3} style={{ ...inp, resize: "vertical" }} />
                <button type="submit" style={{ padding: "13px", borderRadius: 10, background: T.cyan, border: "none", color: "#04110e", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Apply to partner →</button>
              </form>
            )}
          </Card>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
const inp = { padding: "12px 14px", borderRadius: 10, background: alpha("#94a3b8", 0.06), border: `1px solid ${alpha("#94a3b8", 0.2)}`, color: "#f1f5f9", fontSize: 15, outline: "none", fontFamily: "inherit" };
