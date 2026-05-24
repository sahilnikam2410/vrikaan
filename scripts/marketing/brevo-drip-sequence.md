# VRIKAAN Email Drip Sequence — 4-Week Welcome Series

5 emails sent automatically to every new Brevo subscriber. Educates them about real Indian scam patterns, demos VRIKAAN tools naturally, lands a soft Pro CTA at the end.

**Target metrics (industry benchmarks for cybersec niche, India):**
- Open rate: 40-55%
- Click rate: 8-15%
- Pro upgrade attribution: 1.5-3% by Day 28
- Unsubscribe rate: <1.5% per email

---

## SEQUENCE OVERVIEW

| Day | Email | Subject (A) | Preview | Primary tool linked |
|---|---|---|---|---|
| 0 | Welcome | "Welcome to VRIKAAN, {{FIRSTNAME}} 🛡️" | "Your free India-built cyber defense starts now" | /device-scan |
| 3 | Top 5 scams | "5 scams India lost ₹11,000 Cr to in 2024" | "The patterns your bank won't warn you about" | /scam-check |
| 7 | Deepfake demo | "AI cloned my mom's voice in 3 seconds 🎙" | "Watch the demo. Then build your family safe-word." | /safe-word + /deepfake-audio |
| 14 | Festival fraud | "Diwali fraud spikes 380%. Here's your shield." | "What to watch for + 1-tap WhatsApp share for family" | /festival-fraud |
| 28 | Pro offer | "{{FIRSTNAME}}, here's an early-supporter discount" | "₹990 → ₹490 — your first year, lock it in" | /pricing |

---

## SETUP IN BREVO (one-time, 30 min)

### Step 1 — Create automation workflow

1. Brevo dashboard → **Automations** (left sidebar)
2. Click **Create a new automation**
3. Choose template: **Welcome new contacts**
4. Name it: `VRIKAAN Welcome Series · 28-day`

### Step 2 — Set the entry point

