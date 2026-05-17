# VRIKAAN EmailJS Templates — Full HTML Bodies

4 ready-to-paste templates. Email-safe HTML (inline CSS only, table layout, no flexbox — renders on Gmail / Outlook / Apple Mail / Yahoo).

**How to paste in EmailJS dashboard:**
1. dashboard.emailjs.com → **Email Templates** → open the template
2. Click **Edit Content** (top-right of Content card)
3. In the modal, click the **`</>` Code** tab (not WYSIWYG)
4. **Select All → Delete** the old HTML
5. Paste the new HTML block from below
6. Click **Save** in the modal → then **Save** at top-right of template page

Per-template **Subject** + **From Name** + **Reply To** settings are listed first.

---

## 1️⃣ WELCOME TEMPLATE  (`VITE_EMAILJS_WELCOME_TEMPLATE`)

**Subject:** `Welcome to VRIKAAN, {{to_name}}!`
**From Name:** `VRIKAAN`
**From Email:** Use Default Email Address ✓
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### HTML body
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

          <!-- HERO -->
          <tr>
            <td style="background:linear-gradient(135deg,#4338CA 0%,#6366F1 50%,#14E3C5 100%);padding:48px 32px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:72px;height:72px;background:#030712;border-radius:18px;line-height:72px;font-size:42px;font-weight:800;color:#14E3C5;font-family:Arial,sans-serif;margin-bottom:20px;">V</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:800;letter-spacing:-0.5px;">Welcome to VRIKAAN!</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">AI-powered cyber defense · made in India</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 36px 12px;">
              <p style="margin:0 0 14px;color:#f1f5f9;font-size:17px;line-height:1.6;">Hi <strong>{{to_name}}</strong>,</p>
              <p style="margin:0 0 22px;color:#cbd5e1;font-size:15px;line-height:1.7;">Your account is now <strong style="color:#14E3C5;">active</strong>. You've just joined India's free AI-powered cyber defense platform. Here's what you can do right now:</p>

              <!-- Feature pills -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;margin-bottom:8px;color:#f1f5f9;font-size:14px;">🛡️ &nbsp;Run a <strong>Security Audit</strong> on any website</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #6366F1;border-radius:10px;color:#f1f5f9;font-size:14px;">🕵️ &nbsp;Check if your email was in a <strong>data breach</strong></td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;color:#f1f5f9;font-size:14px;">🔬 &nbsp;Scan files for malware with <strong>Hash Scanner</strong></td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #6366F1;border-radius:10px;color:#f1f5f9;font-size:14px;">📱 &nbsp;Paste suspicious SMS / WhatsApp into <strong>Scam Check</strong> AI</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #14E3C5;border-radius:10px;color:#f1f5f9;font-size:14px;">🎙️ &nbsp;Detect voice clones with <strong>Deepfake Audio</strong> detector</td></tr>
                <tr><td style="height:8px;"></td></tr>
                <tr><td style="padding:10px 16px;background:#111827;border-left:3px solid #6366F1;border-radius:10px;color:#f1f5f9;font-size:14px;">🛰️ &nbsp;Wazuh-style <strong>SOC Dashboard</strong> + MITRE ATT&CK</td></tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="https://vrikaan.com/dashboard" style="display:inline-block;padding:14px 36px;background:#14E3C5;color:#030712;font-weight:800;font-size:16px;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">Open dashboard →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:30px 0 8px;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">Want unlimited scans, AI fraud analysis &amp; priority support?<br><a href="https://vrikaan.com/pricing" style="color:#14E3C5;text-decoration:none;font-weight:600;">View Pro plans — from ₹990/yr</a></p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding:24px 36px 0;"><hr style="border:0;border-top:1px solid rgba(148,163,184,0.15);margin:0;"></td></tr>

          <!-- ROUTING -->
          <tr>
            <td style="padding:24px 36px;">
              <p style="margin:0 0 14px;color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Reach us</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#cbd5e1;">
                <tr><td style="padding:4px 0;">💼 <a href="mailto:hr.vrikaan@gmail.com" style="color:#14E3C5;text-decoration:none;">hr.vrikaan@gmail.com</a> — careers</td></tr>
                <tr><td style="padding:4px 0;">🤖 <a href="mailto:vrikaan.ai@gmail.com" style="color:#6366F1;text-decoration:none;">vrikaan.ai@gmail.com</a> — AI / product / bugs</td></tr>
                <tr><td style="padding:4px 0;">✉️ <a href="mailto:hello@vrikaan.com" style="color:#22C55E;text-decoration:none;">hello@vrikaan.com</a> — general / press / support</td></tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
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

