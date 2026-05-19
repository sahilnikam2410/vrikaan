import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { SCAM_TYPES, HELPLINES, buildRecoveryPlan, buildComplaintText } from "../../lib/scamRecovery";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const HOUR_OPTIONS = [
  { v: 1, label: "<1 hour ago" },
  { v: 6, label: "Last 6 hours" },
  { v: 24, label: "Last 24 hours" },
  { v: 72, label: "1-3 days ago" },
  { v: 168, label: "1 week ago" },
  { v: 720, label: ">1 week ago" },
];

const PAYMENT_OPTIONS = [
  { v: "upi", label: "UPI (PhonePe / GPay / Paytm)" },
  { v: "card", label: "Credit / Debit card" },
  { v: "netbanking", label: "Net banking" },
  { v: "wallet", label: "Wallet (Paytm, Amazon Pay)" },
  { v: "cash", label: "Cash" },
  { v: "none", label: "No money lost" },
];

export default function ScamRecovery() {
  const [scamType, setScamType] = useState("");
  const [amount, setAmount] = useState("");
  const [hoursSince, setHoursSince] = useState(6);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [step, setStep] = useState(1); // 1=triage, 2=plan

  const plan = useMemo(() => {
    if (!scamType) return null;
    return buildRecoveryPlan({
      scamType,
      amount: parseInt(amount) || 0,
      hoursSince: parseInt(hoursSince) || 1,
      paymentMethod,
    });
  }, [scamType, amount, hoursSince, paymentMethod]);

  const complaintText = useMemo(() => {
    if (!plan) return "";
    return buildComplaintText({
      scamType, amount: parseInt(amount) || 0, hoursSince, name, contact, details,
    });
  }, [plan, scamType, amount, hoursSince, name, contact, details]);

  const copyComplaint = async () => {
    try { await navigator.clipboard.writeText(complaintText); } catch {}
  };

  const downloadComplaint = () => {
    const blob = new Blob([complaintText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vrikaan-complaint-${scamType}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Scam Recovery Hotline — What to do now"
        description="Just got scammed? Get a personalized recovery plan in 30 seconds — exact helplines, pre-filled FIR draft, NPCI/RBI dispute steps, IPC sections. Free, India-first."
        path="/scam-recovery"
        keywords="scam recovery india, upi fraud help, hacked what to do, cybercrime helpline 1930, file fir cybercrime, lost money to scammer"
      />
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: `${T.red}1a`, border: `1px solid ${T.red}55`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.red, marginBottom: 14,
          }}>🚨 Emergency · Free · No Signup</span>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Just got scammed?<br />
            <span style={{ color: T.red }}>You have hours, not days.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Tell us what happened. Get the exact escalation order — which helpline to call FIRST,
            which IPC sections apply, pre-filled FIR draft, NPCI/RBI dispute path, recovery odds.
            India-specific. Built by SOC analysts.
          </p>
        </header>

        {/* CRITICAL HELPLINE — always visible at top */}
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          background: `${T.red}1a`, border: `2px solid ${T.red}`,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 32 }}>🚨</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 16 }}>
              Call <a href="tel:1930" style={{ color: T.red, textDecoration: "underline" }}>1930</a> RIGHT NOW
            </div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>
              National Cyber Crime Helpline · 24×7 · Reports + freezes UPI/card in ONE call. Faster than any web form.
            </div>
          </div>
          <a href="tel:1930" style={{
            padding: "12px 22px", borderRadius: 10,
            background: T.red, color: "#fff", textDecoration: "none",
            fontWeight: 800, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif",
          }}>📞 Call 1930</a>
        </div>

        {/* STEP 1 — TRIAGE FORM */}
        {step === 1 && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
            padding: 26,
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 22,
              color: T.white, margin: "0 0 18px",
            }}>30-second triage</h2>

            {/* Q1: Scam type */}
            <Field label="1. What happened?">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
                {Object.entries(SCAM_TYPES).map(([key, s]) => (
                  <button key={key} onClick={() => setScamType(key)} style={{
                    padding: "12px 14px", borderRadius: 10, textAlign: "left",
                    background: scamType === key ? `${T.cyan}1a` : "rgba(2,6,23,0.4)",
                    border: `1px solid ${scamType === key ? T.cyan : T.border}`,
                    color: T.white, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Q2: Amount + payment */}
            <Field label="2. Money involved (if any)">
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 10 }} className="amount-row">
                <input
                  type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in ₹ (0 if none)"
                  style={inputStyle()}
                />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle()}>
                  {PAYMENT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                </select>
              </div>
            </Field>

            {/* Q3: Time */}
            <Field label="3. When did it happen?">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {HOUR_OPTIONS.map(o => (
                  <button key={o.v} onClick={() => setHoursSince(o.v)} style={{
                    padding: "8px 14px", borderRadius: 999,
                    background: hoursSince === o.v ? `${T.cyan}1a` : "transparent",
                    color: hoursSince === o.v ? T.cyan : T.muted,
                    border: `1px solid ${hoursSince === o.v ? T.cyan : T.border}`,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>{o.label}</button>
                ))}
              </div>
            </Field>

            <button
              onClick={() => scamType && setStep(2)}
              disabled={!scamType}
              style={{
                padding: "14px 26px", borderRadius: 12,
                background: scamType ? T.red : "rgba(148,163,184,0.18)",
                color: scamType ? "#fff" : T.muted,
                border: 0, fontWeight: 800, fontSize: 15,
                cursor: scamType ? "pointer" : "not-allowed",
                fontFamily: "'Space Grotesk', sans-serif",
                width: "100%", marginTop: 8,
              }}
            >🚨 Show my recovery plan →</button>
          </div>
        )}

        {/* STEP 2 — RECOVERY PLAN */}
        {step === 2 && plan && (
          <div style={{ display: "grid", gap: 18 }}>
            {/* Top summary */}
            <div style={{
              background: T.card, border: `1px solid ${plan.recoveryColor}55`, borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 36 }}>{plan.scam.emoji}</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: T.white }}>
                    {plan.scam.label}
                  </h2>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
                    {amount > 0 ? `₹${parseInt(amount).toLocaleString("en-IN")} · ` : ""}{hoursSinceLabel(hoursSince)} ago · {paymentMethod}
                  </div>
                </div>
                <button onClick={() => setStep(1)} style={btnGhost()}>← Edit</button>
              </div>

              <div style={{
                padding: 14, borderRadius: 10,
                background: `${plan.recoveryColor}1a`, border: `1px solid ${plan.recoveryColor}55`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
                  color: plan.recoveryColor, marginBottom: 6,
                }}>📊 Recovery odds — {plan.recoveryClass.replace("_", " ")}</div>
                <div style={{ color: T.white, fontSize: 14, lineHeight: 1.6 }}>{plan.recoveryOddsText}</div>
              </div>

              <div style={{
                marginTop: 12, padding: 12, borderRadius: 10,
                background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>
                  ⚖️ Applicable IPC sections
                </div>
                <div style={{ color: T.cyan, fontSize: 13, fontFamily: "ui-monospace, monospace", lineHeight: 1.8 }}>
                  {plan.scam.ipc.join(" · ")}
                </div>
              </div>
            </div>

            {/* Escalation steps */}
            <div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, color: T.white,
                margin: "0 0 14px",
              }}>📋 Do these in order — fastest recovery path</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {plan.steps.map((s, i) => (
                  <div key={s.id} style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                    padding: 20, borderLeft: `4px solid ${i === 0 ? T.red : T.cyan}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{
                        flexShrink: 0,
                        width: 32, height: 32, borderRadius: 999,
                        background: i === 0 ? T.red : T.cyan, color: "#030712",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 14,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: T.white, fontSize: 16, fontWeight: 700 }}>{s.title}</div>
                        {s.deadline && (
                          <div style={{ color: T.yellow, fontSize: 11, marginTop: 2, fontWeight: 600 }}>
                            ⏱ {s.deadline}
                          </div>
                        )}
                      </div>
                    </div>
                    <ol style={{ margin: "0 0 12px", paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                      {s.actions.map((a, j) => <li key={j}>{renderActionText(a)}</li>)}
                    </ol>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                        padding: "8px 14px", borderRadius: 8,
                        background: T.cyan, color: T.bg, textDecoration: "none",
                        fontWeight: 700, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif",
                      }}>🔗 Open portal</a>
                      <div style={{ flex: 1 }} />
                      <div style={{
                        fontSize: 11, color: T.muted, padding: "4px 10px",
                        background: "rgba(2,6,23,0.5)", borderRadius: 6,
                        border: `1px solid ${T.border}`,
                      }}>📊 {s.odds}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Helplines */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
                ☎️ Helplines — call in this order
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {HELPLINES.map(h => (
                  <a key={h.number} href={`tel:${h.number.replace(/-/g, "")}`} style={{
                    display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center",
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                    color: "inherit", textDecoration: "none",
                  }}>
                    <div>
                      <div style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>{h.label}</div>
                      <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{h.availability} · {h.note}</div>
                    </div>
                    <div style={{
                      color: T.cyan, fontSize: 16, fontWeight: 800,
                      fontFamily: "ui-monospace, Menlo, monospace",
                    }}>{h.number}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Pre-filled FIR draft */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: T.white, margin: "0 0 8px" }}>
                📄 Pre-filled FIR / cybercrime complaint
              </h3>
              <p style={{ color: T.muted, fontSize: 13, margin: "0 0 14px" }}>
                Fill name/contact/details below — text auto-updates. Copy or download → submit at police station or cybercrime.gov.in.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }} className="fir-row">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={inputStyle()} />
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Your phone number" style={inputStyle()} />
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="What exactly happened? Include scammer's phone/UPI/links if known."
                style={{ ...inputStyle(), resize: "vertical", marginBottom: 12 }}
              />

              <pre style={{
                margin: 0, padding: 16, borderRadius: 10,
                background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                color: T.white, fontSize: 12, lineHeight: 1.6,
                fontFamily: "ui-monospace, Menlo, monospace",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                maxHeight: 320, overflowY: "auto",
              }}>{complaintText}</pre>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={copyComplaint} style={btnPrimary()}>📋 Copy text</button>
                <button onClick={downloadComplaint} style={btnSecondary()}>💾 Download .txt</button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I am filing a complaint:\n\n${complaintText.slice(0, 800)}…\n\nFull version at vrikaan.com/scam-recovery`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ ...btnSecondary(), background: "#25D366", color: "#fff", border: 0 }}
                >📲 Send via WhatsApp</a>
              </div>
            </div>

            {/* What NOT to do */}
            <div style={{
              padding: 18, borderRadius: 14,
              background: `${T.red}0a`, border: `1px solid ${T.red}33`,
            }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: T.red, margin: "0 0 10px" }}>
                ❌ Don't do these — they make recovery harder
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>❌ Don't pay any "recovery agent" who calls offering to get your money back — they're follow-up scammers</li>
                <li>❌ Don't share OTP / passwords / Aadhaar with anyone claiming to be from bank "for refund processing"</li>
                <li>❌ Don't delete the original scam SMS / email / WhatsApp — that IS the evidence</li>
                <li>❌ Don't power off the device if it's a ransomware case — kills volatile evidence in RAM</li>
                <li>❌ Don't post about it on social media before filing FIR — alerts the scammer to dump the trail</li>
              </ul>
            </div>

            {/* Soft CTA — prevention */}
            <div style={{
              padding: 20, borderRadius: 14,
              background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
              border: `1px solid ${T.cyan}33`, textAlign: "center",
            }}>
              <div style={{ color: T.white, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                Prevent next scam — paste any suspicious message into our free Scam Check
              </div>
              <Link to="/scam-check" style={{
                display: "inline-block", marginTop: 10,
                padding: "10px 22px", borderRadius: 10,
                background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
                textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
              }}>Scan a suspicious message →</Link>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          ⚖️ This is informational guidance, not legal advice. For complex cases consult a lawyer.
          IPC sections + recovery odds based on 2024 aggregated data from I4C, RBI, NPCI. Procedures
          may change — verify the latest at cybercrime.gov.in. <br />
          🇮🇳 Built by SOC analysts in Nashik · Free forever · Share with anyone in trouble
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .amount-row { grid-template-columns: 1fr !important; }
          .fir-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
        color: T.muted, marginBottom: 10,
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
function btnPrimary() {
  return {
    padding: "10px 18px", borderRadius: 10,
    background: T.cyan, color: T.bg, border: 0,
    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  };
}
function btnSecondary() {
  return {
    padding: "10px 18px", borderRadius: 10,
    background: "transparent", color: T.white,
    border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
    display: "inline-block",
  };
}
function btnGhost() {
  return {
    padding: "8px 14px", borderRadius: 8,
    background: "transparent", color: T.muted,
    border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  };
}
function hoursSinceLabel(h) {
  if (h < 24) return `${h}h`;
  if (h < 168) return `${Math.round(h / 24)}d`;
  return `${Math.round(h / 168)}wk`;
}
// Render action text w/ inline phone numbers as <tel:> links
function renderActionText(text) {
  const parts = text.split(/(\+?\d{4,15}(?:[-\s]?\d{2,15})*)/g);
  return parts.map((p, i) => {
    if (/\d{4,}/.test(p) && p.replace(/\D/g, "").length >= 5) {
      const tel = p.replace(/[-\s]/g, "");
      return <a key={i} href={`tel:${tel}`} style={{ color: T.cyan, textDecoration: "underline" }}>{p}</a>;
    }
    return p;
  });
}
