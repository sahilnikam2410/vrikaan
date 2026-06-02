import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const OS_FLOWS = {
  android: {
    label: "Android",
    icon: "🤖",
    color: "#3DDC84",
    findTool: { label: "Find My Device", url: "https://www.google.com/android/find" },
    findInstructions: "Open google.com/android/find on ANY device → sign in with your Google account → see live location, lock screen, erase all data.",
    sim: [
      { network: "Jio", helpline: "1991 or 198 (from Jio number) · 1800-889-9999 (others)", note: "Blocks SIM in 5 min, ports number to new SIM after FIR" },
      { network: "Airtel", helpline: "121 (from Airtel) · 1800-103-4444 (others)", note: "SIM block + port assistance" },
      { network: "Vi (Vodafone Idea)", helpline: "199 (from Vi) · 9820098200 (others)", note: "Block + replacement at any Vi store" },
      { network: "BSNL", helpline: "1503 (free, from BSNL) · 1800-180-1503", note: "Visit Customer Service Centre after blocking" },
    ],
    ceir: "https://www.ceir.gov.in",
    steps: [
      "Use ANOTHER phone/laptop → google.com/android/find → sign in with Google → lock + erase",
      "Call your telecom helpline (left) → block SIM IMMEDIATELY",
      "Open your bank app on ANOTHER device → block UPI + freeze cards (or call bank's 24×7)",
      "File FIR at nearest police station w/ phone bill / box (need IMEI)",
      "After FIR copy → go to ceir.gov.in → register IMEI block (CEIR blacklists the device on ALL Indian networks)",
      "Within 24h: change passwords on Gmail, Outlook, banking, WhatsApp Web, Instagram from another device",
      "If phone had Google Pay / Paytm / PhonePe → contact each via their fraud helpline",
    ],
  },
  ios: {
    label: "iPhone / iOS",
    icon: "📱",
    color: "#A2AAAD",
    findTool: { label: "Find My (iCloud)", url: "https://www.icloud.com/find" },
    findInstructions: "Open icloud.com/find on ANY device → sign in with Apple ID → see live location, Mark As Lost, Erase iPhone. iOS Activation Lock prevents thief from using it.",
    sim: [
      { network: "Jio", helpline: "1991 / 198 / 1800-889-9999", note: "Same as Android — block SIM via telco helpline" },
      { network: "Airtel", helpline: "121 / 1800-103-4444", note: "" },
      { network: "Vi", helpline: "199 / 9820098200", note: "" },
      { network: "BSNL", helpline: "1503 / 1800-180-1503", note: "" },
    ],
    ceir: "https://www.ceir.gov.in",
    steps: [
      "ANOTHER device → icloud.com/find → sign in with Apple ID → 'Mark As Lost' (locks + displays custom message + tracks)",
      "Activation Lock activates — thief CANNOT factory reset without your Apple ID password",
      "Call telco (left) → block SIM",
      "If you used the phone for Apple Pay → call your bank to freeze cards (Apple Pay tokens are device-specific, but be safe)",
      "Open Apple ID page (appleid.apple.com) → change password from another device",
      "File FIR → get copy → register at ceir.gov.in for IMEI block on Indian networks",
      "If phone is found later, you can un-mark it from Find My",
    ],
  },
};

const COMMON = [
  { num: "1930", label: "🚨 National Cyber Crime Helpline", desc: "If financial fraud already happened" },
  { num: "112", label: "📞 Emergency / Police", desc: "Single number for all emergencies" },
  { num: "1800-180-1551", label: "📡 TRAI consumer helpline", desc: "For telecom complaint escalation" },
];

const KEEP_THESE = [
  { item: "Phone box / receipt", why: "Has IMEI — needed for FIR + CEIR block" },
  { item: "Last 6 months of bank statements", why: "Spot fraud transactions immediately" },
  { item: "List of installed apps + bank apps", why: "Know what attacker can access" },
  { item: "Google / Apple ID password", why: "Change everywhere within 24h" },
  { item: "Saved emergency contacts (family)", why: "Brief them about possible impersonation attempts" },
];