## 2️⃣ PAYMENT CONFIRMATION  (`VITE_EMAILJS_PAYMENT_TEMPLATE`)

**Subject:** `Payment Confirmed — VRIKAAN {{plan}} Plan`
**From Name:** `VRIKAAN`
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### HTML body
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0b1220;border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,0.12);">

        <tr><td style="background:linear-gradient(135deg,#16A34A 0%,#22C55E 100%);padding:42px 32px;text-align:center;">
          <div style="display:inline-block;width:64px;height:64px;background:#030712;border-radius:50%;line-height:64px;font-size:32px;color:#22C55E;margin-bottom:14px;">✓</div>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">Payment Confirmed</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Welcome to VRIKAAN {{plan}}</p>
        </td></tr>

        <tr><td style="padding:36px 36px 8px;">
          <p style="margin:0 0 22px;color:#cbd5e1;font-size:15px;line-height:1.7;">Hi <strong style="color:#f1f5f9;">{{to_name}}</strong>, your payment landed safely and your plan is now <strong style="color:#22C55E;">ACTIVE</strong>.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;border-radius:14px;border:1px solid rgba(20,227,197,0.2);">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(148,163,184,0.1);">
                <span style="display:inline-block;width:120px;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Plan</span>
                <strong style="color:#14E3C5;font-size:16px;">{{plan}}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(148,163,184,0.1);">
                <span style="display:inline-block;width:120px;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Amount</span>
                <strong style="color:#f1f5f9;font-size:16px;">{{amount}}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(148,163,184,0.1);">
                <span style="display:inline-block;width:120px;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Billing</span>
                <strong style="color:#f1f5f9;font-size:16px;">{{billing}}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <span style="display:inline-block;width:120px;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Status</span>
                <span style="display:inline-block;padding:4px 12px;background:#22C55E;color:#030712;font-size:11px;font-weight:700;border-radius:999px;letter-spacing:1px;">ACTIVE</span>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 12px;color:#cbd5e1;font-size:14px;line-height:1.7;">You now have access to:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="color:#cbd5e1;font-size:13px;line-height:1.9;">
            <tr><td>✓ &nbsp;Unlimited security scans &amp; lookups</td></tr>
            <tr><td>✓ &nbsp;AI-powered fraud &amp; scam analysis</td></tr>
            <tr><td>✓ &nbsp;Priority dark-web monitoring</td></tr>
            <tr><td>✓ &nbsp;PDF export for all reports</td></tr>
            <tr><td>✓ &nbsp;Wazuh-style SOC dashboard + MITRE ATT&CK</td></tr>
            <tr><td>✓ &nbsp;Priority email support &lt; 4 hrs</td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr><td align="center">
            <a href="https://vrikaan.com/dashboard" style="display:inline-block;padding:14px 36px;background:#14E3C5;color:#030712;font-weight:800;font-size:16px;text-decoration:none;border-radius:12px;">Open dashboard →</a>
          </td></tr></table>

          <p style="margin:24px 0 0;color:#64748b;font-size:11px;text-align:center;">Need an invoice or refund? Reply to this email or use <a href="https://vrikaan.com/refund-policy" style="color:#94a3b8;">refund policy</a>.</p>
        </td></tr>

        <tr><td style="padding:20px 36px 32px;background:#030712;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
          <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">© 2026 VRIKAAN · Nashik, India · <a href="mailto:hello@vrikaan.com" style="color:#14E3C5;text-decoration:none;">hello@vrikaan.com</a></p>
          <p style="margin:0;color:#64748b;font-size:11px;">AI-powered cyber defense · Sahil Anil Nikam &amp; Khushi Ishwar Raigade</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 3️⃣ PASSWORD RESET  (`VITE_EMAILJS_PASSWORD_RESET_TEMPLATE`)

