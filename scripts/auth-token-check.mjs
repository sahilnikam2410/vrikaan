/**
 * End-to-end check that the Admin SDK still verifies a real Firebase ID token.
 *
 * The other CI checks only prove the function modules LOAD. None of them hands
 * the Admin SDK a genuine, Google-signed ID token — so a firebase-admin upgrade
 * that loaded fine but broke verification would pass all of them, and every
 * signed-in user would silently be treated as a guest.
 *
 * Flow, all against the real project:
 *   1. mint a custom token for a throwaway uid (Admin SDK, service account)
 *   2. exchange it for an ID token through the Identity Toolkit REST API,
 *      exactly as the browser SDK does on sign-in
 *   3. verifyIdToken() must accept it and return that uid
 *   4. verifyIdToken() must REJECT the same token with its signature altered
 *   5. delete the throwaway user the exchange created
 *
 * Needs:
 *   FIREBASE_ADMIN_KEY   full service-account JSON (existing CI secret)
 *   FIREBASE_WEB_API_KEY optional. Firebase web API keys are public by design
 *                        (they ship in every visitor's JS bundle). If unset,
 *                        the key is read from the deployed site's bundle.
 *   SITE_URL             where to read that bundle (default www.vrikaan.com)
 *
 * Creates and deletes one Auth user per run — run it on demand, not per PR.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const UID = "ci-auth-token-check";
const SITE = (process.env.SITE_URL || "https://www.vrikaan.com").replace(/\/$/, "");

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  process.exit(1);
}

const raw = process.env.FIREBASE_ADMIN_KEY;
if (!raw) fail("FIREBASE_ADMIN_KEY is not set.");
let sa;
try { sa = JSON.parse(raw.trim()); } catch { fail("FIREBASE_ADMIN_KEY is not valid JSON."); }
if (sa.private_key?.includes("\\n")) sa.private_key = sa.private_key.replace(/\\n/g, "\n");

/** Find the public web API key in the deployed bundle, without printing it. */
async function webApiKey() {
  if (process.env.FIREBASE_WEB_API_KEY) return process.env.FIREBASE_WEB_API_KEY;
  const html = await (await fetch(`${SITE}/`)).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
  for (const a of assets) {
    const js = await (await fetch(SITE + a)).text();
    const m = js.match(/AIza[0-9A-Za-z_-]{35}/);
    if (m) return m[0];
  }
  // The config can sit in a lazily-loaded chunk; follow imports one level.
  for (const a of assets) {
    const js = await (await fetch(SITE + a)).text();
    for (const c of new Set([...js.matchAll(/["'](\/?assets\/[\w.-]+\.js)["']/g)].map((x) => x[1]))) {
      const src = await (await fetch(`${SITE}/${c.replace(/^\//, "")}`)).text();
      const m = src.match(/AIza[0-9A-Za-z_-]{35}/);
      if (m) return m[0];
    }
  }
  return null;
}

const app = initializeApp({ credential: cert(sa), projectId: sa.project_id });
const auth = getAuth(app);

console.log(`project  ${sa.project_id}`);
// firebase-admin's exports map doesn't expose package.json, so read the file
// directly — the point of printing it is to prove which SDK this run verified.
try {
  const { readFileSync } = await import("node:fs");
  const v = JSON.parse(readFileSync("node_modules/firebase-admin/package.json", "utf8")).version;
  console.log(`sdk      firebase-admin ${v}`);
} catch { /* version line is informational only */ }

let exitCode = 0;
try {
  const key = await webApiKey();
  if (!key) fail(`could not find the web API key in ${SITE}'s bundle — set FIREBASE_WEB_API_KEY`);

  // 1. custom token
  const customToken = await auth.createCustomToken(UID, { ciCheck: true });
  console.log("ok       custom token minted");

  // 2. exchange for a real ID token, as the browser does
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const body = await r.json();
  if (!r.ok || !body.idToken) fail(`token exchange failed: ${r.status} ${body.error?.message || ""}`);
  const idToken = body.idToken;
  console.log("ok       exchanged for a Google-signed ID token");

  // 3. the real check — must accept a valid token
  const decoded = await auth.verifyIdToken(idToken, true);
  if (decoded.uid !== UID) fail(`verifyIdToken returned uid ${decoded.uid}, expected ${UID}`);
  console.log(`PASS     verifyIdToken accepted a valid token (uid ${decoded.uid})`);

  // 4. and must reject a forged one
  const [h, p, s] = idToken.split(".");
  const flipped = s.slice(0, -4) + (s.slice(-4) === "AAAA" ? "BBBB" : "AAAA");
  try {
    await auth.verifyIdToken(`${h}.${p}.${flipped}`);
    exitCode = 1;
    console.error("FAIL     verifyIdToken ACCEPTED a token with a forged signature");
  } catch (e) {
    if (!String(e.code || "").startsWith("auth/")) {
      exitCode = 1;
      console.error(`FAIL     forged token raised an unexpected error: ${e.code || ""} ${e.message}`);
    } else {
      console.log(`PASS     verifyIdToken rejected a forged signature (${e.code})`);
    }
  }
} catch (e) {
  exitCode = 1;
  console.error(`FAIL     ${e.code || ""} ${e.message}`);
} finally {
  // 5. clean up the user the exchange created
  await auth.deleteUser(UID).then(
    () => console.log("ok       throwaway user deleted"),
    (e) => { if (e.code !== "auth/user-not-found") console.warn(`warn     could not delete ${UID}: ${e.message}`); },
  );
}

console.log(exitCode ? "\nAuth token check FAILED." : "\nAuth token check passed.");
process.exit(exitCode);
