import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", purple: "#a78bfa", blue: "#38bdf8", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function Protection() {
  const layers = [
    { icon: "\uD83E\uDD16", title: "AI Threat Engine", desc: "Neural networks trained on 12B+ threat signatures analyze every URL, email, and message in real-time. Detects zero-day threats before they're catalogued.", color: T.cyan, status: "Active" },
    { icon: "\uD83D\uDD25", title: "Firewall Shield", desc: "Intelligent network firewall monitors incoming and outgoing traffic, blocking malicious connections and preventing data exfiltration.", color: T.ember, status: "Active" },
    { icon: "\uD83D\uDCE7", title: "Email Guardian", desc: "Scans every incoming email for phishing links, malicious attachments, and social engineering patterns. Quarantines threats automatically.", color: T.blue, status: "Active" },
    { icon: "\uD83D\uDD76\uFE0F", title: "Dark Web Scanner", desc: "Continuously monitors underground forums, paste sites, and dark web marketplaces for your leaked credentials and personal data.", color: T.red, status: "Active" },
    { icon: "\uD83D\uDCF1", title: "Device Protection", desc: "Endpoint security for all your devices. Detects malware, ransomware, keyloggers, and unauthorized access attempts.", color: T.purple, status: "Active" },
    { icon: "\uD83D\uDD10", title: "Identity Monitor", desc: "Tracks your personal information across data brokers, breach databases, and public records. Alerts you to new exposures.", color: T.gold, status: "Active" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Multi-Layer Protection"
        description="VRIKAAN's six-layer defense system: AI threat engine, firewall, email guardian, dark-web scanner, device protection, identity monitor. How the layers work together."
        path="/protection"
      />
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.cyan}0c`, border: `1px solid ${T.cyan}20`, fontSize: 11, fontWeight: 600, color: T.cyan, marginBottom: 16, letterSpacing: 0.5 }}>Defense System</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Multi-Layer <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Protection</span></h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Six independent security layers working together. If one layer is bypassed, the next catches the threat.</p>
        </div>

        {/* System status */}
        <div style={{ padding: "16px 24px", background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 12, marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>All Protection Layers Active</span>
          </div>
          <span style={{ fontSize: 12, color: T.mutedDark }}>Last scan: Just now</span>
        </div>

        {/* Layers */}
        <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 64 }}>
          {layers.map((l, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px 28px", position: "relative", overflow: "hidden", transition: "all 0.3s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${l.color}40, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{l.icon}</span>
                <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", fontSize: 10, fontWeight: 600, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>{l.status}</span>
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 10px" }}>{l.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{l.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="resp-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 64 }}>
          {[{ val: "99.7%", label: "Detection Rate", color: T.cyan }, { val: "<50ms", label: "Response Time", color: T.accent }, { val: "24/7", label: "Monitoring", color: "#22c55e" }, { val: "12B+", label: "Signatures", color: T.ember }].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "28px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: T.mutedDark, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.03))", border: `1px solid rgba(99,102,241,0.1)`, borderRadius: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Activate Your Shield</h2>
          <p style={{ color: T.muted, fontSize: 15, marginBottom: 24 }}>Start with free protection. Upgrade for full coverage.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link to="/signup" style={{ padding: "14px 36px", background: T.accent, color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Get Protected</Link>
            <Link to="/pricing" style={{ padding: "14px 36px", background: "transparent", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, textDecoration: "none", fontSize: 14 }}>View Plans</Link>
          </div>
        </div>
      </div>
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-2, .resp-grid-4 { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 900px) and (min-width: 769px) {
    .resp-grid-4 { grid-template-columns: 1fr 1fr !important; }
  }
`}</style>
      <Footer />
    </div>
  );
}
