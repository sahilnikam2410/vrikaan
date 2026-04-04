import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

const T = {
  bg: "#030712", card: "rgba(15,23,42,0.5)", white: "#f1f5f9",
  muted: "#94a3b8", mutedDark: "#64748b", cyan: "#14e3c5",
  accent: "#6366f1", border: "rgba(148,163,184,0.08)",
  cyanDim: "rgba(20,227,197,0.06)", accentDim: "rgba(99,102,241,0.06)",
  green: "#22c55e",
};

const plans = [
  {
    key: "free",
    name: "Free",
    monthlyPrice: 0,
    desc: "For personal use & getting started",
    features: [
      "Basic fraud detection",
      "Security advisories",
      "Email breach check",
      "Community reports",
      "1 device",
    ],
    cta: "Get Started Free",
    highlight: false,
    accentColor: T.muted,
  },
  {
    key: "starter",
    name: "Standard",
    monthlyPrice: 49,
    desc: "For individuals who need real protection",
    features: [
      "Real-time threat detection",
      "VPN Protection",
      "5 Devices",
      "Email protection",
      "24/7 Support",
      "Weekly reports",
      "Phishing alerts",
      "Priority response",
    ],
    cta: "Upgrade to Standard",
    highlight: true,
    accentColor: T.cyan,
  },
  {
    key: "pro",
    name: "Advanced",
    monthlyPrice: 99,
    desc: "For families & power users who need maximum security",
    features: [
      "Everything in Standard",
      "Identity monitoring",
      "Dark web surveillance",
      "Family/team protection (10 users)",
      "Incident recovery ops",
      "Dedicated analyst",
      "Advanced analytics",
    ],
    cta: "Go Advanced",
    highlight: false,
    accentColor: "#f97316",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthlyPrice: 199,
    desc: "For companies & organizations at scale",
    features: [
      "Everything in Advanced",
      "Unlimited devices & users",
      "Custom API integrations",
      "24/7 dedicated SOC team",
      "Compliance reporting (SOC2, HIPAA)",
      "SLA-backed response guarantee",
      "White-label options",
      "Priority support",
    ],
    cta: "Go Enterprise",
    highlight: false,
    accentColor: T.accent,
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference immediately. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    q: "What does the 30-day money-back guarantee cover?",
    a: "If you're not fully satisfied within 30 days of your first paid subscription, contact our support team for a full refund — no questions asked. The guarantee applies to all paid plans.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual billing charges the equivalent of 10 months upfront, giving you 2 months free compared to monthly billing. You'll receive one invoice per year and can cancel before the renewal date for a prorated refund.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed through Stripe with PCI DSS Level 1 compliance. We never store your card details on our servers — only a tokenized reference is kept for subscription management.",
  },
  {
    q: "Does the Enterprise plan support custom integrations?",
    a: "Yes. Enterprise customers get full API access plus a dedicated integration manager who will help connect Secuvion with your existing security stack, SIEM tools, and internal workflows.",
  },
];

function CheckIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" stroke={color || T.green} strokeOpacity="0.25" />
      <path d="M5 8.5L7 10.5L11 6" stroke={color || T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 1.5L3 8.5H7.5L6.5 13.5L12 6.5H7.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", flexShrink: 0 }}
    >
      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke={T.mutedDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  function getPrice(plan) {
    if (plan.monthlyPrice === 0) return 0;
    return annual ? plan.monthlyPrice * 10 : plan.monthlyPrice;
  }

  function getPeriodLabel(plan) {
    if (plan.monthlyPrice === 0) return null;
    return annual ? "/year" : "/month";
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Back to Home */}
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
            &larr; Back to Home
          </Link>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 100,
            background: `${T.accent}0c`, border: `1px solid ${T.accent}20`,
            fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5,
          }}>
            Simple Pricing
          </span>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px",
          }}>
            Choose Your{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Shield
            </span>
          </h1>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.8 }}>
            World-class protection at prices built for real people. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 14,
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 100, padding: "6px 8px 6px 16px",
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: annual ? T.mutedDark : T.white, transition: "color 0.2s" }}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(v => !v)}
              aria-label="Toggle annual billing"
              style={{
                position: "relative", width: 44, height: 24, borderRadius: 100,
                background: annual ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "rgba(148,163,184,0.12)",
                border: "none", cursor: "pointer", transition: "background 0.25s", padding: 0,
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: annual ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.25s", display: "block",
                boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
              }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, color: annual ? T.white : T.mutedDark, transition: "color 0.2s" }}>
              Annual
            </span>
            {annual && (
              <span style={{
                padding: "3px 10px", borderRadius: 100,
                background: "linear-gradient(135deg, rgba(20,227,197,0.15), rgba(99,102,241,0.1))",
                border: `1px solid ${T.cyan}30`,
                fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: 0.3,
              }}>
                2 months free
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          className="resp-grid-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 16,
            alignItems: "start",
          }}
        >
          {plans.map((plan) => {
            const isHovered = hoveredPlan === plan.key;
            const price = getPrice(plan);
            const period = getPeriodLabel(plan);

            return (
              <div
                key={plan.key}
                onMouseEnter={() => setHoveredPlan(plan.key)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  position: "relative",
                  background: plan.highlight
                    ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.05))"
                    : T.card,
                  border: plan.highlight
                    ? `1px solid rgba(99,102,241,0.3)`
                    : isHovered
                    ? `1px solid rgba(148,163,184,0.18)`
                    : `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: "36px 28px",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  transform: plan.highlight ? "translateY(-6px)" : isHovered ? "translateY(-3px)" : "translateY(0)",
                  transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
                  boxShadow: plan.highlight
                    ? "0 20px 60px rgba(99,102,241,0.15)"
                    : isHovered
                    ? "0 12px 40px rgba(0,0,0,0.3)"
                    : "none",
                }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    padding: "4px 16px",
                    background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#fff",
                    whiteSpace: "nowrap", letterSpacing: 0.3,
                  }}>
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 6px",
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: 13, color: T.mutedDark, margin: 0, lineHeight: 1.5 }}>
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 46, fontWeight: 800, letterSpacing: "-0.04em",
                      color: plan.highlight ? T.cyan : T.white,
                      lineHeight: 1,
                    }}>
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {period && (
                      <span style={{
                        fontSize: 14, color: T.mutedDark,
                        paddingBottom: 6, fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {period}
                      </span>
                    )}
                  </div>
                  {annual && plan.monthlyPrice > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12, color: T.mutedDark }}>
                      <span style={{ textDecoration: "line-through" }}>${plan.monthlyPrice * 12}/yr</span>
                      {" "}
                      <span style={{ color: T.cyan, fontWeight: 600 }}>
                        Save ${plan.monthlyPrice * 2}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ flex: 1, marginBottom: 28 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                      <CheckIcon color={plan.highlight ? T.cyan : T.green} />
                      <span style={{ fontSize: 13, color: T.white, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {plan.monthlyPrice === 0 ? (
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    style={{
                      display: "block", textAlign: "center", padding: "13px 20px",
                      background: "transparent",
                      border: `1px solid rgba(148,163,184,0.2)`,
                      borderRadius: 10, color: T.white, fontSize: 14, fontWeight: 600,
                      textDecoration: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <Link
                    to={user ? `/checkout?plan=${plan.key}&billing=${annual ? "annual" : "monthly"}` : "/signup"}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "13px 20px",
                      background: plan.highlight
                        ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})`
                        : "transparent",
                      border: plan.highlight
                        ? "none"
                        : `1px solid rgba(99,102,241,0.3)`,
                      borderRadius: 10,
                      color: plan.highlight ? "#fff" : T.accent,
                      fontSize: 14, fontWeight: 700, textDecoration: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: plan.highlight ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
                      transition: "opacity 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <LightningIcon /> {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Guarantee note */}
        <div style={{ textAlign: "center", marginBottom: 96 }}>
          <p style={{ fontSize: 13, color: T.mutedDark, margin: "24px 0 0" }}>
            All paid plans include a{" "}
            <span style={{ color: T.muted, fontWeight: 600 }}>30-day money-back guarantee</span>
            . No questions asked.
          </p>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{
              display: "inline-block", padding: "5px 14px", borderRadius: 100,
              background: T.cyanDim, border: `1px solid rgba(20,227,197,0.12)`,
              fontSize: 11, fontWeight: 600, color: T.cyan, marginBottom: 16, letterSpacing: 0.5,
            }}>
              FAQ
            </span>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 700,
              letterSpacing: "-0.02em", margin: "0 0 14px",
            }}>
              Common Questions
            </h2>
            <p style={{ color: T.muted, fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
              Everything you need to know about our plans and billing.
            </p>
          </div>

          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    background: T.card,
                    border: isOpen
                      ? `1px solid rgba(99,102,241,0.2)`
                      : `1px solid ${T.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 16,
                      padding: "20px 24px", background: "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 15, fontWeight: 600, color: T.white, lineHeight: 1.4,
                    }}>
                      {faq.q}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 24px 22px" }}>
                      <p style={{
                        fontSize: 14, color: T.muted, lineHeight: 1.8, margin: 0,
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{
          textAlign: "center", padding: "56px 32px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.03))",
          border: `1px solid rgba(99,102,241,0.1)`,
          borderRadius: 20,
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 32, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.02em",
          }}>
            Not sure which plan?
          </h2>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Start free — no credit card required. Upgrade whenever you're ready.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{
              display: "inline-block", padding: "13px 32px",
              background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
              color: "#fff", borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}>
              Start for Free
            </Link>
            <Link to="/contact" style={{
              display: "inline-block", padding: "13px 32px",
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted, borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Talk to Sales
            </Link>
          </div>
        </div>

      </div>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .resp-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) and (min-width: 769px) {
          .resp-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
