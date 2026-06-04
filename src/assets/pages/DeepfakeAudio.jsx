import { useState, useRef } from "react";
import ToolShell from "../../components/ToolShell";
import { LuAudioLines, LuCircleCheck, LuActivity, LuTriangleAlert, LuCircleHelp } from "react-icons/lu";

const T = { bg: "#060a14", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14b8a6", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

const VERDICT_META = {
  "likely-real":     { color: T.green,  Icon: LuCircleCheck,    label: "Liveness cues present — likely real (not a guarantee)" },
  "likely-deepfake": { color: T.red,    Icon: LuActivity,       label: "Likely AI-generated / deepfake" },
  "scam-script":     { color: T.red,    Icon: LuTriangleAlert,  label: "Scam call script detected" },
  "uncertain":       { color: T.yellow, Icon: LuCircleHelp,     label: "Uncertain — be cautious" },
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB raw

// Convert a File to a base64 string (no data: prefix).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DeepfakeAudio() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const onSelect = (f) => {
    setError(""); setResult(null);
    if (!f) return;
    if (!f.type.startsWith("audio/")) { setError("Please select an audio file (MP3, WAV, M4A, OGG)."); return; }
    if (f.size > MAX_BYTES) { setError(`File too large. Max ${MAX_BYTES / 1024 / 1024} MB.`); return; }
    setFile(f);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(f));
  };

  const run = async () => {
    if (!file) { setError("Pick an audio file first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const audioBase64 = await fileToBase64(file);
      const r = await fetch("/api/tools?tool=deepfake-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: file.type, transcript }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null); setAudioUrl(""); setTranscript(""); setResult(null); setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const meta = result ? (VERDICT_META[result.verdict] || VERDICT_META.uncertain) : null;

  return (
    <ToolShell
      route="/deepfake-audio" eyebrow="AI Audio Tool"
      title="Deepfake & Vishing" titleAccent="Audio Detector"
      subtitle="Upload a phone-call recording (≤ 5 MB). AI listens for AI-generated voice, urgency scripts, and common Indian vishing patterns — fake bank, fake tax officer, fake police, fake courier."
      width={760}
      seoTitle="Deepfake / Vishing Audio Detector — VRIKAAN"
      seoDesc="Upload a suspicious phone-call recording. AI analyzes it for synthetic voice, vishing scripts, and India-specific scam patterns."
      path="/deepfake-audio"
      footer
    >

        {/* File input */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); onSelect(e.dataTransfer.files?.[0]); }}
          style={{
            background: T.card,
            border: `2px dashed ${file ? T.cyan : T.border}`,
            borderRadius: 14,
            padding: file ? "20px 24px" : "40px 24px",
            cursor: "pointer",
            marginBottom: 20,
            transition: "all 0.2s",
            textAlign: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            style={{ display: "none" }}
            onChange={(e) => onSelect(e.target.files?.[0])}
          />
          {!file && (
            <>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><LuAudioLines size={36} color={T.cyan} /></div>
              <p style={{ color: T.white, margin: "0 0 4px", fontWeight: 600 }}>Drop an audio file here, or click to browse</p>
              <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>MP3 · WAV · M4A · OGG · max 5 MB</p>
            </>
          )}
          {file && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
              <div style={{ display: "flex" }}><LuAudioLines size={32} color={T.cyan} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ color: T.white, margin: 0, fontWeight: 600, fontSize: 14 }}>{file.name}</p>
                <p style={{ color: T.muted, fontSize: 11, margin: "2px 0 0" }}>{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); reset(); }} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, cursor: "pointer" }}>Remove</button>
            </div>
          )}
        </div>

        {/* Audio preview */}
        {audioUrl && (
          <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 16 }} />
        )}

        {/* Optional transcript */}
        {file && !result && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: T.muted, fontSize: 12, display: "block", marginBottom: 6 }}>
              Optional transcript (helps the AI; auto-generated if blank)
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              placeholder="Paste what was said, if you remember…"
              style={{
                width: "100%", padding: 12, borderRadius: 10,
                background: T.card, border: `1px solid ${T.border}`,
                color: T.white, fontSize: 13, fontFamily: "'Vrikaan Sans'",
                resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={run} disabled={loading || !file} style={{
            flex: 1, padding: "14px 24px", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 700,
            background: loading || !file ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            color: "#fff", cursor: loading || !file ? "not-allowed" : "pointer",
            fontFamily: "'Vrikaan Sans', sans-serif",
          }}>{loading ? "Analyzing audio…" : "Analyze for deepfake / vishing"}</button>
        </div>

        {error && (
          <div style={{ padding: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: T.red, fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {/* Result */}
        {result && meta && (
          <div style={{ background: T.card, border: `2px solid ${meta.color}40`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${T.border}` }}>
              <meta.Icon size={48} color={meta.color} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h2 style={{ color: meta.color, fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'Vrikaan Sans', sans-serif" }}>{meta.label}</h2>
                <p style={{ color: T.muted, fontSize: 12, margin: "4px 0 0" }}>
                  Risk score: <span style={{ color: meta.color, fontWeight: 700 }}>{result.score}/100</span>
                  {result.scamCategory && result.scamCategory !== "none" && <> · Category: <span style={{ color: T.white, fontWeight: 600 }}>{result.scamCategory}</span></>}
                </p>
              </div>
            </div>

            {/* Indicators */}
            {result.indicators?.length > 0 && (
              <>
                <h3 style={{ color: T.cyan, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>What the AI heard</h3>
                <ul style={{ margin: "0 0 18px", paddingLeft: 20, color: T.white, fontSize: 13, lineHeight: 1.7 }}>
                  {result.indicators.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </>
            )}

            {/* Transcript */}
            {result.transcript && (
              <details style={{ marginBottom: 18 }}>
                <summary style={{ color: T.cyan, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Transcript</summary>
                <div style={{ marginTop: 8, padding: 12, background: "rgba(3,7,18,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {result.transcript}
                </div>
              </details>
            )}

            {/* Advice */}
            {result.advice?.length > 0 && (
              <>
                <h3 style={{ color: T.green, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>What to do</h3>
                <ul style={{ margin: "0 0 18px", paddingLeft: 20, color: T.white, fontSize: 13, lineHeight: 1.7 }}>
                  {result.advice.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </>
            )}

            <p style={{ color: T.muted, fontSize: 11, marginTop: 18, fontStyle: "italic" }}>
              Important: acoustic deepfake detection is NOT reliable for high-quality AI voice (ElevenLabs-class TTS sounds fully natural, with breaths). A "likely real" result does not prove a human spoke. This tool is strongest at catching scam-call scripts (urgency, OTP/UPI requests, fake bank/police). Educational use only — never share OTPs or transfer money based on a call; always verify by dialing the official number from your bank's website.
            </p>
          </div>
        )}
    </ToolShell>
  );
}
