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
 *   Both this webhook and /api/verify-payment grant the plan via the
 *   shared, idempotent grantPlanFromOrder (Admin SDK). verify-payment
 *   fires on the browser redirect; this webhook is the server-to-server
 *   backup for when the user closes the tab before the redirect lands.
 *   The orders/{orderId} transaction guard guarantees a single grant
 *   regardless of which path (or how many retries) arrives first.
 */
import crypto from "crypto";
import { fetchCashfreeOrder, grantPlanFromOrder } from "./_grantPlan.js";

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
    // Cashfree's v3 webhook (PG dashboard → Developers → Webhooks) signs
    // payloads with the API Client Secret — there is NO separate webhook
    // secret in their model. CASHFREE_WEBHOOK_SECRET is supported as an
    // override only if you've configured a custom signing key out-of-band.
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;

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

    // AUTHORITATIVE BACKUP GRANT — covers the case where the user closes the
    // tab before the /checkout redirect fires /api/verify-payment. We re-fetch
    // the full order from Cashfree (the webhook body omits order_tags/uid) and
    // grant idempotently; the orders/{orderId} guard prevents a double grant.
    const isSuccess = /SUCCESS/i.test(eventType || "") || /SUCCESS/i.test(payment.payment_status || "");
    if (isSuccess && order.order_id) {
      try {
        const { ok, paid, data: cfData } = await fetchCashfreeOrder(order.order_id);
        if (ok && paid && cfData) {
          const result = await grantPlanFromOrder(cfData);
          console.log("Cashfree webhook grant:", { orderId: order.order_id, granted: result.granted, already: result.already, noUid: result.noUid, skipped: result.skipped, plan: result.plan });
        }
      } catch (e) {
        console.error("Cashfree webhook grant error:", e.message);
      }
    }

    // Cashfree expects a 200 within a few seconds — anything else is retried
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Cashfree webhook error:", err.message);
    // Still return 200 to prevent infinite retries on parse errors
    return res.status(200).json({ received: false, error: err.message });
  }
}
