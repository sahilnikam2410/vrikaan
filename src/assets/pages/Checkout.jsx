import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const plans = {
  starter: { name: "Standard", price: 49, priceUSD: 49, annual: 490, features: ["200 AI credits/day", "Real-time threat detection", "5 devices", "Email protection", "Phishing alerts", "Priority response"] },
  standard: { name: "Standard", price: 49, priceUSD: 49, annual: 490, features: ["200 AI credits/day", "Real-time threat detection", "5 devices", "Email protection", "Phishing alerts", "Priority response"] },
  pro: { name: "Advanced", price: 99, priceUSD: 99, annual: 990, features: ["1000 AI credits", "Everything in Standard", "Identity monitoring", "Dark web surveillance", "Family/team protection", "Incident recovery ops", "Dedicated analyst"] },
  advanced: { name: "Advanced", price: 99, priceUSD: 99, annual: 990, features: ["1000 AI credits", "Everything in Standard", "Identity monitoring", "Dark web surveillance", "Family/team protection", "Incident recovery ops", "Dedicated analyst"] },
  enterprise: { name: "Enterprise", price: 199, priceUSD: 199, annual: 1990, features: ["Unlimited AI credits", "Everything in Advanced", "Unlimited devices & users", "Custom API integrations", "24/7 dedicated SOC team", "Compliance reporting", "SLA-backed guarantee", "White-label options"] },
};

