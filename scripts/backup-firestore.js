#!/usr/bin/env node
/**
 * VRIKAAN Firestore backup script.
 *
 * Exports all top-level collections (and their subcollections) to timestamped
 * JSON files under ./backups/YYYY-MM-DD/. Intended to run nightly via a host
 * cron, GitHub Actions scheduled workflow, or Cloud Scheduler.
 *
 * Usage:
 *   1. Place your Firebase Admin service account JSON at the project root as
 *      `serviceAccount.json` (gitignored) OR set FIREBASE_ADMIN_KEY to the
 *      full JSON string in the environment.
 *   2. Install dependencies:         npm ci --omit=dev
 *   3. Run:                           node scripts/backup-firestore.js
 *
 * Scheduling examples (see PRODUCTION_RUNBOOK.md section 6 for details):
 *   - GitHub Actions:  .github/workflows/backup.yml with `cron: '0 3 * * *'`
 *   - Linux cron:      0 3 * * * cd /path/to/VRIKAAN && node scripts/backup-firestore.js
 *   - Windows Task:    schtasks /create /tn "SecuvionBackup" /tr ...
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Modular Admin SDK entry points. The namespaced default export this script
// used (admin.credential.cert, admin.firestore()) was removed in
// firebase-admin 14 — and because the workflow installed the SDK unpinned, the
// nightly backup picked up 14 on its own and failed on 11 and 12 Sep with
// "Cannot read properties of undefined (reading 'cert')". These imports work
// on 13 and 14 alike.
let initializeApp, cert, getFirestore;
try {
  ({ initializeApp, cert } = await import("firebase-admin/app"));
  ({ getFirestore } = await import("firebase-admin/firestore"));
} catch {
  console.error("firebase-admin is not installed. Run: npm ci --omit=dev");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function loadServiceAccount() {
  // `::error::` makes this surface as a GitHub Actions annotation, not just a log line.
  if (process.env.FIREBASE_ADMIN_KEY) {
    const raw = process.env.FIREBASE_ADMIN_KEY.trim();
    // Allow either raw JSON or base64-encoded JSON (matches the Vercel SA handling).
    const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    try {
      const sa = JSON.parse(text);
      if (!sa.private_key || !sa.client_email) {
        console.error("::error::FIREBASE_ADMIN_KEY parsed but is missing private_key/client_email — paste the FULL service-account JSON.");
        process.exit(1);
      }
      return sa;
    } catch (e) {
      console.error(`::error::FIREBASE_ADMIN_KEY is not valid JSON (${e.message}). Paste the full service-account JSON as the secret value (one line).`);
      process.exit(1);
    }
  }
  const localPath = path.join(projectRoot, "serviceAccount.json");
  try {
    const raw = await fs.readFile(localPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.error("::error::FIREBASE_ADMIN_KEY secret is not set (and no local serviceAccount.json). Add it in GitHub → Settings → Secrets and variables → Actions → New repository secret, name FIREBASE_ADMIN_KEY, value = full service-account JSON.");
    process.exit(1);
  }
}

async function exportCollection(colRef, outDir) {
  const snapshot = await colRef.get();
  const docs = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    docs.push({ id: doc.id, data });

    // Recursively export subcollections
    const subCols = await doc.ref.listCollections();
    for (const sub of subCols) {
      const subDir = path.join(outDir, doc.id, sub.id);
      await fs.mkdir(subDir, { recursive: true });
      await exportCollection(sub, subDir);
    }
  }
  const filePath = path.join(outDir, "_documents.json");
  await fs.writeFile(filePath, JSON.stringify(docs, null, 2), "utf-8");
  console.log(`  ✓ ${colRef.path} — ${docs.length} docs`);
  return docs.length;
}

async function main() {
  const serviceAccount = await loadServiceAccount();
  initializeApp({ credential: cert(serviceAccount) });

  const db = getFirestore();
  const date = new Date().toISOString().slice(0, 10);
  const backupDir = path.join(projectRoot, "backups", date);
  await fs.mkdir(backupDir, { recursive: true });

  console.log(`\nSECUVION Firestore backup → ${backupDir}\n`);

  const collections = await db.listCollections();
  let total = 0;
  for (const col of collections) {
    const outDir = path.join(backupDir, col.id);
    await fs.mkdir(outDir, { recursive: true });
    total += await exportCollection(col, outDir);
  }

  const summary = {
    timestamp: new Date().toISOString(),
    collections: collections.map((c) => c.id),
    totalDocuments: total,
  };
  await fs.writeFile(
    path.join(backupDir, "_summary.json"),
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log(`\n✓ Backup complete. ${total} documents across ${collections.length} collections.`);
  console.log(`  Location: ${backupDir}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
