import emailjs from "emailjs-com";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const WELCOME_TEMPLATE = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE || "YOUR_WELCOME_TEMPLATE";
const PAYMENT_TEMPLATE = import.meta.env.VITE_EMAILJS_PAYMENT_TEMPLATE || "YOUR_PAYMENT_TEMPLATE";
const PASSWORD_RESET_TEMPLATE = import.meta.env.VITE_EMAILJS_PASSWORD_RESET_TEMPLATE || "YOUR_PASSWORD_RESET_TEMPLATE";
const NOTIFY_TEMPLATE = import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE || WELCOME_TEMPLATE;

function safeSend(templateId, params) {
  if (SERVICE_ID === "YOUR_SERVICE_ID" || PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    console.warn("EmailJS not configured — skipping email send");
    return Promise.resolve();
  }
  return emailjs.send(SERVICE_ID, templateId, { from_name: "VRIKAAN", ...params }, PUBLIC_KEY);
}

/**
 * Welcome email — sent immediately after signup.
 * Includes a promotional intro to key features.
 */
export async function sendWelcomeEmail(name, email) {
  try {
    await safeSend(WELCOME_TEMPLATE, {
      to_name: name,
      to_email: email,
      subject: `Welcome to VRIKAAN, ${name}!`,
      message: `Welcome to VRIKAAN, ${name}!

Your account is now active. Here's what you can do right away:

- Run a Security Audit on any website
- Check if your email was in a data breach
- Scan files for malware with our Hash Scanner
- Test your browser privacy with Fingerprint Test
- Train yourself to spot phishing with our Phishing Trainer

Get started: https://vrikaan.com/dashboard

Want more power? Upgrade to a premium plan for unlimited scans, AI-powered analysis, and priority support.

Stay safe,
The VRIKAAN Team`,
    });
  } catch (error) {
    console.warn("Failed to send welcome email:", error);
  }
}

/**
 * Payment confirmation email — sent after successful payment verification.
 */
export async function sendPaymentConfirmation(name, email, plan, amount, billing) {
  try {
    await safeSend(PAYMENT_TEMPLATE, {
      to_name: name,
      to_email: email,
      subject: `Payment Confirmed — VRIKAAN ${plan} Plan`,
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      amount: `INR ${amount}`,
      billing: billing || "monthly",
      message: `Hi ${name},

Your payment of INR ${amount} has been confirmed!

Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${billing || "monthly"})
Status: Active

You now have full access to premium features including:
- Unlimited security scans and lookups
- AI-powered fraud analysis
- Priority dark web monitoring
- PDF export for all reports
- Advanced Security Audit

Access your dashboard: https://vrikaan.com/dashboard

Thank you for choosing VRIKAAN!
The VRIKAAN Team`,
    });
  } catch (error) {
    console.warn("Failed to send payment confirmation email:", error);
  }
}

/**
 * Password reset notification.
 */
export async function sendPasswordResetNotification(email) {
  try {
    await safeSend(PASSWORD_RESET_TEMPLATE, {
      to_email: email,
      subject: "Password Reset — VRIKAAN",
      message: "A password reset has been requested for your VRIKAAN account. If you did not request this, please ignore this email. Otherwise, check your inbox for the reset link from Firebase.",
    });
  } catch (error) {
    console.warn("Failed to send password reset notification:", error);
  }
}

/**
 * Subscription expiry warning — call when user logs in and plan expires within 3 days.
 */
export async function sendExpiryWarning(name, email, plan, expiresAt) {
  try {
    const expDate = new Date(expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    await safeSend(NOTIFY_TEMPLATE, {
      to_name: name,
      to_email: email,
      subject: `Your VRIKAAN ${plan} plan expires soon`,
      message: `Hi ${name},

Your VRIKAAN ${plan} plan expires on ${expDate}.

Renew now to keep access to all premium features without interruption:
https://vrikaan.com/pricing

After expiry, your account will revert to the free plan with limited daily usage.

Stay protected,
The VRIKAAN Team`,
    });
  } catch (error) {
    console.warn("Failed to send expiry warning:", error);
  }
}

/**
 * Breach alert — sent when a breach check finds results.
 */
export async function sendBreachAlert(name, email, breachCount) {
  try {
    await safeSend(NOTIFY_TEMPLATE, {
      to_name: name,
      to_email: email,
      subject: `Security Alert — ${breachCount} breach(es) found`,
      message: `Hi ${name},

Our Dark Web Monitor detected your email in ${breachCount} data breach(es).

We strongly recommend:
1. Change passwords for affected accounts immediately
2. Enable 2FA on all accounts (see our 2FA Guide)
3. Use unique passwords (try our Password Vault)
4. Run a full Security Audit on your accounts

Check details: https://vrikaan.com/dark-web-monitor

Stay vigilant,
The VRIKAAN Team`,
    });
  } catch (error) {
    console.warn("Failed to send breach alert:", error);
  }
}

/**
 * Promotional/feature highlight email — sent 3 days after signup.
 */
export async function sendPromoEmail(name, email) {
  try {
    await safeSend(NOTIFY_TEMPLATE, {
      to_name: name,
      to_email: email,
      subject: `${name}, have you tried these VRIKAAN tools?`,
      message: `Hi ${name},

Here are some tools you might not have tried yet:

1. WHOIS Lookup — Check any domain's registration info
2. Security Headers Scanner — Grade any website's security
3. DNS Leak Test — See if your VPN is leaking
4. File Hash Scanner — Check files for known malware
5. Phishing Trainer — Test your phishing detection skills

Explore all tools: https://vrikaan.com/dashboard

Want unlimited access? Check out our premium plans:
https://vrikaan.com/pricing

Refer friends and earn free upgrades:
https://vrikaan.com/referral

Best,
The VRIKAAN Team`,
    });
  } catch (error) {
    console.warn("Failed to send promo email:", error);
  }
}
