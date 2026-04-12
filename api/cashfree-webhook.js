import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify webhook signature
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = JSON.stringify(req.body);

    if (process.env.CASHFREE_WEBHOOK_SECRET && signature) {
      const payload = timestamp + rawBody;
      const expectedSig = crypto
        .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
        .update(payload)
        .digest("base64");

      if (signature !== expectedSig) {
        console.error("Webhook signature mismatch");
        return res.status(400).json({ error: "Invalid signature" });
      }
    }

    const event = req.body;

    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.data?.payment?.payment_status === "SUCCESS") {
      const payment = event.data?.payment || {};
      const order = event.data?.order || {};
      console.log("Cashfree payment succeeded:", {
        orderId: order.order_id,
        paymentId: payment.cf_payment_id,
        amount: order.order_amount,
        method: payment.payment_group,
        tags: order.order_tags,
      });
      // Future: update user plan in Firebase here
    } else if (event.data?.payment?.payment_status === "FAILED") {
      console.log("Cashfree payment failed:", event.data?.order?.order_id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
