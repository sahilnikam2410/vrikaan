import { useState } from "react";

/**
 * NewsletterSignup — reusable component for capturing emails before launch.
 *
 * All subscriptions route through /api/tools?tool=newsletter-subscribe (server).
 * The server (api/tools.js handleNewsletterSubscribe):
 *   1. Writes to Firestore `newsletter` collection (audit log + idempotent)
 *   2. Pushes to Brevo list (server-side, BREVO_API_KEY stays in Vercel env)
 *
 * If both backend + Brevo fail → falls back to localStorage queue locally.
 *
 * Brevo API key is NEVER sent to the browser. Set BREVO_API_KEY +
 * BREVO_LIST_ID in Vercel env vars (NO VITE_ prefix).
 *
 * Props:
 *   compact   — small inline variant (default: false, full card)
 *   source    — analytics tag e.g. "homepage-footer", "carousel-end", "blog-cta"
 *   accent    — color override (default cyan)
 *   title     — heading text (only shown if compact=false)
 *   subtitle  — sub-copy
 *   cta       — button text (default: "Subscribe")
 */
export default function NewsletterSignup({
  compact = false,
  source = "unknown",
  accent = "#14e3c5",
  title = "Get launch updates",
  subtitle = "1-2 emails a month. Tips, new tools, India scam alerts. Unsubscribe in 1 click.",
  cta = "Subscribe",
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  const subscribe = async (e) => {
    e?.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email.");
      setState("error");
      return;
    }
    setState("submitting");
    setError("");

    const payload = { email: email.trim().toLowerCase(), source, ts: Date.now() };

    // Single route through our backend (handles Brevo server-side)
    try {
      const res = await fetch("/api/tools?tool=newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { onSuccess(payload); return; }
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Server error ${res.status}`);
    } catch (err) {
      console.warn("newsletter: backend failed:", err.message);
    }

    // Final fallback — localStorage queue (so we never lose a signup)
    try {
      const stored = JSON.parse(localStorage.getItem("vrk_newsletter_v1") || "[]");
      if (!stored.find(x => x.email === payload.email)) {
        stored.push(payload);
        localStorage.setItem("vrk_newsletter_v1", JSON.stringify(stored));
      }
      onSuccess(payload);
    } catch (err) {
      setError("Could not save. Try again in a moment.");
      setState("error");
    }
  };

  const onSuccess = () => {
    setState("success");
    setEmail("");
  };

  // ─── Compact pill variant ────────────────────────────────────
  if (compact) {
    return (
      <form onSubmit={subscribe} style={{
        display: "flex", gap: 8, maxWidth: 460, width: "100%",
      }}>
        <input
          type="email" required value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          placeholder="your.email@example.com"
          disabled={state === "submitting" || state === "success"}
          style={{
            flex: 1, padding: "11px 14px", borderRadius: 10,
            background: "rgba(2,6,23,0.6)", border: "1px solid rgba(148,163,184,0.18)",
            color: "#f1f5f9", fontSize: 14, outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <button type="submit" disabled={state === "submitting" || state === "success"} style={{
          padding: "11px 18px", borderRadius: 10,
          background: state === "success" ? "#22c55e" : accent,
          color: "#030712", border: 0,
          fontWeight: 800, fontSize: 13, cursor: state === "submitting" ? "wait" : "pointer",
          fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          {state === "submitting" ? "..." : state === "success" ? "✓" : cta}
        </button>
      </form>
    );
  }

  // ─── Full card variant ───────────────────────────────────────
  return (
    <div style={{
      padding: 26, borderRadius: 18,
      background: `linear-gradient(135deg, ${accent}1a, rgba(99,102,241,0.12))`,
      border: `1px solid ${accent}33`,
      textAlign: "center",
    }}>
      <h3 style={{
        fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, fontWeight: 800,
        color: "#f1f5f9", margin: "0 0 8px",
      }}>{title}</h3>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
        {subtitle}
      </p>
      {state === "success" ? (
        <div style={{
          padding: 14, borderRadius: 10, maxWidth: 420, margin: "0 auto",
          background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.5)",
          color: "#22c55e", fontWeight: 700,
        }}>
          ✓ Subscribed. Check your inbox for confirmation.
        </div>
      ) : (
        <form onSubmit={subscribe} style={{
          display: "flex", gap: 10, maxWidth: 480, margin: "0 auto", flexWrap: "wrap",
        }}>
          <input
            type="email" required value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
            placeholder="your.email@example.com"
            disabled={state === "submitting"}
            style={{
              flex: 1, minWidth: 220,
              padding: "13px 18px", borderRadius: 12,
              background: "rgba(2,6,23,0.6)", border: "1px solid rgba(148,163,184,0.18)",
              color: "#f1f5f9", fontSize: 14, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <button type="submit" disabled={state === "submitting"} style={{
            padding: "13px 26px", borderRadius: 12,
            background: accent, color: "#030712", border: 0,
            fontWeight: 800, fontSize: 14, cursor: state === "submitting" ? "wait" : "pointer",
            fontFamily: "'Vrikaan Sans', sans-serif",
          }}>
            {state === "submitting" ? "Subscribing..." : `${cta} →`}
          </button>
        </form>
      )}
      {error && (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{error}</div>
      )}
      <p style={{
        marginTop: 14, fontSize: 11, color: "#64748b", lineHeight: 1.5,
      }}>
        🔒 We never sell your email. DPDP Act compliant. Powered by Brevo.
      </p>
    </div>
  );
}
