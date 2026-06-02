import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { audit } from "../../lib/whatsappAudit";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const SEVERITY_COLOR = { high: T.red, medium: T.orange, low: T.yellow };

export default function WhatsAppAudit() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (>10 MB). Real WhatsApp exports are <2 MB.");
      return;
    }
    try {
      const text = await file.text();
      const out = audit(text);
      if (out.parsed.messages === 0) {
        setError("No messages parsed. Make sure this is a WhatsApp 'Export chat (without media)' .txt file.");
        return;
      }
      setError("");
      setResult(out);
    } catch (e) {
      setError(e.message);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clear = () => { setResult(null); setError(""); };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="WhatsApp Group Auditor — Detect Scam Groups"
        description="Paste any WhatsApp group's chat export. AI flags pump-and-dump patterns, fake admins, hidden URLs, UPI drops, mass-adders. India-first. Free."
        path="/whatsapp-audit"
        keywords="whatsapp group scam, stock tip group fraud, investment scam whatsapp, telegram pump dump, crypto signal group"
      />
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(34,197,94,0.1)", border: `1px solid #25D366`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: "#25D366", marginBottom: 14,
          }}>FREE · No upload · India-first</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            That investment group?<br />
            <span style={{ color: T.red }}>Check before you trust.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            Export any WhatsApp group's chat → drop here → AI flags pump-and-dump patterns,
            fake admins, hidden URLs, UPI dumps, mass-adders. India-built.
            Files never leave your browser.
          </p>
        </header>

        {!result ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragging ? T.cyan : T.border}`,
                borderRadius: 18,
                background: dragging ? "rgba(20, 184, 166,0.06)" : T.card,
                padding: "48px 24px", textAlign: "center",
                transition: "all 0.2s", marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ color: T.white, fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                Drop WhatsApp chat export (.txt)
              </div>
              <div style={{ color: T.muted, fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                Max 10 MB · .txt only · processed in browser
              </div>
              <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} style={{
                padding: "12px 26px", borderRadius: 10,
                background: T.cyan, color: T.bg, border: 0,
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                fontFamily: "'Vrikaan Sans', sans-serif",
              }}>📁 Select .txt file</button>
              {error && (
                <div style={{
                  marginTop: 16, padding: 12, borderRadius: 10,
                  background: `${T.red}1a`, border: `1px solid ${T.red}55`,
                  color: T.red, fontSize: 13,
                }}>❌ {error}</div>
              )}
            </div>

            {/* How to export */}
            <div style={{
              padding: 22, borderRadius: 14,
              background: "rgba(2,6,23,0.5)", border: `1px solid ${T.border}`,
            }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
                📤 How to export WhatsApp chat
              </h3>
              <ol style={{ margin: 0, paddingLeft: 20, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Open the WhatsApp group → tap group name at top</li>
                <li>Scroll to bottom → tap <strong style={{ color: T.cyan }}>"Export chat"</strong></li>
                <li>Choose <strong style={{ color: T.cyan }}>"Without media"</strong> (faster, smaller)</li>
                <li>Save the .txt to your phone or share to email</li>
                <li>Download .txt to this device → drop here</li>
              </ol>
            </div>
          </>
        ) : (
          /* RESULTS */
          <div style={{ display: "grid", gap: 18 }}>
            {/* Verdict header */}
            <div style={{
              padding: 24, borderRadius: 18,
              background: `${result.verdict.color}1a`,
              border: `2px solid ${result.verdict.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: 2, color: result.verdict.color,
                    textTransform: "uppercase", marginBottom: 4,
                  }}>Verdict</div>
                  <div style={{
                    fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 32, fontWeight: 800,
                    color: result.verdict.color, lineHeight: 1,
                  }}>{result.verdict.label}</div>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>
                    Risk score: {result.riskScore}/100 · {result.parsed.messages.toLocaleString()} msgs · {result.totalMembers} members
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={clear} style={{
                  padding: "10px 18px", borderRadius: 10,
                  background: "transparent", color: T.white,
                  border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>🗑 Scan another</button>
              </div>
            </div>

            {/* Findings */}
            {result.findings.length === 0 ? (
              <div style={{
                padding: 24, borderRadius: 14,
                background: T.card, border: `1px solid ${T.green}55`,
                color: T.green, fontSize: 14, textAlign: "center", fontWeight: 600,
              }}>✓ No major red flags detected. Group looks ordinary. Still apply general judgement — never send money or share OTP.</div>
            ) : (
              <div>
                <h3 style={{
                  fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white,
                  margin: "0 0 14px",
                }}>🚩 {result.findings.length} findings — review each</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {result.findings.map((f, i) => {
                    const c = SEVERITY_COLOR[f.severity] || T.muted;
                    return (
                      <div key={i} style={{
                        background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                        padding: 18, borderLeft: `4px solid ${c}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                            padding: "3px 8px", borderRadius: 999,
                            background: `${c}1a`, color: c, border: `1px solid ${c}55`,
                            textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                          }}>{f.severity}</span>
                          <span style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>{f.title}</span>
                        </div>
                        <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}>
                          {f.detail}
                        </div>
                        <div style={{ color: T.cyan, fontSize: 12, lineHeight: 1.5 }}>
                          ✓ <strong>Action:</strong> {f.action}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Member table */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
                👥 Top {Math.min(result.members.length, 30)} most-active members
              </h3>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px",
                gap: 8, padding: "8px 12px",
                fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                borderBottom: `1px solid ${T.border}`,
              }} className="member-header">
                <div>Member</div><div>Msgs</div><div>%</div><div>URLs</div><div>Risk</div>
              </div>
              {result.members.slice(0, 15).map((m, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px",
                  gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.border}`,
                  alignItems: "center", fontSize: 12,
                }} className="member-row">
                  <div style={{ color: T.white, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.name} {m.intlNumber && <span title="Non-Indian number" style={{ color: T.orange }}>🌐</span>}
                  </div>
                  <div style={{ color: T.cyan, fontFamily: "ui-monospace, monospace" }}>{m.msgs}</div>
                  <div style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>{m.sharePct}%</div>
                  <div style={{ color: m.urls > 0 ? T.yellow : T.muted, fontFamily: "ui-monospace, monospace" }}>{m.urls}</div>
                  <div style={{ color: m.scamHits > 2 ? T.red : m.scamHits > 0 ? T.yellow : T.muted, fontFamily: "ui-monospace, monospace" }}>
                    {m.scamHits > 0 ? "🚩 " + m.scamHits : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{
              padding: 20, borderRadius: 14, textAlign: "center",
              background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
              border: `1px solid ${T.cyan}33`,
            }}>
              <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                Want to verify a specific message from this group?
              </div>
              <Link to="/scam-check" style={{
                display: "inline-block",
                padding: "11px 22px", borderRadius: 10,
                background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
                textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
              }}>📝 Paste a specific message →</Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🔒 .txt file parsed entirely in your browser. No upload. Findings based on
          aggregated patterns observed in 2024-26 Indian WhatsApp investment-fraud cases.
          <br />
          🇮🇳 Built by SOC analysts in Pune · Free forever
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .member-header, .member-row { grid-template-columns: 1fr 40px 40px 40px !important; }
          .member-header > div:nth-child(4), .member-row > div:nth-child(4) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
