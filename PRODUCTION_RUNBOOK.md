# VRIKAAN Production Runbook

Operations guide for deploying, monitoring, and recovering the VRIKAAN platform.

---

## 1. Stack Overview

| Layer          | Provider                                    |
| -------------- | ------------------------------------------- |
| Frontend       | Vercel (React 19 + Vite 7)                  |
| Serverless API | Vercel Functions (`api/*.js`, 12-fn limit)  |
| Auth           | Firebase Authentication                     |
| Database       | Cloud Firestore                             |
| Payments       | Cashfree (production keys)                  |
| Email          | EmailJS (transactional templates)           |
| AI             | Google Gemini (gemini-1.5-flash)            |
| Errors         | Sentry (optional, via envelope protocol)    |
| Analytics      | Vercel Analytics + Speed Insights           |

---

## 2. Required Environment Variables

Set these in **Vercel → Settings → Environment Variables** (Production).

### Public (exposed to browser, prefix `VITE_`)

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_WELCOME
VITE_EMAILJS_TEMPLATE_EXPIRY
VITE_CASHFREE_APP_ID
VITE_SENTRY_DSN               # optional, activates error reporting
VITE_APP_VERSION              # shown in Sentry events
```

### Server-only (no prefix — never exposed)

```
CASHFREE_SECRET_KEY
CASHFREE_ENV                  # "PROD" or "TEST"
GEMINI_API_KEY                # enables AI explain in FraudAnalyzer
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY    # paste with \n newlines, wrap in quotes
```

After changing any env var, redeploy: **Vercel → Deployments → Redeploy (Production)**.

---

## 3. Deployment

Every push to `main` triggers an automatic production deploy. To deploy manually:

```
git push origin main
```

To test a branch without affecting production, Vercel auto-creates a preview URL on every push.

### Rollback

1. Vercel → Deployments
2. Find the last known-good deployment
3. Click **⋮ → Promote to Production**

---

## 4. Sentry Error Tracking

VRIKAAN uses a lightweight direct-envelope client (`src/services/errorReporter.js`) — no Sentry SDK dependency.

### Enable

1. Create a project at https://sentry.io (React platform)
2. Copy the DSN (format: `https://PUBLIC_KEY@oXXX.ingest.sentry.io/PROJECT_ID`)
3. Add `VITE_SENTRY_DSN` in Vercel env vars
4. Redeploy

### Verify

- Trigger a test error from DevTools console: `throw new Error("test-sentry")`
- Check Sentry dashboard within 1 minute

Local dev is a no-op unless `VITE_SENTRY_DEBUG=true`.

---

## 5. Cashfree Payments

**Webhook URL:** `https://vrikaan.com/api/cashfree-webhook`

**Events configured:** `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`, `REFUND_STATUS_WEBHOOK`

### Refund Procedure

1. Cashfree Dashboard → Transactions → find order by Order ID
2. Click **Refund**, enter amount + reason
3. Webhook auto-sends refund email to user (template: `VITE_EMAILJS_TEMPLATE_EXPIRY` reused)
4. Verify Firestore `payments/{orderId}.refundStatus === "success"`

### Payment Gateway Failure

- Switch `CASHFREE_ENV=TEST` to route to sandbox while investigating
- Monitor Cashfree status: https://status.cashfree.com

---

## 6. Firestore Backups

Firestore does not auto-backup. Export manually or via schedule.

### Manual export

```
gcloud firestore export gs://secuvion-backups/$(date +%Y%m%d)
```

### Scheduled daily backup (GitHub Actions — free)

VRIKAAN ships with a nightly backup workflow at `.github/workflows/backup.yml` that runs `scripts/backup-firestore.js` and uploads the JSON dump as a 30-day-retention artifact.

**One-time setup:**

1. In Firebase Console → Project Settings → Service Accounts → Generate new private key (download JSON)
2. GitHub repo → Settings → Secrets → New repository secret
   - Name: `FIREBASE_ADMIN_KEY`
   - Value: paste the entire JSON contents
3. Ensure Actions are enabled for the repo. The workflow runs at 03:00 UTC daily. Trigger manually anytime via `Actions → Firestore Nightly Backup → Run workflow`.

**Run locally on demand:**

```
npm install firebase-admin --no-save
# Either place serviceAccount.json at repo root, or export FIREBASE_ADMIN_KEY
node scripts/backup-firestore.js
```

Output lands at `backups/YYYY-MM-DD/` with one folder per collection and `_summary.json` at the top level.

**Alternative (Cloud Scheduler, if you want cloud-native):**

1. GCP Console → Cloud Scheduler → Create Job, frequency `0 3 * * *`
2. Target: Pub/Sub topic → Cloud Function → runs `gcloud firestore export gs://secuvion-backups/$(date +%Y%m%d)`
3. Attach a GCS lifecycle rule to delete objects older than 30 days.

### Restore

```
gcloud firestore import gs://secuvion-backups/YYYYMMDD
```

---

## 7. Rate Limiting

`api/_rateLimit.js` implements dual-bucket (IP + user) in-memory limits.

| Bucket | Default limit          |
| ------ | ---------------------- |
| Per IP | 20 requests / 60s      |
| Per UID | 60 requests / 60s      |

Limits are **per serverless instance** — distributed across Vercel regions. For stricter global limits, move to Upstash Redis.

---

## 8. Monitoring Checklist

Check weekly:

- [ ] Vercel → Logs: filter `level=error`, investigate anomalies
- [ ] Sentry → Issues: triage new unresolved errors
- [ ] Firebase → Authentication: scan for abuse patterns (mass signup spikes)
- [ ] Firebase → Firestore: review quota usage, index health
- [ ] Cashfree → Transactions: reconcile successful payments vs Firestore `payments` collection
- [ ] EmailJS → Dashboard: check monthly send quota (free plan = 200/mo)
- [ ] Google Cloud → Gemini API: review quota/billing

Set up alerts:

- Vercel: enable **Function Errors** notifications (Settings → Notifications)
- Firebase: set Firestore budget alert at 80% of expected usage
- Cashfree: enable SMS/email alerts for failed webhooks

---

## 9. Security Incident Response

### Suspected account compromise

1. Firebase → Authentication → find user → **Disable account**
2. Firestore → `users/{uid}` → set `role: "disabled"`
3. Force password reset via Firebase Admin SDK if needed
4. Notify user via email

### Suspected API key leak

1. Immediately rotate: Vercel → Settings → Env Vars → update
2. Firebase Console → Project Settings → API Keys → regenerate
3. Redeploy all environments
4. Audit logs for the 24h before detection

### Database breach

1. Disable Firestore write rules: set `allow write: if false;` in `firestore.rules`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Export current state for forensics
4. Notify affected users within 72 hours (GDPR requirement)

---

## 10. Known Limits & Constraints

- **Vercel free plan:** 12 serverless functions max — all tools merged into `api/tools.js` (`?tool=` router)
- **EmailJS free plan:** 2 templates, 200 emails/month — use shared templates with dynamic subjects
- **Firestore free plan:** 50k reads, 20k writes, 1GB storage per day
- **Gemini free tier:** 15 req/min — add client-side debounce before scaling

---

## 11. Contacts

| Role              | Contact                     |
| ----------------- | --------------------------- |
| Primary on-call   | sahilnikam133@gmail.com     |
| Firebase billing  | Google Cloud Console owner  |
| Cashfree support  | care@cashfree.com           |

---

_Last updated: 2026-04-17_
