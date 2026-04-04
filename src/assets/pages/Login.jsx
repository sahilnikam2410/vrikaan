import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../firebase/config";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "India (+91)" },
  { code: "+1", country: "US", label: "United States (+1)" },
  { code: "+44", country: "GB", label: "United Kingdom (+44)" },
  { code: "+61", country: "AU", label: "Australia (+61)" },
  { code: "+81", country: "JP", label: "Japan (+81)" },
  { code: "+49", country: "DE", label: "Germany (+49)" },
  { code: "+33", country: "FR", label: "France (+33)" },
  { code: "+971", country: "AE", label: "UAE (+971)" },
  { code: "+65", country: "SG", label: "Singapore (+65)" },
  { code: "+86", country: "CN", label: "China (+86)" },
  { code: "+55", country: "BR", label: "Brazil (+55)" },
  { code: "+7", country: "RU", label: "Russia (+7)" },
  { code: "+82", country: "KR", label: "South Korea (+82)" },
  { code: "+39", country: "IT", label: "Italy (+39)" },
  { code: "+34", country: "ES", label: "Spain (+34)" },
];

/* ─────────────── SVG Icons ─────────────── */

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const PhoneTabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "loginSpin 0.8s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ─────────────── Styles ─────────────── */

const S = {
  page: {
    minHeight: "100vh",
    background: "#030712",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: "80px 16px 40px",
  },
  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(20,227,197,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,227,197,0.04) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  circuitLines: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" },
  glow1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,227,197,0.08) 0%, transparent 70%)", top: "10%", left: "10%",
  },
  glow2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", bottom: "10%", right: "15%",
  },
  glow3: {
    position: "absolute", width: 250, height: 250, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)", top: "50%", right: "5%",
  },
  card: {
    position: "relative", width: "100%", maxWidth: 460, padding: "40px 36px",
    background: "rgba(15,23,42,0.85)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(20,227,197,0.15)", borderRadius: 16, zIndex: 2,
  },
  logoIcon: {
    width: 48, height: 48, margin: "0 auto 12px",
    background: "linear-gradient(135deg, #14e3c5, #6366f1)", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
  },
  title: {
    fontSize: 28, fontWeight: 700, color: "#14e3c5", marginBottom: 4,
    fontFamily: "'Space Grotesk', sans-serif", textAlign: "center",
  },
  subtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 28, textAlign: "center" },

  /* Tabs */
  tabBar: {
    display: "flex", background: "rgba(15,23,42,0.6)", borderRadius: 10,
    padding: 4, marginBottom: 24, border: "1px solid rgba(148,163,184,0.1)",
  },
  tabActive: {
    flex: 1, padding: "10px 0", textAlign: "center", fontSize: 14, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", color: "#030712",
    background: "linear-gradient(135deg, #14e3c5, #0ea5e9)", border: "none", borderRadius: 8,
    cursor: "pointer", transition: "all 0.25s ease", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  tabInactive: {
    flex: 1, padding: "10px 0", textAlign: "center", fontSize: 14, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", color: "#94a3b8",
    background: "transparent", border: "none", borderRadius: 8,
    cursor: "pointer", transition: "all 0.25s ease", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
  },

  /* Form */
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 16px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", marginBottom: 16, transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  inputWrap: { position: "relative", marginBottom: 16 },
  showBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#14e3c5", fontSize: 12,
    cursor: "pointer", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  remember: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8", cursor: "pointer" },
  checkbox: { accentColor: "#14e3c5", width: 16, height: 16 },
  forgot: { fontSize: 13, color: "#14e3c5", textDecoration: "none", fontWeight: 500 },

  /* Primary button */
  btn: {
    width: "100%", padding: "14px", background: "linear-gradient(135deg, #14e3c5, #0ea5e9)",
    border: "none", borderRadius: 10, color: "#030712", fontSize: 15, fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  btnGreen: {
    width: "100%", padding: "14px", background: "linear-gradient(135deg, #22c55e, #14b8a6)",
    border: "none", borderRadius: 10, color: "#030712", fontSize: 15, fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },

  /* Divider */
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "#64748b", fontSize: 13 },
  dividerLine: { flex: 1, height: 1, background: "rgba(148,163,184,0.15)" },

  /* Social buttons */
  socialGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  socialGoogle: {
    padding: "11px 16px", background: "#ffffff", border: "none", borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#333333",
  },
  socialGithub: {
    padding: "11px 16px", background: "#333333", border: "none", borderRadius: 10,
    color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    transition: "opacity 0.2s, transform 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  socialFacebook: {
    width: "100%", padding: "11px 16px", background: "#1877F2", border: "none", borderRadius: 10,
    color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    transition: "opacity 0.2s, transform 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginBottom: 10,
  },

  /* Phone auth */
  phoneRow: { display: "flex", gap: 8, marginBottom: 16 },
  countrySelect: {
    width: 120, padding: "12px 8px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono', monospace",
    cursor: "pointer", flexShrink: 0, transition: "border-color 0.2s, box-shadow 0.2s",
  },
  otpContainer: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 },
  otpInput: {
    width: 48, height: 56, textAlign: "center", fontSize: 22,
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
    background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 10, color: "#14e3c5", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  changePhoneBtn: {
    width: "100%", marginTop: 12, padding: "10px", background: "transparent",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#94a3b8",
    fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.2s, color 0.2s",
  },

  /* Messages */
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171",
    fontSize: 13, display: "flex", alignItems: "center", gap: 8,
  },
  success: {
    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#22c55e",
    fontSize: 13, display: "flex", alignItems: "center", gap: 8,
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#94a3b8" },
  link: { color: "#14e3c5", textDecoration: "none", fontWeight: 600 },
};

