import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#060a14", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14b8a6", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

const SERVICES = [
  { name: "Google", icon: "G", color: "#4285f4", methods: ["Authenticator App", "Security Key", "Phone Prompt", "SMS"], link: "https://myaccount.google.com/signinoptions/two-step-verification", steps: ["Go to Google Account > Security", "Click '2-Step Verification' > Get Started", "Choose your second step (Authenticator app recommended)", "Follow the setup wizard", "Save backup codes in a safe place"] },
  { name: "GitHub", icon: "\u2B21", color: "#8b5cf6", methods: ["Authenticator App", "Security Key", "SMS"], link: "https://github.com/settings/security", steps: ["Go to Settings > Password and authentication", "Click 'Enable two-factor authentication'", "Scan QR code with authenticator app", "Enter verification code", "Download and save recovery codes"] },
  { name: "Instagram", icon: "\u25CB", color: "#e1306c", methods: ["Authenticator App", "SMS"], link: "https://www.instagram.com/accounts/two_factor_authentication/", steps: ["Go to Settings > Security > Two-Factor Authentication", "Tap 'Get Started'", "Choose Authentication App or Text Message", "Follow the setup instructions", "Save recovery codes"] },
  { name: "X (Twitter)", icon: "X", color: "#1DA1F2", methods: ["Authenticator App", "Security Key", "SMS (Blue only)"], link: "https://twitter.com/settings/account/login_verification", steps: ["Go to Settings > Security and Account Access > Security", "Tap 'Two-factor authentication'", "Choose Authentication app (recommended)", "Scan QR code", "Enter confirmation code"] },
  { name: "Facebook", icon: "f", color: "#1877f2", methods: ["Authenticator App", "Security Key", "SMS"], link: "https://www.facebook.com/settings?tab=security", steps: ["Go to Settings > Security and Login", "Find 'Two-Factor Authentication' > Edit", "Choose Security Method", "Follow setup wizard", "Save backup codes"] },
  { name: "LinkedIn", icon: "in", color: "#0077b5", methods: ["Authenticator App", "SMS"], link: "https://www.linkedin.com/psettings/two-step-verification", steps: ["Go to Settings > Sign in & Security", "Click 'Two-step verification' > Turn On", "Choose Phone number or Authenticator app", "Verify your identity", "Confirm setup"] },
  { name: "Discord", icon: "\u25C6", color: "#5865f2", methods: ["Authenticator App", "SMS"], link: "https://discord.com/channels/@me", steps: ["Open User Settings (gear icon)", "Go to 'My Account'", "Click 'Enable Two-Factor Auth'", "Scan QR with authenticator", "Enter 6-digit code to confirm", "Download backup codes"] },
  { name: "Amazon", icon: "a", color: "#ff9900", methods: ["Authenticator App", "SMS"], link: "https://www.amazon.in/a/settings/approval", steps: ["Go to Account > Login & Security", "Click 'Edit' next to Two-Step Verification", "Click 'Get Started'", "Choose Authenticator App", "Scan QR and enter code"] },
  { name: "Microsoft", icon: "M", color: "#00a4ef", methods: ["Authenticator App", "Security Key", "Email", "SMS"], link: "https://account.microsoft.com/security", steps: ["Go to account.microsoft.com > Security", "Click 'Advanced security options'", "Under 'Two-step verification', click Turn on", "Follow the setup wizard", "Choose your verification method"] },
  { name: "Apple", icon: "\uF8FF", color: "#555", methods: ["Trusted Device", "Phone Number", "Security Key"], link: "https://appleid.apple.com/account/manage", steps: ["Go to Settings > [Your Name] > Password & Security", "Tap 'Turn On Two-Factor Authentication'", "Enter your phone number", "Enter the verification code", "2FA is now active for your Apple ID"] },
];

export default function TwoFactorGuide() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = SERVICES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans',sans-serif" }}>
      <SEO title="2FA Setup Guide" description="Step-by-step guides to enable two-factor authentication on popular services." path="/2fa-guide" />
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 20px 60px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Vrikaan Sans',sans-serif" }}>2FA Setup Guide</h1>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Step-by-step guides to enable two-factor authentication on popular services.</p>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." style={{ width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 24 }} />

        {/* Service grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
          {filtered.map(s => (
            <button key={s.name} onClick={() => setSelected(selected?.name === s.name ? null : s)} style={{ padding: "16px", borderRadius: 12, border: selected?.name === s.name ? `2px solid ${s.color}` : `1px solid ${T.border}`, background: selected?.name === s.name ? `${s.color}10` : T.card, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.icon}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{s.name}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {s.methods.slice(0, 2).map(m => <span key={m} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(148,163,184,0.1)", color: T.muted }}>{m}</span>)}
                {s.methods.length > 2 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(148,163,184,0.1)", color: T.muted }}>+{s.methods.length - 2}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Selected service detail */}
        {selected && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: selected.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{selected.icon}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, margin: 0, fontFamily: "'Vrikaan Sans',sans-serif" }}>{selected.name}</h2>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Two-Factor Authentication Setup</p>
              </div>
            </div>

            {/* Methods */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Supported Methods</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selected.methods.map(m => (
                  <span key={m} style={{ padding: "6px 12px", borderRadius: 6, background: m.includes("Authenticator") ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.1)", border: `1px solid ${m.includes("Authenticator") ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)"}`, fontSize: 12, color: m.includes("Authenticator") ? T.green : T.accent }}>
                    {m} {m.includes("Authenticator") ? "(Recommended)" : ""}
                  </span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Setup Steps</h3>
              {selected.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: T.white, lineHeight: 1.6, paddingTop: 2 }}>{step}</span>
                </div>
              ))}
            </div>

            <a href={selected.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Open {selected.name} Security Settings &#x2197;
            </a>

            {/* Warning */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(251,191,36,0.06)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.15)" }}>
              <span style={{ fontSize: 12, color: T.yellow }}>&#x26A0; Always save your backup/recovery codes in a secure place. Without them, you may lose access if you lose your phone.</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
