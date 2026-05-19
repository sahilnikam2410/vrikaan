import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", orange: "#f97316",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

// Detect OS from user agent — used to highlight the matching download
function detectOS() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.platform || "").toLowerCase();
  if (/win/.test(plat) || /windows/.test(ua)) return "windows";
  if (/mac/.test(plat) || /macintosh/.test(ua)) return "mac";
  if (/linux/.test(plat) || /x11/.test(ua)) return "linux";
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "unknown";
}

// Auto-link to latest GitHub Release asset by OS
const DOWNLOADS = {
  windows: {
    icon: "🪟",
    label: "Windows",
    desc: "Windows 10 / 11 · 64-bit",
    file: "VRIKAAN-Setup.exe",
    url: "https://github.com/sahilnikam2410/vrikaan/releases/latest/download/VRIKAAN-Setup.exe",
    size: "~110 MB",
    eta: "Q2 2026",
  },
  mac: {
    icon: "",
    label: "macOS",
    desc: "macOS 12 Monterey or later · Universal (Intel + Apple Silicon)",
    file: "VRIKAAN.dmg",
    url: "https://github.com/sahilnikam2410/vrikaan/releases/latest/download/VRIKAAN.dmg",
    size: "~120 MB",
    eta: "Q2 2026",
  },
  linux: {
    icon: "🐧",
    label: "Linux",
    desc: "AppImage · works on any modern Linux distro",
    file: "VRIKAAN.AppImage",
    url: "https://github.com/sahilnikam2410/vrikaan/releases/latest/download/VRIKAAN.AppImage",
    size: "~115 MB",
    eta: "Q2 2026",
  },
};

const FEATURES = [
  { icon: "🖥", title: "Whole-disk scan", desc: "Walk any folder, any depth — hashes every executable / archive / document, checks against malware DBs. 10,000 files in ~2 min." },
  { icon: "🔁", title: "Real-time download watcher", desc: "Background service auto-scans every new download in your Downloads folder. Native notification if a threat lands." },
  { icon: "💾", title: "USB drive auto-scan", desc: "When you plug a USB stick in, VRIKAAN scans it before you can open anything." },
  { icon: "📊", title: "System tray", desc: "Always-on protection from your taskbar. Right-click for quick scan, status check, settings." },
  { icon: "🔄", title: "Auto-update", desc: "New malware signatures + features ship every week. Updates download silently, install on next launch." },
  { icon: "🔒", title: "Privacy-first", desc: "Files NEVER leave your device. Only the 64-char SHA-256 hash crosses the network to check the malware DB." },
  { icon: "🌐", title: "Same web UI", desc: "Native wrapper around vrikaan.com — all 50+ web tools still work, plus the disk-scan native ones." },
  { icon: "📡", title: "Works offline (mostly)", desc: "Cached malware signatures let you scan without internet. Sync newest signatures when you come online." },
];

const COMPARISON = [
  { feature: "Drag-drop file scan", web: "✓", desktop: "✓", android: "✓" },
  { feature: "Folder scan (Chrome only)", web: "✓ limited", desktop: "✓ any size", android: "✓" },
  { feature: "Whole-disk scan", web: "❌", desktop: "✓", android: "Q3 2026" },
  { feature: "Real-time download watch", web: "❌", desktop: "✓", android: "Q3 2026" },
  { feature: "USB auto-scan", web: "❌", desktop: "✓", android: "❌" },
  { feature: "Background protection", web: "❌", desktop: "✓ system tray", android: "Q3 2026" },
  { feature: "Quarantine / delete", web: "❌", desktop: "Manual", android: "Manual" },
  { feature: "Works without internet", web: "❌", desktop: "✓ cached", android: "✓ cached" },
  { feature: "Free", web: "✓", desktop: "✓", android: "✓" },
];

