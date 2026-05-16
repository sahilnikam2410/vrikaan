import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function Founder() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Founders" description="Meet the founders of VRIKAAN — Sahil Anil Nikam (CEO) and Khushi Ishwar Raigade (Co-Founder, SOC Analyst & Cybersecurity Researcher)." path="/founder" />
      <Navbar />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Leadership</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Meet the Founders</h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            Two founders, one mission — building the world's most accessible cyber defense platform.
          </p>
        </div>

        {/* Founders grid */}
        <div className="founders-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 56 }}>

          {/* Sahil */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 36, backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 78, height: 78, borderRadius: 20, background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(20,227,197,0.08))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 300, color: T.white }}>S</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: `${T.accent}15`, color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>FOUNDER &amp; CEO</span>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Sahil Anil Nikam</h2>
                <p style={{ color: T.accent, fontSize: 12, margin: "4px 0 0", letterSpacing: 0.3 }}>SOC Analyst · Cybersecurity Researcher</p>
              </div>
            </div>
            <blockquote style={{ fontSize: 14, color: T.white, lineHeight: 1.75, fontStyle: "italic", margin: "0 0 16px", opacity: 0.85, borderLeft: `3px solid ${T.accent}`, paddingLeft: 18 }}>
              "Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth."
            </blockquote>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.85, margin: 0 }}>
              SOC analyst, cybersecurity researcher, and full-stack developer from Pune. Drives product
              architecture, AI integration, payments and the engineering pipeline behind every VRIKAAN release.
            </p>
          </div>

          {/* Khushi */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 36, backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 78, height: 78, borderRadius: 20, background: "linear-gradient(135deg, rgba(20,227,197,0.18), rgba(99,102,241,0.08))", border: "1px solid rgba(20,227,197,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 300, color: T.white }}>K</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: `${T.cyan}15`, color: T.cyan, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>CO-FOUNDER</span>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Khushi Ishwar Raigade</h2>
                <p style={{ color: T.cyan, fontSize: 12, margin: "4px 0 0", letterSpacing: 0.3 }}>SOC Analyst · Cybersecurity Researcher</p>
              </div>
            </div>
            <blockquote style={{ fontSize: 14, color: T.white, lineHeight: 1.75, fontStyle: "italic", margin: "0 0 16px", opacity: 0.85, borderLeft: `3px solid ${T.cyan}`, paddingLeft: 18 }}>
              "Detection beats reaction. A defender's job is to find the attacker before they find the data."
            </blockquote>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.85, margin: 0 }}>
              SOC analyst and cybersecurity researcher. Leads VRIKAAN's threat-intelligence pipeline,
              MITRE ATT&amp;CK rule engineering, SIEM tuning and incident-response playbooks.
            </p>
          </div>
        </div>

        {/* Story */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 64 }}>
          {[
            { title: "The Problem", text: "Billions of internet users are vulnerable to phishing attacks, online fraud, and identity theft every day. Most cybersecurity companies focus exclusively on protecting large corporations, leaving normal users — students, families, seniors — completely exposed." },
            { title: "The Vision", text: "Vrikaan was created with the vision of protecting everyday people from cybercrime. The goal is to build a global cyber defense platform that makes enterprise-grade security accessible and affordable for everyone, regardless of their technical knowledge." },
            { title: "The Approach", text: "Using AI-powered threat detection trained on billions of signatures, Vrikaan identifies and neutralizes threats in real-time. The platform is designed to be simple — users don't need to understand cybersecurity to be protected by it." },
            { title: "The Impact", text: "Today, Vrikaan protects users across 84 countries with a 99.7% threat detection rate. From students in India to families in Europe to small businesses in the Americas — we're building a defense network that spans the globe." },
          ].map((s, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px 36px" }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 12px", color: T.cyan }}>{s.title}</h3>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* Philosophy */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 32px", letterSpacing: "-0.02em" }}>Core Beliefs</h2>
          <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { val: "Security is a right", sub: "Not a privilege for corporations" },
              { val: "AI for good", sub: "Technology that protects, not exploits" },
              { val: "Simplicity wins", sub: "Complex threats, simple protection" },
            ].map((b, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 20px" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 6 }}>{b.val}</div>
                <div style={{ fontSize: 13, color: T.mutedDark }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.03))", border: `1px solid rgba(99,102,241,0.1)`, borderRadius: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Join the Mission</h2>
          <p style={{ color: T.muted, fontSize: 15, marginBottom: 24 }}>Help us make the internet safer for everyone.</p>
          <Link to="/signup" style={{ display: "inline-block", padding: "14px 36px", background: T.accent, color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Get Started Free</Link>
        </div>
      </div>
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-3 { grid-template-columns: 1fr !important; }
    .founders-grid { grid-template-columns: 1fr !important; }
  }
`}</style>
      <Footer />
    </div>
  );
}
