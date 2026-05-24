import { useAuth } from "../context/AuthContext";

/**
 * SeniorModeBanner — global banner shown on UPI / banking / OTP-related tool
 * pages when the logged-in user has Family role = "senior". Reinforces
 * scam-check habits + surfaces the family safe-word vault.
 *
 * Mount on: /upi-lookup, /scam-check, /otp-decay, /loan-app-check, /scam-recovery
 * (anywhere the user might be talking to a real or fake "bank officer").
 */
export default function SeniorModeBanner({ tone = "warn" }) {
  const { user } = useAuth();
  if (user?.familyRole !== "senior") return null;

  const colors = tone === "warn"
    ? { bg: "rgba(251,191,36,0.10)", border: "#fbbf24", text: "#fbbf24" }
    : { bg: "rgba(20,227,197,0.10)", border: "#14e3c5", text: "#14e3c5" };

  return (
    <div role="alert" style={{
      position: "sticky", top: 80, zIndex: 60,
      margin: "16px 0",
      padding: "16px 22px",
      background: colors.bg,
      border: `1.5px solid ${colors.border}`,
      borderRadius: 14,
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>🛡</span>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
          Senior Mode active — pause before you act
        </div>
        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
          If someone is asking for OTP, UPI PIN, or to download an app — <strong>STOP</strong>.
          Real banks NEVER ask for these. Call your family before paying. Use the{" "}
          <a href="/safe-word" style={{ color: colors.text, fontWeight: 700 }}>family safe-word</a>{" "}
          to verify any caller claiming to be a relative.
        </div>
      </div>
      <a href="/scam-recovery" style={{
        flexShrink: 0,
        padding: "8px 16px", borderRadius: 8,
        background: colors.border, color: "#020617",
        textDecoration: "none", fontSize: 12, fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        Get help now
      </a>
    </div>
  );
}
