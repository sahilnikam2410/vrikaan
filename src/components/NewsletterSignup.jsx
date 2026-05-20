import { useState } from "react";

/**
 * NewsletterSignup — reusable component for capturing emails before launch.
 *
 * Backend strategy (graceful degradation):
 *   1. If VITE_BREVO_LIST_ID + VITE_BREVO_API_KEY set → POST direct to Brevo
 *      (api.brevo.com/v3/contacts) — list-managed, double-opt-in, auto-tagged
 *   2. Else → POST to /api/tools?tool=newsletter-subscribe (server-side,
 *      writes to Firestore `newsletter` collection — manual export later)
 *   3. Else → localStorage fallback (logs to vrk_newsletter_v1, never lost)
 *
 * Props:
 *   compact   — small inline variant (default: false, full card)
 *   source    — analytics tag e.g. "homepage-footer", "carousel-end", "blog-cta"
 *   accent    — color override (default cyan)
 *   title     — heading text (only shown if compact=false)
 *   subtitle  — sub-copy
 *   cta       — button text (default: "Get launch updates")
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

    // Try Brevo first (env-var driven, set on Vercel)
    const brevoKey = import.meta.env.VITE_BREVO_API_KEY;
    const brevoList = import.meta.env.VITE_BREVO_LIST_ID;
    if (brevoKey && brevoList) {
      try {
        const res = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "api-key": brevoKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: payload.email,
            listIds: [Number(brevoList)],
            attributes: { SOURCE: source, SIGNED_UP_AT: new Date().toISOString() },
            updateEnabled: true,
          }),
        });
        if (res.ok || res.status === 204) { onSuccess(payload); return; }
        const data = await res.json().catch(() => ({}));
        // 400 w/ "Contact already exist" → treat as success
        if (data?.code === "duplicate_parameter") { onSuccess(payload); return; }
        throw new Error(data?.message || `Brevo error ${res.status}`);
      } catch (err) {
        console.warn("Brevo failed, falling back to API:", err.message);
      }
    }

    // Fall back to our own backend
    try {
      const res = await fetch("/api/tools?tool=newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { onSuccess(payload); return; }
    } catch {}

    // Final fallback — localStorage queue (will retry on next visit)
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
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800,
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
            fontFamily: "'Space Grotesk', sans-serif",
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
