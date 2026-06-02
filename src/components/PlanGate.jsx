import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const PLAN_LEVELS = { free: 0, starter: 1, pro: 2, enterprise: 3, unlimited: 3 };

export function isPlanAllowed(userPlan, requiredPlan) {
  return (PLAN_LEVELS[userPlan] || 0) >= (PLAN_LEVELS[requiredPlan] || 0);
}

export default function PlanGate({ required = "pro", feature = "This feature", children }) {
  const { user } = useAuth();
  const userPlan = user?.plan || "free";

  if (isPlanAllowed(userPlan, required)) return children;

  // Show locked overlay
  return (
    <div style={{ position: "relative", minHeight: 200 }}>
      <div style={{ filter: "blur(4px)", pointerEvents: "none", opacity: 0.3 }}>
        {children}
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)",
        borderRadius: 14, backdropFilter: "blur(8px)", zIndex: 10,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginTop: 16, fontFamily: "'Vrikaan Sans', sans-serif" }}>
          {required.charAt(0).toUpperCase() + required.slice(1)} Plan Required
        </h3>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, textAlign: "center", maxWidth: 300 }}>
          {feature} requires the {required} plan or higher. Upgrade to unlock.
        </p>
        <Link to="/pricing" style={{
          marginTop: 16, padding: "10px 24px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
          borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600,
          fontFamily: "'Vrikaan Sans', sans-serif",
        }}>
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
