/**
 * @vitest-environment node
 *
 * The cron gate protects a 5,000-recipient WhatsApp broadcast and blog
 * deletion. It used to accept the secret as `?key=`, which parks it in
 * access logs and browser history.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { hasCronSecret, requireCronSecret } from "./_cronAuth.js";

const SECRET = "s3cr3t-cron-value";

function req(headers = {}, query = {}) {
  return { headers, query };
}

function fakeRes() {
  const out = { statusCode: null, body: null };
  return {
    out,
    status(code) { out.statusCode = code; return this; },
    json(payload) { out.body = payload; return this; },
  };
}

beforeEach(() => { process.env.CRON_SECRET = SECRET; });
afterEach(() => { delete process.env.CRON_SECRET; });

describe("hasCronSecret", () => {
  it("accepts the secret as a Bearer header", () => {
    expect(hasCronSecret(req({ authorization: `Bearer ${SECRET}` }))).toBe(true);
  });

  it("accepts a bare header value without the Bearer prefix", () => {
    expect(hasCronSecret(req({ authorization: SECRET }))).toBe(true);
  });

  it("REJECTS the secret in a query parameter", () => {
    expect(hasCronSecret(req({}, { key: SECRET }))).toBe(false);
  });

  it("rejects a wrong secret", () => {
    expect(hasCronSecret(req({ authorization: `Bearer ${SECRET}x` }))).toBe(false);
    expect(hasCronSecret(req({ authorization: "Bearer " }))).toBe(false);
  });

  it("rejects a correct prefix that is truncated", () => {
    expect(hasCronSecret(req({ authorization: `Bearer ${SECRET.slice(0, -1)}` }))).toBe(false);
  });

  it("fails closed when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    expect(hasCronSecret(req({ authorization: "Bearer anything" }))).toBe(false);
    expect(hasCronSecret(req({ authorization: "Bearer " }))).toBe(false);
  });

  it("tolerates a request with no headers object", () => {
    expect(hasCronSecret({})).toBe(false);
  });
});

describe("requireCronSecret", () => {
  it("returns true and writes nothing when authorised", () => {
    const res = fakeRes();
    expect(requireCronSecret(req({ authorization: `Bearer ${SECRET}` }), res)).toBe(true);
    expect(res.out.statusCode).toBeNull();
  });

  it("writes 401 and returns false when not authorised", () => {
    const res = fakeRes();
    expect(requireCronSecret(req({}, { key: SECRET }), res)).toBe(false);
    expect(res.out.statusCode).toBe(401);
    expect(res.out.body.error).toBe("Unauthorized");
  });
});