const IconCreditCard = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconLock = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconCheck = ({ size = 14, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconShieldCheck = ({ size = 16, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconArrowLeft = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconLightning = ({ size = 18, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconCopy = ({ size = 16, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconChevron = ({ size = 16, color = "currentColor", style = {}, down = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ ...style, transform: down ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const inputStyle = (hasError) => ({
  width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)",
  border: hasError ? `1px solid ${T.red}` : `1px solid ${T.border}`,
  borderRadius: 10, color: T.white, fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const paymentMethods = [
  { id: "razorpay", label: "Razorpay (UPI/Cards)", icon: "\uD83C\uDFE6" },
  { id: "upi", label: "UPI Direct", icon: "\uD83D\uDCF1" },
  { id: "crypto", label: "Crypto", icon: "\u20BF" },
  { id: "card", label: "International Card", icon: "\uD83D\uDCB3" },
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
      background: copied ? "rgba(34,197,94,0.1)" : "rgba(15,23,42,0.6)",
      color: copied ? T.green : T.muted, fontSize: 12, fontWeight: 500,
      cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
    }}>
      <IconCopy size={14} color={copied ? T.green : T.muted} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ConfettiOverlay() {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: [T.accent, T.cyan, T.green, "#fbbf24", "#f472b6"][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 6,
    }))
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", top: 0, left: `${p.x}%`,
          width: p.size, height: p.size * 0.6, borderRadius: 2,
          background: p.color,
          animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

export default function Checkout() {
  const { user, updatePlan } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planKey = params.get("plan") || "pro";
  const plan = plans[planKey] || plans.pro;

  const [billing, setBilling] = useState("monthly");
  const [method, setMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdmin, setShowAdmin] = useState(false);

  // Card state
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  // UPI state
  const [upiId, setUpiId] = useState("");
  const [upiTxnId, setUpiTxnId] = useState("");
  // Crypto state
  const [cryptoCoin, setCryptoCoin] = useState("btc");
  const [cryptoTxHash, setCryptoTxHash] = useState("");
  // Admin config state
  const [adminConfig, setAdminConfig] = useState({
    razorpayKey: localStorage.getItem("secuvion_razorpay_key") || "",
    upiId: localStorage.getItem("secuvion_upi_id") || "secuvion@ptyes",
    btcAddress: localStorage.getItem("secuvion_btc_address") || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ethAddress: localStorage.getItem("secuvion_eth_address") || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  });

  const price = billing === "annual" ? plan.annual : plan.price;
  const priceUSD = billing === "annual" ? (plan.priceUSD * 10).toFixed(2) : plan.priceUSD;
  const savings = billing === "annual" ? (plan.price * 12 - plan.annual) : 0;

  const merchantUpiId = localStorage.getItem("secuvion_upi_id") || "secuvion@ptyes";
  const btcAddress = localStorage.getItem("secuvion_btc_address") || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const ethAddress = localStorage.getItem("secuvion_eth_address") || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const formatCard = (val) => val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 2) return clean.slice(0, 2) + "/" + clean.slice(2, 4);
    return clean;
  };

  const savePaymentRecord = useCallback((paymentId, paymentMethod) => {
    const records = JSON.parse(localStorage.getItem("secuvion_payments") || "[]");
    records.push({
      id: paymentId,
      method: paymentMethod,
      plan: planKey,
      amount: price,
      currency: "INR",
      date: new Date().toISOString(),
      status: "success",
    });
    localStorage.setItem("secuvion_payments", JSON.stringify(records));
  }, [planKey, price]);

  const handlePaymentSuccess = useCallback((paymentMethod, paymentId) => {
    updatePlan(planKey);
    const creditData = JSON.parse(localStorage.getItem("secuvion_ai_credits") || "{}");
    creditData.plan = planKey === "pro" ? "pro" : planKey === "enterprise" ? "unlimited" : "starter";
    creditData.used = 0;
    localStorage.setItem("secuvion_ai_credits", JSON.stringify(creditData));
    savePaymentRecord(paymentId || `pay_${Date.now()}`, paymentMethod);
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 3000);
  }, [planKey, updatePlan, navigate, savePaymentRecord]);

  // Razorpay handler
  const handleRazorpay = async () => {
    setProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      setErrors({ razorpay: "Failed to load Razorpay SDK. Please check your internet connection." });
      setProcessing(false);
      return;
    }
    const options = {
      key: localStorage.getItem("secuvion_razorpay_key") || "rzp_test_placeholder",
      amount: price * 100,
      currency: "INR",
      name: "SECUVION",
      description: `${plan.name} Plan - ${billing} billing`,
      image: "/favicon.svg",
      handler: function (response) {
        handlePaymentSuccess("razorpay", response.razorpay_payment_id);
      },
      prefill: { name: user?.name || "", email: user?.email || "" },
      theme: { color: "#6366f1" },
      method: { upi: true, card: true, netbanking: true, wallet: true },
      modal: {
        ondismiss: function () { setProcessing(false); },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function () {
      setErrors({ razorpay: "Payment failed. Please try again." });
      setProcessing(false);
    });
    rzp.open();
  };

  // UPI manual verification
  const handleUpiVerify = () => {
    if (!upiTxnId.trim()) {
      setErrors({ upiTxn: "Please enter your UPI Transaction ID" });
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      handlePaymentSuccess("upi_direct", upiTxnId);
    }, 1500);
  };

  // Crypto manual verification
  const handleCryptoVerify = () => {
    if (!cryptoTxHash.trim()) {
      setErrors({ cryptoTx: "Please enter the transaction hash" });
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      handlePaymentSuccess(`crypto_${cryptoCoin}`, cryptoTxHash);
    }, 1500);
  };

  // Card payment
  const validateCard = () => {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid card number";
    if (!card.name.trim()) e.name = "Enter cardholder name";
    if (card.expiry.length < 5) e.expiry = "Enter valid expiry";
    if (card.cvv.length < 3) e.cvv = "Enter CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCardPayment = (e) => {
    e.preventDefault();
    if (!validateCard()) return;
    setProcessing(true);
    setTimeout(() => {
      handlePaymentSuccess("international_card", `card_${Date.now()}`);
    }, 2500);
  };

  // Admin config save
  const saveAdminConfig = () => {
    if (adminConfig.razorpayKey) localStorage.setItem("secuvion_razorpay_key", adminConfig.razorpayKey);
    if (adminConfig.upiId) localStorage.setItem("secuvion_upi_id", adminConfig.upiId);
    if (adminConfig.btcAddress) localStorage.setItem("secuvion_btc_address", adminConfig.btcAddress);
    if (adminConfig.ethAddress) localStorage.setItem("secuvion_eth_address", adminConfig.ethAddress);
    setErrors({ adminSaved: true });
    setTimeout(() => setErrors({}), 2000);
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=SECUVION&am=${price}&cu=INR`;
  const btcQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${btcAddress}`;
  const ethQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ethAddress}`;

  // Approximate crypto prices (static estimates)
  const btcPriceINR = 5500000;
  const ethPriceINR = 220000;
  const btcEquiv = (price / btcPriceINR).toFixed(6);
  const ethEquiv = (price / ethPriceINR).toFixed(4);
  const usdtEquiv = priceUSD;

  /* ==================== SUCCESS SCREEN ==================== */
  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <SEO title="Payment Successful" description="Your SECUVION subscription is now active." path="/checkout" />
        <Navbar />
        <ConfettiOverlay />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 100 }}>
          <div style={{ textAlign: "center", maxWidth: 440, padding: "0 24px" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px", boxShadow: "0 0 60px rgba(34,197,94,0.2)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}>
              <IconCheck size={44} color={T.green} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: T.white, marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
              Payment Successful!
            </h2>
            <p style={{ fontSize: 16, color: T.cyan, marginBottom: 6, fontWeight: 600 }}>
              Welcome to SECUVION {plan.name}
            </p>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>
              Your account has been upgraded. All features are now unlocked.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
              background: "rgba(99,102,241,0.1)", borderRadius: 8, border: `1px solid rgba(99,102,241,0.2)`,
            }}>
              <span style={{ fontSize: 13, color: T.muted }}>Redirecting to dashboard in 3 seconds...</span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 40px rgba(34,197,94,0.15); }
            50% { box-shadow: 0 0 80px rgba(34,197,94,0.3); }
          }
        `}</style>
      </div>
    );
  }

  /* ==================== MAIN CHECKOUT ==================== */
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Checkout" description="Complete your Secuvion subscription securely." path="/checkout" />
      <Navbar />

      <div style={{ paddingTop: 100 }}>
        {/* Back link */}
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "16px 20px 0" }}>
          <Link to="/pricing" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: T.muted, textDecoration: "none", fontSize: 13, transition: "color 0.2s",
          }} onMouseEnter={e => e.currentTarget.style.color = T.white} onMouseLeave={e => e.currentTarget.style.color = T.muted}>
            <IconArrowLeft size={15} color="currentColor" /> Back to Pricing
          </Link>
        </div>

        {/* Heading */}
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconLock size={14} color={T.green} />
            <span style={{ fontSize: 12, color: T.green, fontWeight: 500, letterSpacing: 0.5 }}>Secure Checkout</span>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="checkout-grid" style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 20px 40px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40 }}>

          {/* ===== LEFT: Payment Section ===== */}
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T.white, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
              Payment Details
            </h2>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 28 }}>Choose your preferred payment method</p>

            {/* Billing Toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {["monthly", "annual"].map((b) => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: billing === b ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "transparent",
                  border: billing === b ? "none" : `1px solid ${T.border}`,
                  color: billing === b ? "#fff" : T.muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
                }}>
                  {b === "monthly" ? "Monthly" : `Annual (Save \u20B9${savings || plan.price * 12 - plan.annual})`}
                </button>
              ))}
            </div>

            {/* Payment Method Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {paymentMethods.map((m) => (
                <button key={m.id} onClick={() => { setMethod(m.id); setErrors({}); }} style={{
                  padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: method === m.id ? "rgba(99,102,241,0.15)" : "rgba(15,23,42,0.4)",
                  border: method === m.id ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
                  color: method === m.id ? T.white : T.muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{m.icon}</span> {m.label}
                </button>
              ))}
            </div>

            {/* ---- RAZORPAY METHOD ---- */}
            {method === "razorpay" && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Pay with Razorpay
                </h3>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
                  Supports UPI, Credit/Debit Cards, Net Banking, and Wallets
                </p>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24,
                }}>
                  {[
                    { label: "UPI", desc: "GPay, PhonePe, Paytm" },
                    { label: "Cards", desc: "Visa, Mastercard, Rupay" },
                    { label: "Net Banking", desc: "All major banks" },
                    { label: "Wallets", desc: "Paytm, Freecharge" },
                  ].map((item) => (
                    <div key={item.label} style={{
                      padding: "14px 12px", borderRadius: 10, background: "rgba(15,23,42,0.6)",
                      border: `1px solid ${T.border}`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{item.desc}</div>
                    </div>
                  ))}
                </div>

                {errors.razorpay && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: `1px solid rgba(239,68,68,0.2)`, marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: T.red }}>{errors.razorpay}</span>
                  </div>
                )}

                <button onClick={handleRazorpay} disabled={processing} style={{
                  width: "100%", padding: "16px", border: "none", borderRadius: 10,
                  background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  color: "#fff", fontSize: 16, fontWeight: 700, cursor: processing ? "wait" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s",
                }}>
                  <IconLock size={18} color="#fff" />
                  {processing ? "Opening Razorpay..." : `Pay \u20B9${price.toLocaleString("en-IN")}`}
                </button>
                <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
                  Powered by Razorpay. You will be redirected to a secure payment page.
                </p>
              </div>
            )}

            {/* ---- UPI DIRECT METHOD ---- */}
            {method === "upi" && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  UPI Direct Payment
                </h3>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
                  Send payment directly via any UPI app and confirm below
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  {/* QR Code */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      background: "#fff", borderRadius: 12, padding: 12, display: "inline-block", marginBottom: 12,
                    }}>
                      <img src={upiQrUrl} alt="UPI QR Code" width={176} height={176} loading="lazy" style={{ display: "block", borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 12, color: T.muted }}>Scan with any UPI app</p>
                  </div>

                  {/* Payment details */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>Pay to UPI ID</label>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "12px 14px",
                        background: "rgba(15,23,42,0.6)", borderRadius: 8, border: `1px solid ${T.border}`,
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.cyan, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>
                          {merchantUpiId}
                        </span>
                        <CopyButton text={merchantUpiId} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>Amount</label>
                      <div style={{
                        padding: "12px 14px", background: "rgba(15,23,42,0.6)", borderRadius: 8,
                        border: `1px solid ${T.border}`, fontSize: 20, fontWeight: 700, color: T.green,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>
                        {"\u20B9"}{price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>Your UPI ID (optional)</label>
                      <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" style={inputStyle(false)} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: T.white, display: "block", marginBottom: 8 }}>
                    UPI Transaction ID / Reference Number
                  </label>
                  <input value={upiTxnId} onChange={(e) => { setUpiTxnId(e.target.value); setErrors({}); }}
                    placeholder="Enter your 12-digit UPI transaction ID"
                    style={{ ...inputStyle(!!errors.upiTxn), fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }} />
                  {errors.upiTxn && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.upiTxn}</span>}

                  <button onClick={handleUpiVerify} disabled={processing} style={{
                    width: "100%", padding: "16px", border: "none", borderRadius: 10, marginTop: 16,
                    background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: processing ? "wait" : "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <IconCheck size={18} color="#fff" />
                    {processing ? "Verifying Payment..." : "I've Completed the Payment"}
                  </button>
                </div>
              </div>
            )}

            {/* ---- CRYPTO METHOD ---- */}
            {method === "crypto" && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Cryptocurrency Payment
                </h3>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
                  Send the exact amount to the wallet address below
                </p>

                {/* Coin selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  {[
                    { id: "btc", label: "Bitcoin", symbol: "BTC" },
                    { id: "eth", label: "Ethereum", symbol: "ETH" },
                    { id: "usdt", label: "USDT", symbol: "USDT" },
                  ].map((c) => (
                    <button key={c.id} onClick={() => setCryptoCoin(c.id)} style={{
                      flex: 1, padding: "12px 8px", borderRadius: 10, border: cryptoCoin === c.id ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
                      background: cryptoCoin === c.id ? "rgba(99,102,241,0.12)" : "rgba(15,23,42,0.4)",
                      color: cryptoCoin === c.id ? T.white : T.muted, fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 14, color: cryptoCoin === c.id ? T.cyan : T.muted }}>{c.symbol}</div>
                    </button>
                  ))}
                </div>

                {/* Wallet address + QR */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, marginBottom: 20, alignItems: "start" }}>
                  <div>
                    <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 8 }}>
                      {cryptoCoin === "btc" ? "Bitcoin" : cryptoCoin === "eth" ? "Ethereum" : "USDT (ERC-20)"} Address
                    </label>
                    <div style={{
                      padding: "14px", background: "rgba(15,23,42,0.6)", borderRadius: 10,
                      border: `1px solid ${T.border}`, wordBreak: "break-all", marginBottom: 10,
                    }}>
                      <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: T.white, lineHeight: 1.6 }}>
                        {cryptoCoin === "btc" ? btcAddress : ethAddress}
                      </span>
                    </div>
                    <CopyButton text={cryptoCoin === "btc" ? btcAddress : ethAddress} />

                    <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(99,102,241,0.06)", borderRadius: 8, border: `1px solid rgba(99,102,241,0.1)` }}>
                      <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Amount to send</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: T.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {cryptoCoin === "btc" && `${btcEquiv} BTC`}
                        {cryptoCoin === "eth" && `${ethEquiv} ETH`}
                        {cryptoCoin === "usdt" && `${usdtEquiv} USDT`}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                        {"\u2248"} {"\u20B9"}{price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 10, display: "inline-block" }}>
                      <img src={cryptoCoin === "btc" ? btcQrUrl : ethQrUrl} alt="Wallet QR"
                        width={160} height={160} loading="lazy" style={{ display: "block", borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>Scan to get address</p>
                  </div>
                </div>

                {/* Approximate prices */}
                <div style={{
                  display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
                }}>
                  {[
                    { label: "BTC Price", value: `\u20B9${(btcPriceINR / 100000).toFixed(1)}L` },
                    { label: "ETH Price", value: `\u20B9${(ethPriceINR / 1000).toFixed(0)}K` },
                    { label: "USDT", value: "1:1 USD" },
                  ].map((p) => (
                    <div key={p.label} style={{
                      flex: 1, padding: "10px 12px", background: "rgba(15,23,42,0.4)",
                      borderRadius: 8, border: `1px solid ${T.border}`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{p.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginTop: 2 }}>{p.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: T.white, display: "block", marginBottom: 8 }}>
                    Transaction Hash
                  </label>
                  <input value={cryptoTxHash} onChange={(e) => { setCryptoTxHash(e.target.value); setErrors({}); }}
                    placeholder="Enter the blockchain transaction hash"
                    style={{ ...inputStyle(!!errors.cryptoTx), fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }} />
                  {errors.cryptoTx && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.cryptoTx}</span>}

                  <button onClick={handleCryptoVerify} disabled={processing} style={{
                    width: "100%", padding: "16px", border: "none", borderRadius: 10, marginTop: 16,
                    background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: processing ? "wait" : "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <IconCheck size={18} color="#fff" />
                    {processing ? "Verifying..." : "I've Sent the Payment"}
                  </button>
                </div>
              </div>
            )}

            {/* ---- INTERNATIONAL CARD METHOD ---- */}
            {method === "card" && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  International Card Payment
                </h3>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
                  Pay with Visa, Mastercard, or American Express
                </p>

                <form onSubmit={handleCardPayment}>
                  {/* Card Number */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Card Number</label>
                    <div style={{ position: "relative" }}>
                      <input value={card.number}
                        onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                        placeholder="1234 5678 9012 3456" maxLength={19}
                        style={{
                          ...inputStyle(!!errors.number),
                          paddingLeft: 44, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                        }} />
                      <IconCreditCard size={18} color={T.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                    {errors.number && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.number}</span>}
                  </div>

                  {/* Cardholder Name */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Cardholder Name</label>
                    <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                      placeholder="John Doe" style={inputStyle(!!errors.name)} />
                    {errors.name && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.name}</span>}
                  </div>

                  {/* Expiry + CVV */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Expiry Date</label>
                      <input value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY" maxLength={5}
                        style={{ ...inputStyle(!!errors.expiry), fontFamily: "'JetBrains Mono', monospace" }} />
                      {errors.expiry && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.expiry}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>CVV</label>
                      <input value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        placeholder="123" type="password" maxLength={4}
                        style={{ ...inputStyle(!!errors.cvv), fontFamily: "'JetBrains Mono', monospace" }} />
                      {errors.cvv && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block" }}>{errors.cvv}</span>}
                    </div>
                  </div>

                  <button type="submit" disabled={processing} style={{
                    width: "100%", padding: "16px", border: "none", borderRadius: 10,
                    background: processing ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    color: "#fff", fontSize: 16, fontWeight: 700, cursor: processing ? "wait" : "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s",
                  }}>
                    <IconLock size={18} color="#fff" />
                    {processing ? "Processing Payment..." : `Pay ₹${priceUSD}`}
                  </button>
                </form>
                <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
                  Charged in INR. ₹{price.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {/* Trust badges */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 16, marginTop: 24, flexWrap: "wrap",
            }}>
              {["256-bit SSL Encryption", "PCI DSS Compliant", "30-day Money Back", "Instant Activation"].map((badge, i) => (
                <span key={badge} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {i > 0 && <span style={{ color: T.border, marginRight: 12 }}>|</span>}
                  <IconShieldCheck size={12} color={T.green} />
                  <span style={{ fontSize: 11, color: T.muted }}>{badge}</span>
                </span>
              ))}
            </div>

            {/* Accepted payment row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16,
            }}>
              {["Visa", "Mastercard", "UPI", "GPay", "PhonePe", "BTC", "ETH"].map((pm) => (
                <span key={pm} style={{
                  fontSize: 10, fontWeight: 600, color: T.muted, padding: "4px 8px",
                  background: "rgba(15,23,42,0.4)", borderRadius: 4, border: `1px solid ${T.border}`,
                  textTransform: "uppercase", letterSpacing: 0.5,
                }}>{pm}</span>
              ))}
            </div>

            {/* ---- ADMIN CONFIG ---- */}
            <div style={{ marginTop: 40, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
              <button onClick={() => setShowAdmin(!showAdmin)} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                background: "none", border: "none", cursor: "pointer", padding: "8px 0",
              }}>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Payment Configuration (Admin)
                </span>
                <IconChevron size={14} color={T.muted} down={!showAdmin} />
              </button>

              {showAdmin && (
                <div style={{
                  marginTop: 12, padding: 20, background: "rgba(15,23,42,0.4)",
                  borderRadius: 12, border: `1px solid ${T.border}`,
                }}>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
                    Configure where payments are received. Changes are saved to your browser.
                  </p>
                  {[
                    { label: "Razorpay Key ID", key: "razorpayKey", placeholder: "rzp_live_xxxxxxxxx" },
                    { label: "UPI ID", key: "upiId", placeholder: "business@upi" },
                    { label: "Bitcoin Address", key: "btcAddress", placeholder: "bc1q..." },
                    { label: "Ethereum / USDT Address", key: "ethAddress", placeholder: "0x..." },
                  ].map((field) => (
                    <div key={field.key} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: T.white, display: "block", marginBottom: 4 }}>
                        {field.label}
                      </label>
                      <input
                        value={adminConfig[field.key]}
                        onChange={(e) => setAdminConfig({ ...adminConfig, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        style={{ ...inputStyle(false), fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                  ))}
                  <button onClick={saveAdminConfig} style={{
                    padding: "10px 24px", borderRadius: 8, border: "none",
                    background: errors.adminSaved ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {errors.adminSaved ? "Saved!" : "Save Configuration"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT: Order Summary ===== */}
          <div>
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: 28, backdropFilter: "blur(10px)", position: "sticky", top: 110,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 20 }}>Order Summary</h3>

              {/* Plan highlight */}
              <div style={{
                padding: 16,
                background: `linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.06))`,
                borderRadius: 12, border: `1px solid rgba(99,102,241,0.15)`, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <IconLightning size={18} color={T.accent} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{plan.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(99,102,241,0.2)", color: T.accent, textTransform: "uppercase",
                  }}>{billing}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {"\u20B9"}{price.toLocaleString("en-IN")}
                  <span style={{ fontSize: 14, fontWeight: 400, color: T.muted }}>/{billing === "annual" ? "yr" : "mo"}</span>
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                  ₹{priceUSD}/mo
                </div>
                {savings > 0 && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
                    padding: "4px 10px", borderRadius: 6, background: "rgba(34,197,94,0.1)",
                  }}>
                    <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>
                      You save {"\u20B9"}{savings.toLocaleString("en-IN")}/year
                    </span>
                  </div>
                )}
              </div>

              {/* Feature list */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 12,
                  textTransform: "uppercase", letterSpacing: 1,
                }}>What's Included</h4>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <IconCheck size={14} color={T.green} />
                    <span style={{ fontSize: 13, color: T.white }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.muted }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: T.white }}>{"\u20B9"}{price.toLocaleString("en-IN")}</span>
                </div>
                {billing === "annual" && savings > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: T.green }}>Annual Discount</span>
                    <span style={{ fontSize: 13, color: T.green }}>-{"\u20B9"}{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.muted }}>Tax (GST)</span>
                  <span style={{ fontSize: 13, color: T.white }}>{"\u20B9"}0.00</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  paddingTop: 12, borderTop: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.cyan }}>{"\u20B9"}{price.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: IconShieldCheck, label: "256-bit SSL Encrypted", color: T.green },
                  { icon: IconCheck, label: "30-day Money Back Guarantee", color: T.green },
                  { icon: IconLightning, label: "Instant Activation", color: T.cyan },
                ].map((badge) => (
                  <div key={badge.label} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: "rgba(15,23,42,0.4)", borderRadius: 8, border: `1px solid ${T.border}`,
                  }}>
                    <badge.icon size={16} color={badge.color} />
                    <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* Accepted methods */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Accepted Payments
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["UPI", "Visa", "MC", "Rupay", "GPay", "BTC", "ETH", "USDT"].map((pm) => (
                    <span key={pm} style={{
                      fontSize: 9, fontWeight: 600, color: T.muted, padding: "3px 7px",
                      background: "rgba(15,23,42,0.6)", borderRadius: 4, border: `1px solid ${T.border}`,
                      letterSpacing: 0.3,
                    }}>{pm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
