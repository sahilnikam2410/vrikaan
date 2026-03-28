import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const styles = {
  page: {
    minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center",
    justifyContent: "center", position: "relative", overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(20,227,197,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,227,197,0.04) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none",
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
  title: { fontSize: 28, fontWeight: 700, color: "#14e3c5", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 32, textAlign: "center" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 16px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", marginBottom: 20, transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  remember: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8", cursor: "pointer" },
  checkbox: { accentColor: "#14e3c5" },
  forgot: { fontSize: 13, color: "#14e3c5", textDecoration: "none", fontWeight: 500 },
  btn: {
    width: "100%", padding: "14px", background: "linear-gradient(135deg, #14e3c5, #0ea5e9)",
    border: "none", borderRadius: 10, color: "#030712", fontSize: 15, fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.2s, transform 0.2s",
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5,
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "#64748b", fontSize: 13 },
  dividerLine: { flex: 1, height: 1, background: "rgba(148,163,184,0.15)" },
  socialBtn: {
    width: "100%", padding: "12px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.15)", borderRadius: 10, color: "#e2e8f0",
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 10, transition: "border-color 0.2s, background 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  footer: { textAlign: "center", marginTop: 28, fontSize: 14, color: "#94a3b8" },
  link: { color: "#14e3c5", textDecoration: "none", fontWeight: 600 },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#f87171", fontSize: 13,
  },
  showBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#14e3c5", fontSize: 12, cursor: "pointer", fontWeight: 600,
  },
  inputWrap: { position: "relative" },
  demoBox: {
    background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.8,
  },
  homeLink: {
    position: "absolute", top: 24, left: 24, zIndex: 10,
    padding: "8px 18px", border: "1px solid rgba(20,227,197,0.2)", borderRadius: 8,
    background: "rgba(15,23,42,0.6)", color: "#14e3c5", fontSize: 13, fontWeight: 600,
    textDecoration: "none", backdropFilter: "blur(10px)",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate("/learn");
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={styles.page}>
      <SEO title="Login" description="Login to your Secuvion account to access your cybersecurity dashboard." path="/login" />
      <Navbar />
      <div style={styles.gridBg} />
      <div style={styles.circuitLines}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>S</div>
          <div style={styles.title}>Welcome Back</div>
        </div>
        <p style={styles.subtitle}>Please login to your account</p>

        <div style={styles.demoBox}>
          <strong style={{ color: "#6366f1" }}>Demo Credentials:</strong><br />
          Admin: admin@secuvion.com / admin123<br />
          User: user@secuvion.com / user123
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="Enter your email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#14e3c5")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)")} />

          <label style={styles.label}>Password</label>
          <div style={styles.inputWrap}>
            <input
              style={{ ...styles.input, paddingRight: 60, marginBottom: 0 }}
              type={showPass ? "text" : "password"} placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#14e3c5")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)")} />
            <button type="button" style={styles.showBtn} onClick={() => setShowPass(!showPass)}>
              {showPass ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ ...styles.row, marginTop: 20 }}>
            <label style={styles.remember} onClick={() => setRemember(!remember)}>
              <input type="checkbox" checked={remember} readOnly style={styles.checkbox} /> Remember me
            </label>
            <Link to="/forgot-password" style={styles.forgot}>Forgot Password?</Link>
          </div>

          <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span>or</span>
          <div style={styles.dividerLine} />
        </div>

        <button style={styles.socialBtn}
          onMouseEnter={(e) => (e.target.style.borderColor = "#14e3c5")}
          onMouseLeave={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.15)")}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Login with Google
        </button>

        <button style={styles.socialBtn}
          onMouseEnter={(e) => (e.target.style.borderColor = "#14e3c5")}
          onMouseLeave={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.15)")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Login with GitHub
        </button>

        <div style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
