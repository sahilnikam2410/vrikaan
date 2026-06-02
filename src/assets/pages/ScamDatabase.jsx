import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#060a14", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14b8a6", ember: "#f97316", red: "#ef4444", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const scams = [
  { id: 1, type: "PHISHING", severity: "CRITICAL", title: "Fake Bank OTP Request", desc: "SMS claiming to be from your bank asking to verify OTP or click a link to prevent account suspension. Banks never ask for OTP via SMS links.", reports: 12847, date: "Mar 2026", color: T.red },
  { id: 2, type: "INVESTMENT", severity: "HIGH", title: "Crypto Doubling Scheme", desc: "Groups promising to double your cryptocurrency within 24 hours. Uses fake screenshots and paid testimonials.", reports: 8432, date: "Mar 2026", color: T.ember },
  { id: 3, type: "IMPERSONATION", severity: "CRITICAL", title: "Fake Police Call Scam", desc: "Callers claiming to be police saying your ID is linked to criminal activity. Demand money to 'clear your name'.", reports: 15623, date: "Feb 2026", color: T.red },
  { id: 4, type: "JOB SCAM", severity: "HIGH", title: "Work From Home Data Entry", desc: "Fake job listings requiring upfront 'registration fee' for high-paying work. Legitimate employers never charge candidates.", reports: 6891, date: "Mar 2026", color: T.ember },
  { id: 5, type: "ROMANCE", severity: "MEDIUM", title: "Dating App Investment Lure", desc: "Romance interest on dating apps who steers conversation toward a 'guaranteed' investment opportunity.", reports: 4217, date: "Feb 2026", color: T.gold },
  { id: 6, type: "PHISHING", severity: "CRITICAL", title: "Fake Delivery OTP Scam", desc: "Message claiming a package delivery requires OTP confirmation. Sharing the OTP gives scammers account access.", reports: 19234, date: "Mar 2026", color: T.red },
  { id: 7, type: "TECH SUPPORT", severity: "HIGH", title: "Microsoft Security Alert Pop-up", desc: "Browser pop-up claiming virus detected, with a phone number to call. The 'agent' requests remote access and payment.", reports: 7652, date: "Jan 2026", color: T.ember },
  { id: 8, type: "SHOPPING", severity: "MEDIUM", title: "Fake E-commerce Store", desc: "Professional-looking store offering luxury items at 80-90% discount. Products never arrive. No refund option.", reports: 3891, date: "Mar 2026", color: T.gold },
  { id: 9, type: "PHISHING", severity: "HIGH", title: "KYC Update Email Scam", desc: "Email mimicking your bank requesting immediate KYC update through a link. The fake site captures credentials.", reports: 11205, date: "Feb 2026", color: T.ember },
  { id: 10, type: "LOTTERY", severity: "MEDIUM", title: "WhatsApp Prize Notification", desc: "Message claiming you won a lottery. Requires 'processing fee' to claim. No company runs random lotteries via messaging.", reports: 5432, date: "Jan 2026", color: T.gold },
];

const sevColors = { CRITICAL: T.red, HIGH: T.ember, MEDIUM: T.gold };

export default function ScamDatabase() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const types = ["ALL", "PHISHING", "INVESTMENT", "IMPERSONATION", "JOB SCAM", "ROMANCE", "TECH SUPPORT", "SHOPPING", "LOTTERY"];
  const filtered = scams.filter(s => (filter === "ALL" || s.type === filter) && (s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Scam Database — Active Scam Tracker"
        description="Browse an active database of cyber scams: phishing, investment fraud, impersonation, romance scams, and more. Searchable, regularly updated, reported by users."
        path="/scam-database"
        keywords="scam database, phishing scams, fraud alerts, Indian cyber scams, OTP scam, delivery scam"
      />
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.red}0c`, border: `1px solid ${T.red}20`, fontSize: 11, fontWeight: 600, color: T.red, marginBottom: 16, letterSpacing: 0.5 }}>Community Reports</span>
          <h1 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Scam Database</h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Community-reported scams and fraud attempts. Learn to recognize and avoid them.</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scams..." style={{ width: "100%", padding: "14px 20px", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 12, color: T.white, fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 14, outline: "none", marginBottom: 24 }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = T.border} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 32 }}>
          {types.map(t => (<button key={t} onClick={() => setFilter(t)} style={{ padding: "7px 14px", borderRadius: 8, fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.3s", background: filter === t ? `${T.accent}15` : "rgba(148,163,184,0.04)", border: `1px solid ${filter === t ? T.accent + "30" : T.border}`, color: filter === t ? T.accent : T.mutedDark }}>{t}</button>))}
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          {[{ label: "Total Scams", val: scams.length, color: T.accent }, { label: "Critical", val: scams.filter(s => s.severity === "CRITICAL").length, color: T.red }, { label: "Total Reports", val: scams.reduce((a, s) => a + s.reports, 0).toLocaleString(), color: T.cyan }].map((s, i) => (
            <div key={i} style={{ padding: "12px 20px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 12, color: T.mutedDark }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: `${sevColors[s.severity]}0a`, border: `1px solid ${sevColors[s.severity]}18`, fontSize: 10, fontWeight: 700, color: sevColors[s.severity], fontFamily: "'Vrikaan Mono', monospace", letterSpacing: 0.5 }}>{s.severity}</span>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: `${T.accent}08`, border: `1px solid ${T.accent}12`, fontSize: 10, fontWeight: 600, color: T.accent, fontFamily: "'Vrikaan Mono', monospace" }}>{s.type}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: T.mutedDark }}>{s.date}</span>
              </div>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>{s.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>{s.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.red }} />
                <span style={{ fontSize: 12, color: T.mutedDark }}>{s.reports.toLocaleString()} reports</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 48, color: T.mutedDark }}>No scams found.</div>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
