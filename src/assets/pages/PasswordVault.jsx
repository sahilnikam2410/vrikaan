import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", orange: "#f97316", yellow: "#eab308", green: "#22c55e", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg, clr) => ({ padding: "10px 20px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s" }),
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
};

const STORAGE_KEY = "secuvion_vault";

const CATEGORIES = ["All", "Social", "Finance", "Work", "Entertainment", "Other"];
const SORT_OPTIONS = ["Name", "Date Added", "Strength"];

const CATEGORY_ICONS = { Social: "\u{1F465}", Finance: "\u{1F3E6}", Work: "\u{1F4BC}", Entertainment: "\u{1F3AC}", Other: "\u{1F512}" };

const KNOWN_BREACHED = ["password123", "123456", "qwerty", "abc123", "letmein", "welcome", "monkey", "dragon", "master", "login", "password", "12345678"];

const DEFAULT_ENTRIES = [
  { id: "d1", site: "Google", url: "google.com", username: "user@gmail.com", password: "G#k9$mPz!xR2vQ", category: "Work", notes: "", createdAt: "2025-12-15T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z" },
  { id: "d2", site: "Facebook", url: "facebook.com", username: "john.doe", password: "abc123", category: "Social", notes: "", createdAt: "2025-08-10T10:00:00Z", updatedAt: "2025-08-10T10:00:00Z" },
  { id: "d3", site: "Netflix", url: "netflix.com", username: "johndoe@email.com", password: "Netfl1x2025!", category: "Entertainment", notes: "Family plan", createdAt: "2025-11-01T10:00:00Z", updatedAt: "2026-01-15T10:00:00Z" },
  { id: "d4", site: "Amazon", url: "amazon.com", username: "john.d@outlook.com", password: "Amz#Str0ng!2026$", category: "Finance", notes: "Prime account", createdAt: "2025-10-05T10:00:00Z", updatedAt: "2026-03-01T10:00:00Z" },
  { id: "d5", site: "GitHub", url: "github.com", username: "johndoe-dev", password: "Gh!tHub_S3cur3#99", category: "Work", notes: "", createdAt: "2025-09-20T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z" },
  { id: "d6", site: "Twitter", url: "twitter.com", username: "johndoe_x", password: "abc123", category: "Social", notes: "", createdAt: "2025-07-01T10:00:00Z", updatedAt: "2025-07-01T10:00:00Z" },
  { id: "d7", site: "Banking App", url: "mybank.com", username: "john.doe.9283", password: "B@nk$ecure#2026!", category: "Finance", notes: "Main checking", createdAt: "2025-06-15T10:00:00Z", updatedAt: "2026-03-25T10:00:00Z" },
  { id: "d8", site: "Email", url: "outlook.com", username: "john.d@outlook.com", password: "0utL00k_2025", category: "Work", notes: "Work email", createdAt: "2025-05-01T10:00:00Z", updatedAt: "2025-12-01T10:00:00Z" },
  { id: "d9", site: "Spotify", url: "spotify.com", username: "johndoe_music", password: "password123", category: "Entertainment", notes: "", createdAt: "2025-04-10T10:00:00Z", updatedAt: "2025-04-10T10:00:00Z" },
  { id: "d10", site: "LinkedIn", url: "linkedin.com", username: "john-doe-pro", password: "L!nk3d_Pr0#2026", category: "Work", notes: "", createdAt: "2025-11-20T10:00:00Z", updatedAt: "2026-02-28T10:00:00Z" },
];

// ── Helpers ──

function calcStrength(pw) {
  if (!pw) return { score: 0, label: "None", color: T.mutedDark };
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (pw.length >= 16) s += 1;
  if (/[a-z]/.test(pw)) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[0-9]/.test(pw)) s += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) s += 1;
  if (pw.length >= 20) s += 1;
  // penalize common
  if (KNOWN_BREACHED.includes(pw.toLowerCase())) return { score: 0.05, label: "Very Weak", color: T.red };
  if (s <= 2) return { score: 0.15, label: "Very Weak", color: T.red };
  if (s <= 3) return { score: 0.3, label: "Weak", color: T.orange };
  if (s <= 4) return { score: 0.5, label: "Fair", color: T.yellow };
  if (s <= 6) return { score: 0.75, label: "Strong", color: T.green };
  return { score: 1, label: "Very Strong", color: T.cyan };
}

