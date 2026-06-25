import { useState } from "react";
import ToolShell from "../../components/ToolShell";

const T = { card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14b8a6", green: "#22c55e", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.12)" };

const SITE = "https://vrikaan.com";

// Each badge: an <img> wrapped in a link back to vrikaan.com (?ref=badge for
// attribution). Every embed = a backlink + brand impression on the host site.
const VARIANTS = [
  { id: "verified-dark", label: "Dark", bg: "#0b1220" },
  { id: "verified-light", label: "Light", bg: "#e2e8f0" },
];

const htmlSnippet = (id) =>
  `<a href="${SITE}/?ref=badge" target="_blank" rel="noopener">\n  <img src="${SITE}/badge/${id}.svg" alt="Secured by VRIKAAN" width="180" height="40" loading="lazy">\n</a>`;

const mdSnippet = (id) =>
  `[![Secured by VRIKAAN](${SITE}/badge/${id}.svg)](${SITE}/?ref=badge)`;

export default function Badge() {
  const [copied, setCopied] = useState("");

  const copy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopied(key); setTimeout(() => setCopied(""), 2000);
  };

  const codeBox = (label, key, value) => (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{label}</span>
        <button onClick={() => copy(key, value)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: copied === key ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg,${T.accent},${T.cyan})`, color: copied === key ? T.green : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {copied === key ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "12px 14px", background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: "#cbd5e1", fontSize: 12, fontFamily: "'Vrikaan Mono',ui-monospace,monospace", overflowX: "auto", whiteSpace: "pre" }}>{value}</pre>
    </div>
  );

  return (
    <ToolShell
      route="/badge" eyebrow="For Partners & Sellers"
      title="Trust" titleAccent="Badge"
      subtitle="Show customers your site is protected. Add the “Secured by VRIKAAN” badge — free, no signup. Builds trust + links back to VRIKAAN."
      width={760}
      seoTitle="Secured by VRIKAAN — Free Trust Badge for Your Website"
      seoDesc="Add the free “Secured by VRIKAAN” trust badge to your website, store, or email signature. Show customers you take cyber-safety seriously. Copy-paste HTML or Markdown."
      path="/badge"
      footer
    >
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 4px" }}>
          Paste a snippet into your website footer, online store, or README. The badge links back to VRIKAAN so visitors can verify and check their own messages for scams.
        </p>
      </div>

      {VARIANTS.map((v) => (
        <div key={v.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 14px", fontFamily: "'Vrikaan Sans',sans-serif" }}>{v.label} badge</h3>
          <div style={{ display: "flex", justifyContent: "center", padding: "22px", borderRadius: 10, background: v.bg, border: `1px solid ${T.border}` }}>
            <img src={`/badge/${v.id}.svg`} alt={`Secured by VRIKAAN — ${v.label}`} width="248" height="56" />
          </div>
          {codeBox("HTML", `${v.id}-html`, htmlSnippet(v.id))}
          {codeBox("Markdown", `${v.id}-md`, mdSnippet(v.id))}
        </div>
      ))}

      <div style={{ background: "rgba(20,184,166,0.06)", border: `1px solid rgba(20,184,166,0.25)`, borderRadius: 12, padding: "14px 18px", color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
        Tip: small businesses, sellers & freelancers — add this to your checkout page or invoice footer to signal you take customer safety seriously. Want a verified badge tied to your business profile? <a href="/enterprise" style={{ color: T.cyan, fontWeight: 600 }}>Talk to us →</a>
      </div>
    </ToolShell>
  );
}
