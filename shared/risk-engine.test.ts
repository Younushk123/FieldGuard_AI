import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { computeRisk, assertThresholds } from "./risk-engine";

const cases = JSON.parse(
  readFileSync(new URL("./risk-test-cases.json", import.meta.url), "utf-8")
);

describe("computeRisk", () => {
  it.each(cases.valid)("L$likelihood x S$severity -> $riskScore ($riskLevel)", (...args: any[]) => {
    const c = args[0];
    expect(computeRisk(c.likelihood, c.severity, cases.thresholds)).toEqual({
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
    });
  });

  it.each(cases.invalid)("rejects L=$likelihood S=$severity", (...args: any[]) => {
    const c = args[0];
    expect(() => computeRisk(c.likelihood, c.severity)).toThrow(RangeError);
  });

  it("uses custom thresholds", () => {
    expect(computeRisk(2, 3, { medium: 3, high: 6, critical: 12 }).riskLevel).toBe("high");
  });

  it("rejects bad thresholds", () => {
    expect(() => assertThresholds({ medium: 10, high: 5, critical: 16 })).toThrow(RangeError);
  });
});