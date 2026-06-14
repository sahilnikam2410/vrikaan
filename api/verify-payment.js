import { checkRateLimit } from "./_rateLimit.js";
import { fetchCashfreeOrder, grantPlanFromOrder } from "./_grantPlan.js";

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

    // Verify payment with Cashfree API (server-side, authoritative).
    const { ok, paid, data: cfData } = await fetchCashfreeOrder(orderId);

    if (!ok || !cfData) {
      console.error("Cashfree verify error:", cfData);
      return res.status(400).json({ error: "Failed to verify order with Cashfree" });
    }

    if (!paid) {
      return res.status(400).json({
        error: "Payment not completed",
        status: cfData.order_status,
      });
    }

    // Idempotent, server-authoritative grant. Safe to call repeatedly —
    // the orders/{orderId} guard means a replay can't re-extend the plan.
    const result = await grantPlanFromOrder(cfData);
    if (result.error) {
      console.error("verify-payment: grant failed", result.error, "order", orderId);
    }
    if (result.noUid) {
      console.warn("verify-payment: order has no uid tag — plan not attributed", orderId);
    }

    return res.status(200).json({
      verified: true,
      plan: result.plan || cfData.order_tags?.plan || "pro",
      billing: result.billing || cfData.order_tags?.billing || "monthly",
      amount: cfData.order_amount,
      orderId: cfData.order_id,
      cfOrderId: cfData.cf_order_id,
      expiresAt: result.expiresAt || null,
      durationDays: result.durationDays || (cfData.order_tags?.billing === "annual" ? 365 : 30),
      alreadyProcessed: !!result.already,
    });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}
