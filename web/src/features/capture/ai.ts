import { getApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from 'firebase/ai';
import '../../lib/firebase'; // makes sure Firebase is initialised first
import promptMd from '../../../../shared/classifier-prompt.md?raw';
import { parseClassification, type Classification } from '../../../../shared/classifier-validator';
import { computeRisk } from '../../../../shared/risk-engine';
import type { InferenceSource, RiskLevel } from '../../types';

const CLOUD_MODEL = 'gemini-3.5-flash-lite';
const ai = getAI(getApp(), { backend: new GoogleAIBackend() });

// On-device first, falls back to cloud.
const hybridModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: CLOUD_MODEL },
});
// Cloud only (for the force-cloud demo toggle).
const cloudModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
  inCloudParams: { model: CLOUD_MODEL },
});

function systemPromptFrom(md: string): string {
  const m = md.match(/##\s*System prompt\s*```text\r?\n([\s\S]*?)\r?\n```/i);
  if (!m) throw new Error('System prompt not found in classifier-prompt.md');
  return (m[1] ?? '').trim();
}
const SYSTEM_PROMPT = systemPromptFrom(promptMd);

export interface CaptureResult extends Classification {
  riskScore: number;
  riskLevel: RiskLevel;
  inferenceSource: InferenceSource;
  inferenceMs: number;
}

/** Must be called from a button click (browser requirement). Starts the model download. */
export async function enableOfflineAI(onProgress: (percent: number) => void): Promise<void> {
  await hybridModel.initializeDeviceModel((fraction: number) =>
    onProgress(Math.round(fraction * 100))
  );
}

export async function classify(report: string, forceCloud = false): Promise<CaptureResult> {
  const text = report.trim();
  if (!text) throw new Error('Please describe the hazard first.');

  const model = forceCloud ? cloudModel : hybridModel;
  const started = performance.now();
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nHazard report:\n${text}`);
  const inferenceMs = performance.now() - started;

  const classification = parseClassification(result.response.text());
  const { riskScore, riskLevel } = computeRisk(classification.likelihood, classification.severity);

  // The badge comes from where the call really ran, not from the model.
  const src = String(result.response.inferenceSource ?? '').toLowerCase();
  const inferenceSource: InferenceSource = src.includes('device') ? 'on-device' : 'cloud';

  return { ...classification, riskScore, riskLevel, inferenceSource, inferenceMs };
}