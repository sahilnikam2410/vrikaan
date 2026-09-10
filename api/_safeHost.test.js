/**
 * @vitest-environment node
 *
 * SSRF guard. /api/ssl fetches a caller-supplied host from inside our
 * network, so the address checks below are what stop it being used as a
 * reachability probe for cloud metadata and internal services.
 */
import { describe, it, expect } from "vitest";
import { isPrivateAddress, normalizeHost, assertPublicHost } from "./_safeHost.js";

describe("isPrivateAddress", () => {
  it("blocks the cloud metadata address", () => {
    expect(isPrivateAddress("169.254.169.254")).toBe(true);
  });

  it("blocks loopback, private and CGNAT ranges", () => {
    for (const ip of ["127.0.0.1", "10.0.4.17", "172.16.0.1", "172.31.255.255",
                      "192.168.1.1", "100.64.0.1", "0.0.0.0"]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
  });

  it("allows genuinely public IPv4", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "192.167.1.1", "99.83.190.102"]) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });

  it("blocks IPv6 loopback, link-local and unique-local", () => {
    for (const ip of ["::1", "::", "fe80::1", "fd00::1", "fc00::1", "ff02::1"]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
  });

  it("blocks IPv4-mapped IPv6 that points at metadata", () => {
    expect(isPrivateAddress("::ffff:169.254.169.254")).toBe(true);
    expect(isPrivateAddress("::ffff:127.0.0.1")).toBe(true);
  });

  it("allows public IPv6", () => {
    expect(isPrivateAddress("2606:4700:4700::1111")).toBe(false);
  });

  it("treats anything that is not an IP as unsafe", () => {
    expect(isPrivateAddress("example.com")).toBe(true);
    expect(isPrivateAddress("")).toBe(true);
  });
});

describe("normalizeHost", () => {
  it("reduces a URL to its hostname", () => {
    expect(normalizeHost("https://example.com/path?q=1#frag")).toBe("example.com");
    expect(normalizeHost("example.com")).toBe("example.com");
  });

  it("lowercases and strips a trailing root dot", () => {
    expect(normalizeHost("EXAMPLE.COM.")).toBe("example.com");
  });

  it("rejects embedded credentials", () => {
    expect(normalizeHost("https://user:pw@evil.tld")).toBeNull();
    expect(normalizeHost("https://user@evil.tld")).toBeNull();
  });

  it("rejects non-http schemes", () => {
    expect(normalizeHost("file:///etc/passwd")).toBeNull();
    expect(normalizeHost("gopher://internal:70/")).toBeNull();
  });

  it("rejects empty and over-long input", () => {
    expect(normalizeHost("")).toBeNull();
    expect(normalizeHost("  ")).toBeNull();
    expect(normalizeHost(`${"a".repeat(300)}.com`)).toBeNull();
  });
});

describe("assertPublicHost", () => {
  it("rejects localhost and reserved names without touching DNS", async () => {
    expect((await assertPublicHost("localhost")).reason).toBe("reserved-host");
    expect((await assertPublicHost("metadata.google.internal")).reason).toBe("reserved-host");
  });

  it("rejects internal suffixes", async () => {
    for (const h of ["printer.local", "db.internal", "app.corp", "box.lan"]) {
      const out = await assertPublicHost(h);
      expect(out.ok, h).toBe(false);
      expect(out.reason, h).toBe("reserved-suffix");
    }
  });

  it("rejects a bare label with no dot", async () => {
    expect((await assertPublicHost("intranet")).reason).toBe("not-fqdn");
  });

  it("rejects IP literals — private ones outright", async () => {
    expect((await assertPublicHost("169.254.169.254")).reason).toBe("private-address");
    expect((await assertPublicHost("10.0.0.1")).reason).toBe("private-address");
  });

  it("rejects public IP literals too — the grade comes from the cert name", async () => {
    expect((await assertPublicHost("8.8.8.8")).reason).toBe("ip-literal-not-supported");
  });

  it("rejects empty input", async () => {
    expect((await assertPublicHost("")).reason).toBe("invalid-host");
  });
});
