import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", top: "5%", right: "10%",
  },
  glow2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,227,197,0.08) 0%, transparent 70%)", bottom: "10%", left: "10%",
  },
  card: {
    position: "relative", width: "100%", maxWidth: 480, padding: "40px 40px",
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
    cursor: "pointer", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: 0.5, transition: "opacity 0.2s, transform 0.2s",
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "10px 14px", marginBottom: 18, color: "#f87171", fontSize: 13,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
    color: "#64748b", fontSize: 13,
  },
  dividerLine: { flex: 1, height: 1, background: "rgba(148,163,184,0.15)" },
  socialBtn: {
    width: "100%", padding: "12px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.15)", borderRadius: 10, color: "#e2e8f0",
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 10, marginBottom: 10,
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#94a3b8" },
  link: { color: "#14e3c5", textDecoration: "none", fontWeight: 600 },
  strengthBar: {
    height: 4, borderRadius: 2, transition: "all 0.3s", marginTop: -12, marginBottom: 6,
  },
  strengthLabel: { fontSize: 11, marginBottom: 14, display: "block", textAlign: "right" },
  checkboxRow: {
    display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, marginTop: 4,
  },
  checkbox: {
    accentColor: "#14e3c5", marginTop: 2, cursor: "pointer", flexShrink: 0,
  },
  checkboxLabel: { fontSize: 13, color: "#94a3b8", lineHeight: 1.5 },
  phoneRow: { display: "flex", gap: 8 },
  countryCode: {
    width: 90, padding: "12px 10px", background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#f1f5f9",
    fontSize: 14, outline: "none", marginBottom: 18, boxSizing: "border-box",
    fontFamily: "'JetBrains Mono', monospace",
  },
  inputWrap: { position: "relative" },
  showBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#14e3c5", fontSize: 12,
    cursor: "pointer", fontWeight: 600,
  },
};

