import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, setDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { LuKey, LuPlus, LuCopy, LuTrash2, LuCheck, LuTriangleAlert } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, Button, T, alpha } from "../../components/ui";

function genToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return "vrk_" + Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default function ApiKeys() {
  const { user } = useAuth();
  const plan = user?.plan || "free";
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useState(null); // newly created full token (shown once)
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "apikeys"));
      setKeys(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)));
    } catch { setKeys([]); }
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!user || creating) return;
    setCreating(true);
    try {
      const token = genToken();
      const batch = writeBatch(db);
      // server-validated mirror (doc id = the secret token)
      batch.set(doc(db, "api_tokens", token), { uid: user.uid, plan, active: true, createdAt: serverTimestamp() });
      // owner-listable metadata (stores full token so the user can re-copy)
      const metaRef = doc(collection(db, "users", user.uid, "apikeys"));
      batch.set(metaRef, { label: label.trim() || "API key", token, preview: token.slice(0, 12) + "…" + token.slice(-4), active: true, createdAtMs: Date.now() });
      await batch.commit();
      setFresh(token); setLabel("");
      await load();
    } catch (e) { alert("Could not create key: " + e.message); }
    setCreating(false);
  };

  const revoke = async (k) => {
    if (!confirm("Revoke this key? Apps using it stop working immediately.")) return;
    try {
      if (k.token) await updateDoc(doc(db, "api_tokens", k.token), { active: false });
      await updateDoc(doc(db, "users", user.uid, "apikeys", k.id), { active: false });
      await load();
    } catch (e) { alert("Revoke failed: " + e.message); }
  };

  const copy = (t, id) => { navigator.clipboard?.writeText(t); setCopied(id); setTimeout(() => setCopied(""), 1600); };
  const isEnt = plan === "enterprise";

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO title="API Keys — VRIKAAN Developers" description="Create and manage your VRIKAAN Scam DNA API keys." path="/developers/keys" />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 880 }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.cyan, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}><LuKey size={15} /> Developer · API keys</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,38px)", color: T.white, margin: 0 }}>Scam DNA API keys</h1>
          <p style={{ color: T.muted, marginTop: 8, fontSize: 15 }}>Authenticate with <code style={{ color: T.cyan }}>Authorization: Bearer vrk_…</code> → <Link to="/developers" style={{ color: T.cyan }}>read the docs</Link>.</p>
        </div>

        {!isEnt && (
          <Card style={{ padding: 16, marginBottom: 18, border: `1px solid ${alpha("#f59e0b", 0.4)}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <LuTriangleAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ color: T.muted, fontSize: 14 }}>You're on <b style={{ color: T.white }}>{plan}</b>. Keys work, but the B2B <b>scam-dna-api</b> endpoint needs an <b style={{ color: "#f59e0b" }}>Enterprise</b> plan. <Link to="/pricing" style={{ color: T.cyan }}>Upgrade →</Link></div>
          </Card>
        )}

        {/* create */}
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Key label (e.g. Production)" style={{ flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, background: alpha("#94a3b8", 0.06), border: `1px solid ${alpha("#94a3b8", 0.2)}`, color: T.white, fontSize: 14, outline: "none" }} />
            <Button onClick={create} disabled={creating} icon={<LuPlus size={16} />}>{creating ? "Creating…" : "Create key"}</Button>
          </div>
          {fresh && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: alpha(T.cyan, 0.08), border: `1px solid ${alpha(T.cyan, 0.3)}` }}>
              <div style={{ color: T.cyan, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>NEW KEY — copy it now, shown once for convenience</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, color: T.white, fontSize: 13, wordBreak: "break-all" }}>{fresh}</code>
                <button onClick={() => copy(fresh, "fresh")} style={iconBtn}>{copied === "fresh" ? <LuCheck size={16} color="#22c55e" /> : <LuCopy size={16} color={T.cyan} />}</button>
              </div>
            </div>
          )}
        </Card>

        {/* list */}
        {loading ? <div style={{ color: T.muted, padding: 20 }}>Loading…</div> : (
          <div style={{ display: "grid", gap: 10 }}>
            {keys.map((k) => (
              <Card key={k.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: k.active === false ? 0.5 : 1 }}>
                <LuKey size={18} color={k.active === false ? T.muted : T.cyan} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.white, fontWeight: 600, fontSize: 15 }}>{k.label} {k.active === false && <span style={{ color: "#ef4444", fontSize: 12 }}>· revoked</span>}</div>
                  <code style={{ color: T.muted, fontSize: 12.5 }}>{k.preview || "vrk_…"}</code>
                </div>
                {k.active !== false && k.token && <button onClick={() => copy(k.token, k.id)} style={iconBtn} title="Copy">{copied === k.id ? <LuCheck size={15} color="#22c55e" /> : <LuCopy size={15} color={T.muted} />}</button>}
                {k.active !== false && <button onClick={() => revoke(k)} style={iconBtn} title="Revoke"><LuTrash2 size={15} color="#ef4444" /></button>}
              </Card>
            ))}
            {!keys.length && <div style={{ color: T.muted, padding: 20, textAlign: "center" }}>No keys yet. Create one above.</div>}
          </div>
        )}
      </Section>
      <Footer />
    </div>
  );
}
const iconBtn = { background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" };