**Subject:** `Password reset — VRIKAAN`
**From Name:** `VRIKAAN Security`
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### HTML body
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#0b1220;border-radius:20px;overflow:hidden;border:1px solid rgba(239,68,68,0.25);">

        <tr><td style="background:linear-gradient(135deg,#7F1D1D 0%,#DC2626 100%);padding:36px 32px;text-align:center;">
          <div style="display:inline-block;width:56px;height:56px;background:#030712;border-radius:14px;line-height:56px;font-size:26px;color:#EF4444;margin-bottom:12px;">🔐</div>
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Password reset requested</h1>
        </td></tr>

        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 18px;color:#cbd5e1;font-size:15px;line-height:1.7;">A password reset has been requested for your VRIKAAN account.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;border-left:3px solid #14E3C5;border-radius:10px;margin:18px 0;">
            <tr><td style="padding:14px 18px;color:#cbd5e1;font-size:13px;line-height:1.6;">📥 Check your inbox for a <strong style="color:#14E3C5;">reset link from Firebase Auth</strong> (subject: "Reset your password for vrikaan.com"). The link expires in 1 hour.</td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;border-left:3px solid #EF4444;border-radius:10px;margin:18px 0;">
            <tr><td style="padding:14px 18px;color:#cbd5e1;font-size:13px;line-height:1.6;">⚠️ <strong style="color:#EF4444;">Did not request this?</strong> Ignore this email and the link will expire harmlessly. Then change your password from <a href="https://vrikaan.com/dashboard" style="color:#14E3C5;text-decoration:none;">your dashboard</a> as a precaution.</td></tr>
          </table>

          <p style="margin:24px 0 8px;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">Security tip: enable <a href="https://vrikaan.com/2fa-guide" style="color:#14E3C5;text-decoration:none;">2-factor authentication (TOTP)</a> to make password attacks useless.</p>
        </td></tr>

        <tr><td style="padding:18px 36px 28px;background:#030712;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
          <p style="margin:0;color:#64748b;font-size:11px;">© 2026 VRIKAAN · Nashik, India · Questions: <a href="mailto:hello@vrikaan.com" style="color:#94a3b8;">hello@vrikaan.com</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 4️⃣ NOTIFY / BROADCAST / BREACH / EXPIRY / PROMO  (`VITE_EMAILJS_NOTIFY_TEMPLATE`)

Generic template — receives `{{subject}}` + `{{message}}` from code, so the same template covers expiry warning, breach alert, broadcast, and promo. The `message` is plain text — we wrap it in styled paragraphs.

**Subject:** `{{subject}}`
**From Name:** `VRIKAAN`
**Reply To:** `hello@vrikaan.com`
**To Email:** `{{to_email}}`

