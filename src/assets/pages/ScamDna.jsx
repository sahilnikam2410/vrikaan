import { useState, useEffect } from "react";
import {
  LuDna, LuShieldAlert, LuTriangleAlert, LuShieldCheck, LuSearch, LuUsers,
  LuClock, LuBanknote, LuActivity, LuFlame, LuCircleAlert,
} from "react-icons/lu";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/apiFetch";

const T = {
  bg: "#060a14", card: "#0b1220", border: "rgba(148,163,184,0.12)",
  white: "#f1f5f9", muted: "#94a3b8", dim: "#64748b",
  cyan: "#14b8a6", accent: "#6366f1", green: "#22c55e", red: "#ef4444", gold: "#fbbf24", orange: "#ff7a45",
};

const VERDICT = {
  "scam": { c: T.red, Icon: LuShieldAlert, label: "Scam" },
  "likely-scam": { c: T.red, Icon: LuTriangleAlert, label: "Likely scam" },
  "suspicious": { c: T.gold, Icon: LuCircleAlert, label: "Suspicious" },
  "probably-safe": { c: T.green, Icon: LuShieldCheck, label: "Probably safe" },
};

function ago(ms) {
  if (!ms) return "just now";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ScamDna() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [feed, setFeed] = useState([]);
  const [lossSent, setLossSent] = useState(false);
  const [familyAlerted, setFamilyAlerted] = useState(false);
  const inFamily = !!(user && (user.familyRole || user.plan === "family" || user.currentFamilyId));

  async function alertFamily() {
    if (!result) return;
    try {
      const r = await apiFetch("/api/tools?tool=family-alert", {
        method: "POST",
        body: JSON.stringify({ category: result.category, tactic: result.tactic, sample: text, sigId: result.sigId }),
      });
      if (r.ok) setFamilyAlerted(true);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadFeed(); }, []);
  async function loadFeed() {
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feed" }),
      });
      const d = await r.json();
      if (Array.isArray(d.items)) setFeed(d.items);
    } catch { /* ignore */ }
  }

  async function check(lostMoney = false, amount = 0) {
    if (text.trim().length < 8) { setError("Paste the suspicious message first (a bit longer)."); return; }
    setLoading(true); setError(""); if (!lostMoney) { setResult(null); setLossSent(false); setFamilyAlerted(false); }
    try {
      const r = await fetch("/api/tools?tool=scam-dna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", text, lostMoney, amount }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Check failed");
      setResult(d);
      if (lostMoney) setLossSent(true);
      loadFeed();
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  const v = result ? (VERDICT[result.verdict] || VERDICT.suspicious) : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Scam DNA — India's Live Scam-Intelligence Network | VRIKAAN" description="Paste any suspicious SMS, WhatsApp or UPI message. VRIKAAN fingerprints it and checks it against a live, crowdsourced India scam network — see how many people got the same scam in real time." path="/scam-dna" />
      <Navbar />
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "100px 20px 80px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.cyan, textTransform: "uppercase" }}>
          <LuDna size={14} /> Live community network
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "8px 0 10px", letterSpacing: -1 }}>
          Scam <span style={{ color: T.cyan }}>DNA</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 16, maxWidth: 640, lineHeight: 1.6, margin: "0 0 28px" }}>
          Paste any suspicious SMS, WhatsApp or UPI message. VRIKAAN fingerprints it and checks it against a
          <strong style={{ color: T.white }}> live, crowdsourced India scam network</strong> — instantly see if others are getting the exact same scam right now. Every check makes everyone safer.
        </p>

        {/* Input */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the message here — e.g. 'Your KYC expires today, update at bit.ly/... or call 90xxxxxxx and share OTP'"
            rows={5}
            style={{ width: "100%", background: "rgba(2,6,23,0.5)", border: `1px solid ${T.border}`, borderRadius: 11, color: T.white, padding: "14px 16px", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
          {error && <div style={{ color: T.red, fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button onClick={() => check(false)} disabled={loading} style={{ marginTop: 14, width: "100%", padding: "14px", borderRadius: 11, border: "none", background: loading ? "rgba(20,184,166,0.4)" : T.cyan, color: "#04110e", fontWeight: 800, fontSize: 15.5, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LuSearch size={18} /> {loading ? "Checking the network…" : "Check against the network"}
          </button>
        </div>

        {/* Result */}
        {v && result && (
          <div style={{ background: T.card, border: `1px solid ${v.c}44`, borderRadius: 16, padding: 24, marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 13, background: `${v.c}1f`, color: v.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <v.Icon size={26} />
              </span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: v.c }}>{v.label} · {result.riskScore}/100</div>
                <div style={{ fontSize: 13, color: T.muted, textTransform: "capitalize" }}>{result.category?.replace(/-/g, " ")}{result.tactic ? ` · ${result.tactic}` : ""}</div>
              </div>
            </div>

            {/* Community intel — the killer feature */}
            <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}33`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1, color: T.accent, textTransform: "uppercase", marginBottom: 10, flexWrap: "wrap" }}>
                <LuUsers size={14} /> Community intelligence
                {result.community?.verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, letterSpacing: 0, textTransform: "none", padding: "2px 8px", borderRadius: 999, background: `${T.green}1f`, border: `1px solid ${T.green}55`, color: T.green, fontSize: 11 }}>
                    <LuShieldCheck size={12} /> Known scam · VRIKAAN verified
                  </span>
                )}
              </div>
              {result.community?.isNew ? (
                <div style={{ fontSize: 15, color: T.white, lineHeight: 1.6 }}>
                  <LuFlame size={16} color={T.orange} style={{ verticalAlign: "-3px" }} /> <strong>First sighting.</strong> You're the first to report this one — it's now in the network protecting everyone else.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <Stat Icon={LuActivity} c={T.red} label="Times reported" value={`${result.community.seenCount}×`} sub={`matched by ${result.matchedBy}`} />
                  <Stat Icon={LuClock} c={T.cyan} label="First seen" value={result.community.firstSeen ? ago(result.community.firstSeen) : "today"} sub={`last seen ${ago(result.community.lastSeen)}`} />
                  {result.community.lossCount > 0 && (
                    <Stat Icon={LuBanknote} c={T.gold} label="Reported money lost" value={`${result.community.lossCount} ${result.community.lossCount === 1 ? "person" : "people"}`} sub={result.community.lossTotal > 0 ? `≈ ₹${result.community.lossTotal.toLocaleString("en-IN")} total` : "amounts not shared"} />
                  )}
                </div>
              )}
            </div>

            {/* Extracted identifiers */}
            {(result.extracted?.paymentHandles?.length || result.extracted?.phones?.length || result.extracted?.urls?.length) ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 8 }}>Extracted scammer identifiers</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[...(result.extracted.paymentHandles || []), ...(result.extracted.phones || []), ...(result.extracted.urls || [])].map((id, i) => (
                    <span key={i} style={{ fontSize: 12.5, fontFamily: "'Vrikaan Mono', monospace", padding: "5px 10px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>{id}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Advice */}
            {result.advice?.length > 0 && (
              <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {result.advice.map((a, i) => (
                  <li key={i} style={{ display: "flex", gap: 9, fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>
                    <LuShieldCheck size={16} color={T.cyan} style={{ flexShrink: 0, marginTop: 2 }} /> {a}
                  </li>
                ))}
              </ul>
            )}

            {/* Family mesh — warn the whole family */}
            {inFamily && (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 14 }}>
                {familyAlerted ? (
                  <div style={{ fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 7 }}>
                    <LuUsers size={15} /> Your family has been alerted — they'll see a heads-up to stay safe.
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: T.muted }}>Protect your family from this one?</span>
                    <button onClick={alertFamily} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, border: `1px solid ${T.cyan}55`, background: `${T.cyan}15`, color: T.cyan, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      <LuUsers size={15} /> Alert my family
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Contribute loss */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
              {lossSent ? (
                <div style={{ fontSize: 13, color: T.green }}>Thank you — your report strengthens the network for everyone.</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: T.muted }}>Did this scam cost you money?</span>
                  <button onClick={() => check(true, 0)} disabled={loading} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${T.gold}55`, background: `${T.gold}15`, color: T.gold, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    I lost money to this
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live feed */}
        {feed.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px" }}>
              <LuFlame size={20} color={T.orange} /> Circulating in India now
            </h2>
            <div style={{ display: "grid", gap: 8 }}>
              {feed.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 11 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(239,68,68,0.12)", color: T.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LuTriangleAlert size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
                      {(f.category || "scam").replace(/-/g, " ")}{f.tactic ? ` — ${f.tactic}` : ""}
                      {f.verified && <LuShieldCheck size={13} color={T.green} title="VRIKAAN verified" />}
                    </div>
                    <div style={{ fontSize: 12, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.sample}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: T.red }}>{f.count}×</div>
                    <div style={{ fontSize: 11, color: T.dim }}>{ago(f.lastSeen)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: T.dim, marginTop: 28, lineHeight: 1.6 }}>
          Privacy: only the scam fingerprint (tactic, scammer UPI/phone/link) is stored to warn others — never your personal info. The more people check, the smarter the network gets.
        </p>
      </main>
    </div>
  );
}

function Stat({ Icon, c, label, value, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: `${c}1c`, color: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={17} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{value} <span style={{ fontSize: 12.5, fontWeight: 500, color: T.muted }}>{label}</span></div>
        {sub && <div style={{ fontSize: 12, color: T.dim }}>{sub}</div>}
      </div>
    </div>
  );
}