/* ─── Inject keyframes once ─── */
const STYLE_ID = "login-page-keyframes";
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes loginSpin { to { transform: rotate(360deg); } }
    @keyframes loginFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes loginFloat1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(8deg); } }
    @keyframes loginFloat2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(-6deg); } }
    @keyframes loginFloat3 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-22px) rotate(10deg); } }
    @keyframes loginFloat4 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-8deg); } }
    @keyframes loginBorderGlow {
      0% { border-color: rgba(20,227,197,0.3); box-shadow: 0 0 20px rgba(20,227,197,0.08), 0 0 40px rgba(20,227,197,0.04); }
      33% { border-color: rgba(99,102,241,0.35); box-shadow: 0 0 20px rgba(99,102,241,0.08), 0 0 40px rgba(99,102,241,0.04); }
      66% { border-color: rgba(14,165,233,0.3); box-shadow: 0 0 20px rgba(14,165,233,0.08), 0 0 40px rgba(14,165,233,0.04); }
      100% { border-color: rgba(20,227,197,0.3); box-shadow: 0 0 20px rgba(20,227,197,0.08), 0 0 40px rgba(20,227,197,0.04); }
    }
  `;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════
   Login Component
   ═══════════════════════════════════════════ */

export default function Login() {
  const navigate = useNavigate();
  const {
    user,
    login,
    loginWithGoogle,
    loginWithGithub,
    loginWithFacebook,
    loginWithPhone,
    verifyPhoneCode,
  } = useAuth();

  // Redirect if already logged in (handles social login race condition)
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  /* ── State ── */
  const [activeTab, setActiveTab] = useState("email");

  // Email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  // Phone
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpRefs = useRef([]);
  const recaptchaRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // Shared
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  useEffect(() => {
    injectKeyframes();
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const clearMessages = () => { setError(""); setSuccessMsg(""); };

  const onFocus = (e) => {
    e.target.style.borderColor = "#14e3c5";
    e.target.style.boxShadow = "0 0 0 3px rgba(20,227,197,0.1)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "rgba(148,163,184,0.2)";
    e.target.style.boxShadow = "none";
  };
  const hoverIn = (e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; };
  const hoverOut = (e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; };

  /* ── Email Login ── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/home", { replace: true });
      } else {
        setError(result.error || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  /* ── Social Login ── */
  const handleSocial = async (provider, fn) => {
    clearMessages();
    setSocialLoading(provider);
    try {
      const result = await fn();
      if (result && result.success === false) {
        setError(result.error || "Authentication failed.");
      }
      // Navigation handled by useEffect watching user state
    } catch (err) {
      const msg =
        err.code === "auth/popup-closed-by-user"
          ? "Sign-in popup was closed."
          : err.code === "auth/account-exists-with-different-credential"
          ? "An account already exists with this email using a different sign-in method."
          : err.message || "Authentication failed.";
      setError(msg);
    } finally {
      setSocialLoading("");
    }
  };

  /* ── Phone: Send OTP ── */
  const handleSendOTP = async () => {
    clearMessages();
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 6) { setError("Please enter a valid phone number."); return; }

    setLoading(true);
    try {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
      }

      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setError("reCAPTCHA expired. Please try again."),
      });

      const fullPhone = `${countryCode}${digits}`;
      const result = await loginWithPhone(fullPhone, recaptchaVerifierRef.current);

      if (result.success === false) {
        setError(result.error || "Failed to send OTP.");
      } else {
        // result may have { success: true, confirmationResult } or just be the confirmationResult
        const cr = result.confirmationResult || result;
        setConfirmationResult(cr);
        setOtpSent(true);
        setSuccessMsg("OTP sent successfully! Check your phone.");
        setOtpValues(["", "", "", "", "", ""]);
        setTimeout(() => { if (otpRefs.current[0]) otpRefs.current[0].focus(); }, 100);
      }
    } catch (err) {
      const msg =
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : err.code === "auth/invalid-phone-number"
          ? "Invalid phone number format."
          : err.message || "Failed to send OTP.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Phone: Verify OTP ── */
  const handleVerifyOTP = async () => {
    clearMessages();
    const code = otpValues.join("");
    if (code.length !== 6) { setError("Please enter the complete 6-digit code."); return; }

    setLoading(true);
    try {
      const result = await verifyPhoneCode(confirmationResult, code);
      if (result && result.success === false) {
        setError(result.error || "Verification failed.");
        setLoading(false);
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      const msg =
        err.code === "auth/invalid-verification-code"
          ? "Invalid OTP. Please check and try again."
          : err.message || "Verification failed.";
      setError(msg);
      setLoading(false);
    }
  };

  /* ── OTP Input Handling ── */
  const handleOtpChange = (index, value) => {
    // Handle paste of multiple digits
    if (value.length > 1) {
      const chars = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...otpValues];
      chars.forEach((ch, i) => { if (index + i < 6) next[index + i] = ch; });
      setOtpValues(next);
      const focusIdx = Math.min(index + chars.length, 5);
      if (otpRefs.current[focusIdx]) otpRefs.current[focusIdx].focus();
      return;
    }
    if (value && !/^\d$/.test(value)) return;

    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const next = [...otpValues];
      next[index - 1] = "";
      setOtpValues(next);
      if (otpRefs.current[index - 1]) otpRefs.current[index - 1].focus();
    }
    if (e.key === "Enter" && otpValues.join("").length === 6) {
      handleVerifyOTP();
    }
  };

  const disabledStyle = loading ? { opacity: 0.6, cursor: "not-allowed" } : {};

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div style={S.page}>
      <SEO
        title="Login"
        description="Login to your Secuvion account to access your cybersecurity dashboard."
        path="/login"
      />
      <Navbar />

      {/* Background */}
      <div style={S.gridBg} />
      <div style={S.circuitLines}>
        <div style={S.glow1} />
        <div style={S.glow2} />
        <div style={S.glow3} />
      </div>

      {/* Floating security icons */}
      {[
        { icon: "\u{1F6E1}\uFE0F", top: "12%", left: "8%", size: 28, anim: "loginFloat1 6s ease-in-out infinite", delay: "0s" },
        { icon: "\u{1F512}", top: "22%", right: "10%", size: 24, anim: "loginFloat2 7s ease-in-out infinite", delay: "1s" },
        { icon: "\u{1F511}", bottom: "18%", left: "12%", size: 22, anim: "loginFloat3 8s ease-in-out infinite", delay: "2s" },
        { icon: "\u{1F50F}", bottom: "28%", right: "8%", size: 26, anim: "loginFloat4 6.5s ease-in-out infinite", delay: "0.5s" },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: item.top, left: item.left, right: item.right, bottom: item.bottom,
            fontSize: item.size, opacity: 0.12, pointerEvents: "none", zIndex: 1,
            animation: item.anim, animationDelay: item.delay,
          }}
        >
          {item.icon}
        </div>
      ))}

      {/* Invisible reCAPTCHA */}
      <div ref={recaptchaRef} id="recaptcha-container" />

      {/* ── Card ── */}
      <div style={{ ...S.card, animation: "loginFadeIn 0.4s ease-out, loginBorderGlow 6s ease-in-out infinite" }}>

        {/* Social proof badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 18,
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20,
            background: "rgba(20,227,197,0.08)", border: "1px solid rgba(20,227,197,0.2)",
            fontSize: 12, fontWeight: 600, color: "#14e3c5",
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.3,
          }}>
            <span style={{ fontSize: 14 }}>{"\u2713"}</span>
            Trusted by 1.2M+ users worldwide
          </span>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={S.logoIcon}>S</div>
          <div style={S.title}>Welcome Back</div>
        </div>
        <p style={S.subtitle}>Sign in to access your cybersecurity dashboard</p>

        {/* Messages */}
        {error && <div style={S.error}><ErrorIcon />{error}</div>}
        {successMsg && <div style={S.success}><SuccessIcon />{successMsg}</div>}

        {/* ═══════ EMAIL FORM ═══════ */}
        {(
          <form onSubmit={handleEmailLogin} autoComplete="on">
            <label style={S.label}>Email Address</label>
            <input
              style={S.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              autoComplete="email"
            />

            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <input
                style={{ ...S.input, paddingRight: 60, marginBottom: 0 }}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                autoComplete="current-password"
              />
              <button type="button" style={S.showBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? "HIDE" : "SHOW"}
              </button>
            </div>

            <div style={S.row}>
              <label style={S.remember} onClick={() => setRemember(!remember)}>
                <input type="checkbox" checked={remember} readOnly style={S.checkbox} />
                Remember me
              </label>
              <Link to="/forgot-password" style={S.forgot}>Forgot Password?</Link>
            </div>

            <button
              type="submit"
              style={{ ...S.btn, ...disabledStyle }}
              disabled={loading}
              onMouseEnter={!loading ? hoverIn : undefined}
              onMouseLeave={!loading ? hoverOut : undefined}
            >
              {loading ? <><SpinnerIcon /> Signing in...</> : "Sign In"}
            </button>
          </form>
        )}

        {/* ═══════ SOCIAL DIVIDER ═══════ */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span>or continue with</span>
          <div style={S.dividerLine} />
        </div>

        {/* ═══════ SOCIAL BUTTONS ═══════ */}
        <div style={S.socialGrid}>
          <button
            type="button"
            style={S.socialGoogle}
            onClick={() => handleSocial("google", loginWithGoogle)}
            disabled={!!socialLoading}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {socialLoading === "google" ? <SpinnerIcon /> : <GoogleIcon />}
            Google
          </button>

          <button
            type="button"
            style={S.socialGithub}
            onClick={() => handleSocial("github", loginWithGithub)}
            disabled={!!socialLoading}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            {socialLoading === "github" ? <SpinnerIcon /> : <GitHubIcon />}
            GitHub
          </button>
        </div>

        <button
          type="button"
          style={S.socialFacebook}
          onClick={() => handleSocial("facebook", loginWithFacebook)}
          disabled={!!socialLoading}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          {socialLoading === "facebook" ? <SpinnerIcon /> : <FacebookIcon />}
          Continue with Facebook
        </button>

        {/* ═══════ FOOTER ═══════ */}
        <div style={S.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={S.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
