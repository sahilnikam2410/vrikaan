import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { mapEvents, summarizeEvents, bucketByTime, severityBand, SEVERITY_BANDS } from "../../utils/socMapper";
import { MITRE_TACTICS, MITRE_TECHNIQUES, buildMitreHeatmap, topTactic } from "../../utils/mitreData";
import { FRAMEWORKS, scoreAllFrameworks } from "../../utils/complianceData";

const T = { bg: "#030712", panel: "rgba(17,24,39,0.85)", cardBorder: "rgba(148,163,184,0.1)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24", blue: "#3b82f6", purple: "#a855f7", white: "#f1f5f9", muted: "#94a3b8", subtle: "#64748b" };

const TABS = [
  { id: "overview",   label: "Overview",         icon: "📊" },
  { id: "events",     label: "Security Events",  icon: "🚨" },
  { id: "vulns",      label: "Vulnerabilities",  icon: "🛡" },
  { id: "mitre",      label: "MITRE ATT&CK",     icon: "🎯" },
  { id: "compliance", label: "Compliance",       icon: "✅" },
  { id: "agents",     label: "Agents",           icon: "💻" },
];

const TIME_RANGES = [
  { id: "1h",  label: "1h",  ms:      60 * 60 * 1000 },
  { id: "6h",  label: "6h",  ms:  6 * 60 * 60 * 1000 },
  { id: "24h", label: "24h", ms: 24 * 60 * 60 * 1000 },
  { id: "7d",  label: "7d",  ms:  7 * 24 * 60 * 60 * 1000 },
  { id: "30d", label: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
];

// ────────────────────────────────────────────────────────────────────
// Tiny SVG charts (no external dep, keep bundle lean)
// ────────────────────────────────────────────────────────────────────

function Sparkline({ values, color, w = 240, h = 70 }) {
  if (!values?.length) return null;
  const max = Math.max(...values, 1);
  const step = w / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`);
  const area = `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
  const line = `M${pts.join(" L")}`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={line} stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function Donut({ data, size = 130 }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="14" />
      {data.map((d, i) => {
        if (!d.value) return null;
        const start = (acc / total) * 2 * Math.PI;
        acc += d.value;
        const end = (acc / total) * 2 * Math.PI;
        const x1 = cx + r * Math.sin(start), y1 = cy - r * Math.cos(start);
        const x2 = cx + r * Math.sin(end),   y2 = cy - r * Math.cos(end);
        const large = end - start > Math.PI ? 1 : 0;
        return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={d.color} strokeWidth="14" fill="none" />;
      })}
      <text x={cx} y={cy + 6} textAnchor="middle" fill={T.white} fontSize="22" fontWeight="700" fontFamily="'Hanken Grotesk'">{total}</text>
    </svg>
  );
}

function HBar({ items, color = T.cyan }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((i) => (
        <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <span style={{ width: 110, color: T.muted, fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.label}</span>
          <div style={{ flex: 1, height: 12, background: "rgba(15,23,42,0.6)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(i.value / max) * 100}%`, height: "100%", background: color }} />
          </div>
          <span style={{ width: 28, color: T.white, fontWeight: 700, textAlign: "right" }}>{i.value}</span>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Top bar — global filters
// ────────────────────────────────────────────────────────────────────

function TopBar({ range, setRange, sevFilter, setSevFilter, agentFilter, setAgentFilter, agents, onRefresh, lastUpdate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "rgba(3,7,18,0.6)", border: `1px solid ${T.cardBorder}`, borderRadius: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 10px ${T.green}` }} />
        <span style={{ color: T.green, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
      </div>

      {/* Time range */}
      <div style={{ display: "flex", gap: 2, padding: 2, background: "rgba(15,23,42,0.6)", borderRadius: 6 }}>
        {TIME_RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} style={{
            padding: "5px 10px", borderRadius: 4, border: "none", fontSize: 11, fontWeight: 600,
            background: range === r.id ? T.cyan : "transparent",
            color: range === r.id ? T.bg : T.muted,
            cursor: "pointer", fontFamily: "'JetBrains Mono'",
          }}>{r.label}</button>
        ))}
      </div>

      {/* Severity */}
      <div style={{ display: "flex", gap: 4 }}>
        {[null, "critical", "high", "medium", "low"].map((s) => (
          <button key={s || "all"} onClick={() => setSevFilter(s)} style={{
            padding: "5px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
            border: sevFilter === s ? `1px solid ${s ? severityBand({ critical: 14, high: 12, medium: 8, low: 4 }[s] || 0).color : T.cyan}` : `1px solid ${T.cardBorder}`,
            background: "rgba(15,23,42,0.6)", color: s ? severityBand({ critical: 14, high: 12, medium: 8, low: 4 }[s] || 0).color : T.muted,
            cursor: "pointer",
          }}>{s ? s.toUpperCase() : "ALL"}</button>
        ))}
      </div>

      {/* Agent filter */}
      <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{
        padding: "6px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono'",
        background: "rgba(15,23,42,0.6)", border: `1px solid ${T.cardBorder}`, color: T.white,
      }}>
        <option value="all">All agents ({agents.length})</option>
        {agents.map((a) => <option key={a} value={a}>{a.slice(0, 24)}</option>)}
      </select>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: T.muted }}>
        {lastUpdate && <span>Updated: <span style={{ color: T.cyan }}>{lastUpdate.toLocaleTimeString("en-IN")}</span></span>}
        <button onClick={onRefresh} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.cyan, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Refresh</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — Overview
// ────────────────────────────────────────────────────────────────────

function OverviewTab({ events, summary, sparkline }) {
  const top = topTactic(events);
  const sevDonut = SEVERITY_BANDS.map((b) => ({ label: b.label, value: summary.severity[b.label] || 0, color: b.color }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
      {/* Total events tile with sparkline */}
      <div style={{ ...panelStyle(), padding: 18 }}>
        <div style={tileLabel}>Events</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: T.cyan, fontFamily: "'Hanken Grotesk'" }}>{summary.total}</span>
          <span style={{ fontSize: 12, color: T.muted }}>in window</span>
        </div>
        <Sparkline values={sparkline} color={T.cyan} />
      </div>

      {/* Severity donut */}
      <div style={{ ...panelStyle(), padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <Donut data={sevDonut} size={120} />
        <div style={{ flex: 1 }}>
          <div style={tileLabel}>Severity Distribution</div>
          {sevDonut.map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
              <span style={{ color: T.muted, textTransform: "capitalize", flex: 1 }}>{d.label}</span>
              <span style={{ color: T.white, fontWeight: 700 }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top tactic */}
      <div style={panelStyle()}>
        <div style={{ padding: 18 }}>
          <div style={tileLabel}>Top MITRE Tactic</div>
          {top ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Hanken Grotesk'", marginTop: 4 }}>{top.short}</div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono'", marginTop: 2 }}>{top.id} · {top.count} event{top.count === 1 ? "" : "s"}</div>
            </>
          ) : <div style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>No tactic activity in window.</div>}
        </div>
      </div>

      {/* Top tactics horizontal bar */}
      <div style={{ ...panelStyle(), padding: 18, gridColumn: "span 2" }}>
        <div style={tileLabel}>Top tactics by event count</div>
        <div style={{ marginTop: 10 }}>
          <HBar
            items={summary.topTactics.map((t) => ({
              label: (MITRE_TACTICS.find((x) => x.id === t.id) || { short: t.id }).short,
              value: t.count,
            }))}
          />
        </div>
      </div>

      {/* Top rules */}
      <div style={{ ...panelStyle(), padding: 18 }}>
        <div style={tileLabel}>Top rule IDs</div>
        <div style={{ marginTop: 10 }}>
          <HBar
            items={summary.topRules.map((r) => ({ label: `Rule ${r.id}`, value: r.count }))}
            color={T.purple}
          />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — Security Events (table)
// ────────────────────────────────────────────────────────────────────

function EventsTab({ events }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={panelStyle()}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ color: T.white, fontSize: 14, margin: 0, fontFamily: "'Hanken Grotesk'" }}>Security Events ({events.length})</h3>
        <span style={{ color: T.muted, fontSize: 11 }}>Newest first · click row to expand</span>
      </div>
      <div style={{ maxHeight: 600, overflowY: "auto" }}>
        {events.length === 0 ? (
          <div style={{ padding: 32, color: T.muted, fontSize: 13, textAlign: "center" }}>No events in selected window.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(15,23,42,0.5)", position: "sticky", top: 0 }}>
                <th style={tableHeadCell}>Time</th>
                <th style={tableHeadCell}>Lvl</th>
                <th style={tableHeadCell}>Rule</th>
                <th style={tableHeadCell}>Tactic</th>
                <th style={tableHeadCell}>Description</th>
                <th style={tableHeadCell}>Agent</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const band = severityBand(e.rule.level);
                const open = expanded === e.id;
                return (
                  <>
                    <tr key={e.id} onClick={() => setExpanded(open ? null : e.id)} style={{ borderTop: `1px solid ${T.cardBorder}`, cursor: "pointer", background: open ? "rgba(20,227,197,0.04)" : "transparent" }}>
                      <td style={{ padding: "8px 12px", color: T.muted, fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" }}>{e.timestamp.toLocaleTimeString("en-IN")}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 10, fontWeight: 800, background: `${band.color}25`, color: band.color, fontFamily: "'JetBrains Mono'" }}>{e.rule.level}</span>
                      </td>
                      <td style={{ padding: "8px 12px", color: T.cyan, fontFamily: "'JetBrains Mono'" }}>{e.rule.id}</td>
                      <td style={{ padding: "8px 12px", color: T.muted, fontFamily: "'JetBrains Mono'" }}>{e.tactic}</td>
                      <td style={{ padding: "8px 12px", color: T.white, maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.rule.description}</td>
                      <td style={{ padding: "8px 12px", color: T.muted, fontFamily: "'JetBrains Mono'" }}>{(e.agent || "").slice(0, 10)}</td>
                    </tr>
                    {open && (
                      <tr key={`${e.id}-details`}>
                        <td colSpan={6} style={{ padding: 12, background: "rgba(3,7,18,0.6)", borderTop: `1px solid ${T.cardBorder}` }}>
                          <pre style={{ margin: 0, color: T.cyan, fontFamily: "'JetBrains Mono'", fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
{JSON.stringify({
  timestamp: e.timestamp.toISOString(),
  rule: e.rule,
  severity: e.severity,
  tactic: e.tactic,
  technique: e.technique,
  type: e.type,
  description: e.description,
  agent: e.agent,
  raw: e.raw,
}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — Vulnerabilities
// ────────────────────────────────────────────────────────────────────

function VulnsTab({ events }) {
  // Heat-map by severity x agent
  const vulnEvents = events.filter((e) => /vuln|cve|breach/i.test(e.type));
  const byAgent = {};
  for (const e of vulnEvents) {
    if (!byAgent[e.agent]) byAgent[e.agent] = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    byAgent[e.agent][e.severity]++;
  }
  const agentRows = Object.entries(byAgent);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
      <div style={{ ...panelStyle(), padding: 18 }}>
        <div style={tileLabel}>Vulnerability Events</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.orange, fontFamily: "'Hanken Grotesk'", marginBottom: 12 }}>{vulnEvents.length}</div>
        {SEVERITY_BANDS.map((b) => {
          const n = vulnEvents.filter((e) => e.severity === b.label).length;
          return (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color }} />
              <span style={{ color: T.muted, flex: 1, textTransform: "capitalize" }}>{b.label}</span>
              <span style={{ color: T.white, fontWeight: 700 }}>{n}</span>
            </div>
          );
        })}
        <p style={{ marginTop: 14, marginBottom: 0, color: T.muted, fontSize: 11, fontStyle: "italic" }}>
          Run a scan from <Link to="/vulnerability-scan" style={{ color: T.cyan }}>/vulnerability-scan</Link> to populate.
        </p>
      </div>

      <div style={{ ...panelStyle(), padding: 18 }}>
        <div style={tileLabel}>Per-agent vulnerability map</div>
        <div style={{ marginTop: 10, maxHeight: 320, overflowY: "auto" }}>
          {agentRows.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 12 }}>No agents with vulnerability events.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr><th style={tableHeadCell}>Agent</th><th style={tableHeadCell}>C</th><th style={tableHeadCell}>H</th><th style={tableHeadCell}>M</th><th style={tableHeadCell}>L</th></tr>
              </thead>
              <tbody>
                {agentRows.map(([agent, counts]) => (
                  <tr key={agent} style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                    <td style={{ padding: "6px 10px", fontFamily: "'JetBrains Mono'", color: T.cyan }}>{agent.slice(0, 14)}</td>
                    <td style={{ padding: "6px 10px", color: T.red }}>{counts.critical || ""}</td>
                    <td style={{ padding: "6px 10px", color: T.orange }}>{counts.high || ""}</td>
                    <td style={{ padding: "6px 10px", color: T.yellow }}>{counts.medium || ""}</td>
                    <td style={{ padding: "6px 10px", color: "#a3e635" }}>{counts.low || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — MITRE ATT&CK matrix
// ────────────────────────────────────────────────────────────────────

function MitreTab({ events }) {
  const heat = useMemo(() => buildMitreHeatmap(events), [events]);
  const maxCount = Math.max(1, ...Object.values(heat).flatMap((m) => Object.values(m)));

  return (
    <div style={panelStyle()}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
        <h3 style={{ color: T.white, fontSize: 14, margin: 0, fontFamily: "'Hanken Grotesk'" }}>MITRE ATT&CK — Enterprise Matrix</h3>
        <p style={{ color: T.muted, fontSize: 11, margin: "4px 0 0" }}>Cells light up by event count. Click a tactic header for the full MITRE definition.</p>
      </div>
      <div style={{ overflowX: "auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${MITRE_TACTICS.length}, minmax(140px, 1fr))`, gap: 4 }}>
          {/* Headers */}
          {MITRE_TACTICS.map((t) => (
            <a key={t.id} href={t.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", padding: "8px 8px", background: "rgba(99,102,241,0.18)", color: T.accent, fontSize: 10, fontWeight: 700, textAlign: "center", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.short}
            </a>
          ))}
          {/* Technique cells (one column per tactic, stacked) */}
          {Array.from({ length: Math.max(...MITRE_TACTICS.map((t) => MITRE_TECHNIQUES[t.id]?.length || 0)) }).map((_, rowIdx) => (
            MITRE_TACTICS.map((t) => {
              const tech = MITRE_TECHNIQUES[t.id]?.[rowIdx];
              if (!tech) return <div key={`empty-${t.id}-${rowIdx}`} />;
              const count = heat[t.id]?.[tech.id] || 0;
              const intensity = count ? Math.min(0.85, 0.15 + (count / maxCount) * 0.7) : 0;
              return (
                <div
                  key={`${t.id}-${tech.id}`}
                  title={`${tech.id} ${tech.name} — ${count} event${count === 1 ? "" : "s"}`}
                  style={{
                    padding: "6px 8px",
                    background: count ? `rgba(20,227,197,${intensity})` : "rgba(15,23,42,0.5)",
                    border: count ? `1px solid ${T.cyan}80` : `1px solid ${T.cardBorder}`,
                    borderRadius: 4,
                    fontSize: 10,
                    color: count ? T.bg : T.muted,
                    fontWeight: count ? 700 : 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {tech.name}{count ? ` · ${count}` : ""}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — Compliance
// ────────────────────────────────────────────────────────────────────

function ComplianceTab({ state }) {
  const scores = scoreAllFrameworks(state);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
      {scores.map((f) => {
        const color = f.score >= 80 ? T.green : f.score >= 60 ? T.yellow : f.score >= 40 ? T.orange : T.red;
        return (
          <div key={f.id} style={{ ...panelStyle(), padding: 18, borderColor: `${color}40` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <h4 style={{ margin: 0, color: T.white, fontSize: 14, fontFamily: "'Hanken Grotesk'" }}>{f.name}</h4>
                <span style={{ color: T.muted, fontSize: 11 }}>{f.jurisdiction} · {f.total} controls</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'Hanken Grotesk'", lineHeight: 1 }}>{f.score}<span style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>/100</span></div>
            </div>
            <div style={{ height: 6, background: "rgba(15,23,42,0.6)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ width: `${f.score}%`, height: "100%", background: color, transition: "width 0.4s ease" }} />
            </div>
            {f.gaps.length > 0 ? (
              <details>
                <summary style={{ color: T.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {f.gaps.length} control gap{f.gaps.length === 1 ? "" : "s"}
                </summary>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                  {f.gaps.slice(0, 6).map((g) => <li key={g.id}><span style={{ color: T.red, fontFamily: "'JetBrains Mono'" }}>{g.id}</span> — {g.title}</li>)}
                </ul>
              </details>
            ) : (
              <p style={{ color: T.green, fontSize: 11, margin: 0 }}>✓ All controls passing</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab — Agents (devices)
// ────────────────────────────────────────────────────────────────────

function AgentsTab({ agents, events }) {
  return (
    <div style={panelStyle()}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
        <h3 style={{ color: T.white, fontSize: 14, margin: 0, fontFamily: "'Hanken Grotesk'" }}>Agents · {agents.length}</h3>
        <p style={{ color: T.muted, fontSize: 11, margin: "4px 0 0" }}>Each registered device acts as a Wazuh-style agent. Last-seen derived from event activity.</p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "rgba(15,23,42,0.5)" }}>
            <th style={tableHeadCell}>Agent ID</th>
            <th style={tableHeadCell}>Status</th>
            <th style={tableHeadCell}>Last event</th>
            <th style={tableHeadCell}>Events</th>
            <th style={tableHeadCell}>Top severity</th>
          </tr>
        </thead>
        <tbody>
          {agents.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: T.muted }}>No agents reporting.</td></tr>
          ) : agents.map((id) => {
            const own = events.filter((e) => e.agent === id);
            const last = own[0]?.timestamp;
            const ago = last ? Math.max(0, Math.floor((Date.now() - last.getTime()) / 60000)) : null;
            const status = ago === null ? "unknown" : ago < 5 ? "active" : ago < 60 ? "idle" : ago < 1440 ? "disconnected" : "offline";
            const statusColor = { active: T.green, idle: T.yellow, disconnected: T.orange, offline: T.red, unknown: T.muted }[status];
            const topSev = own.reduce((acc, e) => severityBand(e.rule.level).color === acc ? acc : (severityBand(e.rule.level).color === T.red ? T.red : acc), T.muted);
            return (
              <tr key={id} style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                <td style={{ padding: "10px 14px", color: T.cyan, fontFamily: "'JetBrains Mono'" }}>{id.slice(0, 28)}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: statusColor, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                    {status}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: T.muted }}>{ago === null ? "—" : `${ago} min ago`}</td>
                <td style={{ padding: "10px 14px", color: T.white, fontWeight: 700 }}>{own.length}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ width: 10, height: 10, display: "inline-block", borderRadius: 2, background: topSev }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Shared styles
// ────────────────────────────────────────────────────────────────────

const panelStyle = (extra = {}) => ({
  background: T.panel,
  border: `1px solid ${T.cardBorder}`,
  borderRadius: 12,
  overflow: "hidden",
  ...extra,
});

const tileLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: T.muted,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  marginBottom: 8,
};

const tableHeadCell = {
  textAlign: "left",
  padding: "8px 12px",
  color: T.muted,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1,
  fontSize: 10,
  borderBottom: `1px solid ${T.cardBorder}`,
};

// ────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────

export default function SocDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("24h");
  const [sevFilter, setSevFilter] = useState(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [rawRows, setRawRows] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [complianceState, setComplianceState] = useState({});

  // Auth guard
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isAdmin) { navigate("/dashboard"); }
  }, [user, isAdmin, navigate]);

  // Live event feed — owner's own activity + tool history (free-tier scoped).
  // For full org-wide stream we'd need an admin server endpoint that
  // aggregates across users; out of scope for hobby tier.
  useEffect(() => {
    if (!user?.uid) return;
    const unsubs = [];

    // Activity log
    unsubs.push(onSnapshot(
      query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"), limit(150)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, source: "activity", ...d.data() }));
        setRawRows((prev) => mergeRows(prev, rows));
        setLastUpdate(new Date());
      },
      () => { /* permission denied — no-op */ },
    ));

    // Tool history — every tool run is also a security event
    unsubs.push(onSnapshot(
      query(collection(db, "users", user.uid, "toolHistory"), orderBy("timestamp", "desc"), limit(80)),
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: `tool-${d.id}`,
            source: "tool",
            type: `scan_run_${(data.tool || "").replace(/-/g, "_")}`,
            detail: data.input || data.tool,
            timestamp: data.timestamp,
            tool: data.tool,
          };
        });
        setRawRows((prev) => mergeRows(prev, rows));
        setLastUpdate(new Date());
      },
      () => {},
    ));

    // Devices → agent list
    unsubs.push(onSnapshot(
      collection(db, "users", user.uid, "devices"),
      (snap) => {
        const list = snap.docs.map((d) => d.id);
        setAgentList(list.length ? list : ["vrikaan-default"]);
      },
      () => setAgentList(["vrikaan-default"]),
    ));

    // Build compliance state from observable signals (cheap, no extra reads)
    setComplianceState({
      tlsGrade: "A",                 // vrikaan.com is HSTS-preloaded with A grade
      cspPresent: true,              // vercel.json sets CSP
      mfaAdoptionRate: 0.4,          // approximate; real signal would need cross-user query
      auditLogActive: true,          // /activity collection is populated
      scansLast30: 1,                // synthetic until a server aggregation exists
      privacyPolicyPublished: true,  // /privacy page exists
      cookieConsentPresent: true,    // CookieConsent component mounts globally
      breachNotifyMechanism: true,   // EmailJS digests + push notifications
      accountDeleteAvailable: true,  // /api/users delete exists
    });

    return () => unsubs.forEach((u) => u && u());
  }, [user]);

  // Derive filtered events
  const events = useMemo(() => {
    const windowMs = TIME_RANGES.find((r) => r.id === range)?.ms || 24 * 3600000;
    const cutoff = Date.now() - windowMs;
    let mapped = mapEvents(rawRows);
    mapped = mapped.filter((e) => e.timestamp.getTime() >= cutoff);
    if (sevFilter) mapped = mapped.filter((e) => e.severity === sevFilter);
    if (agentFilter !== "all") mapped = mapped.filter((e) => e.agent === agentFilter);
    mapped.sort((a, b) => b.timestamp - a.timestamp);
    return mapped;
  }, [rawRows, range, sevFilter, agentFilter]);

  const summary = useMemo(() => summarizeEvents(events), [events]);
  const sparkline = useMemo(() => bucketByTime(events, 24, TIME_RANGES.find((r) => r.id === range)?.ms || 86400000), [events, range]);

  if (!user || !isAdmin) return null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SEO title="SOC Dashboard — VRIKAAN" description="Wazuh-style Security Operations Center for VRIKAAN — live events, MITRE ATT&CK heat-map, vulnerabilities, compliance posture, agent inventory." path="/admin/soc" />
      <Navbar />

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "120px 24px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, margin: 0, fontFamily: "'Hanken Grotesk'" }}>
              <span style={{ color: T.cyan }}>SOC</span> Dashboard
              <span style={{ marginLeft: 12, fontSize: 11, color: T.muted, fontWeight: 400, fontFamily: "'JetBrains Mono'" }}>v1 · Wazuh-style</span>
            </h1>
            <p style={{ color: T.muted, fontSize: 12, margin: "4px 0 0" }}>
              Real-time event correlation · MITRE ATT&CK mapping · Compliance posture · Agent inventory
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${T.cardBorder}`, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 16px", border: "none", borderRadius: "6px 6px 0 0",
              background: tab === t.id ? T.panel : "transparent",
              color: tab === t.id ? T.cyan : T.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: tab === t.id ? `2px solid ${T.cyan}` : "2px solid transparent",
              fontFamily: "'Hanken Grotesk'", letterSpacing: 0.3,
            }}>
              <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Top bar */}
        <TopBar
          range={range} setRange={setRange}
          sevFilter={sevFilter} setSevFilter={setSevFilter}
          agentFilter={agentFilter} setAgentFilter={setAgentFilter}
          agents={agentList}
          onRefresh={() => setLastUpdate(new Date())}
          lastUpdate={lastUpdate}
        />

        {/* Tab body */}
        {tab === "overview"   && <OverviewTab events={events} summary={summary} sparkline={sparkline} />}
        {tab === "events"     && <EventsTab events={events} />}
        {tab === "vulns"      && <VulnsTab events={events} />}
        {tab === "mitre"      && <MitreTab events={events} />}
        {tab === "compliance" && <ComplianceTab state={complianceState} />}
        {tab === "agents"     && <AgentsTab agents={agentList} events={events} />}

        <p style={{ color: T.subtle, fontSize: 11, textAlign: "center", margin: "30px 0 0", fontStyle: "italic" }}>
          Wazuh-style SOC powered by VRIKAAN telemetry · Free-tier deployment · Severity scale 0-15 · MITRE ATT&CK Enterprise mapping
        </p>
      </div>
      <Footer />
    </div>
  );
}

// Merge incoming Firestore rows into the existing list, deduplicating by id.
function mergeRows(prev, incoming) {
  const map = new Map(prev.map((r) => [r.id, r]));
  for (const r of incoming) map.set(r.id, r);
  return Array.from(map.values());
}
