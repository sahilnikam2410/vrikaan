import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { LuTriangleAlert, LuPhone, LuClock, LuMessageSquare, LuScale, LuLandmark, LuClipboard } from "react-icons/lu";
import ToolShell from "../../components/ToolShell";
import SeniorModeBanner from "../../components/SeniorModeBanner";
import { BANKS, UNIVERSAL, searchBanks } from "../../lib/bankHelplines";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const URGENCY_WINDOW = 90; // seconds

export default function OtpDecay() {
  const [active, setActive] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [bankQ, setBankQ] = useState("");
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [checks, setChecks] = useState({});

  const elapsed = useMemo(() => active ? Math.floor((Date.now() - startTs) / 1000) : 0, [active, startTs, checks]);
  const remaining = Math.max(0, URGENCY_WINDOW - elapsed);

  // Force re-render every second while active
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setChecks(c => ({ ...c, _tick: Date.now() })), 1000);
    return () => clearInterval(id);
  }, [active]);

  const start = () => {
    setStartTs(Date.now());
    setActive(true);
  };
  const reset = () => {
    setActive(false); setStartTs(null); setChecks({}); setSelectedBanks([]); setBankQ("");
  };

  const matchedBanks = useMemo(() => searchBanks(bankQ), [bankQ]);
  const addBank = (b) => {
    if (selectedBanks.find(x => x.id === b.id)) return;
    setSelectedBanks(prev => [...prev, b]);
    setBankQ("");
  };
  const removeBank = (id) => setSelectedBanks(prev => prev.filter(b => b.id !== id));

  const urgencyColor = remaining > 60 ? T.green : remaining > 30 ? T.yellow : remaining > 10 ? T.orange : T.red;
  const urgencyLabel = remaining > 60 ? "GOOD WINDOW" : remaining > 30 ? "HURRY" : remaining > 10 ? "CRITICAL" : remaining > 0 ? "LAST CHANCE" : "WINDOW CLOSED";

  return (
    <ToolShell
      route="/otp-decay" eyebrow="Emergency"
      title="OTP" titleAccent="Decay"
      subtitle="Scammers automate the drain. Once they have your OTP, they transfer in 60-180 seconds. This page gives you the exact 1-tap helpline, your specific bank number, and the script to say."
      width={900}
      seoTitle="OTP Decay — Just Shared an OTP? Block Card NOW"
      seoDesc="If you just shared an OTP with a scammer, you have ~90 seconds before they drain your account. This page gives you the bank helpline + 1-tap call buttons + checklist. India-first. Free."
      path="/otp-decay"
      topSlot={<SeniorModeBanner />}
      footer
    >

        {/* MEGA CTA — always visible */}
        <div style={{
          padding: "20px 22px", borderRadius: 16, marginBottom: 24,
          background: `${T.red}1a`, border: `2px solid ${T.red}`,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "inline-flex", color: T.red }}><LuTriangleAlert size={36} /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 16 }}>
              Call <a href="tel:1930" style={{ color: T.red, textDecoration: "underline" }}>1930</a> RIGHT NOW
            </div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
              National Cybercrime Helpline · single call freezes ANY UPI/card · 24×7
            </div>
          </div>
          <a href="tel:1930" style={{
            padding: "14px 26px", borderRadius: 12,
            background: T.red, color: "#fff", textDecoration: "none",
            fontWeight: 800, fontSize: 17, fontFamily: "'Vrikaan Sans', sans-serif",
          }}><LuPhone size={17} style={{ verticalAlign: "-3px" }} /> Call 1930</a>
        </div>

        {/* COUNTDOWN — start it after first call */}
        {!active ? (
          <div style={{
            padding: 20, borderRadius: 14, marginBottom: 24, textAlign: "center",
            background: T.card, border: `1px solid ${T.border}`,
          }}>
            <p style={{ color: T.muted, fontSize: 14, margin: "0 0 12px", lineHeight: 1.7 }}>
              <strong style={{ color: T.white }}>Step 1:</strong> Call 1930 above first.<br />
              <strong style={{ color: T.white }}>Step 2:</strong> Tap "Start countdown" below while you're being routed — it shows live urgency + your specific bank helpline.
            </p>
            <button onClick={start} style={{
              padding: "13px 26px", borderRadius: 12,
              background: T.cyan, color: T.bg, border: 0,
              fontWeight: 800, fontSize: 15, cursor: "pointer",
              fontFamily: "'Vrikaan Sans', sans-serif",
            }}><LuClock size={15} style={{ verticalAlign: "-2px" }} /> Start 90-second countdown</button>
          </div>
        ) : (
          <div style={{
            padding: 22, borderRadius: 16, marginBottom: 24,
            background: `${urgencyColor}1a`, border: `2px solid ${urgencyColor}`,
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 2, color: urgencyColor,
              textTransform: "uppercase", marginBottom: 6,
            }}>{urgencyLabel}</div>
            <div style={{
              fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 80, fontWeight: 800,
              color: urgencyColor, lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}>{remaining}<span style={{ fontSize: 24 }}>s</span></div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 8 }}>
              {elapsed}s elapsed since you tapped Start
            </div>
            <button onClick={reset} style={{
              marginTop: 14, padding: "8px 16px", borderRadius: 8,
              background: "transparent", color: T.white,
              border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>↻ Reset</button>
          </div>
        )}

        {/* What to say script */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 20, marginBottom: 24,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            <LuMessageSquare size={18} style={{ verticalAlign: "-3px" }} /> Exact words to say when bank picks up
          </h2>
          <div style={{
            padding: 16, borderRadius: 10,
            background: "rgba(2,6,23,0.6)", border: `1px solid ${T.cyan}33`,
            color: T.white, fontSize: 14, lineHeight: 1.8,
            fontFamily: "ui-monospace, Menlo, monospace",
          }}>
            "I just shared an OTP with a scammer by mistake.<br/>
            <strong style={{ color: T.cyan }}>Block my debit card and freeze all outgoing UPI transfers IMMEDIATELY.</strong><br/>
            Give me a complaint reference number. Confirm in writing via SMS or email.<br/>
            I will visit the branch within 3 working days as per RBI rules."
          </div>
          <p style={{ color: T.muted, fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
            <LuScale size={13} style={{ verticalAlign: "-2px" }} /> <strong style={{ color: T.white }}>RBI Zero-Liability Rule:</strong> if you report unauthorized transaction within 3 working days, you owe NOTHING. Bank legally must refund.
          </p>
        </div>

        {/* Bank picker */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 20, marginBottom: 24,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            <LuLandmark size={18} style={{ verticalAlign: "-3px" }} /> Get your bank's 24×7 helpline
          </h2>
          <input
            value={bankQ}
            onChange={(e) => setBankQ(e.target.value)}
            placeholder="Start typing: hdfc · sbi · icici · axis..."
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
              color: T.white, fontSize: 14, outline: "none", fontFamily: "inherit",
              boxSizing: "border-box", marginBottom: 10,
            }}
          />
          {matchedBanks.length > 0 && (
            <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              {matchedBanks.map(b => (
                <button key={b.id} onClick={() => addBank(b)} style={{
                  padding: "10px 14px", borderRadius: 8, textAlign: "left",
                  background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                  color: T.white, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 500,
                }}>+ {b.name}</button>
              ))}
            </div>
          )}

          {selectedBanks.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {selectedBanks.map(b => (
                <div key={b.id} style={{
                  padding: 14, borderRadius: 10,
                  background: `${T.red}1a`, border: `1px solid ${T.red}55`,
                  display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center",
                }}>
                  <div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                    <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>24×7 fraud + card-block helpline</div>
                  </div>
                  <a href={`tel:${b.blockPhone.replace(/[-\s/]/g, "")}`} style={{
                    padding: "10px 16px", borderRadius: 8,
                    background: T.red, color: "#fff", textDecoration: "none",
                    fontWeight: 800, fontSize: 14, fontFamily: "ui-monospace, Menlo, monospace",
                  }}><LuPhone size={14} style={{ verticalAlign: "-2px" }} /> {b.blockPhone}</a>
                  <button onClick={() => removeBank(b.id)} style={{
                    background: "transparent", border: 0, color: T.mutedDark, cursor: "pointer", fontSize: 18, padding: 4,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Universal helplines */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 20, marginBottom: 24,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, color: T.white, margin: "0 0 12px" }}>
            <LuPhone size={18} style={{ verticalAlign: "-3px" }} /> Backup helplines
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {UNIVERSAL.map(h => (
              <a key={h.phone} href={`tel:${h.phone.replace(/[-\s]/g, "")}`} style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center",
                padding: 12, borderRadius: 10,
                background: "rgba(2,6,23,0.4)", border: `1px solid ${T.border}`,
                color: "inherit", textDecoration: "none",
              }}>
                <div>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>{h.label}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{h.note}</div>
                </div>
                <div style={{
                  color: T.cyan, fontSize: 16, fontWeight: 800,
                  fontFamily: "ui-monospace, monospace",
                }}>{h.phone}</div>
              </a>
            ))}
          </div>
        </div>

        {/* What NOT to do */}
        <div style={{
          padding: 18, borderRadius: 14, marginBottom: 24,
          background: `${T.red}0a`, border: `1px solid ${T.red}33`,
        }}>
          <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 16, color: T.red, margin: "0 0 10px" }}>
            ❌ Don't waste time on these
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li>❌ Don't call the scammer back to "confirm" — they'll fish for more</li>
            <li>❌ Don't share any more OTPs to "stop the transaction"</li>
            <li>❌ Don't log into the bank app from the SAME phone if you suspect SIM swap — use someone else's phone or computer</li>
            <li>❌ Don't power down your phone — it kills SMS alerts you need</li>
            <li>❌ Don't post about it on social media until FIR filed</li>
          </ul>
        </div>

        {/* Next steps */}
        <div style={{
          padding: 20, borderRadius: 14, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Call done. Need to file FIR + get money back?
          </div>
          <Link to="/scam-recovery" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}><LuClipboard size={14} style={{ verticalAlign: "-2px" }} /> Full Recovery Hotline →</Link>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 32, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          <LuPhone size={12} style={{ verticalAlign: "-2px" }} /> Bank numbers verified Mar 2026. Always check the back of YOUR card for the exact number.<br/>
          🇮🇳 Built in Nashik · Free forever · Share with anyone in trouble
        </p>
    </ToolShell>
  );
}
