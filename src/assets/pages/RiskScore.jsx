import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

/**
 * /risk-score — free AI-powered personal cyber risk assessment.
 *
 * 10-question self-assessment → POST /api/tools?tool=risk-score → Gemini
 * returns 0-100 score + top risks + quick wins + Pro pitch. Pure lead-gen:
 * free, no login, ends on an upgrade CTA tuned to the user's weak spots.
 */

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.6)", white: "#f1f5f9",
  muted: "#94a3b8", mutedDark: "#64748b",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e",
  red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  border: "rgba(148,163,184,0.10)",
};

const QUESTIONS = [
  { key: "reusesPasswords", q: "Do you reuse the same password across multiple sites?", bad: true },
  { key: "has2FA", q: "Is 2-factor authentication (2FA) ON for your main email + bank?", bad: false },
  { key: "usesVPN", q: "Do you use a VPN on public / cafe / airport WiFi?", bad: false },
  { key: "clickedScamRecently", q: "Have you clicked a suspicious link / SMS in the last 3 months?", bad: true },
  { key: "sharesOTP", q: "Have you ever shared an OTP with a 'bank' or 'support' caller?", bad: true },
  { key: "oldDevices", q: "Do you use any phone/laptop that no longer gets security updates?", bad: true },
  { key: "publicWifi", q: "Do you do banking / UPI on public WiFi?", bad: true },
  { key: "familyExposed", q: "Are your parents / grandparents online without any protection?", bad: true },
  { key: "upiHeavy", q: "Do you make 5+ UPI payments per week?", bad: true },
];

const AGE_BANDS = [
  { v: "under25", label: "Under 25" },
  { v: "25-40", label: "25–40" },
  { v: "40-60", label: "40–60" },
  { v: "60plus", label: "60+" },
];

const bandColor = (band) => ({
  low: "#22c55e", moderate: "#fbbf24", high: "#f97316", critical: "#ef4444",
}[band] || "#fbbf24");

const sevColor = (s) => ({ low: "#22c55e", medium: "#fbbf24", high: "#ef4444" }[s] || "#94a3b8");

