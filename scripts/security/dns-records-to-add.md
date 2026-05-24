# VRIKAAN — DNS records to add at GoDaddy

Paste these at **godaddy.com → My Products → vrikaan.com → DNS**.
Total time: ~15 minutes of DNS edits + 5-30 minutes propagation.

Closes findings **H1 (CAA), M1 (DKIM), H2/M7 (DMARC)** from the vuln report.

---

## 1️⃣ CAA RECORDS — restrict who can issue certs (closes H1)

Without CAA, **any** Certificate Authority on Earth can mint a TLS cert for `vrikaan.com`. With these records, only Let's Encrypt + DigiCert + Amazon (the CAs Vercel uses) are allowed.

**At GoDaddy:** Add 4 records of type **CAA**.

| Type | Name | Flags | Tag | Value | TTL |
|------|------|-------|-----|-------|-----|
| CAA | `@` | 0 | `issue` | `letsencrypt.org` | 1 hr |
| CAA | `@` | 0 | `issue` | `digicert.com` | 1 hr |
| CAA | `@` | 0 | `issue` | `amazon.com` | 1 hr |
| CAA | `@` | 0 | `iodef` | `mailto:hello.vrikaan@gmail.com` | 1 hr |

> The `iodef` record sends you an email if **anyone** tries to issue an unauthorized cert. Free early-warning for cert misissuance.

**GoDaddy UI:** Each form may show "Flags" / "Tag" / "Value" as separate fields. If GoDaddy uses a single string field like `0 issue "letsencrypt.org"`, paste it like that.

**Verify after 30 min propagation:**
```
nslookup -type=CAA vrikaan.com 8.8.8.8
```
Should return all 4 records.

---

## 2️⃣ DKIM RECORD — sign outgoing emails (closes M1, prerequisite for H2)

DKIM = cryptographic signature on every outbound email. Without it, Gmail / Outlook are likely to bin your welcome / payment / reset emails as spam, and DMARC enforcement (next step) won't work.

**Step A — generate the DKIM keypair.** Go to your mail provider:

**If you use GoDaddy Workspace Email:**
1. GoDaddy → Workspace Email → Settings → DKIM Setup
2. Enable DKIM → it generates a public key
3. GoDaddy auto-creates the TXT record at `default._domainkey.vrikaan.com` — just confirm

**If you use Google Workspace (Gmail for business):**
1. admin.google.com → Apps → Google Workspace → Gmail → Authenticate Email
2. Generate new record (2048-bit, selector `google`)
3. Add the TXT record below (Google gives you the exact value)

**If you use EmailJS / SendGrid / Brevo / Postmark for transactional mail:**
1. Provider dashboard → Domain authentication → Add vrikaan.com
2. They give you 1-3 CNAME or TXT records to add at GoDaddy
3. Click "Verify" in their dashboard once added

**TXT record skeleton** (replace `<provider-selector>` and `<long-public-key>` w/ what your provider gives):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | `<selector>._domainkey` | `v=DKIM1; k=rsa; p=<long-public-key>` | 1 hr |

Common selectors:
- GoDaddy → `default._domainkey`
- Google → `google._domainkey`
- SendGrid → `s1._domainkey`, `s2._domainkey`
- Brevo → `mail._domainkey`

**Verify:**
```
nslookup -type=TXT default._domainkey.vrikaan.com 8.8.8.8
```

Or use **MX Toolbox**: https://mxtoolbox.com/dkim.aspx — enter `vrikaan.com` + your selector.

---

## 3️⃣ DMARC ESCALATION — stop email spoofing (closes H2, M7)

You currently have:
```
_dmarc.vrikaan.com  TXT  "v=DMARC1; p=none; rua=mailto:hello.vrikaan@gmail.com"
```

`p=none` means "report failures but deliver anyway" — anyone can spoof `From: founder.vrikaan@gmail.com` and Gmail will accept it. Escalate in stages.

### Stage 1 — better reporting (do NOW, after DKIM is verified)

**At GoDaddy:** Edit the existing `_dmarc.vrikaan.com` TXT record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | `_dmarc` | `v=DMARC1; p=none; pct=100; rua=mailto:dmarc@vrikaan.com; ruf=mailto:dmarc@vrikaan.com; aspf=r; adkim=r; sp=none; fo=1` | 1 hr |

Changes vs current:
- `pct=100` — apply policy to 100% of mail (was implicit)
- `rua=mailto:dmarc@vrikaan.com` — aggregate reports to a dedicated alias (set up `dmarc@vrikaan.com` as forward to `hello.vrikaan@gmail.com` in GoDaddy email aliases, OR sign up at **dmarc.postmarkapp.com** free tier and use the email they give you)
- `ruf=mailto:dmarc@vrikaan.com` — forensic reports for every failure
- `aspf=r` / `adkim=r` — relaxed alignment (allows subdomains)
- `sp=none` — subdomain policy (start lax)
- `fo=1` — generate report if either SPF or DKIM fails (more visibility)

### Stage 2 — quarantine 25% (after 14 days of monitoring reports)

Once you've watched reports for 2 weeks and confirmed all your legitimate senders (EmailJS, GoDaddy mail, Cashfree receipts) pass DKIM + SPF, escalate:

```
v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@vrikaan.com; ruf=mailto:dmarc@vrikaan.com; aspf=r; adkim=r; sp=quarantine; fo=1
```

