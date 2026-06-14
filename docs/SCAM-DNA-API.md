# Scam DNA — B2B Intelligence API

Real-time access to VRIKAAN's crowdsourced scam-intelligence network. Check a
phone number, UPI ID, or URL against millions of community + AI-harvested scam
signals at transaction time, onboarding, or in-app — and contribute your own
signals back to strengthen the network.

**Who it's for:** fintechs, banks, wallets, telcos, marketplaces, NBFCs.

---

## Base

```
POST https://www.vrikaan.com/api/tools?tool=scam-dna-api
Content-Type: application/json
Authorization: Bearer vrk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Auth: a long-lived API token (`vrk_…`) issued to your account.
- Plan: **Enterprise**. Under-tier tokens get `402 TIER_ENTERPRISE_REQUIRED`.
- Rate limit: 200 req/min per IP, 600 req/min per token (Enterprise).
- All requests are `POST` with a JSON body. The `action` field selects the call.

> Get a token: VRIKAAN dashboard → API keys (on an Enterprise plan), or email
> `enterprise@vrikaan.com`.

---

## 1. `check` — single lookup

```json
{ "action": "check", "identifier": "refund@okaxis" }
```

`identifier` = a phone number, UPI/wallet ID, or URL/domain.

**Response**

```json
{
  "result": {
    "identifier": "refund@okaxis",
    "normalized": "refund@okaxis",
    "known": true,
    "riskScore": 88,
    "category": "upi-fraud",
    "tactic": "fake refund / verification fee",
    "reports": 6,
    "lossReports": 3,
    "lossTotal": 41000,
    "verified": false,
    "firstSeen": 1781200000000,
    "lastSeen": 1781370000000
  }
}
```

`known:false, riskScore:0` means no signal in the network (not proof it's safe).
`verified:true` = present in VRIKAAN's curated known-scam library (riskScore 95).

**Risk model:** `verified → 95`, else `min(90, 40 + reports·8 + lossReports·5)`.

---

## 2. `bulk-check` — up to 50 at once

```json
{ "action": "bulk-check", "identifiers": ["+919812345672", "kyc-sbi-verify.in", "good@okhdfc"] }
```

**Response**

```json
{ "count": 3, "results": [ { "...": "same shape as check.result" } ] }
```

---

## 3. `feed` — trending scams

```json
{ "action": "feed", "limit": 20 }
```

Latest active scam clusters across the network (limit 1–50, default 20). Use to
power threat dashboards or proactive customer warnings.

```json
{ "count": 20, "items": [
  { "id": "id_kyc-sbi-verify.in", "category": "phishing", "tactic": "fake KYC",
    "reports": 12, "lossReports": 4, "verified": false, "lastSeen": 1781370000000 }
] }
```

---

## 4. `report` — contribute a signal

Feed confirmed fraud back into the network (improves intel for everyone).

```json
{
  "action": "report",
  "identifier": "scammer@upi",
  "identifiers": ["+919800000000"],
  "category": "upi-fraud",
  "tactic": "fake electricity-bill disconnection",
  "sample": "Your power will be cut tonight, pay now: …",
  "keyPhrases": ["power will be cut", "pay now"]
}
```

**Response**

```json
{ "success": true, "sigId": "id_scammer@upi" }
```

---

## Errors

| HTTP | code | meaning |
|------|------|---------|
| 400 | — | bad/missing params or unknown `action` |
| 401/402 | `TIER_ENTERPRISE_REQUIRED` | token missing or not on Enterprise plan |
| 429 | — | rate limit exceeded (`Retry-After` header) |
| 500 | — | server/DB error |

---

## Suggested integration

- **Payments:** `check` the payee UPI/VPA before confirming a first-time
  transfer; warn or step-up if `riskScore ≥ 70`.
- **Onboarding / KYC:** `bulk-check` the phone + any links in a new user's
  profile.
- **Support / chat:** `check` numbers and links customers report.
- **Feedback loop:** `report` every confirmed-fraud case back — the network
  (and your own future lookups) get stronger.

## Pricing

Usage-based (per 1k lookups) with a monthly minimum; volume tiers for
banks/telcos. Contact `enterprise@vrikaan.com`.
