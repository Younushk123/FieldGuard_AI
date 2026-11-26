import React, { useState } from 'react';
import { useCloudAnalyst, type AnalysisRunResult } from './useCloudAnalyst';

// Owner: Humna (humna/web-cloud-analyst)
// Designed in exact alignment with Page 06: AI Intelligence from Finalized UI Design System

const SAMPLES = [
  {
    id: 'INS-2048',
    label: 'Unsecured platform edge (Level 3)',
    text: 'There is an unprotected edge on the third-floor platform near the east stairwell. Workers are moving materials close to the edge and there is no guardrail or warning barrier.',
  },
  {
    id: 'INS-2047',
    label: 'Exposed wiring near control panel',
    text: 'Frayed 440V electrical conduit with exposed copper adjacent to standing water puddle near main circuit distribution panel B4.',
  },
  {
    id: 'INS-2044',
    label: 'Missing guard on conveyor belt',
    text: 'Conveyor line 2 has active rotating pulleys with the interlocked protective metal mesh guard removed by maintenance crew.',
  },
];

export const AnalysisView: React.FC = () => {
  const { loading, error, runAnalysis } = useCloudAnalyst();
  const [selectedSource, setSelectedSource] = useState<'on-device' | 'cloud'>('cloud');
  const [reportText, setReportText] = useState(SAMPLES[0].text);
  const [activeResult, setActiveResult] = useState<AnalysisRunResult | null>(null);

  const handleRun = async () => {
    if (!reportText.trim()) return;
    try {
      const res = await runAnalysis(reportText, selectedSource);
      setActiveResult(res);
    } catch {
      // Error handled in hook state
    }
  };

  const handleSelectSample = (text: string) => {
    setReportText(text);
    setActiveResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-200">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-950/60 pb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            AI Intelligence / Architecture
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Hybrid by design.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Local-first inference, transparent escalation, and a human decision at the end.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
            PROTOTYPE • GEMINI 3.5 FLASH LITE
          </span>
        </div>
      </div>

      {/* Top Banner: Built for the field */}
      <div className="rounded-xl p-4 bg-[#0E1A18] border border-emerald-900/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm shrink-0">
            🔒
          </div>
          <div>
            <div className="text-xs font-bold text-white">Built for the field. Governed by people.</div>
            <div className="text-[11px] text-slate-400">
              AI outputs are recommendations only. Certified safety inspectors retain final operational sign-off.
            </div>
          </div>
        </div>
        <div className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1 shrink-0">
          <span>View inspection flow</span>
          <span>→</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): INFERENCE PIPELINE */}
        <div className="lg:col-span-5 bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-950/80 pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
                Inference Pipeline
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                From observation to accountable action
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-950">
              <span className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                01
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>User report</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  A field observation is captured with site context.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-950">
              <span className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                02
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>On-device AI</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1 rounded">Nano 4</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Local inference can classify common hazards without a connection (~140ms).
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-500/30">
              <span className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                03
              </span>
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Cloud AI</span>
                  <span className="text-[9px] font-mono text-emerald-300 bg-emerald-900/60 px-1 rounded">Gemini 3.5</span>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  A connected service delivers root-cause rationale and OSHA tasks when needed.
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-950">
              <span className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                04
              </span>
              <div>
                <div className="text-xs font-bold text-white">Risk engine</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Likelihood × Severity informs a structured risk score (1–25).
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-950">
              <span className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                05
              </span>
              <div>
                <div className="text-xs font-bold text-white">Human review</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  A qualified person reviews, edits, and approves every finding.
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0F1E1B] border border-emerald-950">
              <span className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                06
              </span>
              <div>
                <div className="text-xs font-bold text-white">Corrective action</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Approved actions can be assigned, tracked, and closed on Kanban board.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-500 border-t border-emerald-950/60 flex items-center gap-1.5">
            <span>⚙️</span>
            <span>Firebase AI Logic SDK &amp; Remote Config Active</span>
          </div>
        </div>

        {/* Right Column (7 cols): INFERENCE SOURCE & LIVE EVALUATION */}
        <div className="lg:col-span-7 bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950/80 pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
                  Inference Source
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Choose the evaluation path
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                DUAL-ENGINE
              </span>
            </div>

            {/* Toggle Buttons: On-device vs Cloud */}
            <div className="grid grid-cols-2 gap-2 bg-[#08100F] p-1.5 rounded-lg border border-emerald-950">
              <button
                type="button"
                onClick={() => setSelectedSource('on-device')}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  selectedSource === 'on-device'
                    ? 'bg-[#152B26] text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡</span>
                <span>On-device (Nano)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('cloud')}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  selectedSource === 'cloud'
                    ? 'bg-[#152B26] text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>☁️</span>
                <span>Cloud (Gemini 3.5)</span>
              </button>
            </div>

            {/* Mode Explainer Pill */}
            <div className="p-3 rounded-lg bg-[#0F1E1B] border border-emerald-950 text-xs">
              {selectedSource === 'on-device' ? (
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>⚡ On-device inference: Gemini Nano 4</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Runs locally in-browser or on device via Chrome Prompt API. 0 bytes network egress, ultra-low ~140ms latency.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>☁️ Cloud AI: Gemini 3.5 Flash Lite</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Deep causal engineering analysis, OSHA 1910/1926 standards mapping, and 1–5 prioritized actions (~800ms).
                  </p>
                </div>
              )}
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Field Hazard Observation
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSample(s.text)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition border ${
                      reportText === s.text
                        ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-[#0F1E1B] text-slate-400 border-emerald-950 hover:text-white hover:border-emerald-800'
                    }`}
                  >
                    {s.id}: {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hazard Report Text
              </label>
              <textarea
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Enter field observation details..."
                className="w-full bg-[#08100F] border border-emerald-950 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-sans leading-relaxed"
              />
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRun}
              disabled={loading || !reportText.trim()}
              className="w-full py-2.5 rounded-lg bg-[#00DF89] hover:bg-[#00C476] text-[#0A1614] font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0A1614]/30 border-t-[#0A1614] rounded-full animate-spin"></span>
                  <span>Executing {selectedSource === 'cloud' ? 'Gemini 3.5 Flash Lite' : 'Gemini Nano 4'}...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Run {selectedSource === 'cloud' ? 'Cloud Gemini 3.5' : 'On-Device'} Safety Analysis</span>
                </>
              )}
            </button>

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg p-3 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Output Card */}
          {activeResult && (
            <div className="mt-4 pt-4 border-t border-emerald-950 space-y-3.5 bg-[#081210] p-4 rounded-xl border border-emerald-900/60">
              {/* Result Meta Bar */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  {activeResult.source === 'cloud' ? '☁️ CLOUD' : '⚡ ON-DEVICE'} • {activeResult.modelName} ({activeResult.latencyMs}ms)
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Category: <strong className="text-white">{activeResult.data.hazardCategory}</strong>
                </span>
              </div>

              {/* Stop-Work Alert Banner if Critical */}
              {(activeResult.data.requiresImmediateAction || (activeResult.data.likelihood * activeResult.data.severity >= 16)) && (
                <div className="bg-rose-950/60 border border-rose-700/80 rounded-lg p-2.5 text-rose-200 text-xs flex items-center gap-2">
                  <span className="text-base shrink-0">🛑</span>
                  <div>
                    <strong className="font-bold">IMMEDIATE STOP-WORK TRIGGERED:</strong> Composite risk is Critical ({activeResult.data.likelihood * activeResult.data.severity}/25).
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Summary</div>
                <div className="text-xs text-white mt-0.5 leading-snug">{activeResult.data.summary}</div>
              </div>

              {/* Why this risk (Rationale) */}
              <div className="bg-[#0D1C19] border border-emerald-950 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Why this risk (Causal Rationale)</div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{activeResult.data.rationale}</p>
              </div>

              {/* Uncertainty Notes */}
              {activeResult.data.uncertaintyNotes && (
                <div className="bg-[#141F14] border border-amber-900/40 p-2.5 rounded-lg text-amber-200 text-[11px]">
                  <strong className="text-amber-400 font-mono text-[10px] uppercase block">Uncertainty Notes:</strong>
                  {activeResult.data.uncertaintyNotes}
                </div>
              )}

              {/* Recommended Actions */}
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1.5">
                  Prioritized Recommendations ({activeResult.data.recommendations.length})
                </div>
                <div className="space-y-1.5">
                  {activeResult.data.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded bg-[#0D1C19] border border-emerald-950 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-[11px]">{rec.title}</div>
                        <div className="text-[10px] text-slate-400">{rec.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          rec.priority === 'immediate'
                            ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                            : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                        }`}>
                          {rec.priority.replace('_', ' ')}
                        </span>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">Due: {rec.suggestedDueDays}d</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Authority Disclaimer */}
          <div className="pt-3 border-t border-emerald-950/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>👤</span>
              <span>Human approval required: AI never declares a workplace safe.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom 3 Feature Cards from Page 06 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-[#0C1514] border border-emerald-950 space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>📱</span>
            <span>Offline-tolerant</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Local-first on-device triage ensures immediate hazard flagging even in dead-zones.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1514] border border-emerald-950 space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>📈</span>
            <span>Explainable risk</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Likelihood × Severity matrix with standards-backed causal engineering rationale.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1514] border border-emerald-950 space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>🛡️</span>
            <span>Human authority</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            AI advises and drafts actions; certified safety inspectors retain final legal authority.
          </p>
        </div>
      </div>
    </div>
  );
};