function getStrength(pw) {
  if (!pw) return 0;
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
  const { user, signup, loginWithGoogle, loginWithGithub, loginWithFacebook } = useAuth();

  // Redirect if already logged in (handles social signup race condition)
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    password: "",
    confirm: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(form.password);

  // Inject keyframe animations once
  useEffect(() => {
    const id = "signup-animations";
    if (!document.getElementById(id)) {
      const sheet = document.createElement("style");
      sheet.id = id;
      sheet.textContent = `
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes borderRotate {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
        @keyframes gradientSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(sheet);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  const floatingIcons = [
    { icon: "\u{1F6E1}\uFE0F", top: "12%", left: "6%", size: 28, delay: "0s", duration: "5s" },
    { icon: "\u{1F512}", top: "70%", right: "7%", size: 24, delay: "1.2s", duration: "6s" },
    { icon: "\u{1F511}", bottom: "18%", left: "12%", size: 22, delay: "2.4s", duration: "4.5s" },
    { icon: "\u{1F510}", top: "25%", right: "14%", size: 20, delay: "0.8s", duration: "5.5s" },
  ];

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const focusStyle = (e) => (e.target.style.borderColor = "#14e3c5");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const phone = form.phone.trim()
        ? `${form.countryCode}${form.phone.trim()}`
        : "";
      const result = await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone,
      });
      if (result && result.success === false) {
        setError(result.error || "Signup failed. Please try again.");
        setLoading(false);
      } else {
        navigate("/welcome");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setError("");
    setLoading(true);
    try {
      if (provider === "google") await loginWithGoogle();
      else if (provider === "github") await loginWithGithub();
      else if (provider === "facebook") await loginWithFacebook();
      navigate("/welcome");
    } catch (err) {
      setError(err.message || `Failed to sign up with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <SEO
        title="Sign Up"
        description="Create your free Secuvion account and start protecting your digital life."
        path="/signup"
      />
      <Navbar />
      <div style={styles.gridBg} />
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      {/* Floating security icons */}
      {floatingIcons.map((fi, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: fi.top, left: fi.left, right: fi.right, bottom: fi.bottom,
            fontSize: fi.size, opacity: 0.12, zIndex: 1, pointerEvents: "none",
            animation: `floatIcon ${fi.duration} ease-in-out ${fi.delay} infinite`,
          }}
        >
          {fi.icon}
        </div>
      ))}

      {/* Animated gradient border wrapper */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 484, padding: 2,
        borderRadius: 18, zIndex: 2, overflow: "hidden",
      }}>
        {/* Spinning gradient border */}
        <div style={{
          position: "absolute", inset: -40, zIndex: 0,
          background: "conic-gradient(from 0deg, #14e3c5, #6366f1, #0ea5e9, #14e3c5)",
          animation: "gradientSpin 4s linear infinite",
          opacity: 0.5,
        }} />

      <div style={{ ...styles.card, borderRadius: 16, position: "relative", zIndex: 1 }}>
        {/* Social proof badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 16, padding: "8px 16px", borderRadius: 20,
          background: "rgba(20,227,197,0.06)", border: "1px solid rgba(20,227,197,0.15)",
          width: "fit-content", margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: 16 }}>{"\u{1F6E1}\uFE0F"}</span>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
            Join <span style={{ color: "#14e3c5", fontWeight: 700 }}>1.2M+</span> users protecting their digital life
          </span>
        </div>

        <div style={styles.logo}>
          <div style={styles.logoIcon}>S</div>
          <div style={styles.title}>Create Account</div>
        </div>
        <p style={styles.subtitle}>Join SECUVION to protect your digital life</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} noValidate>
          {/* First Name / Last Name */}
          <div style={styles.row2}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>First Name *</label>
              <input
                style={styles.input}
                placeholder="John"
                value={form.firstName}
                onChange={set("firstName")}
                onFocus={focusStyle}
                onBlur={blurStyle}
                autoComplete="given-name"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                placeholder="Doe"
                value={form.lastName}
                onChange={set("lastName")}
                onFocus={focusStyle}
                onBlur={blurStyle}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email */}
          <label style={styles.label}>Email *</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            onFocus={focusStyle}
            onBlur={blurStyle}
            autoComplete="email"
          />

          {/* Phone Number */}
          <label style={styles.label}>Phone Number</label>
          <div style={styles.phoneRow}>
            <select
              style={styles.countryCode}
              value={form.countryCode}
              onChange={set("countryCode")}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+61">+61</option>
              <option value="+49">+49</option>
              <option value="+33">+33</option>
              <option value="+81">+81</option>
              <option value="+86">+86</option>
              <option value="+55">+55</option>
              <option value="+82">+82</option>
              <option value="+7">+7</option>
              <option value="+971">+971</option>
              <option value="+65">+65</option>
              <option value="+34">+34</option>
              <option value="+39">+39</option>
              <option value="+52">+52</option>
              <option value="+31">+31</option>
              <option value="+46">+46</option>
              <option value="+41">+41</option>
              <option value="+47">+47</option>
            </select>
            <input
              style={{ ...styles.input, flex: 1 }}
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={set("phone")}
              onFocus={focusStyle}
              onBlur={blurStyle}
              autoComplete="tel-national"
            />
          </div>

          {/* Password */}
          <label style={styles.label}>Password *</label>
          <div style={styles.inputWrap}>
            <input
              style={{ ...styles.input, paddingRight: 60 }}
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              onFocus={focusStyle}
              onBlur={blurStyle}
              autoComplete="new-password"
            />
            <button
              type="button"
              style={{ ...styles.showBtn, top: "40%" }}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Strength Meter */}
          {form.password && (
            <>
              <div
                style={{
                  ...styles.strengthBar,
                  width: `${strength * 25}%`,
                  background: strengthColors[strength - 1] || "#333",
                }}
              />
              <span
                style={{
                  ...styles.strengthLabel,
                  color: strengthColors[strength - 1] || "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {strengthLabels[strength - 1] || "Too short"}
              </span>
            </>
          )}

          {/* Confirm Password */}
          <label style={styles.label}>Confirm Password *</label>
          <div style={styles.inputWrap}>
            <input
              style={{ ...styles.input, paddingRight: 60 }}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={set("confirm")}
              onFocus={focusStyle}
              onBlur={blurStyle}
              autoComplete="new-password"
            />
            <button
              type="button"
              style={{ ...styles.showBtn, top: "40%" }}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {/* Terms Checkbox */}
          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={styles.checkbox}
              id="terms-checkbox"
            />
            <label htmlFor="terms-checkbox" style={styles.checkboxLabel}>
              I agree to the{" "}
              <Link to="/terms" style={{ color: "#14e3c5", textDecoration: "none" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" style={{ color: "#14e3c5", textDecoration: "none" }}>
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Social Signup Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span>or sign up with</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Google */}
        <button
          style={styles.socialBtn}
          onClick={() => handleSocialSignup("google")}
          disabled={loading}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#14e3c5")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </button>

        {/* GitHub */}
        <button
          style={styles.socialBtn}
          onClick={() => handleSocialSignup("github")}
          disabled={loading}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#14e3c5")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign up with GitHub
        </button>

        {/* Facebook */}
        <button
          style={styles.socialBtn}
          onClick={() => handleSocialSignup("facebook")}
          disabled={loading}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#14e3c5")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Sign up with Facebook
        </button>

        {/* Footer */}
        <div style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Login</Link>
        </div>
      </div>
      </div>{/* end gradient border wrapper */}
    </div>
  );
}
