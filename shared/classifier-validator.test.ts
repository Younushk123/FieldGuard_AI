import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseClassification, validateClassification, ClassificationError } from "./classifier-validator";

const example = readFileSync(new URL("./classifier-example.json", import.meta.url), "utf-8");
const good = JSON.parse(example);

describe("classifier validator", () => {
  it("accepts the example response", () => {
    expect(parseClassification(example)).toEqual(good);
  });

  it("accepts JSON wrapped in a markdown fence", () => {
    expect(parseClassification("```json\n" + example + "\n```")).toEqual(good);
  });

  it("rejects non-JSON text", () => {
    expect(() => parseClassification("This looks dangerous")).toThrow(ClassificationError);
  });

  it("rejects an extra field", () => {
    expect(() => validateClassification({ ...good, riskScore: 20 })).toThrow(ClassificationError);
  });

  it("rejects a missing field", () => {
    const { summary, ...rest } = good;
    expect(() => validateClassification(rest)).toThrow(ClassificationError);
  });

  it("rejects an unknown category", () => {
    expect(() => validateClassification({ ...good, hazardCategory: "flood" })).toThrow(ClassificationError);
  });

  it.each([0, 6, 2.5, "3", null])("rejects likelihood %s", (v) => {
    expect(() => validateClassification({ ...good, likelihood: v })).toThrow(ClassificationError);
  });

  it("rejects a summary over 200 characters", () => {
    expect(() => validateClassification({ ...good, summary: "x".repeat(201) })).toThrow(ClassificationError);
  });

  it("rejects the wrong schemaVersion", () => {
    expect(() => validateClassification({ ...good, schemaVersion: "2.0" })).toThrow(ClassificationError);
  });
});