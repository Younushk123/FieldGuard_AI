import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { approveInspection, createActionOnce, subscribeInspection } from '../data/api.ts';
import type { ActionPriority, InspectionDoc } from '../data/types.ts';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority?: ActionPriority;
  dueDays?: number;
  selected: boolean;
}

interface Notice {
  text: string;
  visible: boolean;
}

function actionsFor(inspection: InspectionDoc): ActionItem[] {
  const recommendations = inspection.analysis?.recommendations ?? [];
  if (recommendations.length > 0) {
    const seenTitles = new Set<string>();
    return recommendations.filter((recommendation) => {
      const key = recommendation.title.trim().toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    }).map((recommendation) => ({
      id: recommendation.title.trim().toLowerCase(),
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      dueDays: recommendation.suggestedDueDays,
      selected: true,
    }));
  }
  return inspection.suggestedAction.trim()
    ? [{ id: 'suggested-action', title: inspection.suggestedAction, description: '', selected: true }]
    : [];
}

const priorityLabel: Record<ActionPriority, string> = {
  immediate: 'Immediate',
  short_term: 'Short term',
  long_term: 'Long term',
};

export const ReviewView: React.FC<{ inspectionId: string | null }> = ({ inspectionId }) => {
  const { user } = useAuth();
  const [inspection, setInspection] = useState<InspectionDoc | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [approvedLocally, setApprovedLocally] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const fadeTimer = useRef<number | undefined>(undefined);
  const removeTimer = useRef<number | undefined>(undefined);
  const currentInspection = inspection?.id === inspectionId ? inspection : null;
  const hasSelectedActions = actions.some((action) => action.selected);

  useEffect(() => {
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(removeTimer.current);
    setNotice(null);
    setInspection(null);
    setActions([]);
    setApprovedLocally(false);
    setError(null);

    if (!user || !inspectionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeInspection(user.uid, inspectionId, (value) => {
      setInspection(value);
      setActions((current) => current.length > 0 || !value ? current : actionsFor(value));
      setLoading(false);
    }, (e) => {
      setError(e.message);
      setLoading(false);
    });
  }, [user, inspectionId]);

  useEffect(() => () => {
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(removeTimer.current);
  }, []);

  const toggleAction = (id: string) => {
    setActions((previous) => previous.map((action) =>
      action.id === id ? { ...action, selected: !action.selected } : action
    ));
  };

  const handleApprove = async () => {
    if (!user || !currentInspection || currentInspection.status === 'approved' || approvedLocally || isDispatching) return;
    const selected = actions.filter((action) => action.selected);
    setIsDispatching(true);
    setError(null);
    try {
      await Promise.all(selected.map((action) => {
        const deadline = action.dueDays === undefined
          ? undefined
          : new Date(Date.now() + action.dueDays * 86_400_000);
        return createActionOnce(user.uid, {
          inspectionId: currentInspection.id,
          title: action.title,
          description: action.description || undefined,
          priority: action.priority,
          deadline,
        }, action.id);
      }));
      await approveInspection(currentInspection.id, user.uid);
      setApprovedLocally(true);

      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(removeTimer.current);
      setNotice({ text: `Selected actions are open for inspection ${currentInspection.id}.`, visible: true });
      fadeTimer.current = window.setTimeout(() => setNotice((current) => current && ({ ...current, visible: false })), 5000);
      removeTimer.current = window.setTimeout(() => setNotice(null), 5700);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not approve this inspection.');
    } finally {
      setIsDispatching(false);
    }
  };

  if (!user) return <p className="text-sm text-slate-500 py-12 text-center">Sign in to review inspections.</p>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-200">
      <header className="border-b border-emerald-950/60 pb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Inspection review</div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          {currentInspection ? currentInspection.summary : 'Review & approve'}
        </h1>
        {currentInspection && <div className="text-xs text-slate-400 mt-1 break-all">Inspection ID: {currentInspection.id}</div>}
      </header>

      {notice && (
        <div role="status" aria-live="polite"
          className={`overflow-hidden border-l-2 border-emerald-400 pl-3 py-2 text-sm text-emerald-300 transition-all duration-700 ease-out ${notice.visible ? 'opacity-100 max-h-16' : 'opacity-0 max-h-0 py-0'}`}>
          {notice.text}
        </div>
      )}
      {error && <div role="alert" className="rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500 py-12 text-center">Loading inspection…</p>
      ) : !inspectionId ? (
        <p className="text-sm text-slate-400 py-12 text-center">Choose an inspection from the dashboard or inspections list to review it.</p>
      ) : !currentInspection ? (
        <p className="text-sm text-slate-400 py-12 text-center">Inspection not found or you do not have access to it.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <section className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-bold text-white">Hazard observation</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40 capitalize">
                  {currentInspection.hazardCategory}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{currentInspection.reportText}</p>
              <div className="rounded-lg bg-[#0F1E1B] border border-emerald-950 p-3">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Summary</div>
                <p className="text-xs text-slate-200 mt-1">{currentInspection.summary}</p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                <span>Likelihood: <strong className="text-white">{currentInspection.likelihood}/5</strong></span>
                <span>Severity: <strong className="text-white">{currentInspection.severity}/5</strong></span>
                <span>Model: <strong className="text-white">{currentInspection.inferenceSource}</strong></span>
              </div>
            </section>

            <section className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs font-bold text-white">Recommended actions</h2>
                  <p className="text-[11px] text-slate-400 mt-1">Select the actions to open for this inspection.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">{actions.length}</span>
              </div>
              {actions.length === 0 ? (
                <p className="text-xs text-slate-500">No recommended action is recorded for this inspection.</p>
              ) : actions.map((action) => (
                <label key={action.id} className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer select-none ${
                  action.selected ? 'bg-[#0E1E1A] border-emerald-500/40' : 'bg-[#08100F] border-emerald-950 text-slate-500'
                }`}>
                  <input type="checkbox" checked={action.selected} onChange={() => toggleAction(action.id)}
                    className="mt-1 rounded border-emerald-900 bg-[#08100F] text-[#00DF89] focus:ring-0 cursor-pointer" />
                  <span className="flex-1">
                    <span className="block text-xs font-bold text-white">{action.title}</span>
                    {action.description && <span className="block text-[11px] text-slate-400 mt-1">{action.description}</span>}
                    {action.priority && <span className="block text-[10px] font-mono text-emerald-400 mt-1">{priorityLabel[action.priority]}</span>}
                  </span>
                </label>
              ))}
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <section className="bg-[#0C1514] border border-emerald-950 rounded-xl p-5 space-y-4">
              <div className="border-b border-emerald-950/80 pb-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">Risk assessment</div>
                <div className="text-xs font-bold text-white mt-1">Recorded inspection rating</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Risk score</span>
                <strong className="text-2xl font-mono text-white">{currentInspection.riskScore}/25</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Risk level</span>
                <strong className="uppercase text-emerald-300">{currentInspection.riskLevel}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <strong className="text-white">{currentInspection.status === 'approved' ? 'Approved' : 'Pending review'}</strong>
              </div>
              {currentInspection.status === 'approved' && (
                <p className="text-xs text-emerald-300 border-t border-emerald-950 pt-3">This inspection has already been approved.</p>
              )}
              <button type="button" onClick={handleApprove}
                disabled={isDispatching || approvedLocally || currentInspection.status === 'approved' || !hasSelectedActions}
                className="w-full py-3 rounded-lg bg-[#00DF89] hover:bg-[#00C476] text-[#0A1614] font-bold text-xs transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {isDispatching ? 'Opening selected actions…' : approvedLocally || currentInspection.status === 'approved' ? 'Already approved' : 'Approve & open selected actions'}
              </button>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
};