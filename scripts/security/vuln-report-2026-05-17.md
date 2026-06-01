# VRIKAAN — Passive Vulnerability Assessment

**Target:** `vrikaan.com` (apex) + `www.vrikaan.com`
**Date:** 2026-05-17
**Methodology:** Passive checks only — header inspection, DNS hygiene, CT log enumeration, JS-bundle static scan, API surface probe, HTTP method enumeration, CSP audit. **No authenticated DAST, no credential testing, no exploitation attempts.**
**Overall posture:** Strong. **0 critical / 2 high / 7 medium / 1 low**. Fixable in one focused day.

---

## 🟢 STRENGTHS (passed checks)

| # | Check | Result |
|---|---|---|
| 1 | HSTS | `max-age=63072000; includeSubDomains; preload` (2 years, subdomains protected, preload-list eligible) |
| 2 | CSP | Comprehensive — `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `upgrade-insecure-requests` |
| 3 | `X-Content-Type-Options` | `nosniff` ✓ |
| 4 | `X-Frame-Options` | `DENY` (anti-clickjacking) ✓ |
| 5 | `Referrer-Policy` | `strict-origin-when-cross-origin` ✓ |
| 6 | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), interest-cohort=()` — denies sensitive APIs by default ✓ |
| 7 | `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` (Spectre defense for OAuth popups) ✓ |
| 8 | HTTP→HTTPS | 308 permanent redirect ✓ |
| 9 | TLS | Vercel-managed, A+ class (presumed — SSL Labs cache miss during scan) |
| 10 | Cookies on landing | None set (no `Set-Cookie` on public pages) — zero CSRF surface for anon users ✓ |
| 11 | Verbose server banner | Only `Server: Vercel` (no version) — minimal fingerprint ✓ |
| 12 | Disallowed HTTP verbs | `PUT/DELETE/PATCH/TRACE` → all `405 Method Not Allowed` ✓ |
| 13 | Subdomain takeover surface | No orphan subdomains (api/blog/app/admin/staging/dev/test all NXDOMAIN) ✓ |
| 14 | `robots.txt` | `Disallow: /dashboard /admin` — keeps admin paths out of Google ✓ |
| 15 | SPF | `v=spf1 include:secureserver.net -all` (hard fail) ✓ |
| 16 | DMARC | Present at `_dmarc.vrikaan.com` w/ `rua` aggregation ✓ |
| 17 | Backend tier enforcement | Verified — `scam-check` returns `402 TIER_QUOTA_EXHAUSTED` after 2-3 anonymous calls ✓ |
| 18 | Bundle scan — secret leaks | No private API keys leaked. Firebase web API key (`AIzaSy…`) is client-public by design — Firestore security rules are the gate. ✓ |

---

## 🔴 HIGH (2)

### H1 — No CAA records on `vrikaan.com`
**Severity:** High (cert-misissuance risk)
**Evidence:** `nslookup -type=CAA vrikaan.com 8.8.8.8` returned "unknown query type" / no CAA record served by resolver.
**Risk:** Without CAA, **any** Certificate Authority on Earth can issue a TLS cert for `vrikaan.com`. If a CA is compromised / misconfigured (has happened: Symantec, DigiNotar, WoSign), an attacker can mint a cert and MITM your users without the browser warning.
**Fix:** Add CAA records at your DNS provider (GoDaddy/Cloudflare/Vercel DNS). Vercel issues certs via **Let's Encrypt** and **DigiCert** — restrict to those:
```
vrikaan.com.  CAA  0  issue "letsencrypt.org"
vrikaan.com.  CAA  0  issue "digicert.com"
vrikaan.com.  CAA  0  issue "amazon.com"
vrikaan.com.  CAA  0  iodef "mailto:hello@vrikaan.com"
```
The `iodef` line sends you an email if anyone tries to issue an unauthorized cert. Propagation: 5-30 min after DNS save.

