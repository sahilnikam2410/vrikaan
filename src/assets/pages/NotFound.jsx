import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function NotFound() {
  const [glitch, setGlitch] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const g = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 150); }, 3000);
    const s = setInterval(() => setScanLine(p => (p + 1) % 100), 30);
    return () => { clearInterval(g); clearInterval(s); };
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <SEO title="404 — Page Not Found" description="The page you're looking for doesn't exist. Return to VRIKAAN to access our AI-powered cybersecurity tools." noindex />
      <Navbar />

      {/* Animated background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />

      {/* Scan line */}
      <div style={{ position: "absolute", top: `${scanLine}%`, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(20,227,197,0.15), transparent)", pointerEvents: "none", transition: "top 0.03s linear" }} />

      {/* Radial glows */}
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.06), transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "160px 24px 120px", textAlign: "center", position: "relative", zIndex: 2 }}>
        {/* Animated shield */}
        <div style={{ marginBottom: 24, animation: "shield-float 4s ease-in-out infinite" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <defs>
              <linearGradient id="s404g" x1="8" y1="6" x2="64" y2="66">
                <stop stopColor="#6366f1" /><stop offset="1" stopColor="#14e3c5" />
              </linearGradient>
            </defs>
            <path d="M36 6L10 16V36C10 50 21 62 36 66C51 62 62 50 62 36V16L36 6Z" fill="none" stroke="url(#s404g)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.8" />
            <path d="M36 6L10 16V36C10 50 21 62 36 66C51 62 62 50 62 36V16L36 6Z" fill="rgba(99,102,241,0.04)" />
            {/* Crack lines */}
            <path d="M28 22L36 36L32 44L38 56" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M44 20L38 30L42 38" stroke={T.red} strokeWidth="1" strokeLinecap="round" strokeDasharray="3 4" opacity="0.3" />
            {/* Warning icon */}
            <text x="36" y="42" textAnchor="middle" fill={T.red} fontSize="20" fontWeight="700" opacity="0.7">!</text>
          </svg>
        </div>

        {/* Error code */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(100px, 18vw, 180px)",
          fontWeight: 900, lineHeight: 1, marginBottom: 8,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #14e3c5)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          position: "relative",
          filter: glitch ? "hue-rotate(90deg)" : "none",
          transform: glitch ? "translate(2px, -1px)" : "none",
          transition: "filter 0.1s, transform 0.1s",
          textShadow: "none",
        }}>
          404
        </div>

        {/* Terminal error message */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          color: T.red, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)",
          borderRadius: 10, padding: "12px 20px", display: "inline-flex", alignItems: "center", gap: 8,
          marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, animation: "blink-dot 1.5s ease infinite" }} />
          ERROR: ROUTE_NOT_FOUND
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
          Breach in Navigation
        </h1>
        <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
          The page you're looking for has been compromised, moved, or doesn't exist. Our security systems have logged this incident.
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
          <Link to="/" style={{
            padding: "14px 32px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
            color: "#fff", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(99,102,241,0.25)", transition: "all 0.3s",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            &#9889; Return to Base
          </Link>
          <Link to="/contact" style={{
            padding: "14px 32px", background: "transparent", border: `1px solid ${T.border}`,
            color: T.muted, borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 500,
            transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Report Incident
          </Link>
        </div>

        {/* Quick access terminal */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          overflow: "hidden", backdropFilter: "blur(8px)", textAlign: "left",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${T.border}`, background: "rgba(3,7,18,0.6)" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ flex: 1, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mutedDark }}>secuvion-terminal</span>
          </div>
          <div style={{ padding: "20px 20px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            <div style={{ color: T.mutedDark, marginBottom: 8 }}># Quick navigation — choose your destination:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }} className="notfound-grid">
              {[
                { label: "Home", to: "/", icon: "~" },
                { label: "Dashboard", to: "/dashboard", icon: ">" },
                { label: "Pricing", to: "/pricing", icon: "$" },
                { label: "Features", to: "/features", icon: "#" },
                { label: "About", to: "/about", icon: "@" },
                { label: "Sign Up", to: "/signup", icon: "+" },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  padding: "12px 14px", background: "rgba(148,163,184,0.03)",
                  border: `1px solid ${T.border}`, borderRadius: 10,
                  textDecoration: "none", color: T.muted, fontSize: 12,
                  transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.color = T.white; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "rgba(148,163,184,0.03)"; }}
                >
                  <span style={{ color: T.cyan, fontWeight: 700 }}>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shield-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
        @keyframes blink-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 600px) { .notfound-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
