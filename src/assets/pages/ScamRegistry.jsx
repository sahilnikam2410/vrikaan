import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LuShieldAlert, LuSearch, LuArrowRight } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

// Public hub of recently-flagged scam identifiers → links to /lookup/<id>.
// Indexable; each link is an SEO long-tail "is X a scam?" page.
export default function ScamRegistry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feed" }),
      });
      const d = await r.json();
      setItems(Array.isArray(d.items) ? d.items : []);
    } catch { setItems([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // feed doc ids look like "id_<identifier>" or "sig_<hash>". Only id_ ones map to a lookup.
  const rows = items.map((it) => {
    const ident = String(it.id || "").startsWith("id_") ? it.id.slice(3) : null;
    return { ...it, ident };
  });

  const go = (e) => {
    e.preventDefault();
    const t = q.trim();
    if (t) window.location.href = `/lookup/${encodeURIComponent(t)}`;
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Scam Number & UPI Registry — Check Any Scam | VRIKAAN"
        description="Search India's crowdsourced scam registry. Check if a phone number, UPI ID or link is a known scam — powered by VRIKAAN's Scam DNA network. UPI fraud, phishing, loan-app & vishing."
        path="/scam-registry"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120 }}>
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 26px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
            <LuShieldAlert size={14} /> Scam DNA registry
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,44px)", color: T.white, margin: 0 }}>Is it a scam? Check any number, UPI or link.</h1>
          <p style={{ color: T.muted, marginTop: 12, fontSize: 16 }}>Search VRIKAAN's crowdsourced scam network. Free, instant.</p>
          <form onSubmit={go} style={{ display: "flex", gap: 8, maxWidth: 520, margin: "22px auto 0" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Paste a phone number, UPI ID or link…"
              style={{ flex: 1, padding: "13px 16px", borderRadius: 10, background: alpha("#94a3b8", 0.06), border: `1px solid ${alpha("#94a3b8", 0.2)}`, color: T.white, fontSize: 15, outline: "none" }} />
            <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 10, background: T.cyan, border: "none", color: "#04110e", fontWeight: 800, fontSize: 15, cursor: "pointer" }}><LuSearch size={16} /> Check</button>
          </form>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ color: T.muted, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Recently flagged</div>
          {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading…</div> : (
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((it, i) => {
                const inner = (
                  <Card style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: T.white, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.ident || (it.tactic || "Scam pattern")}</div>
                      <div style={{ color: T.muted, fontSize: 12.5, marginTop: 2 }}>{String(it.category || "scam").replace(/-/g, " ")} · {it.reports || it.count || 1} report{(it.reports || it.count || 1) === 1 ? "" : "s"}</div>
                    </div>
                    {it.ident && <LuArrowRight size={16} color={T.cyan} />}
                  </Card>
                );
                return it.ident
                  ? <Link key={i} to={`/lookup/${encodeURIComponent(it.ident)}`} style={{ textDecoration: "none" }}>{inner}</Link>
                  : <div key={i}>{inner}</div>;
              })}
              {!rows.length && <div style={{ color: T.muted, padding: 24 }}>No public reports yet. Be the first — report a scam on the <Link to="/scam-dna" style={{ color: T.cyan }}>Scam DNA</Link> page.</div>}
            </div>
          )}
        </div>
      </Section>
      <Footer />
    </div>
  );
}
