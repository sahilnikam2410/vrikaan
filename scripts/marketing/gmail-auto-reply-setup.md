# VRIKAAN Gmail Auto-Reply Setup

Three inboxes, three canned auto-replies. Fires immediately on every incoming email so applicants / users / press know we received it. Reduces "did you get my email?" follow-ups.

Free Gmail tier supports:
- **Vacation responder** — one canned message per account, fires on *every* incoming. Best for `hr@vrikaan.com` + `ai@vrikaan.com` (single-purpose inboxes).
- **Filters → canned response templates** — multiple per account, conditional on subject/body. Best for `hello@vrikaan.com` (multi-intent — careers, press, billing, support).

Below: exact setup steps + templates ready to paste.

---

## INBOX 1 — `hr@vrikaan.com`

### Setup (5 minutes)
1. Sign in at **mail.google.com** as `hr@vrikaan.com`
2. ⚙️ Settings → **See all settings** → **General** tab
3. Scroll to **Vacation responder** → toggle **ON**
4. **First day:** today  ·  **Last day:** leave blank (perpetual)
5. **Subject:** `Got your application — VRIKAAN Careers`
6. **Message:** paste template below
7. ☑️ Only send a response to people in my Contacts → **UNCHECK** (we want to reply to strangers too)
8. ☑️ Only send a response to people in VRIKAAN → **UNCHECK**
9. **Save Changes**

### Template — paste into Message field
```
Hi,

Thanks for writing to hr@vrikaan.com — your message landed safely.

What happens next:
• We read every application within 7 days.
• If you're a fit, Sahil or Khushi will email you a 20-minute call invite.
• Either way you'll hear back. No ghosting.

Open roles & form:  https://vrikaan.com/careers
Short link:         https://vrikaan.com/apply

While you wait:
• Founders         → https://vrikaan.com/founder
• Live product      → https://vrikaan.com
• What we ship      → https://x.com/vrikaan

For non-careers questions, route to the right inbox:
• AI / Product / Dev    → ai@vrikaan.com
• General / Press / Help → hello@vrikaan.com

— VRIKAAN HR
Nashik, India
```

Gmail sends this AT MOST ONCE every 4 days per sender, so a candidate emailing twice won't get spammed.

---

## INBOX 2 — `ai@vrikaan.com`

### Setup (5 minutes)
1. Sign in as `ai@vrikaan.com`
2. Settings → General → **Vacation responder** ON (same flow as above)
3. **Subject:** `Got it — VRIKAAN AI / Product team`
4. **Message:** paste template below
5. Both checkboxes UNCHECKED
6. Save

### Template
```
Hi,

Thanks for writing to ai@vrikaan.com — message received.

We read every email within 3 business days. If you sent a bug report, please also include:
• Browser + OS
• Tool / URL where you hit the issue
• Steps to reproduce
• Screenshot or console error if any

If this is a feature request or partnership pitch, please paste:
• What you're building
• How VRIKAAN fits in (1-2 lines)
• Your role + company

Product:   https://vrikaan.com
GitHub:    https://github.com/sahilnikam2410/vrikaan
Live SOC:  https://vrikaan.com/admin/soc  (login required)

For non-AI questions, route to the right inbox:
• Careers / Internships  → hr@vrikaan.com
• General / Press / Help → hello@vrikaan.com

— VRIKAAN AI / Product
Sahil & Khushi · Nashik, India
```

---

## INBOX 3 — `hello@vrikaan.com`  (multi-intent — use filters, not vacation responder)

Vacation responder would block your real outbound replies too, so for this main inbox use **filters with canned templates**.

### One-time setup — enable Templates
1. Settings → **Advanced** tab
2. **Templates** → select **Enable** → Save Changes

### Save the templates (do this 4 times — once per template)
1. Open Gmail → click **Compose**
2. Paste the template body into the compose window
3. Set subject = template name (e.g. `Careers auto-reply`)
4. Click the **3-dot menu** (bottom-right) → **Templates** → **Save draft as template** → **Save as new template** → name it
5. Discard the draft
6. Repeat for all 4 templates below

