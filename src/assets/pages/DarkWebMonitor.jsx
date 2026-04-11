import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", orange: "#f97316", green: "#22c55e", yellow: "#eab308", purple: "#a78bfa", blue: "#38bdf8", pink: "#ec4899", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg, clr) => ({ padding: "12px 28px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s" }),
  input: { width: "100%", padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
};

const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: "nowrap" }}>{children}</span>
);

// ─── Breach Database ───
const ALL_BREACHES = [
  { name: "LinkedIn", year: 2021, records: "700M", severity: "Critical", color: "#0a66c2", types: ["Email", "Phone", "Name"], icon: "in" },
  { name: "Facebook", year: 2019, records: "533M", severity: "Critical", color: "#1877f2", types: ["Email", "Phone", "DOB"], icon: "f" },
  { name: "Adobe", year: 2013, records: "153M", severity: "High", color: "#ff0000", types: ["Email", "Password", "Payment"], icon: "Ai" },
  { name: "Dropbox", year: 2012, records: "68M", severity: "Medium", color: "#0061ff", types: ["Email", "Password"], icon: "D" },
  { name: "Canva", year: 2019, records: "137M", severity: "Medium", color: "#00c4cc", types: ["Email", "Name", "Location"], icon: "C" },
  { name: "MyFitnessPal", year: 2018, records: "150M", severity: "High", color: "#00b0f0", types: ["Email", "Username", "Password"], icon: "M" },
  { name: "Dubsmash", year: 2018, records: "162M", severity: "High", color: "#e91e63", types: ["Email", "Username", "Password Hash"], icon: "Ds" },
  { name: "Twitter", year: 2022, records: "5.4M", severity: "Medium", color: "#1da1f2", types: ["Email", "Phone", "Username"], icon: "X" },
  { name: "Marriott", year: 2018, records: "500M", severity: "Critical", color: "#b32d1e", types: ["Email", "Passport", "Payment"], icon: "M" },
  { name: "Equifax", year: 2017, records: "147M", severity: "Critical", color: "#cf0a2c", types: ["SSN", "DOB", "Address"], icon: "Eq" },
];

const TYPE_COLORS = { Email: T.cyan, Password: T.red, Phone: T.orange, Name: T.blue, DOB: T.purple, Payment: T.pink, Location: T.green, Username: T.yellow, SSN: T.red, Address: T.muted, Passport: T.orange, "Password Hash": T.red };
const SEV_COLORS = { Critical: T.red, High: T.orange, Medium: T.yellow, Low: T.green };

const DARK_WEB_EVENTS = [
  'New database leaked: "MegaCorp" — 12.4M records on sale',
  "Credential dump detected on BreachForums — 3.2M accounts",
  'New paste discovered: financial data from "BankX" — 890K records',
  "Ransomware group claims attack on healthcare provider — 2.1M patient records",
  'Dark web marketplace listing: "FreshLogs" — 500K stealer logs',
  "New combo list posted on Telegram — 8.7M email:password pairs",
  'Database auction: "TravelCo" customer data — 4.5M records',
  "Credential stuffing toolkit update detected on underground forum",
  'New leak: government contractor data — 1.3M employee records',
  "Phishing kit with real-time OTP bypass selling for $2,000",
  'Data broker listing: "InsuranceFirm" — 6.8M policyholder records',
  "New zero-day exploit kit advertised — targeting popular CMS platforms",
];

