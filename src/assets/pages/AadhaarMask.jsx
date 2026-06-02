import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { maskText, maskImage, detect, PATTERN_TYPES } from "../../lib/aadhaarMask";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const TYPE_COLORS = {
  aadhaar: T.red, pan: T.yellow, dl: T.cyan, voter: T.accent, passport: T.green,
  phone: T.muted, email: T.muted, upi: T.muted,
};

export default function AadhaarMask() {
  const [mode, setMode] = useState("text"); // text | image
  const [text, setText] = useState("");
  const [maskMode, setMaskMode] = useState("full"); // full | first | none
  const [maskedResult, setMaskedResult] = useState(null);

  // Image mode
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [maskedImage, setMaskedImage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [imgError, setImgError] = useState("");
  const fileRef = useRef(null);

  // ── Text live detection ───────────────────────────────────────────
  const detected = useMemo(() => mode === "text" ? detect(text) : [], [text, mode]);

  const runTextMask = () => {
    if (!text.trim()) return;
    setMaskedResult(maskText(text, { mode: maskMode }));
  };

  // ── Image mask ────────────────────────────────────────────────────
  const handleImage = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setImgError("Please select an image (JPG / PNG).");
      return;
    }
    setImgError("");
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setMaskedImage(null);
    setProgress(null);
  };

  const runImageMask = async () => {
    if (!imgFile) return;
    setProgress({ stage: "load", pct: 1 });
    setImgError("");
    try {
      const out = await maskImage(imgFile, { onProgress: setProgress });
      setMaskedImage({
        url: URL.createObjectURL(out.blob),
        blob: out.blob,
        downloadName: out.downloadName,
        found: out.found,
        dimensions: out.dimensions,
      });
    } catch (e) {
      setImgError(e.message);
      setProgress(null);
    }
  };

  const downloadMasked = () => {
    if (!maskedImage) return;
    const a = document.createElement("a");
    a.href = maskedImage.url;
    a.download = maskedImage.downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyMasked = async () => {
    if (!maskedResult?.masked) return;
    try {
      await navigator.clipboard.writeText(maskedResult.masked);
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Aadhaar Mask Tool — Free Redaction"
        description="Mask Aadhaar / PAN / driving licence numbers in text or images. Free, no signup, files never leave your browser. Made for India."
        path="/aadhaar-mask"
        keywords="aadhaar mask, aadhaar redact, pan mask, indian id mask, free aadhaar tool, hide aadhaar number, redact aadhaar whatsapp"
      />
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20,227,197,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>Free · No Signup · 100% Private</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Mask Aadhaar before<br />
            <span style={{ color: T.cyan }}>you share it.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Paste text or upload an image — VRIKAAN finds and redacts Aadhaar, PAN, driving licence,
            voter ID, passport, phone, and UPI. Everything runs in your browser. Nothing uploaded.
          </p>
        </header>

        {/* Mode toggle */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 10, marginBottom: 26,
        }}>
          {[
            { id: "text", label: "📝 Text", desc: "Paste text" },
            { id: "image", label: "🖼️ Image", desc: "Upload ID photo" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              padding: "10px 22px", borderRadius: 999,
              background: mode === m.id ? T.cyan : "rgba(148,163,184,0.08)",
              color: mode === m.id ? T.bg : T.white,
              border: `1px solid ${mode === m.id ? T.cyan : T.border}`,
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}>{m.label}</button>
          ))}
        </div>

        {/* TEXT MODE */}
        {mode === "text" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: 18,
            }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                Paste any text containing Aadhaar / PAN / etc.
              </label>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setMaskedResult(null); }}
                placeholder="Example:&#10;&#10;Hi Sahil, please send your Aadhaar 1234 5678 9012 and PAN ABCDE1234F to verify. Mobile: 9876543210."
                rows={8}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10,
                  background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                  color: T.white, fontSize: 14, fontFamily: "ui-monospace, Menlo, monospace",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                  lineHeight: 1.6,
                }}
              />
              {detected.length > 0 && (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  background: "rgba(251,191,36,0.06)", border: `1px solid ${T.yellow}33`,
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.yellow, textTransform: "uppercase", letterSpacing: 1 }}>
                    ⚠ Detected {detected.length}
                  </span>
                  {detected.map((d, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 999,
                      background: `${TYPE_COLORS[d.type]}22`, color: TYPE_COLORS[d.type],
                      border: `1px solid ${TYPE_COLORS[d.type]}55`,
                    }}>{d.label}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Mask mode picker */}
            <div style={{
              display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
              padding: "12px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
            }}>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginRight: 6 }}>Mask style</span>
              {[
                { id: "full", label: "Keep last 4 (UIDAI standard)" },
                { id: "first", label: "Keep first 4" },
                { id: "none", label: "Hide all" },
              ].map(o => (
                <button key={o.id} onClick={() => { setMaskMode(o.id); setMaskedResult(null); }} style={{
                  padding: "6px 12px", borderRadius: 999,
                  background: maskMode === o.id ? `${T.cyan}22` : "transparent",
                  color: maskMode === o.id ? T.cyan : T.muted,
                  border: `1px solid ${maskMode === o.id ? T.cyan : T.border}`,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>{o.label}</button>
              ))}
            </div>

            <button onClick={runTextMask} disabled={!text.trim()} style={{
              padding: "14px 22px", background: T.cyan, color: T.bg,
              border: 0, borderRadius: 12, fontWeight: 800, fontSize: 15,
              cursor: text.trim() ? "pointer" : "not-allowed", opacity: text.trim() ? 1 : 0.5,
              fontFamily: "'Vrikaan Sans', sans-serif",
            }}>🔒 Mask now</button>

            {maskedResult && (
              <div style={{
                background: T.card, border: `1px solid ${T.green}55`, borderRadius: 14,
                padding: 18,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
                  flexWrap: "wrap", gap: 8,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "3px 10px", borderRadius: 999,
                    background: `${T.green}22`, color: T.green, border: `1px solid ${T.green}55`,
                  }}>✓ Masked · {maskedResult.found.length} items</span>
                  <button onClick={copyMasked} style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: "rgba(148,163,184,0.1)", color: T.white,
                    border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>📋 Copy</button>
                </div>
                <pre style={{
                  margin: 0, padding: 14, borderRadius: 10,
                  background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                  color: T.white, fontSize: 13, lineHeight: 1.7,
                  fontFamily: "ui-monospace, Menlo, monospace",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>{maskedResult.masked}</pre>
              </div>
            )}
          </div>
        )}

        {/* IMAGE MODE */}
        {mode === "image" && (
          <div style={{ display: "grid", gap: 16 }}>
            {!imgFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleImage(e.dataTransfer.files[0]); }}
                style={{
                  border: `2px dashed ${T.border}`, borderRadius: 18,
                  background: T.card, padding: "48px 24px", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🪪</div>
                <div style={{ color: T.white, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                  Drop or select Aadhaar / PAN / DL photo
                </div>
                <div style={{ color: T.muted, fontSize: 12, marginBottom: 18 }}>
                  JPG / PNG · Max 10 MB · Never uploaded to our servers
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleImage(e.target.files[0])} style={{ display: "none" }} />
                <button onClick={() => fileRef.current?.click()} style={{
                  padding: "11px 22px", borderRadius: 10,
                  background: T.cyan, color: T.bg, border: 0,
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                  fontFamily: "'Vrikaan Sans', sans-serif",
                }}>📁 Select image</button>
              </div>
            ) : (
              <>
                {/* Side-by-side comparison */}
                <div style={{
                  display: "grid", gridTemplateColumns: maskedImage ? "1fr 1fr" : "1fr",
                  gap: 16,
                }} className="image-grid">
                  {/* Original */}
                  <div style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                    padding: 14, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Original</div>
                    <img src={imgPreview} alt="Original" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8 }} />
                  </div>
                  {/* Masked */}
                  {maskedImage && (
                    <div style={{
                      background: T.card, border: `1px solid ${T.green}55`, borderRadius: 14,
                      padding: 14, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, color: T.green, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>✓ Masked</div>
                      <img src={maskedImage.url} alt="Masked" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8 }} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {!maskedImage && !progress && (
                    <button onClick={runImageMask} style={{
                      padding: "13px 22px", borderRadius: 10,
                      background: T.cyan, color: T.bg, border: 0,
                      fontWeight: 800, fontSize: 14, cursor: "pointer",
                      fontFamily: "'Vrikaan Sans', sans-serif",
                    }}>🔒 Detect & mask</button>
                  )}
                  {progress && progress.stage !== "done" && (
                    <div style={{
                      flex: 1, padding: 14, borderRadius: 10,
                      background: T.card, border: `1px solid ${T.cyan}33`,
                    }}>
                      <div style={{ fontSize: 12, color: T.white, marginBottom: 8, fontWeight: 600 }}>
                        {progress.stage === "load-ocr" ? "Loading OCR engine (one-time, ~5 MB)..."
                          : progress.stage === "ocr" ? `Running OCR... ${progress.pct}%`
                          : progress.stage === "redact" ? "Detecting + redacting..."
                          : progress.stage === "encode" ? "Encoding PNG..."
                          : "Working..."}
                      </div>
                      <div style={{ height: 6, background: "rgba(148,163,184,0.15)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress.pct}%`, background: T.cyan, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  )}
                  {maskedImage && (
                    <button onClick={downloadMasked} style={{
                      padding: "13px 22px", borderRadius: 10,
                      background: T.green, color: T.bg, border: 0,
                      fontWeight: 800, fontSize: 14, cursor: "pointer",
                      fontFamily: "'Vrikaan Sans', sans-serif",
                    }}>💾 Download masked PNG</button>
                  )}
                  <button onClick={() => { setImgFile(null); setImgPreview(null); setMaskedImage(null); setProgress(null); setImgError(""); }} style={{
                    padding: "13px 18px", borderRadius: 10,
                    background: "transparent", color: T.white,
                    border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>🗑 Clear</button>
                </div>

                {imgError && (
                  <div style={{
                    padding: 12, borderRadius: 10,
                    background: `${T.red}1a`, border: `1px solid ${T.red}55`,
                    color: T.red, fontSize: 13,
                  }}>❌ {imgError}</div>
                )}

                {maskedImage && (
                  <div style={{
                    padding: 14, borderRadius: 12,
                    background: T.card, border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                      Detected & redacted ({maskedImage.found.length})
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {maskedImage.found.length === 0 ? (
                        <span style={{ color: T.muted, fontSize: 13 }}>No Aadhaar/PAN/etc. detected in this image. Image returned unmodified (with watermark).</span>
                      ) : maskedImage.found.map((f, i) => (
                        <span key={i} style={{
                          fontSize: 11, fontWeight: 700,
                          padding: "3px 9px", borderRadius: 999,
                          background: `${TYPE_COLORS[f.type]}22`, color: TYPE_COLORS[f.type],
                          border: `1px solid ${TYPE_COLORS[f.type]}55`,
                        }}>{f.label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Why this matters */}
        <section style={{
          marginTop: 60, padding: 26, borderRadius: 18,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 14px" }}>
            Why mask Aadhaar before sharing?
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 14, lineHeight: 1.9 }}>
            <li><strong style={{ color: T.white }}>UIDAI recommends</strong> never sharing full 12-digit Aadhaar — use the masked version (last 4 visible) for KYC where possible.</li>
            <li>Loan fraudsters scrape WhatsApp groups for unmasked Aadhaar to open accounts in YOUR name across NBFCs.</li>
            <li>Aadhaar leaks in 2024 alone exposed <strong style={{ color: T.red }}>815 million Indians' records</strong> on the dark web.</li>
            <li>If you must share, use this tool first. Then send the masked version.</li>
          </ul>
        </section>

        {/* Privacy proof */}
        <p style={{
          marginTop: 28, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🔒 <strong style={{ color: T.white }}>Privacy guaranteed:</strong> all processing runs in your browser via Web Crypto + Tesseract.js OCR.
          We never receive your text, image, or extracted IDs. Check the Network tab — no upload.<br />
          🇮🇳 Built in Nashik · Free forever · No signup · Share with your family
        </p>

        {/* CTA — soft */}
        <div style={{
          marginTop: 28, padding: 20, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`, textAlign: "center",
        }}>
          <div style={{ color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            Worried your Aadhaar already leaked?
          </div>
          <Link to="/dark-web-monitor" style={{
            display: "inline-block", marginTop: 10,
            padding: "10px 22px", borderRadius: 10,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>Check dark web for breaches →</Link>
        </div>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .image-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