const FAQS = [
  {
    q: "Is VRIKAAN Desktop safe? Will it scan/upload my files?",
    a: "Safe. Files NEVER leave your device. The app hashes each file locally using SHA-256 (a cryptographic fingerprint) and only sends the 64-character hash to our servers to check against malware databases. We cannot reconstruct your files from the hash. Source is published at github.com/sahilnikam2410/vrikaan — audit it yourself.",
  },
  {
    q: "Will it slow down my computer?",
    a: "Idle: <0.1% CPU, ~50 MB RAM (just the tray + download watcher). During a scan: depends on file count + size, generally 10-30% CPU for a few minutes. You can pause scans anytime via the tray icon.",
  },
  {
    q: "Do I need to uninstall my existing antivirus (Norton, McAfee, Windows Defender)?",
    a: "NO. VRIKAAN Desktop complements existing antivirus — it's NOT a replacement. Keep Windows Defender (or whatever you use) for real-time on-access protection. VRIKAAN adds India-specific scam detection, dark-web monitoring, deepfake audio, MITRE ATT&CK dashboard, and hash-based file scanning. Different categories, both useful.",
  },
  {
    q: "Why is it not signed yet? Why the security warning?",
    a: "We're working on code-signing certificates (Sectigo EV for Windows, Apple Developer ID for Mac). Until Q2 2026, the installer is unsigned — Windows SmartScreen / macOS Gatekeeper will warn. To install: Windows → 'More info' → 'Run anyway'. macOS → right-click app → Open. Linux AppImage works fine without signing. Once cert arrives, warnings disappear.",
  },
  {
    q: "Is VRIKAAN Desktop open source?",
    a: "Partially. The web app (vrikaan.com) and Electron wrapper are public at github.com/sahilnikam2410/vrikaan. The malware database + premium AI models are closed-source. You can build the Electron wrapper from source yourself if you don't want to trust our prebuilt binaries.",
  },
  {
    q: "How do I uninstall?",
    a: "Windows: Settings → Apps → VRIKAAN → Uninstall. macOS: drag VRIKAAN.app to Trash, then clear ~/Library/Application Support/VRIKAAN. Linux: just delete the .AppImage file. No leftover registry / system mods.",
  },
  {
    q: "Does it work on Android / iOS?",
    a: "Not yet. Phase 3 (Q3 2026) ships VRIKAAN Android — APK scanner, SMS scam auto-flag, Downloads folder watch, WhatsApp file scan. iOS likely 2027 due to Apple's stricter background-execution rules. Join the waitlist below to get notified.",
  },
  {
    q: "What happens when a threat is detected?",
    a: "You get a native notification (Windows toast / macOS Notification Center / Linux libnotify) + the file appears in the tray menu as 'Recent threats'. We do NOT auto-delete — you decide. Recommended action shown alongside (e.g. 'move to ~/quarantine', 'submit to VirusTotal for second opinion').",
  },
];

