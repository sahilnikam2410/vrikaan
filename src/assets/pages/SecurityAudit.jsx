import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUsageLimit } from "../../hooks/useUsageLimit";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { exportReport } from "../../utils/exportPDF";
import { saveToolResult } from "../../services/toolHistoryService";
import renderMarkdown from "../../utils/renderMarkdown";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

const CHECKS = [
  { id: "breach", name: "Email Breach Check", description: "Check if email appears in known data breaches", api: "/api/breach" },
  { id: "headers", name: "Security Headers", description: "Scan a website's security headers", api: "/api/tools?tool=security-headers" },
  { id: "ssl", name: "SSL Certificate", description: "Verify SSL certificate validity", api: "/api/ssl" },
];

export default function SecurityAudit() {
  const { user } = useAuth();
  const { checkLimit, limitError } = useUsageLimit("security-audit");
  const [email, setEmail] = useState(user?.email || "");
  const [domain, setDomain] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [currentCheck, setCurrentCheck] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiError, setAiError] = useState("");

  const explainWithAI = async () => {
    if (!results) return;
    setAiLoading(true); setAiError(""); setAiExplanation("");
    try {
      const res = await fetch("/api/tools?tool=ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "Security Audit",
          input: `Email: ${email}, Domain: ${domain}`,
          result: { score: results.score, grade: results.grade, checks: results.checks },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "AI request failed");
      setAiExplanation(data.explanation);
    } catch (err) {
      setAiError(err.message || "Could not generate AI explanation");
    } finally {
      setAiLoading(false);
    }
  };

  const runAudit = async () => {
    if (!email.trim() && !domain.trim()) return;
    const ok = await checkLimit();
    if (!ok) return;
    setRunning(true); setProgress(0); setResults(null);
    const auditResults = {};
    let score = 0; let maxScore = 0;

    // Breach check
    if (email.trim()) {
      setCurrentCheck("Checking email breaches...");
      try {
        const res = await fetch("/api/breach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
        const data = await res.json();
        auditResults.breach = data;
        if (data.breaches === 0 || data.ExposedBreaches?.breaches_details?.length === 0) score += 20;
        else if ((data.ExposedBreaches?.breaches_details?.length || 0) < 3) score += 10;
        maxScore += 20;
      } catch { auditResults.breach = { error: "Check failed" }; maxScore += 20; }
    }
    setProgress(33);

    // Security Headers
    if (domain.trim()) {
      setCurrentCheck("Scanning security headers...");
      try {
        const res = await fetch("/api/tools?tool=security-headers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: domain.trim() }) });
        const data = await res.json();
        auditResults.headers = data;
        if (data.score >= 70) score += 25;
        else if (data.score >= 40) score += 15;
        else score += 5;
        maxScore += 25;
      } catch { auditResults.headers = { error: "Check failed" }; maxScore += 25; }
    }
    setProgress(66);

    // SSL check
    if (domain.trim()) {
      setCurrentCheck("Verifying SSL certificate...");
      try {
        const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
        const res = await fetch("/api/ssl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: cleanDomain }) });
        const data = await res.json();
        auditResults.ssl = data;
        if (data.valid) score += 20;
        maxScore += 20;
      } catch { auditResults.ssl = { error: "Check failed" }; maxScore += 20; }
    }
    setProgress(100);

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const grade = finalScore >= 85 ? "A" : finalScore >= 70 ? "B" : finalScore >= 50 ? "C" : finalScore >= 30 ? "D" : "F";

    setResults({ checks: auditResults, score: finalScore, grade, maxScore });
    setCurrentCheck("");
    setRunning(false);
    saveToolResult(
      "Security Audit",
      [email, domain].filter(Boolean).join(" | "),
      `Score ${finalScore}/100 (Grade ${grade})`,
      finalScore >= 70 ? "success" : finalScore >= 40 ? "warning" : "error"
    );
  };

  const doExport = () => {
    if (!results) return;
    const sections = [];
    if (results.checks.breach) {
      const b = results.checks.breach;
      const count = b.ExposedBreaches?.breaches_details?.length || b.breaches || 0;
      sections.push({ heading: "Email Breach Check", items: [`Email: ${email}`, `Breaches Found: ${count}`, count === 0 ? "Status: No breaches found" : "Status: Breaches detected — change passwords immediately"] });
    }
    if (results.checks.headers) {
      const h = results.checks.headers;
      sections.push({ heading: "Security Headers", items: [`URL: ${domain}`, `Grade: ${h.grade || "N/A"}`, `Score: ${h.score || 0}/100`, `Present: ${h.summary?.present || 0}`, `Missing: ${h.summary?.missing || 0}`] });
    }
    if (results.checks.ssl) {
      const s = results.checks.ssl;
      sections.push({ heading: "SSL Certificate", items: [`Valid: ${s.valid ? "Yes" : "No"}`, `Issuer: ${s.issuer || "N/A"}`, `Expires: ${s.validTo || "N/A"}`] });
    }
    exportReport({ title: "Security Audit Report", subtitle: `Overall Score: ${results.score}/100 (Grade ${results.grade})`, sections, footer: "Generated by VRIKAAN" });
  };

  const gradeColor = { A: T.green, B: T.cyan, C: T.yellow, D: "#f97316", F: T.red };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <SEO title="Security Audit" description="Run a comprehensive security audit on your email and website." path="/security-audit" />
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 20px 60px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Security Audit</h1>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Run a comprehensive security check on your email and website in one click.</p>

        {!results && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.white, marginBottom: 6 }}>Website / Domain (optional)</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="https://example.com" style={{ width: "100%", padding: "14px 16px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            {limitError && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: T.red }}>{limitError}</span>
                <a href="/pricing" style={{ fontSize: 13, color: T.accent, marginLeft: 8 }}>Upgrade</a>
              </div>
            )}
            <button onClick={runAudit} disabled={running || (!email.trim() && !domain.trim())} style={{ width: "100%", padding: "16px", borderRadius: 10, border: "none", background: running ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: running ? "wait" : "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
              {running ? `Running Audit... ${progress}%` : "Run Security Audit"}
            </button>

            {running && (
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${T.accent},${T.cyan})`, transition: "width 0.5s", borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>{currentCheck}</p>
              </div>
            )}
          </div>
        )}

        {results && (
          <div>
            {/* Score card */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${gradeColor[results.grade]}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: gradeColor[results.grade], fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{results.grade}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{results.score}/100</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>
                {results.score >= 70 ? "Good Security Posture" : results.score >= 40 ? "Needs Improvement" : "Critical Issues Found"}
              </h2>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={doExport} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Export Full Report</button>
                <button onClick={explainWithAI} disabled={aiLoading} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(20,227,197,0.3)", background: "rgba(20,227,197,0.08)", color: T.cyan, fontSize: 14, fontWeight: 600, cursor: aiLoading ? "default" : "pointer", opacity: aiLoading ? 0.6 : 1 }}>{aiLoading ? "Analyzing..." : "🤖 Explain with AI"}</button>
                <button onClick={() => { setResults(null); setAiExplanation(""); setAiError(""); }} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.muted, fontSize: 14, cursor: "pointer" }}>New Audit</button>
              </div>
              {(aiExplanation || aiError) && (
                <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(20,227,197,0.05)", border: "1px solid rgba(20,227,197,0.15)", borderRadius: 12, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 14 }}>🤖</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.cyan, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>AI ANALYSIS</span>
                  </div>
                  {aiError ? <div style={{ fontSize: 13, color: T.red }}>{aiError}</div>
                    : <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{renderMarkdown(aiExplanation)}</div>}
                </div>
              )}
            </div>

            {/* Individual results */}
            {results.checks.breach && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 8 }}>&#x1F4E7; Email Breach Check</h3>
                {results.checks.breach.error ? (
                  <p style={{ fontSize: 13, color: T.red }}>{results.checks.breach.error}</p>
                ) : (
                  <p style={{ fontSize: 13, color: (results.checks.breach.ExposedBreaches?.breaches_details?.length || 0) === 0 ? T.green : T.red }}>
                    {(results.checks.breach.ExposedBreaches?.breaches_details?.length || 0) === 0 ? "No breaches found for this email" : `Found in ${results.checks.breach.ExposedBreaches?.breaches_details?.length || 0} breach(es) — change your passwords`}
                  </p>
                )}
              </div>
            )}
            {results.checks.headers && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 8 }}>&#x1F6E1; Security Headers</h3>
                {results.checks.headers.error ? (
                  <p style={{ fontSize: 13, color: T.red }}>{results.checks.headers.error}</p>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: gradeColor[results.checks.headers.grade] || T.muted }}>{results.checks.headers.grade}</span>
                    <span style={{ fontSize: 13, color: T.muted }}>Score: {results.checks.headers.score}/100 — {results.checks.headers.summary?.present} headers present, {results.checks.headers.summary?.missing} missing</span>
                  </div>
                )}
              </div>
            )}
            {results.checks.ssl && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 8 }}>&#x1F512; SSL Certificate</h3>
                {results.checks.ssl.error ? (
                  <p style={{ fontSize: 13, color: T.red }}>{results.checks.ssl.error}</p>
                ) : (
                  <p style={{ fontSize: 13, color: results.checks.ssl.valid ? T.green : T.red }}>
                    {results.checks.ssl.valid ? `Valid — issued by ${results.checks.ssl.issuer || "Unknown"}` : "SSL certificate invalid or not found"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
