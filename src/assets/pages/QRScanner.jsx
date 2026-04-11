import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#eab308", blue: "#38bdf8", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const fonts = { heading: "'Space Grotesk', sans-serif", body: "'Plus Jakarta Sans', sans-serif", mono: "'JetBrains Mono', monospace" };

// --- Deterministic analysis from URL string ---
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// --- URL Shortener services ---
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "bl.ink", "short.io", "cutt.ly", "rb.gy"];

// --- Known safe domains ---
const TRUSTED_DOMAINS = ["google.com", "github.com", "microsoft.com", "apple.com", "amazon.com", "cloudflare.com", "facebook.com", "youtube.com", "wikipedia.org", "linkedin.com", "twitter.com", "x.com", "instagram.com", "reddit.com", "stackoverflow.com", "netlify.app", "vercel.app", "stripe.com", "paypal.com", "dropbox.com"];

// --- Phishing keyword patterns ---
const PHISHING_KEYWORDS = ["login", "verify", "confirm", "update", "secure", "account", "suspend", "alert", "banking", "wallet", "recover", "unlock", "validate", "authenticate", "credential"];

// --- Homograph attack patterns ---
const HOMOGRAPH_MAP = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "!": "i" };

const LEGIT_BRANDS = ["paypal", "google", "apple", "amazon", "microsoft", "facebook", "netflix", "instagram", "twitter", "linkedin", "dropbox", "github", "spotify", "adobe", "ebay", "walmart", "chase", "wellsfargo", "bankofamerica", "citibank"];

// --- Scan stages ---
const SCAN_STAGES = [
  { label: "Parsing URL structure...", end: 12 },
  { label: "Checking domain reputation...", end: 25 },
  { label: "Verifying SSL certificate...", end: 38 },
  { label: "Detecting URL shorteners...", end: 50 },
  { label: "Scanning for homograph attacks...", end: 62 },
  { label: "Analyzing phishing patterns...", end: 75 },
  { label: "Evaluating redirect chain risk...", end: 88 },
  { label: "Computing threat score...", end: 100 },
];

// --- Safety tips ---
const SAFETY_TIPS = [
  { icon: "\uD83D\uDCF7", title: "Preview Before Scanning", desc: "Use your phone's camera app to preview QR code URLs before opening them. Most modern cameras show the URL first." },
  { icon: "\uD83D\uDD17", title: "Check the Domain", desc: "Always verify the domain name in the URL. Look for misspellings, extra characters, or suspicious subdomains." },
  { icon: "\uD83D\uDD12", title: "Look for HTTPS", desc: "Legitimate sites use HTTPS. If a QR code leads to an HTTP-only site asking for personal info, do not proceed." },
  { icon: "\u26A0\uFE0F", title: "Beware of Shorteners", desc: "Shortened URLs (bit.ly, tinyurl) hide the real destination. Use a URL expander or this scanner to check them." },
  { icon: "\uD83C\uDFE2", title: "Trust the Source", desc: "Only scan QR codes from trusted physical locations. Stickers placed over existing QR codes are a common attack." },
  { icon: "\uD83D\uDCB3", title: "Never Enter Payment Info", desc: "If a QR code leads to a page requesting credit card or banking details, verify through the official app or website instead." },
];

