import { useState, useEffect } from "react";

const T = {
  bg: "rgba(3,7,18,0.97)", white: "#f1f5f9", muted: "#94a3b8",
  accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.1)",
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("secuvion_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("secuvion_cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("secuvion_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        role="dialog"
        aria-label="Cookie consent"
        style={{
          position: "fixed", bottom: 24, left: 24, right: 24,
          maxWidth: 480, zIndex: 10000,
          background: T.bg, backdropFilter: "blur(20px)",
          border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "20px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "cookieSlideUp 0.4s ease both",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, color: T.white,
              margin: "0 0 6px", fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Privacy First
            </h4>
            <p style={{ fontSize: 13, color: T.muted, margin: "0 0 16px", lineHeight: 1.6 }}>
              We use essential cookies for site functionality and anonymous analytics to improve your experience. No tracking or third-party cookies.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={accept} style={{
                padding: "9px 22px", borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Accept
              </button>
              <button onClick={decline} style={{
                padding: "9px 22px", borderRadius: 8,
                background: "transparent", border: `1px solid ${T.border}`,
                color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Decline
              </button>
            </div>
          </div>
          <button
            onClick={decline}
            aria-label="Close"
            style={{
              background: "none", border: "none", color: T.muted,
              cursor: "pointer", fontSize: 18, padding: 4, lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
