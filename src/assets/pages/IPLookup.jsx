import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { saveToolResult } from "../../services/toolHistoryService";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", gold: "#eab308", blue: "#38bdf8", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const fonts = { heading: "'Space Grotesk', sans-serif", body: "'Plus Jakarta Sans', sans-serif", mono: "'JetBrains Mono', monospace" };

const COUNTRY_FLAGS = {
  US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}", DE: "\u{1F1E9}\u{1F1EA}", FR: "\u{1F1EB}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}",
  CN: "\u{1F1E8}\u{1F1F3}", IN: "\u{1F1EE}\u{1F1F3}", BR: "\u{1F1E7}\u{1F1F7}", CA: "\u{1F1E8}\u{1F1E6}", AU: "\u{1F1E6}\u{1F1FA}",
  RU: "\u{1F1F7}\u{1F1FA}", KR: "\u{1F1F0}\u{1F1F7}", IT: "\u{1F1EE}\u{1F1F9}", ES: "\u{1F1EA}\u{1F1F8}", NL: "\u{1F1F3}\u{1F1F1}",
  SE: "\u{1F1F8}\u{1F1EA}", SG: "\u{1F1F8}\u{1F1EC}", IE: "\u{1F1EE}\u{1F1EA}", FI: "\u{1F1EB}\u{1F1EE}", NO: "\u{1F1F3}\u{1F1F4}",
  CH: "\u{1F1E8}\u{1F1ED}", PL: "\u{1F1F5}\u{1F1F1}", MX: "\u{1F1F2}\u{1F1FD}", AR: "\u{1F1E6}\u{1F1F7}", ZA: "\u{1F1FF}\u{1F1E6}",
};

const DATACENTER_KEYWORDS = ["amazon", "aws", "google", "microsoft", "azure", "digitalocean", "linode", "vultr", "ovh", "hetzner", "cloudflare", "akamai", "fastly", "oracle", "ibm", "rackspace", "hostinger", "godaddy", "namecheap", "contabo"];

const VPN_KEYWORDS = ["vpn", "proxy", "tor", "private", "relay", "tunnel", "nord", "express", "surfshark", "mullvad", "proton"];

function getFlag(countryCode) {
  if (!countryCode) return "\u{1F310}";
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || "\u{1F310}";
}

function assessThreat(data) {
  if (!data || data.status === "fail") return { level: "Unknown", color: T.muted, score: 0, reasons: ["Lookup failed"] };

  const reasons = [];
  let score = 0;
  const isp = (data.isp || "").toLowerCase();
  const org = (data.org || "").toLowerCase();
  const combined = isp + " " + org;

  const isDatacenter = DATACENTER_KEYWORDS.some(k => combined.includes(k));
  const isVpn = VPN_KEYWORDS.some(k => combined.includes(k));
  const isMobile = combined.includes("mobile") || combined.includes("cellular") || combined.includes("wireless");

  if (isDatacenter) {
    score += 40;
    reasons.push("IP belongs to a datacenter/cloud provider");
  }
  if (isVpn) {
    score += 35;
    reasons.push("Possible VPN or proxy service detected");
  }
  if (isMobile) {
    score -= 10;
    reasons.push("Mobile/cellular network (lower risk)");
  }
  if (data.hosting) {
    score += 25;
    reasons.push("Hosting provider IP (non-residential)");
  }
  if (data.proxy) {
    score += 30;
    reasons.push("Known proxy detected");
  }

  if (reasons.length === 0) {
    reasons.push("Residential ISP - standard risk profile");
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  let level, color;
  if (score >= 70) { level = "High"; color = T.red; }
  else if (score >= 40) { level = "Medium"; color = T.gold; }
  else if (score >= 20) { level = "Low"; color = T.cyan; }
  else { level = "Minimal"; color = T.green; }

  return { level, color, score, reasons };
}

function MiniMap({ lat, lon }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || lat == null || lon == null) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Dark background
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = "rgba(99,102,241,0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 12; i++) {
      const x = (w / 12) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (h / 6) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw simplified continents as blocks
    const drawContinent = (regions) => {
      ctx.fillStyle = "rgba(99,102,241,0.15)";
      regions.forEach(([rx, ry, rw, rh]) => {
        const px = ((rx + 180) / 360) * w;
        const py = ((90 - ry) / 180) * h;
        const pw = (rw / 360) * w;
        const ph = (rh / 180) * h;
        ctx.fillRect(px, py, pw, ph);
      });
    };

    // Rough continent outlines as rectangles
    drawContinent([
      [-130, 55, 60, 25], [-110, 40, 45, 20], [-90, 25, 25, 15], // North America
      [-80, 5, 30, 10], [-70, -5, 25, 15], [-60, -20, 20, 25], [-55, -35, 15, 10], // South America
      [-10, 55, 35, 15], [0, 45, 40, 12], [20, 55, 30, 10], // Europe
      [-15, 25, 55, 20], [10, 5, 35, 20], [25, -10, 20, 20], [30, -25, 10, 10], // Africa
      [40, 35, 60, 20], [60, 20, 40, 15], [75, 10, 30, 15], [100, 25, 25, 20], [120, 30, 15, 10], // Asia
      [110, -15, 30, 15], [135, -25, 15, 10], // Australia
    ]);

    // Convert lat/lon to pixel position
    const px = ((lon + 180) / 360) * w;
    const py = ((90 - lat) / 180) * h;

    // Pulse ring
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,227,197,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,227,197,0.25)";
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = T.cyan;
    ctx.fill();

    // Crosshair
    ctx.strokeStyle = "rgba(20,227,197,0.4)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
    ctx.setLineDash([]);

    // Coordinate label
    ctx.fillStyle = T.cyan;
    ctx.font = "10px 'JetBrains Mono', monospace";
    const label = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const labelX = Math.min(px + 8, w - ctx.measureText(label).width - 4);
    const labelY = Math.max(py - 8, 12);
    ctx.fillText(label, labelX, labelY);

  }, [lat, lon]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      style={{ width: "100%", maxWidth: 400, height: "auto", borderRadius: 8, border: `1px solid ${T.border}` }}
    />
  );
}

