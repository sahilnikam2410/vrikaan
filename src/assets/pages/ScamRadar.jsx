import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LuRadar, LuTriangleAlert, LuArrowRight, LuActivity } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const CAT_COLOR = {
  "upi-fraud": "#ef4444", phishing: "#f59e0b", vishing: "#a78bfa", "loan-app": "#ec4899",
  "job-scam": "#14b8a6", investment: "#6366f1", "lottery-prize": "#fbbf24", "fake-bank": "#ef4444",
  "fake-courier": "#f97316", "fake-police": "#dc2626", kyc: "#38bdf8",
  romance: "#f472b6", "romance-scam": "#f472b6", other: "#64748b",
};
const ago = (ms) => {
  if (!ms) return "";
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function ScamRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "radar" }),
      });
      setData(await r.json());
    } catch { setData({ categories: [], items: [] }); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, [load]);

  const maxRep = Math.max(1, ...(data?.categories || []).map((c) => c.reports));

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Scam Radar — Live Scam Activity Across India | VRIKAAN"
        description="Live map of scams active across India right now — UPI fraud, phishing, digital-arrest, loan-app & vishing. Real-time crowd intelligence from VRIKAAN's Scam DNA network. See what's trending before it reaches you."
        path="/scam-radar"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 1040 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 30px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse-dot 1.6s ease-in-out infinite" }} /> LIVE · Scam Radar
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,52px)", color: T.text, margin: 0, lineHeight: 1.1 }}>What's scamming India right now.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>Live crowd intelligence from the Scam DNA network. See the scams spreading today — before one reaches you.</p>
        </div>

        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 30 }}>
          {[
            { icon: LuActivity, val: data?.active24h ?? "—", label: "Active in last 24h", color: "#22c55e" },
            { icon: LuTriangleAlert, val: data?.totalReports ?? "—", label: "Total community reports", color: "#ef4444" },
            { icon: LuRadar, val: data?.totalSignals ?? "—", label: "Scam signatures tracked", color: T.cyan },
          ].map((s) => {
            const Ic = s.icon;
            return (
              <Card key={s.label} style={{ padding: 20, textAlign: "center" }}>
                <Ic size={20} color={s.color} style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: T.text }}>{typeof s.val === "number" ? s.val.toLocaleString() : s.val}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{s.label}</div>
              </Card>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
          {/* Category breakdown */}
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 16 }}>Scam types trending now</div>
            {loading ? <div style={{ color: T.muted, padding: 20 }}>Scanning the network…</div> : (
              <div style={{ display: "grid", gap: 11 }}>
                {(data?.categories || []).slice(0, 10).map((c) => {
                  const col = CAT_COLOR[c.category] || "#64748b";
                  return (
                    <div key={c.category} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 130, fontSize: 13.5, color: T.text, fontWeight: 600, flexShrink: 0 }}>{c.label}</div>
                      <div style={{ flex: 1, height: 22, borderRadius: 6, background: alpha("#94a3b8", 0.08), overflow: "hidden" }}>
                        <div style={{ width: `${Math.max(6, (c.reports / maxRep) * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${alpha(col, 0.5)}, ${col})`, borderRadius: 6, transition: "width 0.6s" }} />
                      </div>
                      <div style={{ width: 46, textAlign: "right", fontSize: 13, fontWeight: 700, color: col, flexShrink: 0 }}>{c.reports}</div>
                    </div>
                  );
                })}
                {!(data?.categories || []).length && <div style={{ color: T.muted }}>No live data yet — be the first to <Link to="/scam-dna" style={{ color: T.cyan }}>report a scam</Link>.</div>}
              </div>
            )}
          </Card>

          {/* Live feed */}
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>Live scam feed</div>
              <span style={{ fontSize: 11.5, color: T.mutedDark }}>auto-refresh · 30s</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(data?.items || []).map((it, i) => {
                const col = CAT_COLOR[it.category] || "#64748b";
                const inner = (
                  <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", borderRadius: 10, background: alpha("#94a3b8", 0.03), border: `1px solid ${T.border}` }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{it.label}</span>
                        {it.verified && <span style={{ fontSize: 10, color: T.cyan, border: `1px solid ${alpha(T.cyan, 0.4)}`, borderRadius: 100, padding: "1px 6px" }}>verified</span>}
                        <span style={{ fontSize: 11.5, color: T.mutedDark }}>· {it.reports} report{it.reports === 1 ? "" : "s"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: T.muted, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.tactic || it.sample || "Scam pattern"}</div>
                    </div>
                    <span style={{ fontSize: 11, color: T.mutedDark, flexShrink: 0 }}>{ago(it.lastSeen)}</span>
                    {it.ident && <LuArrowRight size={15} color={T.cyan} />}
                  </div>
                );
                return it.ident
                  ? <Link key={i} to={`/lookup/${encodeURIComponent(it.ident)}`} style={{ textDecoration: "none" }}>{inner}</Link>
                  : <div key={i}>{inner}</div>;
              })}
              {loading && <div style={{ color: T.muted, padding: 10 }}>Loading live feed…</div>}
            </div>
          </Card>
        </div>

        <div style={{ textAlign: "center", marginTop: 34 }}>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 14 }}>Got a suspicious message? Check it free — and add it to the radar.</p>
          <Link to="/scam-dna" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: T.cyan, color: "#04110e", fontWeight: 800, textDecoration: "none", fontSize: 15 }}>Check a scam <LuArrowRight size={16} /></Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
