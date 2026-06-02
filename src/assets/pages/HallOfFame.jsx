import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", gold: "#EAB308",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

// Researchers credited for responsible disclosure.
// To add an entry after paying bounty: append to RESEARCHERS array, ship.
const RESEARCHERS = [
  // Placeholder — first real report will populate this
  // {
  //   name: "Researcher Name",
  //   handle: "@handle",
  //   date: "2026-04-15",
  //   severity: "high",
  //   summary: "Brief description of what they found (no exploit details)",
  //   url: "https://twitter.com/handle",
  // },
];

const SEVERITY_COLOR = { critical: T.red, high: "#F97316", medium: T.yellow, low: T.green };

export default function HallOfFame() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SEO
        title="Security Hall of Fame · VRIKAAN"
        description="Researchers who helped make VRIKAAN safer through responsible disclosure. Thank you for keeping Indian users protected."
        path="/security/hall-of-fame"
        keywords="vrikaan hall of fame, security researchers india, responsible disclosure thanks, bug bounty credits"
      />
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: `${T.gold}1a`, border: `1px solid ${T.gold}55`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.gold, marginBottom: 14,
          }}>🏆 Hall of Fame</span>
          <h1 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Researchers who made<br/>
            <span style={{ color: T.gold }}>VRIKAAN safer.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
            Every entry below = a vulnerability responsibly disclosed and fixed. Indian users are safer because of these people.
          </p>
        </header>

        {RESEARCHERS.length === 0 ? (
          <div style={{
            padding: 36, borderRadius: 18, textAlign: "center",
            background: T.card, border: `1px dashed ${T.border}`,
          }}>
            <div style={{ fontSize: 56, marginBottom: 14, opacity: 0.4 }}>🛡</div>
            <h2 style={{
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 22, color: T.white,
              margin: "0 0 10px",
            }}>Be the first.</h2>
            <p style={{ color: T.muted, fontSize: 14, margin: "0 0 18px", lineHeight: 1.7, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              No researchers credited yet — VRIKAAN's bug-bounty program just opened.
              First valid report gets recognition here + bounty + 1-year Pro plan.
            </p>
            <Link to="/responsible-disclosure" style={{
              display: "inline-block", padding: "12px 26px", borderRadius: 10,
              background: T.gold, color: T.bg, fontWeight: 800, fontSize: 14,
              textDecoration: "none", fontFamily: "'Hanken Grotesk', sans-serif",
            }}>📋 Read disclosure policy →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {RESEARCHERS.map((r, i) => {
              const c = SEVERITY_COLOR[r.severity] || T.muted;
              return (
                <div key={i} style={{
                  padding: 22, borderRadius: 14,
                  background: T.card, border: `1px solid ${c}55`,
                  borderLeft: `4px solid ${c}`,
                  display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center",
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`,
                    color: T.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 800, fontFamily: "'Hanken Grotesk', sans-serif",
                  }}>{r.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{r.name}</div>
                    {r.handle && (
                      <a href={r.url || `https://twitter.com/${r.handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                         style={{ color: T.cyan, fontSize: 12, textDecoration: "none", fontFamily: "ui-monospace, monospace" }}>
                        {r.handle}
                      </a>
                    )}
                    <div style={{ color: T.muted, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{r.summary}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                      padding: "4px 10px", borderRadius: 999,
                      background: `${c}1a`, color: c, border: `1px solid ${c}55`,
                      textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                      display: "inline-block",
                    }}>{r.severity}</span>
                    <div style={{ color: T.mutedDark, fontSize: 11, marginTop: 6 }}>{r.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12, marginTop: 32,
        }}>
          {[
            { v: RESEARCHERS.length, l: "Researchers credited" },
            { v: RESEARCHERS.length === 0 ? "—" : "₹0", l: "Total bounties paid" },
            { v: "48h", l: "Triage SLA" },
            { v: "90d", l: "Coordinated disclosure window" },
          ].map(s => (
            <div key={s.l} style={{
              padding: 16, borderRadius: 12,
              background: T.card, border: `1px solid ${T.border}`,
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800, color: T.cyan,
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>{s.v}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🛡 Want to be added? See <Link to="/responsible-disclosure" style={{ color: T.cyan }}>disclosure policy</Link>.<br/>
          🇮🇳 Built in Nashik · Thanks for keeping VRIKAAN safe
        </p>
      </main>

      <Footer />
    </div>
  );
}
