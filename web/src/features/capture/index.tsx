import React, { useEffect, useState } from 'react';
import { classify, enableOfflineAI, type CaptureResult } from './ai';
import { saveInspection } from './save';

type OfflineState = 'off' | 'loading' | 'ready' | 'error';

const CATEGORIES = [
  'Fall',
  'Electrical',
  'Fire',
  'Chemical',
  'Mechanical',
  'Ergonomic',
  'Environmental',
  'Other',
];

const LEVEL_STYLE: Record<string, { pill: string; badge: string }> = {
  low: { pill: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', badge: 'bg-emerald-500' },
  medium: { pill: 'border-amber-500/40 text-amber-400 bg-amber-500/10', badge: 'bg-amber-500' },
  high: { pill: 'border-orange-500/40 text-orange-400 bg-orange-500/10', badge: 'bg-orange-500' },
  critical: { pill: 'border-red-500/40 text-red-400 bg-red-500/10', badge: 'bg-red-500' },
};

// Owner: Younus / Humna - 100% Exact match of Page 06 (New inspection workflow)
export const CaptureView: React.FC<{ initialSite?: string }> = ({ initialSite }) => {
  const [report, setReport] = useState('');
  const [site, setSite] = useState(
    initialSite === 'Plant 1' ? 'Plant 1, Assembly Line' :
    initialSite === 'Plant 3' ? 'Plant 3, Chemical Storage' :
    initialSite === 'Offshore Delta' ? 'Offshore Platform Delta' :
    'Plant 2, Industrial Zone'
  );
  const [location, setLocation] = useState('Level 3, north platform');
  const [selectedCategory, setSelectedCategory] = useState<string>('Fall');
  const [forceCloud, setForceCloud] = useState(false);

  useEffect(() => {
    if (initialSite) {
      if (initialSite === 'Plant 1') setSite('Plant 1, Assembly Line');
      else if (initialSite === 'Plant 3') setSite('Plant 3, Chemical Storage');
      else if (initialSite === 'Offshore Delta') setSite('Offshore Platform Delta');
      else setSite('Plant 2, Industrial Zone');
    }
  }, [initialSite]);

  const [offline, setOffline] = useState<OfflineState>('off');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

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
    if (!report.trim()) return;
    setBusy(true);
    setError('');
    setResult(null);
    setSaveState('idle');
    try {
      const fullPrompt = `Location: ${site} - ${location}. Category hint: ${selectedCategory}.\n\nObservation: ${report}`;
      const res = await classify(fullPrompt, forceCloud);
      setResult(res);
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
    <div className="space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Page Header (Exact from Page 06) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#122421] pb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00DF89] font-bold">
            HAZARD MANAGEMENT / NEW
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">
            New inspection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture a live hazard report and preview the hybrid edge/cloud assessment workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEnableOffline}
            disabled={offline === 'loading' || offline === 'ready'}
            className="px-3 py-1.5 rounded-xl border border-[#162E2A] bg-[#0C1A18] hover:bg-[#0F2923] text-xs font-mono text-slate-300 transition disabled:opacity-50"
          >
            {offlineLabel}
          </button>
          <span className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
            HYBRID AI ACTIVE
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-400 text-xs rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main 2-Column Split Layout (Matching Page 06) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Log Hazard Observation (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-6 sm:p-7 space-y-5">
          {/* Step 01 Banner */}
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#0F2923] border border-[#00DF89]/30 text-[#00DF89] font-mono font-bold text-xs flex items-center justify-center">
              01
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Log hazard observation</h2>
              <p className="text-[11px] text-slate-400">Provide clear details so the risk can be assessed.</p>
            </div>
          </div>

          {/* Site Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Site</label>
            <div className="relative">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full bg-[#081211] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-[#00DF89] cursor-pointer hover:border-[#00DF89]/40 transition pr-9"
              >
                <option value="Plant 2, Industrial Zone" className="bg-[#081211] text-white">Plant 2, Industrial Zone</option>
                <option value="Plant 1, Assembly Line" className="bg-[#081211] text-white">Plant 1, Assembly Line</option>
                <option value="Plant 3, Chemical Storage" className="bg-[#081211] text-white">Plant 3, Chemical Storage</option>
                <option value="Offshore Platform Delta" className="bg-[#081211] text-white">Offshore Platform Delta</option>
              </select>
              <svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Level 3, north platform"
              className="w-full bg-[#081211] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] transition"
            />
          </div>

          {/* Category Chips (from Page 06) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Category</span>
              <span className="text-slate-500 text-[11px]">Optional</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                        : 'bg-[#081211] border border-[#162E2A] text-slate-400 hover:text-white hover:border-[#00DF89]/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea Report */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Describe the hazard <span className="text-red-400">*</span></span>
              <span className="text-[11px] font-mono text-slate-500">English</span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Describe what you observed, where it is, and who may be affected (e.g. exposed 440V wiring near pooling water)..."
              className="w-full bg-[#081211] border border-[#162E2A] rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] transition"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
              <span>Be specific and factual. Avoid assumptions.</span>
              <span>{report.length}/1000</span>
            </div>
          </div>

          {/* Demo Inference Source Toggle (Page 06) */}
          <div className="bg-[#081211] border border-[#162E2A] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F2923] border border-[#00DF89]/30 flex items-center justify-center text-[#00DF89]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Inference source</div>
                <div className="text-[11px] text-slate-400">
                  {forceCloud ? 'Cloud (Gemini 3.5 Flash Lite)' : 'On-device first (Gemini Nano)'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForceCloud(!forceCloud)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                forceCloud ? 'bg-[#00DF89]' : 'bg-[#162E2A]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 ${
                  forceCloud ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Action Button: Run Demo Sequence / Analyze */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={busy || !report.trim()}
            className="w-full py-3 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#071311]/40 border-t-[#071311] rounded-full animate-spin"></span>
                Running Inference Sequence...
              </span>
            ) : (
              <span>⚡ Run demo sequence →</span>
            )}
          </button>
        </div>

        {/* Right Column: Assessment Preview Card (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-6 sm:p-7 min-h-[460px] flex flex-col justify-between">
            {/* Assessment Header */}
            <div className="flex items-center justify-between border-b border-[#162E2A] pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                  ASSESSMENT
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">Demo assessment</h3>
              </div>
              <span className="text-[10px] font-mono text-[#00DF89] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00DF89] animate-pulse"></span>
                {result ? 'Inference Complete' : 'Awaiting demo sequence'}
              </span>
            </div>

            {/* Assessment Body */}
            {result ? (
              <div className="my-auto py-4 space-y-4">
                {/* Score & Source Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    LEVEL_STYLE[result.riskLevel]?.pill || 'border-slate-500 text-slate-400'
                  }`}>
                    {result.riskLevel} Risk ({result.riskScore}/25)
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
                    {result.inferenceSource === 'on-device' ? '⚡ On-device' : '☁️ Cloud'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {Math.round(result.inferenceMs)} ms
                  </span>
                </div>

                {/* Summary Box */}
                <div className="bg-[#081211] rounded-xl p-4 border border-[#162E2A] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Category: <span className="text-slate-200 capitalize font-bold">{result.hazardCategory}</span>
                  </div>
                  <div className="text-sm font-semibold text-white leading-snug">
                    {result.summary}
                  </div>
                  <div className="text-xs text-slate-400">
                    Likelihood: <strong className="text-slate-200">{result.likelihood}/5</strong> · Severity: <strong className="text-slate-200">{result.severity}/5</strong>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="bg-[#081211] rounded-xl p-4 border border-[#162E2A] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#00DF89] font-bold">
                    Suggested Mitigative Action
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.suggestedAction}
                  </p>
                </div>

                {/* Save Inspection Button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState !== 'idle'}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {saveState === 'saved'
                    ? '✓ Saved to Cloud for Review'
                    : saveState === 'saving'
                    ? 'Saving to Firestore...'
                    : 'Save for Official Review →'}
                </button>
              </div>
            ) : (
              <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#081211] border border-[#162E2A] flex items-center justify-center text-slate-500">
                  <svg className="w-7 h-7 text-[#00DF89]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Assessment preview</div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Enter a sample observation and run the demo sequence to preview the illustrative risk output.
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-2">
                    On-device (Gemini Nano) and Cloud (Gemini 3.5) ready.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Disclaimer Box (Exact from Page 06) */}
            <div className="bg-[#081211] rounded-xl p-3.5 border border-[#162E2A] flex items-start gap-3">
              <svg className="w-4 h-4 text-[#00DF89] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="text-[11px] font-bold text-white">Human oversight matters</div>
                <div className="text-[10px] text-slate-400 leading-normal">
                  AI suggestions support your assessment. A qualified inspector makes the final decision.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
