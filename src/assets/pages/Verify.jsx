import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LuShieldCheck, LuShieldX, LuAward } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

// Public certificate verification — /verify/:certId. Validates Academy certs
// registered server-side at issue time (api cert-register).
export default function Verify() {
  const { certId = "" } = useParams();
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    let on = true;
    fetch(`/api/tools?tool=cert-verify&id=${encodeURIComponent(certId)}`)
      .then((r) => r.json())
      .then((d) => { if (on) setState({ loading: false, data: d }); })
      .catch(() => { if (on) setState({ loading: false, data: { valid: false } }); });
    return () => { on = false; };
  }, [certId]);

  const v = state.data;
  const valid = v?.valid;

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO title={`Verify certificate ${certId} — VRIKAAN Academy`} description="Verify the authenticity of a VRIKAAN Academy certificate." path={`/verify/${certId}`} />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 130, maxWidth: 620 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.cyan, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}><LuAward size={15} /> Certificate verification</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,34px)", color: T.white, margin: 0 }}>VRIKAAN Academy</h1>
        </div>

        <Card style={{ padding: 30, textAlign: "center", border: `1px solid ${alpha(valid ? "#22c55e" : "#ef4444", 0.4)}` }}>
          {state.loading ? (
            <div style={{ color: T.muted, padding: 24 }}>Verifying…</div>
          ) : valid ? (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 18, margin: "0 auto 16px", background: alpha("#22c55e", 0.14), border: `1px solid ${alpha("#22c55e", 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LuShieldCheck size={36} color="#22c55e" />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#22c55e" }}>Verified ✓</div>
              <div style={{ color: T.white, marginTop: 14, fontSize: 20, fontWeight: 700 }}>{v.name || "—"}</div>
              <div style={{ color: T.muted, marginTop: 6, fontSize: 15 }}>{v.title || "VRIKAAN Academy"}</div>
              {v.score != null && <div style={{ color: T.cyan, marginTop: 6, fontSize: 14 }}>Score: {v.score}%</div>}
              <div style={{ color: T.mutedDark, marginTop: 10, fontSize: 13 }}>Issued {v.issuedAt ? new Date(v.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</div>
              <div style={{ color: T.mutedDark, marginTop: 4, fontSize: 12, fontFamily: "var(--font-mono)" }}>ID: {v.certId}</div>
            </>
          ) : (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 18, margin: "0 auto 16px", background: alpha("#ef4444", 0.14), border: `1px solid ${alpha("#ef4444", 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LuShieldX size={36} color="#ef4444" />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#ef4444" }}>Not found</div>
              <div style={{ color: T.muted, marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>No certificate matches <b style={{ color: T.white }}>{certId}</b>. It may be invalid, or issued before verification was enabled.</div>
            </>
          )}
        </Card>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/learn" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 10, background: alpha(T.cyan, 0.12), border: `1px solid ${alpha(T.cyan, 0.4)}`, color: T.cyan, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Earn your own → VRIKAAN Academy</Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