- **Entry condition:** Contact added to **VRIKAAN Launch List** (#3)
- **Frequency:** Once per contact (don't re-enter)

### Step 3 — Add 5 email steps + delays

Build this flow in Brevo's visual editor:

```
[ENTRY] Contact joins List #3
    ↓
    [ Wait 5 minutes ]   ← lets the welcome email feel "fresh" not "instant"
    ↓
    [ Send: Email 1 — Welcome ]
    ↓
    [ Wait 3 days ]
    ↓
    [ Send: Email 2 — Top 5 scams ]
    ↓
    [ Wait 4 days ]
    ↓
    [ Send: Email 3 — Deepfake demo ]
    ↓
    [ Wait 7 days ]
    ↓
    [ Send: Email 4 — Festival fraud ]
    ↓
    [ Wait 14 days ]
    ↓
    [ Branch: Did contact upgrade to Pro? ]
       ├─ YES → END (don't pitch Pro again)
       └─ NO → Send: Email 5 — Pro offer
    ↓
    END
```

### Step 4 — Create each email template

For each email below, in Brevo:
1. **Email templates** → Create new template
2. Paste the HTML provided
3. Set subject, preview text, sender ("VRIKAAN" / hello.vrikaan@gmail.com)
4. Save
5. Back in automation → assign template to that step

---

## EMAIL 1 — Day 0 · Welcome

### Settings
- **Subject A:** `Welcome to VRIKAAN, {{contact.FIRSTNAME|default:"there"}} 🛡️`
- **Subject B (A/B test):** `🚨 Quick: scan your phone right now`
- **Preview text:** `Your free India-built cyber defense starts now. Here's how to use it.`
- **From:** VRIKAAN \<hello.vrikaan@gmail.com\>
- **Reply-to:** hello.vrikaan@gmail.com

### Body (paste as HTML)

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <tr><td align="center" style="padding:30px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#0b1220;border-radius:16px;border:1px solid rgba(148,163,184,0.1);overflow:hidden;">

      <!-- Brand strip -->
      <tr><td style="background:linear-gradient(135deg,#4338CA,#14E3C5);padding:24px;text-align:center;">
        <div style="display:inline-block;width:56px;height:56px;background:#030712;border-radius:14px;line-height:56px;font-size:32px;font-weight:800;color:#14E3C5;margin-bottom:10px;">V</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Welcome, {{contact.FIRSTNAME|default:"friend"}}</h1>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:30px;color:#cbd5e1;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 18px;">
          You're in. Welcome to <strong style="color:#14E3C5;">VRIKAAN</strong> — India's free AI-powered cyber defense platform.
        </p>
        <p style="margin:0 0 18px;">
          A quick context: <strong style="color:#fff;">India lost ₹11,000 crore to cyber scams in 2024.</strong>
          Your phone is the target. Foreign antivirus (Norton, McAfee) costs ₹2,000+/yr, doesn't speak Hindi, and ignores UPI fraud.
          We built VRIKAAN for the threats Indian families actually face.
        </p>

        <div style="background:rgba(20,227,197,0.06);border-left:3px solid #14E3C5;padding:16px;border-radius:8px;margin:20px 0;">
          <div style="color:#14E3C5;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Start with these 3 tools today</div>
          <ul style="margin:0;padding:0;list-style:none;color:#f1f5f9;">
            <li style="padding:6px 0;">🛡 <a href="https://vrikaan.com/device-scan" style="color:#14E3C5;text-decoration:none;font-weight:600;">Device Scanner</a> — scan your Downloads folder for malware</li>
            <li style="padding:6px 0;">📝 <a href="https://vrikaan.com/scam-check" style="color:#14E3C5;text-decoration:none;font-weight:600;">Scam Check AI</a> — paste any suspicious SMS, get a verdict in 5 sec</li>
            <li style="padding:6px 0;">🛡 <a href="https://vrikaan.com/safe-word" style="color:#14E3C5;text-decoration:none;font-weight:600;">Family Safe-Word</a> — beat AI voice clones targeting your parents</li>
          </ul>
        </div>

        <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;"><tr><td>
          <a href="https://vrikaan.com" style="display:inline-block;padding:14px 30px;background:#14E3C5;color:#030712;font-weight:800;font-size:15px;text-decoration:none;border-radius:10px;">Explore all 60+ tools →</a>
        </td></tr></table>

        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
          Over the next 4 weeks I'll send 4 short emails — real Indian scam patterns I've seen as a SOC analyst,
          how to defend against each. No spam, no fluff. Reply anytime if you have questions.
        </p>
        <p style="margin:14px 0 0;font-size:13px;color:#94a3b8;">
          — Sahil Anil Nikam<br/>
          <span style="font-size:11px;">Founder & CEO · VRIKAAN · Nashik, India</span>
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:18px 30px;background:#030712;border-top:1px solid rgba(148,163,184,0.08);text-align:center;font-size:11px;color:#64748b;">
        VRIKAAN · Nashik, India · <a href="{{unsubscribe}}" style="color:#94a3b8;">Unsubscribe</a> ·
        <a href="https://vrikaan.com/privacy" style="color:#94a3b8;">Privacy</a>
      </td></tr>
    </table>
  </td></tr>
</table>
```

---

## EMAIL 2 — Day 3 · Top 5 scams

### Settings
- **Subject:** `5 scams India lost ₹11,000 Cr to in 2024`
- **Preview:** `The patterns your bank won't warn you about. 4-min read.`

### Body

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <tr><td align="center" style="padding:30px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#0b1220;border-radius:16px;border:1px solid rgba(148,163,184,0.1);overflow:hidden;">

      <tr><td style="padding:30px;">
        <div style="color:#ef4444;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">⚠ Top 5 scams · 2024</div>
        <h1 style="margin:0 0 20px;color:#fff;font-size:24px;font-weight:800;">The patterns that bled India of ₹11,000 Cr</h1>

        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 18px;">
          {{contact.FIRSTNAME|default:"Hey"}}, here are the 5 scam patterns I see most as a SOC analyst.
          Read once. Send this email to your parents.
        </p>

        <!-- 5 scams -->
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:20px 0;">
          <tr><td style="padding:14px;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;border-radius:6px;">
            <div style="color:#ef4444;font-weight:800;font-size:13px;">1. UPI "wrong transaction" refund scam</div>
            <div style="color:#cbd5e1;font-size:13px;margin-top:6px;">"I sent ₹5,000 to you by mistake, please return." Then they reverse the original via dispute. <a href="https://vrikaan.com/upi-lookup" style="color:#14E3C5;">Check any UPI ID first →</a></div>
          </td></tr>
          <tr><td style="height:10px;"></td></tr>
          <tr><td style="padding:14px;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;border-radius:6px;">
            <div style="color:#ef4444;font-weight:800;font-size:13px;">2. Fake KYC SMS with bank logo</div>
            <div style="color:#cbd5e1;font-size:13px;margin-top:6px;">"KYC pending. Click bit.ly/sbi-update." Real banks never use shorteners. <a href="https://vrikaan.com/scam-check" style="color:#14E3C5;">Paste any SMS to verify →</a></div>
          </td></tr>
          <tr><td style="height:10px;"></td></tr>
          <tr><td style="padding:14px;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;border-radius:6px;">
            <div style="color:#ef4444;font-weight:800;font-size:13px;">3. Loan app harassment → photo morphing</div>
            <div style="color:#cbd5e1;font-size:13px;margin-top:6px;">Miss 1 day on a predatory loan, they morph your photo + WhatsApp-blast your contacts. <a href="https://vrikaan.com/loan-app-check" style="color:#14E3C5;">Check loan app before installing →</a></div>
          </td></tr>
          <tr><td style="height:10px;"></td></tr>
          <tr><td style="padding:14px;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;border-radius:6px;">
            <div style="color:#ef4444;font-weight:800;font-size:13px;">4. AI voice clone — "Mom, send ₹50k"</div>
            <div style="color:#cbd5e1;font-size:13px;margin-top:6px;">3 seconds of your Instagram audio → perfect voice clone. <a href="https://vrikaan.com/safe-word" style="color:#14E3C5;">Set family safe-word now →</a></div>
          </td></tr>
          <tr><td style="height:10px;"></td></tr>
          <tr><td style="padding:14px;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;border-radius:6px;">
            <div style="color:#ef4444;font-weight:800;font-size:13px;">5. WhatsApp investment-tip groups</div>
            <div style="color:#cbd5e1;font-size:13px;margin-top:6px;">Pump-and-dump groups with fake "expert" admins. ₹50k average loss. <a href="https://vrikaan.com/whatsapp-audit" style="color:#14E3C5;">Audit any group's chat export →</a></div>
          </td></tr>
        </table>

        <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.3);padding:16px;border-radius:10px;margin:24px 0;">
          <div style="color:#22c55e;font-weight:800;font-size:13px;margin-bottom:8px;">🚨 Got scammed today?</div>
          <div style="color:#cbd5e1;font-size:13px;">Call 1930 immediately. Then open <a href="https://vrikaan.com/scam-recovery" style="color:#14E3C5;">our recovery hotline</a> for the exact IPC sections, FIR draft, bank dispute flow.</div>
        </div>

        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">
          Email back if you've seen a scam I missed. I read every reply.<br/>
          — Sahil
        </p>
      </td></tr>

      <tr><td style="padding:18px 30px;background:#030712;border-top:1px solid rgba(148,163,184,0.08);text-align:center;font-size:11px;color:#64748b;">
        VRIKAAN · <a href="{{unsubscribe}}" style="color:#94a3b8;">Unsubscribe</a>
      </td></tr>
    </table>
  </td></tr>
</table>
```

---

## EMAIL 3 — Day 7 · Deepfake demo

### Settings
- **Subject:** `AI cloned my mom's voice in 3 seconds 🎙`
- **Preview:** `Watch the demo. Then build your family safe-word. (4 min)`

### Body (HTML — same wrapper template, replace inner content):

```html
<!-- Same outer table wrapper as Email 1, just swap the inner <tr><td> body w/ this -->
<div style="color:#a855f7;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">🎙 Deepfake voice cloning</div>
<h1 style="margin:0 0 20px;color:#fff;font-size:24px;font-weight:800;">3 seconds. That's all an attacker needs.</h1>

<p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 18px;">
  {{contact.FIRSTNAME|default:"Hi"}}, here's the scam pattern hitting Indian parents hardest in 2026:
</p>

<ol style="color:#cbd5e1;font-size:14px;line-height:1.8;padding-left:18px;margin:0 0 20px;">
  <li>Attacker downloads <strong style="color:#fff;">3 sec of your voice</strong> from your Instagram reel</li>
  <li>Feeds it to a free AI voice-clone tool (ElevenLabs, Resemble.ai, others)</li>
  <li>Calls your mom from a spoofed number: <em>"Mummy, accident hua, ₹50,000 bhejo iss UPI pe"</em></li>
  <li>Voice sounds identical. Mom panics. Sends money.</li>
</ol>

<div style="background:rgba(168,85,247,0.06);border-left:3px solid #a855f7;padding:16px;border-radius:8px;margin:20px 0;">
  <div style="color:#a855f7;font-weight:800;font-size:13px;margin-bottom:8px;">The defense — already on VRIKAAN, free</div>
  <p style="margin:0 0 12px;color:#cbd5e1;font-size:13px;line-height:1.7;">
    Set up a <strong style="color:#fff;">family safe-word</strong>. A word only your family knows.
    When ANY urgent call hits, your relative asks for the safe-word. Real you knows it. Voice clone doesn't.
  </p>
  <a href="https://vrikaan.com/safe-word" style="display:inline-block;padding:10px 20px;background:#a855f7;color:#030712;font-weight:800;font-size:13px;text-decoration:none;border-radius:8px;">Set family safe-word →</a>
</div>

<div style="background:rgba(20,227,197,0.06);border:1px solid rgba(20,227,197,0.3);padding:16px;border-radius:10px;margin:24px 0;">
  <div style="color:#14E3C5;font-weight:800;font-size:13px;margin-bottom:8px;">🔍 Bonus: voiceprint vault</div>
  <p style="color:#cbd5e1;font-size:13px;line-height:1.6;margin:0;">
    Pre-record your real voice (30 sec). Next time you get a suspicious recording, compare against the real sample via our
    <a href="https://vrikaan.com/deepfake-audio" style="color:#14E3C5;">Deepfake Audio Detector</a>. 95%+ accuracy.
    <a href="https://vrikaan.com/voiceprint" style="color:#14E3C5;">Record your voiceprint now →</a>
  </p>
</div>

<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">
  Share this email w/ your siblings. Family-wide safe-word = uniform defense.<br/>
  — Sahil
</p>
```

---

## EMAIL 4 — Day 14 · Festival fraud

### Settings
- **Subject:** `Diwali fraud spikes 380%. Here's your shield.`
- **Preview:** `What to watch for + 1-tap WhatsApp share for your family.`
- **Send timing:** ideally 7-10 days before next major Indian festival (Diwali, Holi, Rakhi). Adjust trigger in Brevo to honor seasonality.

### Body inner content

```html
<div style="color:#f59e0b;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">📅 Festival Fraud Forecast</div>
<h1 style="margin:0 0 20px;color:#fff;font-size:24px;font-weight:800;">Scams spike before every Indian festival.</h1>

<p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 18px;">
  {{contact.FIRSTNAME|default:"Hi"}}, in the 7-14 days before each Indian festival, fraud reports jump <strong style="color:#ef4444;">140-380%</strong>.
  Foreign antivirus has no idea this happens. We built a forecast.
</p>

<div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.04));border:1px solid rgba(245,158,11,0.3);padding:18px;border-radius:12px;margin:20px 0;">
  <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#f59e0b;margin-bottom:14px;">Top spikes</div>
  <ul style="color:#cbd5e1;font-size:13px;line-height:1.8;margin:0;padding-left:18px;">
    <li><strong style="color:#fff;">Diwali</strong> — +380% (fake bonus SMS, Flipkart deal scams, customs charges)</li>
    <li><strong style="color:#fff;">Wedding season</strong> — +250% (fake photographer/caterer scams, matrimonial fraud)</li>
    <li><strong style="color:#fff;">Holi</strong> — +210% (party-pass scams, malware APK greetings)</li>
    <li><strong style="color:#fff;">Raksha Bandhan</strong> — +170% (rakhi delivery sites, sibling-impersonation OTP)</li>
    <li><strong style="color:#fff;">Navratri</strong> — +140% (fake Garba passes, Telegram stock tips)</li>
  </ul>
</div>

<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;"><tr><td>
  <a href="https://vrikaan.com/festival-fraud" style="display:inline-block;padding:14px 30px;background:#f59e0b;color:#030712;font-weight:800;font-size:15px;text-decoration:none;border-radius:10px;">See full forecast + family checklist →</a>
</td></tr></table>

<div style="background:rgba(34,197,94,0.06);padding:14px;border-radius:8px;margin:20px 0;">
  <div style="font-size:11px;font-weight:800;color:#22c55e;margin-bottom:6px;">✓ 1-tap family share</div>
  <p style="color:#cbd5e1;font-size:13px;margin:0;">Each forecast page has a WhatsApp share button — pre-formatted briefing for your family group. One tap.</p>
</div>

<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">
  Send this to your parents BEFORE the festival, not during the panic.<br/>
  — Sahil
</p>
```

---

## EMAIL 5 — Day 28 · Pro offer (only if not upgraded)

### Settings
- **Subject A:** `{{contact.FIRSTNAME|default:"Hi"}}, here's an early-supporter discount`
- **Subject B:** `₹500 off VRIKAAN Pro — your first year`
- **Preview:** `₹990 → ₹490. Locked in for life. Expires in 7 days.`
- **Send only if:** Brevo conditional → contact does NOT have attribute `PLAN=pro`

### Body inner content

```html
<div style="color:#6366f1;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">🎁 Early Supporter</div>
<h1 style="margin:0 0 16px;color:#fff;font-size:24px;font-weight:800;">An offer just for you, {{contact.FIRSTNAME|default:"friend"}}.</h1>

<p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 18px;">
  You've been with VRIKAAN for a month. You read 4 emails. You probably ran a few scans.
  I want you to upgrade to <strong style="color:#14E3C5;">Pro</strong> — but I'm not going to do a hard pitch. Here's the math.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:20px 0;background:rgba(99,102,241,0.06);border-radius:12px;border:1px solid rgba(99,102,241,0.25);">
  <tr><td style="padding:24px;text-align:center;">
    <div style="font-size:13px;color:#94a3b8;text-decoration:line-through;">₹990 / year</div>
    <div style="font-size:42px;font-weight:800;color:#14E3C5;font-family:'Space Grotesk',sans-serif;line-height:1;margin:6px 0;">₹490</div>
    <div style="font-size:11px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">first year · locked in for life</div>
    <div style="margin-top:14px;">
      <a href="https://vrikaan.com/pricing?coupon=EARLY490" style="display:inline-block;padding:14px 32px;background:#14E3C5;color:#030712;font-weight:800;font-size:15px;text-decoration:none;border-radius:10px;font-family:'Space Grotesk',sans-serif;">Claim ₹500 off →</a>
    </div>
    <div style="font-size:10px;color:#64748b;margin-top:10px;">Coupon code: <strong style="color:#fff;font-family:ui-monospace,monospace;">EARLY490</strong> · expires in 7 days</div>
  </td></tr>
</table>

<div style="margin:24px 0;">
  <div style="color:#fff;font-weight:800;font-size:14px;margin-bottom:12px;">What Pro unlocks:</div>
  <ul style="color:#cbd5e1;font-size:13px;line-height:1.9;padding-left:18px;margin:0;">
    <li>Unlimited scans across all 50+ tools (free tier = 10/day)</li>
    <li>AI-powered fraud + deepfake + scam detection</li>
    <li>Dark-web monitoring with instant breach alerts</li>
    <li>Password vault with NIST AAL2 2FA</li>
    <li>PDF export for all reports</li>
    <li>Priority email support — 4-hour SLA</li>
    <li>Early access to new tools (Desktop app + Android coming Q2/Q3 2026)</li>
  </ul>
</div>

<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">
  If now's not the right time, that's fine — the free tier stays free forever.
  Reply if you have questions before upgrading.<br/>
  — Sahil
</p>
```

---

## BREVO AUTOMATION SETUP — exact clicks

### Day 0 trigger
1. Brevo Automations → **Create new** → choose "Welcome" template
2. **Trigger:** Contact added to specific list → choose **VRIKAAN Launch List (#3)**
3. **Delay step:** 5 minutes
4. **Email step:** select Email 1 template

### Subsequent emails
5. **Wait** step: 3 days → **Email** step (Email 2)
6. **Wait** 4 days → Email 3
7. **Wait** 7 days → Email 4
8. **Wait** 14 days → **Condition** step:
   - If `contact.attribute.PLAN == "pro"` → END
   - Else → Email 5

### Tracking
- Brevo auto-tracks opens + clicks
- Each link auto-tagged w/ UTM via Brevo (turn ON in template settings)
- View metrics at Automations → your workflow → **Statistics** tab weekly

---

## OPTIONAL A/B TEST PRIORITIES

| Test | What to swap | Why |
|---|---|---|
| Email 1 subject | "Welcome..." vs "🚨 Quick: scan your phone" | Urgency vs friendly opener |
| Email 3 subject | "AI cloned my mom's voice" vs "🎙 Voice clone scam hit India hard" | Personal narrative vs news |
| Email 5 price | ₹490 vs ₹390 | Price elasticity |
| Email 5 CTA | "Claim ₹500 off" vs "Upgrade now" | Discount framing vs upgrade framing |

Run each test 2 weeks min, need ~200 contacts per arm for significance. Brevo's A/B feature handles split.

---

## SET CONTACT ATTRIBUTE TO SKIP EMAIL 5 ON UPGRADE

When a user upgrades to Pro, update their Brevo contact:

```js
// In your existing api/verify-payment.js (or wherever Cashfree webhook confirms Pro upgrade)
import fetch from "node-fetch";  // if needed

await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(userEmail)}`, {
  method: "PUT",
  headers: {
    "api-key": process.env.BREVO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    attributes: { PLAN: "pro", UPGRADED_AT: new Date().toISOString() },
  }),
});
```

Then in Brevo automation, the Day 28 conditional step checks `PLAN == "pro"` and ends the flow.

---

## DELIVERABILITY CHECKLIST (do once before going live)

- [ ] Set up SPF, DKIM, DMARC for vrikaan.com mail (see security report — DKIM via Brevo dashboard, takes 5 min)
- [ ] Verify sender email in Brevo: `hello.vrikaan@gmail.com`
- [ ] Test send all 5 emails to your own Gmail + check inbox vs spam folder
- [ ] Run mail-tester.com — paste the test email's link, target score 8+/10
- [ ] First 100 sends → keep manual eye on Brevo dashboard for bounces / spam reports
- [ ] If bounce rate >5% → list quality issue, audit how you collected emails

---

## TIMELINE TO LIVE

| Day | Action | Time |
|---|---|---|
| Today | Create 5 templates in Brevo · paste HTML | 30 min |
| Today | Build automation workflow | 15 min |
| Day 1 | Test full flow w/ your own email · verify each delay fires | passive (auto) |
| Day 2 | Activate automation for VRIKAAN Launch List (#3) | 1 click |
| Ongoing | Every Monday: check open + click rates · iterate subject lines | 5 min/wk |

Once live, every new subscriber gets the full 28-day journey automatically. Set + forget.
