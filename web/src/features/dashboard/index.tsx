import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { subscribeActions, subscribeInspections } from '../data/api.ts';
import { computeStats, type CategoryRow, type Period } from '../data/dashboardStats.ts';
import type { ActionDoc, InspectionDoc } from '../data/types.ts';
import { inspectionMatchesWorkspace, WORKSPACE_SITE_NAMES, type Workspace } from '../data/sites.ts';
import type { RiskLevel } from '../../types';

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

type Target = 'history' | 'review';
type DashboardProps = { workspace: Workspace; onNavigate?: (target: Target, inspectionId?: string) => void };

const Card: React.FC<{ title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title, sub, right, children,
}) => (
  <section className="rounded-2xl p-6 min-w-0 bg-[#0C1A18] border border-[#162E2A] shadow-xl">
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

const Kpi: React.FC<{ label: string; value: number; sub: string; color: string; icon: string }> = ({
  label, value, sub, color, icon,
}) => (
  <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="w-8 h-8 rounded-xl bg-[#081211] border border-[#162E2A] flex items-center justify-center text-sm">{icon}</div>
    </div>
    <div className="mt-3">
      <div className="text-3xl font-extrabold font-mono text-white tracking-tight">{value}</div>
      <div className="text-[11px] mt-1 font-medium" style={{ color }}>{sub}</div>
    </div>
  </div>
);

const RiskPill: React.FC<{ inspection: InspectionDoc }> = ({ inspection }) => {
  const risk = RISK[inspection.riskLevel];
  return (
    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold whitespace-nowrap border"
      style={{ color: risk.color, background: `${risk.color}15`, borderColor: `${risk.color}40` }}>
      {inspection.riskScore} {risk.label}
    </span>
  );
};

const Status: React.FC<{ status: InspectionDoc['status'] }> = ({ status }) => {
  const pending = status === 'pending_review';
  const color = pending ? '#f59e0b' : '#10b981';
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap border"
      style={{ color, background: `${color}15`, borderColor: `${color}40` }}>
      {pending ? 'Pending Review' : 'Approved'}
    </span>
  );
};

const Source: React.FC<{ source: InspectionDoc['inferenceSource'] }> = ({ source }) => (
  <span className="text-xs font-mono font-semibold" style={{ color: source === 'cloud' ? '#38bdf8' : '#00DF89' }}>
    {source === 'cloud' ? '☁️ Cloud' : '⚡ On-device'}
  </span>
);

