import { describe, it, expect } from "vitest";
import { MITRE_TACTICS, MITRE_TECHNIQUES, buildMitreHeatmap, topTactic } from "./mitreData.js";

describe("MITRE_TACTICS", () => {
  it("exposes 12 well-formed tactics", () => {
    expect(MITRE_TACTICS.length).toBeGreaterThanOrEqual(12);
    MITRE_TACTICS.forEach((t) => {
      expect(t.id).toMatch(/^TA\d{4}$/);
      expect(t.name).toBeTruthy();
      expect(t.url).toMatch(/^https:\/\/attack\.mitre\.org\/tactics/);
    });
  });

  it("has techniques for every tactic", () => {
    MITRE_TACTICS.forEach((t) => {
      expect(MITRE_TECHNIQUES[t.id]).toBeTruthy();
      expect(MITRE_TECHNIQUES[t.id].length).toBeGreaterThan(0);
    });
  });
});

describe("buildMitreHeatmap", () => {
  it("counts events per (tactic, technique) cell", () => {
    const events = [
      { tactic: "TA0001", technique: "T1566" },
      { tactic: "TA0001", technique: "T1566" },
      { tactic: "TA0001", technique: "T1078" },
      { tactic: "TA0006", technique: "T1110" },
    ];
    const heat = buildMitreHeatmap(events);
    expect(heat.TA0001.T1566).toBe(2);
    expect(heat.TA0001.T1078).toBe(1);
    expect(heat.TA0006.T1110).toBe(1);
  });

  it("returns empty for null / empty input", () => {
    expect(buildMitreHeatmap(null)).toEqual({});
    expect(buildMitreHeatmap([])).toEqual({});
  });

  it("ignores events with no tactic", () => {
    const heat = buildMitreHeatmap([{ technique: "T1566" }]);
    expect(heat).toEqual({});
  });
});

describe("topTactic", () => {
  it("returns the tactic with most events + count", () => {
    const events = [
      { tactic: "TA0001" }, { tactic: "TA0001" }, { tactic: "TA0001" },
      { tactic: "TA0006" }, { tactic: "TA0006" },
    ];
    const top = topTactic(events);
    expect(top.id).toBe("TA0001");
    expect(top.count).toBe(3);
    expect(top.name).toContain("Initial Access");
  });

  it("returns null for empty input", () => {
    expect(topTactic([])).toBe(null);
    expect(topTactic(null)).toBe(null);
  });
});
