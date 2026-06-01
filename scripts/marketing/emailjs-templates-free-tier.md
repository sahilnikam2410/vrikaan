# VRIKAAN EmailJS — Free Tier (2 Templates Total)

EmailJS free plan = 2 templates, 200 emails/month. We're using:
- **Welcome** — `template_c9hhl8k`
- **Contact Us / Notify** — `template_i4z3gra`

The Contact Us template becomes a **generic VRIKAAN notify template** that handles:
- Contact form submissions (name + email + subject + message)
- Payment confirmations
- Password reset alerts
- Breach alerts
- Plan-expiry warnings
- Broadcasts / promos

One template, six jobs.

---

## STEP 1 — Set Vercel environment variables

So all four code paths route to your two real templates, set:

```
VITE_EMAILJS_SERVICE_ID            = <your service id from emailjs dashboard>
VITE_EMAILJS_PUBLIC_KEY            = <your public key>
VITE_EMAILJS_WELCOME_TEMPLATE      = template_c9hhl8k
VITE_EMAILJS_PAYMENT_TEMPLATE      = template_i4z3gra
VITE_EMAILJS_PASSWORD_RESET_TEMPLATE = template_i4z3gra
VITE_EMAILJS_NOTIFY_TEMPLATE       = template_i4z3gra
```

Set them at: **vercel.com → vrikaan project → Settings → Environment Variables**.
Apply to **Production + Preview + Development**. Redeploy after saving (env vars only take effect on next build).

---

## TEMPLATE 1 — WELCOME  (`template_c9hhl8k`)

**Subject:** `Welcome to VRIKAAN, {{to_name}}!`
**From Name:** `VRIKAAN`
**From Email:** Use Default Email Address ✓
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### Replace HTML body with:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to VRIKAAN</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030712;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0b1220;border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,0.12);">

          <tr>
            <td style="background:linear-gradient(135deg,#4338CA 0%,#6366F1 50%,#14E3C5 100%);padding:48px 32px;text-align:center;">
              <div style="display:inline-block;width:72px;height:72px;background:#030712;border-radius:18px;line-height:72px;font-size:42px;font-weight:800;color:#14E3C5;font-family:Arial,sans-serif;margin-bottom:20px;">V</div>
              <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:800;letter-spacing:-0.5px;">Welcome to VRIKAAN!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">AI-powered cyber defense · made in India</p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 36px 12px;">
              <p style="margin:0 0 14px;color:#f1f5f9;font-size:17px;line-height:1.6;">Hi <strong>{{to_name}}</strong>,</p>
              <p style="margin:0 0 22px;color:#cbd5e1;font-size:15px;line-height:1.7;">Your account is now <strong style="color:#14E3C5;">active</strong>. You've just joined India's free AI-powered cyber defense platform. Here's what you can do right now:</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;color:#f1f5f9;font-size:14px;">🛡️ &nbsp;Run a <strong>Security Audit</strong> on any website</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #6366F1;border-radius:10px;color:#f1f5f9;font-size:14px;">🕵️ &nbsp;Check if your email was in a <strong>data breach</strong></td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;color:#f1f5f9;font-size:14px;">📱 &nbsp;Paste suspicious SMS / WhatsApp into <strong>Scam Check</strong> AI</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #6366F1;border-radius:10px;color:#f1f5f9;font-size:14px;">🎙️ &nbsp;Detect voice clones with <strong>Deepfake Audio</strong> detector</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;color:#f1f5f9;font-size:14px;">🛰️ &nbsp;Wazuh-style <strong>SOC Dashboard</strong> + MITRE ATT&CK</td></tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr><td align="center">
                  <a href="https://vrikaan.com/dashboard" style="display:inline-block;padding:14px 36px;background:#14E3C5;color:#030712;font-weight:800;font-size:16px;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">Open dashboard →</a>
                </td></tr>
              </table>

              <p style="margin:30px 0 8px;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">Want unlimited scans, AI fraud analysis &amp; priority support?<br><a href="https://vrikaan.com/pricing" style="color:#14E3C5;text-decoration:none;font-weight:600;">View Pro plans — from ₹990/yr</a></p>
            </td>
          </tr>

          <tr><td style="padding:24px 36px 0;"><hr style="border:0;border-top:1px solid rgba(148,163,184,0.15);margin:0;"></td></tr>

          <tr>
            <td style="padding:24px 36px;">
              <p style="margin:0 0 14px;color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Reach us</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#cbd5e1;">
                <tr><td style="padding:4px 0;">💼 <a href="mailto:hr@vrikaan.com" style="color:#14E3C5;text-decoration:none;">hr@vrikaan.com</a> — careers</td></tr>
                <tr><td style="padding:4px 0;">🤖 <a href="mailto:ai@vrikaan.com" style="color:#6366F1;text-decoration:none;">ai@vrikaan.com</a> — AI / product / bugs</td></tr>
                <tr><td style="padding:4px 0;">✉️ <a href="mailto:hello@vrikaan.com" style="color:#22C55E;text-decoration:none;">hello@vrikaan.com</a> — general / press / support</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 36px 32px;background:#030712;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">© 2026 VRIKAAN · Nashik, Maharashtra, India</p>
              <p style="margin:0;color:#64748b;font-size:11px;">Founded by Sahil Anil Nikam &amp; Khushi Ishwar Raigade · SOC Analysts &amp; Cybersecurity Researchers</p>
              <p style="margin:12px 0 0;">
                <a href="https://x.com/vrikaan" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">X</a> ·
                <a href="https://www.linkedin.com/company/vrikaan-ai-cybersecurity" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">LinkedIn</a> ·
                <a href="https://www.instagram.com/vrikaan_official/" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">Instagram</a> ·
                <a href="https://github.com/sahilnikam2410/vrikaan" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">GitHub</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## TEMPLATE 2 — CONTACT US / NOTIFY  (`template_i4z3gra`)  ★ multi-purpose