function estimateCrackTime(pw) {
  if (!pw) return "Instant";
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  if (pool === 0) return "Instant";
  const combos = Math.pow(pool, pw.length);
  const guessesPerSec = 1e10;
  const secs = combos / guessesPerSec;
  if (secs < 1) return "Instant";
  if (secs < 60) return `${Math.round(secs)} seconds`;
  if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
  if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
  if (secs < 86400 * 365) return `${Math.round(secs / 86400)} days`;
  if (secs < 86400 * 365 * 1e3) return `${Math.round(secs / (86400 * 365))} years`;
  if (secs < 86400 * 365 * 1e6) return `${Math.round(secs / (86400 * 365 * 1e3))} thousand years`;
  if (secs < 86400 * 365 * 1e9) return `${Math.round(secs / (86400 * 365 * 1e6))} million years`;
  if (secs < 86400 * 365 * 1e12) return `${Math.round(secs / (86400 * 365 * 1e9))} billion years`;
  return `${(secs / (86400 * 365 * 1e12)).toExponential(1)} trillion years`;
}

function generatePassword(len, opts) {
  const chars = [];
  if (opts.upper) chars.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (opts.lower) chars.push("abcdefghijklmnopqrstuvwxyz");
  if (opts.numbers) chars.push("0123456789");
  if (opts.symbols) chars.push("!@#$%^&*()_+-=[]{}|;:,.<>?");
  if (chars.length === 0) chars.push("abcdefghijklmnopqrstuvwxyz");
  const pool = chars.join("");
  let pw = "";
  for (let i = 0; i < len; i++) pw += pool[Math.floor(Math.random() * pool.length)];
  return pw;
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

// ── Components ──

const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{children}</span>
);

const StrengthBar = ({ score, color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)" }}>
      <div style={{ width: `${score * 100}%`, height: "100%", borderRadius: 3, background: color, transition: "all 0.4s ease" }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 70, fontFamily: "'Plus Jakarta Sans'" }}>{label}</span>
  </div>
);

const CircularGauge = ({ value, size = 140 }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? T.cyan : value >= 60 ? T.green : value >= 40 ? T.yellow : value >= 20 ? T.orange : T.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={T.white} fontSize={28} fontWeight={700} fontFamily="'Space Grotesk'" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{value}</text>
    </svg>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...sty.card, display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 180 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'" }}>{label}</div>
    </div>
  </div>
);

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ ...sty.card, maxWidth: 520, width: "90%", maxHeight: "85vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>{"\u2715"}</button>
        {children}
      </div>
    </div>
  );
};

// ── Main Page ──

