import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const T = {
  bg: "rgba(3,7,18,0.92)",
  card: "rgba(17,24,39,0.96)",
  white: "#f1f5f9",
  muted: "#94a3b8",
  cyan: "#14e3c5",
  accent: "#6366f1",
  green: "#22c55e",
  border: "rgba(148,163,184,0.15)",
};

const SHOWN_KEY = "vrikaan_exit_intent_shown";
const DISMISS_DAYS = 7; // re-show after a week

const PROMO_CODE = "VRIKAAN20";

export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Skip if user is on a paid plan or recently dismissed
    if (user?.plan && user.plan !== "free") return;
    const shown = localStorage.getItem(SHOWN_KEY);
    if (shown) {
      const days = (Date.now() - parseInt(shown, 10)) / 86400000;
      if (days < DISMISS_DAYS) return;
    }

    let armed = false;
    const arm = setTimeout(() => { armed = true; }, 8000); // arm after 8s on page

    const onLeave = (e) => {
      if (!armed) return;
      // Mouse leaves through top edge with upward velocity
      if (e.clientY <= 0 && e.relatedTarget === null) {
        setOpen(true);
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
        document.removeEventListener("mouseout", onLeave);
      }
    };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [user]);

  if (!open) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, background: T.bg, backdropFilter: "blur(6px)",
        zIndex: 99997, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: "'Hanken Grotesk', sans-serif",
        animation: "ei-fade 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 460, width: "100%", padding: 32,
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 18, position: "relative",
          animation: "ei-pop 0.32s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(148,163,184,0.08)", border: "none",
            color: T.muted, fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >×</button>

        <div style={{
          width: 64, height: 64, margin: "0 auto 16px",
          borderRadius: 18,
          background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
        }}>🎁</div>

        <h2 style={{
          fontSize: 24, fontWeight: 800, color: T.white,
          textAlign: "center", margin: "0 0 8px",
          fontFamily: "'Hanken Grotesk', sans-serif",
          lineHeight: 1.2,
        }}>
          Wait — 20% off your first month
        </h2>

        <p style={{
          fontSize: 14, color: T.muted, textAlign: "center",
          margin: "0 0 24px", lineHeight: 1.6,
        }}>
          Try VRIKAAN Advanced for ₹79/month instead of ₹99. AI-powered fraud detection, dark web monitoring, identity X-ray, and more.
        </p>

        <div style={{
          padding: "14px 16px", marginBottom: 16,
          background: "rgba(20,227,197,0.08)",
          border: `1px dashed ${T.cyan}40`,
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Code</div>
            <div style={{
              fontSize: 18, fontWeight: 800, color: T.cyan,
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
            }}>{PROMO_CODE}</div>
          </div>
          <button
            type="button"
            onClick={copyCode}
            style={{
              padding: "8px 14px", borderRadius: 8,
              background: copied ? T.green : "rgba(148,163,184,0.1)",
              border: `1px solid ${copied ? T.green : T.border}`,
              color: copied ? "#fff" : T.white,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => { setOpen(false); navigate("/pricing"); }}
          style={{
            width: "100%", padding: "14px",
            background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            border: "none", borderRadius: 10,
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Hanken Grotesk', sans-serif",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          Claim 20% off →
        </button>

        <p style={{
          fontSize: 11, color: T.muted, textAlign: "center",
          margin: "12px 0 0", lineHeight: 1.5,
        }}>
          One-time offer · Expires in 24 hours · No card needed for trial
        </p>
      </div>
      <style>{`
        @keyframes ei-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ei-pop { from { opacity: 0; transform: translateY(20px) scale(0.94) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}
