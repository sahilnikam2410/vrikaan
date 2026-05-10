import { describe, it, expect } from "vitest";
import {
  severityRank,
  maxSeverity,
  gradeFromScore,
  computeDeduction,
  scoreFromChecks,
  normalizeTarget,
  findRiskySubdomains,
  SEVERITY_RANK,
} from "./vulnHelpers.js";

describe("severityRank", () => {
  it("ranks critical highest", () => {
    expect(severityRank("critical")).toBeGreaterThan(severityRank("high"));
    expect(severityRank("high")).toBeGreaterThan(severityRank("medium"));
    expect(severityRank("medium")).toBeGreaterThan(severityRank("low"));
    expect(severityRank("low")).toBeGreaterThan(severityRank("info"));
  });
  it("returns 0 for unknown severity", () => {
    expect(severityRank("garbage")).toBe(0);
    expect(severityRank(undefined)).toBe(0);
  });
  it("matches the SEVERITY_RANK table", () => {
    Object.entries(SEVERITY_RANK).forEach(([k, v]) => {
      expect(severityRank(k)).toBe(v);
    });
  });
});

describe("maxSeverity", () => {
  it("returns the more severe of two values", () => {
    expect(maxSeverity("low", "critical")).toBe("critical");
    expect(maxSeverity("medium", "low")).toBe("medium");
    expect(maxSeverity("info", "info")).toBe("info");
  });
  it("returns first arg when ranks are equal", () => {
    expect(maxSeverity("low", "low")).toBe("low");
  });
});

describe("gradeFromScore", () => {
  it("maps the documented bands", () => {
    expect(gradeFromScore(100)).toBe("A");
    expect(gradeFromScore(90)).toBe("A");
    expect(gradeFromScore(89)).toBe("B");
    expect(gradeFromScore(75)).toBe("B");
    expect(gradeFromScore(74)).toBe("C");
    expect(gradeFromScore(60)).toBe("C");
    expect(gradeFromScore(40)).toBe("D");
    expect(gradeFromScore(39)).toBe("F");
    expect(gradeFromScore(0)).toBe("F");
  });
});

describe("computeDeduction + scoreFromChecks", () => {
  it("returns 0 deduction for all-info checks", () => {
    const checks = [{ severity: "info" }, { severity: "info" }];
    expect(computeDeduction(checks)).toBe(0);
    expect(scoreFromChecks(checks)).toBe(100);
  });
  it("applies 25 / 12 / 6 / 2 weights", () => {
    const checks = [
      { severity: "critical" },  // 25
      { severity: "high" },      // 12
      { severity: "medium" },    // 6
      { severity: "low" },       // 2
    ];
    expect(computeDeduction(checks)).toBe(45);
    expect(scoreFromChecks(checks)).toBe(55);
  });
  it("floors score at 0", () => {
    const checks = Array(10).fill({ severity: "critical" });
    expect(scoreFromChecks(checks)).toBe(0);
  });
  it("handles null / empty input", () => {
    expect(computeDeduction(null)).toBe(0);
    expect(computeDeduction([])).toBe(0);
    expect(scoreFromChecks(undefined)).toBe(100);
  });
});

describe("normalizeTarget", () => {
  it("accepts bare hostname", () => {
    const t = normalizeTarget("example.com");
    expect(t).toEqual({ origin: "https://example.com", hostname: "example.com", fullUrl: "https://example.com/" });
  });
  it("strips www prefix in hostname but keeps origin", () => {
    const t = normalizeTarget("https://www.example.com");
    expect(t.hostname).toBe("example.com");
    expect(t.origin).toBe("https://www.example.com");
  });
  it("preserves path in fullUrl", () => {
    expect(normalizeTarget("example.com/admin").fullUrl).toBe("https://example.com/admin");
  });
  it("rejects empty / invalid input", () => {
    expect(normalizeTarget("")).toBe(null);
    expect(normalizeTarget(null)).toBe(null);
    expect(normalizeTarget(undefined)).toBe(null);
    expect(normalizeTarget("not a domain")).toBe(null);
    expect(normalizeTarget("just-text")).toBe(null);
  });
});

describe("findRiskySubdomains", () => {
  const host = "example.com";
  it("flags dev/staging/test/internal labels", () => {
    const subs = ["www.example.com", "dev.example.com", "staging.example.com", "test-api.example.com", "api.example.com"];
    const flagged = findRiskySubdomains(subs, host);
    expect(flagged).toContain("dev.example.com");
    expect(flagged).toContain("staging.example.com");
    expect(flagged).toContain("test-api.example.com");
    expect(flagged).not.toContain("www.example.com");
    expect(flagged).not.toContain("api.example.com");
  });
  it("returns empty for clean subdomain list", () => {
    expect(findRiskySubdomains(["www.example.com", "api.example.com"], host)).toEqual([]);
  });
  it("returns empty for null input", () => {
    expect(findRiskySubdomains(null, host)).toEqual([]);
  });
  it("ignores subdomains not under the host", () => {
    expect(findRiskySubdomains(["dev.other.com"], host)).toEqual([]);
  });
});
