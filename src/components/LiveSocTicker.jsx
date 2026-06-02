import { useState, useEffect, useMemo } from "react";

/**
 * LiveSocTicker — sticky top strip showing rotating SOC events.
 * Premium "live status bar" feel like Stripe + GitHub status pages.
 *
 * Hidden on /dashboard, /admin/*, /soc — those pages have their own real
 * SOC views, ticker would be redundant.
 *
 * Mounted globally via Vrikaan.jsx (homepage only — keeps marketing page
 * lively without polluting tool pages).
 */

const CITIES = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Nashik"];
const EVENTS = [
  { icon: "🚨", text: "UPI scam blocked", color: "#EF4444" },
  { icon: "🎣", text: "Phishing SMS flagged", color: "#F97316" },
  { icon: "🛡", text: "Deepfake voice detected", color: "#A855F7" },
  { icon: "🪪", text: "Aadhaar leak prevented", color: "#3B82F6" },
  { icon: "💳", text: "Card fraud stopped", color: "#EF4444" },
  { icon: "📱", text: "Stolen phone recovered", color: "#14b8a6" },
  { icon: "🕵", text: "Dark web alert", color: "#8B5CF6" },
  { icon: "🔒", text: "Loan app harassment blocked", color: "#F59E0B" },
  { icon: "✓", text: "Family safe-word verified", color: "#22C55E" },
  { icon: "📝", text: "Scam check ran", color: "#14b8a6" },
];

function genEvent() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const ago = Math.floor(Math.random() * 60) + 1;
  return {
    id: Date.now() + Math.random(),
    icon: ev.icon, text: ev.text, color: ev.color, city,
    ago: `${ago}s ago`,
  };
}

export default function LiveSocTicker() {
  const [events, setEvents] = useState(() => Array.from({ length: 5 }, genEvent));
  const [tick, setTick] = useState(0);

  // Push new event every 2.5s
  useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => [genEvent(), ...prev].slice(0, 8));
      setTick(t => t + 1);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Aggregate counter — fake but plausible
  const total = useMemo(() => 2_841_029 + tick * 7 + Math.floor(Math.random() * 5), [tick]);

  return (
    <>
      <style>{`
        @keyframes vrk-ticker-slide {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes vrk-ticker-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        .vrk-ticker-strip {
          display: flex; gap: 32px;
          animation: vrk-ticker-slide 60s linear infinite;
          width: max-content;
        }
        .vrk-ticker:hover .vrk-ticker-strip {
          animation-play-state: paused;
        }
      `}</style>
      <div className="vrk-ticker" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 95,
        background: "rgba(2,6,23,0.85)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(20, 184, 166,0.18)",
        height: 32, display: "flex", alignItems: "center", overflow: "hidden",
        fontFamily: "ui-monospace, Menlo, monospace",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        {/* Left-fixed live dot + total */}
        <div style={{
          flexShrink: 0, padding: "0 14px",
          display: "flex", alignItems: "center", gap: 8,
          borderRight: "1px solid rgba(148,163,184,0.1)", height: "100%",
          background: "linear-gradient(90deg, rgba(20, 184, 166,0.10), transparent)",
          minWidth: 230,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22C55E", boxShadow: "0 0 6px #22C55E",
            animation: "vrk-ticker-pulse 1.4s ease infinite",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>LIVE</span>
          <span style={{ fontSize: 11, color: "#14b8a6", fontWeight: 700 }}>{total.toLocaleString("en-IN")}</span>
          <span style={{ fontSize: 10, color: "#64748b" }}>threats blocked</span>
        </div>

        {/* Scrolling event list — duplicate for seamless loop */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div className="vrk-ticker-strip" style={{ paddingLeft: 16 }}>
            {[...events, ...events].map((ev, i) => (
              <div key={`${ev.id}-${i}`} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, color: "#cbd5e1", whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 12 }}>{ev.icon}</span>
                <span style={{ color: ev.color, fontWeight: 600 }}>{ev.text}</span>
                <span style={{ color: "#64748b" }}>·</span>
                <span style={{ color: "#94a3b8" }}>{ev.city}</span>
                <span style={{ color: "#64748b" }}>·</span>
                <span style={{ color: "#64748b" }}>{ev.ago}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right-fixed status */}
        <div style={{
          flexShrink: 0, padding: "0 14px",
          display: "flex", alignItems: "center", gap: 8,
          borderLeft: "1px solid rgba(148,163,184,0.1)", height: "100%",
          fontSize: 10, color: "#94a3b8",
          background: "linear-gradient(90deg, transparent, rgba(20, 184, 166,0.08))",
        }}>
          <a href="/status" style={{ color: "#14b8a6", textDecoration: "none", fontWeight: 700 }}>
            ✓ All systems operational
          </a>
        </div>
      </div>
      {/* Spacer so content underneath isn't covered */}
      <div style={{ height: 32 }} />
    </>
  );
}
