import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { subscribeActions, subscribeInspections } from '../data/api.ts';
import { computeStats, type CategoryRow, type Period } from '../data/dashboardStats.ts';
import type { ActionDoc, InspectionDoc } from '../data/types.ts';
import type { RiskLevel } from '../../types';

// Owner: Maaz (maaz/web-dashboard)
// All colors live here so a light theme can be swapped in later without touching shared files.
const C = { card: 'var(--fg-card)', border: 'var(--fg-border)', text: 'var(--fg-text)', muted: 'var(--fg-muted)', accent: 'var(--fg-accent)', deep: 'var(--fg-deep)' };
const RISK: Record<RiskLevel, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#eab308' },
  low: { label: 'Low', color: '#10b981' },
};
const CAT_COLORS = ['#f97316', '#ef4444', '#f59e0b', '#eab308', '#64748b'];
const PERIODS: { value: Period; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];
const ANCHORS: [number, number][] = [[150, 100], [255, 150], [365, 108], [455, 165], [315, 66]];
type Target = 'capture' | 'history' | 'review';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const shortId = (id: string) => `INS-${id.slice(0, 4).toUpperCase()}`;
const when = (i: InspectionDoc) =>
  i.createdAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const Card: React.FC<{ title?: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, sub, right, children }) => (
  <section className="rounded-2xl p-5 min-w-0" style={{ background: C.card, border: `1px solid ${C.border}` }}>
    {title && (
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: C.text }}>{title}</h3>
          {sub && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const Kpi: React.FC<{ label: string; value: number; sub: string; color: string }> = ({ label, value, sub, color }) => (
  <Card>
    <div className="text-xs font-semibold" style={{ color: C.muted }}>{label}</div>
    <div className="text-3xl font-bold font-mono mt-2" style={{ color: C.text }}>{value}</div>
    <div className="text-xs mt-1" style={{ color }}>{sub}</div>
  </Card>
);

const RiskPill: React.FC<{ i: InspectionDoc }> = ({ i }) => {
  const r = RISK[i.riskLevel];
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold whitespace-nowrap" style={{ color: r.color, background: `${r.color}1a`, border: `1px solid ${r.color}55` }}>
      {i.riskScore} {r.label}
    </span>
  );
};

const Status: React.FC<{ s: InspectionDoc['status'] }> = ({ s }) => {
  const pending = s === 'pending_review';
  const color = pending ? '#f59e0b' : '#10b981';
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap" style={{ color, background: `${color}1a`, border: `1px solid ${color}55` }}>
      {pending ? 'Pending Review' : 'Approved'}
    </span>
  );
};

const Source: React.FC<{ s: InspectionDoc['inferenceSource'] }> = ({ s }) => (
  <span className="text-xs font-mono font-semibold" style={{ color: s === 'cloud' ? '#38bdf8' : '#34d399' }}>
    {s === 'cloud' ? 'Cloud' : 'On-device'}
  </span>
);

