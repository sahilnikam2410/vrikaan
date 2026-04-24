import { checkRateLimit } from "./_rateLimit.js";

const CASHFREE_API = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

const PRICES = {
  starter_monthly: { amount: 49, name: "Standard Monthly" },
  standard_monthly: { amount: 49, name: "Standard Monthly" },
  starter_annual: { amount: 490, name: "Standard Annual" },
  standard_annual: { amount: 490, name: "Standard Annual" },
  pro_monthly: { amount: 99, name: "Advanced Monthly" },
  advanced_monthly: { amount: 99, name: "Advanced Monthly" },
  pro_annual: { amount: 990, name: "Advanced Annual" },
  advanced_annual: { amount: 990, name: "Advanced Annual" },
  enterprise_monthly: { amount: 199, name: "Enterprise Monthly" },
  enterprise_annual: { amount: 1990, name: "Enterprise Annual" },
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
    const { planKey, billing, email, phone, name } = req.body;

    const priceKey = `${planKey}_${billing}`;
    const priceConfig = PRICES[priceKey];

    if (!priceConfig) {
      return res.status(400).json({ error: "Invalid plan or billing period" });
    }

    const orderId = `SECUVION_${planKey}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const origin = req.headers.origin || "https://vrikaan.com";

    const orderPayload = {
      order_id: orderId,
      order_amount: priceConfig.amount,
      order_currency: "INR",
      order_note: `VRIKAAN ${priceConfig.name} subscription`,
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_email: email || "customer@vrikaan.com",
        customer_phone: phone || "9999999999",
        customer_name: name || "VRIKAAN User",
      },
      order_meta: {
        return_url: `${origin}/checkout?plan=${planKey}&order_id=${orderId}`,
        notify_url: `${origin}/api/cashfree-webhook`,
      },
      order_tags: {
        plan: planKey,
        billing: billing,
      },
    };

    const response = await fetch(CASHFREE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree order error:", data);
      return res.status(response.status).json({ error: data.message || "Failed to create order" });
    }

    return res.status(200).json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      mode: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
    });
  } catch (err) {
    console.error("Cashfree session error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
