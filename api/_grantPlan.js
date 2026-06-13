/**
 * Shared, idempotent plan-grant for Cashfree orders.
 * Used by BOTH /api/verify-payment (browser redirect) and
 * /api/cashfree-webhook (server-to-server backup). Idempotency via a top-level
 * `orders/{orderId}` doc inside a transaction guarantees a single grant per
 * order — so replaying an old PAID orderId can NOT keep extending the plan,
 * and the two entry points can't double-grant each other.
 *
 * Underscore-prefixed so Vercel ignores it as a function.
 */
import { getAdminFirestore } from "./_firebaseAdmin.js";

const CASHFREE_API_BASE = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

// Maps the order's plan tag → the canonical entitlement stored on the user.
// family_addon / unknown tags are intentionally absent → no top-level grant
// (seat add-ons are handled by handleFamilySeatAddon in tools.js).
export const PLAN_MAP = {
  starter: "starter", standard: "starter",
  pro: "pro", advanced: "pro",
  family: "family",
  enterprise: "enterprise",
};

/** Fetch + verify an order with Cashfree. Returns { ok, paid, data }. */
export async function fetchCashfreeOrder(orderId) {
  const r = await fetch(`${CASHFREE_API_BASE}/${orderId}`, {
    method: "GET",
    headers: {
      "x-api-version": "2023-08-01",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    },
  });
  let data = null;
  try { data = await r.json(); } catch { /* non-json */ }
  return { ok: r.ok, paid: data?.order_status === "PAID", data };
}

/**
 * Idempotently grant the plan described by a verified, PAID Cashfree order.
 * @param {object} cfData  the order object from Cashfree (must be PAID)
 * @returns {Promise<object>} { granted, already?, noUid?, skipped?, plan?, billing?, expiresAt?, durationDays? }
 */
export async function grantPlanFromOrder(cfData) {
  const db = getAdminFirestore();
  if (!db) return { granted: false, error: "admin-unavailable" };

  const orderId = String(cfData.order_id || "");
  if (!orderId) return { granted: false, error: "no-order-id" };

  const planKey = cfData.order_tags?.plan || "";
  const billing = cfData.order_tags?.billing === "annual" ? "annual" : "monthly";
  const uid = cfData.order_tags?.uid ? String(cfData.order_tags.uid) : "";
  const plan = PLAN_MAP[planKey];
  const durationDays = billing === "annual" ? 365 : 30;

  const orderRef = db.collection("orders").doc(orderId);

  return db.runTransaction(async (tx) => {
    const existing = await tx.get(orderRef);
    if (existing.exists) {
      const d = existing.data();
      return { granted: false, already: true, plan: d.plan || plan, billing: d.billing, expiresAt: d.expiresAt || null, durationDays };
    }

    // Not a top-level plan (e.g. family_addon) → record order, no entitlement.
    if (!plan) {
      tx.set(orderRef, { orderId, uid: uid || null, planTag: planKey, billing, amount: cfData.order_amount || 0, status: "PAID", grantedAt: new Date().toISOString(), skipped: "non-plan-order" });
      return { granted: false, skipped: "non-plan-order" };
    }

    // No uid on the order → can't attribute. Record so a later call can't
    // re-process, but report noUid so the redirect flow can surface it.
    if (!uid) {
      tx.set(orderRef, { orderId, uid: null, plan, billing, amount: cfData.order_amount || 0, status: "PAID", grantedAt: new Date().toISOString(), skipped: "no-uid" });
      return { granted: false, noUid: true, plan, billing, durationDays };
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await tx.get(userRef);
    const now = Date.now();
    // Stack onto any remaining time so legit renewals extend, not truncate.
    const prevExp = userSnap.exists ? (Date.parse(userSnap.data().planExpiresAt || "") || 0) : 0;
    const base = Math.max(now, prevExp);
    const expiresAt = new Date(base + durationDays * 86400000).toISOString();

    tx.set(userRef, {
      plan, planBilling: billing,
      planActivatedAt: new Date(now).toISOString(),
      planExpiresAt: expiresAt,
      lastOrderId: orderId,
    }, { merge: true });

    tx.set(orderRef, {
      orderId, uid, plan, billing,
      amount: cfData.order_amount || 0, status: "PAID",
      grantedAt: new Date(now).toISOString(), expiresAt,
    });

    return { granted: true, plan, billing, expiresAt, durationDays };
  });
}
