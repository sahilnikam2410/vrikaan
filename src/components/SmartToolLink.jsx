import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToolTier, userMeetsTier, tierColor, tierLabel } from "../lib/toolTiers";
import UpgradeModal from "./UpgradeModal";

/**
 * SmartToolLink — drop-in replacement for `<Link>` in footers / menus.
 *
 * Behaviour:
 *  - Renders the link with an inline tier badge (PRO / ENTERPRISE).
 *  - Free-tier tools render without a badge (clean).
 *  - If the current user doesn't meet the required tier, clicking opens
 *    UpgradeModal instead of navigating. Pricing CTA inside the modal.
 *  - Logged-out users get the same modal (treated as "free").
 *
 * Props:
 *   to        — route path
 *   children  — link text
 *   style     — optional inline style overrides for the <a> element
 *   showBadge — default true; pass false to render link only (no badge)
 */
export default function SmartToolLink({ to, children, style: extra = {}, showBadge = true }) {
  const { user } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { tier, name } = getToolTier(to);

  const userPlan = user?.plan || "free";
  const eligible = userMeetsTier(userPlan, tier);
  const showLock = !eligible && tier !== "free";

  const handleClick = (e) => {
    if (showLock) {
      e.preventDefault();
      setPaywallOpen(true);
    }
  };

  const baseStyle = {
    color: "#64748b",
    textDecoration: "none",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    transition: "color 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    ...extra,
  };

  return (
    <>
      <Link
        to={to}
        onClick={handleClick}
        style={baseStyle}
        onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <span>{children}</span>
        {showBadge && tier !== "free" && (
          <TierBadge tier={tier} locked={!eligible} />
        )}
      </Link>

      {paywallOpen && (
        <UpgradeModal
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          toolName={name || (typeof children === "string" ? children : "")}
          toolPath={to}
          tier={tier}
          userPlan={userPlan}
        />
      )}
    </>
  );
}

/**
 * TierBadge — small inline pill rendered next to tool name.
 * Solid pill if user has access, locked outline + 🔒 if not.
 */
function TierBadge({ tier, locked }) {
  const color = tierColor(tier);
  return (
    <span
      title={locked ? `Requires ${tierLabel(tier)} plan` : `Included in ${tierLabel(tier)}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        fontSize: 8.5, fontWeight: 800, letterSpacing: 0.8,
        padding: "2px 6px", borderRadius: 999,
        background: locked ? "transparent" : `${color}1f`,
        color,
        border: `1px solid ${locked ? `${color}55` : `${color}33`}`,
        textTransform: "uppercase",
        fontFamily: "ui-monospace, Menlo, monospace",
        lineHeight: 1,
      }}
    >
      {locked && <span style={{ fontSize: 8 }}>🔒</span>}
      {tierLabel(tier)}
    </span>
  );
}

// Named export for use elsewhere (e.g. Navbar command palette)
export { TierBadge };
