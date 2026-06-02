/**
 * EmailRouting — shared 4-inbox routing block used on Careers, Contact, Press.
 *
 * Four inboxes:
 *  • hr@vrikaan.com       → HR · People ops
 *  • careers@vrikaan.com   → Careers · Applications · Internships
 *  • ai@vrikaan.com       → AI · Product · Dev
 *  • hello@vrikaan.com    → General · Press · Support
 *
 * Founders' direct mail (shown on /founder, /about only — not public contact):
 *  • founder@vrikaan.com    → Sahil Nikam
 *  • cofounder@vrikaan.com  → Khushi Raygade
 *
 * Props:
 *   variant   — "full" (default, 4 cards) | "compact" (single row, footer-friendly)
 *   highlight — "hr" | "careers" | "ai" | "general" — emphasises one inbox
 *   title     — heading override (full only)
 *   subtitle  — sub-copy override (full only)
 */

const T = {
  white: "#f1f5f9", muted: "#94a3b8",
  border: "rgba(148,163,184,0.12)", card: "rgba(17,24,39,0.7)",
  cyan: "#14b8a6", accent: "#6366f1", green: "#22c55e",
};

export const INBOXES = [
  {
    key: "careers",
    tag: "Careers · Internships",
    color: T.cyan,
    icon: "💼",
    email: "careers@vrikaan.com",
    body: "Job + internship applications, take-home submissions, interview logistics.",
    subject: "Careers — ",
  },
  {
    key: "hr",
    tag: "HR · People Ops",
    color: "#06b6d4",
    icon: "🧑‍💼",
    email: "hr@vrikaan.com",
    body: "Payroll, onboarding, employee/intern HR queries, policy questions.",
    subject: "HR — ",
  },
  {
    key: "ai",
    tag: "AI · Product · Dev",
    color: T.accent,
    icon: "🤖",
    email: "ai@vrikaan.com",
    body: "AI/ML feedback, bug reports, feature requests, API integration questions, partnership pitches around the AI stack.",
    subject: "AI / Product — ",
  },
  {
    key: "general",
    tag: "General · Press · Support",
    color: T.green,
    icon: "✉️",
    email: "hello@vrikaan.com",
    body: "Customer support, press & media, general enquiries, brand & partnership requests outside AI/dev.",
    subject: "Hello — ",
  },
];

// Founder direct emails — surface on /founder, /about, internal pages only.
export const FOUNDERS = [
  { name: "Sahil Anil Nikam", role: "Founder & CEO", email: "founder@vrikaan.com" },
  { name: "Khushi Raygade",   role: "Co-founder & CTO", email: "cofounder@vrikaan.com" },
];

export default function EmailRouting({
  variant = "full",
  highlight,
  title = "Reach the right inbox",
  subtitle = "We monitor 4 inboxes. Pick the one that matches your message — we reply within 7 days.",
}) {
  if (variant === "compact") {
    return (
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
        padding: "14px 0",
      }}>
        {INBOXES.map(c => {
          const dim = highlight && highlight !== c.key;
          return (
            <a
              key={c.email}
              href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 999,
                background: dim ? "transparent" : c.color + "10",
                border: `1px solid ${dim ? T.border : c.color + "33"}`,
                color: dim ? T.muted : c.color,
                fontSize: 12, fontWeight: 600, textDecoration: "none",
                fontFamily: "ui-monospace, Menlo, monospace",
                transition: "all 0.15s",
              }}
              title={c.body}
            >
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              {c.email}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <section style={{ marginBottom: 60 }}>
      <h2 style={{
        fontFamily: "var(--font-display)", fontSize: 24,
        color: T.white, margin: "0 0 6px",
      }}>{title}</h2>
      <p style={{ color: T.muted, fontSize: 14, margin: "0 0 22px" }}>
        {subtitle}
      </p>
      <div style={{
        display: "grid", gap: 14,
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      }}>
        {INBOXES.map(c => {
          const isHi = highlight === c.key;
          return (
            <a
              key={c.email}
              href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
              style={{
                display: "block", padding: 22,
                background: isHi ? c.color + "10" : T.card,
                border: `1px solid ${isHi ? c.color + "66" : c.color + "33"}`,
                borderRadius: 16,
                textDecoration: "none", color: "inherit",
                transition: "transform 0.15s, border-color 0.15s",
                boxShadow: isHi ? `0 0 0 1px ${c.color}33` : "none",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                textTransform: "uppercase", color: c.color, marginBottom: 8,
              }}>{c.tag}</div>
              <div style={{
                color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 8,
                fontFamily: "ui-monospace, Menlo, monospace", wordBreak: "break-all",
              }}>{c.email}</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>
                {c.body}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