const InfoRow = ({ label, value, mono = false, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ color: T.muted, fontSize: 13, fontFamily: fonts.body }}>{label}</span>
    <span style={{ color: color || T.white, fontSize: 13, fontWeight: 500, fontFamily: mono ? fonts.mono : fonts.body, textAlign: "right", maxWidth: "60%", wordBreak: "break-all" }}>{value || "N/A"}</span>
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color, fontFamily: fonts.body }}>{children}</span>
);

const Card = ({ title, icon, children }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, height: "100%" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: T.white }}>{title}</span>
    </div>
    {children}
  </div>
);

const ThreatBar = ({ score, color }) => (
  <div style={{ width: "100%", height: 6, background: "rgba(148,163,184,0.1)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
    <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
  </div>
);

export default function IPLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [myIpLoading, setMyIpLoading] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  // Loading dots animation
  useEffect(() => {
    if (!loading && !myIpLoading) return;
    const interval = setInterval(() => setDotCount(p => (p + 1) % 4), 400);
    return () => clearInterval(interval);
  }, [loading, myIpLoading]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("secuvion_ip_history") || "[]");
      setHistory(saved);
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (entry) => {
    const updated = [entry, ...history.filter(h => h.query !== entry.query)].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem("secuvion_ip_history", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const performLookup = async (target) => {
    const trimmed = (target || "").trim();
    setError("");
    setResult(null);

    if (!trimmed && target !== "") {
      setError("Please enter a valid IP address or domain name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = trimmed ? `/api/ip?q=${encodeURIComponent(trimmed)}` : `/api/ip`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.status === "fail") {
        setError(data.message || "Lookup failed. Please check the IP address or domain name.");
        setLoading(false);
        return;
      }

      const threat = assessThreat(data);
      const resultData = { ...data, threat };
      setResult(resultData);
      saveToolResult(
        "IP Lookup",
        trimmed || data.query,
        `${data.query} - ${data.city || "Unknown"}, ${data.country || "Unknown"} | ISP: ${data.isp || "Unknown"} | Risk: ${threat.level} (${threat.score}/100)`,
        threat.score >= 70 ? "error" : threat.score >= 40 ? "warning" : "success"
      );

      saveHistory({
        query: trimmed || data.query,
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        city: data.city,
        isp: data.isp,
        date: new Date().toISOString(),
      });

    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    }

    setLoading(false);
  };

  const checkMyIp = async () => {
    setMyIpLoading(true);
    setQuery("");
    await performLookup("");
    setMyIpLoading(false);
  };

  const handleSubmit = () => {
    if (!query.trim() || loading) return;
    performLookup(query.trim());
  };

  const loadFromHistory = (entry) => {
    setQuery(entry.query);
    performLookup(entry.query);
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem("secuvion_ip_history"); } catch { /* ignore */ }
  };

  const dots = ".".repeat(dotCount);

  return (
    <>
      <SEO title="IP Lookup - SECUVION" description="Look up any IP address or domain for geolocation, ISP, threat assessment and more." />
      <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: fonts.body }}>
        <Navbar />

        {/* Hero */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 20px 40px", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: `${T.accent}15`, border: `1px solid ${T.accent}30`, borderRadius: 20, marginBottom: 16 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.accent }}>INTELLIGENCE TOOL</span>
          </div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.1 }}>
            IP Address & Domain <span style={{ color: T.accent }}>Lookup</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Investigate any IP address or domain name for geolocation, ISP details, and threat intelligence
          </p>

          {/* Search Input */}
          <div style={{ display: "flex", gap: 10, maxWidth: 640, margin: "0 auto 12px", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Enter IP address or domain (e.g., 8.8.8.8 or google.com)"
              style={{
                flex: 1, minWidth: 260, padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                borderRadius: 10, color: T.white, fontSize: 14, outline: "none", fontFamily: fonts.body, boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
              style={{
                padding: "14px 28px", background: loading ? T.mutedDark : T.accent, border: "none", borderRadius: 10,
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: fonts.heading, whiteSpace: "nowrap", opacity: loading || !query.trim() ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? `Looking up${dots}` : "\u{1F50D} Lookup"}
            </button>
            <button
              onClick={checkMyIp}
              disabled={loading || myIpLoading}
              style={{
                padding: "14px 20px", background: "transparent", border: `1px solid ${T.cyan}40`,
                borderRadius: 10, color: T.cyan, fontSize: 14, fontWeight: 600, cursor: loading || myIpLoading ? "not-allowed" : "pointer",
                fontFamily: fonts.heading, whiteSpace: "nowrap", opacity: myIpLoading ? 0.6 : 1, transition: "all 0.2s",
              }}
            >
              {myIpLoading ? `Checking${dots}` : "\u{1F310} Check My IP"}
            </button>
          </div>
          <p style={{ color: T.mutedDark, fontSize: 12, fontFamily: fonts.mono }}>
            Try:{" "}
            <span style={{ color: T.muted, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => { setQuery("8.8.8.8"); performLookup("8.8.8.8"); }}>8.8.8.8</span>
            {", "}
            <span style={{ color: T.muted, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => { setQuery("1.1.1.1"); performLookup("1.1.1.1"); }}>1.1.1.1</span>
            {", "}
            <span style={{ color: T.muted, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => { setQuery("cloudflare.com"); performLookup("cloudflare.com"); }}>cloudflare.com</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ maxWidth: 900, margin: "0 auto 20px", padding: "0 20px" }}>
            <div style={{ background: `${T.red}12`, border: `1px solid ${T.red}30`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{"\u26A0\uFE0F"}</span>
              <span style={{ color: T.red, fontSize: 14, fontFamily: fonts.body }}>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !result && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 40px", textAlign: "center" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40 }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 16px", border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "iplookup-spin 1s linear infinite" }} />
              <p style={{ color: T.muted, fontSize: 14, fontFamily: fonts.mono }}>Resolving and fetching data{dots}</p>
            </div>
            <style>{`@keyframes iplookup-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 60px" }}>

            {/* Quick Summary Bar */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {getFlag(result.countryCode)}
                </div>
                <div>
                  <span style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 700, color: T.white }}>{result.query}</span>
                  <p style={{ color: T.muted, fontSize: 12, margin: "2px 0 0", fontFamily: fonts.body }}>
                    {result.city}{result.city && result.regionName ? ", " : ""}{result.regionName}{(result.city || result.regionName) && result.country ? " \u2014 " : ""}{result.country}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge color={result.threat.color}>{result.threat.level} Risk</Badge>
                <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted }}>{result.isp}</span>
              </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>

              {/* Network Info */}
              <Card title="Network Information" icon={"\u{1F4E1}"}>
                <InfoRow label="IP Address" value={result.query} mono />
                <InfoRow label="ISP" value={result.isp} />
                <InfoRow label="Organization" value={result.org} />
                <InfoRow label="AS Number" value={result.as} mono />
                <InfoRow label="Reverse DNS" value={result.reverse || "No PTR record"} mono />
                <InfoRow label="Proxy Detected" value={result.proxy ? "Yes" : "No"} color={result.proxy ? T.red : T.green} />
                <InfoRow label="Hosting/DC" value={result.hosting ? "Yes" : "No"} color={result.hosting ? T.gold : T.green} />
              </Card>

              {/* Geolocation */}
              <Card title="Geolocation" icon={"\u{1F4CD}"}>
                <InfoRow label="Country" value={`${getFlag(result.countryCode)} ${result.country} (${result.countryCode})`} />
                <InfoRow label="Region" value={result.regionName || "N/A"} />
                <InfoRow label="City" value={result.city || "N/A"} />
                <InfoRow label="ZIP / Postal" value={result.zip || "N/A"} mono />
                <InfoRow label="Latitude" value={result.lat != null ? result.lat.toFixed(4) : "N/A"} mono color={T.cyan} />
                <InfoRow label="Longitude" value={result.lon != null ? result.lon.toFixed(4) : "N/A"} mono color={T.cyan} />
                <InfoRow label="Timezone" value={result.timezone || "N/A"} />
              </Card>
            </div>

            {/* Map & Threat Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>

              {/* Map */}
              <Card title="Location Map" icon={"\u{1F5FA}\uFE0F"}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <MiniMap lat={result.lat} lon={result.lon} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: T.muted }}>
                    {result.lat != null ? `${result.lat.toFixed(4)}° N, ${result.lon.toFixed(4)}° ${result.lon >= 0 ? "E" : "W"}` : "Coordinates unavailable"}
                  </span>
                </div>
              </Card>

              {/* Threat Assessment */}
              <Card title="Threat Assessment" icon={"\u{1F6E1}\uFE0F"}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
                    background: `${result.threat.color}15`, border: `3px solid ${result.threat.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column",
                  }}>
                    <span style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: result.threat.color }}>{result.threat.score}</span>
                    <span style={{ fontSize: 9, color: T.muted, fontFamily: fonts.mono }}>/ 100</span>
                  </div>
                  <Badge color={result.threat.color}>{result.threat.level} Risk</Badge>
                  <ThreatBar score={result.threat.score} color={result.threat.color} />
                </div>

                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
                  <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 12, color: T.white, display: "block", marginBottom: 8 }}>Analysis Factors:</span>
                  {result.threat.reasons.map((reason, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: result.threat.color, fontSize: 10, marginTop: 4 }}>{"\u25CF"}</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: "10px 14px", background: `${result.threat.color}08`, border: `1px solid ${result.threat.color}20`, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: T.muted, fontFamily: fonts.body, lineHeight: 1.5 }}>
                    {result.threat.score >= 70
                      ? "This IP shows characteristics of a datacenter or proxy service. It may be used for automated requests, scraping, or masking identity."
                      : result.threat.score >= 40
                      ? "This IP has some characteristics that suggest non-residential usage. Moderate caution is advised."
                      : "This IP appears to be a standard residential or business connection with low risk indicators."}
                  </span>
                </div>
              </Card>
            </div>

            {/* Raw Data */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>{"\u{1F4CB}"}</span>
                <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: T.white }}>Raw API Response</span>
              </div>
              <pre style={{
                background: T.dark, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16,
                fontFamily: fonts.mono, fontSize: 12, color: T.cyan, overflow: "auto",
                lineHeight: 1.6, margin: 0, maxHeight: 300,
              }}>
                {JSON.stringify({
                  ip: result.query,
                  country: result.country,
                  countryCode: result.countryCode,
                  region: result.regionName,
                  city: result.city,
                  zip: result.zip,
                  lat: result.lat,
                  lon: result.lon,
                  timezone: result.timezone,
                  isp: result.isp,
                  org: result.org,
                  as: result.as,
                  reverse: result.reverse,
                  proxy: result.proxy,
                  hosting: result.hosting,
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 60px" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{"\u{1F553}"}</span>
                  <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: T.white }}>Recent Lookups</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>({history.length})</span>
                </div>
                <button
                  onClick={clearHistory}
                  style={{
                    padding: "6px 12px", background: `${T.red}15`, border: `1px solid ${T.red}25`, borderRadius: 6,
                    color: T.red, fontSize: 11, cursor: "pointer", fontFamily: fonts.body, fontWeight: 600,
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {history.map((entry, i) => (
                  <div
                    key={i}
                    onClick={() => loadFromHistory(entry)}
                    style={{
                      background: T.dark, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px",
                      cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.accent}40`; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.dark; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${T.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {getFlag(entry.countryCode)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 600, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.query}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.city && `${entry.city}, `}{entry.country} {"\u2022"} {entry.isp}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: T.mutedDark, fontFamily: fonts.mono, flexShrink: 0 }}>
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no result */}
        {!result && !loading && !error && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {[
                { icon: "\u{1F4CD}", title: "Geolocation", desc: "Find the physical location of any IP address including country, region, and city." },
                { icon: "\u{1F4E1}", title: "Network Details", desc: "Discover ISP, organization, AS number, and reverse DNS information." },
                { icon: "\u{1F6E1}\uFE0F", title: "Threat Intel", desc: "Assess risk level based on IP type - datacenter, proxy, VPN, or residential." },
                { icon: "\u{1F5FA}\uFE0F", title: "Visual Mapping", desc: "See the approximate location plotted on an interactive world map visualization." },
              ].map((f, i) => (
                <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: T.white, margin: "0 0 8px" }}>{f.title}</h3>
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Info notice */}
            <div style={{ marginTop: 32, background: `${T.accent}08`, border: `1px solid ${T.accent}18`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{"\u{2139}\uFE0F"}</span>
              <div>
                <p style={{ color: T.white, fontSize: 13, fontWeight: 600, margin: "0 0 4px", fontFamily: fonts.heading }}>About This Tool</p>
                <p style={{ color: T.muted, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                  This tool uses ip-api.com for geolocation data. Results are approximate and based on publicly available information.
                  IP geolocation accuracy varies by region and ISP. No data is stored on our servers - all history is saved locally in your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
