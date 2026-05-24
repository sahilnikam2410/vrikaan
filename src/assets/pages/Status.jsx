import { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  white: "#f1f5f9", muted: "#94a3b8", green: "#22c55e",
  orange: "#f97316", red: "#ef4444", border: "rgba(148,163,184,0.1)",
  cyan: "#14e3c5", accent: "#6366f1",
};

const ENDPOINTS = [
  { name: "Web", path: "/", method: "GET", expect: "ok" },
  { name: "AI Chat",          path: "/api/chat",                     method: "OPTIONS", expect: "any" },
  { name: "Cashfree Order",   path: "/api/create-checkout-session",  method: "OPTIONS", expect: "any" },
  { name: "Cashfree Verify",  path: "/api/verify-payment",           method: "OPTIONS", expect: "any" },
  { name: "Cashfree Webhook", path: "/api/cashfree-webhook",         method: "GET",     expect: "405" },
  { name: "Tools Dispatcher", path: "/api/tools",                    method: "GET",     expect: "400" },
  { name: "Threats DB",       path: "/api/threats",                  method: "GET",     expect: "ok" },
  { name: "URL Scanner",      path: "/api/scan-url",                 method: "OPTIONS", expect: "any" },
  { name: "SSL Check",        path: "/api/ssl",                      method: "OPTIONS", expect: "any" },
  { name: "Identity X-Ray",   path: "/api/identity-xray",            method: "OPTIONS", expect: "any" },
  { name: "Breach Check",     path: "/api/breach",                   method: "OPTIONS", expect: "any" },
  { name: "OG Image",         path: "/api/og?title=Status",          method: "GET",     expect: "ok" },
  { name: "Cron Digest",      path: "/api/cron-digest",              method: "GET",     expect: "401" },
];

// ── 90-day uptime history (client-side localStorage) ─────────────────
const HISTORY_KEY = "vrk_status_v1";
const HISTORY_DAYS = 90;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch { return {}; }
}

function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function appendCheck(history, endpointName, ok) {
  const day = todayISO();
  const list = history[endpointName] ? [...history[endpointName]] : [];
  const last = list[list.length - 1];
  if (last && last.d === day) {
    last.total = (last.total || 0) + 1;
    last.fails = (last.fails || 0) + (ok ? 0 : 1);
  } else {
    list.push({ d: day, total: 1, fails: ok ? 0 : 1 });
  }
  // Keep only last HISTORY_DAYS entries
  while (list.length > HISTORY_DAYS) list.shift();
  return { ...history, [endpointName]: list };
}

function dailyBars(endpointHistory) {
  // Return array of HISTORY_DAYS items, indexed oldest-first.
  // Each: { d, status: 'ok' | 'degraded' | 'down' | 'none' }
  const map = new Map((endpointHistory || []).map(e => [e.d, e]));
  const out = [];
  const today = new Date();
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10);
    const rec = map.get(d);
    if (!rec || !rec.total) out.push({ d, status: "none" });
    else {
      const failRate = rec.fails / rec.total;
      const status = failRate === 0 ? "ok"
        : failRate < 0.2 ? "degraded"
        : "down";
      out.push({ d, status, total: rec.total, fails: rec.fails });
    }
  }
  return out;
}

function uptimePct(endpointHistory) {
  const bars = dailyBars(endpointHistory).filter(b => b.status !== "none");
  if (bars.length === 0) return null;
  const okDays = bars.filter(b => b.status === "ok").length;
  return (okDays / bars.length) * 100;
}

function aggregateUptime(history) {
  // Average of per-endpoint uptime across all endpoints w/ data
  const pcts = ENDPOINTS.map(ep => uptimePct(history[ep.name])).filter(p => p != null);
  if (pcts.length === 0) return null;
  return pcts.reduce((a, b) => a + b, 0) / pcts.length;
}

async function pingOne(ep) {
  const start = performance.now();
  try {
    const res = await fetch(ep.path, {
      method: ep.method,
      headers: { "Content-Type": "application/json" },
    });
    const ms = Math.round(performance.now() - start);
    const status = res.status;
    let healthy = false;
    if (ep.expect === "ok") healthy = res.ok;
    else if (ep.expect === "any") healthy = true;
    else if (typeof ep.expect === "string") healthy = String(status) === ep.expect;
    return { ok: healthy, status, ms };
  } catch (e) {
    return { ok: false, status: 0, ms: Math.round(performance.now() - start), error: e.message };
  }
}

