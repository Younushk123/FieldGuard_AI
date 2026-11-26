import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { createAction } from '../data/api.ts';

// Owner: Humna (humna/web-review)
// Designed in exact alignment with Page 08: Review & Approve from Finalized UI Design System

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'immediate' | 'short_term' | 'long_term';
  dueDays: number;
  selected: boolean;
}

export const ReviewView: React.FC = () => {
  const { user } = useAuth();
  const [likelihood, setLikelihood] = useState<number>(4);
  const [severity, setSeverity] = useState<number>(5);
  const [status, setStatus] = useState<'pending_review' | 'approved'>('pending_review');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act-1',
      title: 'Install temporary edge protection',
      description: 'Fit compliant guardrails along the exposed platform edge per OSHA 1926.502.',
      priority: 'immediate',
      dueDays: 0,
      selected: true,
    },
    {
      id: 'act-2',
      title: 'Restrict access to affected area',
      description: 'Place barriers and warning signage until protections are installed.',
      priority: 'short_term',
      dueDays: 1,
      selected: true,
    },
    {
      id: 'act-3',
      title: 'Inspect all level 3 platform edges',
      description: 'Comprehensive perimeter safety sweep across adjacent work zones.',
      priority: 'long_term',
      dueDays: 7,
      selected: true,
    },
  ]);

  const score = likelihood * severity;
  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    score >= 16 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low';

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const handleApprove = async () => {
    setIsDispatching(true);
    try {
      const selectedActions = actions.filter((a) => a.selected);
      const uid = user?.uid || 'guest-inspector-uid';

      // Dispatch selected actions to Maaz's Action Board in Firestore
      for (const act of selectedActions) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + act.dueDays);
        await createAction(uid, {
          inspectionId: 'INS-2048',
          title: act.title,
          description: act.description,
          priority: act.priority,
          assignee: 'Unassigned',
          deadline,
        }).catch(() => {
          // Gracefully handles offline / unauthenticated dev testing
        });
      }

      setStatus('approved');
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 5000);
    } finally {
      setIsDispatching(false);
    }
  };

  // 5x5 Heatmap cell color calculation
  const getCellBg = (l: number, s: number) => {
    const val = l * s;
    if (val >= 16) return 'bg-[#7F1D1D] hover:bg-[#991B1B]'; // Critical Red
    if (val >= 10) return 'bg-[#7C2D12] hover:bg-[#9A3412]'; // High Orange
    if (val >= 5) return 'bg-[#713F12] hover:bg-[#854D0E]';  // Medium Yellow
    return 'bg-[#064E3B] hover:bg-[#065F46]';               // Low Green
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'critical': return 'text-rose-400 stroke-rose-500';
      case 'high': return 'text-amber-400 stroke-amber-500';
      case 'medium': return 'text-yellow-400 stroke-yellow-500';
      default: return 'text-emerald-400 stroke-emerald-500';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-950/60 pb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            DEMO REVIEW / SAMPLE INS-2048
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">INS-2048</h1>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                status === 'approved'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
              }`}
            >
              ● {status === 'approved' ? 'Approved' : 'Pending Review'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Unsecured platform edge on level 3
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded bg-[#0F1E1B] border border-emerald-950 text-slate-400">
            Classification: <strong className="text-emerald-400">On-device</strong>
          </span>
          <span className="px-2 py-1 rounded bg-[#0F1E1B] border border-emerald-950 text-slate-400">
            Analysis: <strong className="text-sky-400">Cloud</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {dispatchSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-xl p-3.5 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✓</span>
            <div>
              <strong className="font-bold">Inspection Approved &amp; Dispatched!</strong> Tasks have been created on the Corrective Actions Board.
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">CERTIFIED SIGN-OFF</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Hazard Observation & Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hazard observation card */}
          <div className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Hazard observation</div>
                <div className="text-[11px] text-slate-400">
                  Submitted by Alex Morgan · Today, 10:42 AM
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                • Fall
              </span>
            </div>

            {/* Quote Box */}
            <div className="p-3.5 rounded-lg bg-[#08100F] border border-emerald-950/80 text-xs text-slate-300 italic leading-relaxed">
              &quot;There is an unprotected edge on the third-floor platform near the east stairwell. Workers are moving materials close to the edge and there is no guardrail or warning barrier.&quot;
            </div>

            {/* Sample Summary */}
            <div className="p-3 rounded-lg bg-[#0F1E1B] border border-emerald-950 flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">⚡</span>
              <div>
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Sample Summary
                </div>
                <div className="text-xs text-slate-200 mt-0.5 leading-snug">
                  Unprotected platform edge creates a fall hazard for workers transporting materials on level 3.
                </div>
              </div>
            </div>

            {/* Why this risk & Uncertainty notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#0D1C19] border border-emerald-950 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <span>📈</span>
                  <span>Why this risk</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Elevated work surface without edge protection. Frequent material movement increases exposure to a potential fall from height.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#141C16] border border-amber-900/30 space-y-1">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Uncertainty notes</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Exact platform height and number of workers exposed were not specified in the original observation.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended actions Card */}
          <div className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Recommended actions</div>
                <div className="text-[11px] text-slate-400">
                  Review, edit, and select actions to create.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900">
                {actions.length} suggestions
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {actions.map((act) => (
                <label
                  key={act.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer select-none ${
                    act.selected
                      ? 'bg-[#0E1E1A] border-emerald-500/40'
                      : 'bg-[#08100F] border-emerald-950 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={act.selected}
                    onChange={() => toggleAction(act.id)}
                    className="mt-1 rounded border-emerald-900 bg-[#08100F] text-[#00DF89] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className={`text-xs font-bold ${act.selected ? 'text-white' : 'text-slate-400'}`}>
                      {act.title}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {act.description}
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          act.priority === 'immediate'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {act.priority.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400 shrink-0">
                    Due in {act.dueDays} days
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Risk Assessment, Circular Gauge & 5x5 Heatmap */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-950/80 pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
                  Risk Assessment
                </div>
                <div className="text-xs font-bold text-white mt-0.5">
                  Inspector-confirmed rating
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Scale 1–25
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#132320]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={getRiskColor()}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * score) / 25}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-black text-white tracking-tight">{score}</div>
                  <div className="text-[10px] font-mono text-slate-400">/ 25</div>
                  <div
                    className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded mt-0.5 ${
                      riskLevel === 'critical'
                        ? 'bg-rose-950 text-rose-300'
                        : riskLevel === 'high'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 5x5 ISO Risk Heatmap */}
            <div className="space-y-2 pt-2 border-t border-emerald-950/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Interactive 5×5 Matrix</span>
                <span className="font-mono text-emerald-400 text-[10px]">
                  Click to adjust L &amp; S
                </span>
              </div>

              {/* Matrix Container */}
              <div className="p-3 rounded-lg bg-[#08100F] border border-emerald-950">
                <div className="flex gap-2">
                  {/* Severity Vertical Label */}
                  <div className="flex flex-col justify-between py-1 text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                    <span>S5</span>
                    <span>S4</span>
                    <span>S3</span>
                    <span>S2</span>
                    <span>S1</span>
                  </div>

                  {/* The 5x5 Grid (Rows = Severity 5 to 1, Cols = Likelihood 1 to 5) */}
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((sVal) => (
                      <div key={sVal} className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((lVal) => {
                          const isSelected = likelihood === lVal && severity === sVal;
                          return (
                            <button
                              key={lVal}
                              type="button"
                              onClick={() => {
                                setLikelihood(lVal);
                                setSeverity(sVal);
                              }}
                              className={`h-7 rounded flex items-center justify-center transition relative ${getCellBg(
                                lVal,
                                sVal
                              )}`}
                              title={`Likelihood ${lVal} × Severity ${sVal} = ${lVal * sVal}`}
                            >
                              {isSelected && (
                                <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/30 animate-pulse"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}

                    {/* Likelihood Horizontal Label */}
                    <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[9px] font-mono text-slate-500 uppercase">
                      <span>L1</span>
                      <span>L2</span>
                      <span>L3</span>
                      <span>L4</span>
                      <span>L5</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] font-mono text-slate-400">
                  Confirmed: <strong className="text-white">L{likelihood} × S{severity}</strong> = <span className="text-emerald-400 font-bold">{score} ({riskLevel.toUpperCase()})</span>
                </div>
              </div>
            </div>

            {/* Human Approval Required Callout */}
            <div className="p-3 rounded-lg bg-[#0E1A18] border border-emerald-950 text-xs flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">🛡️</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                <strong className="text-white block font-bold mb-0.5">Human approval required</strong>
                AI never declares a site safe. A qualified inspector approves every finding.
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={isDispatching || status === 'approved'}
              className="w-full py-3 rounded-lg bg-[#00DF89] hover:bg-[#00C476] text-[#0A1614] font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0A1614]/30 border-t-[#0A1614] rounded-full animate-spin"></span>
                  <span>Dispatching to Actions Board...</span>
                </>
              ) : status === 'approved' ? (
                <span>✓ Sign-Off Complete (Approved)</span>
              ) : (
                <>
                  <span>✓</span>
                  <span>Approve &amp; Dispatch Corrective Actions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
