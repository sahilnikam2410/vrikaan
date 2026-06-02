import { Link } from "react-router-dom";
import { tierColor, tierLabel } from "../lib/toolTiers";
import { timeUntilReset } from "../lib/quota";

/**
 * QuotaBanner — inline strip at top of any Pro tool page, shows free users
 * their remaining daily uses + upgrade CTA.
 *
 * Hidden when:
 *  - User is on Pro/Enterprise plan (unlimited)
 *  - Tool is a free tool (no quota)
 *
 * When `remaining === 0` it switches to an exhausted state w/ stronger CTA.
 *
 * Drop one at the top of any tool page body:
 *   <QuotaBanner used={used} limit={limit} remaining={remaining} resetAt={resetAt} tier={tier} path={path} />
 */
export default function QuotaBanner({
  unlimited = false,
  used = 0,
  limit = 3,
  remaining = 3,
  resetAt = null,
  tier = "pro",
  path = "",
}) {
  if (unlimited) return null;
  if (tier === "free") return null;

  const exhausted = remaining <= 0;
  const color = exhausted ? "#EF4444" : tierColor(tier);
  const pct = Math.max(0, Math.min(100, (used / limit) * 100));

  return (
    <div style={{
      maxWidth: 920, margin: "16px auto 28px", padding: "14px 18px",
      background: exhausted ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
      border: `1px solid ${color}33`,
      borderRadius: 14,
      fontFamily: "var(--font-body), 'Hanken Grotesk', sans-serif",
      color: "#cbd5e1", display: "flex", alignItems: "center", gap: 14,
      flexWrap: "wrap",
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
        padding: "4px 10px", borderRadius: 999,
        background: `${color}1f`, color,
        border: `1px solid ${color}55`,
        textTransform: "uppercase", fontFamily: "ui-monospace, Menlo, monospace",
        flexShrink: 0,
      }}>
        {exhausted ? "🔒 LIMIT REACHED" : `${tierLabel(tier)} · FREE TRIAL`}
      </div>

      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600, marginBottom: 6 }}>
          {exhausted
            ? `Daily free uses exhausted. Resets ${timeUntilReset(resetAt) || "at midnight"}.`
            : `${remaining} of ${limit} free uses left today.`}
        </div>
        <div style={{
          height: 4, background: "rgba(148,163,184,0.18)", borderRadius: 999,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: color, transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      <Link
        to={`/pricing?from=${encodeURIComponent(path)}`}
        style={{
          padding: "9px 16px", borderRadius: 10,
          background: color, color: "#030712",
          fontWeight: 800, fontSize: 13, textDecoration: "none",
          fontFamily: "'Hanken Grotesk', sans-serif",
          flexShrink: 0, transition: "transform 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      >Upgrade · ₹990/yr</Link>
    </div>
  );
}