export default function RiskScore() {
  const [answers, setAnswers] = useState({});
  const [ageBand, setAgeBand] = useState("25-40");
  const [breachCount, setBreachCount] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const allAnswered = QUESTIONS.every((q) => typeof answers[q.key] === "boolean");

  const run = async () => {
    setLoading(true); setErr(""); setResult(null);
    try {
      const signals = { ...answers, ageBand, breachCount };
      const r = await fetch("/api/tools?tool=risk-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not compute score");
      setResult(data);
      setTimeout(() => document.getElementById("rs-result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SEO
        title="Free Cyber Risk Score — How exposed are you? | VRIKAAN"
        description="Take the free 2-minute VRIKAAN cyber risk assessment. AI scores your exposure to UPI fraud, scams, deepfakes, password leaks — and gives a personalized fix plan. No login."
        path="/risk-score"
        keywords="cyber risk score, security checkup india, am i hacked, password risk, upi fraud risk test"
      />
      <Navbar />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.cyan}10`, border: `1px solid ${T.cyan}30`, fontSize: 11, fontWeight: 700, color: T.cyan, marginBottom: 16, letterSpacing: 0.5 }}>FREE · 2 MIN · NO LOGIN</span>
          <h1 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            What's your <span style={{ background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cyber risk score?</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            Answer 9 quick questions. Our AI scores your real exposure to UPI fraud, scams, deepfakes + leaks — and gives you a personalized fix plan.
          </p>
        </div>

        {/* Quiz */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "28px 26px", marginBottom: 24 }}>
          {/* Age band */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your age band</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AGE_BANDS.map((a) => (
                <button key={a.v} onClick={() => setAgeBand(a.v)} style={{
                  padding: "8px 16px", borderRadius: 999, cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  background: ageBand === a.v ? `${T.accent}22` : "transparent",
                  border: `1px solid ${ageBand === a.v ? T.accent : T.border}`,
                  color: ageBand === a.v ? T.white : T.muted,
                }}>{a.label}</button>
              ))}
            </div>
          </div>

          {/* Yes/No questions */}
          {QUESTIONS.map((q, i) => (
            <div key={q.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontSize: 14, color: T.white, flex: 1 }}>{q.q}</span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {[true, false].map((val) => (
                  <button key={String(val)} onClick={() => setAnswers((a) => ({ ...a, [q.key]: val }))} style={{
                    padding: "6px 18px", borderRadius: 8, cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    background: answers[q.key] === val ? (val ? `${T.red}22` : `${T.green}22`) : "transparent",
                    border: `1px solid ${answers[q.key] === val ? (val ? T.red : T.green) : T.border}`,
                    color: answers[q.key] === val ? (val ? T.red : T.green) : T.muted,
                  }}>{val ? "Yes" : "No"}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Breach count */}
          <div style={{ paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Known data breaches your email is in <span style={{ color: T.mutedDark, fontWeight: 400 }}>(check at <Link to="/password-checker" style={{ color: T.cyan }}>breach tool</Link> if unsure)</span>
            </div>
            <input type="range" min="0" max="20" value={breachCount} onChange={(e) => setBreachCount(Number(e.target.value))} style={{ width: "100%", accentColor: T.accent }} />
            <div style={{ fontSize: 13, color: T.muted, textAlign: "center", marginTop: 4 }}>{breachCount}{breachCount === 20 ? "+" : ""} breaches</div>
          </div>
        </div>

        {err && <div style={{ padding: "12px 16px", background: `${T.red}12`, border: `1px solid ${T.red}33`, borderRadius: 10, color: T.red, fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <button onClick={run} disabled={!allAnswered || loading} style={{
          width: "100%", padding: "16px", borderRadius: 12, border: "none",
          background: allAnswered ? `linear-gradient(135deg, ${T.cyan}, ${T.accent})` : "rgba(148,163,184,0.1)",
          color: allAnswered ? "#020617" : T.mutedDark,
          fontSize: 16, fontWeight: 800, cursor: allAnswered && !loading ? "pointer" : "not-allowed",
          fontFamily: "'Hanken Grotesk', sans-serif",
        }}>
          {loading ? "AI analyzing…" : allAnswered ? "Get my risk score →" : `Answer all questions (${Object.keys(answers).length}/9)`}
        </button>

        {/* Result */}
        {result && (
          <div id="rs-result" style={{ marginTop: 40 }}>
            {/* Score dial */}
            <div style={{ textAlign: "center", padding: "32px 24px", background: T.card, border: `1px solid ${bandColor(result.band)}40`, borderRadius: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: bandColor(result.band), textTransform: "uppercase", marginBottom: 12 }}>{result.band} RISK</div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 72, fontWeight: 800, lineHeight: 1, color: bandColor(result.band), letterSpacing: "-0.04em" }}>{result.score}<span style={{ fontSize: 28, color: T.mutedDark }}>/100</span></div>
              <p style={{ color: T.white, fontSize: 16, lineHeight: 1.6, maxWidth: 460, margin: "16px auto 0", fontWeight: 600 }}>{result.headline}</p>
            </div>

            {/* Top risks */}
            {result.topRisks?.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>⚠ Your top risks</h3>
                {result.topRisks.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(r.severity), marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>{r.risk}</div>
                      <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{r.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick wins */}
            {result.quickWins?.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>✓ Fix these first</h3>
                {result.quickWins.map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: T.white }}>{w.action}</span>
                      <span style={{ fontSize: 11, color: T.mutedDark, marginLeft: 8 }}>~{w.effortMins} min</span>
                    </div>
                    {w.tool && (
                      <Link to={w.tool} style={{ fontSize: 12, fontWeight: 700, color: T.cyan, textDecoration: "none", padding: "5px 12px", borderRadius: 8, border: `1px solid ${T.cyan}33`, flexShrink: 0 }}>Open tool →</Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pro pitch CTA */}
            <div style={{ textAlign: "center", padding: "32px 28px", background: `linear-gradient(135deg, ${T.accent}10, ${T.cyan}06)`, border: `1px solid ${T.accent}22`, borderRadius: 18 }}>
              <p style={{ color: T.white, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px", fontWeight: 600 }}>{result.proPitch}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/pricing" style={{ padding: "13px 28px", background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, color: "#020617", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 800, fontFamily: "'Hanken Grotesk', sans-serif" }}>See plans →</Link>
                <Link to="/family-plan" style={{ padding: "13px 28px", background: "transparent", border: `1px solid ${T.border}`, color: T.white, borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Protect family</Link>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: T.mutedDark, marginTop: 16 }}>
              AI estimate based on your self-assessment. Not a substitute for a full security audit.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