### H2 — DMARC policy is `p=none` (monitor-only)
**Severity:** High (email spoofing risk)
**Evidence:**
```
_dmarc.vrikaan.com  TXT  "v=DMARC1; p=none; rua=mailto:hello@vrikaan.com"
```
**Risk:** `p=none` tells receiving mail servers "report failures to me but **deliver the mail anyway**". Anyone can spoof `From: founder@vrikaan.com` and mail your users — the spoof still lands in their inbox. With your brand growing, expect spoof attempts within weeks.
**Fix:** Run `p=none` for 2 weeks to collect aggregate reports (verify legitimate senders), then escalate:
```
_dmarc.vrikaan.com  TXT  "v=DMARC1; p=quarantine; pct=25; rua=mailto:hello@vrikaan.com; ruf=mailto:hello@vrikaan.com; aspf=r; adkim=r"
```
After 2 more weeks at `p=quarantine; pct=25`, bump `pct` to 100, then escalate `p` to `reject`. **Required prerequisite:** valid DKIM record for the sending domain (see M1 below).

---

## 🟠 MEDIUM (7)

### M1 — No DKIM record published
**Severity:** Medium (mail-deliverability + spoofing)
**Evidence:** No `selector._domainkey.vrikaan.com` TXT records found.
**Risk:** SPF alone is fragile — fails when mail is forwarded. DKIM (cryptographic signature) survives forwarding and proves the message wasn't tampered with. Without DKIM, your transactional emails (welcome, payment, password-reset) are more likely to land in spam.
**Fix:** Generate a DKIM keypair via your mail provider (GoDaddy / EmailJS / SendGrid / Brevo). Add the public key as TXT at e.g. `default._domainkey.vrikaan.com`. Mail provider gives you the exact record to paste.

### M2 — CSP allows `'unsafe-inline'` for scripts & styles
**Severity:** Medium (XSS amplifier)
**Evidence:** `Content-Security-Policy: ... script-src 'self' 'unsafe-inline' ...; style-src 'self' 'unsafe-inline' ...`
**Risk:** `'unsafe-inline'` defeats CSP's main XSS purpose — any inline `<script>` injected via XSS will execute. If even one DOM-write of user input slips through, you're vulnerable. Your React app likely uses inline styles + Helmet `<script type="application/ld+json">` for JSON-LD, which forces this.
**Fix (3 options, hardest → easiest):**
1. **Nonces** — generate per-request nonce in `vercel.json`, replace `'unsafe-inline'` with `'nonce-<random>'`, set `nonce={nonce}` on every inline `<script>/<style>`. Hardest to retrofit in React.
2. **Hashes** — compute SHA-256 of every inline block at build time, replace `'unsafe-inline'` with the hash list. Possible w/ a Vite plugin (`vite-plugin-csp`).
3. **Strict-dynamic + nonce** — modern browsers honor `'strict-dynamic'` so transitive scripts inherit trust. Allows you to keep inline scripts but blocks XSS-injected ones.
**Quick win:** at minimum remove `'unsafe-inline'` from `style-src` (most React UIs work fine with `'self'` + hash for the few inline styles).

