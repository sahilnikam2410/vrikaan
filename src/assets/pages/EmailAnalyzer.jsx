import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { saveToolResult } from "../../services/toolHistoryService";
import renderMarkdown from "../../utils/renderMarkdown";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", gold: "#eab308", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const SAMPLE_HEADERS = `Delivered-To: victim@gmail.com
Received: by 2002:a05:7300:478a:b0:d2:3f1e:8a12 with SMTP id r10csp891234mpc;
        Mon, 15 Jan 2024 08:23:45 -0800 (PST)
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20230601;
        h=x-gm-message-state:to:from:subject:date:message-id:mime-version;
        bh=abc123def456=; b=XYZ789=
Received: from mail-sor-f41.google.com (mail-sor-f41.google.com. [209.85.220.41])
        by mx.google.com with SMTPS id a9-2023a1b2c3d4.123.2024.01.15.08.23.44
        for <victim@gmail.com>;
        Mon, 15 Jan 2024 08:23:44 -0800 (PST)
Received-SPF: pass (google.com: domain of sender@example.com designates 93.184.216.34 as permitted sender) client-ip=93.184.216.34;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=selector1 header.b=abc123;
       spf=pass (google.com: domain of sender@example.com designates 93.184.216.34 as permitted sender) smtp.mailfrom=sender@example.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=example.com
Received: from edge-relay.example.com (edge-relay.example.com [93.184.216.34])
        by mail-sor-f41.google.com with ESMTP id x7-abc123.45.2024.01.15.08.23.42
        for <victim@gmail.com>;
        Mon, 15 Jan 2024 08:23:43 -0800 (PST)
Received: from internal-smtp.example.com (internal-smtp.example.com [10.0.1.25])
        by edge-relay.example.com (Postfix) with ESMTPS id 4TxNk123abc
        for <victim@gmail.com>;
        Mon, 15 Jan 2024 11:23:41 -0500 (EST)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com;
        s=selector1; h=from:to:subject:date:message-id;
        bh=def456ghi789=; b=JKL012MNO345=
From: John Smith <sender@example.com>
To: victim@gmail.com
Subject: Q4 Financial Report - Action Required
Date: Mon, 15 Jan 2024 11:23:40 -0500
Message-ID: <CAB1234567890@mail.example.com>
Return-Path: <sender@example.com>
Reply-To: sender@example.com
X-Mailer: Microsoft Outlook 16.0
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_12345"`;