const Donut: React.FC<{ rows: CategoryRow[]; total: number }> = ({ rows, total }) => {
  let acc = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke={C.border} strokeWidth="5" />
          {rows.map((r, i) => {
            const pct = (r.count / total) * 100;
            const el = (
              <circle key={r.key} cx="21" cy="21" r="15.915" fill="none" stroke={CAT_COLORS[i]} strokeWidth="5"
                strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} transform="rotate(-90 21 21)" />
            );
            acc += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold font-mono" style={{ color: C.text }}>{total}</div>
          <div className="text-[11px]" style={{ color: C.muted }}>hazards</div>
        </div>
      </div>
      <ul className="flex-1 min-w-40 space-y-2">
        {rows.map((r, i) => (
          <li key={r.key} className="flex items-center gap-2 text-sm" style={{ color: C.text }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[i] }} />
            <span className="flex-1">{r.label}</span>
            <span className="font-mono font-semibold">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SiteModel: React.FC<{ findings: InspectionDoc[] }> = ({ findings }) => {
  const [sel, setSel] = useState<string | null>(null);
  const cur = findings.find((f) => f.id === sel) ?? null;
  return (
    <Card title="Site model" sub="Open findings, highest risk first. Marker positions are illustrative, not real locations.">
      <div className="grid md:grid-cols-[1fr_260px] gap-4">
        <svg viewBox="0 0 600 260" className="w-full h-auto rounded-xl" style={{ background: C.deep, border: `1px solid ${C.border}` }}>
          <g stroke={C.border} strokeWidth="1">
            {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * 55} y1="0" x2={i * 55} y2="260" />)}
            {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 52} x2="600" y2={i * 52} />)}
          </g>
          <polygon points="90,175 330,222 520,155 280,108" fill="#12291f" stroke="#1f4a3b" />
          <polygon points="90,175 90,128 280,66 280,108" fill="#0f241b" stroke="#1f4a3b" />
          <polygon points="280,66 520,112 520,155 280,108" fill="#143127" stroke="#1f4a3b" />
          {findings.map((f, i) => {
            const [x, y] = ANCHORS[i];
            const c = RISK[f.riskLevel].color;
            return (
              <g key={f.id} onClick={() => setSel(f.id)} className="cursor-pointer">
                <circle cx={x} cy={y} r={f.id === sel ? 20 : 14} fill={`${c}33`} stroke={c} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="5" fill={c} />
              </g>
            );
          })}
        </svg>
        <div className="rounded-xl p-4 text-sm" style={{ background: C.deep, border: `1px solid ${C.border}`, color: C.text }}>
          {cur ? (
            <div className="space-y-2">
              <div className="text-xs font-mono" style={{ color: C.muted }}>{shortId(cur.id)} · {when(cur)}</div>
              <div className="font-semibold">{cur.summary}</div>
              <div className="flex flex-wrap gap-2 items-center"><RiskPill i={cur} /><Source s={cur.inferenceSource} /></div>
              <div className="text-xs" style={{ color: C.muted }}>{cap(cur.hazardCategory)} · <Status s={cur.status} /></div>
            </div>
          ) : (
            <div style={{ color: C.muted }}>Select a marker to see the finding.</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const DashboardView: React.FC<{ onNavigate?: (t: Target) => void }> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [inspections, setInspections] = useState<InspectionDoc[] | null>(null);
  const [actions, setActions] = useState<ActionDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const go = (t: Target) => onNavigate?.(t);

  useEffect(() => {
    if (!user) return;
    const a = subscribeInspections(user.uid, setInspections, (e) => setError(e.message));
    const b = subscribeActions(user.uid, setActions, (e) => setError(e.message));
    return () => { a(); b(); };
  }, [user]);

  const stats = useMemo(() => computeStats(inspections ?? [], actions ?? [], period), [inspections, actions, period]);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const msg = (t: string) => <div className="text-sm" style={{ color: C.muted }}>{t}</div>;

  if (loading) return msg('Loading…');
  if (!user) return msg('Sign in to see your safety overview.');
  if (!error && (inspections === null || actions === null)) return msg('Loading dashboard…');

  const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  const maxLevel = Math.max(1, ...levels.map((l) => stats.byLevel[l]));

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {error && (
        <div className="rounded-lg p-3 text-sm flex justify-between" style={{ background: '#3b1218', color: '#fca5a5' }}>
          {error}<button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <header>
        <div className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.muted }}>{today}</div>
        <h1 className="text-3xl font-bold mt-1" style={{ color: C.text }}>Safety Intelligence Overview</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Monitor workplace conditions and manage safety operations.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Total inspections" value={stats.total} sub={`${stats.last30} in the last 30 days`} color={C.accent} />
        <Kpi label="Detected hazards" value={stats.hazards} sub="Medium risk or above" color="#f59e0b" />
        <Kpi label="High-risk findings" value={stats.highRisk} sub={`${stats.highRiskPending} pending review`} color="#ef4444" />
        <Kpi label="Open actions" value={stats.openActions} sub={`${stats.dueSoon} due within 7 days`} color="#f59e0b" />
      </div>

      {stats.findings.length > 0 && <SiteModel findings={stats.findings} />}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Risk overview" sub="Inspections by risk level">
          <div className="flex items-end gap-4 h-44">
            {levels.map((l) => (
              <div key={l} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                <span className="text-sm font-mono font-semibold" style={{ color: C.text }}>{stats.byLevel[l]}</span>
                <div className="w-full max-w-16 rounded-t-md" style={{ height: `${(stats.byLevel[l] / maxLevel) * 100}%`, minHeight: 3, background: RISK[l].color }} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {levels.map((l) => <div key={l} className="flex-1 text-center text-xs" style={{ color: C.muted }}>{RISK[l].label}</div>)}
          </div>
        </Card>

        <Card
          title="Hazards by category"
          sub="Medium risk or above"
          right={
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-lg px-2 py-1.5 text-xs" style={{ background: C.deep, color: C.text, border: `1px solid ${C.border}` }}>
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          }
        >
          {stats.categoryTotal > 0 ? <Donut rows={stats.categories} total={stats.categoryTotal} /> : msg('No hazards in this period.')}
        </Card>
      </div>

      <Card
        title="Recent inspections"
        sub="Last 3 days"
        right={<button onClick={() => go('history')} className="text-sm font-semibold" style={{ color: C.accent }}>View all</button>}
      >
        {stats.recent.length === 0 ? msg('No inspections in the last 3 days.') : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" style={{ color: C.text }}>
              <thead>
                <tr className="text-xs" style={{ color: C.muted }}>
                  {['Hazard', 'Category', 'Risk score', 'Model', 'Status', ''].map((h) => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((i) => (
                  <tr key={i.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{i.summary}</div>
                      <div className="text-xs font-mono" style={{ color: C.muted }}>{shortId(i.id)} · {when(i)}</div>
                    </td>
                    <td className="py-3 pr-4">{cap(i.hazardCategory)}</td>
                    <td className="py-3 pr-4"><RiskPill i={i} /></td>
                    <td className="py-3 pr-4"><Source s={i.inferenceSource} /></td>
                    <td className="py-3 pr-4"><Status s={i.status} /></td>
                    <td className="py-3">
                      <button onClick={() => go(i.status === 'pending_review' ? 'review' : 'history')}
                        className="text-sm font-semibold" style={{ color: C.accent }}>
                        {i.status === 'pending_review' ? 'Review' : 'Open'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
