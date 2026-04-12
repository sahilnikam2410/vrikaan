import Stripe from "stripe";
import { checkRateLimit } from "./_rateLimit.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  starter_monthly: { amount: 4900, name: "Standard Monthly", interval: "month" },
  standard_monthly: { amount: 4900, name: "Standard Monthly", interval: "month" },
  starter_annual: { amount: 49000, name: "Standard Annual", interval: "year" },
  standard_annual: { amount: 49000, name: "Standard Annual", interval: "year" },
  pro_monthly: { amount: 9900, name: "Advanced Monthly", interval: "month" },
  advanced_monthly: { amount: 9900, name: "Advanced Monthly", interval: "month" },
  pro_annual: { amount: 99000, name: "Advanced Annual", interval: "year" },
  advanced_annual: { amount: 99000, name: "Advanced Annual", interval: "year" },
  enterprise_monthly: { amount: 19900, name: "Enterprise Monthly", interval: "month" },
  enterprise_annual: { amount: 199000, name: "Enterprise Annual", interval: "year" },
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
    const { planKey, billing, email, successUrl, cancelUrl } = req.body;

    const priceKey = `${planKey}_${billing}`;
    const priceConfig = PRICES[priceKey];

    if (!priceConfig) {
      return res.status(400).json({ error: "Invalid plan or billing period" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `SECUVION ${priceConfig.name}`,
              description: `${priceConfig.name} subscription — AI-powered cybersecurity`,
            },
            unit_amount: priceConfig.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        planKey,
        billing,
      },
      success_url: successUrl || `${req.headers.origin}/checkout?success=true&plan=${planKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/checkout?plan=${planKey}`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
