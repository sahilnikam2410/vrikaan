import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LuVenetianMask, LuSend, LuCopy, LuCheck, LuShieldAlert, LuDna,
  LuTriangleAlert, LuUserRound, LuBot,
} from "react-icons/lu";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const T = {
  bg: "#060a14", card: "#0b1220", border: "rgba(148,163,184,0.12)",
  white: "#f1f5f9", muted: "#94a3b8", dim: "#64748b",
  cyan: "#14b8a6", accent: "#6366f1", green: "#22c55e", red: "#ef4444", gold: "#fbbf24",
};

const PERSONAS = [
  { id: "middle-aged person", label: "Confused uncle/aunty" },
  { id: "elderly retired person", label: "Elderly retiree" },
  { id: "busy young professional", label: "Busy professional" },
];

export default function ScamBait() {
  const [messages, setMessages] = useState([]); // {role:"scammer"|"me", text}
  const [draft, setDraft] = useState("");
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [harvest, setHarvest] = useState({ paymentHandles: [], phones: [], urls: [], bankAccounts: [] });
  const [tactic, setTactic] = useState("");
  const [fed, setFed] = useState(false);
  const [copied, setCopied] = useState(-1);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function mergeHarvest(ex) {
    setHarvest((h) => {
      const uniq = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]));
      return {
        paymentHandles: uniq(h.paymentHandles, ex.paymentHandles),
        phones: uniq(h.phones, ex.phones),
        urls: uniq(h.urls, ex.urls),
        bankAccounts: uniq(h.bankAccounts, ex.bankAccounts),
      };
    });
  }

  async function getReply() {
    if (draft.trim().length < 2) { setError("Paste the scammer's message first."); return; }
    setError("");
    const next = [...messages, { role: "scammer", text: draft.trim() }];
    setMessages(next);
    setDraft("");
    setLoading(true);
    try {
      const r = await fetch("/api/tools?tool=scambait", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, persona }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setMessages((m) => [...m, { role: "me", text: d.reply }]);
      if (d.extracted) mergeHarvest(d.extracted);
      if (d.tactic) setTactic(d.tactic);
      if (d.fedScamDna) setFed(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  function copyMsg(text, i) {
    navigator.clipboard?.writeText(text);
    setCopied(i); setTimeout(() => setCopied(-1), 1500);
  }

  const harvestCount = harvest.paymentHandles.length + harvest.phones.length + harvest.urls.length + harvest.bankAccounts.length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="AI Scambaiter — Waste Scammers' Time | VRIKAAN" description="Forward a scammer's message and let VRIKAAN's AI honeypot waste their time and harvest their UPI IDs and scripts — feeding India's live Scam DNA network. It never shares real OTP or money." path="/scambait" />
      <Navbar />
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "100px 20px 80px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.cyan, textTransform: "uppercase" }}>
          <LuVenetianMask size={15} /> Honeypot
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "8px 0 10px", letterSpacing: -1 }}>
          AI <span style={{ color: T.cyan }}>Scambaiter</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 16, maxWidth: 640, lineHeight: 1.6, margin: "0 0 18px" }}>
          Got a scammer texting you? Paste their message. Our AI plays an easy target to <strong style={{ color: T.white }}>waste their time</strong> and quietly harvest their UPI IDs, numbers and script — feeding the <Link to="/scam-dna" style={{ color: T.cyan }}>Scam DNA</Link> network that protects everyone.
        </p>

        {/* Safety banner */}
        <div style={{ background: "rgba(251,191,36,0.08)", border: `1px solid ${T.gold}40`, borderRadius: 12, padding: "13px 16px", marginBottom: 20, fontSize: 13, color: "#fcd34d", display: "flex", gap: 10, lineHeight: 1.5 }}>
          <LuShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>The AI <strong>never</strong> shares a real OTP, PIN or money — it only stalls. You stay safe too: never send real money/OTP yourself, and don't bait people you actually know. This is for unknown scammers only.</span>
        </div>

        {/* Persona */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: T.muted }}>Play as:</span>
          {PERSONAS.map((pp) => (
            <button key={pp.id} onClick={() => setPersona(pp.id)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              background: persona === pp.id ? `${T.cyan}1f` : "transparent",
              border: `1px solid ${persona === pp.id ? T.cyan : T.border}`,
              color: persona === pp.id ? T.cyan : T.muted, fontWeight: 600,
            }}>{pp.label}</button>
          ))}
        </div>

        {/* Harvest panel */}
        {harvestCount > 0 && (
          <div style={{ background: `${T.green}0d`, border: `1px solid ${T.green}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1, color: T.green, textTransform: "uppercase", marginBottom: 10 }}>
              <LuDna size={14} /> Harvested intel{fed && <span style={{ color: T.cyan, fontWeight: 600, letterSpacing: 0, textTransform: "none" }}>· fed to Scam DNA ✓</span>}
            </div>
            {tactic && <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>Scam type: <strong style={{ color: T.white, textTransform: "capitalize" }}>{tactic}</strong></div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[...harvest.paymentHandles, ...harvest.phones, ...harvest.bankAccounts, ...harvest.urls].map((id, i) => (
                <span key={i} style={{ fontSize: 12.5, fontFamily: "'Vrikaan Mono', monospace", padding: "5px 10px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>{id}</span>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, minHeight: 240 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: T.dim, padding: "40px 16px" }}>
              <LuVenetianMask size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
              <p style={{ fontSize: 14 }}>Paste the scammer's first message below to begin.</p>
            </div>
          )}
          <div style={{ display: "grid", gap: 12 }}>
            {messages.map((m, i) => {
              const mine = m.role === "me";
              return (
                <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: mine ? T.cyan : T.red, marginBottom: 4, justifyContent: mine ? "flex-end" : "flex-start", fontWeight: 700 }}>
                      {mine ? <><LuBot size={12} /> AI honeypot</> : <><LuTriangleAlert size={12} /> Scammer</>}
                    </div>
                    <div style={{
                      padding: "11px 14px", borderRadius: 13, fontSize: 14.5, lineHeight: 1.5,
                      background: mine ? `${T.cyan}1a` : "rgba(239,68,68,0.08)",
                      border: `1px solid ${mine ? `${T.cyan}40` : "rgba(239,68,68,0.2)"}`,
                      color: mine ? T.white : "#e2e8f0",
                      borderTopRightRadius: mine ? 4 : 13, borderTopLeftRadius: mine ? 13 : 4,
                    }}>{m.text}</div>
                    {mine && (
                      <button onClick={() => copyMsg(m.text, i)} style={{ marginTop: 5, marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: copied === i ? T.green : T.dim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", float: "right" }}>
                        {copied === i ? <><LuCheck size={13} /> Copied</> : <><LuCopy size={13} /> Copy to send back</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && <div style={{ color: T.dim, fontSize: 13, fontStyle: "italic" }}>AI is crafting a time-wasting reply…</div>}
            <div ref={endRef} />
          </div>
        </div>

        {error && <div style={{ color: T.red, fontSize: 13, marginTop: 10 }}>{error}</div>}

        {/* Input */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "flex-end" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) getReply(); }}
            placeholder="Paste the scammer's latest message…"
            rows={2}
            style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 11, color: T.white, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none" }}
          />
          <button onClick={getReply} disabled={loading} style={{ padding: "13px 18px", borderRadius: 11, border: "none", background: loading ? "rgba(20,184,166,0.4)" : T.cyan, color: "#04110e", fontWeight: 800, fontSize: 14.5, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <LuSend size={16} /> Get reply
          </button>
        </div>
        <p style={{ fontSize: 12, color: T.dim, marginTop: 12 }}>
          Tip: copy the AI's reply, send it to the scammer, then paste their next message here to keep them busy. Their details auto-feed Scam DNA to warn others.
        </p>
      </main>
    </div>
  );
}