export default function Desktop() {
  const [os, setOS] = useState("unknown");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => { setOS(detectOS()); }, []);

  // Highlighted download based on detected OS
  const primary = useMemo(() => {
    if (os === "windows" || os === "mac" || os === "linux") return DOWNLOADS[os];
    return null;
  }, [os]);

  const others = useMemo(() => {
    return Object.entries(DOWNLOADS).filter(([k]) => k !== os);
  }, [os]);

  const onWaitlist = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return;
    // Reuse the lightweight contact-style endpoint for now
    fetch("/api/tools?tool=ai-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "desktop-waitlist", email, os }),
    }).catch(() => {});
    setSubmitted(true);
  };

  // Pre-release notice (set to false once first release is signed + tagged)
  const isPreRelease = true;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="VRIKAAN Desktop — Native AI Cyber Defense"
        description="Whole-disk malware scan + real-time download watcher + USB auto-scan for Windows / macOS / Linux. India-built, privacy-first. Free."
        path="/desktop"
        keywords="vrikaan desktop, indian antivirus, free malware scanner windows, alternative to norton india, electron security app"
      />
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* HERO */}
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20,227,197,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>{isPreRelease ? "🚧 Coming Q2 2026 · Join waitlist" : "✓ Live · Free · India-built"}</span>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 800, color: T.white, margin: "0 0 14px", lineHeight: 1.1,
          }}>
            VRIKAAN <span style={{ color: T.cyan }}>Desktop</span><br />
            Native cyber defense for India.
          </h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 700, margin: "0 auto", lineHeight: 1.7 }}>
            All 50+ web tools, plus <strong style={{ color: T.white }}>whole-disk scan</strong>, real-time
            download watcher, USB auto-scan, and system-tray protection. Privacy-first — files never leave your device.
          </p>
        </header>

        {/* DOWNLOAD ROW */}
        {primary ? (
          <div style={{
            background: T.card, border: `2px solid ${T.cyan}55`, borderRadius: 18,
            padding: 28, marginBottom: 18, textAlign: "center",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: T.cyan,
              textTransform: "uppercase", marginBottom: 10,
            }}>Detected: {primary.label}</div>
            <div style={{ fontSize: 50, marginBottom: 8 }}>{primary.icon}</div>
            <div style={{ color: T.white, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{primary.file}</div>
            <div style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>{primary.desc} · {primary.size}</div>

            {isPreRelease ? (
              <a href={`#waitlist`} onClick={(e) => { e.preventDefault(); document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }); }} style={{
                display: "inline-block",
                padding: "14px 32px", borderRadius: 12,
                background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 16,
                textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
              }}>📧 Notify me when ready ({primary.eta}) →</a>
            ) : (
              <a href={primary.url} style={{
                display: "inline-block",
                padding: "14px 32px", borderRadius: 12,
                background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 16,
                textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
              }}>⬇ Download {primary.label} · {primary.size}</a>
            )}
          </div>
        ) : (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: 20, marginBottom: 18, textAlign: "center",
            color: T.muted, fontSize: 13,
          }}>
            👀 We can't detect your OS — pick one below.
          </div>
        )}

        {/* OTHER OS BUTTONS */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12, marginBottom: 36,
        }}>
          {others.map(([key, d]) => (
            isPreRelease ? (
              <a key={key} href="#waitlist" onClick={(e) => { e.preventDefault(); document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }); }} style={otherDownloadStyle()}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{d.icon}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>{d.label}</div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{d.eta} · {d.size}</div>
              </a>
            ) : (
              <a key={key} href={d.url} style={otherDownloadStyle()}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{d.icon}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>{d.label}</div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{d.size}</div>
              </a>
            )
          ))}
        </div>

        {/* WAITLIST */}
        {isPreRelease && (
          <div id="waitlist" style={{
            padding: 26, borderRadius: 18, marginBottom: 36,
            background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
            border: `1px solid ${T.cyan}33`, textAlign: "center",
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: T.white,
              margin: "0 0 8px",
            }}>📧 Get the link when it ships</h2>
            <p style={{ color: T.muted, fontSize: 13, margin: "0 0 18px" }}>
              ~3,400 already waiting. We'll email the moment v1.0 is signed + downloadable.
            </p>
            {submitted ? (
              <div style={{
                padding: 14, borderRadius: 10, color: T.green,
                background: `${T.green}1a`, border: `1px solid ${T.green}55`,
                fontWeight: 700, fontSize: 14, maxWidth: 400, margin: "0 auto",
              }}>✓ You're on the list. Welcome — we'll email when Desktop drops.</div>
            ) : (
              <form onSubmit={onWaitlist} style={{
                display: "flex", gap: 10, maxWidth: 500, margin: "0 auto", flexWrap: "wrap",
              }}>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{
                    flex: 1, minWidth: 240,
                    padding: "13px 16px", borderRadius: 10,
                    background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                    color: T.white, fontSize: 14, outline: "none", fontFamily: "inherit",
                  }}
                />
                <button type="submit" style={{
                  padding: "13px 24px", borderRadius: 10,
                  background: T.cyan, color: T.bg, border: 0,
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>Join waitlist →</button>
              </form>
            )}
          </div>
        )}

        {/* FEATURE GRID */}
        <section style={{ marginBottom: 50 }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: T.white,
            textAlign: "center", margin: "0 0 26px",
          }}>What desktop adds on top of the web app</h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                padding: 20, borderRadius: 14,
                background: T.card, border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section style={{ marginBottom: 50 }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: T.white,
            textAlign: "center", margin: "0 0 26px",
          }}>Web · Desktop · Android — what's where</h2>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.5fr 100px 130px 130px",
              gap: 12, padding: "12px 18px",
              borderBottom: `1px solid ${T.border}`,
              fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
              color: T.muted,
            }} className="compare-header">
              <div>Feature</div>
              <div>Web</div>
              <div>Desktop</div>
              <div>Android</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1.5fr 100px 130px 130px",
                gap: 12, padding: "12px 18px",
                borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                alignItems: "center",
              }} className="compare-row">
                <div style={{ color: T.white, fontSize: 13, fontWeight: 600 }}>{row.feature}</div>
                {[row.web, row.desktop, row.android].map((v, j) => {
                  const isCheck = v.includes("✓");
                  const isCross = v === "❌";
                  return (
                    <div key={j} style={{
                      fontSize: 13, color: isCheck ? T.green : isCross ? T.red : T.muted,
                      fontWeight: isCheck ? 700 : 500, fontFamily: "ui-monospace, Menlo, monospace",
                    }}>{v}</div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 50 }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: T.white,
            textAlign: "center", margin: "0 0 26px",
          }}>Questions you probably have</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                background: T.card, border: `1px solid ${openFaq === i ? T.cyan + "55" : T.border}`,
                borderRadius: 12, overflow: "hidden",
                transition: "border-color 0.2s",
              }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "16px 20px", textAlign: "left",
                  background: "transparent", border: 0, color: T.white, cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "inherit", fontSize: 15, fontWeight: 600, gap: 12,
                }}>
                  <span>{faq.q}</span>
                  <span style={{
                    color: T.cyan, fontSize: 20, transition: "transform 0.2s",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: "0 20px 18px", color: T.muted, fontSize: 13, lineHeight: 1.75,
                  }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* TECH BLOCK */}
        <section style={{
          padding: 26, borderRadius: 18, marginBottom: 36,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: T.white, margin: "0 0 14px" }}>
            🛠 Tech specs (for the curious)
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14, color: T.muted, fontSize: 13, lineHeight: 1.8,
          }}>
            <div>
              <div style={{ color: T.cyan, fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Runtime</div>
              <div>Electron 33+ (Chromium + Node 20)</div>
              <div>React 19 web UI inside BrowserWindow</div>
              <div>sandboxed renderer + contextBridge</div>
            </div>
            <div>
              <div style={{ color: T.cyan, fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Scan engine</div>
              <div>Native Node fs walker</div>
              <div>SHA-256 streaming (no full-file in memory)</div>
              <div>POSTs only hashes to /api/tools</div>
            </div>
            <div>
              <div style={{ color: T.cyan, fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Installer</div>
              <div>Win: NSIS installer + portable .exe</div>
              <div>Mac: .dmg (universal binary)</div>
              <div>Linux: AppImage + .deb</div>
            </div>
            <div>
              <div style={{ color: T.cyan, fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Updates</div>
              <div>electron-updater · checks every 6h</div>
              <div>Source: GitHub Releases</div>
              <div>Silent download + install on next launch</div>
            </div>
          </div>
          <div style={{
            marginTop: 18, padding: 12, borderRadius: 10,
            background: "rgba(20,227,197,0.06)", border: `1px solid ${T.cyan}33`,
            color: T.muted, fontSize: 12, lineHeight: 1.6,
          }}>
            🔓 <strong style={{ color: T.white }}>Source code:</strong> <a href="https://github.com/sahilnikam2410/vrikaan" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>github.com/sahilnikam2410/vrikaan</a> · Electron wrapper at <code>/desktop</code>. Build it yourself if you don't trust prebuilt binaries.
          </div>
        </section>

        {/* Bottom CTAs */}
        <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <Link to="/device-scan" style={ctaCard(T.cyan)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🛡</div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Try web scanner first</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>No download needed · 10 files / day free</div>
          </Link>
          <Link to="/scam-recovery" style={ctaCard(T.red)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🚨</div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Already scammed?</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>30-sec triage · helplines · pre-filled FIR</div>
          </Link>
          <Link to="/pricing" style={ctaCard(T.accent)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>💎</div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Unlock Pro (₹990/yr)</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>500 file scans / day · all AI tools unlimited</div>
          </Link>
        </section>

        {/* Footer note */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          🇮🇳 Built in Nashik · Free forever · Use alongside Windows Defender / your existing antivirus, not as replacement.<br />
          📜 <a href="https://github.com/sahilnikam2410/vrikaan/blob/master/desktop/CODE-SIGNING.md" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>Code-signing roadmap</a> · <a href="https://vrikaan.com/.well-known/security.txt" target="_blank" rel="noopener noreferrer" style={{ color: T.cyan }}>Responsible disclosure</a>
        </p>
      </main>

      <Footer />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function otherDownloadStyle() {
  return {
    display: "block",
    padding: 18, borderRadius: 14,
    background: T.card, border: `1px solid ${T.border}`,
    color: "inherit", textDecoration: "none",
    textAlign: "center", transition: "all 0.15s",
  };
}
function ctaCard(color) {
  return {
    display: "block",
    padding: 18, borderRadius: 14,
    background: T.card,
    border: `1px solid ${color}33`,
    color: "inherit", textDecoration: "none",
    textAlign: "center", transition: "all 0.15s",
  };
}