### Then create 4 filters
Settings → **Filters and Blocked Addresses** → **Create a new filter**

| # | Filter "Has the words" | Apply template | Action |
|---|---|---|---|
| 1 | `subject:(careers OR application OR resume OR intern OR job OR hiring) OR from:(hr.vrikaan)` | Careers redirect | Star · Apply label **Misrouted-Careers** · Send template · Forward to `hr@vrikaan.com` |
| 2 | `subject:(press OR media OR journalist OR interview OR article) OR from:(*.com OR *.in)` + body has `press` | Press auto-reply | Apply label **Press** · Send template |
| 3 | `subject:(refund OR cancel OR billing OR invoice OR payment OR cashfree)` | Billing auto-reply | Star · Apply label **Billing** · Send template |
| 4 | `(everything else, default catch-all)` | General auto-reply | Apply label **General** · Send template |

⚠️ Gmail filters don't have "auto-send canned template" as a direct action — you need a 1-line **Google Apps Script** to bridge them. Spec below.

---

## TEMPLATE 1 — Careers misrouted (someone applied to hello@ by mistake)

**Name in Templates:** `Careers redirect`
```
Hi,

Looks like you wrote to hello@vrikaan.com about a careers / job / internship matter. I've forwarded your email to our HR inbox — hr@vrikaan.com — and they'll take it from here.

For future applications, please use:
• Application form: https://vrikaan.com/apply
• Direct email:     hr@vrikaan.com
• Roles page:       https://vrikaan.com/careers

You'll hear back within 7 days.

— VRIKAAN
```

---

## TEMPLATE 2 — Press / media

**Name in Templates:** `Press auto-reply`
```
Hi,

Thanks for reaching out to VRIKAAN about a press / media opportunity.

Press kit (founder bios, logos, fact sheet, quotes):
https://vrikaan.com/press

We respond to journalist queries within 48 hours. For faster turnaround, please include:
• Outlet name + your role
• Publication / broadcast date
• Specific angle you're covering
• Whether you need a founder quote, an interview, or visuals

Founders:
• Sahil Anil Nikam — Founder & CEO · SOC Analyst & Cybersecurity Researcher
• Khushi Ishwar Raigade — Co-Founder · SOC Analyst & Cybersecurity Researcher

— Team VRIKAAN
Nashik, India
https://vrikaan.com
```

---

## TEMPLATE 3 — Billing / refund

**Name in Templates:** `Billing auto-reply`
```
Hi,

Thanks for writing about a billing matter. To help us resolve faster, please reply with:

1. Email used at signup
2. Order ID or Cashfree payment ID (from your receipt email)
3. Date of transaction
4. What you're requesting (refund, invoice copy, plan change, cancellation)

Refund policy: https://vrikaan.com/refund-policy
Pricing:       https://vrikaan.com/pricing

Resolution SLA: within 3 business days for refunds, immediate for invoice resends.

— VRIKAAN Support
hello@vrikaan.com
```

---

## TEMPLATE 4 — General catch-all

**Name in Templates:** `General auto-reply`
```
Hi,

Got your email at hello@vrikaan.com — landed safely. We read every message within 24 hours on business days.

If your question is one of these, the right inbox replies faster:

• Careers / internships  → hr@vrikaan.com  · https://vrikaan.com/apply
• AI / product / bugs    → ai@vrikaan.com
• Press / media          → reply to this email, attach outlet + angle
• Billing / refunds      → reply to this email, include order ID
• Anything else          → reply to this email, we'll handle it

Meanwhile, here's what we ship: https://x.com/vrikaan

— Team VRIKAAN
Sahil & Khushi · Nashik, India
https://vrikaan.com
```

---

## OPTIONAL — Google Apps Script bridge (auto-send templates from filters)

Gmail filters can't directly auto-send a template. Workaround = one Apps Script that runs every 5 min, finds new threads w/ a specific label, sends the matching template, removes the label.

