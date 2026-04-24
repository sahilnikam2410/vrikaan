import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function Founder() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Founder" description="Meet Sahil Anil Nikam, founder and CEO of Vrikaan." path="/founder" />
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Founder & CEO</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Sahil Anil Nikam</h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Building the world's most accessible cyber defense platform.</p>
        </div>

        {/* Avatar + Quote */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "clamp(36px, 4vw, 56px)", marginBottom: 48, backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", gap: 36, alignItems: "start" }}>
            <div style={{ width: 100, height: 100, borderRadius: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.06))", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 300, color: T.white, opacity: 0.9 }}>S</span>
            </div>
            <div>
              <blockquote style={{ fontSize: 18, color: T.white, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 20px", opacity: 0.85, borderLeft: `3px solid ${T.accent}`, paddingLeft: 24 }}>
                "The digital world connects billions of people, but it also exposes them to invisible threats. I created Vrikaan because cybersecurity shouldn't be a luxury — it should be a right."
              </blockquote>
            </div>
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
  }
`}</style>
      <Footer />
    </div>
  );
}
