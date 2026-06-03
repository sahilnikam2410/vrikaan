import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ToolShell from "../../components/ToolShell";
import SeniorModeBanner from "../../components/SeniorModeBanner";
import { profileLoanApp, RED_FLAG_PERMISSIONS, RBI_REGISTERED } from "../../lib/loanAppProfiler";
import { LuTriangleAlert, LuCircleAlert, LuCircleCheck, LuList, LuFileText } from "react-icons/lu";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const SEVERITY_COLOR = { high: T.red, medium: T.orange, low: T.green };

const COMMON_PERMISSIONS = [
  "READ_SMS", "READ_CONTACTS", "READ_EXTERNAL_STORAGE",
  "ACCESS_FINE_LOCATION", "CAMERA", "RECORD_AUDIO",
  "CALL_PHONE", "ACCESS_NOTIFICATIONS", "SYSTEM_ALERT_WINDOW",
  "QUERY_ALL_PACKAGES",
];

export default function LoanAppProfiler() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [apr, setApr] = useState("");
  const [fee, setFee] = useState("");

  const togglePerm = (p) => {
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const result = useMemo(() => {
    if (!name && !url) return null;
    return profileLoanApp({
      name, playStoreUrl: url, permissions: selectedPerms,
      chargesAPR: apr ? Number(apr) : null,
      processingFee: fee ? Number(fee) : null,
    });
  }, [name, url, selectedPerms, apr, fee]);

  return (
    <ToolShell
      route="/loan-app-check" eyebrow="Loan Safety"
      title="Loan App" titleAccent="Profiler"
      subtitle="Check any loan app BEFORE installing. We cross-check against RBI's registered NBFC list, known predatory apps from 2020-2024 raids, and flag permissions no legit lender needs."
      width={950}
      seoTitle="Loan App Profiler — Check Before Install"
      seoDesc="Before installing any 'instant loan' app, paste its name here. We check against RBI's registered NBFC list, known predatory apps, permission red flags, and APR. India-first."
      path="/loan-app-check"
      topSlot={<SeniorModeBanner />}
      footer
    >

        {/* Threat reminder */}
        <div style={{
          padding: 18, borderRadius: 14, marginBottom: 24,
          background: `${T.red}0a`, border: `1px solid ${T.red}33`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: T.red, textTransform: "uppercase", marginBottom: 6 }}>
            <LuTriangleAlert size={13} style={{ verticalAlign: "-2px" }} /> THE PREDATORY LOAN APP TRAP
          </div>
          <div style={{ color: T.white, fontSize: 14, lineHeight: 1.7 }}>
            App promises ₹10k loan instantly. Approves. Charges ₹3k as "processing fee" upfront → you get ₹7k. Loan term: 7 days, repay ₹15k. Miss a day? <strong style={{ color: T.red }}>Calls your entire contact list with morphed nude photos of you.</strong> Suicide cases in India hit ~1,500/year. Per RBI: any app not on the registered list is illegal — install at your own risk.
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 22, marginBottom: 18,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 16px" }}>
            App details
          </h2>

          <Field label="App name (e.g. 'KreditBee', 'Cash Mama', 'Bajaj Finance')">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type or paste app name..." style={inputStyle()} />
          </Field>

          <Field label="OR Play Store URL">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://play.google.com/store/apps/details?id=..." style={inputStyle()} />
          </Field>

          <Field label="Permissions the app requests (check Play Store listing → About this app → Permissions)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COMMON_PERMISSIONS.map(p => (
                <button key={p} onClick={() => togglePerm(p)} style={{
                  padding: "6px 12px", borderRadius: 999,
                  background: selectedPerms.includes(p) ? `${T.red}22` : "transparent",
                  color: selectedPerms.includes(p) ? T.red : T.muted,
                  border: `1px solid ${selectedPerms.includes(p) ? T.red : T.border}`,
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "ui-monospace, monospace",
                }}>{p}</button>
              ))}
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="loan-row">
            <Field label="Stated APR % (annual)">
              <input type="number" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="e.g. 36" style={inputStyle()} />
            </Field>
            <Field label="Processing fee %">
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 3" style={inputStyle()} />
            </Field>
          </div>
        </div>

        {/* Verdict */}
        {result && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{
              padding: 22, borderRadius: 16,
              background: `${result.verdict.color}1a`, border: `2px solid ${result.verdict.color}`,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: 2, color: result.verdict.color,
                textTransform: "uppercase", marginBottom: 4,
              }}>Verdict</div>
              <div style={{
                fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 28, fontWeight: 800,
                color: result.verdict.color, lineHeight: 1.1,
              }}>{result.verdict.label}</div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>
                Risk score: {result.score}/100 · {result.findings.length} issues
              </div>
            </div>

            {/* Findings */}
            <div style={{ display: "grid", gap: 10 }}>
              {result.findings.map((f, i) => {
                const c = SEVERITY_COLOR[f.severity] || T.muted;
                return (
                  <div key={i} style={{
                    padding: 14, borderRadius: 12,
                    background: T.card, border: `1px solid ${T.border}`,
                    borderLeft: `4px solid ${c}`,
                  }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                      padding: "3px 8px", borderRadius: 999,
                      background: `${c}1a`, color: c, border: `1px solid ${c}55`,
                      marginRight: 8, textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                    }}>{f.severity}</span>
                    <span style={{ color: T.white, fontSize: 13, lineHeight: 1.6 }}>{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education sections */}
        <section style={{
          marginTop: 36, padding: 22, borderRadius: 14,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
            <LuCircleAlert size={18} style={{ verticalAlign: "-3px" }} color={T.red} /> Permissions no legit loan app needs
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {RED_FLAG_PERMISSIONS.map(p => (
              <div key={p.perm} style={{
                padding: 12, borderRadius: 10,
                background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
              }}>
                <div style={{ color: T.red, fontWeight: 700, fontSize: 12, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{p.perm}</div>
                <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6 }}>{p.why}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          marginTop: 18, padding: 22, borderRadius: 14,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            <LuCircleCheck size={18} style={{ verticalAlign: "-3px" }} color={T.green} /> Sample of RBI-registered legit lenders ({RBI_REGISTERED.length})
          </h3>
          <p style={{ color: T.muted, fontSize: 12, margin: "0 0 12px" }}>
            Full list: <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>rbi.org.in</a> ·
            Check specific NBFC: <a href="https://sachet.rbi.org.in" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>sachet.rbi.org.in</a>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {RBI_REGISTERED.map(r => (
              <span key={r} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 999,
                background: `${T.green}1a`, color: T.green,
                border: `1px solid ${T.green}55`, fontFamily: "ui-monospace, monospace",
              }}>{r}</span>
            ))}
          </div>
        </section>

        {/* Already harassed? */}
        <section style={{
          marginTop: 18, padding: 20, borderRadius: 14, textAlign: "center",
          background: `linear-gradient(135deg, ${T.red}1a, ${T.orange}1a)`,
          border: `1px solid ${T.red}33`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 8px" }}>
            <LuTriangleAlert size={18} style={{ verticalAlign: "-3px" }} color={T.red} /> Already installed a predatory app + getting harassed?
          </h3>
          <p style={{ color: T.muted, fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
            File at sachet.rbi.org.in + cybercrime.gov.in + call 1930. Don't pay any "settlement". Block all unknown numbers.
          </p>
          <Link to="/scam-recovery" style={{
            display: "inline-block", padding: "11px 22px", borderRadius: 10,
            background: T.red, color: "#fff", fontWeight: 800, fontSize: 14,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}><LuList size={14} style={{ verticalAlign: "-2px" }} /> Scam Recovery Hotline →</Link>
        </section>

        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          <LuFileText size={13} style={{ verticalAlign: "-2px" }} /> RBI Digital Lending Guidelines: rbi.org.in/Scripts/NotificationUser.aspx?Id=12382 (Sep 2022).
          App lists current as of Mar 2026 — predatory app names rotate; do additional research.<br/>
          🇮🇳 Built in Nashik · Free forever
        </p>
      <style>{`
        @media (max-width: 720px) {
          .loan-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ToolShell>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
        color: T.muted, marginBottom: 8,
      }}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle() {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
    color: T.white, fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
}
