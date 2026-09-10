/**
 * @vitest-environment node
 *
 * The webhook signature is the only thing between a forged POST and a
 * granted plan, since the handler goes on to call grantPlanFromOrder.
 */
import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifySignature } from "./cashfree-webhook.js";

const SECRET = "cf-test-secret-key";
const TIMESTAMP = "1757500000";
const BODY = JSON.stringify({
  type: "PAYMENT_SUCCESS_WEBHOOK",
  data: {
    order: { order_id: "ord_abc123", order_amount: 999 },
    payment: { payment_status: "SUCCESS", cf_payment_id: 55501 },
  },
});

/** Cashfree v3: base64(HMAC-SHA256(timestamp + rawBody, clientSecret)). */
function sign(body, timestamp, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}${body}`).digest("base64");
}

describe("verifySignature", () => {
  it("accepts a correctly signed payload", () => {
    expect(verifySignature(BODY, TIMESTAMP, sign(BODY, TIMESTAMP), SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const good = sign(BODY, TIMESTAMP);
    const tampered = BODY.replace('"order_amount":999', '"order_amount":1');
    expect(verifySignature(tampered, TIMESTAMP, good, SECRET)).toBe(false);
  });

  it("rejects a replayed signature under a different timestamp", () => {
    const good = sign(BODY, TIMESTAMP);
    expect(verifySignature(BODY, "1757509999", good, SECRET)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(verifySignature(BODY, TIMESTAMP, sign(BODY, TIMESTAMP, "not-our-secret"), SECRET)).toBe(false);
  });

  it("rejects missing timestamp, signature or secret", () => {
    const good = sign(BODY, TIMESTAMP);
    expect(verifySignature(BODY, undefined, good, SECRET)).toBe(false);
    expect(verifySignature(BODY, TIMESTAMP, undefined, SECRET)).toBe(false);
    expect(verifySignature(BODY, TIMESTAMP, good, undefined)).toBe(false);
  });

  it("rejects a signature of the wrong length without throwing", () => {
    // timingSafeEqual throws on length mismatch; the guard must catch it.
    expect(() => verifySignature(BODY, TIMESTAMP, "short", SECRET)).not.toThrow();
    expect(verifySignature(BODY, TIMESTAMP, "short", SECRET)).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifySignature(BODY, TIMESTAMP, "", SECRET)).toBe(false);
  });
});
