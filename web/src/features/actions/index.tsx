import React, { useEffect, useState } from 'react';
import { useAuthUser } from '../data/useAuthUser.ts';
import { subscribeActions, subscribeInspections, createAction, updateAction } from '../data/api.ts';
import type { ActionDoc, ActionStatus, InspectionDoc } from '../data/types.ts';

// Owner: Maaz

const COLUMNS: { status: ActionStatus; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'resolved', label: 'Resolved' },
];

const PRIORITY_STYLE: Record<string, string> = {
  immediate: 'bg-rose-100 text-rose-700',
  short_term: 'bg-amber-100 text-amber-700',
  long_term: 'bg-slate-100 text-slate-600',
};

const ActionCard: React.FC<{ action: ActionDoc; onError: (m: string) => void }> = ({ action, onError }) => {
  const [assignee, setAssignee] = useState(action.assignee ?? '');
  useEffect(() => setAssignee(action.assignee ?? ''), [action.assignee]);

  const index = COLUMNS.findIndex((c) => c.status === action.status);
  const deadline = action.deadline?.toDate();
  const overdue = !!deadline && action.status !== 'resolved' && deadline.getTime() < Date.now();

  const run = (p: Promise<unknown>) => {
    p.catch((e: Error) => onError(e.message || 'Update failed'));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold text-slate-900">{action.title}</div>
        {action.priority && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY_STYLE[action.priority]}`}>
            {action.priority.replace('_', ' ')}
          </span>
        )}
      </div>
      {action.description && <div className="text-[11px] text-slate-500">{action.description}</div>}

      <input
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        onBlur={() => assignee !== (action.assignee ?? '') && run(updateAction(action.id, { assignee }))}
        placeholder="Assignee"
        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[11px]"
      />
      <input
        type="date"
        value={deadline ? deadline.toISOString().slice(0, 10) : ''}
        onChange={(e) => e.target.value && run(updateAction(action.id, { deadline: new Date(e.target.value + 'T00:00:00') }))}
        className={`w-full border rounded p-1.5 text-[11px] ${
          overdue ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50'
        }`}
      />
      {overdue && <div className="text-[10px] font-semibold text-rose-600">Overdue</div>}

      <div className="flex justify-between pt-1">
        <button
          disabled={index === 0}
          onClick={() => run(updateAction(action.id, { status: COLUMNS[index - 1].status }))}
          className="text-[11px] text-slate-600 disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          disabled={index === COLUMNS.length - 1}
          onClick={() => run(updateAction(action.id, { status: COLUMNS[index + 1].status }))}
          className="text-[11px] font-semibold text-orange-600 disabled:opacity-30"
        >
          Move →
        </button>
      </div>
    </div>
  );
};

const NewActionForm: React.FC<{ uid: string; inspections: InspectionDoc[]; onError: (m: string) => void }> = ({
  uid,
  inspections,
  onError,
}) => {
  const [title, setTitle] = useState('');
  const [inspectionId, setInspectionId] = useState('manual');

  const submit = () => {
    if (!title.trim()) return;
    createAction(uid, { inspectionId, title: title.trim() })
      .then(() => setTitle(''))
      .catch((e: Error) => onError(e.message || 'Could not create action'));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-200 rounded-lg p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New action title"
        className="flex-1 min-w-48 bg-slate-50 border border-slate-200 rounded p-2 text-xs"
      />
      <select
        value={inspectionId}
        onChange={(e) => setInspectionId(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded p-2 text-xs"
      >
        <option value="manual">Not linked (manual)</option>
        {inspections.map((i) => (
          <option key={i.id} value={i.id}>
            {i.summary.slice(0, 40)}
          </option>
        ))}
      </select>
      <button onClick={submit} className="px-3 py-2 rounded bg-orange-600 text-white text-xs font-semibold">
        Add action
      </button>
    </div>
  );
};

export const ActionsView: React.FC = () => {
  const { user, ready } = useAuthUser();
  const [actions, setActions] = useState<ActionDoc[] | null>(null);
  const [inspections, setInspections] = useState<InspectionDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setActions(null);
      return;
    }
    const stopActions = subscribeActions(user.uid, setActions, (e) => setError(e.message));
    const stopInspections = subscribeInspections(user.uid, setInspections, (e) => setError(e.message));
    return () => {
      stopActions();
      stopInspections();
    };
  }, [user]);

  if (!ready) return <div className="text-xs text-slate-500">Loading…</div>;
  if (!user) return <div className="text-xs text-slate-500">Sign in to see your corrective actions.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Corrective Actions</h2>
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded p-2 flex justify-between">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <NewActionForm uid={user.uid} inspections={inspections} onError={setError} />
      {actions === null ? (
        <div className="text-xs text-slate-500">Loading actions…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const items = actions.filter((a) => a.status === col.status);
            return (
              <div key={col.status} className="bg-slate-100 rounded-xl p-3 space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  {col.label} <span className="text-slate-400">({items.length})</span>
                </div>
                {items.length === 0 && <div className="text-[11px] text-slate-400">No actions here.</div>}
                {items.map((a) => (
                  <ActionCard key={a.id} action={a} onError={setError} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};