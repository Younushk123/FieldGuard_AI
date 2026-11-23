export const HAZARD_CATEGORIES = [
  "fall", "electrical", "fire", "chemical",
  "mechanical", "ergonomic", "environmental", "other",
] as const;

export type HazardCategory = (typeof HAZARD_CATEGORIES)[number];

export interface Classification {
  schemaVersion: "1.0";
  hazardCategory: HazardCategory;
  likelihood: number;
  severity: number;
  summary: string;
  suggestedAction: string;
}

export class ClassificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassificationError";
  }
}

const KEYS = [
  "schemaVersion", "hazardCategory", "likelihood",
  "severity", "summary", "suggestedAction",
];

function isScale(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5;
}

function isText(v: unknown): v is string {
  return typeof v === "string" && v.length >= 1 && v.length <= 200;
}

/** Validates an already-parsed object against classifier schema v1.0. */
export function validateClassification(obj: unknown): Classification {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new ClassificationError("Response is not a JSON object");
  }
  const o = obj as Record<string, unknown>;

  for (const k of KEYS) {
    if (!(k in o)) throw new ClassificationError(`Missing field: ${k}`);
  }
  for (const k of Object.keys(o)) {
    if (!KEYS.includes(k)) throw new ClassificationError(`Unexpected field: ${k}`);
  }
  if (o.schemaVersion !== "1.0") throw new ClassificationError("schemaVersion must be \"1.0\"");
  if (!HAZARD_CATEGORIES.includes(o.hazardCategory as HazardCategory)) {
    throw new ClassificationError("Invalid hazardCategory");
  }
  if (!isScale(o.likelihood)) throw new ClassificationError("likelihood must be an integer 1-5");
  if (!isScale(o.severity)) throw new ClassificationError("severity must be an integer 1-5");
  if (!isText(o.summary)) throw new ClassificationError("summary must be 1-200 characters");
  if (!isText(o.suggestedAction)) throw new ClassificationError("suggestedAction must be 1-200 characters");

  return o as unknown as Classification;
}

/** Parses raw model text (optionally wrapped in ``` fences) and validates it. */
export function parseClassification(raw: string): Classification {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ClassificationError("Response is not valid JSON");
  }
  return validateClassification(parsed);
}