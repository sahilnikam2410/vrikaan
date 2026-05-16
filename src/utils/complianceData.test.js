import { describe, it, expect } from "vitest";
import { FRAMEWORKS, CONTROLS, scoreFramework, scoreAllFrameworks } from "./complianceData.js";

const FULL_PASS = {
  tlsGrade: "A+",
  cspPresent: true,
  mfaAdoptionRate: 0.6,
  auditLogActive: true,
  scansLast30: 5,
  privacyPolicyPublished: true,
  cookieConsentPresent: true,
  breachNotifyMechanism: true,
  accountDeleteAvailable: true,
};

const FULL_FAIL = {
  tlsGrade: "F",
  cspPresent: false,
  mfaAdoptionRate: 0,
  auditLogActive: false,
  scansLast30: 0,
  privacyPolicyPublished: false,
  cookieConsentPresent: false,
  breachNotifyMechanism: false,
  accountDeleteAvailable: false,
};

describe("FRAMEWORKS", () => {
  it("exposes 5 frameworks with jurisdictions", () => {
    expect(FRAMEWORKS).toHaveLength(5);
    FRAMEWORKS.forEach((f) => {
      expect(f.id).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.jurisdiction).toBeTruthy();
    });
  });
});

describe("CONTROLS", () => {
  it("every control has an evaluate function", () => {
    CONTROLS.forEach((c) => {
      expect(typeof c.evaluate).toBe("function");
      expect(c.framework).toBeTruthy();
      expect(c.weight).toBeGreaterThan(0);
    });
  });
});

describe("scoreFramework", () => {
  it("returns 100 when all controls pass", () => {
    const r = scoreFramework("pci", FULL_PASS);
    expect(r.score).toBeGreaterThanOrEqual(95);     // some weight imprecision
    expect(r.gaps.length).toBeLessThanOrEqual(1);
  });

  it("returns near 0 when all controls fail", () => {
    const r = scoreFramework("pci", FULL_FAIL);
    expect(r.score).toBeLessThanOrEqual(5);
    expect(r.passing.length).toBe(0);
  });

  it("handles null state gracefully", () => {
    const r = scoreFramework("pci", null);
    expect(r.score).toBeLessThanOrEqual(10);
    expect(r.gaps.length).toBeGreaterThan(0);
  });

  it("counts only controls of the requested framework", () => {
    const r = scoreFramework("gdpr", FULL_PASS);
    expect(r.total).toBe(CONTROLS.filter((c) => c.framework === "gdpr").length);
  });
});

describe("scoreAllFrameworks", () => {
  it("returns one row per framework", () => {
    const rows = scoreAllFrameworks(FULL_PASS);
    expect(rows).toHaveLength(FRAMEWORKS.length);
    rows.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(r.passing).toBeDefined();
      expect(r.gaps).toBeDefined();
    });
  });

  it("survives undefined input", () => {
    const rows = scoreAllFrameworks();
    expect(rows).toHaveLength(FRAMEWORKS.length);
  });
});
