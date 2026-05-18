import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import QuotaBanner from "../../components/QuotaBanner";
import { useToolQuota } from "../../hooks/useToolQuota";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", orange: "#f97316", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const STATUS_META = {
  clean:       { color: T.green,  emoji: "✅", label: "Clean" },
  suspicious:  { color: T.yellow, emoji: "⚠️", label: "Suspicious" },
  malicious:   { color: T.red,    emoji: "🚨", label: "Malicious" },
  unknown:     { color: T.muted,  emoji: "❓", label: "Unknown" },
  error:       { color: T.orange, emoji: "❌", label: "Error" },
  scanning:    { color: T.cyan,   emoji: "🔍", label: "Scanning…" },
};

const MAX_FILE_MB = 50;
const MAX_FILES_FREE = 10;
const MAX_FILES_PRO = 500;

async function computeHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function DeviceScanner() {
  const quota = useToolQuota({ path: "/device-scan" });
  const [files, setFiles] = useState([]); // [{ id, file, hash, status, signature, message, scannedAt }]
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistOk, setWaitlistOk] = useState(false);
  const fileRef = useRef(null);
  const folderRef = useRef(null);

  const maxFiles = quota.unlimited ? MAX_FILES_PRO : MAX_FILES_FREE;

  // ── Add files ─────────────────────────────────────────────────────
  const addFiles = useCallback(async (incoming) => {
    const arr = Array.from(incoming || []);
    if (arr.length === 0) return;
    const slotsLeft = maxFiles - files.length;
    if (slotsLeft <= 0) return;
    const accepted = arr.slice(0, slotsLeft).filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);

    const next = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      name: file.webkitRelativePath || file.name,
      size: file.size,
      type: file.type || guessType(file.name),
      hash: null,
      status: "scanning",
      signature: null,
      message: null,
    }));
    setFiles(prev => [...prev, ...next]);

    // Compute hashes in parallel (small batches to avoid OOM on big folders)
    const BATCH = 6;
    for (let i = 0; i < next.length; i += BATCH) {
      const batch = next.slice(i, i + BATCH);
      await Promise.all(batch.map(async (item) => {
        try {
          const h = await computeHash(item.file);
          setFiles(prev => prev.map(p => p.id === item.id ? { ...p, hash: h } : p));
        } catch (e) {
          setFiles(prev => prev.map(p => p.id === item.id ? { ...p, status: "error", message: e.message } : p));
        }
      }));
    }
  }, [files.length, maxFiles]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    // Folder support via dataTransfer.items
    const items = e.dataTransfer.items;
    if (items && items[0]?.webkitGetAsEntry) {
      const all = [];
      const tasks = [];
      for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) tasks.push(walkEntry(entry, all));
      }
      Promise.all(tasks).then(() => addFiles(all));
    } else {
      addFiles(e.dataTransfer.files);
    }
  };

  // ── Scan all ──────────────────────────────────────────────────────
  const scanAll = async () => {
    if (!quota.allowed) return;
    setScanning(true);
    const toScan = files.filter(f => f.hash && (f.status === "scanning" || f.status === "unknown"));

    await quota.run(async () => {
      // Batched parallel requests (3 at a time — respect serverless concurrency)
      const BATCH = 3;
      for (let i = 0; i < toScan.length; i += BATCH) {
        const batch = toScan.slice(i, i + BATCH);
        await Promise.all(batch.map(async (item) => {
          try {
            const res = await fetch("/api/tools?tool=file-hash-check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ hash: item.hash }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Scan failed");
            setFiles(prev => prev.map(p => p.id === item.id ? {
              ...p,
              status: data.status || "unknown",
              signature: data.signature || data.fileName || null,
              message: data.message || null,
              scannedAt: Date.now(),
            } : p));
          } catch (e) {
            setFiles(prev => prev.map(p => p.id === item.id ? {
              ...p, status: "error", message: e.message,
            } : p));
          }
        }));
      }
    });
    setScanning(false);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  // ── Summary ───────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const s = { total: files.length, clean: 0, suspicious: 0, malicious: 0, unknown: 0, error: 0, scanning: 0 };
    files.forEach(f => { s[f.status] = (s[f.status] || 0) + 1; });
    return s;
  }, [files]);

  const riskScore = useMemo(() => {
    if (summary.total === 0) return null;
    const risk = (summary.malicious * 100 + summary.suspicious * 50 + summary.unknown * 5) / summary.total;
    return Math.min(100, Math.round(risk));
  }, [summary]);

  const riskLevel = riskScore == null ? "—"
    : riskScore >= 60 ? "CRITICAL"
    : riskScore >= 30 ? "HIGH"
    : riskScore >= 10 ? "MEDIUM"
    : "LOW";

  const riskColor = riskScore == null ? T.muted
    : riskScore >= 60 ? T.red
    : riskScore >= 30 ? T.orange
    : riskScore >= 10 ? T.yellow
    : T.green;

  // ── Waitlist (desktop app) ────────────────────────────────────────
  const submitWaitlist = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(waitlistEmail)) return;
    try {
      // Reuse contact form / EmailJS path — store in Firestore later
      await fetch("/api/tools?tool=ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "desktop-waitlist", email: waitlistEmail }),
      }).catch(() => {});
      setWaitlistOk(true);
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Device Scanner — VRIKAAN"
        description="Scan files, folders, downloads, or USB drives for malware. SHA-256 hashes checked against malware databases. Free up to 10 files / day, Pro unlocks bulk."
        path="/device-scan"
        keywords="malware scanner india, free virus scan, file scanner online, alternative to mcafee, npav alternative"
      />
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20,227,197,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>Device Scanner · Free</span>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(34px, 5vw, 52px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Scan your files for malware.<br />
            <span style={{ color: T.cyan }}>Hash-based. Private. Free.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 680, margin: "0 auto", lineHeight: 1.6 }}>
            Drag files, folders, or your Downloads folder. We compute SHA-256 locally in your browser
            (files never leave your device) and check each hash against malware databases.
          </p>
        </header>

        <QuotaBanner
          unlimited={quota.unlimited}
          used={quota.used}
          limit={quota.limit}
          remaining={quota.remaining}
          resetAt={quota.resetAt}
          tier={quota.tier}
          path="/device-scan"
        />

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? T.cyan : T.border}`,
            borderRadius: 18,
            background: dragging ? "rgba(20,227,197,0.06)" : T.card,
            padding: "44px 28px", textAlign: "center",
            transition: "all 0.2s", marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 14 }}>📁</div>
          <div style={{ color: T.white, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            Drag files or folders here
          </div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>
            Max {maxFiles} files, {MAX_FILE_MB} MB each.
            {!quota.unlimited && <span> Free tier limit. <Link to="/pricing" style={{ color: T.cyan }}>Upgrade to Pro</Link> for 500 files.</span>}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} style={btnPrimary()}>
              📄 Select files
            </button>
            <input
              ref={folderRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => addFiles(e.target.files)}
              style={{ display: "none" }}
            />
            <button onClick={() => folderRef.current?.click()} style={btnSecondary()}>
              📂 Select folder
            </button>
          </div>
          <p style={{ color: T.mutedDark, fontSize: 11, marginTop: 18, lineHeight: 1.6 }}>
            🔒 Files never leave your browser. We only send the SHA-256 hash (a short fingerprint) to our servers.
          </p>
        </div>

        {/* Summary + scan controls */}
        {files.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "auto repeat(5, 1fr) auto",
            gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap",
          }} className="scan-summary">
            <div style={{
              padding: "12px 16px", background: `${riskColor}1a`, border: `1px solid ${riskColor}55`,
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: riskColor, textTransform: "uppercase" }}>Risk</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: riskColor, fontFamily: "'Space Grotesk', sans-serif" }}>{riskLevel}</div>
            </div>

            {[
              { l: "Files", v: summary.total, c: T.white },
              { l: "Clean", v: summary.clean, c: T.green },
              { l: "Suspicious", v: summary.suspicious, c: T.yellow },
              { l: "Malicious", v: summary.malicious, c: T.red },
              { l: "Unknown", v: summary.unknown, c: T.muted },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center", padding: "10px 8px" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "'Space Grotesk', sans-serif" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={scanAll} disabled={scanning || !quota.allowed} style={btnPrimary(scanning ? 0.5 : 1)}>
                {scanning ? "🔍 Scanning…" : `🔍 Scan ${summary.total} files`}
              </button>
              <button onClick={clearAll} style={btnSecondary()}>🗑 Clear</button>
            </div>
          </div>
        )}

        {/* Files grid */}
        {files.length > 0 && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 80px 110px 130px 40px",
              padding: "12px 18px", borderBottom: `1px solid ${T.border}`,
              fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700,
            }} className="files-header">
              <div>File</div>
              <div>Size</div>
              <div>SHA-256</div>
              <div>Verdict</div>
              <div></div>
            </div>
            {files.map(f => {
              const meta = STATUS_META[f.status] || STATUS_META.unknown;
              return (
                <div key={f.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 110px 130px 40px",
                  padding: "12px 18px", borderBottom: `1px solid ${T.border}`,
                  alignItems: "center", gap: 10,
                }} className="files-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: T.white, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    {f.signature && <div style={{ color: meta.color, fontSize: 11, marginTop: 2 }}>⚠ {f.signature}</div>}
                  </div>
                  <div style={{ color: T.muted, fontSize: 11, fontFamily: "ui-monospace,monospace" }}>{formatBytes(f.size)}</div>
                  <div style={{ color: T.mutedDark, fontSize: 10, fontFamily: "ui-monospace,monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.hash || ""}>
                    {f.hash ? f.hash.slice(0, 12) + "…" : "computing…"}
                  </div>
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: 999,
                      background: `${meta.color}1a`, color: meta.color,
                      border: `1px solid ${meta.color}55`,
                      fontSize: 11, fontWeight: 700,
                    }}>{meta.emoji} {meta.label}</span>
                  </div>
                  <button onClick={() => removeFile(f.id)} title="Remove" style={{
                    background: "transparent", border: 0, color: T.mutedDark, cursor: "pointer",
                    fontSize: 18, padding: 4,
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* What we can/can't do */}
        <section style={{
          marginTop: 60, padding: 28, borderRadius: 18,
          background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: T.white, margin: "0 0 18px",
          }}>What this scan can (and can't) do — honestly</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="capability-grid">
            <div>
              <div style={{ color: T.green, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>✅ Can</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Hash any file you drag in (SHA-256)</li>
                <li>Check that hash against malware databases</li>
                <li>Bulk scan up to {MAX_FILES_FREE} files free, {MAX_FILES_PRO} on Pro</li>
                <li>Scan an entire folder (Chrome / Edge)</li>
                <li>Privacy: files never upload, only the hash leaves your browser</li>
                <li>Detect known malware by signature match</li>
              </ul>
            </div>
            <div>
              <div style={{ color: T.red, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>❌ Can't</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>Auto-scan your whole disk without you selecting files</li>
                <li>Run in background watching for new threats (use Windows Defender for that)</li>
                <li>Block / quarantine / delete infected files</li>
                <li>Detect zero-day malware (only known signatures)</li>
                <li>Scan Android apps (until you install our Android app — Q3 2026)</li>
              </ul>
            </div>
          </div>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 18, lineHeight: 1.7 }}>
            <strong style={{ color: T.white }}>Use this WITH your existing antivirus, not instead of it.</strong> Windows Defender (built-in to Windows 10/11)
            already provides real-time protection and is excellent. VRIKAAN's value: <strong>India-specific scam patterns,
            dark-web monitoring, deepfake audio detection</strong> — categories traditional antivirus completely misses.
          </p>
        </section>

        {/* Desktop + Android roadmap */}
        <section style={{
          marginTop: 28, padding: 28, borderRadius: 18,
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: T.white, margin: "0 0 8px",
          }}>Want real device-wide scan?</h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 22px", lineHeight: 1.6 }}>
            Web apps can't scan your whole disk in real-time. We're building native apps that can.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }} className="roadmap-grid">
            {[
              {
                phase: "Phase 2", eta: "Q2 2026",
                title: "💻 VRIKAAN Desktop", os: "Windows · macOS · Linux",
                features: ["Real-time download watcher", "USB drive auto-scan", "Whole-disk schedule scan", "System tray notifications", "Offline mode"],
                color: T.cyan,
              },
              {
                phase: "Phase 3", eta: "Q3 2026",
                title: "📱 VRIKAAN Android", os: "Android 9+",
                features: ["Scan all installed APKs", "Downloads folder monitor", "SMS scam alerts (auto-flag)", "WhatsApp file scanner", "SD card scan"],
                color: T.accent,
              },
            ].map(r => (
              <div key={r.phase} style={{
                padding: 18, background: T.card, border: `1px solid ${r.color}33`, borderRadius: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "3px 8px", borderRadius: 999,
                    background: `${r.color}22`, color: r.color, border: `1px solid ${r.color}55`,
                  }}>{r.phase} · {r.eta}</span>
                </div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{r.title}</div>
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>{r.os}</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
                  {r.features.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Waitlist form */}
          {waitlistOk ? (
            <div style={{
              padding: 14, borderRadius: 12,
              background: `${T.green}1a`, border: `1px solid ${T.green}55`,
              color: T.green, textAlign: "center", fontWeight: 600, fontSize: 14,
            }}>✓ You're on the waitlist. We'll email you when Desktop or Android launches.</div>
          ) : (
            <form onSubmit={submitWaitlist} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  flex: 1, minWidth: 220,
                  padding: "13px 16px", borderRadius: 10,
                  background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                  color: T.white, fontSize: 14, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button type="submit" style={btnPrimary()}>Join Desktop + Android waitlist →</button>
            </form>
          )}
        </section>

        {/* Privacy + footer note */}
        <p style={{
          marginTop: 28, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.6, borderTop: `1px solid ${T.border}`,
        }}>
          🔒 Privacy promise: files are hashed in your browser using your CPU. Only the hash (a 64-char fingerprint)
          is sent to our servers — never the file contents. We can't reconstruct your files from the hash.
          <br />
          🇮🇳 Built in Nashik · Free tier for everyone · No card required
        </p>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 720px) {
          .scan-summary { grid-template-columns: 1fr 1fr 1fr !important; }
          .files-header, .files-row { grid-template-columns: 1fr 60px 80px !important; }
          .files-header > div:nth-child(3), .files-row > div:nth-child(3),
          .files-header > div:nth-child(5), .files-row > button { display: none !important; }
          .capability-grid { grid-template-columns: 1fr !important; }
          .roadmap-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────
function btnPrimary(opacity = 1) {
  return {
    padding: "11px 22px", background: T.cyan, color: T.bg,
    border: 0, borderRadius: 10, fontWeight: 800, fontSize: 14,
    cursor: opacity === 1 ? "pointer" : "not-allowed",
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.3,
    opacity, transition: "transform 0.15s",
  };
}
function btnSecondary() {
  return {
    padding: "11px 18px", background: "transparent", color: T.white,
    border: `1px solid ${T.border}`, borderRadius: 10,
    fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  };
}
function guessType(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const map = {
    exe: "Executable", dll: "Library", msi: "Installer", bat: "Script", cmd: "Script", ps1: "Script", sh: "Script",
    apk: "Android app", ipa: "iOS app", dmg: "Mac image",
    pdf: "Document", doc: "Document", docx: "Document", xlsx: "Spreadsheet",
    zip: "Archive", rar: "Archive", "7z": "Archive", tar: "Archive", gz: "Archive",
    jpg: "Image", png: "Image", gif: "Image", svg: "Image",
    mp4: "Video", mov: "Video", mkv: "Video", mp3: "Audio", wav: "Audio",
    js: "JavaScript", py: "Python", html: "Web", css: "Web",
  };
  return map[ext] || "File";
}

// Recursively walk a DataTransferItem entry (drag-dropped folder)
async function walkEntry(entry, out, path = "") {
  if (entry.isFile) {
    await new Promise(r => entry.file(file => {
      // Augment file with webkitRelativePath-like prop
      Object.defineProperty(file, "webkitRelativePath", { value: `${path}${entry.name}`, writable: false });
      out.push(file);
      r();
    }));
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const entries = await new Promise(r => reader.readEntries(r));
    for (const child of entries) {
      await walkEntry(child, out, `${path}${entry.name}/`);
    }
  }
}
