import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { upcoming, formatFestivalDate, isHighAlert } from "../../lib/festivalFraud";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", orange: "#f97316",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

export default function FestivalFraud() {
  const festivals = useMemo(() => upcoming(), []);
  const [selectedId, setSelectedId] = useState(festivals[0]?.id);
  const [shared, setShared] = useState(false);

  const selected = festivals.find(f => f.id === selectedId) || festivals[0];
  const highAlert = selected && isHighAlert(selected);

  const shareWhatsApp = () => {
    if (!selected) return;
    const text = `🚨 ${selected.name} ${selected.emoji} approaching — scam reports spike ${selected.fraudSpike} during this week.\n\n` +
      `Top scam to watch:\n"${selected.topScams[0].pattern}"\n\n` +
      `Defense: ${selected.topScams[0].defense}\n\n` +
      `Full forecast + family checklist: https://vrikaan.com/festival-fraud`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShared(true);
  };

  if (!selected) {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: 80, color: T.muted, textAlign: "center" }}>No upcoming festivals tracked.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Festival Fraud Forecast — India"
        description="Diwali / Holi / Rakhi / wedding season scam alerts — tailored to India. See top scam patterns + defense actions 7 days before each festival."
        path="/festival-fraud"
        keywords="diwali scam, holi scam, indian festival fraud, upi fraud diwali, wedding season scam, festival scam alerts india"
      />
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(245,158,11,0.12)", border: `1px solid ${T.yellow}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.yellow, marginBottom: 14,
          }}>📅 India · Festival Fraud Calendar</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Scams spike before every<br />
            <span style={{ color: T.yellow }}>Indian festival.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 680, margin: "0 auto", lineHeight: 1.7 }}>
            7 days before Diwali / Holi / Raksha Bandhan / wedding season — fraud reports jump 140–380%.
            Here's exactly what to watch for, and the 1-paragraph script to send your family.
          </p>
        </header>

        {/* Calendar strip — pickable */}
        <div style={{
          display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(160px, 1fr)",
          gap: 12, overflowX: "auto", paddingBottom: 12, marginBottom: 28,
          scrollbarWidth: "thin",
        }}>
          {festivals.map(f => {
            const isSel = f.id === selectedId;
            const alert = isHighAlert(f);
            return (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                style={{
                  padding: 16, borderRadius: 14, textAlign: "left",
                  background: isSel ? `${f.color}1a` : T.card,
                  border: `2px solid ${isSel ? f.color : T.border}`,
                  color: "inherit", cursor: "pointer",
                  transition: "transform 0.15s",
                  position: "relative", overflow: "hidden",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {alert && (
                  <span style={{
                    position: "absolute", top: 8, right: 8,
                    fontSize: 9, fontWeight: 800, letterSpacing: 1,
                    padding: "2px 6px", borderRadius: 999,
                    background: T.red, color: "#fff",
                    textTransform: "uppercase",
                  }}>HIGH ALERT</span>
                )}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{f.emoji}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{f.name}</div>
                <div style={{ color: T.muted, fontSize: 11, fontFamily: "ui-monospace, monospace" }}>{f.nameHi}</div>
                <div style={{
                  marginTop: 8, fontSize: 11, color: alert ? T.red : T.muted, fontWeight: 600,
                }}>{formatFestivalDate(f)}</div>
              </button>
            );
          })}
        </div>

        {/* Selected festival details */}
        <div style={{
          background: T.card, border: `1px solid ${selected.color}33`, borderRadius: 18,
          overflow: "hidden",
        }}>
          {/* Header strip */}
          <div style={{
            padding: "20px 26px",
            background: `linear-gradient(135deg, ${selected.color}22 0%, transparent 70%)`,
            borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `${selected.color}22`, border: `1px solid ${selected.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0,
            }}>{selected.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                margin: 0, fontFamily: "'Vrikaan Sans', sans-serif",
                fontSize: 24, fontWeight: 800, color: T.white,
              }}>{selected.name} <span style={{ color: T.muted, fontSize: 16, fontWeight: 500 }}>{selected.nameHi}</span></h2>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
                {formatFestivalDate(selected)}
                <span style={{ margin: "0 8px", color: T.mutedDark }}>·</span>
                <span style={{ color: T.red, fontWeight: 700 }}>Fraud spike: {selected.fraudSpike}</span>
              </div>
            </div>
            {highAlert && (
              <div style={{
                padding: "8px 14px", borderRadius: 999,
                background: `${T.red}1a`, border: `1px solid ${T.red}55`,
                color: T.red, fontSize: 12, fontWeight: 800,
                letterSpacing: 1, textTransform: "uppercase",
              }}>🚨 In high-alert window</div>
            )}
          </div>

          {/* Scams + defenses */}
          <div style={{ padding: 26 }}>
            <h3 style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white,
              margin: "0 0 18px",
            }}>Top {selected.topScams.length} scams to watch this {selected.name}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              {selected.topScams.map((s, i) => (
                <div key={i} style={{
                  padding: 16, borderRadius: 12,
                  background: "rgba(2,6,23,0.5)", border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${selected.color}`,
                }}>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                    {i + 1}. {s.title}
                  </div>
                  <div style={{
                    color: T.red, fontSize: 13, lineHeight: 1.6,
                    padding: "8px 12px", borderRadius: 8,
                    background: `${T.red}0a`, border: `1px dashed ${T.red}33`,
                    fontFamily: "ui-monospace, Menlo, monospace",
                    margin: "0 0 10px",
                  }}>
                    🚨 Example: {s.pattern}
                  </div>
                  <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
                    <strong style={{ color: T.green }}>✓ Defense:</strong> {s.defense}
                  </div>
                </div>
              ))}
            </div>

            {/* Family checklist */}
            <div style={{
              marginTop: 24, padding: 18, borderRadius: 12,
              background: `${T.cyan}0a`, border: `1px solid ${T.cyan}33`,
            }}>
              <div style={{
                fontSize: 11, color: T.cyan, fontWeight: 800, letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 10,
              }}>📋 Family checklist — do these now</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 14, lineHeight: 1.9 }}>
                {selected.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>

            {/* Share */}
            <div style={{
              marginTop: 22, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
              padding: 16, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(20, 184, 166,0.06))",
              border: `1px solid ${T.green}33`,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  Send this to your family WhatsApp 👆
                </div>
                <div style={{ color: T.muted, fontSize: 12 }}>
                  One-tap share. Pre-formatted with the most important scam + defense.
                </div>
              </div>
              <button onClick={shareWhatsApp} style={{
                padding: "11px 20px", borderRadius: 10,
                background: "#25D366", color: "#fff",
                border: 0, fontWeight: 800, fontSize: 14, cursor: "pointer",
                fontFamily: "'Vrikaan Sans', sans-serif",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>📲 Share on WhatsApp</button>
              {shared && (
                <div style={{ color: T.green, fontSize: 12, fontWeight: 700 }}>✓ Shared</div>
              )}
            </div>
          </div>
        </div>

        {/* All festivals at a glance */}
        <section style={{ marginTop: 50 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 18px",
          }}>Full calendar — next 12 months</h2>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
          }}>
            {festivals.map((f, i) => (
              <button
                key={f.id}
                onClick={() => { setSelectedId(f.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  display: "grid", gridTemplateColumns: "40px 1fr 130px 100px 30px",
                  alignItems: "center", gap: 14,
                  width: "100%",
                  padding: "14px 18px",
                  background: "transparent", border: 0,
                  borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  cursor: "pointer", textAlign: "left", color: "inherit",
                  fontFamily: "inherit", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(20, 184, 166,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ fontSize: 22 }}>{f.emoji}</div>
                <div>
                  <div style={{ color: T.white, fontSize: 14, fontWeight: 600 }}>{f.name} <span style={{ color: T.muted, fontWeight: 400 }}>· {f.nameHi}</span></div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{f.topScams.length} scam patterns tracked</div>
                </div>
                <div style={{ color: T.muted, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>
                  {formatFestivalDate(f)}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: T.red,
                  fontFamily: "ui-monospace, monospace", textAlign: "right",
                }}>{f.fraudSpike}</div>
                <div style={{ color: T.muted, fontSize: 16, textAlign: "right" }}>→</div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          marginTop: 36, padding: 26, borderRadius: 18, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 8px" }}>
            Got a suspicious festival message right now?
          </h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 16px" }}>
            Paste it into our free AI scam checker — verdict in 5 seconds.
          </p>
          <Link to="/scam-check" style={{
            display: "inline-block",
            padding: "12px 26px", borderRadius: 12,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 15,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>Check a scam message →</Link>
        </section>

        {/* Footer note */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          📅 Festival dates are approximate — exact dates vary by lunar calendar. Fraud spike %s sourced from
          aggregated reports by Indian banks, NPCI, and SOC analysts at VRIKAAN.<br />
          🇮🇳 Built in Nashik · Free forever · Share with your family before every festival
        </p>
      </main>

      <Footer />
    </div>
  );
}
