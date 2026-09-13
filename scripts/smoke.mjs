/**
 * Post-deploy smoke test. Invokes the functions a build never exercises.
 *
 * On 12 Sep a firebase-admin bump left every function that imports the Admin
 * SDK crashing on load (FUNCTION_INVOCATION_FAILED) for 53 minutes. Tests,
 * lint, the build and the preview deployment were all green, because none of
 * them ever calls a serverless function — the crash only happens when one is
 * invoked. This does exactly that, once per deploy.
 *
 * Every check is chosen to reach a different import graph without side
 * effects:
 *
 *   /                          static site is served
 *   /api/tools?tool=whois      tools.js -> Admin SDK, quota, cron auth
 *   /api/verify-payment  {}    _grantPlan.js -> Admin SDK. An empty body
 *                              returns 400 before any Cashfree call, so it
 *                              proves the module loads without touching money.
 *   /api/chat                  _firebaseAdmin + _quota + the LLM provider
 *   /api/ssl                   a route with no Admin SDK, as a control
 *
 * Usage:
 *   node scripts/smoke.mjs https://www.vrikaan.com
 *   SMOKE_BYPASS=<secret> node scripts/smoke.mjs https://<preview>.vercel.app
 *
 * SMOKE_BYPASS is Vercel's "Protection Bypass for Automation" secret. Preview
 * and per-deployment URLs sit behind Deployment Protection and return 401
 * without it; the public custom domain does not need it.
 *
 * Exits 1 if any check fails.
 */

const base = (process.argv[2] || process.env.SMOKE_URL || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: node scripts/smoke.mjs <base-url>");
  process.exit(2);
}

const headers = { "Content-Type": "application/json" };
if (process.env.SMOKE_BYPASS) headers["x-vercel-protection-bypass"] = process.env.SMOKE_BYPASS;

const CRASH = /FUNCTION_INVOCATION_FAILED|FUNCTION_INVOCATION_TIMEOUT|A server error has occurred/i;

/**
 * name, method, path, body, and `ok(status, text)` deciding pass/fail.
 * Statuses that mean "reached the handler and it answered sensibly" pass even
 * when they are not 200 — a 402 quota refusal is the function working.
 */
const CHECKS = [
  {
    name: "site",
    method: "GET",
    path: "/",
    ok: (s) => s === 200,
  },
  {
    name: "tools (Admin SDK)",
    method: "POST",
    path: "/api/tools?tool=whois",
    body: { domain: "example.com" },
    ok: (s, t) => (s === 200 || s === 429) && !CRASH.test(t),
  },
  {
    name: "grant path (Admin SDK)",
    method: "POST",
    path: "/api/verify-payment",
    body: {},
    // 400 "Missing orderId" is the healthy answer: the module loaded and the
    // handler ran. Anything 5xx means _grantPlan.js failed to import.
    ok: (s, t) => (s === 400 || s === 429) && !CRASH.test(t),
  },
  {
    name: "chat (Admin SDK + LLM)",
    method: "POST",
    path: "/api/chat",
    body: { message: "Reply with the single word: ok", history: [], context: { path: "/" } },
    // 402/429 are quota answers from a working function. 502 means the LLM
    // provider refused — the site is up but the assistant is not, which is
    // still worth failing on.
    ok: (s, t) => [200, 402, 429].includes(s) && !CRASH.test(t),
  },
  {
    name: "ssl (control, no Admin SDK)",
    method: "GET",
    path: "/api/ssl?host=example.com",
    ok: (s, t) => (s === 200 || s === 429) && !CRASH.test(t),
  },
];

async function run(check) {
  const res = await fetch(base + check.path, {
    method: check.method,
    headers,
    body: check.body ? JSON.stringify(check.body) : undefined,
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  return { status: res.status, text };
}

console.log(`Smoke test: ${base}\n`);

let failed = 0;
for (const check of CHECKS) {
  let result;
  // One retry: a freshly aliased deployment can serve the previous build for
  // a few seconds, and LLM providers blip.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      result = await run(check);
    } catch (e) {
      result = { status: 0, text: e.message };
    }
    if (check.ok(result.status, result.text)) break;
    if (attempt === 1) await new Promise((r) => setTimeout(r, 8000));
  }

  const pass = check.ok(result.status, result.text);
  if (!pass) failed++;

  const detail = pass ? "" : `  ${result.text.replace(/\s+/g, " ").slice(0, 140)}`;
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${String(result.status).padEnd(4)} ${check.name}${detail}`);

  if (result.status === 401 && !process.env.SMOKE_BYPASS) {
    console.log("        (401 — this URL is behind Vercel Deployment Protection; set SMOKE_BYPASS)");
  }
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