This sends 25% of failing mail to spam (rest still delivered). Watch reports another 14 days.

### Stage 3 — quarantine 100%

```
v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@vrikaan.com; ruf=mailto:dmarc@vrikaan.com; aspf=r; adkim=r; sp=quarantine; fo=1
```

### Stage 4 — reject (the gold standard, after 30+ days total)

```
v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@vrikaan.com; ruf=mailto:dmarc@vrikaan.com; aspf=s; adkim=s; sp=reject; fo=1
```

`p=reject` + `aspf=s` (strict) + `adkim=s` (strict) = **all spoofed mail bounces**. Inbox spoofing of `@vrikaan.com` becomes impossible. This is what banks + brands use.

⚠️ Don't skip stages. Going straight to `p=reject` without DKIM verified will break your own outgoing mail. Stage carefully.

---

## 4️⃣ OPTIONAL — `dmarc@vrikaan.com` alias setup

DMARC reports are noisy XML files. Either:

### Option A (free) — alias to existing inbox + parser
1. GoDaddy → Email → Forwards → add `dmarc@vrikaan.com → hello.vrikaan@gmail.com`
2. Sign up for **Postmark's free DMARC monitor**: https://dmarc.postmarkapp.com
3. They give you an email like `xyzabc@inbound.dmarc.postmarkapp.com` — put THAT in the `rua=` field instead
4. Login at dmarc.postmarkapp.com weekly — readable dashboard

### Option B (paid, $9/mo) — **EasyDMARC** full dashboard
1. Sign up at easydmarc.com
2. Add vrikaan.com domain → they give you the `rua=` email
3. Real-time alerts when spoof campaigns start

**Recommend Option A** until you cross 10k subscribers — free tier covers it.

---

## 5️⃣ VERIFICATION CHECKLIST (after all changes propagate ~30 min)

Run each — should all return ✅ green:

| Tool | URL | What to look for |
|---|---|---|
| **MX Toolbox SuperTool** | https://mxtoolbox.com/SuperTool.aspx | `vrikaan.com` → "DKIM" + "DMARC" + "SPF" + "CAA" all green |
| **DMARC Inspector** | https://dmarcian.com/dmarc-inspector/ | Enter `vrikaan.com` → see active policy, % covered |
| **CAA Lookup** | https://sslmate.com/caa/ | `vrikaan.com` → lists your 4 records |
| **SSL Labs** | https://www.ssllabs.com/ssltest/analyze.html?d=vrikaan.com | A+ grade, CAA listed under "Certificate" section |
| **Mail Tester** | Send any vrikaan email to the unique address at https://www.mail-tester.com → should score 9+/10 |
| **internet.nl** | https://internet.nl/site/vrikaan.com | Comprehensive — checks IPv6 / TLS / DNSSEC / mail security |

---

## 6️⃣ DNSSEC (BONUS — recommended)

Even with CAA + DKIM + DMARC, an attacker who hijacks your DNS can serve fake records. DNSSEC signs your DNS responses cryptographically.

**At GoDaddy:** My Products → vrikaan.com → DNSSEC → Enable.

GoDaddy handles the signing automatically. No further action.

Verify: https://dnssec-analyzer.verisignlabs.com → enter `vrikaan.com` → should show full chain of trust green.

---

## 7️⃣ TIMELINE SUMMARY

| Day | Action |
|---|---|
| **Today** | Add 4 CAA records · enable DKIM at mail provider · update DMARC to stage-1 monitor · enable DNSSEC |
| **Day 1-3** | Verify all records via MX Toolbox + SSL Labs. Fix anything red. |
| **Day 7** | Check DMARC reports — make sure all legitimate senders pass |
| **Day 14** | If reports clean → escalate DMARC to `p=quarantine; pct=25` |
| **Day 28** | Escalate to `p=quarantine; pct=100` |
| **Day 42** | Escalate to `p=reject` ← spoofing eliminated |

Once at `p=reject`, you'll see DMARC reports drop to ~zero except real spoof attempts. Each spoof attempt = an email landing in your DMARC inbox, telling you who tried.

---

## 8️⃣ AFTER DEPLOY — re-run the vuln scan

Once these DNS changes + the code fixes (separate commit) are live:

```bash
# CAA check
nslookup -type=CAA vrikaan.com 8.8.8.8

# DKIM check
nslookup -type=TXT default._domainkey.vrikaan.com 8.8.8.8

# DMARC check
nslookup -type=TXT _dmarc.vrikaan.com 8.8.8.8

# Headers re-scan
curl -sI https://www.vrikaan.com | grep -iE "cross-origin|content-security-policy|strict-transport|x-content-type"

# security.txt now resolves
curl -s https://vrikaan.com/.well-known/security.txt
```

All should show the updated values. If anything fails, re-check the record was saved at GoDaddy (some changes take 5-30 min, rare cases up to 24 hrs).

---

## 9️⃣ ESCALATION CONTACT

If you get stuck mid-process:
- **GoDaddy DNS support:** 24×7 chat in dashboard
- **MX Toolbox** helpfully explains errors in plain English
- **Cloudflare community forum** — many free experts who help w/ DNS even if you're not on Cloudflare

Ping me back w/ any verification screenshot that's red and I'll diagnose.