// ── Sub-components ────────────────────────────────────────────────────
function UptimeBars({ history, color = T.green }) {
  const bars = dailyBars(history);
  return (
    <div style={{
      display: "flex", gap: 2, alignItems: "flex-end",
      height: 28, padding: "2px 0",
    }}>
      {bars.map((b, i) => {
        const bg = b.status === "ok" ? T.green
                 : b.status === "degraded" ? T.orange
                 : b.status === "down" ? T.red
                 : "rgba(148,163,184,0.18)";
        return (
          <div
            key={i}
            title={
              b.status === "none"
                ? `${b.d} — no data`
                : `${b.d} — ${b.status} (${b.total - b.fails}/${b.total} checks ok)`
            }
            style={{
              flex: 1,
              minWidth: 2,
              maxWidth: 6,
              height: b.status === "none" ? "30%" : "100%",
              background: bg,
              borderRadius: 2,
              transition: "opacity 0.15s",
              opacity: b.status === "none" ? 0.4 : 0.85,
              cursor: "help",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = b.status === "none" ? 0.4 : 0.85; }}
          />
        );
      })}
    </div>
  );
}

function TrustBadge({ label, value, color, sub }) {
  return (
    <div style={{
      padding: "14px 18px", borderRadius: 14,
      background: T.card, border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", gap: 14,
      minWidth: 0,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, fontWeight: 800, flexShrink: 0,
        fontFamily: "'Space Grotesk', sans-serif",
      }}>✓</div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 18, fontWeight: 800, color: T.white,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: -0.3, lineHeight: 1.1,
        }}>{value}</div>
        <div style={{
          fontSize: 11, color: T.muted, marginTop: 4,
          letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600,
        }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Status() {
  const [results, setResults] = useState({});
  const [history, setHistory] = useState(() => loadHistory());
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const runAll = useCallback(async () => {
    setRunning(true);
    const next = {};
    let h = loadHistory();
    for (const ep of ENDPOINTS) {
      const r = await pingOne(ep);
      next[ep.name] = r;
      h = appendCheck(h, ep.name, r.ok);
      setResults({ ...next });
    }
    saveHistory(h);
    setHistory(h);
    setLastRun(new Date());
    setRunning(false);
  }, []);

  useEffect(() => {
    runAll();
    const id = setInterval(runAll, 60000);
    return () => clearInterval(id);
  }, [runAll]);

  const totalUp = Object.values(results).filter((r) => r.ok).length;
  const totalDown = Object.values(results).filter((r) => r && !r.ok).length;
  const overallStatus =
    totalDown === 0 && totalUp === ENDPOINTS.length ? "operational" :
    totalDown > 0 && totalDown < ENDPOINTS.length / 3 ? "degraded" :
    totalDown >= ENDPOINTS.length / 3 ? "outage" : "checking";

  const statusColor = {
    operational: T.green, degraded: T.orange, outage: T.red, checking: T.muted,
  }[overallStatus];
  const statusLabel = {
    operational: "All Systems Operational",
    degraded: "Partial Degradation",
    outage: "Major Outage",
    checking: "Checking…",
  }[overallStatus];

  const overall90d = useMemo(() => aggregateUptime(history), [history]);

  const avgMs = useMemo(() => {
    const arr = Object.values(results).map(r => r?.ms).filter(Boolean);
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  }, [results]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="System Status"
        description="Real-time uptime + 90-day history for every VRIKAAN service. Live pings of each API endpoint, aggregate uptime, p50 latency."
        path="/status"
      />
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "12px 24px", borderRadius: 100,
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}40`,
              marginBottom: 18,
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 12px ${statusColor}`,
                animation: overallStatus === "operational" ? "statusPulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 800, color: T.white,
              margin: "0 0 8px", fontFamily: "'Space Grotesk', sans-serif",
            }}>System Status</h1>
            <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
              Live health of every public endpoint. Auto-refreshes every 60s.
              {lastRun && ` Last checked: ${lastRun.toLocaleTimeString()}`}
            </p>
            <button
              onClick={runAll}
              disabled={running}
              style={{
                marginTop: 16, padding: "8px 20px", borderRadius: 8,
                background: "rgba(99,102,241,0.1)", border: `1px solid ${T.border}`,
                color: T.cyan, fontSize: 13, fontWeight: 600, cursor: running ? "wait" : "pointer",
                fontFamily: "inherit", opacity: running ? 0.6 : 1,
              }}
            >
              {running ? "Checking…" : "↻ Refresh now"}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12, marginBottom: 32,
          }}>
            <TrustBadge
              label="Uptime · 90 days"
              value={overall90d != null ? `${overall90d.toFixed(2)}%` : "—"}
              color={overall90d == null ? T.muted : overall90d >= 99 ? T.green : overall90d >= 95 ? T.orange : T.red}
              sub={overall90d == null ? "Building history…" : "SLA target: 99.5%"}
            />
            <TrustBadge
              label="Avg latency"
              value={avgMs ? `${avgMs}ms` : "—"}
              color={avgMs == null ? T.muted : avgMs < 300 ? T.green : avgMs < 700 ? T.orange : T.red}
              sub={avgMs ? (avgMs < 300 ? "Fast" : avgMs < 700 ? "Acceptable" : "Slow") : "Measuring…"}
            />
            <TrustBadge
              label="Security"
              value="AAL2"
              color={T.cyan}
              sub="NIST · RFC 6238 TOTP · HSTS"
            />
            <TrustBadge
              label="Services"
              value={`${totalUp}/${ENDPOINTS.length}`}
              color={totalDown === 0 ? T.green : totalDown < 3 ? T.orange : T.red}
              sub="Live pinged this minute"
            />
          </div>

          {/* 90-day legend */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
            marginBottom: 12, fontSize: 12, color: T.muted, flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ fontWeight: 700, color: T.white, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>
              Last 90 days per endpoint
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: T.green, display: "inline-block" }} />Operational
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: T.orange, display: "inline-block" }} />Degraded
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: T.red, display: "inline-block" }} />Down
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(148,163,184,0.18)", display: "inline-block" }} />No data
              </span>
            </div>
          </div>

          {/* Endpoint list w/ uptime bars */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, overflow: "hidden",
          }}>
            {ENDPOINTS.map((ep, i) => {
              const r = results[ep.name];
              const color = !r ? T.muted : r.ok ? T.green : T.red;
              const label = !r ? "checking…" : r.ok ? "operational" : `down (${r.status || "—"})`;
              const pct = uptimePct(history[ep.name]);
              const pctColor = pct == null ? T.muted : pct >= 99 ? T.green : pct >= 95 ? T.orange : T.red;
              return (
                <div key={ep.name} style={{
                  padding: "16px 18px",
                  borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                }}>
                  {/* Row 1: name + status */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 14, marginBottom: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: color, boxShadow: r?.ok ? `0 0 8px ${color}` : "none",
                        flexShrink: 0,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{ep.name}</div>
                        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{ep.path}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
                      {r?.ms != null && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{r.ms}ms</div>}
                    </div>
                  </div>
                  {/* Row 2: 90-day bars + uptime % */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    paddingLeft: 22,
                  }}>
                    <div style={{ flex: 1 }}>
                      <UptimeBars history={history[ep.name]} color={color} />
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: pctColor,
                      fontFamily: "'JetBrains Mono', monospace",
                      minWidth: 56, textAlign: "right",
                    }}>
                      {pct == null ? "—" : `${pct.toFixed(2)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Methodology footer */}
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 12,
            background: "rgba(2,6,23,0.5)", border: `1px solid ${T.border}`,
            fontSize: 12, color: T.muted, lineHeight: 1.7,
          }}>
            <div style={{ color: T.white, fontWeight: 700, marginBottom: 8, fontSize: 13 }}>How this page works</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Each endpoint is pinged live from <strong style={{ color: T.cyan }}>your browser</strong> every 60 seconds. No backend cache.</li>
              <li><strong style={{ color: T.cyan }}>90-day history</strong> is computed from your local check log (stored in your browser). A day shows green if 100% of checks passed, amber if {">"}80% passed, red otherwise.</li>
              <li><strong style={{ color: T.cyan }}>Aggregate uptime</strong> = average of per-endpoint uptime across all services with recorded history.</li>
              <li>Issues on this page may not reflect global availability — try refreshing or checking from a different network.</li>
              <li>For real outage reports, contact <a href="mailto:hello.vrikaan@gmail.com" style={{ color: T.cyan, textDecoration: "none" }}>hello.vrikaan@gmail.com</a>.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      <style>{`
        @keyframes statusPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
