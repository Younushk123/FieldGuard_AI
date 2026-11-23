export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskThresholds {
  medium: number;   // Remote Config: risk_threshold_medium
  high: number;     // Remote Config: risk_threshold_high
  critical: number; // Remote Config: risk_threshold_critical
}

export interface RiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
}

export const DEFAULT_THRESHOLDS: RiskThresholds = { medium: 5, high: 10, critical: 16 };

function assertScale(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new RangeError(`${name} must be an integer from 1 to 5, got ${String(value)}`);
  }
}

export function assertThresholds(t: RiskThresholds): void {
  const { medium, high, critical } = t;
  const ok =
    [medium, high, critical].every((n) => Number.isInteger(n)) &&
    medium >= 2 && medium < high && high < critical && critical <= 25;
  if (!ok) {
    throw new RangeError("Thresholds must be integers with 2 <= medium < high < critical <= 25");
  }
}

/** riskScore = likelihood x severity. Invalid input throws (no silent fixing). */
export function computeRisk(
  likelihood: unknown,
  severity: unknown,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): RiskResult {
  assertScale("likelihood", likelihood);
  assertScale("severity", severity);
  assertThresholds(thresholds);

  const riskScore = likelihood * severity;
  let riskLevel: RiskLevel = "low";
  if (riskScore >= thresholds.critical) riskLevel = "critical";
  else if (riskScore >= thresholds.high) riskLevel = "high";
  else if (riskScore >= thresholds.medium) riskLevel = "medium";

  return { riskScore, riskLevel };
}