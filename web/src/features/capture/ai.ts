import { getApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from 'firebase/ai';
import '../../lib/firebase'; // makes sure Firebase (and App Check) is initialised first
import promptMd from '../../../../shared/classifier-prompt.md?raw';
import {
  parseClassification,
  ClassificationError,
  type Classification,
} from '../../../../shared/classifier-validator';
import { computeRisk } from '../../../../shared/risk-engine';
import type { InferenceSource, RiskLevel } from '../../types';

const CLOUD_MODEL = 'gemini-3.5-flash-lite';
// Reports longer than this go straight to the cloud (on-device is slow and unreliable on long text).
const LONG_REPORT_CHARS = 600;

const ai = getAI(getApp(), { backend: new GoogleAIBackend() });

// On-device first, falls back to cloud.
const hybridModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: CLOUD_MODEL },
});
// Cloud only.
const cloudModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
  inCloudParams: { model: CLOUD_MODEL },
});

type Model = ReturnType<typeof getGenerativeModel>;

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

async function run(model: Model, text: string) {
  const started = performance.now();
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nHazard report:\n${text}`);
  const inferenceMs = performance.now() - started;

  const classification = parseClassification(result.response.text());

  // The badge comes from where the call really ran, not from the model.
  const src = String(result.response.inferenceSource ?? '').toLowerCase();
  const inferenceSource: InferenceSource =
    model !== cloudModel && src.includes('device') ? 'on-device' : 'cloud';

  return { classification, inferenceSource, inferenceMs };
}

export async function classify(report: string, forceCloud = false): Promise<CaptureResult> {
  const text = report.trim();
  if (!text) throw new Error('Please describe the hazard first.');

  let out: Awaited<ReturnType<typeof run>>;
  if (forceCloud || text.length > LONG_REPORT_CHARS) {
    out = await run(cloudModel, text);
  } else {
    try {
      out = await run(hybridModel, text);
    } catch (e) {
      if (!(e instanceof ClassificationError)) throw e;
      // The on-device answer was not valid, so try once in the cloud.
      try {
        out = await run(cloudModel, text);
      } catch {
        throw new Error(
          'The on-device result was not valid and the cloud is not reachable. Try a shorter report.'
        );
      }
    }
  }

  const { classification, inferenceSource, inferenceMs } = out;
  const { riskScore, riskLevel } = computeRisk(classification.likelihood, classification.severity);
  return { ...classification, riskScore, riskLevel, inferenceSource, inferenceMs };
}