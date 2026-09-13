/**
 * Import every serverless function module, the way the runtime does on a
 * cold start, and fail on the first one that throws while loading.
 *
 * The 12 Sep outage was a load-time crash: firebase-admin 14 made every
 * function importing the Admin SDK die with FUNCTION_INVOCATION_FAILED before
 * its handler ran. Nothing in CI caught it because nothing imported the
 * functions — the build bundles the site, the tests import a few helpers, and
 * a Vercel build never executes a function.
 *
 * Importing each module is enough to reproduce that class of failure without
 * a deployment, credentials or network: top-level code runs, every dependency
 * resolves and evaluates, and a missing export or an engine-incompatible
 * package throws right here. Handlers are not called.
 *
 * Run it on the same Node major as production (Vercel project setting).
 *
 *   node scripts/import-functions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const dir = path.resolve("api");
const files = fs
  .readdirSync(dir)
  // Underscore modules are shared helpers, imported by the routes anyway;
  // test files import vitest, which production never ships.
  .filter((f) => f.endsWith(".js") && !f.startsWith("_") && !/\.(test|spec)\.js$/.test(f))
  .sort();

console.log(`Node ${process.version} — importing ${files.length} function modules\n`);

let failed = 0;
for (const f of files) {
  try {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    const kind = typeof mod.default;
    if (kind !== "function") {
      failed++;
      console.log(`  FAIL  ${f}  default export is ${kind}, not a handler`);
    } else {
      console.log(`  ok    ${f}`);
    }
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${f}`);
    console.log(`        ${e.code ? `[${e.code}] ` : ""}${e.message.split("\n")[0]}`);
    const frame = (e.stack || "").split("\n").find((l) => /node_modules|file:/.test(l));
    if (frame) console.log(`        ${frame.trim()}`);
  }
}

console.log(failed ? `\n${failed} module(s) failed to load.` : "\nAll function modules load.");
process.exit(failed ? 1 : 0);
