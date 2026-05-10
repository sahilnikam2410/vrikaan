import { describe, it, expect } from "vitest";
import { tryParseJson, clampScore, stripMarkdownForSpeech, scamVerdictMeta, SCAM_VERDICTS, DEEPFAKE_VERDICTS } from "./aiHelpers.js";

describe("tryParseJson", () => {
  it("parses plain JSON", () => {
    expect(tryParseJson('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
  });

  it("strips ```json fences", () => {
    expect(tryParseJson('```json\n{"x":true}\n```')).toEqual({ x: true });
  });

  it("strips ``` fences without language", () => {
    expect(tryParseJson('```\n{"x":1}\n```')).toEqual({ x: 1 });
  });

  it("extracts JSON when surrounded by prose", () => {
    expect(tryParseJson('Here is the answer: {"verdict":"safe"} — done.')).toEqual({ verdict: "safe" });
  });

  it("returns null on empty / null / non-string input", () => {
    expect(tryParseJson(null)).toBe(null);
    expect(tryParseJson(undefined)).toBe(null);
    expect(tryParseJson("")).toBe(null);
    expect(tryParseJson(42)).toBe(null);
  });

  it("returns null on malformed JSON instead of throwing", () => {
    expect(tryParseJson("{not valid json")).toBe(null);
    expect(tryParseJson("{\"unclosed\":")).toBe(null);
  });

  it("handles nested objects + arrays", () => {
    const obj = { a: [1, 2], b: { c: "x" } };
    expect(tryParseJson(JSON.stringify(obj))).toEqual(obj);
  });
});

describe("clampScore", () => {
  it("returns 0 for missing / non-numeric input", () => {
    expect(clampScore(undefined)).toBe(0);
    expect(clampScore(null)).toBe(0);
    expect(clampScore("not a number")).toBe(0);
    expect(clampScore(NaN)).toBe(0);
  });

  it("clamps negatives to 0", () => {
    expect(clampScore(-50)).toBe(0);
  });

  it("clamps over 100 to 100", () => {
    expect(clampScore(150)).toBe(100);
    expect(clampScore("9999")).toBe(100);
  });

  it("rounds floats", () => {
    expect(clampScore(42.7)).toBe(43);
    expect(clampScore("42.4")).toBe(42);
  });

  it("passes through valid range untouched", () => {
    expect(clampScore(0)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(100)).toBe(100);
  });
});

describe("stripMarkdownForSpeech", () => {
  it("removes bold markers", () => {
    expect(stripMarkdownForSpeech("This is **bold**.")).toBe("This is bold.");
  });

  it("removes inline markdown chars", () => {
    expect(stripMarkdownForSpeech("Use _italic_, `code`, and #heading")).toBe("Use italic, code, and heading");
  });

  it("turns links into bare text", () => {
    expect(stripMarkdownForSpeech("Visit [VRIKAAN](https://vrikaan.com) now")).toBe("Visit VRIKAAN now");
  });

  it("collapses newlines into pause-style separators", () => {
    expect(stripMarkdownForSpeech("Line 1\nLine 2\n\nLine 3")).toBe("Line 1. Line 2. Line 3");
  });

  it("returns empty string for null / undefined", () => {
    expect(stripMarkdownForSpeech(null)).toBe("");
    expect(stripMarkdownForSpeech(undefined)).toBe("");
  });

  it("collapses repeated whitespace", () => {
    expect(stripMarkdownForSpeech("a   b\t\tc")).toBe("a b c");
  });
});

describe("scamVerdictMeta", () => {
  it("returns the correct meta for each known verdict", () => {
    expect(scamVerdictMeta("safe").label).toMatch(/safe/i);
    expect(scamVerdictMeta("suspicious").label).toMatch(/suspicious/i);
    expect(scamVerdictMeta("dangerous").label).toMatch(/scam/i);
  });

  it("falls back to suspicious for unknown verdicts", () => {
    expect(scamVerdictMeta("garbage")).toBe(scamVerdictMeta("suspicious"));
    expect(scamVerdictMeta(undefined)).toBe(scamVerdictMeta("suspicious"));
  });

  it("each meta has the required shape", () => {
    SCAM_VERDICTS.forEach((v) => {
      const m = scamVerdictMeta(v);
      expect(m).toHaveProperty("color");
      expect(m).toHaveProperty("emoji");
      expect(m).toHaveProperty("label");
    });
  });
});

describe("verdict enums", () => {
  it("SCAM_VERDICTS exposes the three expected values", () => {
    expect(SCAM_VERDICTS).toEqual(["safe", "suspicious", "dangerous"]);
  });
  it("DEEPFAKE_VERDICTS exposes the four expected values", () => {
    expect(DEEPFAKE_VERDICTS).toEqual(["likely-real", "likely-deepfake", "scam-script", "uncertain"]);
  });
});
