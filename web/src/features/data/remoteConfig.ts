import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { remoteConfig } from '../../lib/firebase';
import { DEFAULT_THRESHOLDS, assertThresholds, computeRisk, type RiskThresholds } from '../../../../shared/risk-engine';

remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 3_600_000;
remoteConfig.defaultConfig = {
  risk_threshold_medium: DEFAULT_THRESHOLDS.medium,
  risk_threshold_high: DEFAULT_THRESHOLDS.high,
  risk_threshold_critical: DEFAULT_THRESHOLDS.critical,
};

let loaded: Promise<void> | null = null;
const load = () => (loaded ??= fetchAndActivate(remoteConfig).then(() => undefined).catch(() => undefined));

/** Live thresholds from Remote Config; falls back to the shared defaults if the fetch fails or the values are invalid. */
export async function getRiskThresholds(): Promise<RiskThresholds> {
  await load();
  const t: RiskThresholds = {
    medium: getValue(remoteConfig, 'risk_threshold_medium').asNumber(),
    high: getValue(remoteConfig, 'risk_threshold_high').asNumber(),
    critical: getValue(remoteConfig, 'risk_threshold_critical').asNumber(),
  };
  try {
    assertThresholds(t);
    return t;
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

/** Call this when SAVING a new inspection. Returns { riskScore, riskLevel }. Old inspections are never recomputed. */
export async function riskForNewInspection(likelihood: number, severity: number) {
  return computeRisk(likelihood, severity, await getRiskThresholds());
}
