import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import {
  LuStar, LuTriangleAlert, LuShield, LuLock, LuEye, LuCircleCheck, LuX,
  LuMessageSquare, LuMic, LuInfo, LuZap,
} from "react-icons/lu";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const STORAGE_KEY = "vrk_safeword_v1";

// Suggested random safe-words (Indian context — easy to remember, hard to guess)
const SUGGESTIONS = [
  "monsoon", "jalebi", "chai", "rangoli", "panipuri", "kulfi",
  "diya", "saraswati", "ganga", "himalaya", "marigold", "neem",
  "tabla", "sitar", "mehndi", "biryani", "samosa", "dosa",
];

const RELATIONS = [
  "Mom", "Dad", "Bhaiya", "Didi", "Bhabhi", "Bhanjee", "Mama", "Mami",
  "Chacha", "Chachi", "Tau", "Tai", "Nani", "Nana", "Dadi", "Dada",
  "Pati", "Patni", "Beta", "Beti", "Son", "Daughter", "Friend", "Other",
];

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export default function SafeWordVault() {
  const [data, setData] = useState(() => load());
  const [showWord, setShowWord] = useState(false);
  const [editing, setEditing] = useState(!load().word);

  // Form state
  const [word, setWord] = useState(data.word || "");
  const [members, setMembers] = useState(data.members || []);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRel, setNewMemberRel] = useState("Mom");

  const persist = () => {
    const next = { word: word.trim().toLowerCase(), members, createdAt: data.createdAt || Date.now() };
    setData(next);
    save(next);
    setEditing(false);
  };

  const reset = () => {
    setData({});
    setWord("");
    setMembers([]);
    setEditing(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setMembers(prev => [...prev, { id: Date.now(), name: newMemberName.trim(), relation: newMemberRel }]);
    setNewMemberName("");
  };

  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  const suggestRandom = () => setWord(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);

  const shareFamily = (member) => {
    const text = `🛡️ Family Safe-Word Alert\n\n` +
      `${member.name}, our family safe-word is set. If anyone EVER calls you sounding like me asking for money urgently:\n\n` +
      `1. Ask: "What is our safe-word?"\n` +
      `2. Real me will answer correctly.\n` +
      `3. Voice-clone scammer cannot. Hang up + call me on my saved number.\n\n` +
      `This is from VRIKAAN's free Family Safe-Word Vault: vrikaan.com/safe-word\n\n` +
      `(Do NOT share the actual safe-word in this message. Tell ${member.name} the word in person or via voice call only.)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const wordStrength = useMemo(() => {
    if (!word) return null;
    if (word.length < 4) return { label: "TOO SHORT", color: T.red };
    if (/^\d+$/.test(word)) return { label: "WEAK (numbers only)", color: T.red };
    if (/^[a-z]+$/i.test(word) && word.length >= 6) return { label: "STRONG", color: T.green };
    if (word.length >= 4) return { label: "OK", color: T.yellow };
    return { label: "WEAK", color: T.orange };
  }, [word]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Family Safe-Word Vault — Beat AI Voice Clones"
        description="Set a family safe-word that AI voice clones can't fake. India's #1 defense against deepfake-voice scams targeting parents and grandparents. Free, no signup, stored on your device."
        path="/safe-word"
        keywords="family safe word, voice clone scam, ai voice scam india, deepfake voice defense, vishing protection, parent scam india"
      />
      <Navbar />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20, 184, 166,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}><LuStar size={13} style={{ verticalAlign: "-2px" }} /> FREE · India-First · Stored On Device</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Beat AI voice clones with<br />
            <span style={{ color: T.cyan }}>one shared family word.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            Scammers use 3 seconds of your voice from Instagram to clone you, then call your mom asking for ₹50k.
            <strong style={{ color: T.white }}> One pre-agreed family word stops them dead.</strong> Set it now, share via WhatsApp.
          </p>
        </header>

        {/* Threat explainer */}
        <div style={{
          padding: 18, borderRadius: 14, marginBottom: 24,
          background: `${T.red}0a`, border: `1px solid ${T.red}33`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: T.red, textTransform: "uppercase", marginBottom: 6,
          }}><LuTriangleAlert size={13} style={{ verticalAlign: "-2px" }} /> THE 2026 SCAM YOU HAVEN'T SEEN YET</div>
          <div style={{ color: T.white, fontSize: 14, lineHeight: 1.7 }}>
            Mom's phone rings. A voice exactly like yours (cloned from your Insta reel) cries:
            <em style={{ color: T.muted }}> "Mummy, accident ho gaya, ₹50k bhejo iss UPI pe, please jaldi…"</em>
            <br/><br/>
            Mom panics. Sends. Money gone. <strong style={{ color: T.red }}>This happened to 11,000 families in India last year alone.</strong>
            <br/><br/>
            <strong style={{ color: T.cyan }}>Defense:</strong> Mom asks "What's our safe-word?" Real you knows. AI clone doesn't. Hang up.
          </div>
        </div>

        {/* VAULT — either edit or display */}
        {editing ? (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 18px" }}>
              {data.word ? "Edit your family safe-word" : "Set your family safe-word"}
            </h2>

            {/* Word */}
            <Field label="Safe-word (4+ letters, easy to remember in voice call)">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text" value={word}
                  onChange={(e) => setWord(e.target.value.toLowerCase().replace(/[^a-z0-9 ]/g, ""))}
                  placeholder="e.g. monsoon"
                  style={{
                    flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10,
                    background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                    color: T.white, fontSize: 18, fontWeight: 700, outline: "none",
                    fontFamily: "ui-monospace, Menlo, monospace", letterSpacing: 2,
                  }}
                  maxLength={20}
                />
                <button onClick={suggestRandom} style={btnGhost()}><LuZap size={13} style={{ verticalAlign: "-2px" }} /> Random</button>
                {wordStrength && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: wordStrength.color,
                    padding: "5px 10px", borderRadius: 999,
                    background: `${wordStrength.color}1a`, border: `1px solid ${wordStrength.color}55`,
                    textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                  }}>{wordStrength.label}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
                <LuInfo size={13} style={{ verticalAlign: "-2px" }} /> Pick something specific to your family — a nickname, your dog's name, a place you all visited.
                Avoid things on your social media (anniversary date, kid's name, etc.).
              </div>
            </Field>

            {/* Members */}
            <Field label="Family members who'll know this word">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {members.map(m => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.cyan,
                      padding: "3px 8px", borderRadius: 999,
                      background: `${T.cyan}1a`, border: `1px solid ${T.cyan}55`,
                      textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                    }}>{m.relation}</span>
                    <span style={{ flex: 1, color: T.white, fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                    <button onClick={() => removeMember(m.id)} style={{
                      background: "transparent", border: 0, color: T.mutedDark, cursor: "pointer", fontSize: 18,
                    }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8 }} className="member-form">
                <select value={newMemberRel} onChange={(e) => setNewMemberRel(e.target.value)} style={inputStyle()}>
                  {RELATIONS.map(r => <option key={r}>{r}</option>)}
                </select>
                <input
                  type="text" value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                  placeholder="Their name (e.g. Sushma)"
                  style={inputStyle()}
                />
                <button onClick={addMember} style={btnPrimary()}>+ Add</button>
              </div>
            </Field>

            <button onClick={persist} disabled={!word.trim() || word.trim().length < 4} style={{
              padding: "13px 26px", borderRadius: 12,
              background: word.trim().length >= 4 ? T.cyan : "rgba(148,163,184,0.18)",
              color: word.trim().length >= 4 ? T.bg : T.muted,
              border: 0, fontWeight: 800, fontSize: 15,
              cursor: word.trim().length >= 4 ? "pointer" : "not-allowed",
              fontFamily: "'Vrikaan Sans', sans-serif", width: "100%", marginTop: 10,
            }}><LuLock size={15} style={{ verticalAlign: "-2px" }} /> Save safe-word</button>

            <div style={{ fontSize: 11, color: T.muted, marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
              Saved in YOUR browser only (localStorage). We never see this word.
            </div>
          </div>
        ) : (
          <div style={{
            background: `linear-gradient(135deg, ${T.cyan}1a, ${T.accent}1a)`,
            border: `2px solid ${T.cyan}55`, borderRadius: 18, padding: 26,
            marginBottom: 24, textAlign: "center",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.cyan, textTransform: "uppercase", marginBottom: 12,
            }}>✓ YOUR FAMILY SAFE-WORD</div>
            <div style={{
              fontSize: 48, fontWeight: 800, color: T.white,
              fontFamily: "ui-monospace, Menlo, monospace", letterSpacing: 4,
              padding: "10px 24px", borderRadius: 14,
              background: "rgba(2,6,23,0.6)",
              marginBottom: 14, wordBreak: "break-all",
              filter: showWord ? "none" : "blur(12px)",
              transition: "filter 0.3s", userSelect: showWord ? "text" : "none",
              cursor: "pointer",
            }}
            onClick={() => setShowWord(s => !s)}
            >{data.word.toUpperCase()}</div>
            <button onClick={() => setShowWord(s => !s)} style={btnGhost()}>
              <LuEye size={13} style={{ verticalAlign: "-2px" }} /> {showWord ? "Hide" : "Reveal"}
            </button>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
              <button onClick={() => setEditing(true)} style={btnSecondary()}>Edit</button>
              <button onClick={reset} style={{ ...btnSecondary(), color: T.red, borderColor: `${T.red}55` }}><LuX size={13} style={{ verticalAlign: "-2px" }} /> Reset all</button>
            </div>
          </div>
        )}

        {/* Members + share */}
        {!editing && members.length > 0 && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
            marginBottom: 24,
          }}>
            <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
              📲 Send the briefing to each family member
            </h3>
            <p style={{ color: T.muted, fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
              One-tap WhatsApp share. The message explains the safe-word concept WITHOUT revealing the actual word
              — you'll tell them the word in person or voice call. Safer that way (text logs can be stolen).
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {members.map(m => (
                <div key={m.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                }}>
                  <div>
                    <span style={{ color: T.cyan, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginRight: 8, fontFamily: "ui-monospace, monospace" }}>{m.relation}</span>
                    <span style={{ color: T.white, fontWeight: 600 }}>{m.name}</span>
                  </div>
                  <button onClick={() => shareFamily(m)} style={{
                    padding: "8px 14px", borderRadius: 8,
                    background: "#25D366", color: "#fff", border: 0,
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Vrikaan Sans', sans-serif",
                  }}>📲 Send briefing</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to use */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 24,
          background: T.card, border: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
            🎯 How the safe-word works in a scam call
          </h3>
          <ol style={{ margin: 0, paddingLeft: 22, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li><strong style={{ color: T.white }}>Scammer calls relative</strong> sounding exactly like you (AI voice clone). Says urgent — accident, hospital, jail, ransom — needs money NOW.</li>
            <li><strong style={{ color: T.cyan }}>Relative asks: "What's our safe-word?"</strong> (Calm, ONE question.)</li>
            <li><strong>Real you</strong> answers correctly without thinking.<br/><strong style={{ color: T.red }}>AI clone</strong> doesn't know it. Will dodge, change subject, get angry, or hang up.</li>
            <li>If wrong/dodged → hang up. Call your real number from contacts. Confirm directly.</li>
            <li>If scammer hung up → still call your real number. Tell family. Report at 1930.</li>
          </ol>
        </div>

        {/* Rules of a good safe-word */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 24,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 14px" }}>
            ✅ Rules of a good safe-word
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="rules-grid">
            <div>
              <div style={{ color: T.green, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>✓ DO</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Pick a real word (easy to remember in panic)</li>
                <li>4-8 letters (easy to ask in voice)</li>
                <li>Specific to your family memory</li>
                <li>Change every 6 months</li>
                <li>Share only in person or voice call</li>
              </ul>
            </div>
            <div>
              <div style={{ color: T.red, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>❌ DON'T</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Birth dates, anniversaries (on social media)</li>
                <li>Names of family members, pets (on social)</li>
                <li>Random number strings (forgotten under panic)</li>
                <li>Share in WhatsApp/SMS (logs leak)</li>
                <li>Reuse a password as safe-word</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related */}
        <div style={{
          padding: 20, borderRadius: 14, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Already got a suspicious call? Check the audio for AI voice-clone signs.
          </div>
          <Link to="/deepfake-audio" style={{
            display: "inline-block",
            padding: "11px 22px", borderRadius: 10,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>🎙 Deepfake Audio Detector →</Link>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🔒 Safe-word + family list stored ONLY in your browser localStorage. Nothing uploaded to VRIKAAN servers.
          Clear browser data → safe-word gone. <br />
          🇮🇳 Built by SOC analysts in Nashik · Free forever · Share with every family in India
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .member-form { grid-template-columns: 1fr !important; }
          .rules-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
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
    padding: "11px 18px", borderRadius: 10,
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
