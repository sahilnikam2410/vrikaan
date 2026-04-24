import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { saveToolResult } from "../../services/toolHistoryService";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const questions = [
  { id: "pw", q: "Do you use unique passwords for every account?", w: 15 },
  { id: "mfa", q: "Is two-factor authentication enabled on important accounts?", w: 15 },
  { id: "upd", q: "Are your devices and apps updated regularly?", w: 12 },
  { id: "phish", q: "Can you identify phishing emails and messages?", w: 10 },
  { id: "wifi", q: "Do you avoid using public WiFi for sensitive activities?", w: 8 },
  { id: "backup", q: "Do you regularly back up important data?", w: 10 },
  { id: "antivirus", q: "Do you use antivirus or endpoint protection?", w: 10 },
  { id: "social", q: "Are your social media profiles set to private?", w: 8 },
  { id: "email", q: "Do you use different emails for financial and social accounts?", w: 7 },
  { id: "monitor", q: "Do you monitor your accounts for unusual activity?", w: 5 },
];

export default function SecurityScore() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const calcScore = () => {
    let t = 0;
    questions.forEach(q => { if (answers[q.id]) t += q.w; });
    setScore(t);
    const label = t >= 75 ? "Excellent" : t >= 50 ? "Moderate" : "At Risk";
    saveToolResult(
      "Security Score",
      `${Object.values(answers).filter(Boolean).length}/${questions.length} yes answers`,
      `Score: ${t}/100 (${label})`,
      t >= 75 ? "success" : t >= 50 ? "warning" : "error"
    );
  };
  const scoreColor = score === null ? T.cyan : score >= 75 ? "#22c55e" : score >= 50 ? T.gold : T.red;
  const scoreLabel = score >= 75 ? "Excellent" : score >= 50 ? "Moderate" : "At Risk";
  const answered = Object.keys(answers).length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Security Score" description="Assess your cybersecurity posture with Vrikaan's free security score assessment." path="/security-score" />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.cyan}0c`, border: `1px solid ${T.cyan}20`, fontSize: 11, fontWeight: 600, color: T.cyan, marginBottom: 16, letterSpacing: 0.5 }}>Assessment</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Cyber Safety Score</h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>Answer 10 questions to assess your cybersecurity posture. Takes under 2 minutes.</p>
        </div>

        {score === null ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "36px 32px", backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
              <span style={{ fontSize: 14, color: T.muted }}>Progress: {answered}/{questions.length}</span>
              <span style={{ fontSize: 14, color: answered === questions.length ? "#22c55e" : T.mutedDark }}>{answered === questions.length ? "Ready to calculate!" : `${questions.length - answered} remaining`}</span>
            </div>
            <div style={{ height: 4, background: "rgba(148,163,184,0.08)", borderRadius: 4, marginBottom: 32 }}>
              <div style={{ height: "100%", width: `${(answered / questions.length) * 100}%`, background: T.accent, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
            {questions.map((q, i) => (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: i < questions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.mutedDark, minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: T.white, fontSize: 14, fontWeight: 500 }}>{q.q}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setAnswers({ ...answers, [q.id]: v })}
                      style={{ padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", transition: "all 0.25s", background: answers[q.id] === v ? (v ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "transparent", border: `1px solid ${answers[q.id] === v ? (v ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)") : T.border}`, color: answers[q.id] === v ? (v ? "#22c55e" : T.red) : T.muted }}>
                      {v ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button onClick={calcScore} disabled={answered < questions.length}
                style={{ padding: "14px 40px", background: answered === questions.length ? T.accent : T.mutedDark, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: answered === questions.length ? "pointer" : "default", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: answered === questions.length ? 1 : 0.5, transition: "all 0.3s" }}>
                Calculate My Score
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "48px 32px", backdropFilter: "blur(8px)", textAlign: "center" }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="90" cy="90" r="76" fill="none" stroke={scoreColor} strokeWidth="8" strokeDasharray={`${(score / 100) * 478} 478`} strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: "stroke-dasharray 1.2s ease" }} />
              <text x="90" y="82" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="800" fill={scoreColor}>{score}</text>
              <text x="90" y="108" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill={T.muted} letterSpacing="2">OUT OF 100</text>
            </svg>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: scoreColor, marginTop: 20 }}>{scoreLabel}</div>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: "16px auto 0" }}>
              {score >= 75 ? "Your security practices are strong. Keep it up and stay vigilant." : score >= 50 ? "You have decent security habits but there's significant room for improvement. Focus on the areas where you answered 'No'." : "Your digital safety is at serious risk. We strongly recommend addressing the gaps identified above immediately."}
            </p>

            <div style={{ marginTop: 32, textAlign: "left", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Your Results</h3>
              {questions.map((q, i) => (
                <div key={q.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i < questions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: answers[q.id] ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: answers[q.id] ? "#22c55e" : T.red, flexShrink: 0 }}>{answers[q.id] ? "\u2713" : "\u2717"}</span>
                  <span style={{ fontSize: 13, color: answers[q.id] ? T.muted : T.white }}>{q.q}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { setScore(null); setAnswers({}); }} style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.muted, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>Retake Assessment</button>
              <Link to="/learn" style={{ display: "inline-block", padding: "12px 28px", background: T.accent, borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Improve Your Score</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
