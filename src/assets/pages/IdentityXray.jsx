import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { exportReport } from "../../utils/exportPDF";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8", cyan: "#14e3c5", red: "#ef4444", orange: "#f97316", green: "#22c55e", yellow: "#eab308", purple: "#a78bfa", blue: "#38bdf8", pink: "#ec4899", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const RISK_COLORS = { low: T.green, moderate: T.yellow, high: T.orange, critical: T.red, safe: T.green };
const RISK_LABELS = { low: "Low Risk", moderate: "Moderate Risk", high: "High Risk", critical: "Critical Risk", safe: "Safe" };
const PRIORITY_COLORS = { critical: T.red, high: T.orange, medium: T.yellow, low: T.green };
const ATTACK_ICONS = {
  search: "🔍", key: "🔑", unlock: "🔓", alert: "🚨", mail: "📧", phishing: "🎣", identity: "👤",
};
const GRADE_COLORS = { A: T.green, B: T.cyan, C: T.yellow, D: T.orange, F: T.red };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg) => ({ padding: "14px 32px", background: bg, border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans'", transition: "all 0.3s", letterSpacing: 0.3 }),
  input: { width: "100%", padding: "16px 20px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
  exportBtn: { padding: "8px 16px", background: "rgba(99,102,241,0.15)", border: `1px solid rgba(99,102,241,0.3)`, borderRadius: 8, color: T.accentSoft, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
};

// Animated ring score component
function RiskRing({ score, size = 180, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score <= 25 ? T.green : score <= 50 ? T.yellow : score <= 75 ? T.orange : T.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)" }} />
    </svg>
  );
}

// Scanning animation stages
const SCAN_STAGES = [
  { label: "Checking breach databases...", pct: 15 },
  { label: "Analyzing email domain security...", pct: 35 },
  { label: "Scanning paste sites & dark web...", pct: 55 },
  { label: "Mapping attack vectors...", pct: 75 },
  { label: "Calculating risk score...", pct: 90 },
  { label: "Generating report...", pct: 100 },
];

export default function IdentityXray() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  const handleScan = async () => {
    if (!email || !email.includes("@")) { setError("Enter a valid email address"); return; }
    setError("");
    setReport(null);
    setLoading(true);
    setScanStage(0);

    // Animate stages while API loads
    const stageInterval = setInterval(() => {
      setScanStage((p) => (p < SCAN_STAGES.length - 1 ? p + 1 : p));
    }, 800);

    try {
      const res = await fetch("/api/identity-xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      clearInterval(stageInterval);
      setScanStage(SCAN_STAGES.length - 1);
      await new Promise((r) => setTimeout(r, 500));
      setReport(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (e) {
      clearInterval(stageInterval);
      setError(e.message || "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    exportReport({
      title: "Digital Identity X-Ray Report",
      subtitle: `Email: ${report.email}`,
      sections: [
        { heading: "Risk Summary", items: [
          { label: "Risk Score", value: `${report.riskScore}/100`, color: RISK_COLORS[report.riskLevel] },
          { label: "Risk Level", value: RISK_LABELS[report.riskLevel], color: RISK_COLORS[report.riskLevel] },
          { label: "Breaches Found", value: String(report.breaches.count), color: report.breaches.found ? T.red : T.green },
          { label: "Domain Security", value: `${report.domainSecurity.grade} (${report.domainSecurity.score}/100)`, color: GRADE_COLORS[report.domainSecurity.grade] },
        ]},
        { heading: "Breach Details", items: report.breaches.list.slice(0, 10).map((b) => ({
          label: `${b.name} (${b.date || "Unknown date"})`, value: `${b.records?.toLocaleString() || "?"} records — ${b.dataTypes.join(", ") || "Unknown data"}`,
        }))},
        { heading: "Domain Security", items: [
          { label: "SPF Record", value: report.domainSecurity.spf ? "Present" : "Missing", color: report.domainSecurity.spf ? T.green : T.red },
          { label: "DMARC Record", value: report.domainSecurity.dmarc ? "Present" : "Missing", color: report.domainSecurity.dmarc ? T.green : T.red },
          { label: "MX Records", value: report.domainSecurity.mx.length > 0 ? `${report.domainSecurity.mx.length} found` : "None", color: report.domainSecurity.mx.length > 0 ? T.green : T.red },
        ]},
        { heading: "Hacker Attack Path", items: report.attackPath.map((s) => ({
          label: `Step ${s.step}: ${s.title}`, value: s.desc, color: RISK_COLORS[s.risk],
        }))},
        { heading: "Action Plan", items: report.actionPlan.map((a) => ({
          label: `[${a.priority.toUpperCase()}] ${a.title}`, value: a.desc,
        }))},
      ],
    });
  };

  const handleShare = () => {
    const text = `🛡️ My Digital Identity Risk Score: ${report.riskScore}/100 (${RISK_LABELS[report.riskLevel]})\n\nCheck yours free at vrikaan.com/identity-xray\n\n#CyberSecurity #DigitalSafety #VRIKAAN`;
    if (navigator.share) {
      navigator.share({ title: "My Digital Identity X-Ray", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard! Share it anywhere.");
    }
  };

  const wrap = { maxWidth: 900, margin: "0 auto", padding: "0 24px" };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Digital Identity X-Ray" description="One-click complete digital identity security audit. Check breaches, domain security, attack paths, and get a personalized security action plan." path="/identity-xray" />
      <Navbar />
      <style>{`
        @keyframes xray-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 0 20px rgba(99,102,241,0); } }
        @keyframes xray-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes xray-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes xray-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes xray-count { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ── Hero Section ── */}
      <div style={{ padding: "140px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={wrap}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan, animation: "xray-glow 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.cyan, letterSpacing: 0.5 }}>FREE SECURITY AUDIT</span>
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px", fontFamily: "'Space Grotesk', sans-serif" }}>
            Digital Identity{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>X-Ray</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: T.muted, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
            One email. 30 seconds. Complete digital identity security audit.<br />
            See what hackers see — before they do.
          </p>

          {/* Input */}
          <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.5 }}>📧</span>
              <input
                type="email" placeholder="Enter your email address" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleScan()}
                style={{ ...sty.input, paddingLeft: 44 }}
              />
            </div>
            <button onClick={handleScan} disabled={loading}
              style={{ ...sty.btn("linear-gradient(135deg, #6366f1, #8b5cf6)"), opacity: loading ? 0.7 : 1, animation: !loading ? "xray-pulse 2s infinite" : "none" }}>
              {loading ? "Scanning..." : "🔬 Scan Now"}
            </button>
          </div>
          {error && <p style={{ color: T.red, fontSize: 13, marginTop: 12 }}>{error}</p>}

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
            {["🔒 256-bit Encrypted", "🛡️ No Data Stored", "⚡ Real-time Analysis", "📊 10M+ Scans"].map((t) => (
              <span key={t} style={{ fontSize: 12, color: T.mutedDark, fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scanning Animation ── */}
      {loading && (
        <div style={{ ...wrap, paddingBottom: 40 }}>
          <div style={{ ...sty.card, position: "relative", overflow: "hidden" }}>
            {/* Scan line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, animation: "xray-scan 2s linear infinite" }} />
            </div>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.cyan, marginBottom: 16 }}>
                {SCAN_STAGES[scanStage]?.label}
              </p>
              <div style={{ width: "100%", height: 6, background: "rgba(148,163,184,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`,
                  width: `${SCAN_STAGES[scanStage]?.pct || 0}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: T.mutedDark }}>Scanning...</span>
                <span style={{ fontSize: 11, color: T.mutedDark }}>{SCAN_STAGES[scanStage]?.pct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {report && (
        <div ref={resultsRef} style={{ ...wrap, paddingBottom: 80 }}>

          {/* Risk Score Hero */}
          <div style={{ ...sty.card, textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden", animation: "xray-fadeUp 0.6s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${RISK_COLORS[report.riskLevel]}, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap", padding: "16px 0" }}>
              <div style={{ position: "relative" }}>
                <RiskRing score={report.riskScore} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg)", textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: RISK_COLORS[report.riskLevel], fontFamily: "'Space Grotesk'", animation: "xray-count 0.8s ease" }}>
                    {report.riskScore}
                  </div>
                  <div style={{ fontSize: 12, color: T.mutedDark, fontWeight: 600 }}>/ 100</div>
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Space Grotesk'" }}>
                  <span style={{ color: RISK_COLORS[report.riskLevel] }}>{RISK_LABELS[report.riskLevel]}</span>
                </h2>
                <p style={{ color: T.muted, fontSize: 14, margin: "0 0 16px" }}>{report.email}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={handleExport} style={sty.exportBtn}>📄 Export PDF</button>
                  <button onClick={handleShare} style={{ ...sty.exportBtn, background: "rgba(20,227,197,0.12)", borderColor: "rgba(20,227,197,0.3)", color: T.cyan }}>📤 Share Score</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Breaches", value: report.breaches.count, color: report.breaches.found ? T.red : T.green, sub: report.breaches.found ? "Exposed" : "Clean" },
              { label: "Domain Security", value: report.domainSecurity.grade, color: GRADE_COLORS[report.domainSecurity.grade], sub: `${report.domainSecurity.score}/100` },
              { label: "Attack Vectors", value: report.attackPath.length, color: T.orange, sub: "Identified" },
              { label: "Actions Needed", value: report.actionPlan.length, color: T.accent, sub: "Recommended" },
            ].map((s, i) => (
              <div key={i} style={{ ...sty.card, textAlign: "center", animation: `xray-fadeUp ${0.4 + i * 0.1}s ease` }}>
                <div style={{ fontSize: 11, color: T.mutedDark, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk'" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Breach Details ── */}
          <div style={{ ...sty.card, marginBottom: 24, animation: "xray-fadeUp 0.6s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🔓</span> Breach Exposure
              <span style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${RISK_COLORS[report.breaches.riskLevel]}18`, color: RISK_COLORS[report.breaches.riskLevel] }}>
                {report.breaches.riskLevel.toUpperCase()}
              </span>
            </h3>
            {report.breaches.count === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: T.green }}>
                <span style={{ fontSize: 40 }}>✅</span>
                <p style={{ marginTop: 8, fontWeight: 600 }}>No breaches found for this email</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {report.breaches.list.slice(0, 8).map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(15,23,42,0.4)", borderRadius: 10, border: `1px solid ${T.border}`, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
                      <span style={{ fontSize: 12, color: T.mutedDark, marginLeft: 8 }}>{b.date || "Unknown date"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {b.dataTypes.slice(0, 4).map((t, j) => (
                        <span key={j} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${T.red}15`, color: T.red }}>{t}</span>
                      ))}
                      {b.records > 0 && (
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${T.mutedDark}20`, color: T.mutedDark }}>{Number(b.records).toLocaleString()} records</span>
                      )}
                    </div>
                  </div>
                ))}
                {report.breaches.count > 8 && (
                  <p style={{ textAlign: "center", fontSize: 12, color: T.mutedDark }}>+ {report.breaches.count - 8} more breaches found</p>
                )}
              </div>
            )}
          </div>

          {/* ── Domain Security ── */}
          <div style={{ ...sty.card, marginBottom: 24, animation: "xray-fadeUp 0.7s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🌐</span> Email Domain Security
              <span style={{ marginLeft: "auto", fontSize: 28, fontWeight: 800, color: GRADE_COLORS[report.domainSecurity.grade], fontFamily: "'Space Grotesk'" }}>
                {report.domainSecurity.grade}
              </span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { label: "SPF Record", ok: report.domainSecurity.spf, desc: "Prevents email spoofing" },
                { label: "DMARC Record", ok: report.domainSecurity.dmarc, desc: "Email authentication policy" },
                { label: "MX Records", ok: report.domainSecurity.mx.length > 0, desc: `${report.domainSecurity.mx.length} mail server(s) found` },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 18px", background: "rgba(15,23,42,0.4)", borderRadius: 10, border: `1px solid ${item.ok ? T.green : T.red}20`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.ok ? T.green : T.red}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {item.ok ? "✅" : "❌"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: T.mutedDark }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Hacker Attack Path ── */}
          <div style={{ ...sty.card, marginBottom: 24, animation: "xray-fadeUp 0.8s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>⚔️</span> Hacker Attack Path
            </h3>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${T.accent}, ${T.red}, transparent)` }} />

              {report.attackPath.map((step, i) => (
                <div key={i} style={{ position: "relative", marginBottom: i < report.attackPath.length - 1 ? 20 : 0, animation: `xray-fadeUp ${0.5 + i * 0.15}s ease` }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -25, top: 4, width: 24, height: 24, borderRadius: "50%", background: `${RISK_COLORS[step.risk]}20`, border: `2px solid ${RISK_COLORS[step.risk]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                    {ATTACK_ICONS[step.icon] || step.step}
                  </div>
                  <div style={{ padding: "14px 18px", background: "rgba(15,23,42,0.4)", borderRadius: 10, border: `1px solid ${RISK_COLORS[step.risk]}15`, marginLeft: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Step {step.step}: {step.title}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${RISK_COLORS[step.risk]}18`, color: RISK_COLORS[step.risk], textTransform: "uppercase" }}>{step.risk}</span>
                    </div>
                    <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action Plan ── */}
          <div style={{ ...sty.card, marginBottom: 24, animation: "xray-fadeUp 0.9s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🛡️</span> Your Action Plan
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {report.actionPlan.map((action, i) => (
                <div key={i} style={{ padding: "16px 18px", background: "rgba(15,23,42,0.4)", borderRadius: 10, border: `1px solid ${PRIORITY_COLORS[action.priority]}15`, display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PRIORITY_COLORS[action.priority]}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: PRIORITY_COLORS[action.priority], flexShrink: 0, fontFamily: "'Space Grotesk'" }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{action.title}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${PRIORITY_COLORS[action.priority]}18`, color: PRIORITY_COLORS[action.priority], textTransform: "uppercase" }}>{action.priority}</span>
                    </div>
                    <p style={{ fontSize: 12, color: T.muted, margin: "0 0 8px", lineHeight: 1.5 }}>{action.desc}</p>
                    {action.tool && (
                      <Link to={action.tool} style={{ fontSize: 12, fontWeight: 600, color: T.cyan, textDecoration: "none" }}>
                        Open Tool →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Share CTA ── */}
          <div style={{ ...sty.card, textAlign: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,227,197,0.05))", border: `1px solid ${T.accent}20`, animation: "xray-fadeUp 1s ease" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Share Your Score</h3>
            <p style={{ color: T.muted, fontSize: 14, margin: "0 0 20px" }}>Challenge your friends to check their digital identity</p>
            <button onClick={handleShare} style={{ ...sty.btn("linear-gradient(135deg, #6366f1, #14e3c5)"), fontSize: 14 }}>
              📤 Share My Score ({report.riskScore}/100)
            </button>
          </div>
        </div>
      )}

      {/* ── How It Works (when no results) ── */}
      {!report && !loading && (
        <div style={{ ...wrap, paddingBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, textAlign: "center", marginBottom: 40, fontFamily: "'Space Grotesk'" }}>
            What We <span style={{ color: T.cyan }}>Scan</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {[
              { icon: "🔓", title: "Breach Databases", desc: "Checks your email against billions of leaked records from known data breaches worldwide" },
              { icon: "🌐", title: "Domain Security", desc: "Analyzes your email provider's SPF, DMARC, and MX records for spoofing protection" },
              { icon: "🕵️", title: "Dark Web Exposure", desc: "Scans paste sites and underground forums for your exposed credentials" },
              { icon: "⚔️", title: "Attack Path Mapping", desc: "Maps exactly how a hacker would target you step-by-step using found data" },
              { icon: "📊", title: "Risk Scoring", desc: "Calculates your overall digital risk score based on all discovered vulnerabilities" },
              { icon: "🛡️", title: "Action Plan", desc: "Generates a personalized security improvement plan with direct links to tools" },
            ].map((item, i) => (
              <div key={i} style={{ ...sty.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${T.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div style={{ ...sty.card, marginTop: 32, display: "flex", alignItems: "center", gap: 14, background: "rgba(20,227,197,0.04)", border: `1px solid ${T.cyan}15` }}>
            <span style={{ fontSize: 28 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Your Privacy is Protected</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>We never store your email or scan results. All checks are performed in real-time using encrypted connections. No account required.</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
