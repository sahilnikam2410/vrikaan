import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { tierLabel, tierColor } from "../lib/toolTiers";

/**
 * UpgradeModal — generic paywall surface.
 *
 * Props:
 *   open       — boolean, controls visibility
 *   onClose    — () => void, ESC + outside-click handler
 *   toolName   — e.g. "Fraud Analyzer"
 *   toolPath   — e.g. "/fraud-analyzer" (used in "Continue after upgrade" intent)
 *   tier       — "pro" | "enterprise"
 *   userPlan   — current plan ("free" | "pro" | "enterprise")
 */
export default function UpgradeModal({ open, onClose, toolName, toolPath, tier, userPlan = "free" }) {
  const navigate = useNavigate();
  const color = tierColor(tier);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    // Lock body scroll
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [open, onClose]);

  if (!open) return null;

  const benefits = tier === "enterprise" ? [
    "SOC dashboard w/ MITRE ATT&CK heatmap",
    "Multi-framework compliance posture (PCI / GDPR / DPDP / SOC 2 / ISO 27001)",
    "Bulk scanner (CSV upload, 1000s of URLs at once)",
    "Team accounts + role-based access",
    "Outbound HMAC-signed webhooks",
    "Priority email support · 4-hour SLA",
    "Everything in Pro",
  ] : [
    "Unlimited scans across all 50+ tools",
    "AI-powered fraud + deepfake + scam detection",
    "Dark-web monitoring with instant alerts",
    "Password vault with TOTP 2FA",
    "Vulnerability scanner w/ Gemini synthesis",
    "Full PDF export of all reports",
    "Priority email support",
  ];

  const planNameTarget = tier === "enterprise" ? "Enterprise" : "Pro";
  const priceLine = tier === "enterprise" ? "Custom · talk to us" : "Just ₹990 / year · ₹83 / month";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(3,7,18,0.78)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          animation: "vrk-modal-bg 0.2s ease",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vrk-upgrade-title"
        style={{
          position: "fixed", left: "50%", top: "50%", zIndex: 9999,
          transform: "translate(-50%, -50%)",
          width: "min(520px, 94vw)",
          maxHeight: "90vh", overflowY: "auto",
          background: "#0b1220",
          border: `1px solid ${color}40`,
          borderRadius: 20,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${color}18`,
          color: "#f1f5f9",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "vrk-modal-in 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "26px 28px 18px",
          background: `linear-gradient(135deg, ${color}22 0%, transparent 70%)`,
          borderBottom: "1px solid rgba(148,163,184,0.1)",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute", top: 14, right: 14,
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(148,163,184,0.12)", border: 0,
              color: "#cbd5e1", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(148,163,184,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.12)"; }}
          >×</button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 999,
            background: `${color}1a`, border: `1px solid ${color}55`,
            fontSize: 10, fontWeight: 800, letterSpacing: 2,
            color, marginBottom: 14,
          }}>🔒 {tierLabel(tier)} TOOL</div>

          <h2 id="vrk-upgrade-title" style={{
            margin: 0, fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 26, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2,
          }}>
            Unlock <span style={{ color }}>{toolName || "this tool"}</span>
          </h2>
          <p style={{
            margin: "8px 0 0", color: "#94a3b8", fontSize: 14, lineHeight: 1.6,
          }}>
            {userPlan === "free"
              ? `${toolName || "This tool"} is part of VRIKAAN ${planNameTarget}. Upgrade once — get every Pro tool, forever.`
              : `${toolName || "This tool"} requires the ${planNameTarget} plan. You're currently on ${userPlan.toUpperCase()}.`}
          </p>
        </div>

        {/* Benefits */}
        <div style={{ padding: "22px 28px 6px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            color: "#94a3b8", marginBottom: 12,
          }}>What you unlock</div>
          <ul style={{
            margin: 0, padding: 0, listStyle: "none",
            display: "grid", gap: 10,
          }}>
            {benefits.map(b => (
              <li key={b} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                fontSize: 14, color: "#cbd5e1", lineHeight: 1.5,
              }}>
                <span style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: 999,
                  background: `${color}22`, color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, marginTop: 2,
                }}>✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price + CTAs */}
        <div style={{
          padding: "20px 28px 26px",
          borderTop: "1px solid rgba(148,163,184,0.1)",
          marginTop: 16,
        }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16,
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28, fontWeight: 800, color: "#f1f5f9",
            }}>{tier === "enterprise" ? "Custom" : "₹990"}</span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {tier === "enterprise" ? "· talk to us" : "/ year"}
            </span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button
              onClick={() => {
                onClose?.();
                navigate(tier === "enterprise" ? "/contact?intent=enterprise" : `/pricing?from=${encodeURIComponent(toolPath || "")}`);
              }}
              style={{
                padding: "14px 22px", borderRadius: 12,
                background: color, color: "#030712",
                border: 0, cursor: "pointer",
                fontSize: 15, fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: 0.3, transition: "transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {tier === "enterprise" ? "Talk to us →" : `Upgrade to ${planNameTarget} →`}
            </button>

            {tier !== "enterprise" && userPlan === "free" && (
              <Link
                to="/pricing?trial=pro"
                onClick={onClose}
                style={{
                  padding: "12px 22px", borderRadius: 12,
                  background: "rgba(148,163,184,0.08)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(148,163,184,0.18)",
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none", textAlign: "center",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >Start 7-day free trial · no card</Link>
            )}

            <button
              onClick={onClose}
              style={{
                background: "transparent", border: 0,
                color: "#64748b", fontSize: 12, cursor: "pointer",
                padding: "6px 0", fontFamily: "inherit",
              }}
            >Not now</button>
          </div>

          <p style={{
            margin: "14px 0 0", fontSize: 11, color: "#64748b",
            textAlign: "center", lineHeight: 1.5,
          }}>
            Built in India · INR-native Cashfree · Cancel anytime · {priceLine}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes vrk-modal-bg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vrk-modal-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
