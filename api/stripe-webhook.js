import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Payment succeeded:", {
        sessionId: session.id,
        email: session.customer_email,
        plan: session.metadata?.planKey,
        billing: session.metadata?.billing,
        amount: session.amount_total,
      });
      // Future: update user plan in Firebase here
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.log("Payment failed:", intent.id);
      break;
    }

    default:
      break;
  }

  return res.status(200).json({ received: true });
}
