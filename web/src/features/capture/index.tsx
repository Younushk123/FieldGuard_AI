// import React from 'react';

// // Owner: Younus (younus/web-new-inspection)
// export const CaptureView: React.FC = () => {
//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
//       <div>
//         <h2 className="text-lg font-bold text-slate-900">New Hazard Observation</h2>
//         <p className="text-xs text-slate-500">Log site hazard report for on-device and cloud safety inference.</p>
//       </div>

//       <div className="space-y-3">
//         <div>
//           <label className="block text-xs font-semibold text-slate-700 mb-1">Hazard Report</label>
//           <textarea
//             rows={4}
//             placeholder="Describe the hazard conditions observed (e.g. exposed wires, pooling water, missing guardrails)..."
//             className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
//           />
//         </div>

//         <div className="flex items-center justify-between pt-2">
//           <span className="text-xs text-slate-500 font-mono">Schema v1.0 • PREFER_ON_DEVICE</span>
//           <button className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm">
//             Analyze Hazard →
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState } from 'react';
import { classify, enableOfflineAI, type CaptureResult } from './ai';
import { saveInspection } from './save';

type OfflineState = 'off' | 'loading' | 'ready' | 'error';

const LEVEL_STYLE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const CaptureView: React.FC = () => {
  const [report, setReport] = useState('');
  const [offline, setOffline] = useState<OfflineState>('off');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [forceCloud, setForceCloud] = useState(false);

  async function handleEnableOffline() {
    setOffline('loading');
    setProgress(0);
    setError('');
    try {
      await enableOfflineAI(setProgress);
      setOffline('ready');
    } catch (e) {
      setOffline('error');
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleAnalyze() {
    setBusy(true);
    setError('');
    setResult(null);
    setSaveState('idle');
    try {
      setResult(await classify(report, forceCloud));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaveState('saving');
    setError('');
    try {
      await saveInspection(report.trim(), result);
      setSaveState('saved');
    } catch (e) {
      setSaveState('idle');
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const offlineLabel =
    offline === 'loading' ? `Downloading model... ${progress}%`
    : offline === 'ready' ? 'Offline AI ready'
    : offline === 'error' ? 'Retry offline AI'
    : 'Enable offline AI';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">New Hazard Observation</h2>
          <p className="text-xs text-slate-500">Log a site hazard report. Runs on-device when possible, otherwise in the cloud.</p>
        </div>
        <button
          onClick={handleEnableOffline}
          disabled={offline === 'loading' || offline === 'ready'}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {offlineLabel}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Hazard Report</label>
        <textarea
          rows={4}
          maxLength={4000}
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Describe the hazard conditions observed (e.g. exposed wires, pooling water, missing guardrails)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">Schema v1.0</span>
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input type="checkbox" checked={forceCloud} onChange={(e) => setForceCloud(e.target.checked)} />
            Force cloud
          </label>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={busy || report.trim().length === 0}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm disabled:opacity-60"
        >
          {busy ? 'Analyzing...' : 'Analyze Hazard'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      {result && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                result.inferenceSource === 'on-device' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
              }`}
            >
              {result.inferenceSource === 'on-device' ? 'On-device' : 'Cloud'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${LEVEL_STYLE[result.riskLevel] ?? ''}`}>
              {result.riskLevel} risk
            </span>
            <span className="text-xs text-slate-600">
              Score {result.riskScore} ({result.likelihood} x {result.severity})
            </span>
            <span className="text-xs text-slate-500 font-mono">{Math.round(result.inferenceMs)} ms</span>
          </div>

          <p className="text-xs text-slate-500 capitalize">Category: {result.hazardCategory}</p>
          <p className="text-sm font-semibold text-slate-900">{result.summary}</p>
          <p className="text-xs text-slate-700">Suggested action: {result.suggestedAction}</p>

          <button
            onClick={handleSave}
            disabled={saveState !== 'idle'}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs disabled:opacity-60"
          >
            {saveState === 'saved' ? 'Saved for review' : saveState === 'saving' ? 'Saving...' : 'Save for review'}
          </button>
        </div>
      )}
    </div>
  );
};