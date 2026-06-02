import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LuTriangleAlert, LuMic, LuActivity, LuDownload, LuX, LuCircleAlert, LuFile, LuList, LuLock, LuCircleCheck } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const STORAGE_KEY = "vrk_voiceprint_v1";

const PROMPTS = [
  "Hello, this is [your name]. The weather in Pune today is calm. My family safe word is [say it].",
  "Today is [day, date]. I'm recording my voice sample for VRIKAAN voiceprint vault.",
  "Three things I'd never say in a scam call: I forgot my safe word · send me OTP · transfer money urgently.",
  "Read aloud: 'monsoon, jalebi, panipuri, mehndi, biryani, kulfi, rangoli.'",
];

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

export default function VoiceprintVault() {
  const [members, setMembers] = useState(() => load());
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Self");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [error, setError] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(0);
  const durationIntervalRef = useRef(null);

  const startRecord = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: pickMimeType() });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        setRecordedBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      };
      rec.start();
      mediaRecRef.current = rec;
      startTimeRef.current = Date.now();
      setRecording(true);
      setRecordedDuration(0);
      durationIntervalRef.current = setInterval(() => {
        const d = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordedDuration(d);
        if (d >= 30) stopRecord(); // hard cap 30s
      }, 250);
    } catch (e) {
      setError("Microphone access denied or unavailable. Allow mic permission in browser settings.");
    }
  };
  const stopRecord = () => {
    if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop();
    setRecording(false);
  };

  const saveMember = async () => {
    if (!name.trim() || !recordedBlob) return;
    // Convert blob → base64 for localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      const next = [
        ...members,
        {
          id: Date.now(),
          name: name.trim(),
          relation,
          audioDataUrl: reader.result,
          duration: recordedDuration,
          recordedAt: Date.now(),
          mimeType: recordedBlob.type,
        },
      ];
      setMembers(next);
      save(next);
      setName(""); setRecordedBlob(null); setRecordedDuration(0);
    };
    reader.readAsDataURL(recordedBlob);
  };

  const removeMember = (id) => {
    const next = members.filter(m => m.id !== id);
    setMembers(next); save(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Voiceprint Family Vault — Reference Audio for Deepfake Detection"
        description="Record your real voice once. Compare against any suspicious call recording later via Deepfake Audio Detector. Stored only in your browser."
        path="/voiceprint"
        keywords="voice clone defense, deepfake voice india, family voice samples, ai voice scam parents"
      />
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20, 184, 166,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>FREE · Mic-only · Stored in your browser</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Your REAL voice<br />
            <span style={{ color: T.cyan }}>as the truth source.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            Record one 20-30 second sample of each family member's voice today. Next time a suspicious
            "Beta, send money urgent" call lands, compare its audio against the real sample via our
            <Link to="/deepfake-audio" style={{ color: T.cyan, marginLeft: 4 }}>Deepfake Audio Detector</Link>.
          </p>
        </header>

        {/* Threat reminder */}
        <div style={{
          padding: 18, borderRadius: 14, marginBottom: 24,
          background: `${T.red}0a`, border: `1px solid ${T.red}33`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: T.red, textTransform: "uppercase", marginBottom: 6 }}>
            <LuTriangleAlert size={13} style={{ verticalAlign: "-2px" }} /> Why pre-record now
          </div>
          <div style={{ color: T.white, fontSize: 14, lineHeight: 1.7 }}>
            AI voice clones built from just 3 seconds of public audio. Mom panics → sends ₹50k. <strong style={{ color: T.cyan }}>Comparing the scam call to your real voice = 95%+ detection.</strong> But you need a real reference. Record once. Use forever.
          </div>
        </div>

        {/* Recording UI */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 22, marginBottom: 18,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 16px" }}>
            <LuMic size={20} style={{ verticalAlign: "-3px" }} /> Record a sample
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="vp-name-row">
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Person's name (e.g. Mummy, Papa)"
              style={inputStyle()}
            />
            <select value={relation} onChange={(e) => setRelation(e.target.value)} style={inputStyle()}>
              {["Self", "Mom", "Dad", "Bhaiya", "Didi", "Bhabhi", "Pati", "Patni", "Beta", "Beti", "Nani", "Nana", "Dadi", "Dada", "Chacha", "Chachi", "Friend", "Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Prompt picker */}
          <div style={{
            padding: 14, borderRadius: 10, marginBottom: 14,
            background: "rgba(2,6,23,0.5)", border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: T.cyan, textTransform: "uppercase", marginBottom: 8 }}>
              Read this aloud (vary tone — happy, urgent, calm)
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {PROMPTS.map((_, i) => (
                <button key={i} onClick={() => setActivePrompt(i)} style={{
                  padding: "4px 10px", borderRadius: 999,
                  background: activePrompt === i ? `${T.cyan}22` : "transparent",
                  color: activePrompt === i ? T.cyan : T.muted,
                  border: `1px solid ${activePrompt === i ? T.cyan : T.border}`,
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>{i + 1}</button>
              ))}
            </div>
            <div style={{ color: T.white, fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
              "{PROMPTS[activePrompt]}"
            </div>
          </div>

          {/* Mic */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {!recording ? (
              <button onClick={startRecord} disabled={!name.trim()} style={{
                padding: "13px 24px", borderRadius: 12,
                background: name.trim() ? T.red : "rgba(148,163,184,0.18)",
                color: name.trim() ? "#fff" : T.muted,
                border: 0, fontWeight: 800, fontSize: 15,
                cursor: name.trim() ? "pointer" : "not-allowed",
                fontFamily: "'Vrikaan Sans', sans-serif",
              }}>● Start recording (max 30s)</button>
            ) : (
              <button onClick={stopRecord} style={{
                padding: "13px 24px", borderRadius: 12,
                background: T.cyan, color: T.bg, border: 0,
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                fontFamily: "'Vrikaan Sans', sans-serif",
              }}>■ Stop · {recordedDuration}s</button>
            )}
            {recording && (
              <div style={{
                padding: "8px 14px", borderRadius: 999,
                background: `${T.red}22`, color: T.red,
                fontSize: 12, fontWeight: 700,
                animation: "pulse 1s infinite",
              }}><LuActivity size={12} style={{ verticalAlign: "-2px" }} /> REC {recordedDuration}s / 30s</div>
            )}
          </div>

          {recordedBlob && !recording && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "rgba(2,6,23,0.5)", border: `1px solid ${T.green}33` }}>
              <div style={{ color: T.green, fontSize: 12, fontWeight: 700, marginBottom: 8 }}><LuCircleCheck size={13} style={{ verticalAlign: "-2px" }} /> Preview ({recordedDuration}s)</div>
              <audio src={URL.createObjectURL(recordedBlob)} controls style={{ width: "100%" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={saveMember} style={{
                  padding: "10px 18px", borderRadius: 10,
                  background: T.green, color: T.bg, border: 0,
                  fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}><LuDownload size={13} style={{ verticalAlign: "-2px" }} /> Save voiceprint</button>
                <button onClick={() => setRecordedBlob(null)} style={{
                  padding: "10px 18px", borderRadius: 10,
                  background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}><LuX size={13} style={{ verticalAlign: "-2px" }} /> Discard, re-record</button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 14, padding: 12, borderRadius: 10,
              background: `${T.red}1a`, border: `1px solid ${T.red}55`,
              color: T.red, fontSize: 13,
            }}><LuCircleAlert size={13} style={{ verticalAlign: "-2px" }} /> {error}</div>
          )}
        </div>

        {/* Stored members */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 20, marginBottom: 24,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
            <LuFile size={18} style={{ verticalAlign: "-3px" }} /> Saved voiceprints ({members.length})
          </h2>
          {members.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>None yet. Record above ↑</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {members.map(m => (
                <div key={m.id} style={{
                  padding: 14, borderRadius: 10,
                  background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.cyan,
                      padding: "3px 8px", borderRadius: 999,
                      background: `${T.cyan}1a`, border: `1px solid ${T.cyan}55`,
                      textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                    }}>{m.relation}</span>
                    <span style={{ color: T.white, fontWeight: 700, flex: 1 }}>{m.name}</span>
                    <span style={{ color: T.muted, fontSize: 11 }}>{m.duration}s · {new Date(m.recordedAt).toLocaleDateString()}</span>
                    <button onClick={() => removeMember(m.id)} style={{ background: "transparent", border: 0, color: T.mutedDark, cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                  <audio src={m.audioDataUrl} controls style={{ width: "100%" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to use */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 24,
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            <LuList size={18} style={{ verticalAlign: "-3px" }} /> How to use these later
          </h3>
          <ol style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li>Record + screenshot the suspicious call (Android: built-in recorder · iOS: Voice Memos w/ speakerphone)</li>
            <li>Open <Link to="/deepfake-audio" style={{ color: T.cyan }}>Deepfake Audio Detector</Link></li>
            <li>Upload the suspicious recording AND a reference voiceprint from above</li>
            <li>AI compares acoustic fingerprints + flags clone probability</li>
          </ol>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          <LuLock size={13} style={{ verticalAlign: "-2px" }} /> All recordings encoded as base64 in your browser's localStorage. Never uploaded. Clear browser data → samples gone.
          Recommendation: download local backup ZIP every 6 months.<br/>
          🇮🇳 Built in Pune · Free forever
        </p>
      </main>

      <Footer />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 720px) {
          .vp-name-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function pickMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "audio/webm";
}
function inputStyle() {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
    color: T.white, fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
}
