/**
 * Cashfree Webhook Receiver
 * --------------------------------------------
 * Cashfree posts payment events here (PAYMENT_SUCCESS_WEBHOOK,
 * PAYMENT_FAILED_WEBHOOK, PAYMENT_USER_DROPPED_WEBHOOK, etc.).
 *
 * Configure in Cashfree dashboard:
 *   Developers → Webhook URLs → Add:
 *     URL: https://www.vrikaan.com/api/cashfree-webhook
 *     Events: PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK
 *
 * Security model:
 *   1. Signature verified using CASHFREE_SECRET_KEY (HMAC-SHA256
 *      over the timestamp + raw body, base64 encoded).
 *   2. Unsigned requests are rejected with 401.
 *
 * Persistence note:
 *   The browser-redirect verification flow in /api/verify-payment
 *   already updates Firestore via the authenticated client. This
 *   webhook is a backup for the rare case where a user closes the
 *   tab before the redirect lands, so we log the order id and
 *   leave it for the next /api/verify-payment call to reconcile
 *   when the user re-opens the site.
 *
 *   For full server-side Firestore writes from this webhook we'd
 *   need firebase-admin + a service account key — currently
 *   blocked by the Firebase project's org policy. See
 *   _firebaseAdmin.js for context.
 */
import crypto from "crypto";

// Disable Vercel's body parser so we can read the raw body for signature verification
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function verifySignature(rawBody, timestamp, signatureHeader, secret) {
  if (!timestamp || !signatureHeader || !secret) return false;
  const signed = `${timestamp}${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("base64");
  // timing-safe compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await readRawBody(req);
    const timestamp = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];
    // Cashfree signs webhooks with a SEPARATE secret configured in the
    // Cashfree dashboard's Webhooks section — NOT the API client secret.
    // Falls back to CASHFREE_SECRET_KEY only for backwards-compat during
    // migration; should be removed once CASHFREE_WEBHOOK_SECRET is set.
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
    if (!process.env.CASHFREE_WEBHOOK_SECRET) {
      console.warn("Cashfree webhook: CASHFREE_WEBHOOK_SECRET not set, falling back to CASHFREE_SECRET_KEY (incorrect — fix in Vercel env)");
    }

    if (!verifySignature(rawBody, timestamp, signature, secret)) {
      console.warn("Cashfree webhook: invalid signature", { timestamp });
      return res.status(401).json({ error: "Invalid signature" });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const eventType = payload.type || payload.data?.type;
    const order = payload.data?.order || {};
    const payment = payload.data?.payment || {};

    // Structured log — visible in Vercel function logs for reconciliation
    console.log("Cashfree webhook:", {
      type: eventType,
      orderId: order.order_id,
      orderAmount: order.order_amount,
      paymentStatus: payment.payment_status,
      cfPaymentId: payment.cf_payment_id,
      paymentMethod: payment.payment_group,
      timestamp,
    });

    // Cashfree expects a 200 within a few seconds — anything else is retried
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Cashfree webhook error:", err.message);
    // Still return 200 to prevent infinite retries on parse errors
    return res.status(200).json({ received: false, error: err.message });
  }
}
