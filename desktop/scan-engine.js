/**
 * VRIKAAN Desktop — scan engine.
 *
 * Native-side file walker + hasher. Calls the web API at vrikaan.com/api/tools
 * to check each hash against the malware DB. Privacy preserved: only hashes
 * cross the network, file contents never leave the device.
 *
 * Public API:
 *   scanPath(targetPath, opts)
 *   computeHash(filePath)
 *   watchDownloads(dir, onNewFile)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const API_BASE = "https://www.vrikaan.com/api/tools";

// Don't scan these (huge, irrelevant, or system-critical)
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".cache", "AppData", "Library", "System",
  "Windows", "Program Files", "Program Files (x86)", ".npm", ".gradle",
  "venv", "__pycache__", "$Recycle.Bin", "System Volume Information",
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB — skip larger
const SCAN_EXTENSIONS = new Set([
  ".exe", ".dll", ".msi", ".bat", ".cmd", ".ps1", ".sh", ".js", ".vbs",
  ".apk", ".ipa", ".dmg", ".pkg",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".jar", ".class",
]);

/**
 * Walk a path (file or directory) and scan everything.
 *
 * opts:
 *   onProgress(state) — { phase, current, total }
 *   maxFiles (default 5000)
 *   extensionsOnly (default true) — only scan executable/archive/doc extensions
 */
async function scanPath(targetPath, opts = {}) {
  const { onProgress = () => {}, maxFiles = 5000, extensionsOnly = true } = opts;

  if (!fs.existsSync(targetPath)) {
    return { error: `Path not found: ${targetPath}` };
  }

  const stat = fs.statSync(targetPath);
  const filesToScan = [];

  if (stat.isFile()) {
    if (stat.size <= MAX_FILE_SIZE) filesToScan.push(targetPath);
  } else if (stat.isDirectory()) {
    walkDir(targetPath, filesToScan, { maxFiles, extensionsOnly });
  }

  const result = {
    target: targetPath,
    total: filesToScan.length,
    scanned: 0,
    threats: 0,
    suspicious: 0,
    clean: 0,
    unknown: 0,
    error: 0,
    files: [],
    startedAt: Date.now(),
  };

  onProgress({ phase: "hashing", current: 0, total: filesToScan.length });

  // Hash + check in serial batches (avoid API rate limit + memory spikes)
  const BATCH = 5;
  for (let i = 0; i < filesToScan.length; i += BATCH) {
    const batch = filesToScan.slice(i, i + BATCH);
    await Promise.all(batch.map(async (filePath) => {
      try {
        const fileStat = fs.statSync(filePath);
        const hash = await computeHash(filePath);
        const verdict = await checkHash(hash);
        const entry = {
          path: filePath,
          name: path.basename(filePath),
          size: fileStat.size,
          hash,
          status: verdict.status || "unknown",
          signature: verdict.signature || null,
        };
        result.files.push(entry);
        result[entry.status] = (result[entry.status] || 0) + 1;
        if (entry.status === "malicious") result.threats++;
      } catch (e) {
        result.files.push({ path: filePath, status: "error", error: e.message });
        result.error++;
      }
      result.scanned++;
      onProgress({ phase: "scanning", current: result.scanned, total: filesToScan.length });
    }));
  }

  result.finishedAt = Date.now();
  result.durationMs = result.finishedAt - result.startedAt;
  onProgress({ phase: "done", current: result.scanned, total: filesToScan.length });
  return result;
}

function walkDir(dir, out, opts, depth = 0) {
  if (depth > 20) return; // safety cap on recursion
  if (out.length >= opts.maxFiles) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }

  for (const entry of entries) {
    if (out.length >= opts.maxFiles) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkDir(full, out, opts, depth + 1);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (opts.extensionsOnly && !SCAN_EXTENSIONS.has(ext)) continue;
      try {
        const stat = fs.statSync(full);
        if (stat.size > MAX_FILE_SIZE) continue;
        if (stat.size === 0) continue;
        out.push(full);
      } catch {}
    }
  }
}

/**
 * SHA-256 of a file. Streams the file — works for any size up to MAX_FILE_SIZE.
 */
function computeHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

/**
 * Check a hash against VRIKAAN's malware DB via /api/tools?tool=file-hash-check.
 * Returns { status: 'clean' | 'suspicious' | 'malicious' | 'unknown', signature? }
 */
function checkHash(hash) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ hash });
    const req = https.request(
      `${API_BASE}?tool=file-hash-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "VRIKAAN-Desktop/0.1",
        },
        timeout: 10000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve({ status: "unknown" }); }
        });
      }
    );
    req.on("error", () => resolve({ status: "unknown" }));
    req.on("timeout", () => { req.destroy(); resolve({ status: "unknown" }); });
    req.write(body);
    req.end();
  });
}

/**
 * Watch a directory for new files. Fires onNewFile(fullPath) per event.
 * Uses fs.watch (cross-platform, native), de-bounces 1 sec per file.
 */
function watchDownloads(dir, onNewFile) {
  const seen = new Map(); // path → timestamp
  const DEBOUNCE_MS = 1000;
  let watcher;
  try {
    watcher = fs.watch(dir, { persistent: true }, (eventType, filename) => {
      if (!filename) return;
      const full = path.join(dir, filename);
      if (!fs.existsSync(full)) return; // file deleted
      try {
        const stat = fs.statSync(full);
        if (!stat.isFile()) return;
        const now = Date.now();
        const last = seen.get(full) || 0;
        if (now - last < DEBOUNCE_MS) return;
        seen.set(full, now);
        // Wait a bit so partial downloads finish
        setTimeout(() => {
          if (fs.existsSync(full)) onNewFile(full);
        }, 1500);
      } catch {}
    });
  } catch (e) {
    console.warn("watchDownloads failed:", e.message);
    return null;
  }
  return {
    stop: () => watcher?.close(),
  };
}

module.exports = { scanPath, computeHash, watchDownloads, checkHash };
