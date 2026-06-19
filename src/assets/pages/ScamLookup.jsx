import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { LuShieldAlert, LuShieldCheck, LuSearch, LuArrowRight, LuFlag } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

// Public, indexable "is X a scam?" page. Reads the free Scam DNA check
// (/api/tools?tool=scam-dna action=check) for any phone / UPI ID / URL.
function classify(v) {
  if (!v || !v.known) return { label: "No reports yet", color: "#64748b", risk: 0, safeNote: true };
  const r = v.riskScore || 0;
  if (v.verified || r >= 75) return { label: "Known scam", color: "#ef4444", risk: r };
  if (r >= 45) return { label: "Likely scam", color: "#f59e0b", risk: r };
  return { label: "Reported — be cautious", color: "#f59e0b", risk: r };
}

export default function ScamLookup() {
  const { id = "" } = useParams();
  const ider = decodeURIComponent(id).trim();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", identifier: ider }),
      });
      setV(await r.json());
    } catch { setV({ known: false, riskScore: 0 }); }
    setLoading(false);
  }, [ider]);
  useEffect(() => { if (ider) load(); }, [ider, load]);

  const c = classify(v);
  const kind = ider.includes("@") ? "UPI ID" : /^[+0-9 -]{6,}$/.test(ider) ? "phone number" : "link";

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title={`Is ${ider} a scam? — VRIKAAN Scam DNA`}
        description={`Check if ${ider} (${kind}) is a known scam. Live verdict from VRIKAAN's crowdsourced Scam DNA network — UPI fraud, phishing, loan-app & vishing scams across India.`}
        path={`/lookup/${encodeURIComponent(ider)}`}
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 760 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: T.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Scam DNA lookup</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,40px)", color: T.white, margin: 0, lineHeight: 1.15 }}>
            Is <span style={{ color: T.cyan, wordBreak: "break-all" }}>{ider || "this"}</span> a scam?
          </h1>
          <div style={{ color: T.muted, marginTop: 8, fontSize: 14 }}>{kind} · checked against the live network</div>
        </div>

        <Card style={{ padding: 28, textAlign: "center", border: `1px solid ${alpha(c.color, 0.4)}` }}>
          {loading ? (
            <div style={{ color: T.muted, padding: 30 }}>Checking the network…</div>
          ) : (
            <>
              <div style={{ width: 70, height: 70, borderRadius: 18, margin: "0 auto 16px", background: alpha(c.color, 0.14), border: `1px solid ${alpha(c.color, 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.safeNote ? <LuShieldCheck size={34} color={c.color} /> : <LuShieldAlert size={34} color={c.color} />}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: c.color }}>{c.label}</div>
              {v?.known && <div style={{ color: T.white, marginTop: 8, fontSize: 16 }}>Risk {c.risk}/100 · {v.reports || 0} report{(v.reports || 0) === 1 ? "" : "s"}{v.category ? ` · ${String(v.category).replace(/-/g, " ")}` : ""}</div>}
              {v?.tactic && <div style={{ color: T.muted, marginTop: 6, fontSize: 14 }}>Tactic: {v.tactic}</div>}
              {c.safeNote && <div style={{ color: T.muted, marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>No one has reported this {kind} yet — that does <b style={{ color: T.white }}>not</b> mean it's safe. Never share OTP/UPI PIN. When unsure, run the full AI check below.</div>}
            </>
          )}
        </Card>

        {/* actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 22 }}>
          <Link to={`/scam-check?text=${encodeURIComponent(ider)}`} style={btn(T.cyan)}><LuSearch size={16} /> Run full AI scam-check</Link>
          <Link to="/scam-dna" style={btn(T.accent)}><LuFlag size={16} /> Report a scam</Link>
        </div>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Link to="/scam-registry" style={{ color: T.muted, fontSize: 14, textDecoration: "none" }}>← Browse recently flagged scams</Link>
        </div>

        <div style={{ marginTop: 34, padding: 18, borderRadius: 12, background: alpha("#ef4444", 0.06), border: `1px solid ${alpha("#ef4444", 0.2)}`, color: T.muted, fontSize: 13.5, lineHeight: 1.7 }}>
          <b style={{ color: T.white }}>Already lost money?</b> Call <b style={{ color: T.cyan }}>1930</b> (cyber-fraud helpline) and file at <b style={{ color: T.cyan }}>cybercrime.gov.in</b> immediately — speed improves recovery.
        </div>
      </Section>
      <Footer />
    </div>
  );
}
const btn = (col) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 10, background: alpha(col, 0.12), border: `1px solid ${alpha(col, 0.4)}`, color: col, fontWeight: 700, fontSize: 14, textDecoration: "none" });
