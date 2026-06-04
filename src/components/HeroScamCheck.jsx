import { useState } from "react";
import { Link } from "react-router-dom";
import { LuShieldAlert, LuShieldCheck, LuTriangleAlert, LuCircleAlert, LuArrowRight } from "react-icons/lu";

// Inline hero scam-checker — the "serious product" moment. Paste a message,
// get an instant verdict + live community count, feeds the Scam DNA network.
const C = { cyan: "#14b8a6", red: "#ef4444", gold: "#fbbf24", green: "#22c55e", text: "#f1f5f9", muted: "#94a3b8", dim: "#64748b", border: "rgba(148,163,184,0.14)", surface: "rgba(11,18,32,0.7)" };
const V = {
  "scam": { c: C.red, I: LuShieldAlert, label: "Scam" },
  "likely-scam": { c: C.red, I: LuTriangleAlert, label: "Likely scam" },
  "suspicious": { c: C.gold, I: LuCircleAlert, label: "Suspicious" },
  "probably-safe": { c: C.green, I: LuShieldCheck, label: "Looks safe" },
};

export default function HeroScamCheck() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  async function check() {
    if (text.trim().length < 8) { setErr("Paste a longer message."); return; }
    setErr(""); setLoading(true); setRes(null);
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Try again");
      setRes(d);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  const v = res ? (V[res.verdict] || V.suspicious) : null;

  return (
    <div style={{
      maxWidth: 520, marginBottom: 36, padding: 16, borderRadius: 16,
      background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)), rgba(11,18,32,0.6)",
      border: `1px solid ${C.border}`, boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.35)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: C.cyan, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
        Check a scam — free, no login
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") check(); }}
          placeholder="Paste a suspicious SMS / WhatsApp…"
          style={{ flex: 1, background: "rgba(2,6,23,0.5)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "12px 14px", fontSize: 14.5, outline: "none", fontFamily: "'Vrikaan Sans', sans-serif", minWidth: 0 }}
        />
        <button onClick={check} disabled={loading} style={{ flexShrink: 0, padding: "12px 18px", borderRadius: 10, border: "none", background: C.cyan, color: "#04110e", fontWeight: 800, fontSize: 14, cursor: loading ? "wait" : "pointer", fontFamily: "'Vrikaan Sans', sans-serif" }}>
          {loading ? "…" : "Check"}
        </button>
      </div>
      {err && <div style={{ color: C.red, fontSize: 12.5, marginTop: 8 }}>{err}</div>}

      {v && res && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 12px", borderRadius: 10, background: `${v.c}12`, border: `1px solid ${v.c}33` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: v.c, fontWeight: 800, fontSize: 14 }}>
            <v.I size={17} /> {v.label} · {res.riskScore}/100
          </span>
          {!res.community?.isNew && res.community?.seenCount > 1 && (
            <span style={{ fontSize: 12.5, color: C.muted }}>
              seen <strong style={{ color: C.text }}>{res.community.seenCount}×</strong> in the network
            </span>
          )}
          <Link to="/scam-dna" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, color: C.cyan, fontWeight: 700, fontSize: 12.5, textDecoration: "none" }}>
            Full report <LuArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
