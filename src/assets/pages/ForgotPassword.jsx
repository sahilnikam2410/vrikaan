import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const styles = {
  page: {
    minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center",
    justifyContent: "center", position: "relative", overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "80px 16px 40px",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(20,227,197,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,227,197,0.04) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none",
  },
  glow1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,227,197,0.08) 0%, transparent 70%)", top: "10%", left: "10%",
  },
  glow2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", bottom: "10%", right: "15%",
  },
  card: {
    position: "relative", width: "100%", maxWidth: 440, padding: "48px 40px",
    background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(20,227,197,0.15)", borderRadius: 16, zIndex: 2,
  },
  logo: { textAlign: "center", marginBottom: 8 },
  logoIcon: {
    width: 48, height: 48, margin: "0 auto 12px",
    background: "linear-gradient(135deg, #14e3c5, #6366f1)", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700, color: "#fff",
  },
  title: {
    fontSize: 28, fontWeight: 700, color: "#14e3c5", marginBottom: 4,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: {
    fontSize: 14, color: "#94a3b8", marginBottom: 32, textAlign: "center", lineHeight: 1.6,
  },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 16px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", marginBottom: 20, transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btn: {
    width: "100%", padding: "14px", background: "linear-gradient(135deg, #14e3c5, #0ea5e9)",
    border: "none", borderRadius: 10, color: "#030712", fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: 0.5, transition: "opacity 0.2s, transform 0.2s",
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#f87171", fontSize: 13,
  },
  success: {
    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#22c55e", fontSize: 13,
  },
  footer: { textAlign: "center", marginTop: 28, fontSize: 14, color: "#94a3b8" },
  link: { color: "#14e3c5", textDecoration: "none", fontWeight: 600 },
  successContainer: { textAlign: "center", padding: "20px 0" },
  emailIcon: {
    width: 72, height: 72, margin: "0 auto 24px", borderRadius: "50%",
    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontSize: 22, fontWeight: 700, color: "#22c55e", marginBottom: 12,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  successText: {
    fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8,
  },
  successEmail: {
    fontSize: 14, color: "#14e3c5", fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace", marginBottom: 24,
  },
  resendText: {
    fontSize: 13, color: "#64748b", marginTop: 16,
  },
  resendBtn: {
    background: "none", border: "none", color: "#14e3c5", fontSize: 13,
    fontWeight: 600, cursor: "pointer", textDecoration: "underline",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result && result.success === false) {
        setError(result.error || "Failed to send reset link. Please try again.");
        setLoading(false);
      } else {
        setSent(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result && result.success === false) {
        setError(result.error || "Failed to resend. Please try again.");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <SEO
        title="Forgot Password"
        description="Reset your Vrikaan account password."
        path="/forgot-password"
      />
      <Navbar />
      <div style={styles.gridBg} />
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>S</div>
          <div style={styles.title}>
            {sent ? "Check Your Email" : "Reset Password"}
          </div>
        </div>

        {sent ? (
          /* Success State */
          <div style={styles.successContainer}>
            <div style={styles.emailIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            </div>
            <div style={styles.successTitle}>Email Sent</div>
            <p style={styles.successText}>
              We have sent a password reset link to
            </p>
            <p style={styles.successEmail}>{email}</p>
            <p style={styles.successText}>
              Check your inbox and follow the instructions to reset your password.
              The link will expire in 30 minutes.
            </p>

            {error && <div style={{ ...styles.error, marginTop: 16 }}>{error}</div>}

            <Link to="/login" style={{ textDecoration: "none" }}>
              <button
                type="button"
                style={styles.btn}
              >
                Back to Login
              </button>
            </Link>

            <p style={styles.resendText}>
              Didn't receive the email?{" "}
              <button
                type="button"
                style={styles.resendBtn}
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        ) : (
          /* Form State */
          <>
            <p style={styles.subtitle}>
              Enter the email address associated with your account and we will
              send you a link to reset your password.
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#14e3c5")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)")}
                autoComplete="email"
                autoFocus
              />

              <button
                type="submit"
                style={{
                  ...styles.btn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div style={styles.footer}>
              <Link to="/login" style={styles.link}>
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