### HTML body
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0b1220;border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,0.12);">

        <tr><td style="background:linear-gradient(135deg,#4338CA 0%,#6366F1 50%,#14E3C5 100%);padding:34px 32px;text-align:center;">
          <div style="display:inline-block;width:54px;height:54px;background:#030712;border-radius:14px;line-height:54px;font-size:30px;font-weight:800;color:#14E3C5;margin-bottom:12px;font-family:Arial,sans-serif;">V</div>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">{{subject}}</h1>
        </td></tr>

        <tr><td style="padding:34px 36px 8px;">
          <p style="margin:0 0 14px;color:#f1f5f9;font-size:16px;line-height:1.6;">Hi <strong>{{to_name}}</strong>,</p>
          <div style="color:#cbd5e1;font-size:14px;line-height:1.8;white-space:pre-wrap;">{{message}}</div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr><td align="center">
            <a href="https://vrikaan.com/dashboard" style="display:inline-block;padding:13px 32px;background:#14E3C5;color:#030712;font-weight:800;font-size:15px;text-decoration:none;border-radius:12px;">Open VRIKAAN →</a>
          </td></tr></table>
        </td></tr>

        <tr><td style="padding:24px 36px 0;"><hr style="border:0;border-top:1px solid rgba(148,163,184,0.15);margin:0;"></td></tr>

        <tr><td style="padding:20px 36px;">
          <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Reach us</p>
          <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.8;">
            💼 <a href="mailto:hr.vrikaan@gmail.com" style="color:#14E3C5;text-decoration:none;">hr.vrikaan@gmail.com</a> — careers ·
            🤖 <a href="mailto:vrikaan.ai@gmail.com" style="color:#6366F1;text-decoration:none;">vrikaan.ai@gmail.com</a> — AI / product ·
            ✉️ <a href="mailto:hello@vrikaan.com" style="color:#22C55E;text-decoration:none;">hello@vrikaan.com</a> — general
          </p>
        </td></tr>

        <tr><td style="padding:18px 36px 28px;background:#030712;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">© 2026 VRIKAAN · Nashik, India</p>
          <p style="margin:0;color:#64748b;font-size:11px;">Founded by Sahil Anil Nikam &amp; Khushi Ishwar Raigade · SOC Analysts &amp; Cybersecurity Researchers</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## ✅ POST-PASTE CHECKLIST

After saving all 4 templates:

1. **Test it** — Each template page has a **Test It** button (top-right). Send a test to your own Gmail. Check on phone too (Gmail mobile renders strict).
2. **Confirm From Name = VRIKAAN** on every template (not SECUVION, not blank).
3. **Confirm Reply To = hello@vrikaan.com** (or `hr.vrikaan@gmail.com` if it's a careers-specific template).
4. **Remove the "S" avatar block** — your screenshot showed an "S" badge. The HTML above replaces it with a **"V"** badge using inline DIV (no image, so no CDN to update).
5. **Set From Email to a verified domain** for higher inbox-rate. Default "Use Default Email Address" works but goes via `noreply@emailjs.com` which can land in Promotions tab. Verify `noreply@vrikaan.com` in EmailJS → Account → Domain Verification for best deliverability.
6. **Variable check** — make sure the **Content** body uses `{{to_name}}`, `{{to_email}}`, `{{subject}}`, `{{message}}`, `{{plan}}`, `{{amount}}`, `{{billing}}` exactly (double curly braces, lowercase). EmailJS is case-sensitive.

---

## VARIABLE REFERENCE — what each template needs

| Template | Required variables |
|---|---|
| Welcome | `to_name`, `to_email` |
| Payment | `to_name`, `to_email`, `plan`, `amount`, `billing` |
| Password Reset | `to_email` |
| Notify (generic) | `to_name`, `to_email`, `subject`, `message` |

If a variable is missing in the sent payload, EmailJS renders `{{var_name}}` literally — looks broken. The code in `src/services/emailService.js` already passes all required variables for each template, so just don't rename the variable names in the templates.

---

## DELIVERABILITY TIPS

- **SPF/DKIM/DMARC** — if you own `vrikaan.com` DNS, set up SPF + DKIM records for EmailJS sender. Steps: EmailJS dashboard → Email Services → your SMTP service → "DNS Records to add". Inbox rates jump from ~70% → ~98%.
- **Avoid spam words in subject** — "FREE", "ACT NOW", "100%", excessive emojis. Current templates are clean.
- **Plain-text version** — EmailJS auto-generates from HTML, but you can override under the "Plain text" tab. Empty plain-text version raises spam score.
- **Pre-header** — first 90 chars of body show as Gmail preview. Welcome's first sentence "Hi {{to_name}}, your account is now active..." is intentional.
