// One-shot migration: SECUVION → VRIKAAN rename.
//
// Rules:
// - User-facing brand strings: replace
// - URLs (secuvion.vercel.app → vrikaan.com): replace
// - Hypothetical domain emails (*@secuvion.com → *@vrikaan.com): replace
// - Support email (secuvion@gmail.com): LEAVE UNTIL NEW INBOX EXISTS
// - localStorage keys (secuvion_*): LEAVE (would erase existing user data)
// - Firebase infra: no hardcoded references to rename
// - package-lock.json: never hand-edit; npm will refresh
//
// Run with: node scripts/migrate-rename.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const EXCLUDE_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vercel",
  ".next",
  ".cache",
]);
const EXCLUDE_FILES = new Set([
  "package-lock.json",
  "migrate-rename.mjs", // don't edit this script
]);

// File extensions we'll scan
const SCAN_EXTS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs",
  ".html", ".css", ".json", ".md", ".txt",
  ".xml", ".yaml", ".yml", ".svg",
  ".rules", ".example",
]);

// Replacements, applied in ORDER (more-specific first).
// Each: [regex or string, replacement, label]
const REPLACEMENTS = [
  // --- URLs (most specific) ---
  [/https:\/\/secuvion\.vercel\.app/g, "https://vrikaan.com", "URL https"],
  [/http:\/\/secuvion\.vercel\.app/g, "http://vrikaan.com", "URL http"],
  [/secuvion\.vercel\.app/g, "vrikaan.com", "URL bare"],

  // --- Domain emails (not the real Gmail) ---
  // Specifically @secuvion.com but preserve `secuvion@gmail.com`
  [/@secuvion\.com/g, "@vrikaan.com", "Email domain"],

  // --- Brand name (case-sensitive) ---
  [/\bSECUVION\b/g, "VRIKAAN", "Brand UPPER"],
  [/\bSecuvion\b/g, "Vrikaan", "Brand Title"],

  // --- User-facing download filenames ---
  [/"secuvion-users\.json"/g, '"vrikaan-users.json"', "Download filename"],

  // NOTE: lowercase standalone `secuvion` is used for:
  //   - localStorage keys (secuvion_* → LEAVE)
  //   - secuvion@gmail.com (support email → LEAVE)
  //   - the directory name E:\SECUVION (unchanged, local path)
  // No blanket lowercase replacement — too risky.
];

let filesChanged = 0;
let totalReplaces = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    if (EXCLUDE_FILES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SCAN_EXTS.has(ext) && entry.name !== "robots.txt" && entry.name !== ".env.example") {
        continue;
      }
      processFile(full);
    }
  }
}

function processFile(file) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return;
  }
  const original = content;
  const counts = {};
  for (const [pattern, replacement, label] of REPLACEMENTS) {
    const before = content;
    if (pattern instanceof RegExp) {
      content = content.replace(pattern, (match) => {
        counts[label] = (counts[label] || 0) + 1;
        return typeof replacement === "function" ? replacement(match) : replacement;
      });
    } else {
      while (content.includes(pattern)) {
        content = content.replace(pattern, replacement);
        counts[label] = (counts[label] || 0) + 1;
      }
    }
    // Use the regex replace return count differently:
    if (content !== before && !(pattern instanceof RegExp)) {
      // already counted above
    }
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    const rel = path.relative(ROOT, file);
    const summary = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k}:${n}`)
      .join(" ");
    console.log(`  ✓ ${rel}  (${summary})`);
    filesChanged++;
    totalReplaces += Object.values(counts).reduce((a, b) => a + b, 0);
  }
}

console.log("SECUVION → VRIKAAN migration");
console.log("---");
walk(ROOT);
console.log("---");
console.log(`Modified ${filesChanged} files, ${totalReplaces} replacements.`);