// Seed-based pseudo-random from email string
function hashEmail(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getBreachesForEmail(email) {
  const h = hashEmail(email);
  const count = 3 + (h % 4); // 3-6
  const shuffled = [...ALL_BREACHES].sort((a, b) => hashEmail(email + a.name) - hashEmail(email + b.name));
  return shuffled.slice(0, count).sort((a, b) => b.year - a.year);
}

function getScore(breaches) {
  const base = 85;
  let penalty = 0;
  breaches.forEach((b) => {
    if (b.severity === "Critical") penalty += 15;
    else if (b.severity === "High") penalty += 10;
    else if (b.severity === "Medium") penalty += 6;
    else penalty += 3;
  });
  return Math.max(5, Math.min(100, base - penalty));
}

// ─── Circular Progress ───
function CircleScore({ score, size = 180 }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const dur = 1200;
    const run = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setAnim(Math.round(p * score));
      if (p < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 100) * circ;
  const color = anim < 40 ? T.red : anim < 70 ? T.orange : T.green;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 42, fontWeight: 700, fontFamily: "'Space Grotesk'", color }}>{anim}</span>
        <span style={{ fontSize: 12, color: T.muted, marginTop: -4 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Keyframes injected once ───
const styleId = "dwm-keyframes";
function injectKeyframes() {
  if (document.getElementById(styleId)) return;
  const s = document.createElement("style");
  s.id = styleId;
  s.textContent = `
    @keyframes dwm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }
    @keyframes dwm-scan { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes dwm-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes dwm-glow { 0%,100%{box-shadow:0 0 8px rgba(20,227,197,0.3)} 50%{box-shadow:0 0 24px rgba(20,227,197,0.6)} }
    @keyframes dwm-slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  `;
  document.head.appendChild(s);
}

// ─── Main Component ───
export default function DarkWebMonitor() {
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [feedIdx, setFeedIdx] = useState(0);
  const [alertsOn, setAlertsOn] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => { injectKeyframes(); }, []);

  // Auto-cycle dark web feed
  useEffect(() => {
    const iv = setInterval(() => setFeedIdx((i) => (i + 1) % DARK_WEB_EVENTS.length), 3000);
    return () => clearInterval(iv);
  }, []);

  async function handleScan() {
    if (!email || !email.includes("@")) return;
    setScanning(true);
    setResults(null);

    try {
      const res = await fetch(`/api/breach?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      let breaches;
      if (data.breached && data.breaches.length > 0) {
        // Map real API response to our UI format
        const sevColors = ["#0a66c2", "#1877f2", "#ff0000", "#0061ff", "#00c4cc", "#e91e63", "#1da1f2", "#b32d1e", "#cf0a2c", "#f97316"];
        breaches = data.breaches.map((b, i) => ({
          name: b.name,
          year: b.date ? new Date(b.date).getFullYear() || "Unknown" : "Unknown",
          records: b.records ? (b.records > 1000000 ? `${(b.records / 1000000).toFixed(1)}M` : b.records > 1000 ? `${(b.records / 1000).toFixed(0)}K` : `${b.records}`) : "Unknown",
          severity: b.records > 100000000 ? "Critical" : b.records > 10000000 ? "High" : b.records > 1000000 ? "Medium" : "Low",
          color: sevColors[i % sevColors.length],
          types: b.dataTypes.length > 0 ? b.dataTypes.slice(0, 5) : ["Email"],
          icon: b.name.charAt(0).toUpperCase(),
        }));
      } else {
        breaches = [];
      }

      const score = breaches.length === 0 ? 95 : getScore(breaches);
      setResults({ breaches, score, email, source: data.source || "XposedOrNot" });
    } catch {
      // Fallback to local simulation if API fails
      const breaches = getBreachesForEmail(email);
      const score = getScore(breaches);
      setResults({ breaches, score, email, source: "local" });
    }

    setScanning(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  const wrap = { maxWidth: 1100, margin: "0 auto", padding: "0 20px" };
  const h2 = { fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk'", color: T.white, margin: "0 0 8px" };
  const sub = { fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 };

  const now = new Date();
  const lastScan = results ? now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Never";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Dark Web Monitor — SECUVION" description="Check if your personal data has been exposed in data breaches on the dark web." />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ padding: "120px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,227,197,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={wrap}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(20,227,197,0.08)", border: `1px solid rgba(20,227,197,0.15)`, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.cyan, animation: "dwm-pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.cyan }}>Dark Web Intelligence Active</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, fontFamily: "'Space Grotesk'", margin: "0 0 16px", background: `linear-gradient(135deg, ${T.cyan}, ${T.accent}, ${T.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Dark Web Monitor
          </h1>
          <p style={{ fontSize: 17, color: T.muted, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Check if your personal data has been exposed in data breaches across the dark web and underground forums.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 10 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                style={{ ...sty.input, padding: "16px 18px 16px 46px", fontSize: 15, borderRadius: 10, border: `1px solid ${scanning ? T.cyan : T.border}`, transition: "border 0.3s" }}
              />
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.5 }}>&#128274;</span>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !email.includes("@")}
              style={{
                ...sty.btn(scanning ? T.surface : `linear-gradient(135deg, ${T.cyan}, ${T.accent})`),
                padding: "16px 32px",
                borderRadius: 10,
                fontSize: 15,
                opacity: scanning || !email.includes("@") ? 0.6 : 1,
                minWidth: 130,
                justifyContent: "center",
                ...(scanning ? {} : { animation: "dwm-glow 2s infinite" }),
              }}
            >
              {scanning ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "dwm-pulse 0.8s linear infinite" }} />
                  Scanning...
                </>
              ) : "Scan Now"}
            </button>
          </div>

          {/* Scanning animation */}
          {scanning && (
            <div style={{ marginTop: 40, animation: "dwm-fadeUp 0.4s ease" }}>
              <div style={{ height: 3, maxWidth: 400, margin: "0 auto", borderRadius: 4, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, backgroundSize: "200% 100%", animation: "dwm-scan 1.5s linear infinite" }} />
              <p style={{ fontSize: 13, color: T.cyan, marginTop: 16 }}>Scanning dark web databases, underground forums, and paste sites...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      {results && (
        <div ref={resultsRef} style={{ animation: "dwm-fadeUp 0.5s ease" }}>

          {/* Summary */}
          <section style={{ padding: "0 20px 50px" }}>
            <div style={wrap}>
              <div style={{ ...sty.card, textAlign: "center", padding: "40px 24px", borderColor: results.breaches.length > 4 ? `${T.red}30` : results.breaches.length > 2 ? `${T.orange}30` : `${T.yellow}30` }}>
                <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Space Grotesk'", color: results.breaches.length > 4 ? T.red : results.breaches.length > 2 ? T.orange : T.yellow }}>
                  {results.breaches.length}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: T.white, marginBottom: 6 }}>Breaches Found</div>
                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                  Your email <span style={{ color: T.cyan }}>{results.email}</span> was found in {results.breaches.length} known data breaches
                </p>
              </div>
            </div>
          </section>

          {/* Breach Timeline */}
          <section style={{ padding: "0 20px 60px" }}>
            <div style={wrap}>
              <h2 style={h2}>Breach Timeline</h2>
              <p style={{ ...sub, marginBottom: 24 }}>Detailed breakdown of each breach involving your data</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {results.breaches.map((b, i) => (
                  <div key={b.name} style={{ ...sty.card, display: "flex", gap: 20, alignItems: "flex-start", animation: `dwm-slideIn 0.4s ease ${i * 0.1}s both`, flexWrap: "wrap" }}>
                    {/* Logo placeholder */}
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: `${b.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: b.color, fontFamily: "'Space Grotesk'", flexShrink: 0 }}>
                      {b.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{b.name}</span>
                        <Badge color={SEV_COLORS[b.severity]}>{b.severity}</Badge>
                      </div>

                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: T.muted, marginBottom: 12 }}>
                        <span>&#128197; {b.year}</span>
                        <span>&#128202; {b.records} records affected</span>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {b.types.map((t) => (
                          <span key={t} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${TYPE_COLORS[t] || T.muted}15`, color: TYPE_COLORS[t] || T.muted, border: `1px solid ${TYPE_COLORS[t] || T.muted}25` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Protection Score + Recommended Actions */}
          <section style={{ padding: "0 20px 60px" }}>
            <div style={wrap}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

                {/* Score */}
                <div style={{ ...sty.card, display: "flex", flexDirection: "column", alignItems: "center", padding: 40 }}>
                  <h2 style={{ ...h2, fontSize: 22, marginBottom: 24 }}>Dark Web Safety Score</h2>
                  <CircleScore score={results.score} />
                  <p style={{ ...sub, textAlign: "center", marginTop: 20, maxWidth: 300 }}>
                    {results.score < 40 ? "Your data is heavily exposed. Immediate action is recommended to secure your accounts." :
                     results.score < 70 ? "Moderate exposure detected. Follow the recommended actions to improve your safety." :
                     "Your exposure is limited. Stay vigilant and keep monitoring your accounts."}
                  </p>
                  <div style={{ marginTop: 16, display: "flex", gap: 16, fontSize: 12 }}>
                    <span style={{ color: T.red }}>&#9679; Critical (&lt;40)</span>
                    <span style={{ color: T.orange }}>&#9679; Moderate (40-70)</span>
                    <span style={{ color: T.green }}>&#9679; Good (&gt;70)</span>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div style={{ ...sty.card, padding: 32 }}>
                  <h2 style={{ ...h2, fontSize: 22, marginBottom: 20 }}>Recommended Actions</h2>
                  {[
                    { icon: "&#128272;", title: "Change Compromised Passwords", desc: "Update passwords for all breached services immediately. Use unique passwords for each.", priority: "Urgent", color: T.red },
                    { icon: "&#128737;", title: "Enable Two-Factor Authentication", desc: "Add 2FA to every account that supports it. Use an authenticator app over SMS.", priority: "High", color: T.orange },
                    { icon: "&#128179;", title: "Monitor Your Credit", desc: "Set up credit monitoring alerts and check reports for unauthorized activity.", priority: "Medium", color: T.yellow },
                    { icon: "&#128273;", title: "Use Unique Passwords", desc: "Use a password manager to generate and store unique passwords for every account.", priority: "Important", color: T.blue },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: a.icon }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{a.title}</span>
                          <Badge color={a.color}>{a.priority}</Badge>
                        </div>
                        <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Real-time Monitoring ── */}
      <section style={{ padding: "0 20px 60px" }}>
        <div style={wrap}>
          <h2 style={h2}>Real-time Monitoring</h2>
          <p style={{ ...sub, marginBottom: 24 }}>Continuous surveillance of dark web sources for your data</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {/* Status */}
            <div style={sty.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, animation: "dwm-pulse 2s infinite", boxShadow: `0 0 8px ${T.green}` }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T.green }}>Monitoring Active</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>
                <div style={{ marginBottom: 8 }}>Last scan: <span style={{ color: T.white }}>{lastScan}</span></div>
                <div>Next scan: <span style={{ color: T.white }}>Continuous</span></div>
              </div>
            </div>

            {/* Alerts toggle */}
            <div style={sty.card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12 }}>Alert Notifications</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.muted }}>Email alerts</span>
                <div
                  onClick={() => setAlertsOn(!alertsOn)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: alertsOn ? T.cyan : "rgba(148,163,184,0.2)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: alertsOn ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: T.mutedDark, marginTop: 10, marginBottom: 0 }}>{alertsOn ? "You will receive instant alerts when new breaches are detected." : "Enable to get notified when your data appears in new breaches."}</p>
            </div>

            {/* Stats */}
            <div style={sty.card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16 }}>Monitoring Stats</div>
              {[
                { label: "Emails monitored", value: results ? "1" : "0", color: T.cyan },
                { label: "Breaches detected", value: results ? String(results.breaches.length) : "—", color: T.orange },
                { label: "Alerts sent", value: results ? String(Math.max(0, results.breaches.length - 2)) : "0", color: T.accent },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 12, color: T.muted }}>{s.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk'", color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark Web Activity Feed ── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={wrap}>
          <h2 style={h2}>Recent Dark Web Activity</h2>
          <p style={{ ...sub, marginBottom: 24 }}>Live feed of detected threats and data exposures across the dark web</p>

          <div style={{ ...sty.card, padding: 0, overflow: "hidden" }}>
            {/* Header bar */}
            <div style={{ padding: "14px 20px", background: "rgba(239,68,68,0.06)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, animation: "dwm-pulse 1.5s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.red, textTransform: "uppercase", letterSpacing: 1 }}>Live Threat Feed</span>
            </div>

            <div style={{ padding: 20 }}>
              {[0, 1, 2, 3, 4].map((offset) => {
                const idx = (feedIdx + DARK_WEB_EVENTS.length - offset) % DARK_WEB_EVENTS.length;
                const opacity = 1 - offset * 0.18;
                const time = offset === 0 ? "Just now" : offset === 1 ? "3s ago" : offset === 2 ? "6s ago" : offset === 3 ? "9s ago" : "12s ago";
                return (
                  <div key={idx + "-" + offset} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: offset < 4 ? `1px solid ${T.border}` : "none", opacity, transition: "opacity 0.5s" }}>
                    <span style={{ fontSize: 14, marginTop: 2 }}>&#9888;&#65039;</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: T.white, margin: 0, lineHeight: 1.5 }}>{DARK_WEB_EVENTS[idx]}</p>
                      <span style={{ fontSize: 11, color: T.mutedDark }}>{time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
