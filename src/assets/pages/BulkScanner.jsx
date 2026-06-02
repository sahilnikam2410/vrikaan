import { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  white: "#f1f5f9", muted: "#94a3b8", green: "#22c55e",
  red: "#ef4444", border: "rgba(148,163,184,0.1)",
  cyan: "#14e3c5", accent: "#6366f1", orange: "#f97316",
};

const MAX_FREE = 5;
const MAX_PRO = 100;

function isValidUrl(s) {
  try { new URL(s.startsWith("http") ? s : `https://${s}`); return true; }
  catch { return false; }
}

function normalize(u) {
  return u.startsWith("http") ? u : `https://${u}`;
}

export default function BulkScanner() {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [urls, setUrls] = useState([]);
  const [results, setResults] = useState({});
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const isPro = user?.plan && ["starter", "pro", "enterprise"].includes(user.plan);
  const limit = isPro ? MAX_PRO : MAX_FREE;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
      const valid = lines.filter(isValidUrl);
      if (valid.length === 0) {
        setError("No valid URLs found in file");
        return;
      }
      if (valid.length > limit) {
        setError(`File has ${valid.length} URLs but your plan allows ${limit}. Upgrade for higher limits.`);
        setUrls(valid.slice(0, limit));
      } else {
        setError("");
        setUrls(valid);
      }
      setResults({});
    };
    reader.readAsText(f);
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    const lines = text.split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
    const valid = lines.filter(isValidUrl);
    setUrls(valid.slice(0, limit));
    setResults({});
    if (lines.length > limit) {
      setError(`Only first ${limit} URLs will be scanned (${user?.plan ? "your plan" : "free tier"} limit)`);
    } else {
      setError("");
    }
  };

  const scanOne = async (url) => {
    try {
      const res = await fetch("/api/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalize(url) }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { error: e.message } };
    }
  };

  const runScan = async () => {
    if (urls.length === 0) return;
    setScanning(true);
    setProgress(0);
    setResults({});

    // Concurrency 3 — gentle on rate limits
    const queue = [...urls];
    const concurrent = 3;
    let done = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const u = queue.shift();
        if (!u) break;
        const r = await scanOne(u);
        setResults((prev) => ({ ...prev, [u]: r }));
        done++;
        setProgress(Math.round((done / urls.length) * 100));
      }
    };

    await Promise.all(Array.from({ length: concurrent }, () => worker()));
    setScanning(false);
  };

  const exportCSV = () => {
    const rows = [
      ["URL", "Status", "Score", "Details"],
      ...urls.map((u) => {
        const r = results[u];
        return [
          u,
          r?.ok ? "scanned" : "failed",
          r?.data?.score ?? "",
          (r?.data?.threats || r?.data?.error || "").toString().replace(/"/g, '""'),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vrikaan-bulk-scan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const okCount = Object.values(results).filter((r) => r.ok).length;
  const failCount = Object.values(results).filter((r) => !r.ok).length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Bulk URL Scanner"
        description="Scan up to 100 URLs at once for phishing, malware, and reputation threats. CSV upload + export."
        path="/bulk-scanner"
        keywords="bulk URL scanner, mass phishing check, CSV malware scanner, batch threat scan"
      />
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: T.white,
            margin: "0 0 8px", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>Bulk URL Scanner</h1>
          <p style={{ fontSize: 15, color: T.muted, marginBottom: 28, lineHeight: 1.7 }}>
            Paste a list of URLs or upload a CSV. We'll scan each for phishing, malware, and reputation threats.
            Free tier: up to {MAX_FREE} URLs. Paid plans: {MAX_PRO}.
          </p>

          {/* Plan badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 100,
            background: isPro ? "rgba(99,102,241,0.12)" : "rgba(148,163,184,0.08)",
            border: `1px solid ${isPro ? T.accent : T.border}`,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Your limit:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: isPro ? T.cyan : T.white }}>
              {limit} URLs · {user?.plan ? user.plan.toUpperCase() : "GUEST"}
            </span>
          </div>

          {/* Input methods */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: 24, marginBottom: 20,
          }}>
            <label style={{ fontSize: 13, color: T.muted, display: "block", marginBottom: 8, fontWeight: 600 }}>
              Paste URLs (one per line) or upload CSV/TXT
            </label>
            <textarea
              onChange={handlePaste}
              placeholder="https://example.com&#10;suspicious-site.tk&#10;phishing-attempt.xyz"
              rows={8}
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                borderRadius: 10, color: T.white, fontSize: 13,
                fontFamily: "'Vrikaan Mono', monospace", outline: "none", resize: "vertical",
                boxSizing: "border-box", marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: "none" }} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: "10px 16px", borderRadius: 8,
                  background: "rgba(99,102,241,0.1)", border: `1px solid ${T.border}`,
                  color: T.cyan, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >📁 Upload CSV</button>
              <span style={{ fontSize: 12, color: T.muted, flex: 1 }}>
                {urls.length > 0 && `${urls.length} URL${urls.length !== 1 ? "s" : ""} ready`}
              </span>
              <button
                onClick={runScan}
                disabled={scanning || urls.length === 0}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  background: scanning || urls.length === 0 ? "rgba(99,102,241,0.4)" : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: scanning || urls.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "'Vrikaan Sans', sans-serif",
                }}
              >
                {scanning ? `Scanning… ${progress}%` : `Scan ${urls.length} URLs`}
              </button>
            </div>
            {error && <div style={{ marginTop: 12, fontSize: 13, color: T.orange }}>{error}</div>}
          </div>

          {/* Progress bar */}
          {scanning && (
            <div style={{ height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`,
                transition: "width 0.3s ease",
              }} />
            </div>
          )}

          {/* Results */}
          {urls.length > 0 && (
            <div style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, overflow: "hidden", marginBottom: 20,
            }}>
              <div style={{
                padding: "12px 18px",
                background: "rgba(15,23,42,0.6)",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>
                  Results: <span style={{ color: T.green }}>{okCount} clean</span>
                  {failCount > 0 && <span> · <span style={{ color: T.red }}>{failCount} failed</span></span>}
                  <span style={{ color: T.muted, fontWeight: 400 }}> / {urls.length}</span>
                </div>
                {Object.keys(results).length > 0 && (
                  <button
                    onClick={exportCSV}
                    style={{
                      padding: "6px 14px", borderRadius: 6,
                      background: "rgba(34,197,94,0.1)", border: `1px solid ${T.green}40`,
                      color: T.green, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >📥 Export CSV</button>
                )}
              </div>
              {urls.map((u) => {
                const r = results[u];
                return (
                  <div key={u} style={{
                    padding: "12px 18px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: !r ? T.muted : r.ok ? T.green : T.red,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 13, color: T.white,
                        fontFamily: "'Vrikaan Mono', monospace",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{u}</span>
                    </div>
                    <span style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>
                      {!r ? (scanning ? "queued" : "—") : r.ok ? (r.data.threats?.length ? `⚠ ${r.data.threats.length} threats` : "✓ clean") : "✗ failed"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upgrade nudge */}
          {!isPro && (
            <div style={{
              padding: 20, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.06))",
              border: `1px solid ${T.accent}30`,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: T.white, margin: "0 0 12px" }}>
                Need to scan more than {MAX_FREE} URLs? Upgrade to scan up to <b style={{ color: T.cyan }}>{MAX_PRO}</b> per batch.
              </p>
              <a href="/pricing" style={{
                display: "inline-block", padding: "8px 18px", borderRadius: 8,
                background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>See Plans →</a>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
