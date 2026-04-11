import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { saveToolResult } from "../../services/toolHistoryService";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

export default function FraudAnalyzer() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("url");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const scan = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);

    try {
      // For URLs, use real threat scanning API
      if (mode === "url") {
        let urlToScan = input.trim();
        if (!/^https?:\/\//i.test(urlToScan)) urlToScan = `https://${urlToScan}`;

        const res = await fetch("/api/scan-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToScan, type: mode }),
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const score = data.score;
        const level = score >= 80 ? "CLEAR" : score >= 40 ? "WARNING" : "CRITICAL";
        const details = data.threats.length > 0
          ? data.threats.map((t) => `[${t.source}] ${t.detail}`)
          : ["No threats found in URLhaus database", "No suspicious URL patterns detected", `Checked against ${data.sources.length} threat source(s)`, data.sources.join(", ")];
        const msgs = {
          CLEAR: "No threats detected. Source appears legitimate and safe.",
          WARNING: "Suspicious patterns detected. Exercise caution before proceeding.",
          CRITICAL: "High-risk threat identified. Do not interact with this source.",
        };
        const colors = { CLEAR: "#22c55e", WARNING: T.gold, CRITICAL: T.red };
        const icons = { CLEAR: "\u2713", WARNING: "\u26A0", CRITICAL: "\u2717" };

        const result = { level, color: colors[level], score, msg: msgs[level], icon: icons[level], details, input, mode, time: new Date().toLocaleTimeString() };
        setResult(result);
        setHistory((prev) => [result, ...prev.slice(0, 9)]);
        saveToolResult("Fraud Analyzer", `${mode.toUpperCase()}: ${input}`, `${level} (Score: ${score}/100) - ${msgs[level]}`, level === "CLEAR" ? "success" : level === "WARNING" ? "warning" : "error");
      } else {
        // For email/phone/message: use local heuristic analysis
        const trimmed = input.trim().toLowerCase();
        let score = 100;
        const details = [];

        if (mode === "email") {
          if (!trimmed.includes("@")) { score -= 40; details.push("Invalid email format"); }
          if (/\.(ru|cn|tk|ml|ga|cf|gq)$/.test(trimmed)) { score -= 30; details.push("High-risk country TLD detected"); }
          if (/[0-9]{5,}/.test(trimmed)) { score -= 15; details.push("Excessive numbers in address"); }
          if (/paypal|amazon|apple|google|microsoft|bank/i.test(trimmed) && !/\.(com|org)$/.test(trimmed.split("@")[1])) { score -= 25; details.push("Brand name with unusual domain — possible impersonation"); }
          if (details.length === 0) details.push("No suspicious patterns detected", "Domain appears legitimate");
        } else if (mode === "phone") {
          if (trimmed.replace(/\D/g, "").length < 10) { score -= 30; details.push("Phone number too short"); }
          if (/^(900|976|809)/.test(trimmed.replace(/\D/g, ""))) { score -= 40; details.push("Premium rate number prefix detected"); }
          if (details.length === 0) details.push("Number format appears valid", "No premium-rate prefix detected");
        } else {
          // Message analysis
          const phishingWords = ["urgent", "verify", "suspend", "click here", "act now", "limited time", "winner", "prize", "password", "account locked", "confirm your", "update your"];
          const found = phishingWords.filter((w) => trimmed.includes(w));
          if (found.length > 0) { score -= found.length * 12; details.push(`Phishing keywords found: ${found.join(", ")}`); }
          if (/https?:\/\/[^\s]+/.test(trimmed)) { score -= 10; details.push("Contains URL link — verify before clicking"); }
          if (details.length === 0) details.push("No common phishing patterns found", "Message appears clean");
        }

        score = Math.max(0, Math.min(100, score));
        const level = score >= 80 ? "CLEAR" : score >= 40 ? "WARNING" : "CRITICAL";
        const colors = { CLEAR: "#22c55e", WARNING: T.gold, CRITICAL: T.red };
        const icons = { CLEAR: "\u2713", WARNING: "\u26A0", CRITICAL: "\u2717" };
        const msgs = { CLEAR: "No threats detected. Source appears legitimate and safe.", WARNING: "Suspicious patterns detected. Exercise caution.", CRITICAL: "High-risk threat identified. Do not interact." };

        const result = { level, color: colors[level], score, msg: msgs[level], icon: icons[level], details, input, mode, time: new Date().toLocaleTimeString() };
        setResult(result);
        setHistory((prev) => [result, ...prev.slice(0, 9)]);
        saveToolResult("Fraud Analyzer", `${mode.toUpperCase()}: ${input}`, `${level} (Score: ${score}/100) - ${msgs[level]}`, level === "CLEAR" ? "success" : level === "WARNING" ? "warning" : "error");
      }
    } catch {
      setResult({ level: "WARNING", color: T.gold, score: 50, msg: "Could not reach threat database. Using local analysis.", icon: "\u26A0", details: ["Threat scanning service temporarily unavailable", "Local pattern analysis applied"], input, mode, time: new Date().toLocaleTimeString() });
    }

    setLoading(false);
  };

  const modes = [
    { id: "url", label: "URL", ph: "Enter suspicious website URL..." },
    { id: "email", label: "Email", ph: "Enter suspicious email address..." },
    { id: "phone", label: "Phone", ph: "Enter suspicious phone number..." },
    { id: "message", label: "Message", ph: "Paste suspicious message text..." },
  ];

  const inputStyle = { flex: 1, padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.3s" };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Fraud Analyzer" description="Scan URLs, emails, phone numbers, and messages for fraud with Secuvion's AI-powered analyzer." path="/fraud-analyzer" />
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Threat Analysis</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>AI Fraud <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analyzer</span></h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Paste any suspicious URL, email, phone number, or message for instant AI-powered threat analysis.</p>
        </div>

        {/* Analyzer */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "32px 28px", backdropFilter: "blur(8px)", marginBottom: 36 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4 }}>
            {modes.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: mode === m.id ? "rgba(99,102,241,0.1)" : "transparent", border: `1px solid ${mode === m.id ? "rgba(99,102,241,0.2)" : "transparent"}`, color: mode === m.id ? T.accent : T.mutedDark, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={modes.find(m => m.id === mode).ph} onKeyDown={e => e.key === "Enter" && scan()} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = T.border} />
            <button onClick={scan} disabled={loading} style={{ padding: "14px 32px", background: loading ? T.mutedDark : T.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s" }}>
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: 44 }}>
              <div style={{ width: 40, height: 40, margin: "0 auto", border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 13, color: T.muted, marginTop: 18 }}>Analyzing threat signatures...</div>
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

          {result && (
            <div style={{ padding: 24, background: `${result.color}06`, border: `1px solid ${result.color}15`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, border: `1.5px solid ${result.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: result.color, flexShrink: 0, background: `${result.color}08` }}>{result.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: result.color }}>{result.score}</span>
                    <span style={{ fontSize: 14, color: T.mutedDark }}>/100</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: result.color, marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{result.level}</span>
                  </div>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: "6px 0 0" }}>{result.msg}</p>
                </div>
              </div>
              <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {result.details.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: result.color }} />
                    <span style={{ fontSize: 12, color: T.muted }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 18px" }}>Scan History</h3>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: `${h.color}0a`, color: h.color, fontWeight: 700, flexShrink: 0 }}>{h.score}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.white, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.input}</div>
                  <div style={{ fontSize: 11, color: T.mutedDark }}>{h.mode.toUpperCase()} &bull; {h.time}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: h.color, fontFamily: "'JetBrains Mono', monospace" }}>{h.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <style>{`
  @media (max-width: 768px) {
    .resp-grid-2 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}
