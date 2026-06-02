import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ThreatMapLive from "../../components/ThreatMapLive";
import SEO from "../../components/SEO";
import { LuCircleAlert, LuRadar, LuActivity, LuGlobe, LuTag } from "react-icons/lu";

const T = { bg: "#060a14", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14b8a6", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", green: "#22c55e", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const cities = [
  { n: "New York", x: 27, y: 36 }, { n: "London", x: 47, y: 27 }, { n: "Moscow", x: 60, y: 25 },
  { n: "Mumbai", x: 66, y: 48 }, { n: "Tokyo", x: 83, y: 33 }, { n: "Sao Paulo", x: 31, y: 66 },
  { n: "Sydney", x: 85, y: 73 }, { n: "Lagos", x: 49, y: 53 }, { n: "Singapore", x: 75, y: 55 },
  { n: "Berlin", x: 51, y: 27 }, { n: "Dubai", x: 61, y: 42 }, { n: "Seoul", x: 80, y: 34 },
];
const types = ["MALWARE", "PHISHING", "DDOS", "RANSOMWARE", "EXPLOIT"];
const typeColors = { MALWARE: T.red, PHISHING: T.gold, DDOS: T.ember, RANSOMWARE: T.purple, EXPLOIT: T.blue };
const THREAT_LEVEL_COLORS = { critical: T.red, elevated: T.ember, guarded: T.gold, low: T.green };

export default function ThreatMap() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(2843921);
  const [activeFilters, setActiveFilters] = useState(new Set(types));
  const [realData, setRealData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch real threat intelligence
  useEffect(() => {
    fetch("/api/threats").then(r => r.json()).then(setRealData).catch(() => {});
    const iv = setInterval(() => {
      fetch("/api/threats").then(r => r.json()).then(setRealData).catch(() => {});
    }, 300000); // refresh every 5 min
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const c1 = setInterval(() => setCount(c => c + Math.floor(Math.random() * 15) + 3), 1500);
    const add = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      if (from.n === to.n) return;
      const type = types[Math.floor(Math.random() * types.length)];
      setEvents(prev => [...prev.slice(-20), { id: Date.now() + Math.random(), from, to, type, time: new Date().toLocaleTimeString("en-US", { hour12: false }), severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)], port: [22, 80, 443, 445, 3389, 8080, 8443, 3306, 5432, 6379][Math.floor(Math.random() * 10)] }]);
    };
    const iv = setInterval(add, 1200);
    add(); setTimeout(add, 300); setTimeout(add, 700);
    return () => { clearInterval(iv); clearInterval(c1); };
  }, []);

  const toggleFilter = (t) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const filteredEvents = events.filter(e => activeFilters.has(e.type));
  const threatLevel = realData?.threatLevel || "elevated";
  const threatColor = THREAT_LEVEL_COLORS[threatLevel] || T.ember;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Live Threat Map" description="Real-time global cyber threat visualization with live intelligence from abuse.ch, URLhaus, and Feodo Tracker." path="/threat-map" />
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.red}0c`, border: `1px solid ${T.red}20`, fontSize: 11, fontWeight: 600, color: T.red, marginBottom: 16, letterSpacing: 0.5 }}>Live Intelligence</span>
          <h1 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Global Cyber Threat Map</h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>Real-time visualization powered by live threat intelligence feeds from URLhaus & Feodo Tracker.</p>
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", marginBottom: 12, borderRadius: 12, background: `${threatColor}08`, border: `1px solid ${threatColor}18`, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: threatColor, animation: "tm-blink 1.5s infinite" }} />
            <span style={{ color: threatColor, fontWeight: 600, fontSize: 13 }}>Threat Level: {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)}</span>
            {realData?.feeds?.length > 0 && (
              <span style={{ fontSize: 10, color: T.mutedDark, marginLeft: 4 }}>({realData.feeds.join(" + ")})</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Vrikaan Sans', sans-serif", color: T.white, fontWeight: 700, fontSize: 16 }}>{count.toLocaleString()}</span>
            <span style={{ color: T.mutedDark, fontSize: 12 }}>attacks today</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => toggleFilter(t)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Vrikaan Mono', monospace", letterSpacing: 0.5, transition: "all 0.2s",
              background: activeFilters.has(t) ? `${typeColors[t]}18` : "rgba(148,163,184,0.04)",
              border: `1px solid ${activeFilters.has(t) ? `${typeColors[t]}40` : T.border}`,
              color: activeFilters.has(t) ? typeColors[t] : T.mutedDark,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeFilters.has(t) ? typeColors[t] : T.mutedDark, display: "inline-block", marginRight: 6 }} />
              {t}
            </button>
          ))}
          <button onClick={() => setActiveFilters(activeFilters.size === types.length ? new Set() : new Set(types))} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, color: T.muted,
            fontFamily: "'Vrikaan Sans', sans-serif",
          }}>
            {activeFilters.size === types.length ? "Clear All" : "Select All"}
          </button>
        </div>

        {/* Map */}
        <div style={{ position: "relative", height: 500, borderRadius: 18, overflow: "hidden", border: `1px solid rgba(20, 184, 166,0.06)`, boxShadow: "0 8px 40px rgba(0,0,0,0.3)", marginBottom: 24 }}>
          <ThreatMapLive events={events} />
        </div>

        {/* Real-time Stats Cards */}
        {realData && (
          <div className="resp-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Active Threats", value: realData.stats.totalThreats || 0, color: T.red, Icon: LuCircleAlert },
              { label: "Malware URLs", value: realData.stats.malwareUrls || 0, color: T.ember, Icon: LuRadar },
              { label: "Botnet C&Cs", value: realData.stats.botnets || 0, color: T.purple, Icon: LuActivity },
              { label: "Countries Hit", value: Object.keys(realData.stats.countries).length || 0, color: T.cyan, Icon: LuGlobe },
            ].map((s, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
                <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}><s.Icon size={18} color={s.color} /></div>
                <div style={{ fontFamily: "'Vrikaan Sans'", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.mutedDark, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom panels — 3 columns */}
        <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Attack Vectors */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 18px" }}>Attack Vectors</h3>
            {types.map(t => {
              const pct = [0.3, 0.25, 0.18, 0.12, 0.15][types.indexOf(t)];
              const val = Math.floor(count * pct);
              return (
                <div key={t} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[t] }} />
                      <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 12, color: T.white }}>{t}</span>
                    </div>
                    <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 12, color: typeColors[t], fontWeight: 600 }}>{val.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(148,163,184,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct * 333}%`, background: typeColors[t], borderRadius: 2, opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Feed */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>Live Feed</h3>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.red, fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "tm-blink 1.5s infinite" }} />Live
              </span>
            </div>
            <div style={{ maxHeight: 280, overflow: "auto" }}>
              {filteredEvents.slice().reverse().map(e => (
                <div key={e.id} onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                  style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[e.type] }} />
                    <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 9, color: typeColors[e.type], fontWeight: 700, letterSpacing: 1 }}>{e.type}</span>
                    <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 8, color: T.mutedDark, marginLeft: "auto" }}>{e.time}</span>
                  </div>
                  <div style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 11, color: T.mutedDark, paddingLeft: 12 }}>
                    <span style={{ color: T.white }}>{e.from.n}</span> <span style={{ color: T.red }}>&rarr;</span> <span style={{ color: T.white }}>{e.to.n}</span>
                  </div>
                  {selectedEvent?.id === e.id && (
                    <div style={{ padding: "8px 12px", marginTop: 6, background: "rgba(15,23,42,0.6)", borderRadius: 8, fontSize: 11 }}>
                      <div style={{ color: T.muted, marginBottom: 4 }}>Severity: <span style={{ color: e.severity === "Critical" ? T.red : e.severity === "High" ? T.ember : T.gold, fontWeight: 600 }}>{e.severity}</span></div>
                      <div style={{ color: T.muted }}>Target Port: <span style={{ color: T.cyan, fontWeight: 600 }}>{e.port}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Targeted Countries (real data) */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>Top Countries</h3>
              {realData && <span style={{ fontSize: 10, color: T.cyan, fontWeight: 600 }}>REAL DATA</span>}
            </div>
            {realData?.topCountries?.length > 0 ? (
              realData.topCountries.slice(0, 8).map((c, i) => {
                const maxCount = realData.topCountries[0]?.count || 1;
                return (
                  <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: T.white, fontWeight: 600 }}>
                        <span style={{ color: T.mutedDark, fontSize: 10, marginRight: 8 }}>#{i + 1}</span>
                        {c.country || "Unknown"}
                      </span>
                      <span style={{ fontFamily: "'Vrikaan Mono'", fontSize: 12, color: T.red, fontWeight: 600 }}>{c.count}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(148,163,184,0.06)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${(c.count / maxCount) * 100}%`, background: `linear-gradient(90deg, ${T.red}, ${T.ember})`, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: 20, color: T.mutedDark, fontSize: 12 }}>Loading real threat data...</div>
            )}
            {realData?.recentMalware?.length > 0 && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.05)", borderRadius: 8, border: `1px solid ${T.red}15` }}>
                <div style={{ fontSize: 10, color: T.red, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>LATEST MALWARE URL</div>
                <div style={{ fontFamily: "'Vrikaan Mono'", fontSize: 10, color: T.muted, wordBreak: "break-all" }}>
                  {realData.recentMalware[0]?.url?.substring(0, 60)}...
                </div>
                <div style={{ fontSize: 10, color: T.mutedDark, marginTop: 4 }}>
                  Country: {realData.recentMalware[0]?.country || "Unknown"} | Status: <span style={{ color: T.red }}>{realData.recentMalware[0]?.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real Threat Intel Feed */}
        {realData?.recentMalware?.length > 0 && (
          <div style={{ marginTop: 24, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 16, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <LuRadar size={16} color={T.red} /> Real-Time Malware Feed
              </h3>
              <span style={{ fontSize: 10, color: T.cyan, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: `${T.cyan}10`, border: `1px solid ${T.cyan}20` }}>URLhaus — LIVE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {realData.recentMalware.slice(0, 6).map((m, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(15,23,42,0.4)", borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: "uppercase" }}>{m.threat || "malware"}</span>
                    <span style={{ fontSize: 10, color: m.status === "online" ? T.red : T.green, fontWeight: 600 }}>{m.status}</span>
                  </div>
                  <div style={{ fontFamily: "'Vrikaan Mono'", fontSize: 10, color: T.muted, wordBreak: "break-all", marginBottom: 6 }}>
                    {m.url?.substring(0, 70)}{m.url?.length > 70 ? "..." : ""}
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: T.mutedDark }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuGlobe size={11} /> {m.country || "Unknown"}</span>
                    {m.tags?.length > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuTag size={11} /> {m.tags.slice(0, 2).join(", ")}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
  @keyframes tm-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @media (max-width: 960px) {
    .resp-grid-3 { grid-template-columns: 1fr !important; }
    .resp-grid-4 { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 560px) {
    .resp-grid-4 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}
