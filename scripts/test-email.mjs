// Email deliverability test via testmail.app.
//
// Verifies that a transactional email actually lands in an inbox — catches
// silent EmailJS/Brevo failures (wrong template id, bad key, spam-block).
//
// Setup (one-time):
//   1. testmail.app → create namespace → copy API key + namespace.
//   2. Set env: TESTMAIL_API_KEY=... TESTMAIL_NAMESPACE=...
//   3. Trigger a real send TO  <tag>.<namespace>@inbox.testmail.app
//      (e.g. sign up / make a test payment using that address as the email).
//   4. Run:  node scripts/test-email.mjs <tag> "<expected subject substring>"
//
// Example:
//   node scripts/test-email.mjs welcome "Welcome to VRIKAAN"
//
// Exit 0 = email found + subject matched. Exit 1 = not found / mismatch.

const API_KEY = process.env.TESTMAIL_API_KEY;
const NS = process.env.TESTMAIL_NAMESPACE;
const tag = process.argv[2] || "welcome";
const expect = process.argv[3] || "";

if (!API_KEY || !NS) {
  console.error("✗ Set TESTMAIL_API_KEY and TESTMAIL_NAMESPACE env vars first.");
  console.error("  Inbox address to send to: <tag>." + (NS || "<namespace>") + "@inbox.testmail.app");
  process.exit(1);
}

// JSON API with livequery — waits up to ~10s for a matching email to land
// (more reliable than the GraphQL endpoint, which can return cached/empty).
const url = `https://api.testmail.app/api/json?apikey=${API_KEY}&namespace=${NS}&tag=${encodeURIComponent(tag)}&livequery=true`;

const r = await fetch(url);
const data = await r.json().catch(() => ({}));
const inbox = data?.result === "success" ? { count: data.count, emails: data.emails || [] } : null;

if (!inbox || !inbox.count) {
  console.error(`✗ No emails for tag "${tag}" in namespace "${NS}".`);
  console.error(`  Did you send a test to: ${tag}.${NS}@inbox.testmail.app ?`);
  process.exit(1);
}

const latest = inbox.emails[0];
console.log(`✓ Found ${inbox.count} email(s). Latest:`);
console.log(`   subject: ${latest.subject}`);
console.log(`   from:    ${latest.from}`);

if (expect && !(`${latest.subject} ${latest.text}`.toLowerCase().includes(expect.toLowerCase()))) {
  console.error(`✗ Expected substring "${expect}" not found in latest email.`);
  process.exit(1);
}
console.log("✓ Email deliverability check passed.");