function parseHeaders(raw) {
  const lines = raw.split(/\r?\n/);
  const unfolded = [];
  for (const line of lines) {
    if (/^\s+/.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += " " + line.trim();
    } else {
      unfolded.push(line);
    }
  }

  const headers = {};
  for (const line of unfolded) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.substring(0, idx).trim().toLowerCase();
      const val = line.substring(idx + 1).trim();
      if (headers[key]) {
        if (Array.isArray(headers[key])) headers[key].push(val);
        else headers[key] = [headers[key], val];
      } else {
        headers[key] = val;
      }
    }
  }

  const get = (k) => {
    const v = headers[k.toLowerCase()];
    if (!v) return "";
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (k) => {
    const v = headers[k.toLowerCase()];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const from = get("from");
  const to = get("to");
  const subject = get("subject");
  const date = get("date");
  const returnPath = get("return-path").replace(/[<>]/g, "");
  const replyTo = get("reply-to").replace(/[<>]/g, "");
  const messageId = get("message-id");
  const xMailer = get("x-mailer") || get("user-agent");
  const contentType = get("content-type");

  // Parse Received hops
  const receivedHeaders = getAll("received");
  const hops = receivedHeaders.map((h) => {
    const fromMatch = h.match(/from\s+([\w\-.]+(?:\s*\([^)]*\))?(?:\s*\[[^\]]+\])?)/i);
    const byMatch = h.match(/by\s+([\w\-.]+)/i);
    const dateMatch = h.match(/;\s*(.+)$/);
    const ipMatch = h.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    return {
      from: fromMatch ? fromMatch[1].trim() : "Unknown",
      by: byMatch ? byMatch[1].trim() : "Unknown",
      timestamp: dateMatch ? dateMatch[1].trim() : "",
      ip: ipMatch ? ipMatch[1] : "",
    };
  }).reverse();

  // Calculate delays between hops
  for (let i = 1; i < hops.length; i++) {
    const prev = new Date(hops[i - 1].timestamp);
    const curr = new Date(hops[i].timestamp);
    if (!isNaN(prev) && !isNaN(curr)) {
      const diffMs = curr - prev;
      const diffSec = Math.round(diffMs / 1000);
      if (diffSec < 0) hops[i].delay = "Clock skew";
      else if (diffSec < 60) hops[i].delay = `${diffSec}s`;
      else if (diffSec < 3600) hops[i].delay = `${Math.round(diffSec / 60)}m ${diffSec % 60}s`;
      else hops[i].delay = `${Math.round(diffSec / 3600)}h ${Math.round((diffSec % 3600) / 60)}m`;
      hops[i].delaySec = diffSec;
    }
  }

  // Parse authentication results
  const authResults = get("authentication-results");
  const spfHeader = get("received-spf");

  const parseAuthResult = (protocol) => {
    const patterns = [
      new RegExp(`${protocol}=([a-z]+)`, "i"),
      new RegExp(`${protocol}\\s*:\\s*([a-z]+)`, "i"),
    ];
    for (const p of patterns) {
      const m = authResults.match(p);
      if (m) return m[1].toLowerCase();
    }
    if (protocol === "spf" && spfHeader) {
      const m = spfHeader.match(/^(pass|fail|softfail|neutral|none|temperror|permerror)/i);
      if (m) return m[1].toLowerCase();
    }
    return "none";
  };

  const spf = parseAuthResult("spf");
  const dkim = parseAuthResult("dkim");
  const dmarc = parseAuthResult("dmarc");

  // Extract email from "From" field
  const fromEmail = from.match(/<([^>]+)>/) ? from.match(/<([^>]+)>/)[1] : from;
  const fromName = from.replace(/<[^>]+>/, "").trim();

  // Suspicious indicators
  const suspiciousFlags = [];

  if (returnPath && fromEmail && returnPath.toLowerCase() !== fromEmail.toLowerCase()) {
    suspiciousFlags.push({ label: "From/Return-Path Mismatch", detail: `From: ${fromEmail} vs Return-Path: ${returnPath}`, severity: "high" });
  }
  if (replyTo && fromEmail && replyTo.toLowerCase() !== fromEmail.toLowerCase()) {
    suspiciousFlags.push({ label: "From/Reply-To Mismatch", detail: `From: ${fromEmail} vs Reply-To: ${replyTo}`, severity: "medium" });
  }
  for (const hop of hops) {
    if (hop.delaySec && hop.delaySec > 300) {
      suspiciousFlags.push({ label: "Unusual Hop Delay", detail: `${hop.delay} delay at ${hop.by}`, severity: "medium" });
    }
  }
  if (spf === "fail" || spf === "softfail") {
    suspiciousFlags.push({ label: "SPF Failure", detail: `SPF result: ${spf}`, severity: "high" });
  }
  if (dkim === "fail") {
    suspiciousFlags.push({ label: "DKIM Failure", detail: "DKIM signature verification failed", severity: "high" });
  }
  if (dmarc === "fail") {
    suspiciousFlags.push({ label: "DMARC Failure", detail: "DMARC policy check failed", severity: "high" });
  }
  for (const hop of hops) {
    if (hop.ip && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hop.ip)) {
      // private IPs are normal for internal relays, skip
    } else if (hop.from === "Unknown" && hop.by !== "Unknown") {
      suspiciousFlags.push({ label: "Missing Origin Server", detail: `Hop to ${hop.by} has no originating server`, severity: "low" });
    }
  }

  // Security assessment
  const passCount = [spf, dkim, dmarc].filter((r) => r === "pass").length;
  const failCount = [spf, dkim, dmarc].filter((r) => r === "fail" || r === "softfail").length;
  let assessment;
  if (passCount === 3) assessment = { label: "Authenticated", color: T.green, icon: "\u2713", desc: "All authentication checks passed. This email appears legitimate." };
  else if (failCount >= 2) assessment = { label: "Likely Spoofed", color: T.red, icon: "\u2717", desc: "Multiple authentication checks failed. This email is likely forged." };
  else if (failCount >= 1 || suspiciousFlags.length > 0) assessment = { label: "Suspicious", color: T.gold, icon: "\u26A0", desc: "Some authentication checks failed or suspicious indicators found." };
  else assessment = { label: "Partially Verified", color: T.cyan, icon: "\u2139", desc: "Some authentication data is missing. Exercise caution." };

  return { from, fromName, fromEmail, to, subject, date, returnPath, replyTo, messageId, xMailer, contentType, hops, spf, dkim, dmarc, assessment, suspiciousFlags };
}