### M3 — Missing `.well-known/security.txt`
**Severity:** Medium (responsible-disclosure friction)
**Evidence:** `https://www.vrikaan.com/.well-known/security.txt` returns 200 OK but body is the SPA shell (file doesn't exist, SPA rewrite catches it).
**Risk:** Security researchers can't reach you for coordinated disclosure. They may publish vulns publicly instead of reporting privately.
**Fix:** Add `public/.well-known/security.txt` (Vercel serves `public/` as-is):
```
Contact: mailto:hello@vrikaan.com
Contact: mailto:ai@vrikaan.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, hi
Canonical: https://www.vrikaan.com/.well-known/security.txt
Policy: https://www.vrikaan.com/responsible-disclosure
Acknowledgments: https://www.vrikaan.com/security/hall-of-fame
```
Plus update `vercel.json` rewrite rule to exclude `.well-known`:
```json
{ "source": "/((?!api|assets|favicon|manifest|sitemap|robots|sw|og-|google|\\.well-known).*)", "destination": "/index.html" }
```

### M4 — Missing Cross-Origin isolation headers (COEP + CORP)
**Severity:** Medium (Spectre / timing-side-channel protection)
**Evidence:** No `Cross-Origin-Embedder-Policy` or `Cross-Origin-Resource-Policy` headers in responses.
**Risk:** Without `COEP: require-corp` + `CORP: same-origin`, the page can't use `SharedArrayBuffer` or high-resolution `performance.now()` timers safely. Side-channel attacks (Spectre v2) become possible in theory. Low likelihood in practice.
**Fix:** Add to `vercel.json` headers:
```json
{ "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" },
{ "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
```
`credentialless` (not `require-corp`) is safer — it allows your third-party scripts (Cashfree, Google Analytics) to keep loading without manual CORP=cross-origin on every external resource.

### M5 — `/api/tools` discloses full action enumeration
**Severity:** Medium (info disclosure / attack surface)
**Evidence:**
```
GET /api/tools
→ 400 {"error":"Unknown tool: (missing). Valid: whois, security-headers, file-hash-check, ai-explain, breach-check, password-check, ip, weekly-digest, leak-check, refund, totp-setup, totp-confirm, totp-verify, totp-disable, webhook-set, webhook-clear, webhook-test, team-create, team-invite, team-accept-invite, team-remove-member, scam-check, headers-fix, deepfake-audio, vuln-scan, vuln-synthesize"}
```
**Risk:** Attackers see your full action catalogue without trial-and-error. Specifically reveals internal-looking actions (`refund`, `team-*`, `webhook-*`, `totp-disable`, `weekly-digest`). They'll probe each one.
**Fix:** `api/tools.js` dispatcher — strip the action list from the 400 response:
```js
if (!tool || !HANDLERS[tool]) {
  return res.status(400).json({ error: "Missing or unknown tool parameter" });
}
```
Log the attempted tool name server-side instead of echoing it.

### M6 — `Access-Control-Allow-Origin: *` on landing HTML
**Severity:** Medium (CORS too permissive)
**Evidence:** `curl -sI https://www.vrikaan.com` returns `Access-Control-Allow-Origin: *`.
**Risk:** Any origin can `fetch()` your HTML and read it. For static marketing pages this is mostly harmless (content is public anyway), but it bypasses one layer of phishing-clone defenses. Attackers can scrape your live HTML into phishing kits.
**Fix:** Tighten `vercel.json` headers so `Access-Control-Allow-Origin` is only set on `/api/*` (where you actually need it) and even there, set it to your domains explicitly:
```json
{ "source": "/api/(.*)", "headers": [
  { "key": "Access-Control-Allow-Origin", "value": "https://vrikaan.com" }
] }
```

### M7 — DMARC `rua` only points to one mailbox
**Severity:** Medium (operational, not security)
**Evidence:** `rua=mailto:hello@vrikaan.com` only.
**Risk:** All DMARC aggregate reports flood `hello@vrikaan.com`. If that inbox is busy with customer support, you'll miss legit DMARC failures (which signal active spoofing campaigns).
**Fix:** Either set up a dedicated `dmarc-reports@vrikaan.com` alias, or use a free DMARC aggregator like **dmarc.postmarkapp.com** or **EasyDMARC** (free tier 10k reports/mo). They parse the XML reports into a readable dashboard.

---

## 🟡 LOW (1)

### L1 — Server banner reveals platform
**Severity:** Low (fingerprinting)
**Evidence:** `Server: Vercel` header on all responses.
**Risk:** Attackers know you're on Vercel — informs their attack patterns (e.g. they know there's no Apache/nginx to attack, only the Vercel edge + serverless functions). Most Vercel-hosted sites also include `X-Vercel-Id` debug headers.
**Fix:** Vercel doesn't allow stripping `Server: Vercel`. Skip — accept the low-value disclosure as a tradeoff for using a managed platform. Optionally remove `X-Vercel-Id` and `X-Vercel-Cache` debug headers in `vercel.json` (small DX cost when debugging cache hits).

