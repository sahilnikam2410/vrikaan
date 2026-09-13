/**
 * Replay plan grants for orders that were paid while the grant path was down.
 *
 * Context: on 12 Sep 2026 the firebase-admin 13 -> 14 bump took every
 * Admin-SDK function out with FUNCTION_INVOCATION_FAILED for ~53 minutes
 * (18:03–18:56 UTC). Both grant paths — /api/verify-payment on the browser
 * redirect and /api/cashfree-webhook server-to-server — import _grantPlan.js,
 * so anyone who paid in that window was charged by Cashfree and granted
 * nothing.
 *
 * This re-runs /api/verify-payment for a list of order ids. That endpoint
 * re-fetches the order from Cashfree, confirms it is actually PAID, and grants
 * through the same idempotent orders/{orderId} transaction the live flow uses.
 * Replaying an order that already granted is a no-op — it reports "already"
 * and changes nothing, so running this over a wider window than necessary is
 * safe.
 *
 * Nothing here needs credentials. The order ids are not secret, and the
 * Cashfree key stays server-side where it already lives.
 *
 * Usage:
 *   node scripts/replay-grants.mjs ORDER_ID [ORDER_ID...]
 *   node scripts/replay-grants.mjs --file orders.txt      (one id per line)
 *   cat ids.txt | node scripts/replay-grants.mjs --stdin
 *
 * Options:
 *   --base <url>   target host (default https://www.vrikaan.com)
 *   --dry          list what would be replayed, send nothing
 *
 * Getting the ids: Cashfree dashboard -> Payments -> filter the window ->
 * export. Any column of order ids works; blank lines and a header row are
 * ignored.
 */

import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(name);

const BASE = (opt("--base", "https://www.vrikaan.com") || "").replace(/\/$/, "");
const DRY = has("--dry");

async function readIds() {
  if (has("--stdin")) {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return split(Buffer.concat(chunks).toString("utf8"));
  }
  const file = opt("--file");
  if (file) return split(fs.readFileSync(file, "utf8"));
  return args.filter((a) => !a.startsWith("--") && a !== BASE);
}

function split(text) {
  return text
    .split(/[\s,;]+/)
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    // Cashfree order ids are opaque; anything short or obviously a header is
    // dropped rather than sent to the API.
    .filter((s) => s.length >= 6 && !/^order[_ ]?id$/i.test(s));
}

const ids = [...new Set(await readIds())];

if (!ids.length) {
  console.error("No order ids given. See the header of this file for usage.");
  process.exit(1);
}

console.log(`${DRY ? "Would replay" : "Replaying"} ${ids.length} order(s) against ${BASE}\n`);

const tally = { granted: 0, already: 0, noUid: 0, skipped: 0, unpaid: 0, failed: 0 };

for (const orderId of ids) {
  if (DRY) { console.log(`  ${orderId}`); continue; }

  let line;
  try {
    const r = await fetch(`${BASE}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const body = await r.json().catch(() => ({}));

    if (r.status === 429) {
      // The endpoint allows 10/min per IP. Wait it out rather than skipping.
      const wait = (Number(body.retryAfter) || 60) + 1;
      console.log(`  ${orderId}  rate limited, waiting ${wait}s`);
      await new Promise((res) => setTimeout(res, wait * 1000));
      ids.push(orderId); // retry at the end
      continue;
    }

    if (!r.ok) {
      tally.failed++;
      line = `FAILED   ${r.status} ${body.error || ""}${body.status ? ` (order ${body.status})` : ""}`;
      if (/not completed/i.test(body.error || "")) { tally.failed--; tally.unpaid++; line = `NOT PAID ${body.status || ""}`; }
    } else if (body.already) {
      tally.already++; line = `already  plan ${body.plan || "?"} — granted before, unchanged`;
    } else if (body.granted) {
      tally.granted++; line = `GRANTED  plan ${body.plan || "?"} until ${body.expiresAt || "?"}`;
    } else if (body.noUid) {
      tally.noUid++; line = `NO UID   paid but the order carries no user — needs manual attribution`;
    } else {
      tally.skipped++; line = `skipped  ${body.skipped || "not a plan order"}`;
    }
  } catch (e) {
    tally.failed++;
    line = `FAILED   ${e.message}`;
  }

  console.log(`  ${orderId.padEnd(28)} ${line}`);
  // Stay under the 10/min per-IP limit on /api/verify-payment.
  await new Promise((res) => setTimeout(res, 6500));
}

if (DRY) process.exit(0);

console.log(`
Summary
  granted now      ${tally.granted}   <- these were the gap
  already granted  ${tally.already}
  paid, no uid     ${tally.noUid}   <- grant by hand, the order has no user attached
  not a plan order ${tally.skipped}
  not paid         ${tally.unpaid}
  failed           ${tally.failed}
`);

if (tally.noUid || tally.failed) process.exitCode = 1;
