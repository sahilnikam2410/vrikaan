import { useState } from "react";
import Navbar from "../../components/Navbar";
import SeniorModeBanner from "../../components/SeniorModeBanner";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import QuotaBanner from "../../components/QuotaBanner";
import UpgradeModal from "../../components/UpgradeModal";
import { useToolQuota } from "../../hooks/useToolQuota";
import { apiFetch, parseTierError } from "../../lib/apiFetch";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

const VERDICT_META = {
  safe:       { color: T.green,  emoji: "✅", label: "Looks safe" },
  suspicious: { color: T.yellow, emoji: "⚠️", label: "Suspicious" },
  dangerous:  { color: T.red,    emoji: "🚨", label: "Dangerous — likely scam" },
};

const SAMPLES = [
  { tag: "UPI fraud SMS", text: "Dear customer, your KYC will expire today. Click http://bit.ly/upi-update to update, else your account will be blocked. — SBI" },
  { tag: "Parcel scam", text: "Your DHL parcel is on hold due to incomplete address. Pay ₹35 customs to release: dhl-india-customs.in/pay" },
  { tag: "Job offer", text: "Hello! We saw your resume on Naukri. Earn ₹3000/day from home. Send Aadhaar + bank details on WhatsApp +91 87XXX-XXXXX." },
];

export default function ScamCheck() {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("sms");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState(false);
  const quota = useToolQuota({ path: "/scam-check" });

  const run = async () => {
    if (text.trim().length < 5) { setError("Paste at least 5 characters."); return; }
    if (!quota.allowed) { setPaywall(true); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      await quota.run(async () => {
        const r = await apiFetch("/api/tools?tool=scam-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, channel }),
        });
        const tierErr = await parseTierError(r);
        if (tierErr) {
          setPaywall(true);
          quota.refresh();
          throw new Error(tierErr.error);
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Request failed");
        setResult(data);
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const meta = result ? (VERDICT_META[result.verdict] || VERDICT_META.suspicious) : null;

  const shareWhatsApp = () => {
    const summary = `VRIKAAN Scam Check verdict: ${meta?.label}\nReasoning: ${result.reasoning}\nCheck your messages: https://vrikaan.com/scam-check`;
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Scam SMS / Email Checker — VRIKAAN" description="Paste any suspicious SMS, email, or WhatsApp message. AI tells you if it's a scam in 5 seconds. Built for India." path="/scam-check" />
      <Navbar />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px' }}><SeniorModeBanner /></div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 20px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, margin: 0, marginBottom: 8, fontFamily: "'Vrikaan Sans', sans-serif" }}>
          Scam Message Checker
        </h1>
        <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
          Paste an SMS, email, or WhatsApp message. AI analyzes it for India-specific scam patterns — UPI fraud, fake KYC, parcel-delivery scams, OTP requests, and more.
        </p>

        <QuotaBanner
          unlimited={quota.unlimited}
          used={quota.used}
          limit={quota.limit}
          remaining={quota.remaining}
          resetAt={quota.resetAt}
          tier={quota.tier}
          path="/scam-check"
        />

        {/* Channel selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["sms", "SMS"], ["email", "Email"], ["whatsapp", "WhatsApp"], ["other", "Other"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setChannel(id)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: channel === id ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "rgba(15,23,42,0.6)",
              color: channel === id ? "#fff" : T.muted,
              border: channel === id ? "none" : `1px solid ${T.border}`,
              cursor: "pointer",
            }}>{lbl}</button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          placeholder="Paste the suspicious message here…"
          rows={6}
          maxLength={2000}
          style={{
            width: "100%", padding: 14, borderRadius: 12,
            background: T.card, border: `1px solid ${T.border}`,
            color: T.white, fontSize: 14, fontFamily: "'Vrikaan Sans', sans-serif",
            resize: "vertical", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 14 }}>
          <span style={{ color: T.muted, fontSize: 11 }}>{text.length}/2000 chars</span>
          {!result && <span style={{ color: T.muted, fontSize: 11 }}>Try a sample below ↓</span>}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={run} disabled={loading || text.length < 5} style={{
            flex: 1, padding: "14px 24px", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 700,
            background: loading || text.length < 5 ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            color: "#fff", cursor: loading || text.length < 5 ? "not-allowed" : "pointer",
            fontFamily: "'Vrikaan Sans', sans-serif",
          }}>{loading ? "Analyzing…" : "Check this message"}</button>
          {result && <button onClick={() => { setResult(null); setText(""); }} style={{
            padding: "14px 18px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent",
            color: T.muted, cursor: "pointer", fontSize: 14,
          }}>Clear</button>}
        </div>

        {error && (
          <div style={{ padding: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: T.red, fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {/* Samples */}
        {!result && !loading && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ color: T.cyan, fontSize: 12, fontWeight: 600, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Try these examples</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => { setText(s.text); setError(""); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6,
                background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 6,
                color: T.white, fontSize: 12, cursor: "pointer", fontFamily: "'Vrikaan Sans'",
              }}>
                <span style={{ color: T.yellow, fontWeight: 600, marginRight: 8 }}>{s.tag}</span>
                <span style={{ color: T.muted }}>{s.text.slice(0, 80)}…</span>
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {result && meta && (
          <div style={{ background: T.card, border: `2px solid ${meta.color}40`, borderRadius: 14, padding: 24 }}>
            {/* Verdict banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 48 }}>{meta.emoji}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: meta.color, fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'Vrikaan Sans', sans-serif" }}>{meta.label}</h2>
                <p style={{ color: T.muted, fontSize: 12, margin: "4px 0 0" }}>
                  Risk score: <span style={{ color: meta.color, fontWeight: 700 }}>{result.score}/100</span> · Category: <span style={{ color: T.white, fontWeight: 600 }}>{result.category}</span>
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <p style={{ color: T.white, fontSize: 14, lineHeight: 1.7, margin: "0 0 18px" }}>{result.reasoning}</p>

            {/* Red flags */}
            {result.redFlags?.length > 0 && (
              <>
                <h3 style={{ color: T.cyan, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>Red flags detected</h3>
                <ul style={{ margin: "0 0 18px", paddingLeft: 20, color: T.white, fontSize: 13, lineHeight: 1.7 }}>
                  {result.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </>
            )}

            {/* Advice */}
            {result.advice?.length > 0 && (
              <>
                <h3 style={{ color: T.green, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>What to do</h3>
                <ul style={{ margin: "0 0 18px", paddingLeft: 20, color: T.white, fontSize: 13, lineHeight: 1.7 }}>
                  {result.advice.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </>
            )}

            {/* Share */}
            <div style={{ display: "flex", gap: 8, paddingTop: 18, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <button onClick={shareWhatsApp} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "rgba(34,197,94,0.15)", color: T.green, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📲 Share on WhatsApp</button>
              <button onClick={() => navigator.clipboard.writeText(`VRIKAAN Scam Check — ${meta.label} (${result.score}/100)\n${result.reasoning}\nhttps://vrikaan.com/scam-check`)} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 13, cursor: "pointer" }}>Copy result</button>
            </div>

            <p style={{ color: T.muted, fontSize: 11, marginTop: 18, fontStyle: "italic" }}>
              AI verdict — not a substitute for human judgement. When in doubt, call your bank's official number directly. Never share OTPs.
            </p>
          </div>
        )}
      </div>
      <Footer />
      {paywall && (
        <UpgradeModal
          open={paywall}
          onClose={() => setPaywall(false)}
          toolName="Scam Check (AI)"
          toolPath="/scam-check"
          tier={quota.tier}
          userPlan={quota.userPlan}
        />
      )}
    </div>
  );
}