export default function StolenPhone() {
  const [os, setOs] = useState("");

  const flow = os ? OS_FLOWS[os] : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Stolen Phone Recovery — India Action Plan"
        description="Phone lost or stolen? 7-step recovery flow for Android + iPhone. SIM block helplines, CEIR IMEI block, FIR steps, bank freeze. Free, India-first."
        path="/stolen-phone"
        keywords="phone stolen india, ceir imei block, sim block jio airtel, lost phone fir, android find my device, iphone icloud find"
      />
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: `${T.red}1a`, border: `1px solid ${T.red}55`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.red, marginBottom: 14,
          }}>🚨 EMERGENCY · Free Action Plan</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Phone lost or stolen?<br/>
            <span style={{ color: T.red }}>First 60 minutes decide everything.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Pick your OS below → get the exact 7-step recovery flow. Includes SIM-block telco numbers,
            CEIR IMEI blacklist, find-my-device link, bank freeze flow, FIR steps.
          </p>
        </header>

        {/* OS picker */}
        {!os ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }} className="os-grid">
            {Object.entries(OS_FLOWS).map(([key, f]) => (
              <button key={key} onClick={() => setOs(key)} style={{
                padding: 28, borderRadius: 18, textAlign: "left",
                background: T.card, border: `2px solid ${T.border}`,
                color: "inherit", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{f.label}</div>
                <div style={{ color: f.color, fontSize: 13 }}>Click to load steps →</div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Mega CTA */}
            <div style={{
              padding: "20px 22px", borderRadius: 16, marginBottom: 18,
              background: `${flow.color}1a`, border: `2px solid ${flow.color}`,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 36 }}>{flow.icon}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: T.white, fontWeight: 800, fontSize: 16 }}>
                  Step 1: open <strong style={{ color: flow.color }}>{flow.findTool.label}</strong> on ANY other device
                </div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{flow.findInstructions}</div>
              </div>
              <a href={flow.findTool.url} target="_blank" rel="noopener noreferrer" style={{
                padding: "13px 22px", borderRadius: 10,
                background: flow.color, color: T.bg, textDecoration: "none",
                fontWeight: 800, fontSize: 14, fontFamily: "'Vrikaan Sans', sans-serif",
              }}>🔓 Open {flow.findTool.label} →</a>
            </div>

            {/* Steps */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: 22, marginBottom: 18,
            }}>
              <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 16px" }}>
                📋 7-step recovery flow ({flow.label})
              </h2>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                {flow.steps.map((s, i) => (
                  <li key={i} style={{
                    display: "flex", gap: 12, padding: "10px 0",
                    borderBottom: i < flow.steps.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: 28, height: 28, borderRadius: 999,
                      background: i === 0 ? T.red : flow.color, color: T.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, fontFamily: "'Vrikaan Sans', sans-serif",
                    }}>{i + 1}</div>
                    <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, flex: 1 }}>{s}</div>
                  </li>
                ))}
              </ol>
            </div>

            {/* SIM block helplines */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: 20, marginBottom: 18,
            }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
                ☎️ SIM block helplines — call BEFORE thief uses your number for OTP
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {flow.sim.map(s => (
                  <div key={s.network} style={{
                    display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 12, alignItems: "center",
                    padding: 12, borderRadius: 10,
                    background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ color: T.cyan, fontWeight: 700, fontSize: 13 }}>{s.network}</div>
                    <div>
                      <div style={{ color: T.white, fontSize: 13, fontFamily: "ui-monospace, monospace" }}>{s.helpline}</div>
                      {s.note && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{s.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CEIR + scam-recovery cross-link */}
            <div style={{
              padding: 20, borderRadius: 14, marginBottom: 18,
              background: `linear-gradient(135deg, ${T.cyan}1a, ${T.accent}1a)`,
              border: `1px solid ${T.cyan}33`,
            }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 8px" }}>
                🔒 Permanent IMEI block — CEIR (Govt of India)
              </h3>
              <p style={{ color: T.muted, fontSize: 13, margin: "0 0 12px", lineHeight: 1.6 }}>
                Central Equipment Identity Register. Once your IMEI is registered as "lost" with FIR proof,
                the phone is blacklisted on ALL Indian networks. Thief can't make calls / use data, even after factory reset.
              </p>
              <a href={flow.ceir} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block",
                padding: "10px 22px", borderRadius: 10,
                background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 13,
                textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
              }}>Open ceir.gov.in →</a>
            </div>

            <button onClick={() => setOs("")} style={{
              marginBottom: 18, padding: "8px 16px", borderRadius: 8,
              background: "transparent", color: T.muted,
              border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>← Switch OS</button>
          </>
        )}

        {/* Common universal helplines (always visible) */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 20, marginBottom: 18,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            ☎️ Universal helplines
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {COMMON.map(h => (
              <a key={h.num} href={`tel:${h.num.replace(/[-\s]/g, "")}`} style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center",
                padding: 12, borderRadius: 10,
                background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                color: "inherit", textDecoration: "none",
              }}>
                <div>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>{h.label}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{h.desc}</div>
                </div>
                <div style={{ color: T.cyan, fontSize: 16, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{h.num}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Prep checklist */}
        <div style={{
          padding: 20, borderRadius: 14, marginBottom: 24,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
            📦 Pre-loss checklist — do this NOW so you're ready
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
            {KEEP_THESE.map(k => (
              <li key={k.item}><strong style={{ color: T.cyan }}>{k.item}</strong> — {k.why}</li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div style={{
          padding: 18, borderRadius: 14, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <div style={{ color: T.white, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            Already lost money from the stolen phone?
          </div>
          <Link to="/scam-recovery" style={{
            display: "inline-block", padding: "10px 22px", borderRadius: 10,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 13,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>📋 Full financial recovery hotline →</Link>
        </div>

        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          📞 Telecom + CEIR procedures verified Mar 2026. Verify current process at telco's official help section.<br/>
          🇮🇳 Built in Nashik · Free forever
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .os-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