**Subject:** `{{subject}}`   ← dynamic, lets every call set its own subject
**From Name:** `VRIKAAN`
**From Email:** Use Default Email Address ✓
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### Replace HTML body with:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VRIKAAN Notification</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030712;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0b1220;border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,0.12);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#4338CA 0%,#6366F1 50%,#14E3C5 100%);padding:34px 32px;text-align:center;">
              <div style="display:inline-block;width:54px;height:54px;background:#030712;border-radius:14px;line-height:54px;font-size:30px;font-weight:800;color:#14E3C5;font-family:Arial,sans-serif;margin-bottom:12px;">V</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;line-height:1.3;">{{subject}}</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:34px 36px 8px;">
              <p style="margin:0 0 14px;color:#f1f5f9;font-size:16px;line-height:1.6;">Hi <strong>{{to_name}}</strong>,</p>
              <div style="color:#cbd5e1;font-size:14px;line-height:1.8;white-space:pre-wrap;">{{message}}</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr><td align="center">
                  <a href="https://vrikaan.com/dashboard" style="display:inline-block;padding:13px 32px;background:#14E3C5;color:#030712;font-weight:800;font-size:15px;text-decoration:none;border-radius:12px;">Open VRIKAAN →</a>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- CONTACT-FORM FIELDS (only render if present — EmailJS skips empty vars cleanly) -->
          <tr>
            <td style="padding:20px 36px 0;">
              <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Sender details (if contact form)</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;border-radius:10px;font-size:13px;color:#cbd5e1;">
                <tr><td style="padding:10px 14px;border-bottom:1px solid rgba(148,163,184,0.08);"><strong style="color:#94a3b8;width:80px;display:inline-block;">Name</strong> {{name}}</td></tr>
                <tr><td style="padding:10px 14px;border-bottom:1px solid rgba(148,163,184,0.08);"><strong style="color:#94a3b8;width:80px;display:inline-block;">Email</strong> {{email}}</td></tr>
                <tr><td style="padding:10px 14px;"><strong style="color:#94a3b8;width:80px;display:inline-block;">Plan</strong> {{plan}} · {{amount}} · {{billing}}</td></tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:24px 36px 0;"><hr style="border:0;border-top:1px solid rgba(148,163,184,0.15);margin:0;"></td></tr>

          <!-- ROUTING -->
          <tr>
            <td style="padding:20px 36px;">
              <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Reach us</p>
              <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.9;">
                💼 <a href="mailto:hr@vrikaan.com" style="color:#14E3C5;text-decoration:none;">hr@vrikaan.com</a> — careers<br>
                🤖 <a href="mailto:ai@vrikaan.com" style="color:#6366F1;text-decoration:none;">ai@vrikaan.com</a> — AI / product / bugs<br>
                ✉️ <a href="mailto:hello@vrikaan.com" style="color:#22C55E;text-decoration:none;">hello@vrikaan.com</a> — general / press / support
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:18px 36px 28px;background:#030712;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">© 2026 VRIKAAN · Nashik, India</p>
              <p style="margin:0;color:#64748b;font-size:11px;">Founded by Sahil Anil Nikam &amp; Khushi Ishwar Raigade · SOC Analysts &amp; Cybersecurity Researchers</p>
              <p style="margin:12px 0 0;">
                <a href="https://x.com/vrikaan" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">X</a> ·
                <a href="https://www.linkedin.com/company/vrikaan-ai-cybersecurity" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">LinkedIn</a> ·
                <a href="https://www.instagram.com/vrikaan_official/" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">Instagram</a> ·
                <a href="https://github.com/sahilnikam2410/vrikaan" style="color:#94a3b8;text-decoration:none;font-size:11px;margin:0 6px;">GitHub</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Why this works for all use-cases
