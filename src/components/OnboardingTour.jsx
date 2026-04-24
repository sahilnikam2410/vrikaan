import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const T = {
  bg: "rgba(3,7,18,0.85)",
  card: "rgba(10,15,30,0.98)",
  white: "#f1f5f9",
  muted: "#94a3b8",
  accent: "#6366f1",
  cyan: "#14e3c5",
  border: "rgba(148,163,184,0.12)",
};

const STEPS = [
  {
    icon: "🛡",
    title: "Welcome to VRIKAAN",
    desc: "Your all-in-one cybersecurity toolkit. Let's take a quick 30-second tour of what you can do here.",
    cta: null,
  },
  {
    icon: "🔍",
    title: "Scan anything suspicious",
    desc: "Run URLs, emails, phone numbers, and messages through our Fraud Analyzer for an instant AI-powered threat check.",
    cta: { label: "Try Fraud Analyzer", to: "/fraud-analyzer" },
  },
  {
    icon: "🔐",
    title: "Generate & store passwords",
    desc: "Built-in password vault with AES-256 encryption. Generate strong passwords and check if yours have leaked.",
    cta: { label: "Open Password Vault", to: "/password-vault" },
  },
  {
    icon: "📊",
    title: "Track your security score",
    desc: "Your dashboard shows your personal security score, connected devices, and real-time threat alerts.",
    cta: { label: "View Dashboard", to: "/dashboard" },
  },
  {
    icon: "🎁",
    title: "Earn free credits",
    desc: "Refer friends to earn bonus credits and free subscription upgrades. You're all set — happy scanning!",
    cta: { label: "Refer & Earn", to: "/referral" },
  },
];

const STORAGE_KEY = "secuvion_onboarding_done";

export default function OnboardingTour({ uid, forceShow = false, onClose }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid) return;
    const key = `${STORAGE_KEY}_${uid}`;
    const seen = localStorage.getItem(key);
    if (forceShow || !seen) {
      setOpen(true);
      setStep(0);
    }
  }, [uid, forceShow]);

  const finish = () => {
    if (uid) localStorage.setItem(`${STORAGE_KEY}_${uid}`, "1");
    setOpen(false);
    onClose?.();
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const prev = () => { if (step > 0) setStep((s) => s - 1); };

  if (!open) return null;

  const s = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: T.bg,
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "36px 32px 28px",
          position: "relative",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          animation: "scaleIn 0.4s ease",
        }}
      >
        <button
          onClick={finish}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            background: "rgba(148,163,184,0.08)",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.muted,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Skip tour"
        >
          ×
        </button>

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${T.accent}22, ${T.cyan}22)`,
            border: `1px solid ${T.accent}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            margin: "0 auto 20px",
          }}
        >
          {s.icon}
        </div>

        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: T.white,
            textAlign: "center",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}
        >
          {s.title}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: T.muted,
            textAlign: "center",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          {s.desc}
        </p>

        {s.cta && (
          <button
            onClick={() => { finish(); navigate(s.cta.to); }}
            style={{
              width: "100%",
              padding: "12px 16px",
              marginBottom: 16,
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {s.cta.label} →
          </button>
        )}

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? T.accent : "rgba(148,163,184,0.2)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button
            onClick={step === 0 ? finish : prev}
            style={{
              padding: "10px 18px",
              background: "transparent",
              color: T.muted,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === 0 ? "Skip" : "Back"}
          </button>
          <button
            onClick={next}
            style={{
              padding: "10px 24px",
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {step === STEPS.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