export default function PasswordVault() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Name");
  const [visiblePws, setVisiblePws] = useState({});
  const [copied, setCopied] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ site: "", url: "", username: "", password: "", category: "Other", notes: "" });

  // Generator state
  const [genLen, setGenLen] = useState(16);
  const [genOpts, setGenOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [genPw, setGenPw] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setEntries(JSON.parse(stored)); } catch { setEntries(DEFAULT_ENTRIES); }
    } else {
      setEntries(DEFAULT_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTRIES));
    }
  }, []);

  // Save
  useEffect(() => {
    if (entries.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Generate on mount and when options change
  const regen = useCallback(() => {
    setGenPw(generatePassword(genLen, genOpts));
  }, [genLen, genOpts]);

  useEffect(() => { regen(); }, [regen]);

  const copyToClip = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const togglePw = (id) => setVisiblePws(p => ({ ...p, [id]: !p[id] }));

  const openAdd = () => {
    setEditId(null);
    setForm({ site: "", url: "", username: "", password: "", category: "Other", notes: "" });
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditId(entry.id);
    setForm({ site: entry.site, url: entry.url, username: entry.username, password: entry.password, category: entry.category, notes: entry.notes || "" });
    setShowModal(true);
  };

  const saveEntry = () => {
    if (!form.site || !form.password) return;
    const now = new Date().toISOString();
    if (editId) {
      setEntries(prev => prev.map(e => e.id === editId ? { ...e, ...form, updatedAt: now } : e));
    } else {
      const newEntry = { id: `u${Date.now()}`, ...form, createdAt: now, updatedAt: now };
      setEntries(prev => [...prev, newEntry]);
    }
    setShowModal(false);
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Filter & Sort
  const filtered = entries
    .filter(e => (category === "All" || e.category === category) && (search === "" || e.site.toLowerCase().includes(search.toLowerCase()) || e.url.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "Name") return a.site.localeCompare(b.site);
      if (sortBy === "Date Added") return new Date(b.createdAt) - new Date(a.createdAt);
      return calcStrength(b.password).score - calcStrength(a.password).score;
    });

  // Health metrics
  const totalPws = entries.length;
  const weakPws = entries.filter(e => calcStrength(e.password).score <= 0.3).length;
  const pwCounts = {};
  entries.forEach(e => { pwCounts[e.password] = (pwCounts[e.password] || 0) + 1; });
  const reusedPws = entries.filter(e => pwCounts[e.password] > 1).length;
  const oldPws = entries.filter(e => daysSince(e.updatedAt) > 90).length;
  const breachedPws = entries.filter(e => KNOWN_BREACHED.includes(e.password.toLowerCase())).length;

  const healthScore = totalPws === 0 ? 100 : Math.max(0, Math.min(100, Math.round(
    100 - (weakPws / totalPws) * 30 - (reusedPws / totalPws) * 25 - (oldPws / totalPws) * 20 - (breachedPws / totalPws) * 25
  )));

  const genStr = calcStrength(genPw);

  return (
    <>
      <SEO title="Password Vault" description="Generate, store, and manage your passwords securely with VRIKAAN's Password Vault." path="/password-vault" />
      <Navbar />
      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 80 }}>

        {/* ── Hero ── */}
        <section style={{ textAlign: "center", padding: "60px clamp(24px,5vw,80px) 40px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20 }}>{"\u{1F512}"}</div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(32px,5vw,48px)", fontWeight: 700, color: T.white, margin: "0 0 12px" }}>Password Vault</h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 17, color: T.muted, maxWidth: 520, margin: "0 auto" }}>Generate, store, and manage your passwords securely</p>
        </section>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px,5vw,80px) 80px" }}>

          {/* ── Password Generator ── */}
          <section style={{ ...sty.card, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>{"\u2699\uFE0F"} Password Generator</h2>

            {/* Generated display */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <code style={{ flex: 1, fontFamily: "'JetBrains Mono'", fontSize: 16, color: T.cyan, wordBreak: "break-all", letterSpacing: 1 }}>{genPw}</code>
              <button onClick={() => copyToClip(genPw, "gen")} style={{ ...sty.btn(copied === "gen" ? T.green : T.accent), padding: "8px 14px", fontSize: 12 }}>{copied === "gen" ? "\u2713 Copied" : "\u{1F4CB} Copy"}</button>
            </div>

            {/* Strength meter */}
            <StrengthBar score={genStr.score} color={genStr.color} label={genStr.label} />
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontFamily: "'Plus Jakarta Sans'" }}>Estimated crack time: <span style={{ color: genStr.color, fontWeight: 600 }}>{estimateCrackTime(genPw)}</span></div>

            {/* Length slider */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: T.muted, fontFamily: "'Plus Jakarta Sans'" }}>Length</label>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: "'JetBrains Mono'" }}>{genLen}</span>
              </div>
              <input type="range" min={8} max={64} value={genLen} onChange={e => setGenLen(+e.target.value)}
                style={{ width: "100%", accentColor: T.cyan, cursor: "pointer" }} />
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
              {[["upper", "Uppercase"], ["lower", "Lowercase"], ["numbers", "Numbers"], ["symbols", "Symbols"]].map(([k, label]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.white, fontFamily: "'Plus Jakarta Sans'" }}>
                  <div onClick={() => setGenOpts(p => ({ ...p, [k]: !p[k] }))}
                    style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${genOpts[k] ? T.cyan : T.mutedDark}`, background: genOpts[k] ? T.cyan : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", cursor: "pointer" }}>
                    {genOpts[k] && <span style={{ color: T.bg, fontSize: 13, fontWeight: 700 }}>{"\u2713"}</span>}
                  </div>
                  {label}
                </label>
              ))}
            </div>

            <button onClick={regen} style={{ ...sty.btn(`linear-gradient(135deg, ${T.cyan}, ${T.accent})`), marginTop: 20 }}>{"\u{1F504}"} Regenerate</button>
          </section>

          {/* ── Breach Alert ── */}
          {breachedPws > 0 && (
            <div style={{ ...sty.card, marginBottom: 32, borderColor: `${T.red}40`, background: `${T.red}08` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${T.red}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{"\u26A0\uFE0F"}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.red, fontFamily: "'Space Grotesk'" }}>{breachedPws} password{breachedPws > 1 ? "s" : ""} found in data breaches</div>
                  <div style={{ fontSize: 13, color: T.muted, fontFamily: "'Plus Jakarta Sans'" }}>These passwords appear in known breach databases. Change them immediately.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Health Dashboard ── */}
          <section style={{ ...sty.card, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>{"\u{1F4CA}"} Password Health</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <CircularGauge value={healthScore} />
                <div style={{ fontSize: 13, color: T.muted, marginTop: 8, fontFamily: "'Plus Jakarta Sans'" }}>Overall Health</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 12, minWidth: 300 }}>
                <StatCard icon={"\u{1F511}"} label="Total Passwords" value={totalPws} color={T.cyan} />
                <StatCard icon={"\u26A0\uFE0F"} label="Weak Passwords" value={weakPws} color={T.orange} />
                <StatCard icon={"\u{1F503}"} label="Reused Passwords" value={reusedPws} color={T.yellow} />
                <StatCard icon={"\u{1F553}"} label="Old Passwords (>90d)" value={oldPws} color={T.red} />
              </div>
            </div>
          </section>

          {/* ── Search & Filter ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24, alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input type="text" placeholder="Search passwords..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...sty.input, paddingLeft: 36, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "12px center" }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${category === c ? T.cyan : T.border}`, background: category === c ? `${T.cyan}15` : "transparent", color: category === c ? T.cyan : T.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s" }}>{c}</button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ ...sty.input, width: "auto", minWidth: 130, cursor: "pointer" }}>
              {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={openAdd} style={{ ...sty.btn(`linear-gradient(135deg, ${T.cyan}, ${T.accent})`), padding: "10px 18px" }}>{"\u002B"} Add New</button>
          </div>

          {/* ── Passwords List ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 60 }}>
            {filtered.length === 0 && (
              <div style={{ ...sty.card, textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u{1F50D}"}</div>
                <div style={{ fontSize: 16, color: T.muted, fontFamily: "'Plus Jakarta Sans'" }}>No passwords found</div>
              </div>
            )}
            {filtered.map(entry => {
              const str = calcStrength(entry.password);
              const breached = KNOWN_BREACHED.includes(entry.password.toLowerCase());
              const reused = pwCounts[entry.password] > 1;
              const isVisible = visiblePws[entry.id];
              return (
                <div key={entry.id} style={{ ...sty.card, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, padding: "16px 20px", borderColor: breached ? `${T.red}40` : T.border }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${str.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {CATEGORY_ICONS[entry.category] || "\u{1F512}"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{entry.site}</span>
                      <Badge color={str.color}>{str.label}</Badge>
                      {breached && <Badge color={T.red}>Breached</Badge>}
                      {reused && <Badge color={T.yellow}>Reused</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: T.mutedDark, fontFamily: "'Plus Jakarta Sans'", marginTop: 2 }}>
                      {entry.url} &middot; {entry.username.substring(0, 3)}{"***"} &middot; Updated {daysSince(entry.updatedAt)}d ago
                    </div>
                  </div>

                  {/* Password */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
                    <code style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: isVisible ? T.white : T.mutedDark, letterSpacing: isVisible ? 0.5 : 2, minWidth: 120 }}>
                      {isVisible ? entry.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    </code>
                    <button onClick={() => togglePw(entry.id)} title={isVisible ? "Hide" : "Show"}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: 4 }}>
                      {isVisible ? "\u{1F441}\uFE0F" : "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F"}
                    </button>
                    <button onClick={() => copyToClip(entry.password, entry.id)} title="Copy"
                      style={{ background: "none", border: "none", color: copied === entry.id ? T.green : T.muted, cursor: "pointer", fontSize: 14, padding: 4 }}>
                      {copied === entry.id ? "\u2713" : "\u{1F4CB}"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(entry)} style={{ ...sty.btn("rgba(99,102,241,0.15)", T.accent), padding: "6px 12px", fontSize: 12 }}>Edit</button>
                    <button onClick={() => deleteEntry(entry.id)} style={{ ...sty.btn("rgba(239,68,68,0.15)", T.red), padding: "6px 12px", fontSize: 12 }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Add/Edit Modal ── */}
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 24px" }}>{editId ? "Edit Password" : "Add New Password"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>Site Name *</label>
              <input value={form.site} onChange={e => setForm(p => ({ ...p, site: e.target.value }))} style={sty.input} placeholder="e.g. Google" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>URL</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} style={sty.input} placeholder="e.g. google.com" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>Username</label>
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={sty.input} placeholder="e.g. john@email.com" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>Password *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ ...sty.input, flex: 1 }} placeholder="Enter password" />
                <button onClick={() => setForm(p => ({ ...p, password: generatePassword(genLen, genOpts) }))} style={{ ...sty.btn(T.accent), padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap" }}>Generate</button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <StrengthBar {...calcStrength(form.password)} />
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...sty.input, cursor: "pointer" }}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, fontFamily: "'Plus Jakarta Sans'", display: "block", marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ ...sty.input, minHeight: 60, resize: "vertical" }} placeholder="Optional notes..." />
            </div>
            <button onClick={saveEntry} style={{ ...sty.btn(`linear-gradient(135deg, ${T.cyan}, ${T.accent})`), justifyContent: "center", marginTop: 8, padding: "12px 20px" }}>
              {editId ? "Save Changes" : "Add Password"}
            </button>
          </div>
        </Modal>
      </div>
      <Footer />
    </>
  );
}
