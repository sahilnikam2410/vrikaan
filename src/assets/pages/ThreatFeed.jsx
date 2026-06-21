import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LuActivity, LuRefreshCw, LuShieldAlert, LuArrowRight } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const CAT_COLOR = {
  "upi-fraud": "#14b8a6", phishing: "#6366f1", vishing: "#f59e0b", "loan-app": "#ef4444",
  "job-scam": "#8b5cf6", investment: "#ec4899", "lottery-prize": "#f59e0b", "fake-bank": "#ef4444",
  "fake-courier": "#06b6d4", "fake-police": "#ef4444", kyc: "#6366f1", romance: "#ec4899",
  "romance-scam": "#ec4899", other: "#64748b",
};
const catColor = (c) => CAT_COLOR[c] || CAT_COLOR.other;

function ago(ms) {
  if (!ms) return "";
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ThreatFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feed" }),
      });
      const d = await r.json();
      setItems(Array.isArray(d.items) ? d.items : []);
    } catch { setErr("Could not load the live feed. Try again."); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Live Scam Threat Feed — India | VRIKAAN Scam DNA"
        description="Real-time feed of scams active across India, powered by VRIKAAN's crowdsourced Scam DNA network. See trending UPI fraud, phishing, loan-app and deepfake scams as they're reported."
        path="/scam-feed"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120 }}>
        {/* hero */}
        <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 14px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", animation: "pulse-dot 1.4s infinite" }} />
            LIVE · Scam DNA network
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 5vw, 60px)", fontWeight: 800, color: T.white, lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.03em" }}>
            Scams active in India <span style={{ color: T.cyan }}>right now</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: T.muted, lineHeight: 1.6, margin: 0 }}>
            Every report from the VRIKAAN community feeds this live feed. Spot the patterns before they reach your family.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Link to="/scam-dna" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: T.cyan, color: "#042f2a", fontWeight: 800, fontFamily: "var(--font-body)" }}>
              <LuShieldAlert size={18} /> Check a scam
            </Link>
            <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, color: T.white, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
              <LuRefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* feed */}
        <div style={{ marginTop: 44 }}>
          {loading && !items.length ? (
            <div style={{ textAlign: "center", color: T.muted, padding: 40 }}>Loading live feed…</div>
          ) : err ? (
            <div style={{ textAlign: "center", color: "#ef4444", padding: 40 }}>{err}</div>
          ) : !items.length ? (
            <div style={{ textAlign: "center", color: T.muted, padding: 40 }}>No reports yet. Be the first — <Link to="/scam-dna" style={{ color: T.cyan }}>report a scam</Link>.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {items.map((it) => {
                const col = catColor(it.category);
                return (
                  <Card key={it.id} style={{ padding: 20, borderLeft: `3px solid ${col}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: col, background: alpha(col, 0.12), border: `1px solid ${alpha(col, 0.3)}`, padding: "4px 10px", borderRadius: 100 }}>
                        {(it.category || "scam").replace(/-/g, " ")}
                      </span>
                      {it.verified && <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", padding: "3px 8px", borderRadius: 100 }}>✓ VERIFIED</span>}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 8, lineHeight: 1.4 }}>
                      {it.tactic || "Reported scam pattern"}
                    </div>
                    {it.sample && (
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: T.muted, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 12, lineHeight: 1.5, maxHeight: 76, overflow: "hidden" }}>
                        "{it.sample}"
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: T.mutedDark }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><LuActivity size={13} /> {it.count || 1} report{(it.count || 1) > 1 ? "s" : ""}{it.lossCount ? ` · ${it.lossCount} lost money` : ""}</span>
                      <span>{ago(it.lastSeen)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA strip */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link to="/scam-dna" style={{ textDecoration: "none", color: T.cyan, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            Got a suspicious message? Check it free <LuArrowRight size={16} />
          </Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
