import { useState } from "react";
import ToolShell from "../../components/ToolShell";

const T = { bg: "#060a14", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14b8a6", ember: "#f97316", red: "#ef4444", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const protocols = [
  { code: "ALPHA", title: "Bank Fraud / Unauthorized Transactions", color: T.red, urgency: "CRITICAL", steps: ["Call your bank's 24/7 fraud helpline immediately", "Request a freeze on all accounts and cards", "Document every unauthorized transaction with screenshots", "File a complaint on cybercrime.gov.in (India) or local portal", "File a police report and keep the reference number", "Follow up with bank within 48 hours for reversal", "Enable transaction alerts and set spending limits"] },
  { code: "BRAVO", title: "Account Takeover / Hacked Account", color: T.ember, urgency: "HIGH", steps: ["Attempt password recovery through the official platform", "If recovery fails, use the platform's 'hacked account' support", "Change password immediately to a strong, unique one", "Enable 2FA (use authenticator app, not SMS)", "Revoke access from all unknown devices", "Remove unauthorized connected apps", "Check for email forwarding rules", "Alert contacts — hacker may impersonate you"] },
  { code: "CHARLIE", title: "Phishing / Clicked Suspicious Link", color: T.gold, urgency: "HIGH", steps: ["Do NOT enter any more information on the page", "If you entered credentials: change those passwords NOW", "Run a full antivirus/malware scan", "Clear browser cache, cookies, and saved passwords", "Check affected accounts for unauthorized activity", "Enable 2FA on compromised accounts", "Report the URL to Google Safe Browsing", "Monitor accounts closely for 30 days"] },
  { code: "DELTA", title: "Identity Theft / Data Leaked", color: T.red, urgency: "CRITICAL", steps: ["Freeze credit with all major bureaus", "Change passwords on ALL financial accounts", "Enable fraud alerts on bank and credit cards", "File identity theft report with authorities", "Monitor credit report weekly for 6 months", "Set alerts for new accounts in your name", "Consider identity monitoring service", "Lock biometrics on government portals if applicable"] },
  { code: "ECHO", title: "Ransomware / Device Infected", color: T.ember, urgency: "HIGH", steps: ["Disconnect device from WiFi and all networks", "Do NOT pay the ransom", "Photo any ransom message on screen", "Boot in Safe Mode if possible", "Run offline antivirus scan from USB", "Report to cybercrime authorities", "Restore from clean backup if available", "Change ALL passwords from a clean device"] },
];

export default function EmergencyHelp() {
  const [open, setOpen] = useState(null);
  return (
    <ToolShell
      route="/emergency-help" eyebrow="Emergency Response"
      title="Incident Recovery" titleAccent="Protocols"
      subtitle="Select your situation for immediate, actionable recovery steps."
      width={900}
      seoTitle="Emergency Help — Cyber Incident Recovery"
      seoDesc="Immediate recovery steps for bank fraud, account takeover, phishing, identity theft, and ransomware incidents. Step-by-step protocols to limit damage."
      path="/emergency-help"
      topSlot={
        <div style={{ padding: "16px 24px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 12, marginTop: 100, marginBottom: -64, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, flexShrink: 0 }} />
          <span style={{ color: T.red, fontSize: 13, fontWeight: 600 }}>If in immediate physical danger, call your local emergency number (112) first.</span>
        </div>
      }
      footer
    >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {protocols.map((p, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${open === i ? p.color + "20" : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ padding: "4px 10px", borderRadius: 6, background: `${p.color}0a`, border: `1px solid ${p.color}18`, fontFamily: "'Vrikaan Mono', monospace", fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: 1.5, flexShrink: 0 }}>{p.code}</span>
                <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 17, fontWeight: 600, margin: 0, flex: 1 }}>{p.title}</h3>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: `${p.color}08`, fontSize: 10, fontWeight: 600, color: p.color, fontFamily: "'Vrikaan Mono', monospace", flexShrink: 0 }}>{p.urgency}</span>
                <span style={{ color: T.accent, fontSize: 20, transition: "transform 0.4s", transform: open === i ? "rotate(45deg)" : "none", fontWeight: 300 }}>+</span>
              </div>
              {open === i && (
                <div style={{ padding: "0 28px 28px", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  {p.steps.map((s, j) => (
                    <div key={j} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: j < p.steps.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <span style={{ fontFamily: "'Vrikaan Mono', monospace", color: p.color, fontSize: 13, fontWeight: 700, minWidth: 24 }}>0{j + 1}</span>
                      <span style={{ color: T.white, fontSize: 14, lineHeight: 1.7 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 56, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 36 }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 24px" }}>Emergency Helplines</h3>
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[{ name: "Cyber Crime Helpline (India)", num: "1930", sub: "cybercrime.gov.in" }, { name: "National Emergency", num: "112", sub: "Police, Fire, Ambulance" }, { name: "Women Helpline", num: "181", sub: "For online harassment" }, { name: "Banking Fraud", num: "14440", sub: "RBI fraud reports" }].map((h, i) => (
              <div key={i} style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 24, fontWeight: 700, color: T.cyan }}>{h.num}</div>
                <div style={{ fontSize: 14, color: T.white, fontWeight: 500, marginTop: 4 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: T.mutedDark, marginTop: 2 }}>{h.sub}</div>
              </div>
            ))}
          </div>
        </div>
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-2 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </ToolShell>
  );
}
