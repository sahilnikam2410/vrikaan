import { useState, useEffect } from "react";
import {
  LuDna, LuShieldAlert, LuTriangleAlert, LuShieldCheck, LuSearch, LuUsers,
  LuClock, LuBanknote, LuActivity, LuFlame, LuCircleAlert, LuChevronRight,
} from "react-icons/lu";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/apiFetch";
import { Section, PageHero, Card, Button, Textarea, Badge, T, alpha } from "../../components/ui";

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
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Scam DNA — India's Live Scam-Intelligence Network | VRIKAAN" description="Paste any suspicious SMS, WhatsApp or UPI message. VRIKAAN fingerprints it and checks it against a live, crowdsourced India scam network — see how many people got the same scam in real time." path="/scam-dna" />
      <Navbar />
      <Section width={880} style={{ paddingTop: 100 }}>
        <PageHero
          eyebrow="Live community network" icon={<LuDna size={14} />}
          title={<>Scam <span style={{ color: T.cyan }}>DNA</span></>}
          subtitle="Paste any suspicious SMS, WhatsApp or UPI message. VRIKAAN fingerprints it and checks it against a live, crowdsourced India scam network — instantly see if others are getting the exact same scam. Every check makes everyone safer."
        />

        {/* Input */}
        <Card>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
            placeholder="Paste the message here — e.g. 'Your KYC expires today, update at bit.ly/... or call 90xxxxxxx and share OTP'" />
          {error && <div style={{ color: T.red, fontSize: 13, marginTop: 10 }}>{error}</div>}
          <Button onClick={() => check(false)} loading={loading} icon={<LuSearch size={18} />}
            style={{ marginTop: 14, width: "100%" }}>
            {loading ? "Checking the network…" : "Check against the network"}
          </Button>
        </Card>

        {/* Result */}
        {v && result && (
          <Card accent={v.c} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 13, background: alpha(v.c, 0.12), color: v.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <v.Icon size={26} />
              </span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: v.c }}>{v.label} · {result.riskScore}/100</div>
                <div style={{ fontSize: 13, color: T.muted, textTransform: "capitalize" }}>{result.category?.replace(/-/g, " ")}{result.tactic ? ` · ${result.tactic}` : ""}</div>
              </div>
            </div>

            {/* Community intel */}
            <div style={{ background: alpha(T.accent, 0.06), border: `1px solid ${alpha(T.accent, 0.2)}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1, color: T.accent, textTransform: "uppercase", marginBottom: 10, flexWrap: "wrap" }}>
                <LuUsers size={14} /> Community intelligence
                {result.community?.verified && <Badge tone={T.green} icon={<LuShieldCheck size={12} />} style={{ letterSpacing: 0, textTransform: "none" }}>Known scam · VRIKAAN verified</Badge>}
              </div>
              {result.community?.isNew ? (
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.6 }}>
                  <LuFlame size={16} color={T.orange} style={{ verticalAlign: "-3px" }} /> <strong>First sighting.</strong> You're the first to report this one — it's now protecting everyone else.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <IntelRow Icon={LuActivity} c={T.red} label="Times reported" value={`${result.community.seenCount}×`} sub={`matched by ${result.matchedBy}`} />
                  <IntelRow Icon={LuClock} c={T.cyan} label="First seen" value={result.community.firstSeen ? ago(result.community.firstSeen) : "today"} sub={`last seen ${ago(result.community.lastSeen)}`} />
                  {result.community.lossCount > 0 && (
                    <IntelRow Icon={LuBanknote} c={T.gold} label="Reported money lost" value={`${result.community.lossCount} ${result.community.lossCount === 1 ? "person" : "people"}`} sub={result.community.lossTotal > 0 ? `≈ ₹${result.community.lossTotal.toLocaleString("en-IN")} total` : "amounts not shared"} />
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
                    <span key={i} style={{ fontSize: 12.5, fontFamily: "'Vrikaan Mono', monospace", padding: "5px 10px", borderRadius: 8, background: alpha(T.red, 0.1), border: `1px solid ${alpha(T.red, 0.25)}`, color: "#fca5a5" }}>{id}</span>
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

            {/* Family mesh */}
            {inFamily && (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 14 }}>
                {familyAlerted ? (
                  <div style={{ fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 7 }}>
                    <LuUsers size={15} /> Your family has been alerted — they'll see a heads-up to stay safe.
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: T.muted }}>Protect your family from this one?</span>
                    <Button variant="secondary" size="sm" onClick={alertFamily} icon={<LuUsers size={15} />} style={{ color: T.cyan, borderColor: alpha(T.cyan, 0.35) }}>Alert my family</Button>
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
                  <Button variant="secondary" size="sm" onClick={() => check(true, 0)} disabled={loading} style={{ color: T.gold, borderColor: alpha(T.gold, 0.35) }}>I lost money to this</Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Live feed */}
        {feed.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px" }}>
              <LuFlame size={20} color={T.orange} /> Circulating in India now
            </h2>
            <div style={{ display: "grid", gap: 8 }}>
              {feed.map((f) => (
                <Card key={f.id} hover padding={0} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 9, background: alpha(T.red, 0.12), color: T.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LuTriangleAlert size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
                      {(f.category || "scam").replace(/-/g, " ")}{f.tactic ? ` — ${f.tactic}` : ""}
                      {f.verified && <LuShieldCheck size={13} color={T.green} />}
                    </div>
                    <div style={{ fontSize: 12, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.sample}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: T.red }}>{f.count}×</div>
                    <div style={{ fontSize: 11, color: T.dim }}>{ago(f.lastSeen)}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: T.dim, marginTop: 28, lineHeight: 1.6 }}>
          Privacy: only the scam fingerprint (tactic, scammer UPI/phone/link) is stored to warn others — never your personal info. The more people check, the smarter the network gets.
        </p>
      </Section>
    </div>
  );
}

function IntelRow({ Icon, c, label, value, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: alpha(c, 0.11), color: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={17} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{value} <span style={{ fontSize: 12.5, fontWeight: 500, color: T.muted }}>{label}</span></div>
        {sub && <div style={{ fontSize: 12, color: T.dim }}>{sub}</div>}
      </div>
    </div>
  );
}