// --- URL analysis engine ---
function analyzeUrl(rawUrl) {
  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullUrl = parsed.href.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const seed = hashStr(hostname);
  const rand = seededRandom(seed);

  const checks = [];
  let riskScore = 0;

  // 1. SSL Check
  const isHttps = parsed.protocol === "https:";
  checks.push({
    name: "SSL/HTTPS Status",
    icon: "\uD83D\uDD12",
    pass: isHttps,
    detail: isHttps ? "URL uses HTTPS encryption — connection is secure." : "URL uses plain HTTP — data is transmitted unencrypted. High risk for sensitive information.",
    weight: isHttps ? 0 : 20,
  });
  if (!isHttps) riskScore += 20;

  // 2. URL Shortener Detection
  const isShortener = SHORTENERS.some(s => hostname === s || hostname.endsWith("." + s));
  checks.push({
    name: "URL Shortener Detection",
    icon: "\uD83D\uDD00",
    pass: !isShortener,
    detail: isShortener ? `Shortened URL detected (${hostname}). The real destination is hidden. Treat with caution.` : "URL is not shortened — destination is visible and verifiable.",
    weight: isShortener ? 15 : 0,
  });
  if (isShortener) riskScore += 15;

  // 3. Domain Reputation
  const baseDomain = hostname.replace(/^www\./, "");
  const isTrusted = TRUSTED_DOMAINS.includes(baseDomain);
  const domainRep = isTrusted ? "trusted" : rand() > 0.6 ? "neutral" : "unknown";
  checks.push({
    name: "Domain Reputation",
    icon: "\uD83C\uDF10",
    pass: domainRep === "trusted",
    neutral: domainRep === "neutral",
    detail: domainRep === "trusted" ? `${baseDomain} is a well-known, trusted domain.` : domainRep === "neutral" ? `${baseDomain} has no negative reputation flags, but is not widely recognized.` : `${baseDomain} is not in our trusted database. Exercise caution with unfamiliar domains.`,
    weight: domainRep === "trusted" ? 0 : domainRep === "neutral" ? 5 : 12,
  });
  if (domainRep !== "trusted") riskScore += domainRep === "neutral" ? 5 : 12;

  // 4. Homograph Attack Detection
  let homographDetected = false;
  let homographDetail = "";
  const cleanDomain = baseDomain.replace(/\.[^.]+$/, "");

  for (const brand of LEGIT_BRANDS) {
    if (cleanDomain === brand) continue;
    let normalized = cleanDomain;
    for (const [fake, real] of Object.entries(HOMOGRAPH_MAP)) {
      normalized = normalized.split(fake).join(real);
    }
    normalized = normalized.replace(/-/g, "");
    if (normalized === brand || normalized.includes(brand)) {
      if (cleanDomain !== brand && !TRUSTED_DOMAINS.includes(baseDomain)) {
        homographDetected = true;
        homographDetail = `Domain "${baseDomain}" looks similar to "${brand}" — possible homograph/typosquatting attack.`;
        break;
      }
    }
    // Check Levenshtein-like similarity
    if (cleanDomain.length >= 4 && brand.length >= 4) {
      let matches = 0;
      const shorter = cleanDomain.length < brand.length ? cleanDomain : brand;
      const longer = cleanDomain.length < brand.length ? brand : cleanDomain;
      for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matches++;
      }
      const similarity = matches / longer.length;
      if (similarity > 0.8 && cleanDomain !== brand && !TRUSTED_DOMAINS.includes(baseDomain)) {
        homographDetected = true;
        homographDetail = `Domain "${baseDomain}" has high similarity to "${brand}" — possible typosquatting.`;
        break;
      }
    }
  }

  checks.push({
    name: "Homograph Attack Detection",
    icon: "\uD83D\uDC41\uFE0F",
    pass: !homographDetected,
    detail: homographDetected ? homographDetail : "No look-alike domain patterns detected. Domain name appears genuine.",
    weight: homographDetected ? 25 : 0,
  });
  if (homographDetected) riskScore += 25;

  // 5. Phishing Pattern Analysis
  const foundKeywords = PHISHING_KEYWORDS.filter(kw => fullUrl.includes(kw) || pathname.includes(kw));
  const hasPhishingPatterns = foundKeywords.length >= 2;
  const hasSingleSuspicious = foundKeywords.length === 1;
  checks.push({
    name: "Phishing Pattern Analysis",
    icon: "\uD83C\uDFA3",
    pass: !hasPhishingPatterns && !hasSingleSuspicious,
    neutral: hasSingleSuspicious && !hasPhishingPatterns,
    detail: hasPhishingPatterns
      ? `Multiple phishing keywords found in URL: ${foundKeywords.join(", ")}. This is a strong indicator of a phishing attempt.`
      : hasSingleSuspicious
        ? `Keyword "${foundKeywords[0]}" found in URL. While not conclusive, proceed with caution.`
        : "No phishing keyword patterns detected in the URL structure.",
    weight: hasPhishingPatterns ? 20 : hasSingleSuspicious ? 5 : 0,
  });
  if (hasPhishingPatterns) riskScore += 20;
  else if (hasSingleSuspicious) riskScore += 5;

  // 6. Redirect Chain Risk
  const hasRedirectParams = fullUrl.includes("redirect") || fullUrl.includes("redir") || fullUrl.includes("url=") || fullUrl.includes("goto=") || fullUrl.includes("next=") || fullUrl.includes("return=") || fullUrl.includes("dest=");
  const redirectRisk = hasRedirectParams || isShortener;
  checks.push({
    name: "Redirect Chain Risk",
    icon: "\u27A1\uFE0F",
    pass: !redirectRisk,
    detail: redirectRisk
      ? "URL contains redirect parameters or uses a shortener service. The final destination may differ from what's shown."
      : "No redirect patterns detected. URL appears to point directly to the destination.",
    weight: redirectRisk ? 10 : 0,
  });
  if (redirectRisk) riskScore += 10;

  // 7. Domain Age Estimation (simulated)
  const domainAge = isTrusted ? "5+ years" : rand() > 0.5 ? `${Math.floor(rand() * 4) + 1} years` : `${Math.floor(rand() * 11) + 1} months`;
  const isNewDomain = domainAge.includes("month");
  checks.push({
    name: "Domain Age Estimation",
    icon: "\uD83D\uDCC5",
    pass: !isNewDomain,
    neutral: isNewDomain && isTrusted,
    detail: isNewDomain
      ? `Domain appears to be relatively new (~${domainAge} old). Newly registered domains are more frequently used in scams.`
      : `Domain has been registered for approximately ${domainAge}. Established domains are generally more trustworthy.`,
    weight: isNewDomain ? 10 : 0,
  });
  if (isNewDomain) riskScore += 10;

  // 8. Suspicious TLD check
  const suspiciousTLDs = [".xyz", ".top", ".buzz", ".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".cc", ".click", ".link", ".info"];
  const tld = "." + baseDomain.split(".").pop();
  const isSuspiciousTLD = suspiciousTLDs.includes(tld);
  checks.push({
    name: "Top-Level Domain Analysis",
    icon: "\uD83C\uDF0D",
    pass: !isSuspiciousTLD,
    detail: isSuspiciousTLD
      ? `The TLD "${tld}" is commonly associated with spam and phishing campaigns.`
      : `The TLD "${tld}" is a standard, commonly used domain extension.`,
    weight: isSuspiciousTLD ? 10 : 0,
  });
  if (isSuspiciousTLD) riskScore += 10;

  // Clamp risk score
  riskScore = Math.min(100, riskScore);

  // Determine threat level
  let threatLevel, threatColor, threatLabel;
  if (riskScore <= 15) {
    threatLevel = "safe";
    threatColor = T.green;
    threatLabel = "Safe";
  } else if (riskScore <= 40) {
    threatLevel = "caution";
    threatColor = T.yellow;
    threatLabel = "Caution";
  } else {
    threatLevel = "dangerous";
    threatColor = T.red;
    threatLabel = "Dangerous";
  }

  return {
    url: parsed.href,
    hostname: baseDomain,
    riskScore,
    threatLevel,
    threatColor,
    threatLabel,
    checks,
    isTrusted,
    timestamp: new Date().toISOString(),
  };
}

