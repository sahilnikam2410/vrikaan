import { useState } from "react";

/**
 * Drop-in button that POSTs a tool result to /api/tools?tool=ai-explain
 * and renders the AI response inline below itself.
 *
 * Usage:
 *   <AIExplainButton
 *     toolName="dark-web-monitor"
 *     input={results.email}
 *     result={results.breaches}
 *   />
 */
const T = {
  cyan: "#14e3c5",
  accent: "#6366f1",
  white: "#f1f5f9",
  muted: "#94a3b8",
  border: "rgba(148,163,184,0.15)",
  card: "rgba(17,24,39,0.85)",
  red: "#ef4444",
};

export default function AIExplainButton({ toolName, input, result, label = "✨ AI Explain", style = {} }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    if (loading) return;
    setLoading(true); setError(""); setExplanation("");
    try {
      const r = await fetch("/api/tools?tool=ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName, input, result }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "AI service error");
      setExplanation(data.explanation || "");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={run}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: loading ? "rgba(20,227,197,0.06)" : "rgba(20,227,197,0.15)",
          border: `1px solid ${T.cyan}40`,
          borderRadius: 8,
          color: T.cyan,
          fontSize: 12, fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "'Vrikaan Sans'",
          ...style,
        }}
      >
        {loading ? "Analyzing…" : label}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: T.red, fontSize: 13 }}>
          {error}
        </div>
      )}

      {explanation && (
        <div style={{ marginTop: 16, padding: 18, background: T.card, border: `1px solid ${T.cyan}30`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <span style={{ color: T.cyan, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>AI Analysis</span>
            <span style={{ marginLeft: "auto", color: T.muted, fontSize: 10 }}>powered by Gemini 2.5 flash</span>
          </div>
          <div style={{ color: T.white, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {explanation}
          </div>
        </div>
      )}
    </>
  );
}
