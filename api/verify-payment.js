import { checkRateLimit } from "./_rateLimit.js";

const CASHFREE_API_BASE = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

const PLAN_MAP = {
  starter: "starter", standard: "starter",
  pro: "pro", advanced: "pro",
  enterprise: "enterprise",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const rl = checkRateLimit(ip, 10, 60000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // Verify payment with Cashfree API
    const cfResponse = await fetch(`${CASHFREE_API_BASE}/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok) {
      console.error("Cashfree verify error:", cfData);
      return res.status(400).json({ error: "Failed to verify order with Cashfree" });
    }

    if (cfData.order_status !== "PAID") {
      return res.status(400).json({
        error: "Payment not completed",
        status: cfData.order_status,
      });
    }

    // Payment verified — return data for frontend to update Firestore
    const planKey = cfData.order_tags?.plan || "pro";
    const billing = cfData.order_tags?.billing || "monthly";
    const normalizedPlan = PLAN_MAP[planKey] || "pro";
    const durationDays = billing === "annual" ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    return res.status(200).json({
      verified: true,
      plan: normalizedPlan,
      billing,
      amount: cfData.order_amount,
      orderId: cfData.order_id,
      cfOrderId: cfData.cf_order_id,
      expiresAt: expiresAt.toISOString(),
      durationDays,
    });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}
