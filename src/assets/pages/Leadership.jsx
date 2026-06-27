import { Link } from "react-router-dom";
import { LuMapPin, LuServer, LuClock, LuLanguages, LuLinkedin } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const FOUNDERS = [
  {
    name: "Sahil Anil Nikam",
    role: "Founder · SOC Analyst",
    bio: "Cybersecurity researcher and SOC analyst building India-first scam defense. Started VRIKAAN after watching families lose savings to UPI fraud and deepfake-voice calls that existing tools ignored.",
    linkedin: "https://www.linkedin.com/company/vrikaan-ai-cybersecurity",
    initials: "SN",
  },
  {
    name: "Khushi Ishwar Raigade",
    role: "Co-founder · Cybersecurity Researcher",
    bio: "Cybersecurity researcher focused on threat intelligence and user safety. Drives VRIKAAN's Scam DNA network and India-language awareness so protection reaches every household.",
    linkedin: "https://www.linkedin.com/company/vrikaan-ai-cybersecurity",
    initials: "KR",
  },
];

const PRESENCE = [
  { icon: LuMapPin, label: "Headquarters", value: "Nashik & Pune, Maharashtra, India" },
  { icon: LuServer, label: "Data & SOC", value: "AWS Mumbai (ap-south-1) · India data residency" },
  { icon: LuClock, label: "Coverage", value: "24×7 SOC monitoring · Hindi-fluent on-call" },
  { icon: LuLanguages, label: "Languages", value: "English + हिन्दी, मराठी, தமிழ், తెలుగు, বাংলা" },
];

const VALUES = [
  { t: "Accessible by default", d: "Enterprise-grade security for families and students, not just Fortune 500s." },
  { t: "India-first", d: "Built for UPI, 1930, DPDP and the way scams actually work here." },
  { t: "Honest about data", d: "We store scam fingerprints, not your private life. Transparency over surveillance." },
];

export default function Leadership() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Leadership & Company — VRIKAAN"
        description="Meet the founders behind VRIKAAN — India's AI-powered cyber-defense platform. SOC analysts and cybersecurity researchers based in Maharashtra, with 24×7 SOC on AWS Mumbai and India data residency."
        path="/leadership"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 1000 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>Leadership & Company</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,50px)", color: T.text, margin: 0, lineHeight: 1.1 }}>Built by SOC analysts. For everyone.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>A small India-first team on a large mission: make enterprise-grade cyber-defense accessible to every family, student and business.</p>
        </div>

        {/* Founders */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18, marginBottom: 48 }}>
          {FOUNDERS.map((f) => (
            <Card key={f.name} style={{ padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{f.initials}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: T.cyan, fontWeight: 600 }}>{f.role}</div>
                </div>
              </div>
              <p style={{ color: T.muted, fontSize: 14.5, lineHeight: 1.65, margin: "0 0 14px" }}>{f.bio}</p>
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.muted, fontSize: 13, textDecoration: "none", fontWeight: 600 }}><LuLinkedin size={15} /> LinkedIn</a>
            </Card>
          ))}
        </div>

        {/* Where we operate (India presence + SOC) */}
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 14 }}>Where we operate</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginBottom: 48 }}>
          {PRESENCE.map((p) => {
            const Ic = p.icon;
            return (
              <Card key={p.label} style={{ padding: 20 }}>
                <Ic size={20} color={T.cyan} />
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.mutedDark, margin: "10px 0 4px" }}>{p.label}</div>
                <div style={{ color: T.text, fontSize: 14.5, fontWeight: 500, lineHeight: 1.5 }}>{p.value}</div>
              </Card>
            );
          })}
        </div>

        {/* Values */}
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 14 }}>What we stand for</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 44 }}>
          {VALUES.map((v) => (
            <Card key={v.t} style={{ padding: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{v.t}</div>
              <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{v.d}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", paddingBottom: 20 }}>
          <Link to="/careers" style={{ padding: "12px 24px", borderRadius: 10, background: T.cyan, color: "#04110e", fontWeight: 800, textDecoration: "none", fontSize: 14 }}>We're hiring →</Link>
          <Link to="/founder" style={{ padding: "12px 24px", borderRadius: 10, background: alpha(T.cyan, 0.1), border: `1px solid ${alpha(T.cyan, 0.4)}`, color: T.cyan, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Founder's note</Link>
          <Link to="/press" style={{ padding: "12px 24px", borderRadius: 10, background: alpha("#94a3b8", 0.08), border: `1px solid ${T.border}`, color: T.muted, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Press kit</Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
