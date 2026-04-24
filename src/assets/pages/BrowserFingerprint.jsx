import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { exportReport } from "../../utils/exportPDF";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

function getWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) return { renderer: "N/A", vendor: "N/A" };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "Hidden", vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "Hidden" };
  } catch { return { renderer: "N/A", vendor: "N/A" }; }
}

function getCanvasHash() {
  try {
    const c = document.createElement("canvas"); c.width = 200; c.height = 50;
    const ctx = c.getContext("2d");
    ctx.textBaseline = "top"; ctx.font = "14px Arial"; ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069"; ctx.fillText("VRIKAAN fp", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)"; ctx.fillText("test string", 4, 35);
    const data = c.toDataURL();
    let hash = 0; for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
    return Math.abs(hash).toString(16).toUpperCase();
  } catch { return "N/A"; }
}

export default function BrowserFingerprint() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const scan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 1500));
    const webgl = getWebGL();
    const canvas = getCanvasHash();
    const data = {
      system: [
        { label: "Platform", value: navigator.platform || "Unknown", risk: "low" },
        { label: "CPU Cores", value: navigator.hardwareConcurrency || "Unknown", risk: "medium" },
        { label: "Device Memory", value: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Hidden", risk: navigator.deviceMemory ? "medium" : "low" },
        { label: "Screen Resolution", value: `${screen.width}x${screen.height}`, risk: "medium" },
        { label: "Color Depth", value: `${screen.colorDepth}-bit`, risk: "low" },
        { label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone, risk: "medium" },
        { label: "Touch Support", value: `${navigator.maxTouchPoints} points`, risk: "low" },
      ],
      browser: [
        { label: "User Agent", value: navigator.userAgent.slice(0, 80) + "...", risk: "high" },
        { label: "Language", value: navigator.language, risk: "low" },
        { label: "Languages", value: (navigator.languages || []).join(", "), risk: "medium" },
        { label: "Cookies Enabled", value: navigator.cookieEnabled ? "Yes" : "No", risk: "low" },
        { label: "Do Not Track", value: navigator.doNotTrack === "1" ? "Enabled" : "Disabled", risk: navigator.doNotTrack === "1" ? "low" : "medium" },
        { label: "PDF Viewer", value: navigator.pdfViewerEnabled ? "Built-in" : "None", risk: "low" },
      ],
      privacy: [
        { label: "WebGL Renderer", value: webgl.renderer, risk: "high" },
        { label: "WebGL Vendor", value: webgl.vendor, risk: "high" },
        { label: "Canvas Fingerprint", value: canvas, risk: "high" },
        { label: "Ad Blocker", value: "Checking...", risk: "low" },
      ],
    };

    // Ad blocker check
    try {
      const testAd = document.createElement("div");
      testAd.innerHTML = "&nbsp;"; testAd.className = "adsbox ad-banner";
      testAd.style.cssText = "position:absolute;left:-9999px;";
      document.body.appendChild(testAd);
      await new Promise(r => setTimeout(r, 100));
      const blocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      data.privacy[3] = { label: "Ad Blocker", value: blocked ? "Detected" : "Not detected", risk: blocked ? "low" : "medium" };
    } catch { data.privacy[3] = { label: "Ad Blocker", value: "Unknown", risk: "low" }; }

    // Calculate uniqueness score
    const highRisk = [...data.system, ...data.browser, ...data.privacy].filter(i => i.risk === "high").length;
    const medRisk = [...data.system, ...data.browser, ...data.privacy].filter(i => i.risk === "medium").length;
    const score = Math.min(100, highRisk * 15 + medRisk * 8 + 10);

    setResult({ ...data, score, level: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low" });
    setScanning(false);
  };

  const doExport = () => {
    if (!result) return;
    exportReport({
      title: "Browser Fingerprint Report", subtitle: `Uniqueness Score: ${result.score}/100 (${result.level} Risk)`,
      sections: [
        { heading: "System", items: result.system.map(i => `${i.label}: ${i.value}`) },
        { heading: "Browser", items: result.browser.map(i => `${i.label}: ${i.value}`) },
        { heading: "Privacy", items: result.privacy.map(i => `${i.label}: ${i.value}`) },
      ],
      footer: "Generated by VRIKAAN",
    });
  };

  const riskColor = { low: T.green, medium: T.yellow, high: T.red };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <SEO title="Browser Fingerprint Test" description="Check how unique and trackable your browser is." path="/browser-fingerprint" />
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 20px 60px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Browser Fingerprint Test</h1>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Discover how unique and trackable your browser is across the web.</p>

        {!result && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <button onClick={scan} disabled={scanning} style={{ padding: "16px 40px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 18, fontWeight: 700, cursor: scanning ? "wait" : "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
              {scanning ? "Scanning your browser..." : "Scan My Browser"}
            </button>
            {scanning && <div style={{ marginTop: 20, color: T.muted, fontSize: 14 }}>Collecting fingerprint data...</div>}
          </div>
        )}

        {result && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
            {/* Score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${riskColor[result.level.toLowerCase()]}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: riskColor[result.level.toLowerCase()], fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{result.score}</span>
                  <span style={{ fontSize: 9, color: T.muted }}>/100</span>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.white }}>{result.level} Uniqueness</div>
                  <div style={{ fontSize: 13, color: T.muted }}>Your browser is {result.level === "High" ? "highly trackable" : result.level === "Medium" ? "somewhat trackable" : "relatively anonymous"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={doExport} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.muted, fontSize: 12, cursor: "pointer" }}>Export PDF</button>
                <button onClick={() => { setResult(null); scan(); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.muted, fontSize: 12, cursor: "pointer" }}>Rescan</button>
              </div>
            </div>

            {/* Sections */}
            {[{ title: "System Info", data: result.system }, { title: "Browser Info", data: result.browser }, { title: "Privacy Risks", data: result.privacy }].map(section => (
              <div key={section.title} style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 10 }}>{section.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.data.map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(15,23,42,0.5)", borderRadius: 8, border: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 13, color: T.muted }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: T.white, fontFamily: "'JetBrains Mono',monospace", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{item.value}</span>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: riskColor[item.risk], flexShrink: 0 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Recommendations */}
            <div style={{ padding: "16px", background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.1)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.accent, marginBottom: 8 }}>Reduce Your Fingerprint</h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.8 }}>
                <li>Use a privacy-focused browser like Firefox or Brave</li>
                <li>Enable "Resist Fingerprinting" in browser settings</li>
                <li>Use a VPN to mask your timezone and IP</li>
                <li>Install an ad/tracker blocker extension</li>
                <li>Disable WebGL if not needed</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