const authColor = (val) => {
  if (val === "pass") return T.green;
  if (val === "fail" || val === "softfail") return T.red;
  return T.mutedDark;
};

export default function EmailAnalyzer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiError, setAiError] = useState("");

  const explainWithAI = async () => {
    if (!result || result.error) return;
    setAiLoading(true); setAiError(""); setAiExplanation("");
    try {
      const res = await fetch("/api/tools?tool=ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "Email Header Analyzer",
          input: result.fromEmail || result.from || "email",
          result: {
            verdict: result.assessment?.label,
            spf: result.spf, dkim: result.dkim, dmarc: result.dmarc,
            suspiciousFlags: result.suspiciousFlags?.map((f) => ({ label: f.label, severity: f.severity })) || [],
            hops: result.hops?.length || 0,
          },
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

  const analyze = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      try {
        const parsed = parseHeaders(input);
        setResult(parsed);
        saveToolResult(
          "Email Analyzer",
          parsed.fromEmail || "Unknown sender",
          `${parsed.assessment.label} - SPF: ${parsed.spf}, DKIM: ${parsed.dkim}, DMARC: ${parsed.dmarc}${parsed.suspiciousFlags.length > 0 ? ` | ${parsed.suspiciousFlags.length} suspicious indicator(s)` : ""}`,
          parsed.assessment.label === "Authenticated" ? "success" : parsed.assessment.label === "Likely Spoofed" ? "error" : "warning"
        );
      } catch {
        setResult({ error: true });
        saveToolResult("Email Analyzer", "Unknown", "Failed to parse email headers", "error");
      }
      setLoading(false);
    }, 1800);
  };

  const loadSample = () => {
    setInput(SAMPLE_HEADERS);
    setResult(null);
  };

  const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "32px 28px", backdropFilter: "blur(8px)", marginBottom: 28 };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };
  const labelStyle = { fontSize: 11, color: T.mutedDark, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 };
  const valStyle = { fontSize: 13, color: T.white, wordBreak: "break-all", lineHeight: 1.5 };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Email Header Analyzer" description="Analyze raw email headers to trace email routes, verify SPF/DKIM/DMARC authentication, and detect spoofing with Secuvion." path="/email-analyzer" />
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}><Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link></div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Email Forensics</span>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Email Header <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analyzer</span></h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>Paste raw email headers to trace the delivery route, verify authentication records, and detect spoofing attempts.</p>
        </div>

        {/* Input Card */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600 }}>Raw Email Headers</span>
            <button onClick={loadSample} style={{ padding: "6px 14px", background: "rgba(99,102,241,0.08)", border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 8, color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s" }}>Load Sample Headers</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste full email headers here... (View Original / Show Original in your email client)" rows={12}
            style={{ width: "100%", padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.3s", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.3)")} onBlur={(e) => (e.target.style.borderColor = T.border)} />
          <button onClick={analyze} disabled={loading || !input.trim()} style={{ marginTop: 16, width: "100%", padding: "14px 0", background: loading ? T.mutedDark : T.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading || !input.trim() ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s", opacity: !input.trim() && !loading ? 0.5 : 1 }}>
            {loading ? "Analyzing Headers..." : "Analyze Headers"}
          </button>
        </div>

        {/* Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: 44 }}>
            <div style={{ width: 40, height: 40, margin: "0 auto", border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", animation: "eaSpin 0.8s linear infinite" }} />
            <div style={{ fontSize: 13, color: T.muted, marginTop: 18 }}>Parsing email headers and tracing route...</div>
          </div>
        )}
        <style>{`@keyframes eaSpin { to { transform: rotate(360deg) } }`}</style>

        {result && !result.error && (
          <>
            {/* Security Assessment */}
            <div style={{ ...card, padding: "28px", background: `${result.assessment.color}06`, border: `1px solid ${result.assessment.color}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, border: `1.5px solid ${result.assessment.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: result.assessment.color, flexShrink: 0, background: `${result.assessment.color}08` }}>{result.assessment.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: result.assessment.color, marginBottom: 4 }}>{result.assessment.label}</div>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{result.assessment.desc}</p>
                </div>
                <button onClick={explainWithAI} disabled={aiLoading} style={{ padding: "8px 14px", background: "rgba(20,227,197,0.1)", border: "1px solid rgba(20,227,197,0.25)", borderRadius: 8, color: T.cyan, fontSize: 12, fontWeight: 600, cursor: aiLoading ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans'", flexShrink: 0, opacity: aiLoading ? 0.6 : 1 }}>{aiLoading ? "…" : "🤖 AI"}</button>
              </div>
              {(aiExplanation || aiError) && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(20,227,197,0.05)", border: "1px solid rgba(20,227,197,0.15)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.cyan, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, marginBottom: 8 }}>🤖 AI ANALYSIS</div>
                  {aiError ? <div style={{ fontSize: 13, color: T.red }}>{aiError}</div>
                    : <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{renderMarkdown(aiExplanation)}</div>}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {[{ label: "SPF", val: result.spf }, { label: "DKIM", val: result.dkim }, { label: "DMARC", val: result.dmarc }].map((a) => (
                  <div key={a.label} style={{ flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.25)", borderRadius: 10, border: `1px solid ${authColor(a.val)}15`, textAlign: "center" }}>
                    <div style={{ ...labelStyle, marginBottom: 6 }}>{a.label}</div>
                    <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: authColor(a.val), textTransform: "uppercase" }}>{a.val || "none"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div style={card}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Message Details</h3>
              <div className="ea-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "From", val: result.from },
                  { label: "To", val: result.to },
                  { label: "Subject", val: result.subject, full: true },
                  { label: "Date", val: result.date },
                  { label: "Return-Path", val: result.returnPath || "N/A" },
                  { label: "Reply-To", val: result.replyTo || "N/A" },
                  { label: "Message-ID", val: result.messageId || "N/A", full: true },
                  { label: "X-Mailer", val: result.xMailer || "N/A" },
                  { label: "Content-Type", val: result.contentType || "N/A" },
                ].map((f, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 10, gridColumn: f.full ? "1 / -1" : "auto" }}>
                    <div style={labelStyle}>{f.label}</div>
                    <div style={{ ...valStyle, ...mono, fontSize: 12 }}>{f.val || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Route */}
            {result.hops.length > 0 && (
              <div style={card}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>Email Route ({result.hops.length} hops)</h3>
                <div style={{ position: "relative", paddingLeft: 28 }}>
                  {/* Vertical line */}
                  <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${T.accent}, ${T.cyan})`, borderRadius: 1 }} />
                  {result.hops.map((hop, i) => (
                    <div key={i} style={{ position: "relative", marginBottom: i < result.hops.length - 1 ? 24 : 0 }}>
                      {/* Dot */}
                      <div style={{ position: "absolute", left: -23, top: 6, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? T.accent : i === result.hops.length - 1 ? T.cyan : T.dark, border: `2px solid ${i === 0 ? T.accent : i === result.hops.length - 1 ? T.cyan : T.muted}` }} />
                      <div style={{ padding: "14px 18px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>
                            {i === 0 ? "Origin" : i === result.hops.length - 1 ? "Destination" : `Hop ${i}`}
                          </span>
                          {hop.delay && (
                            <span style={{ ...mono, fontSize: 10, padding: "2px 8px", borderRadius: 6, background: hop.delaySec > 300 ? `${T.red}15` : `${T.green}15`, color: hop.delaySec > 300 ? T.red : T.green, fontWeight: 600 }}>
                              +{hop.delay}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: T.mutedDark }}>from</span>
                          <span style={{ ...mono, fontSize: 11, color: T.cyan }}>{hop.from}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: T.mutedDark }}>by</span>
                          <span style={{ ...mono, fontSize: 11, color: T.accent }}>{hop.by}</span>
                        </div>
                        {hop.ip && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: T.mutedDark }}>IP</span>
                            <span style={{ ...mono, fontSize: 11, color: T.muted }}>{hop.ip}</span>
                          </div>
                        )}
                        {hop.timestamp && (
                          <div style={{ ...mono, fontSize: 10, color: T.mutedDark, marginTop: 4 }}>{hop.timestamp}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Summary Bar */}
            {result.hops.length > 1 && (
              <div style={card}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Route Summary</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0" }}>
                  {result.hops.map((hop, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "center", minWidth: 80 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? `${T.accent}15` : i === result.hops.length - 1 ? `${T.cyan}15` : "rgba(148,163,184,0.06)", border: `1px solid ${i === 0 ? T.accent : i === result.hops.length - 1 ? T.cyan : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 12, color: i === 0 ? T.accent : i === result.hops.length - 1 ? T.cyan : T.muted }}>
                          {i === 0 ? "\u2709" : i === result.hops.length - 1 ? "\u2709" : "\u21C6"}
                        </div>
                        <div style={{ ...mono, fontSize: 9, color: T.muted, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hop.by}</div>
                      </div>
                      {i < result.hops.length - 1 && (
                        <div style={{ width: 48, height: 1, background: `linear-gradient(to right, ${T.accent}40, ${T.cyan}40)`, margin: "0 4px", marginBottom: 18, flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suspicious Indicators */}
            {result.suspiciousFlags.length > 0 && (
              <div style={{ ...card, background: `${T.red}06`, border: `1px solid ${T.red}15` }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 20px", color: T.red }}>
                  {"\u26A0"} Suspicious Indicators ({result.suspiciousFlags.length})
                </h3>
                {result.suspiciousFlags.map((flag, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "rgba(0,0,0,0.25)", borderRadius: 10, marginBottom: i < result.suspiciousFlags.length - 1 ? 10 : 0, border: `1px solid ${flag.severity === "high" ? T.red : flag.severity === "medium" ? T.gold : T.mutedDark}10` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: flag.severity === "high" ? T.red : flag.severity === "medium" ? T.gold : T.mutedDark }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 2 }}>{flag.label}</div>
                      <div style={{ ...mono, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{flag.detail}</div>
                    </div>
                    <span style={{ marginLeft: "auto", ...mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: flag.severity === "high" ? T.red : flag.severity === "medium" ? T.gold : T.mutedDark, flexShrink: 0, padding: "2px 8px", borderRadius: 6, background: `${flag.severity === "high" ? T.red : flag.severity === "medium" ? T.gold : T.mutedDark}10` }}>{flag.severity}</span>
                  </div>
                ))}
              </div>
            )}

            {result.suspiciousFlags.length === 0 && (
              <div style={{ ...card, background: `${T.green}06`, border: `1px solid ${T.green}15` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.green}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: T.green }}>{"\u2713"}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.green }}>No Suspicious Indicators Found</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Header analysis did not reveal any anomalies or red flags.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div style={card}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 18px" }}>How to Find Email Headers</h3>
              <div className="ea-tips-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { client: "Gmail", steps: 'Open email > Three dots menu > "Show original"' },
                  { client: "Outlook", steps: 'Open email > File > Properties > "Internet headers"' },
                  { client: "Yahoo Mail", steps: 'Open email > Three dots > "View raw message"' },
                  { client: "Apple Mail", steps: "Open email > View > Message > All Headers" },
                ].map((t) => (
                  <div key={t.client} style={{ padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 4 }}>{t.client}</div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{t.steps}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {result && result.error && (
          <div style={{ ...card, background: `${T.red}06`, border: `1px solid ${T.red}15`, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u2717"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.red, marginBottom: 6 }}>Parse Error</div>
            <div style={{ fontSize: 13, color: T.muted }}>Could not parse the provided headers. Please ensure you pasted complete, raw email headers.</div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
  @media (max-width: 768px) {
    .ea-detail-grid { grid-template-columns: 1fr !important; }
    .ea-tips-grid { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  );
}