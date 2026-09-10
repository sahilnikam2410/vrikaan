/**
 * @vitest-environment node
 *
 * Plan grants arrive twice by design: /api/verify-payment fires on the
 * browser redirect, /api/cashfree-webhook fires server-to-server. The
 * orders/{orderId} guard inside the transaction is what makes that safe,
 * and what stops a replayed PAID order id extending a plan forever.
 *
 * The fake below is a small in-memory Firestore: enough of get/set and
 * runTransaction to exercise the real control flow.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

let store;

function makeFakeFirestore() {
  const ref = (path) => ({
    path,
    async get() {
      const data = store[path];
      return { exists: data !== undefined, data: () => data };
    },
    // The grant also writes an audit row at users/{uid}/payments/{orderId}.
    collection: (sub) => ({ doc: (id) => ref(`${path}/${sub}/${id}`) }),
  });
  return {
    collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
    async runTransaction(fn) {
      const tx = {
        get: (r) => r.get(),
        set: (r, data, opts) => {
          store[r.path] = opts?.merge ? { ...(store[r.path] || {}), ...data } : data;
        },
      };
      return fn(tx);
    },
  };
}

vi.mock("./_firebaseAdmin.js", () => ({
  getAdminFirestore: () => makeFakeFirestore(),
}));

const { grantPlanFromOrder, PLAN_MAP } = await import("./_grantPlan.js");

const order = (over = {}) => ({
  order_id: "ord_1",
  order_amount: 999,
  order_status: "PAID",
  order_tags: { plan: "pro", billing: "monthly", uid: "u1" },
  ...over,
});

beforeEach(() => { store = {}; });

describe("PLAN_MAP", () => {
  it("normalises legacy tags onto canonical entitlements", () => {
    expect(PLAN_MAP.advanced).toBe("pro");
    expect(PLAN_MAP.standard).toBe("starter");
  });

  it("has no mapping for seat add-ons, so they grant nothing", () => {
    expect(PLAN_MAP.family_addon).toBeUndefined();
  });
});

describe("grantPlanFromOrder", () => {
  it("grants the plan on a first, verified PAID order", async () => {
    const out = await grantPlanFromOrder(order());
    expect(out.granted).toBe(true);
    expect(out.plan).toBe("pro");
    expect(out.durationDays).toBe(30);
    expect(store["users/u1"].plan).toBe("pro");
    expect(store["users/u1"].lastOrderId).toBe("ord_1");
    expect(store["orders/ord_1"].status).toBe("PAID");
  });

  it("is idempotent — a second call on the same order grants nothing", async () => {
    const first = await grantPlanFromOrder(order());
    const firstExpiry = store["users/u1"].planExpiresAt;

    const second = await grantPlanFromOrder(order());
    expect(first.granted).toBe(true);
    expect(second.granted).toBe(false);
    expect(second.already).toBe(true);
    // The critical assertion: the entitlement did not move.
    expect(store["users/u1"].planExpiresAt).toBe(firstExpiry);
  });

  it("does not extend the plan when an old PAID order id is replayed", async () => {
    await grantPlanFromOrder(order());
    const expiry = store["users/u1"].planExpiresAt;
    for (let i = 0; i < 5; i++) await grantPlanFromOrder(order());
    expect(store["users/u1"].planExpiresAt).toBe(expiry);
  });

  it("gives an annual order 365 days", async () => {
    const out = await grantPlanFromOrder(order({ order_tags: { plan: "pro", billing: "annual", uid: "u1" } }));
    expect(out.durationDays).toBe(365);
    expect(out.billing).toBe("annual");
  });

  it("stacks a renewal onto remaining time instead of truncating it", async () => {
    const future = new Date(Date.now() + 20 * 86400000).toISOString();
    store["users/u1"] = { plan: "pro", planExpiresAt: future };

    await grantPlanFromOrder(order({ order_id: "ord_renew" }));
    const newExpiry = Date.parse(store["users/u1"].planExpiresAt);
    // ~20 remaining + 30 new, allowing a day of slack for clock/rounding.
    const expected = Date.parse(future) + 30 * 86400000;
    expect(Math.abs(newExpiry - expected)).toBeLessThan(86400000);
    expect(newExpiry).toBeGreaterThan(Date.parse(future));
  });

  it("records but does not grant a non-plan order (family seat add-on)", async () => {
    const out = await grantPlanFromOrder(order({ order_tags: { plan: "family_addon", uid: "u1" } }));
    expect(out.granted).toBe(false);
    expect(out.skipped).toBe("non-plan-order");
    expect(store["users/u1"]).toBeUndefined();
    // Still recorded, so a retry can't reprocess it as something else.
    expect(store["orders/ord_1"].skipped).toBe("non-plan-order");
  });

  it("reports noUid when the order carries no user, and grants nobody", async () => {
    const out = await grantPlanFromOrder(order({ order_tags: { plan: "pro", billing: "monthly" } }));
    expect(out.granted).toBe(false);
    expect(out.noUid).toBe(true);
    expect(Object.keys(store).filter((k) => k.startsWith("users/"))).toHaveLength(0);
  });

  it("refuses an order with no id", async () => {
    const out = await grantPlanFromOrder(order({ order_id: "" }));
    expect(out.granted).toBe(false);
    expect(out.error).toBe("no-order-id");
  });
});