export const DashboardView: React.FC<DashboardProps> = ({ workspace, onNavigate }) => {
  const { user, loading } = useAuth();
  const [inspections, setInspections] = useState<InspectionDoc[] | null>(null);
  const [actions, setActions] = useState<ActionDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!user) return;
    const stopInspections = subscribeInspections(user.uid, setInspections, (e) => setError(e.message));
    const stopActions = subscribeActions(user.uid, setActions, (e) => setError(e.message));
    return () => {
      stopInspections();
      stopActions();
    };
  }, [user]);

  const siteInspections = useMemo(
    () => (inspections ?? []).filter((inspection) => inspectionMatchesWorkspace(inspection, workspace)),
    [inspections, workspace]
  );
  const siteActions = useMemo(() => {
    const inspectionIds = new Set(siteInspections.map((inspection) => inspection.id));
    return (actions ?? []).filter((action) => inspectionIds.has(action.inspectionId));
  }, [actions, siteInspections]);
  const stats = useMemo(() => computeStats(siteInspections, siteActions, period), [siteInspections, siteActions, period]);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase();
  const msg = (text: string) => <div className="text-sm text-slate-500 py-12 text-center">{text}</div>;

  if (loading) return msg('Connecting to safety operations cloud…');
  if (!user) return msg('Sign in to see your safety overview.');
  if (error) return msg(`Dashboard data could not be loaded: ${error}`);
  if (inspections === null || actions === null) return msg('Loading real-time safety telemetry…');

  const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  const maxLevel = Math.max(1, ...levels.map((level) => stats.byLevel[level]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-200">
      <div className="border-b border-[#122421] pb-5">
        <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#00DF89]">{today}</div>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1">Safety Intelligence Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Current inspection and corrective-action records for {WORKSPACE_SITE_NAMES[workspace]}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Total inspections" value={stats.total} sub="Selected site · all time" color="#00DF89" icon="📋" />
        <Kpi label="Detected hazards" value={stats.hazards} sub="Medium risk or higher · selected site" color="#f59e0b" icon="⚠️" />
        <Kpi label="High-risk findings" value={stats.highRisk} sub={`${stats.highRiskPending} pending review`} color="#ef4444" icon="⚡" />
        <Kpi label="Unresolved actions" value={stats.openActions} sub={`${stats.dueSoon} due in the next 7 days`} color="#eab308" icon="🛡️" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Risk overview" sub="Inspections by risk level · selected site">
          <div className="flex items-end gap-4 h-48 pt-4">
            {levels.map((level) => {
              const count = stats.byLevel[level];
              return (
                <div key={level} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">{count}</span>
                  <div className="w-full max-w-16 rounded-t-xl transition-all duration-500 shadow-md"
                    style={{
                      height: count === 0 ? '0%' : `${Math.max(8, (count / maxLevel) * 100)}%`,
                      background: RISK[level].color,
                    }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 border-t border-[#162E2A] pt-2">
            {levels.map((level) => (
              <div key={level} className="flex-1 text-center text-xs font-mono font-medium text-slate-400">
                {RISK[level].label}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Hazards by category" sub="Selected site · medium risk or higher · selected period"
          right={
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-xl px-3 py-1.5 text-xs bg-[#081211] text-slate-300 border border-[#162E2A] focus:outline-none focus:border-[#00DF89] cursor-pointer">
              {PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          }>
          {stats.categoryTotal > 0
            ? <Donut rows={stats.categories} total={stats.categoryTotal} />
            : <div className="py-16 text-center text-xs text-slate-500">No hazards recorded for this period.</div>}
        </Card>
      </div>

      <Card title="Recent inspections" sub={`Latest records for ${WORKSPACE_SITE_NAMES[workspace]}`}
        right={
          <button onClick={() => onNavigate?.('history')}
            className="text-xs font-bold text-[#00DF89] hover:underline cursor-pointer">View all →</button>
        }>
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#162E2A] text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-2.5 pr-4 font-semibold">Inspection</th>
                <th className="py-2.5 pr-4 font-semibold">Category</th>
                <th className="py-2.5 pr-4 font-semibold">Risk score</th>
                <th className="py-2.5 pr-4 font-semibold">Model</th>
                <th className="py-2.5 pr-4 font-semibold">Status</th>
                <th className="py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#122421]">
              {stats.recent.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No inspections recorded yet.</td></tr>
              ) : stats.recent.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-[#0F2923]/30 transition group">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{inspection.summary}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {WORKSPACE_SITE_NAMES[workspace]} · {inspection.id} · {inspection.createdAt.toDate().toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 pr-4 capitalize text-slate-300">{inspection.hazardCategory}</td>
                  <td className="py-3 pr-4"><RiskPill inspection={inspection} /></td>
                  <td className="py-3 pr-4"><Source source={inspection.inferenceSource} /></td>
                  <td className="py-3 pr-4"><Status status={inspection.status} /></td>
                  <td className="py-3 text-right">
                    <button onClick={() => onNavigate?.('review', inspection.id)}
                      className="px-3 py-1 rounded-lg bg-[#081211] hover:bg-[#00DF89] hover:text-[#071311] text-slate-300 font-bold text-xs border border-[#162E2A] transition cursor-pointer">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Donut: React.FC<{ rows: CategoryRow[]; total: number }> = ({ rows, total }) => {
  let offset = 0;
  return (
    <div className="flex items-center gap-8 flex-wrap justify-center sm:justify-start">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="#162E2A" strokeWidth="5" />
          {rows.map((row, index) => {
            const percentage = (row.count / total) * 100;
            const circle = (
              <circle key={row.key} cx="21" cy="21" r="15.915" fill="none"
                stroke={CAT_COLORS[index % CAT_COLORS.length]} strokeWidth="5"
                strokeDasharray={`${percentage} ${100 - percentage}`} strokeDashoffset={-offset}
                transform="rotate(-90 21 21)" />
            );
            offset += percentage;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold font-mono text-white">{total}</div>
          <div className="text-[10px] uppercase font-mono text-slate-400">hazards</div>
        </div>
      </div>
      <ul className="flex-1 min-w-44 space-y-2 text-xs">
        {rows.map((row, index) => (
          <li key={row.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[index % CAT_COLORS.length] }} />
              {row.label}
            </span>
            <span className="font-mono font-bold text-white">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};