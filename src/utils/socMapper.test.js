import { describe, it, expect } from "vitest";
import { mapEvent, mapEvents, summarizeEvents, bucketByTime, severityBand, SEVERITY_BANDS, EVENT_RULES, FALLBACK_RULE } from "./socMapper.js";

describe("severityBand", () => {
  it("maps each Wazuh level to the right band", () => {
    expect(severityBand(0).label).toBe("info");
    expect(severityBand(3).label).toBe("info");
    expect(severityBand(4).label).toBe("low");
    expect(severityBand(7).label).toBe("low");
    expect(severityBand(8).label).toBe("medium");
    expect(severityBand(11).label).toBe("medium");
    expect(severityBand(12).label).toBe("high");
    expect(severityBand(13).label).toBe("high");
    expect(severityBand(14).label).toBe("critical");
    expect(severityBand(15).label).toBe("critical");
  });

  it("exposes 5 bands with valid hex colors", () => {
    expect(SEVERITY_BANDS).toHaveLength(5);
    SEVERITY_BANDS.forEach((b) => {
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(b.min).toBeLessThanOrEqual(b.max);
    });
  });
});

describe("mapEvent", () => {
  it("maps a failed login to brute-force / Initial Access", () => {
    const out = mapEvent({ id: "x", type: "login_failed", timestamp: new Date() });
    expect(out.rule.level).toBe(8);
    expect(out.tactic).toBe("TA0001");
    expect(out.technique).toBe("T1110");
    expect(out.severity).toBe("medium");
  });

  it("maps breach detection to Collection / Cloud Storage", () => {
    const out = mapEvent({ id: "x", type: "breach_detected" });
    expect(out.tactic).toBe("TA0009");
    expect(out.technique).toBe("T1530");
    expect(out.severity).toBe("high");
  });

  it("maps MFA disabled as elevated risk", () => {
    const out = mapEvent({ id: "x", type: "totp_disabled" });
    expect(out.rule.level).toBe(10);
    expect(out.severity).toBe("medium");
  });

  it("falls back when type is unknown", () => {
    const out = mapEvent({ id: "x", type: "some_unknown_thing" });
    expect(out.rule.level).toBe(FALLBACK_RULE.level);
    expect(out.tactic).toBe(FALLBACK_RULE.tactic);
  });

  it("accepts Firestore Timestamp objects (with toDate)", () => {
    const fakeTs = { toDate: () => new Date("2026-01-01T00:00:00Z") };
    const out = mapEvent({ id: "x", type: "login", timestamp: fakeTs });
    expect(out.timestamp.getUTCFullYear()).toBe(2026);
  });

  it("generates an id when none provided", () => {
    const out = mapEvent({ type: "login" });
    expect(out.id).toBeTruthy();
  });

  it("preserves agent + raw payload", () => {
    const row = { id: "x", type: "login", agent: "device-42", extra: "hello" };
    const out = mapEvent(row);
    expect(out.agent).toBe("device-42");
    expect(out.raw).toBe(row);
  });
});

describe("EVENT_RULES coverage", () => {
  it("every rule has a tactic id starting with TA", () => {
    EVENT_RULES.forEach((r) => {
      expect(r.tactic).toMatch(/^TA\d{4}$/);
      expect(r.level).toBeGreaterThanOrEqual(0);
      expect(r.level).toBeLessThanOrEqual(15);
      expect(r.ruleId).toBeGreaterThan(0);
    });
  });
});

describe("summarizeEvents", () => {
  it("counts severity buckets + top tactics + top rules", () => {
    const events = mapEvents([
      { id: "a", type: "login_failed" },
      { id: "b", type: "login_failed" },
      { id: "c", type: "breach_detected" },
      { id: "d", type: "scan_run" },
    ]);
    const sum = summarizeEvents(events);
    expect(sum.total).toBe(4);
    expect(sum.severity.medium).toBe(2);    // 2 failed logins (level 8)
    expect(sum.severity.high).toBe(1);      // 1 breach (level 12)
    expect(sum.severity.info).toBe(1);      // 1 scan (level 3)
    expect(sum.topTactics[0].id).toBe("TA0001"); // most common
    expect(sum.topRules[0].count).toBe(2);
  });

  it("handles empty input", () => {
    const sum = summarizeEvents([]);
    expect(sum.total).toBe(0);
    expect(sum.topTactics).toEqual([]);
  });
});

describe("bucketByTime", () => {
  it("buckets events into the requested number of bins", () => {
    const now = Date.now();
    const events = [
      { timestamp: new Date(now - 60 * 1000) },
      { timestamp: new Date(now - 60 * 1000) },
      { timestamp: new Date(now - 23 * 3600 * 1000) },
    ];
    const out = bucketByTime(events, 24, 24 * 3600 * 1000);
    expect(out).toHaveLength(24);
    expect(out.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("ignores events outside the window", () => {
    const events = [{ timestamp: new Date(Date.now() - 48 * 3600 * 1000) }];
    const out = bucketByTime(events, 24, 24 * 3600 * 1000);
    expect(out.reduce((a, b) => a + b, 0)).toBe(0);
  });
});