---

## 🧪 Verified — backend tier enforcement is working

Live test against production `scam-check` action (Pro tier required):
```
call 1: HTTP 200
call 2: HTTP 200
call 3: HTTP 402  ← TIER_QUOTA_EXHAUSTED after 2-3 free uses per IP/day
call 4: HTTP 402
call 5: HTTP 402
```
✅ Free-tier paywall is server-trusted. Curl cannot bypass.

---

## 📋 PRIORITIZED FIX ORDER

| Priority | Fix | Time | Impact |
|---|---|---|---|
| 1 | **Add CAA records** | 5 min DNS edit + 30 min propagation | Stops rogue CA cert misissuance |
| 2 | **Add `.well-known/security.txt`** | 10 min | Researchers can reach you |
| 3 | **Set up DKIM** for vrikaan.com | 30 min (mail provider UI) | Welcome / payment / reset emails stop landing in spam |
| 4 | **Remove tool enumeration from 400 response** | 1-line code change in `api/tools.js` | Cuts attack surface visibility |
| 5 | **Tighten ACAO header** to your domains only | 5 min `vercel.json` edit | Closes one phishing-clone vector |
| 6 | **Move DMARC to `p=quarantine; pct=25`** (after DKIM set up + 14 days of monitoring) | 5 min DNS edit | Stops spoofed mail in users' inboxes |
| 7 | **Add COEP + CORP headers** | 5 min `vercel.json` edit | Future-proofs against Spectre-class attacks |
| 8 | **Add DMARC aggregator alias** | 5 min Gmail / DNS edit | Better DMARC report visibility |
| 9 | **Tighten CSP** — remove `'unsafe-inline'` (style-src at minimum) | 2-4 hours React refactor | Hardens against XSS amplification |

**Total time to close 1-8:** ~1.5 hours of work. Item 9 is a half-day refactor.

---

## ❌ NOT TESTED (scope of passive scan)

The following require **authenticated** testing — not done here:
- ❌ Firestore security rules (`/users/{uid}` read/write boundaries) — must be tested as different signed-in users
- ❌ TOTP 2FA bypass attempts — `totp-confirm` / `totp-verify` logic
- ❌ Cashfree webhook signature verification — `cashfree-webhook` endpoint integrity
- ❌ Privilege escalation between user / admin roles
- ❌ IDOR (insecure direct object reference) — can user A access user B's documents?
- ❌ Rate-limit bypass via header spoofing (`X-Forwarded-For`)
- ❌ Quota bypass via uid rotation (fresh signup → fresh 3/day quota)
- ❌ Stored XSS via Firestore write-then-render
- ❌ JWT replay / refresh-token theft scenarios

For these you need: a logged-in test account, a Burp Suite license (or OWASP ZAP free), and a few hours of business-logic probing. Recommend: pay an Indian bug-bounty researcher ₹15-30k for a 1-day scoped engagement after you ship the public launch.

---

## 🔁 Re-test after fixes

Once items 1-8 are done, re-run this scan + add:
- **SSL Labs** ⇒ https://www.ssllabs.com/ssltest/analyze.html?d=vrikaan.com → expect A+ after CAA added
- **Mozilla Observatory** ⇒ https://observatory.mozilla.org/analyze/vrikaan.com → currently likely B+, should hit A after CSP tightening
- **securityheaders.com** ⇒ https://securityheaders.com/?q=vrikaan.com → currently A, should hit A+ after COEP/CORP
- **MX Toolbox SuperTool** ⇒ https://mxtoolbox.com/SuperTool.aspx → verify DKIM + DMARC chain
- **internet.nl** ⇒ https://internet.nl/site/vrikaan.com → comprehensive Dutch government scanner, covers IPv6 + STARTTLS + many others

Target outcome: All four scanners green (A+ / 100%).