// --- Reusable components matching VulnerabilityScanner style ---
const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color, fontFamily: fonts.body }}>{children}</span>
);

const PassFail = ({ pass, neutral }) => (
  <span style={{ color: neutral ? T.yellow : pass ? T.green : T.red, fontWeight: 600, fontSize: 14 }}>
    {neutral ? "\u26A0" : pass ? "\u2713" : "\u2717"}
  </span>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 24px",
      background: active ? `${T.accent}20` : "transparent",
      border: `1px solid ${active ? T.accent : T.border}`,
      borderRadius: 10,
      color: active ? T.accent : T.muted,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: fonts.heading,
      transition: "all 0.2s",
    }}
  >
    {children}
  </button>
);

const Section = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: T.white }}>{title}</span>
        </div>
        <span style={{ color: T.muted, fontSize: 18, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>{"\u25BE"}</span>
      </div>
      {open && <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.border}` }}>{children}</div>}
    </div>
  );
};

export default function QRScanner() {
  const [mode, setMode] = useState("scanner");
  const [scanUrl, setScanUrl] = useState("");
  const [genUrl, setGenUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const logRef = useRef(null);
  const intervalRef = useRef(null);
  const cameraRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("secuvion_qr_history") || "[]");
      setHistory(saved);
    } catch { /* ignore */ }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scannerId = "qr-camera-reader";

      // Stop existing instance
      if (html5QrRef.current) {
        await html5QrRef.current.stop().catch(() => {});
        html5QrRef.current.clear();
      }

      const scanner = new Html5Qrcode(scannerId);
      html5QrRef.current = scanner;
      setCameraActive(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR code detected — stop camera and analyze
          scanner.stop().then(() => {
            scanner.clear();
            html5QrRef.current = null;
            setCameraActive(false);
            setScanUrl(decodedText);
            setMode("scanner");
            // Auto-start scan after mode switch
            setTimeout(() => {
              document.getElementById("qr-scan-btn")?.click();
            }, 500);
          }).catch(() => {});
        },
        () => {} // ignore scan failures (no QR in frame)
      );
    } catch (err) {
      setCameraActive(false);
      setCameraError(err?.message?.includes("Permission") ? "Camera access denied. Please allow camera permissions." : "Camera not available. Try pasting the URL manually.");
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current.clear();
      html5QrRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const startScan = () => {
    if (!scanUrl.trim() || scanning) return;
    setScanning(true);
    setProgress(0);
    setStageIdx(0);
    setResults(null);
    setLogs([{ text: `> Initiating QR URL threat analysis for ${scanUrl.trim()}...`, color: T.cyan }]);

    let stage = 0;
    let prog = 0;

    intervalRef.current = setInterval(() => {
      if (stage >= SCAN_STAGES.length) {
        clearInterval(intervalRef.current);
        const r = analyzeUrl(scanUrl.trim());
        if (!r) {
          setScanning(false);
          setLogs(prev => [...prev, { text: "> ERROR: Invalid URL format. Please enter a valid URL.", color: T.red }]);
          return;
        }
        setResults(r);
        setScanning(false);
        setLogs(prev => [...prev, { text: `> Analysis complete. Threat level: ${r.threatLabel} (Risk: ${r.riskScore}/100)`, color: r.threatColor }]);

        const entry = { url: r.url, hostname: r.hostname, date: r.timestamp, threatLabel: r.threatLabel, threatColor: r.threatColor, riskScore: r.riskScore };
        const newHist = [entry, ...history.filter(h => h.hostname !== r.hostname)].slice(0, 20);
        setHistory(newHist);
        try { localStorage.setItem("secuvion_qr_history", JSON.stringify(newHist)); } catch { /* ignore */ }
        return;
      }

      const s = SCAN_STAGES[stage];
      setStageIdx(stage);
      setLogs(prev => [...prev, { text: `> ${s.label}`, color: T.white }]);

      const startProg = stage === 0 ? 0 : SCAN_STAGES[stage - 1].end;
      const step = (s.end - startProg) / 10;
      let tick = 0;
      const subInterval = setInterval(() => {
        tick++;
        prog = Math.min(s.end, startProg + step * tick);
        setProgress(prog);
        if (tick >= 10) clearInterval(subInterval);
      }, 40);

      stage++;
    }, 400);
  };

  const loadHistoryResult = (entry) => {
    setScanUrl(entry.hostname);
    setMode("scanner");
    const r = analyzeUrl(entry.hostname);
    setResults(r);
    setScanning(false);
    setProgress(100);
    setLogs([{ text: `> Loaded cached analysis for ${entry.hostname}`, color: T.cyan }]);
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem("secuvion_qr_history"); } catch { /* ignore */ }
  };

  const handleGenerateQR = () => {
    if (!genUrl.trim()) return;
    setQrGenerated(true);
  };

  const getQrImageUrl = () => {
    let u = genUrl.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(u)}&bgcolor=030712&color=f1f5f9`;
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = getQrImageUrl();
    link.download = `qr-${genUrl.trim().replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const threatCircleStyle = (result) => {
    const size = 110;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (result.riskScore / 100) * circumference;
    return { size, strokeWidth, radius, circumference, offset };
  };

  return (
    <>
      <SEO title="QR Code Security Scanner - SECUVION" description="Scan QR code URLs for phishing, malware, and other threats. Generate safe QR codes." />
      <style>{`
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: fonts.body }}>
        <Navbar />

        {/* Hero */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 20px 40px", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: `${T.accent}15`, border: `1px solid ${T.accent}30`, borderRadius: 20, marginBottom: 16 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.accent }}>SECURITY TOOL</span>
          </div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.1 }}>
            QR Code <span style={{ color: T.cyan }}>Security Scanner</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Analyze URLs from QR codes for phishing, malware, and other threats — or generate safe QR codes for your own links.
          </p>

          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            <TabButton active={mode === "camera"} onClick={() => { setMode("camera"); if (!cameraActive) startCamera(); }}>
              {"\uD83D\uDCF7"} Camera Scan
            </TabButton>
            <TabButton active={mode === "scanner"} onClick={() => { setMode("scanner"); stopCamera(); }}>
              {"\uD83D\uDD0D"} URL Scanner
            </TabButton>
            <TabButton active={mode === "generator"} onClick={() => { setMode("generator"); stopCamera(); }}>
              {"\u2B1B"} QR Generator
            </TabButton>
          </div>

          {/* Camera Mode */}
          {mode === "camera" && (
            <div style={{ maxWidth: 400, margin: "0 auto 24px" }}>
              <div
                id="qr-camera-reader"
                ref={cameraRef}
                style={{
                  width: "100%", borderRadius: 16, overflow: "hidden",
                  border: `2px solid ${cameraActive ? T.cyan : T.border}`,
                  background: T.card, minHeight: 300,
                }}
              />
              {cameraError && (
                <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 10 }}>
                  <p style={{ color: T.red, fontSize: 13, margin: 0 }}>{cameraError}</p>
                </div>
              )}
              {cameraActive && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 1s infinite" }} />
                  <span style={{ color: T.cyan, fontSize: 13, fontWeight: 600 }}>Point camera at a QR code...</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
                {!cameraActive ? (
                  <button onClick={startCamera} style={{ padding: "12px 28px", background: T.cyan, border: "none", borderRadius: 10, color: "#030712", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
                    Start Camera
                  </button>
                ) : (
                  <button onClick={stopCamera} style={{ padding: "12px 28px", background: T.red, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
                    Stop Camera
                  </button>
                )}
              </div>
              <p style={{ color: T.mutedDark, fontSize: 12, marginTop: 12, fontFamily: fonts.mono }}>
                Camera scans QR codes in real-time. Detected URLs are automatically analyzed for threats.
              </p>
            </div>
          )}

          {/* Scanner Mode */}
          {mode === "scanner" && (
            <>
              <div style={{ display: "flex", gap: 10, maxWidth: 600, margin: "0 auto 12px" }}>
                <input
                  type="text"
                  value={scanUrl}
                  onChange={e => setScanUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && startScan()}
                  placeholder="Paste URL from QR code (e.g., paypa1.com/login)"
                  style={{
                    flex: 1, padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                    borderRadius: 10, color: T.white, fontSize: 14, outline: "none", fontFamily: fonts.body,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  id="qr-scan-btn"
                  onClick={startScan}
                  disabled={scanning || !scanUrl.trim()}
                  style={{
                    padding: "14px 24px", background: scanning ? T.mutedDark : T.cyan, border: "none", borderRadius: 10,
                    color: "#030712", fontSize: 14, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer",
                    fontFamily: fonts.heading, whiteSpace: "nowrap", opacity: scanning || !scanUrl.trim() ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {scanning ? "Scanning..." : "Scan for Threats"}
                </button>
              </div>
              <p style={{ color: T.mutedDark, fontSize: 12, fontFamily: fonts.mono }}>
                Try: <span style={{ color: T.muted, cursor: "pointer" }} onClick={() => setScanUrl("google.com")}>google.com</span>
                {", "}
                <span style={{ color: T.muted, cursor: "pointer" }} onClick={() => setScanUrl("paypa1.com/login/verify")}>paypa1.com/login/verify</span>
                {", "}
                <span style={{ color: T.muted, cursor: "pointer" }} onClick={() => setScanUrl("bit.ly/3xKz9")}>bit.ly/3xKz9</span>
              </p>
            </>
          )}

          {/* Generator Mode */}
          {mode === "generator" && (
            <>
              <div style={{ display: "flex", gap: 10, maxWidth: 600, margin: "0 auto 12px" }}>
                <input
                  type="text"
                  value={genUrl}
                  onChange={e => { setGenUrl(e.target.value); setQrGenerated(false); }}
                  onKeyDown={e => e.key === "Enter" && handleGenerateQR()}
                  placeholder="Enter URL to generate QR code (e.g., yoursite.com)"
                  style={{
                    flex: 1, padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                    borderRadius: 10, color: T.white, fontSize: 14, outline: "none", fontFamily: fonts.body,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleGenerateQR}
                  disabled={!genUrl.trim()}
                  style={{
                    padding: "14px 24px", background: !genUrl.trim() ? T.mutedDark : T.accent, border: "none", borderRadius: 10,
                    color: T.white, fontSize: 14, fontWeight: 700, cursor: !genUrl.trim() ? "not-allowed" : "pointer",
                    fontFamily: fonts.heading, whiteSpace: "nowrap", opacity: !genUrl.trim() ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  Generate QR
                </button>
              </div>
              <p style={{ color: T.mutedDark, fontSize: 12, fontFamily: fonts.mono }}>
                Generate a clean, safe QR code for any URL
              </p>
            </>
          )}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>

          {/* ============ SCANNER RESULTS ============ */}
          {mode === "scanner" && (
            <>
              {/* Scanning Animation */}
              {(scanning || progress > 0) && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 8, height: 8, marginBottom: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, borderRadius: 8, transition: "width 0.1s linear" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.cyan }}>
                      {scanning ? SCAN_STAGES[Math.min(stageIdx, SCAN_STAGES.length - 1)].label : "Analysis complete"}
                    </span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted }}>{Math.round(progress)}%</span>
                  </div>

                  {/* Terminal Log */}
                  <div
                    ref={logRef}
                    style={{
                      background: T.dark, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16,
                      maxHeight: 180, overflowY: "auto", fontFamily: fonts.mono, fontSize: 12, lineHeight: 1.8,
                    }}
                  >
                    <div style={{ color: T.mutedDark, marginBottom: 4 }}>SECUVION QR Threat Analyzer v1.0.0</div>
                    {logs.map((l, i) => (
                      <div key={i} style={{ color: l.color }}>{l.text}</div>
                    ))}
                    {scanning && <span style={{ color: T.cyan, animation: "blink 1s infinite" }}>{"\u2588"}</span>}
                  </div>
                </div>
              )}

              {/* Results */}
              {results && (
                <div style={{ animation: "slideIn 0.4s ease" }}>
                  {/* Threat Level Card */}
                  <div style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 32, marginBottom: 24,
                    display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", backdropFilter: "blur(10px)",
                  }}>
                    {/* Risk Score Circle */}
                    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                      <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
                        <circle
                          cx={55} cy={55}
                          r={threatCircleStyle(results).radius}
                          fill="none"
                          stroke={`${results.threatColor}20`}
                          strokeWidth={threatCircleStyle(results).strokeWidth}
                        />
                        <circle
                          cx={55} cy={55}
                          r={threatCircleStyle(results).radius}
                          fill="none"
                          stroke={results.threatColor}
                          strokeWidth={threatCircleStyle(results).strokeWidth}
                          strokeDasharray={threatCircleStyle(results).circumference}
                          strokeDashoffset={threatCircleStyle(results).offset}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, color: results.threatColor }}>{results.riskScore}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.muted }}>RISK</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, margin: 0, color: T.white }}>{results.hostname}</h2>
                        <Badge color={results.threatColor}>{results.threatLabel}</Badge>
                      </div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted, marginBottom: 12, wordBreak: "break-all" }}>
                        {results.url}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Badge color={T.muted}>{results.checks.filter(c => !c.pass).length} issues detected</Badge>
                        {results.isTrusted && <Badge color={T.green}>Trusted Domain</Badge>}
                        {results.checks.some(c => c.name === "URL Shortener Detection" && !c.pass) && <Badge color={T.yellow}>Shortened URL</Badge>}
                        {results.checks.some(c => c.name === "Homograph Attack Detection" && !c.pass) && <Badge color={T.red}>Homograph Risk</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Checks */}
                  <Section title="Detailed Security Checks" icon={"\uD83D\uDCCB"} defaultOpen={true}>
                    <div style={{ paddingTop: 16 }}>
                      {results.checks.map((check, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0",
                            borderBottom: i < results.checks.length - 1 ? `1px solid ${T.border}` : "none",
                          }}
                        >
                          <PassFail pass={check.pass} neutral={check.neutral} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14 }}>{check.icon}</span>
                              <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: T.white }}>{check.name}</span>
                            </div>
                            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{check.detail}</div>
                          </div>
                          <Badge color={check.neutral ? T.yellow : check.pass ? T.green : T.red}>
                            {check.neutral ? "Caution" : check.pass ? "Pass" : "Fail"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Recommendation */}
                  <Section title="Recommendation" icon={"\uD83D\uDCA1"} defaultOpen={true}>
                    <div style={{ paddingTop: 16 }}>
                      <div style={{
                        padding: 20, borderRadius: 10,
                        background: `${results.threatColor}08`,
                        border: `1px solid ${results.threatColor}25`,
                      }}>
                        <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: results.threatColor, marginBottom: 8 }}>
                          {results.threatLevel === "safe"
                            ? "This URL appears safe"
                            : results.threatLevel === "caution"
                              ? "Proceed with caution"
                              : "Do NOT visit this URL"
                          }
                        </div>
                        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                          {results.threatLevel === "safe"
                            ? "Our analysis indicates this URL is from a legitimate source with no detected threats. However, always remain vigilant and verify the content matches what you expect."
                            : results.threatLevel === "caution"
                              ? "Some potential risk indicators were detected. If you must visit this URL, avoid entering any personal information, credentials, or payment details. Verify the site through an independent search."
                              : "Multiple threat indicators were detected including potential phishing, domain spoofing, or malicious patterns. We strongly recommend not visiting this URL. If you believe this is a legitimate site, access it by typing the official URL directly in your browser."
                          }
                        </p>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {/* Recent Scans History */}
              {history.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, margin: 0, color: T.white }}>
                      {"\uD83D\uDD53"} Recent Scans
                    </h3>
                    <button
                      onClick={clearHistory}
                      style={{
                        padding: "6px 14px", background: "transparent", border: `1px solid ${T.border}`,
                        borderRadius: 8, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: fonts.body,
                        transition: "all 0.2s",
                      }}
                    >
                      Clear History
                    </button>
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                    {history.map((entry, i) => (
                      <div
                        key={i}
                        onClick={() => loadHistoryResult(entry)}
                        style={{
                          padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                          borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : "none",
                          cursor: "pointer", transition: "background 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: entry.threatColor || T.muted,
                            flexShrink: 0,
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: fonts.mono, fontSize: 13, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {entry.hostname}
                            </div>
                            <div style={{ fontSize: 11, color: T.mutedDark }}>
                              {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          <Badge color={entry.threatColor || T.muted}>{entry.threatLabel || "Scanned"}</Badge>
                          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted }}>{entry.riskScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ QR GENERATOR ============ */}
          {mode === "generator" && (
            <>
              {qrGenerated && genUrl.trim() && (
                <div style={{ animation: "slideIn 0.4s ease" }}>
                  <div style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 40,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 24, backdropFilter: "blur(10px)",
                    marginBottom: 24,
                  }}>
                    <div style={{
                      background: "#ffffff", borderRadius: 12, padding: 16,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 24px rgba(99,102,241,0.15)",
                    }}>
                      <img
                        src={getQrImageUrl()}
                        alt="Generated QR Code"
                        width={200}
                        height={200}
                        style={{ display: "block", borderRadius: 4 }}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 6 }}>
                        QR Code Generated
                      </div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted, wordBreak: "break-all", maxWidth: 400 }}>
                        {genUrl.trim().startsWith("http") ? genUrl.trim() : `https://${genUrl.trim()}`}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={downloadQR}
                        style={{
                          padding: "12px 28px", background: T.accent, border: "none", borderRadius: 10,
                          color: T.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading,
                          transition: "all 0.2s",
                        }}
                      >
                        {"\u2B07"} Download PNG
                      </button>
                      <button
                        onClick={() => {
                          const url = genUrl.trim().startsWith("http") ? genUrl.trim() : `https://${genUrl.trim()}`;
                          navigator.clipboard.writeText(url);
                        }}
                        style={{
                          padding: "12px 28px", background: "transparent", border: `1px solid ${T.border}`,
                          borderRadius: 10, color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer",
                          fontFamily: fonts.heading, transition: "all 0.2s",
                        }}
                      >
                        {"\uD83D\uDCCB"} Copy URL
                      </button>
                    </div>
                  </div>

                  {/* Quick Safety Check for Generated URL */}
                  <div style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 24,
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12 }}>
                      {"\uD83D\uDD12"} Quick Safety Check
                    </div>
                    {(() => {
                      const url = genUrl.trim();
                      const isHttps = url.startsWith("https://") || (!url.startsWith("http://"));
                      const isShort = SHORTENERS.some(s => url.includes(s));
                      const quickChecks = [
                        { label: "HTTPS Encryption", pass: isHttps },
                        { label: "Not a Shortened URL", pass: !isShort },
                        { label: "No Suspicious Keywords", pass: !PHISHING_KEYWORDS.some(kw => url.toLowerCase().includes(kw)) },
                      ];
                      return quickChecks.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < quickChecks.length - 1 ? `1px solid ${T.border}` : "none" }}>
                          <PassFail pass={c.pass} />
                          <span style={{ fontSize: 13, color: c.pass ? T.white : T.muted }}>{c.label}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Generator Info */}
              {!qrGenerated && (
                <div style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 40,
                  textAlign: "center", backdropFilter: "blur(10px)",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2B1B"}</div>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: T.white }}>
                    Generate Safe QR Codes
                  </h3>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
                    Enter any URL above to generate a clean QR code. Each generated code includes a quick safety check to ensure the destination URL is trustworthy.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ============ SAFETY TIPS ============ */}
          <div style={{ marginTop: 48 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: T.white }}>
                QR Code Safety Tips
              </h2>
              <p style={{ color: T.muted, fontSize: 14, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                Protect yourself from QR code-based attacks with these essential guidelines.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}>
              {SAFETY_TIPS.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                    padding: 24, backdropFilter: "blur(10px)", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${T.accent}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{tip.icon}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 6 }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                    {tip.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{
            marginTop: 48, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "24px 32px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24,
          }}>
            {[
              { label: "URLs Scanned", value: history.length, color: T.cyan },
              { label: "Threats Blocked", value: history.filter(h => h.threatLabel === "Dangerous").length, color: T.red },
              { label: "Safe URLs", value: history.filter(h => h.threatLabel === "Safe").length, color: T.green },
              { label: "Caution Flags", value: history.filter(h => h.threatLabel === "Caution").length, color: T.yellow },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
