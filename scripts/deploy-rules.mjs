/**
 * Release firestore.rules through the Admin SDK's Security Rules API.
 *
 * Why not `firebase deploy --only firestore:rules`: the CLI first asks the
 * Service Usage API whether Firestore is enabled on the project, and that call
 * needs serviceusage.services.get. The project's Admin SDK service account
 * does not hold it, so the CLI fails with a 403 before it ever reaches the
 * rules:
 *
 *   Permission denied to get service [firestore.googleapis.com]
 *
 * Releasing a ruleset only needs the firebaserules permissions that account
 * already has, so this skips the pre-check instead of widening IAM for it.
 *
 * The source is compiled server-side before it is released; a syntax error
 * throws here and nothing is published.
 *
 * Reads the service-account JSON from FIREBASE_ADMIN_KEY (same secret the
 * nightly backup uses) and the rules from ./firestore.rules.
 *
 *   node scripts/deploy-rules.mjs          release
 *   node scripts/deploy-rules.mjs --check  compile only, release nothing
 */
import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";

const CHECK_ONLY = process.argv.includes("--check");

const raw = process.env.FIREBASE_ADMIN_KEY;
if (!raw) {
  console.error("FIREBASE_ADMIN_KEY is not set.");
  process.exit(1);
}

let key;
try {
  key = JSON.parse(raw.trim());
} catch {
  console.error("FIREBASE_ADMIN_KEY is not valid JSON.");
  process.exit(1);
}
if (key.private_key?.includes("\\n")) key.private_key = key.private_key.replace(/\\n/g, "\n");

initializeApp({ credential: cert(key), projectId: key.project_id });
const rules = getSecurityRules();
const source = fs.readFileSync("firestore.rules", "utf8");

console.log(`project   ${key.project_id}`);
console.log(`account   ${key.client_email}`);
console.log(`rules     ${source.length} bytes`);

try {
  if (CHECK_ONLY) {
    // createRuleset compiles and stores a ruleset without releasing it.
    const rs = await rules.createRuleset({ source: { name: "firestore.rules", content: source } });
    console.log(`compiled  ${rs.name}  (not released — --check)`);
    process.exit(0);
  }

  const before = await rules.getFirestoreRuleset().catch(() => null);
  const released = await rules.releaseFirestoreRulesetFromSource(source);

  console.log(`previous  ${before?.name ?? "(none)"}`);
  console.log(`released  ${released.name}`);
  console.log(`created   ${released.createTime}`);
} catch (e) {
  console.error(`FAILED    ${e.code || ""} ${e.message}`);
  process.exit(1);
}
