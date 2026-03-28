import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

const s = {
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
  glow1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", top: "5%", right: "10%",
  },
  glow2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,227,197,0.08) 0%, transparent 70%)", bottom: "10%", left: "10%",
  },
  card: {
    position: "relative", width: "100%", maxWidth: 440, padding: "40px 40px",
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
  subtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 28, textAlign: "center" },
  row2: { display: "flex", gap: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 16px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", marginBottom: 18, transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btn: {
    width: "100%", padding: "14px", background: "linear-gradient(135deg, #14e3c5, #0ea5e9)",
    border: "none", borderRadius: 10, color: "#030712", fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5,
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 18, color: "#f87171", fontSize: 13,
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#94a3b8" },
  link: { color: "#14e3c5", textDecoration: "none", fontWeight: 600 },
  terms: { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 16, lineHeight: 1.5 },
  strength: { height: 4, borderRadius: 2, marginBottom: 18, marginTop: -12, transition: "all 0.3s" },
  homeLink: {
    position: "absolute", top: 24, left: 24, zIndex: 10,
    padding: "8px 18px", border: "1px solid rgba(20,227,197,0.2)", borderRadius: 8,
    background: "rgba(15,23,42,0.6)", color: "#14e3c5", fontSize: 13, fontWeight: 600,
    textDecoration: "none", backdropFilter: "blur(10px)",
  },
};

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e"];
const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const focusStyle = (e) => (e.target.style.borderColor = "#14e3c5");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)");

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = signup(form);
      if (result.success) {
        navigate("/learn");
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={s.page}>
      <SEO title="Sign Up" description="Create your free Secuvion account and start protecting your digital life." path="/signup" />
      <Navbar />
      <div style={s.gridBg} />
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>S</div>
          <div style={s.title}>Create Account</div>
        </div>
        <p style={s.subtitle}>Join SECUVION to protect your digital life</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSignup}>
          <div style={s.row2}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>First Name *</label>
              <input style={s.input} placeholder="John" value={form.firstName} onChange={set("firstName")} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Last Name</label>
              <input style={s.input} placeholder="Doe" value={form.lastName} onChange={set("lastName")} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <label style={s.label}>Email *</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onFocus={focusStyle} onBlur={blurStyle} />

          <label style={s.label}>Password *</label>
          <input style={s.input} type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} onFocus={focusStyle} onBlur={blurStyle} />
          {form.password && (
            <div style={{ ...s.strength, width: `${strength * 25}%`, background: strengthColors[strength - 1] || "#333" }}>
              <span style={{ fontSize: 11, color: strengthColors[strength - 1], float: "right", marginTop: -16 }}>
                {strengthLabels[strength - 1] || ""}
              </span>
            </div>
          )}

          <label style={s.label}>Confirm Password *</label>
          <input style={s.input} type="password" placeholder="Re-enter password" value={form.confirm} onChange={set("confirm")} onFocus={focusStyle} onBlur={blurStyle} />

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={s.terms}>
          By signing up, you agree to our <Link to="/terms" style={{ color: "#14e3c5", textDecoration: "none" }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "#14e3c5", textDecoration: "none" }}>Privacy Policy</Link>.
        </div>

        <div style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>Login</Link>
        </div>
      </div>
    </div>
  );
}
