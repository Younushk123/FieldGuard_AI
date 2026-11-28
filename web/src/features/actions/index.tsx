import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { subscribeActions, subscribeInspections, createAction, updateAction } from '../data/api.ts';
import type { ActionDoc, ActionStatus, InspectionDoc } from '../data/types.ts';

// Owner: Maaz
const COLUMNS: { status: ActionStatus; label: string; dot: string }[] = [
  { status: 'open', label: 'Open', dot: '#f97316' },
  { status: 'in_progress', label: 'In Progress', dot: '#38bdf8' },
  { status: 'resolved', label: 'Resolved', dot: '#10b981' },
];
const TONE: Record<string, string> = { immediate: 'high', short_term: 'medium', long_term: 'cloud' };
const guard = (p: Promise<unknown>, onError: (m: string) => void) => {
  p.catch((e: Error) => onError(e.message || 'Update failed'));
};

const ActionCard: React.FC<{ action: ActionDoc; onError: (m: string) => void }> = ({ action, onError }) => {
  const [assignee, setAssignee] = useState(action.assignee ?? '');
  useEffect(() => setAssignee(action.assignee ?? ''), [action.assignee]);

  const index = COLUMNS.findIndex((c) => c.status === action.status);
  const deadline = action.deadline?.toDate();
  const overdue = !!deadline && action.status !== 'resolved' && deadline.getTime() < Date.now();
  const tone = action.priority ? TONE[action.priority] : '';

  // The date is typed into local state first. Saving on every keystroke made the field reset
  // itself (year 0002, 0020, ...), so we save only a complete date, shortly after typing stops.
  const deadlineStr = deadline ? deadline.toLocaleDateString('en-CA') : '';
  const [dateDraft, setDateDraft] = useState(deadlineStr);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => setDateDraft(deadlineStr), [deadlineStr]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const commitDate = (v: string) => {
    const year = Number(v.slice(0, 4));
    if (v && v !== deadlineStr && year >= 2000 && year <= 2100) {
      guard(updateAction(action.id, { deadline: new Date(`${v}T00:00:00`) }), onError);
    }
  };
  const onDate = (v: string) => {
    setDateDraft(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commitDate(v), 700);
  };

  return (
    <div className={`fg-item ${tone ? `fg-item--${tone}` : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">{action.title}</div>
        {action.priority && <span className={`fg-pill fg-pill--${tone}`}>{action.priority.replace('_', ' ')}</span>}
      </div>
      {action.description && <div className="fg-sub text-xs">{action.description}</div>}
      <input className="fg-input" placeholder="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}
        onBlur={() => assignee !== (action.assignee ?? '') && guard(updateAction(action.id, { assignee }), onError)} />
      <input type="date" className="fg-input" min="2000-01-01" max="2100-12-31" value={dateDraft}
        onChange={(e) => onDate(e.target.value)}
        onBlur={() => { window.clearTimeout(timer.current); commitDate(dateDraft); }} />
      {overdue && <span className="fg-pill fg-pill--critical self-start">Overdue</span>}
      <div className="flex justify-between pt-1">
        <button className="fg-link fg-link--muted" disabled={index === 0}
          onClick={() => guard(updateAction(action.id, { status: COLUMNS[index - 1].status }), onError)}>← Back</button>
        <button className="fg-link" disabled={index === COLUMNS.length - 1}
          onClick={() => guard(updateAction(action.id, { status: COLUMNS[index + 1].status }), onError)}>Move →</button>
      </div>
    </div>
  );
};

const NewActionForm: React.FC<{ uid: string; teamId: string | null; inspections: InspectionDoc[]; onError: (m: string) => void }> = ({ uid, teamId, inspections, onError }) => {
  const [title, setTitle] = useState('');
  const [inspectionId, setInspectionId] = useState('manual');
  const submit = () => {
    if (!title.trim()) return;
    createAction(uid, { inspectionId, title: title.trim(), teamId }).then(() => setTitle('')).catch((e: Error) => onError(e.message || 'Could not create action'));
  };
  return (
    <div className="fg-card flex flex-wrap gap-2 items-center">
      <input className="fg-input flex-1" style={{ minWidth: 192 }} placeholder="New action title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className="fg-input" style={{ width: 'auto' }} value={inspectionId} onChange={(e) => setInspectionId(e.target.value)}>
        <option value="manual">Not linked (manual)</option>
        {inspections.map((i) => <option key={i.id} value={i.id}>{i.summary.slice(0, 40)}</option>)}
      </select>
      <button className="fg-btn" onClick={submit}>Add action</button>
    </div>
  );
};

export const ActionsView: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const teamId = profile?.teamId || null;
  const [actions, setActions] = useState<ActionDoc[] | null>(null);
  const [inspections, setInspections] = useState<InspectionDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setActions(null); return; }
    const a = subscribeActions(user.uid, setActions, (e) => setError(e.message), teamId);
    const b = subscribeInspections(user.uid, setInspections, (e) => setError(e.message), teamId);
    return () => { a(); b(); };
  }, [user, teamId]);

  if (loading) return <div className="fg-sub">Loading…</div>;
  if (!user) return <div className="fg-sub">Sign in to see your corrective actions.</div>;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <header>
        <div className="fg-eyebrow">Work management</div>
        <h1 className="fg-title">Corrective actions</h1>
        <p className="fg-sub mt-1">Track hazards from assignment through resolution.</p>
      </header>
      {error && <div className="fg-banner fg-banner--error">{error}<button className="fg-link" onClick={() => setError(null)}>Dismiss</button></div>}
      <NewActionForm uid={user.uid} teamId={teamId} inspections={inspections} onError={setError} />
      {actions === null ? <div className="fg-sub">Loading actions…</div> : (
        <div className="fg-board">
          {COLUMNS.map((col) => {
            const items = actions.filter((a) => a.status === col.status);
            return (
              <div key={col.status} className="fg-col">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />{col.label}
                  <span className="fg-sub">{items.length}</span>
                </div>
                {items.length === 0 && <div className="fg-sub text-xs">No actions here.</div>}
                {items.map((a) => <ActionCard key={a.id} action={a} onError={setError} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
