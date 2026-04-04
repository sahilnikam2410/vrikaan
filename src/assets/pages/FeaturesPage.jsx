import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function FeaturesPage() {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    { icon: "\uD83E\uDD16", title: "AI Fraud Detection", desc: "Real-time scanning of URLs, messages, emails, and phone calls using multi-layered neural networks. Our AI analyzes behavioral patterns, domain reputation, and content signatures to detect threats with 99.7% accuracy.", color: T.cyan, stats: "99.7% accuracy" },
    { icon: "\uD83D\uDEE1\uFE0F", title: "Identity Shield", desc: "Continuous monitoring of your personal data across the web, dark web marketplaces, paste sites, and breach databases. Get instant alerts when your credentials, financial info, or personal data appears in a new leak.", color: T.blue, stats: "24/7 monitoring" },
    { icon: "\uD83D\uDCBB", title: "Device Armor", desc: "Intelligent endpoint protection across all your devices — laptops, phones, tablets. Detects zero-day exploits, suspicious processes, and unauthorized access attempts in real-time.", color: T.purple, stats: "5 devices per plan" },
    { icon: "\uD83C\uDFA3", title: "Phishing Radar", desc: "Instantly identify fraudulent websites, emails, and SMS using AI-powered pattern recognition. Our system checks domain age, SSL certificates, content similarity, and known phishing signatures.", color: T.ember, stats: "12B+ signatures" },
    { icon: "\uD83D\uDD76\uFE0F", title: "Dark Web Watch", desc: "Automated scanning of hidden networks, underground forums, and dark web marketplaces for leaked credentials, stolen financial data, and exposed personal information tied to your accounts.", color: T.red, stats: "500K+ sources" },
    { icon: "\uD83D\uDD10", title: "Privacy Guard", desc: "Control your digital footprint. Monitor who has your data, manage exposure levels, and enforce privacy policies. Get recommendations for reducing your online visibility and attack surface.", color: T.gold, stats: "Full control" },
  ];

  const tools = [
    { title: "Threat Analyzer", desc: "Paste any suspicious URL, email, or phone number for instant AI-powered threat analysis.", link: "/fraud-analyzer" },
    { title: "Email Breach Scanner", desc: "Check if your email has been compromised in any known data breach.", link: "/security-score" },
    { title: "Security Score", desc: "Assess your overall cybersecurity posture with our interactive questionnaire.", link: "/security-score" },
    { title: "Scam Database", desc: "Browse and search our community-driven database of known scams and fraud attempts.", link: "/scam-database" },
    { title: "Threat Map", desc: "Live global visualization of cyber attacks detected across 84 countries.", link: "/threat-map" },
    { title: "Emergency Help", desc: "Step-by-step incident response guides for fraud, hacking, and identity theft.", link: "/emergency-help" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Features" description="Explore Secuvion's AI-powered cybersecurity features including fraud detection, threat monitoring, and more." path="/features" />
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Platform</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Six Layers of <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Protection</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 550, margin: "0 auto", lineHeight: 1.8 }}>
            Enterprise-grade cybersecurity made simple. No technical expertise required. Just sign up and let our AI handle the rest.
          </p>
        </div>

        {/* Interactive Feature Showcase */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, marginBottom: 80, alignItems: "start" }} className="feature-showcase">
          {/* Feature selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {features.map((f, i) => (
              <button key={i} onClick={() => setActiveFeature(i)} style={{
                background: activeFeature === i ? `${f.color}0a` : "transparent",
                border: `1px solid ${activeFeature === i ? `${f.color}20` : T.border}`,
                borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                textAlign: "left", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 12,
                borderLeft: activeFeature === i ? `3px solid ${f.color}` : `3px solid transparent`,
              }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: activeFeature === i ? T.white : T.muted }}>{f.title}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: features[i].color, marginTop: 2 }}>{f.stats}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature detail panel */}
          <div key={activeFeature} style={{
            background: T.card, border: `1px solid ${features[activeFeature].color}15`,
            borderRadius: 20, padding: "40px 36px", backdropFilter: "blur(8px)",
            animation: "featureSlide 0.4s ease", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${features[activeFeature].color}, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${features[activeFeature].color}10`, border: `1px solid ${features[activeFeature].color}20`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
              }}>{features[activeFeature].icon}</div>
              <div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, color: T.white }}>{features[activeFeature].title}</h3>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: features[activeFeature].color }}>{features[activeFeature].stats}</span>
              </div>
            </div>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.85, margin: "0 0 28px" }}>{features[activeFeature].desc}</p>

            {/* Mini demo visualization */}
            <div style={{ background: "rgba(3,7,18,0.5)", border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mutedDark, marginBottom: 12 }}>LIVE PREVIEW</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Scanning", "Analyzing", "Protected"].map((step, i) => (
                  <div key={i} style={{
                    flex: 1, minWidth: 100, padding: "14px 12px", borderRadius: 10, textAlign: "center",
                    background: i === 2 ? "rgba(34,197,94,0.06)" : `${features[activeFeature].color}06`,
                    border: `1px solid ${i === 2 ? "rgba(34,197,94,0.12)" : `${features[activeFeature].color}12`}`,
                  }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: i === 2 ? "#22c55e" : features[activeFeature].color }}>{i + 1}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link to={user ? "/fraud-analyzer" : "/signup"} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600,
            }}>
              {user ? "Try This Feature" : "Sign Up to Access"} &rarr;
            </Link>
          </div>
        </div>

        {/* Free Tools */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 16px", letterSpacing: "-0.02em" }}>Free Security Tools</h2>
          <p style={{ textAlign: "center", color: T.muted, fontSize: 15, marginBottom: 48, maxWidth: 450, marginLeft: "auto", marginRight: "auto" }}>{user ? "Access all security tools from your dashboard." : "Sign up free to unlock all security tools."}</p>
          <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {tools.map((t, i) => (
              <Link key={i} to={t.link} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 24px", height: "100%", transition: "all 0.3s ease", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: "0 0 8px", color: T.white }}>{t.title}</h4>
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 14px" }}>{t.desc}</p>
                  <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>Try it &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "56px 32px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.03))", border: `1px solid rgba(99,102,241,0.1)`, borderRadius: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: "0 0 14px" }}>Ready to Get Protected?</h2>
          <p style={{ color: T.muted, fontSize: 16, marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>Start with our free plan. Upgrade anytime for full protection.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link to="/signup" style={{ display: "inline-block", padding: "14px 36px", background: T.accent, color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Start Free</Link>
            <Link to="/pricing" style={{ display: "inline-block", padding: "14px 36px", background: "transparent", color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>View Plans</Link>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
  @keyframes featureSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 768px) {
    .resp-grid-2, .resp-grid-3, .feature-showcase { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}