EmailJS does NOT error on missing variables — it just substitutes empty string. So when:
- **Contact form** sends `{name, email, subject, message}` → `{{to_name}}`, `{{plan}}`, `{{amount}}`, `{{billing}}` render blank (sender card shows just name + email).
- **Payment** sends `{to_name, to_email, subject, message, plan, amount, billing}` → plan row populates.
- **Password reset** sends `{to_email, subject, message}` → both name and sender-card rows render blank but message body shows the reset notice.
- **Breach / expiry / promo / broadcast** sends `{to_name, to_email, subject, message}` → clean message-only render.

The "Sender details" row only looks meaningful when contact-form-style vars are present. For other use-cases it shows blanks but doesn't break layout.

### Optional cleaner version — hide sender card when empty
If you want the sender card to vanish for non-contact-form emails, **delete the entire** `<!-- CONTACT-FORM FIELDS -->` `<tr>` block (the one with the table containing Name/Email/Plan rows). Loses contact-form context display but keeps every other email perfectly clean.

---

## STEP 2 — Paste flow

For each of the 2 templates:
1. dashboard.emailjs.com → **Email Templates** → click the **edit pencil** ✏️
2. **Subject** field — paste the subject from above (templates 1 + 2 differ)
3. **From Name** — `VRIKAAN`  ·  **From Email** — Use Default ✓  ·  **Reply To** — `hello@vrikaan.com`
4. Click **Edit Content** (top right of Content card)
5. In the popup, switch to **`</>` Code** tab
6. **Select All → Delete** old HTML
7. **Paste** the new HTML from the relevant block
8. Close the modal → **Save** (top right of template page)
9. **Test It** → enter your Gmail → confirm "V" badge + correct subject + clean body

---

## STEP 3 — Vercel env vars (one-time)

vercel.com → vrikaan → **Settings → Environment Variables**:

| Name | Value | Environments |
|---|---|---|
| `VITE_EMAILJS_SERVICE_ID` | your service id (e.g. `service_abc1234`) | Production, Preview, Development |
| `VITE_EMAILJS_PUBLIC_KEY` | your public key (e.g. `abcDEF123ghi`) | Production, Preview, Development |
| `VITE_EMAILJS_WELCOME_TEMPLATE` | `template_c9hhl8k` | all 3 |
| `VITE_EMAILJS_PAYMENT_TEMPLATE` | `template_i4z3gra` | all 3 |
| `VITE_EMAILJS_PASSWORD_RESET_TEMPLATE` | `template_i4z3gra` | all 3 |
| `VITE_EMAILJS_NOTIFY_TEMPLATE` | `template_i4z3gra` | all 3 |

Then **Deployments tab → click the latest deploy → 3-dot menu → Redeploy** (env vars only take effect on next build).

---

## STEP 4 — Test each path

After redeploy, test from production:

| Path | Trigger | Template fires |
|---|---|---|
| Welcome | Sign up at vrikaan.com/signup with a fresh email | Welcome (template_c9hhl8k) |
| Contact | Submit form at vrikaan.com/contact | Notify (template_i4z3gra) — sender card visible |
| Payment | Complete a Cashfree checkout | Notify — plan/amount/billing visible |
| Password reset | Click "Forgot password" → enter email | Notify — message body only |

If you see SECUVION anywhere after pasting → it's still cached in your browser. Hard-reload (Ctrl+Shift+R) or check the actual email in Gmail.

---

## FREE-TIER LIMITS — keep an eye on

| Limit | EmailJS Free | Your usage |
|---|---|---|
| Templates | 2 | 2 ✓ |
| Emails per month | 200 | Welcome + contact ≈ 50-100/mo at current traffic — fine |
| Custom from-domain | Paid only | Falls back to `noreply@emailjs.com` — okay for transactional |
| Attachments | Paid only | Don't need any |

If you hit 200/month, options:
1. Upgrade EmailJS to Personal $9/mo = 1,000 emails + 3 templates
2. Switch to **Resend.com** (free 100/day = 3,000/mo) — requires DNS + small code rewrite
3. Switch to **Brevo** (free 300/day) — most generous free tier

For now, 2-template + 200/mo plan is enough.
