import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { auditReceipt, validateGSTIN } from "../../lib/receiptAudit";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const SEVERITY_COLOR = { high: T.red, medium: T.orange, low: T.yellow };

export default function ReceiptAudit() {
  const [text, setText] = useState("");
  const [gstin, setGstin] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [igst, setIgst] = useState("");
  const [service, setService] = useState("");
  const [tip, setTip] = useState("");
  const [total, setTotal] = useState("");

  const gstinCheck = useMemo(() => gstin ? validateGSTIN(gstin.toUpperCase()) : null, [gstin]);

  const result = useMemo(() => {
    if (!subtotal && !total && !text && !gstin) return null;
    return auditReceipt({ text, gstin: gstin.toUpperCase(), subtotal, cgst, sgst, igst, service, tip, total });
  }, [text, gstin, subtotal, cgst, sgst, igst, service, tip, total]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Receipt Authenticity Scanner — Verify Indian Bills"
        description="Spot fake restaurant / fuel / parking receipts in India. Validates GSTIN, checks CGST+SGST math, flags overcharge tax, identifies non-mandatory service charge. Free."
        path="/receipt-audit"
        keywords="check restaurant bill india, gstin verify, fake bill check, service charge india, overcharge detect, cgst sgst math"
      />
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20, 184, 166,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>FREE · India-First · GSTIN-aware</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Restaurant overcharging you?<br />
            <span style={{ color: T.cyan }}>Check the bill in 10 seconds.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            Validates GSTIN format, CGST+SGST math, flags fake "tax" line items, calls out
            non-mandatory service charge (illegal to force per 2022 order). Built for India.
          </p>
        </header>

        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24,
          marginBottom: 18,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 16px" }}>
            Paste receipt details
          </h2>

          {/* GSTIN */}
          <Field label="GSTIN (15 chars — look for it on the bill header/footer)">
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 15))}
              placeholder="22AAAAA0000A1Z5"
              style={inputStyle()}
            />
            {gstinCheck && (
              <div style={{
                marginTop: 8, padding: "8px 12px", borderRadius: 8,
                background: gstinCheck.valid ? `${T.green}1a` : `${T.red}1a`,
                border: `1px solid ${gstinCheck.valid ? T.green : T.red}55`,
                color: gstinCheck.valid ? T.green : T.red,
                fontSize: 12,
              }}>
                {gstinCheck.valid
                  ? `✓ Valid · State: ${gstinCheck.state} · PAN: ${gstinCheck.pan}`
                  : `❌ Invalid · ${gstinCheck.reason}`}
              </div>
            )}
          </Field>

          {/* Money fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            <NumField label="Subtotal ₹" value={subtotal} setValue={setSubtotal} />
            <NumField label="CGST ₹" value={cgst} setValue={setCgst} />
            <NumField label="SGST ₹" value={sgst} setValue={setSgst} />
            <NumField label="IGST ₹" value={igst} setValue={setIgst} />
            <NumField label="Service ₹" value={service} setValue={setService} />
            <NumField label="Tip ₹" value={tip} setValue={setTip} />
            <NumField label="Grand Total ₹" value={total} setValue={setTotal} highlight />
          </div>

          {/* Optional full text */}
          <Field label="Optional: paste full receipt text (we'll find GSTIN automatically)">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Restaurant XYZ&#10;GSTIN: 22AAAAA0000A1Z5&#10;Subtotal: ₹1000&#10;CGST 9%: ₹90&#10;SGST 9%: ₹90&#10;Service charge: ₹100&#10;Total: ₹1280"
              rows={5}
              style={{ ...inputStyle(), fontFamily: "ui-monospace, Menlo, monospace", resize: "vertical" }}
            />
          </Field>
        </div>

        {/* Verdict */}
        {result && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{
              padding: 22, borderRadius: 16,
              background: `${result.verdict.color}1a`,
              border: `2px solid ${result.verdict.color}`,
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 2, color: result.verdict.color,
                  textTransform: "uppercase", marginBottom: 4,
                }}>Verdict</div>
                <div style={{
                  fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 28, fontWeight: 800,
                  color: result.verdict.color, lineHeight: 1.1,
                }}>{result.verdict.label}</div>
                <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>
                  Risk score: {result.riskScore}/100 · {result.findings.length} issues
                </div>
              </div>
              <div style={{ flex: 1 }} />
              {result.computed.expectedTotal > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Expected total</div>
                  <div style={{ color: T.white, fontSize: 22, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                    ₹{result.computed.expectedTotal.toFixed(2)}
                  </div>
                  {result.computed.claimedTotal > 0 && Math.abs(result.computed.claimedTotal - result.computed.expectedTotal) > 1 && (
                    <div style={{ color: T.red, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                      ⚠ Bill: ₹{result.computed.claimedTotal} ({(result.computed.claimedTotal > result.computed.expectedTotal ? "+" : "")}{(result.computed.claimedTotal - result.computed.expectedTotal).toFixed(2)})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Findings */}
            {result.findings.length === 0 ? (
              <div style={{
                padding: 20, borderRadius: 14,
                background: T.card, border: `1px solid ${T.green}55`,
                color: T.green, fontSize: 14, textAlign: "center", fontWeight: 600,
              }}>✓ All checks passed. Receipt math + GSTIN + tax slabs look correct.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {result.findings.map((f, i) => {
                  const c = SEVERITY_COLOR[f.severity] || T.muted;
                  return (
                    <div key={i} style={{
                      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                      padding: 16, borderLeft: `4px solid ${c}`,
                    }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                          padding: "3px 8px", borderRadius: 999,
                          background: `${c}1a`, color: c, border: `1px solid ${c}55`,
                          textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                        }}>{f.severity}</span>
                        <span style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>{f.title}</span>
                      </div>
                      <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 8 }}>{f.detail}</div>
                      <div style={{ color: T.cyan, fontSize: 12, lineHeight: 1.5 }}>
                        ✓ <strong>Action:</strong> {f.action}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Education */}
        <section style={{
          marginTop: 36, padding: 24, borderRadius: 18,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 16px" }}>
            🇮🇳 India tax cheat-sheet
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ed-grid">
            <div>
              <div style={{ color: T.cyan, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>GST rules</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Valid slabs: 0% · 5% · 12% · 18% · 28%</li>
                <li>Intra-state: CGST + SGST (must be EQUAL)</li>
                <li>Inter-state: IGST only (no CGST/SGST)</li>
                <li>GSTIN is 15 chars: 2 state + 10 PAN + 1 entity + Z + 1 check</li>
              </ul>
            </div>
            <div>
              <div style={{ color: T.red, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Your rights</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Service charge is OPTIONAL (June 2022 Consumer Affairs order)</li>
                <li>You can refuse it — establishment must oblige</li>
                <li>Complaint helpline: <a href="tel:1915" style={{ color: T.cyan }}>1915</a> (consumerhelpline.gov.in)</li>
                <li>Online file at <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>consumerhelpline.gov.in</a></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🔒 All math + GSTIN checks run in your browser. Nothing uploaded.
          GST slab data current as of 2026; verify large transactions against
          <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan, marginLeft: 4 }}>gst.gov.in</a>.<br />
          🇮🇳 Built in Nashik · Free forever
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .ed-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
        color: T.muted, marginBottom: 8,
      }}>{label}</div>
      {children}
    </div>
  );
}
function NumField({ label, value, setValue, highlight }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 700, color: T.muted,
        marginBottom: 6, letterSpacing: 1, textTransform: "uppercase",
      }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          background: "rgba(2,6,23,0.6)",
          border: `1px solid ${highlight ? T.cyan + "55" : T.border}`,
          color: T.white, fontSize: 14, outline: "none",
          fontFamily: "ui-monospace, monospace", boxSizing: "border-box",
          fontWeight: highlight ? 700 : 400,
        }}
      />
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