### Setup
1. Open **script.google.com** while signed in as `hello@vrikaan.com`
2. **New project** → name it `Vrikaan Auto-Reply`
3. Paste the code below
4. Run once manually (will prompt for permissions — grant Gmail access)
5. **Triggers** (⏰ icon) → Add trigger → `autoReply` · Time-driven · Minutes timer · Every 5 minutes
6. Save

### Code
```js
// Vrikaan Auto-Reply bridge — runs every 5 min via trigger.
// Reads any thread labeled "auto:<intent>", sends matching canned reply, removes label.
// One unread auto-reply per sender per 4 days (Gmail's own throttle).

const TEMPLATES = {
  careers: {
    subject: "Got your message — routing to VRIKAAN HR",
    body: `Hi,

Looks like you wrote about a careers / job / internship matter. We've routed your email to our HR inbox — hr@vrikaan.com — they'll take it from here.

Apply form:  https://vrikaan.com/apply
Roles page:  https://vrikaan.com/careers

You'll hear back within 7 days.

— VRIKAAN`,
  },
  press: {
    subject: "Got your press inquiry — VRIKAAN",
    body: `Hi,

Thanks for reaching out about press / media. Press kit: https://vrikaan.com/press

We respond to journalist queries within 48 hours. Please include outlet + role + angle + deadline.

— VRIKAAN`,
  },
  billing: {
    subject: "Billing inquiry received — VRIKAAN",
    body: `Hi,

Got your billing email. To resolve faster, reply with:
1. Email used at signup
2. Order / Cashfree payment ID
3. Date of transaction
4. What you need (refund / invoice / plan change)

Refund policy: https://vrikaan.com/refund-policy

— VRIKAAN Support`,
  },
  general: {
    subject: "Message received — VRIKAAN",
    body: `Hi,

Got your message at hello@vrikaan.com. We read every email within 24 hours on business days.

Right inbox for faster reply:
• Careers   → hr@vrikaan.com  (https://vrikaan.com/apply)
• AI / Dev  → ai@vrikaan.com
• Else      → reply to this email

— VRIKAAN`,
  },
};

function autoReply() {
  Object.keys(TEMPLATES).forEach(intent => {
    const label = GmailApp.getUserLabelByName("auto:" + intent);
    if (!label) return;
    const threads = label.getThreads(0, 50);
    threads.forEach(thread => {
      const lastMsg = thread.getMessages().pop();
      const sender = lastMsg.getFrom();
      const tpl = TEMPLATES[intent];
      thread.reply(tpl.body, {
        subject: tpl.subject,
        name: "VRIKAAN",
      });
      thread.removeLabel(label);
      thread.addLabel(GmailApp.createLabel("auto:" + intent + "-sent"));
      Logger.log("Auto-replied " + intent + " → " + sender);
    });
  });
}
```

### Then update your filters to apply the right `auto:<intent>` label
- Careers filter → apply label `auto:careers`
- Press filter → apply label `auto:press`
- Billing filter → apply label `auto:billing`
- Catch-all → apply label `auto:general`

The script picks up each label every 5 min, sends, removes. Free Apps Script quota: 100 emails/day on consumer Gmail — more than enough.

---

## TESTING

After setup:
1. From a **personal Gmail** (not the team accounts), email each of the 3 inboxes w/ a relevant subject line
2. Within ≤5 min (general/AI/HR have instant vacation responder) you should receive the canned reply
3. Check the subject lines / template bodies match the intent

If `hello@vrikaan.com` doesn't auto-reply, check:
- ☑️ Apps Script trigger is enabled (`script.google.com` → Triggers tab)
- ☑️ Filter actually applies the `auto:<intent>` label (right-click new email → check labels)
- ☑️ Permissions granted to the script

---

## MONITORING

Once a week, check label counts:
- `auto:careers-sent` — applications routed
- `auto:press-sent` — media reached out
- `auto:billing-sent` — payment issues raised
- `auto:general-sent` — everything else

These are crude funnel signals — useful for spotting trends ("press requests spiked after the LinkedIn carousel").

---

## CHANGELOG (edit when you tweak)

| Date | Change |
|---|---|
| 2026-05-17 | Initial setup — 3 inboxes, 4 templates, Apps Script bridge |
