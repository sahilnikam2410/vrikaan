import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToolTier, userMeetsTier, tierLabel, tierColor, isKidBlocked } from "../lib/toolTiers";

/**
 * ProtectedRoute — requires login. Optional `adminOnly` for admin gating.
 * Optional `tier` override; if omitted, looks up tier from the current path.
 *
 * Flow when user lacks required tier:
 *   - Logged-out → /login (then post-login redirect to original path)
 *   - Logged-in but plan < required tier → full-page upgrade screen
 *     w/ "Upgrade to Pro" CTA → /pricing
 */
export function ProtectedRoute({ children, adminOnly = false, tier: tierOverride }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#030712", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(99,102,241,0.2)",
          borderTopColor: "#6366f1", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  // Kid-mode gate — Family-plan members tagged role=kid can't access scary /
  // adult / dark-web tools. Soft-redirect to dashboard with note query param.
  if (user.familyRole === "kid" && isKidBlocked(location.pathname)) {
    return <Navigate to="/dashboard?blocked=kid" replace />;
  }

  // Tier check — explicit override OR derived from path.
  // Free Pro tools get a daily quota (handled in-page via useToolQuota +
  // QuotaBanner). Enterprise tools hard-block at the route level.
  const requiredTier = tierOverride || getToolTier(location.pathname).tier;
  const userPlan = user.plan || "free";
  if (requiredTier === "enterprise" && !userMeetsTier(userPlan, "enterprise")) {
    return <UpgradeWall path={location.pathname} requiredTier="enterprise" userPlan={userPlan} />;
  }

  return children;
}

export function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/user-dashboard" replace />;
}

/** Full-page paywall — rendered when authenticated user lacks the right tier. */
function UpgradeWall({ path, requiredTier, userPlan }) {
  const { name } = getToolTier(path);
  const color = tierColor(requiredTier);
  const isEnterprise = requiredTier === "enterprise";

  const benefits = isEnterprise ? [
    "SOC dashboard with MITRE ATT&CK heatmap",
    "Compliance posture (PCI · GDPR · DPDP · SOC 2 · ISO 27001)",
    "Bulk scanner — CSV upload, 1000s of URLs",
    "Team accounts + role-based access control",
    "Outbound HMAC-signed webhooks",
    "Priority support · 4-hour SLA",
    "Everything in Pro",
  ] : [
    "Unlimited scans across all 50+ tools",
    "AI-powered scam, fraud & deepfake detection",
    "Dark-web monitoring with instant breach alerts",
    "Password vault w/ TOTP 2FA (NIST AAL2)",
    "Vulnerability scanner + Gemini AI synthesis",
    "PDF export for every report",
    "Priority email support",
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#030712",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Hanken Grotesk', sans-serif", color: "#f1f5f9",
    }}>
      <div style={{
        width: "min(560px, 100%)",
        background: "#0b1220",
        border: `1px solid ${color}40`,
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px ${color}1a`,
      }}>
        <div style={{
          padding: "32px 36px 24px",
          background: `linear-gradient(135deg, ${color}22 0%, transparent 70%)`,
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 999,
            background: `${color}1a`, border: `1px solid ${color}55`,
            fontSize: 10, fontWeight: 800, letterSpacing: 2,
            color, marginBottom: 18,
            fontFamily: "ui-monospace, Menlo, monospace",
          }}>🔒 {tierLabel(requiredTier)} TOOL</div>
          <h1 style={{
            margin: 0, fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: 32, fontWeight: 800, lineHeight: 1.2,
          }}>
            Unlock <span style={{ color }}>{name || "this tool"}</span>
          </h1>
          <p style={{
            margin: "10px 0 0", color: "#94a3b8", fontSize: 15, lineHeight: 1.6,
          }}>
            You're on the <strong style={{ color: "#cbd5e1" }}>{userPlan.toUpperCase()}</strong> plan.
            {" "}{name || "This tool"} is part of {isEnterprise ? "Enterprise" : "Pro"} — upgrade once,
            unlock every {isEnterprise ? "Enterprise" : "Pro"} feature forever.
          </p>
        </div>

        <div style={{ padding: "26px 36px 8px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "#94a3b8", textTransform: "uppercase", marginBottom: 14,
          }}>What you unlock</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
            {benefits.map(b => (
              <li key={b} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                fontSize: 14, color: "#cbd5e1", lineHeight: 1.55,
              }}>
                <span style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: 999,
                  background: `${color}22`, color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, marginTop: 1,
                }}>✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{
          padding: "22px 36px 32px",
          borderTop: "1px solid rgba(148,163,184,0.08)",
          marginTop: 18,
        }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8,
            justifyContent: "center", marginBottom: 18,
          }}>
            <span style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 32, fontWeight: 800,
            }}>{isEnterprise ? "Custom" : "₹990"}</span>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>
              {isEnterprise ? "· talk to us" : "/ year · ₹83/mo"}
            </span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <a
              href={isEnterprise ? "/contact?intent=enterprise" : `/pricing?from=${encodeURIComponent(path)}`}
              style={{
                padding: "15px 22px", borderRadius: 12,
                background: color, color: "#030712",
                fontSize: 16, fontWeight: 800,
                fontFamily: "'Hanken Grotesk', sans-serif",
                textAlign: "center", textDecoration: "none",
                letterSpacing: 0.3,
              }}
            >{isEnterprise ? "Talk to us →" : `Upgrade to Pro →`}</a>

            {!isEnterprise && userPlan === "free" && (
              <a
                href="/pricing?trial=pro"
                style={{
                  padding: "13px 22px", borderRadius: 12,
                  background: "rgba(148,163,184,0.08)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(148,163,184,0.18)",
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none", textAlign: "center",
                }}
              >Start 7-day free trial · no card</a>
            )}

            <a
              href="/dashboard"
              style={{
                background: "transparent", color: "#64748b",
                fontSize: 13, padding: "8px 0",
                textAlign: "center", textDecoration: "none",
              }}
            >← Back to dashboard</a>
          </div>

          <p style={{
            margin: "16px 0 0", fontSize: 11, color: "#64748b",
            textAlign: "center", lineHeight: 1.5,
          }}>
            Built in India · INR-native Cashfree · Cancel anytime · NIST AAL2 2FA
          </p>
        </div>
      </div>
    </div>
  );
}
