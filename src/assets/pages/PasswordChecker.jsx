import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", red: "#ef4444", orange: "#f97316", green: "#22c55e", yellow: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg, clr) => ({ padding: "12px 28px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s" }),
  input: { width: "100%", padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
};

// ─── SHA-1 via Web Crypto API ───
async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// ─── Password Strength Analysis ───
function analyzeStrength(password) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "At least 12 characters", pass: password.length >= 12 },
    { label: "Uppercase letters (A-Z)", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letters (a-z)", pass: /[a-z]/.test(password) },
    { label: "Numbers (0-9)", pass: /[0-9]/.test(password) },
    { label: "Symbols (!@#$...)", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  let level, color;
  if (score <= 2) { level = "Weak"; color = T.red; }
  else if (score <= 3) { level = "Fair"; color = T.orange; }
  else if (score <= 4) { level = "Good"; color = T.yellow; }
  else { level = "Strong"; color = T.green; }
  return { checks, score, level, color };
}

// ─── Keyframes injected once ───
const styleId = "pwc-keyframes";
function injectKeyframes() {
  if (typeof document === "undefined" || document.getElementById(styleId)) return;
  const s = document.createElement("style");
  s.id = styleId;
  s.textContent = `
    @keyframes pwc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }
    @keyframes pwc-scan { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes pwc-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pwc-glow { 0%,100%{box-shadow:0 0 8px rgba(20,227,197,0.3)} 50%{box-shadow:0 0 24px rgba(20,227,197,0.6)} }
    @keyframes pwc-slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  `;
  document.head.appendChild(s);
}

// ─── Main Component ───
export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Inject keyframes on first render
  useState(() => { injectKeyframes(); });

  async function handleCheck() {
    if (!password) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const hash = await sha1(password);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const res = await fetch("/api/password-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();
      // data.suffixes is expected to be a string of "SUFFIX:COUNT\r\n" lines (HIBP format)
      const suffixes = typeof data.suffixes === "string" ? data.suffixes : "";
      let count = 0;

      const lines = suffixes.split(/\r?\n/);
      for (const line of lines) {
        const [s, c] = line.split(":");
        if (s && s.trim().toUpperCase() === suffix) {
          count = parseInt(c, 10) || 0;
          break;
        }
      }

      const strength = analyzeStrength(password);
      setResults({ breached: count > 0, count, strength });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  const wrap = { maxWidth: 1100, margin: "0 auto", padding: "0 20px" };
  const h2 = { fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk'", color: T.white, margin: "0 0 8px" };
  const sub = { fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Password Breach Checker — VRIKAAN" description="Check if your password has been exposed in data breaches. Uses k-anonymity so your password never leaves the browser." />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ padding: "120px 20px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={wrap}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "pwc-pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.accent }}>Secure Breach Lookup</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, fontFamily: "'Space Grotesk'", margin: "0 0 16px", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Password Breach Checker
          </h1>
          <p style={{ fontSize: 17, color: T.muted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Check if your password has appeared in known data breaches. Your password never leaves the browser — only the first 5 characters of its SHA-1 hash are sent.
          </p>

          {/* Password input */}
          <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 10 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password to check..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                style={{ ...sty.input, padding: "16px 52px 16px 46px", fontSize: 15, borderRadius: 10, border: `1px solid ${loading ? T.accent : T.border}`, transition: "border 0.3s" }}
              />
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.5 }}>&#128274;</span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted, padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "\u{1F441}" : "\u{1F441}\u200D\u{1F5E8}"}
              </button>
            </div>
            <button
              onClick={handleCheck}
              disabled={loading || !password}
              style={{
                ...sty.btn(loading ? T.surface : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`),
                padding: "16px 32px",
                borderRadius: 10,
                fontSize: 15,
                opacity: loading || !password ? 0.6 : 1,
                minWidth: 130,
                justifyContent: "center",
                ...(loading || !password ? {} : { animation: "pwc-glow 2s infinite" }),
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "pwc-pulse 0.8s linear infinite" }} />
                  Checking...
                </>
              ) : "Check Now"}
            </button>
          </div>

          {/* Loading animation */}
          {loading && (
            <div style={{ marginTop: 40, animation: "pwc-fadeUp 0.4s ease" }}>
              <div style={{ height: 3, maxWidth: 400, margin: "0 auto", borderRadius: 4, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, backgroundSize: "200% 100%", animation: "pwc-scan 1.5s linear infinite" }} />
              <p style={{ fontSize: 13, color: T.accent, marginTop: 16 }}>Checking password against breach databases using k-anonymity...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 30, animation: "pwc-fadeUp 0.4s ease" }}>
              <div style={{ ...sty.card, maxWidth: 520, margin: "0 auto", borderColor: `${T.red}30`, textAlign: "center" }}>
                <span style={{ fontSize: 32 }}>&#9888;&#65039;</span>
                <p style={{ fontSize: 14, color: T.red, margin: "8px 0 0" }}>{error}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      {results && (
        <div style={{ animation: "pwc-fadeUp 0.5s ease" }}>

          {/* Breach Result */}
          <section style={{ padding: "0 20px 50px" }}>
            <div style={wrap}>
              <div style={{ ...sty.card, textAlign: "center", padding: "40px 24px", borderColor: results.breached ? `${T.red}30` : `${T.green}30` }}>
                {results.breached ? (
                  <>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>&#128680;</div>
                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk'", color: T.red }}>
                      Password Compromised
                    </div>
                    <p style={{ fontSize: 15, color: T.muted, margin: "12px 0 0", lineHeight: 1.7 }}>
                      This password has been seen <span style={{ color: T.red, fontWeight: 700, fontFamily: "'Space Grotesk'" }}>{results.count.toLocaleString()}</span> time{results.count !== 1 ? "s" : ""} in data breaches.
                      <br />You should change it immediately wherever it is used.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>&#128737;&#65039;</div>
                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk'", color: T.green }}>
                      Safe — Not Found
                    </div>
                    <p style={{ fontSize: 15, color: T.muted, margin: "12px 0 0", lineHeight: 1.7 }}>
                      This password was not found in any known data breaches.
                      <br />That does not guarantee it is secure — review the strength analysis below.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Strength + Recommendations */}
          <section style={{ padding: "0 20px 60px" }}>
            <div style={wrap}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

                {/* Password Strength */}
                <div style={{ ...sty.card, padding: 32 }}>
                  <h2 style={{ ...h2, fontSize: 22, marginBottom: 20 }}>Password Strength</h2>

                  {/* Meter bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: results.strength.color }}>{results.strength.level}</span>
                      <span style={{ fontSize: 12, color: T.muted }}>{results.strength.score}/6</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(148,163,184,0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: results.strength.color, width: `${(results.strength.score / 6) * 100}%`, transition: "width 0.6s ease, background 0.3s" }} />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {results.strength.checks.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: `pwc-slideIn 0.4s ease ${i * 0.08}s both` }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: c.pass ? `${T.green}18` : `${T.red}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                          {c.pass ? <span style={{ color: T.green }}>&#10003;</span> : <span style={{ color: T.red }}>&#10005;</span>}
                        </div>
                        <span style={{ fontSize: 13, color: c.pass ? T.white : T.muted }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ ...sty.card, padding: 32 }}>
                  <h2 style={{ ...h2, fontSize: 22, marginBottom: 20 }}>Recommendations</h2>
                  {(results.breached ? [
                    { icon: "&#128680;", title: "Change This Password Now", desc: "This password is known to attackers. Change it on every account where it is used.", priority: "Urgent", color: T.red },
                    { icon: "&#128273;", title: "Use a Unique Password Per Account", desc: "Never reuse passwords. A password manager can generate and store unique ones for you.", priority: "High", color: T.orange },
                    { icon: "&#128737;", title: "Enable Two-Factor Authentication", desc: "Add 2FA to protect your accounts even if a password is compromised.", priority: "High", color: T.orange },
                    { icon: "&#128269;", title: "Check Your Other Passwords", desc: "If you reuse passwords, your other accounts may also be at risk.", priority: "Medium", color: T.yellow },
                  ] : [
                    { icon: "&#9989;", title: "Keep Using Unique Passwords", desc: "Continue using different passwords for each account to limit breach exposure.", priority: "Good", color: T.green },
                    { icon: "&#128273;", title: "Use a Password Manager", desc: "Let a password manager generate long, random passwords so you do not have to remember them.", priority: "Recommended", color: T.cyan },
                    { icon: "&#128737;", title: "Enable Two-Factor Authentication", desc: "Add 2FA for an extra layer of security beyond your password.", priority: "Recommended", color: T.cyan },
                    { icon: "&#128338;", title: "Check Periodically", desc: "New breaches happen often. Check your passwords regularly to stay ahead of threats.", priority: "Info", color: T.accent },
                  ]).map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: a.icon }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{a.title}</span>
                          <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${a.color}18`, color: a.color, whiteSpace: "nowrap" }}>{a.priority}</span>
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

      {/* ── How It Works / k-Anonymity Info ── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={wrap}>
          <h2 style={h2}>How It Works</h2>
          <p style={{ ...sub, marginBottom: 24 }}>Your password is checked securely using the k-anonymity model — it never leaves your browser</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              {
                step: "1",
                title: "Hash Locally",
                desc: "Your password is hashed with SHA-1 entirely in your browser using the Web Crypto API. The plaintext password is never transmitted.",
                color: T.accent,
              },
              {
                step: "2",
                title: "Send Only a Prefix",
                desc: "Only the first 5 characters of the 40-character hash are sent to the server. This matches thousands of possible hashes, preserving your anonymity.",
                color: T.cyan,
              },
              {
                step: "3",
                title: "Compare Locally",
                desc: "The server returns all hash suffixes matching that prefix. Your browser checks if your full hash is in the list — the server never sees your complete hash.",
                color: T.green,
              },
              {
                step: "4",
                title: "k-Anonymity",
                desc: "This model, designed by Cloudflare and Troy Hunt, ensures the API cannot determine which password you are checking. Your privacy is fully protected.",
                color: T.yellow,
              },
            ].map((item, i) => (
              <div key={i} style={{ ...sty.card, animation: `pwc-slideIn 0.4s ease ${i * 0.1}s both` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: item.color, fontFamily: "'Space Grotesk'", marginBottom: 16 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div style={{ ...sty.card, marginTop: 24, display: "flex", gap: 16, alignItems: "flex-start", borderColor: `${T.green}20` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.green}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>&#128274;</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 6 }}>Your Privacy Is Protected</div>
              <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.7 }}>
                This tool uses the Have I Been Pwned k-anonymity API. Your password is hashed client-side, and only a small prefix of the hash is ever transmitted. The full hash and your plaintext password never leave your device. No passwords are stored or logged at any point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
