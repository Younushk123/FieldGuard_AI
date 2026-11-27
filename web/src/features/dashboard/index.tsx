import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { subscribeActions, subscribeInspections } from '../data/api.ts';
import { computeStats, type CategoryRow, type Period } from '../data/dashboardStats.ts';
import type { ActionDoc, InspectionDoc } from '../data/types.ts';
import type { RiskLevel } from '../../types';

// Owner: Maaz / Humna - Exact 100% Replication of PDF Page 03 (Safety Overview Dashboard)
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

type Target = 'capture' | 'history' | 'review' | 'actions';

const shortId = (id: string) => `INS-${id.slice(0, 4).toUpperCase()}`;
const when = (i: InspectionDoc) => {
  const d = i.createdAt?.toDate?.();
  return d ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Today';
};

const Card: React.FC<{ title?: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  sub,
  right,
  children,
}) => (
  <section className="rounded-2xl p-6 min-w-0 bg-[#0C1A18] border border-[#162E2A] shadow-xl">
    {title && (
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const Kpi: React.FC<{ label: string; value: number; sub: string; color: string; icon: string }> = ({
  label,
  value,
  sub,
  color,
  icon,
}) => (
  <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="w-8 h-8 rounded-xl bg-[#081211] border border-[#162E2A] flex items-center justify-center text-sm">
        {icon}
      </div>
    </div>
    <div className="mt-3">
      <div className="text-3xl font-extrabold font-mono text-white tracking-tight">{value}</div>
      <div className="text-[11px] mt-1 font-medium flex items-center gap-1" style={{ color }}>
        <span>↗</span>
        <span>{sub}</span>
      </div>
    </div>
  </div>
);

const RiskPill: React.FC<{ i: InspectionDoc }> = ({ i }) => {
  const r = RISK[i.riskLevel] || RISK.low;
  return (
    <span
      className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold whitespace-nowrap border"
      style={{ color: r.color, background: `${r.color}15`, borderColor: `${r.color}40` }}
    >
      {i.riskScore} {r.label}
    </span>
  );
};

const Status: React.FC<{ s: InspectionDoc['status'] }> = ({ s }) => {
  const pending = s === 'pending_review';
  const color = pending ? '#f59e0b' : '#10b981';
  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap border"
      style={{ color, background: `${color}15`, borderColor: `${color}40` }}
    >
      {pending ? 'Pending Review' : 'Approved'}
    </span>
  );
};

const Source: React.FC<{ s: InspectionDoc['inferenceSource'] }> = ({ s }) => (
  <span className="text-xs font-mono font-semibold" style={{ color: s === 'cloud' ? '#38bdf8' : '#00DF89' }}>
    {s === 'cloud' ? '☁️ Cloud' : '⚡ On-device'}
  </span>
);

// Sample fallback findings for Plant 2 model if live Firestore is empty
const SAMPLE_FINDINGS: InspectionDoc[] = [
  {
    id: 'INS-2048',
    ownerId: 'demo',
    reportText: 'Unsecured platform edge on level 3 with missing guardrails near eastern stairwell.',
    summary: 'Unsecured platform edge on level 3',
    hazardCategory: 'fall',
    likelihood: 4,
    severity: 5,
    riskScore: 20,
    riskLevel: 'critical',
    suggestedAction: 'Fit compliant guardrails and restrict worker access immediately.',
    inferenceSource: 'on-device',
    status: 'pending_review',
    schemaVersion: '1.0',
    createdAt: { toDate: () => new Date() } as unknown as InspectionDoc['createdAt'],
    updatedAt: { toDate: () => new Date() } as unknown as InspectionDoc['updatedAt'],
  },
  {
    id: 'INS-2047',
    ownerId: 'demo',
    reportText: 'Exposed 440V high-voltage wiring near water puddle on ground floor generator room.',
    summary: 'Exposed wiring near control panel',
    hazardCategory: 'electrical',
    likelihood: 3,
    severity: 5,
    riskScore: 15,
    riskLevel: 'high',
    suggestedAction: 'De-energize circuit and isolate area until electrician rewires conduit.',
    inferenceSource: 'cloud',
    status: 'pending_review',
    schemaVersion: '1.0',
    createdAt: { toDate: () => new Date(Date.now() - 3600000) } as unknown as InspectionDoc['createdAt'],
    updatedAt: { toDate: () => new Date() } as unknown as InspectionDoc['updatedAt'],
  },
  {
    id: 'INS-2046',
    ownerId: 'demo',
    reportText: 'Solvent barrels stored without secondary containment tray in loading aisle.',
    summary: 'Chemical containers left unlabeled',
    hazardCategory: 'chemical',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    riskLevel: 'medium',
    suggestedAction: 'Relocate to bonded chemical locker and attach GHS labels.',
    inferenceSource: 'on-device',
    status: 'approved',
    schemaVersion: '1.0',
    createdAt: { toDate: () => new Date(Date.now() - 7200000) } as unknown as InspectionDoc['createdAt'],
    updatedAt: { toDate: () => new Date() } as unknown as InspectionDoc['updatedAt'],
  },
];

// Exact 100% Replication of PDF Page 03: Interactive 3D Site Model (Plant 2 North Assembly)
const SiteModel: React.FC<{
  findings: InspectionDoc[];
  onNavigate?: (t: Target) => void;
  workspace?: string;
}> = ({ findings, onNavigate, workspace = 'Plant 2' }) => {
  const displayFindings = findings.length > 0 ? findings : SAMPLE_FINDINGS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('All hazards');

  const selectedFinding = displayFindings.find((f) => f.id === selectedId) || null;

  return (
    <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header Bar (Exact Page 03) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162E2A] pb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00DF89] font-bold">
            SITE MODEL · SAMPLE FINDINGS
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {workspace} · Facility overview
          </h2>
          <p className="text-xs text-slate-400">
            Interactive facility overview · select a marker to inspect a demo finding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
            ⚡ Visual prototype
          </span>
        </div>
      </div>

      {/* Filter Row & Orbit Controls (Exact Page 03) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All hazards', 'Fall', 'Electrical', 'Chemical', 'Equipment'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'bg-[#081211] border border-[#162E2A] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Drag to orbit · scroll to zoom
        </div>
      </div>

      {/* 3D Facility Canvas + Selected Finding Split Box (Exact Page 03) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 3D Isometric Viewport (lg:col-span-8) */}
        <div className="lg:col-span-8 relative bg-[#071311] rounded-2xl border border-[#162E2A] overflow-hidden min-h-[340px] flex items-center justify-center">
          <svg className="w-full h-[340px]" viewBox="0 0 650 340">
            <defs>
              <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#143A2F" />
                <stop offset="100%" stopColor="#0B231C" />
              </linearGradient>
            </defs>

            {/* Perspective Floor Grid */}
            <g stroke="#122E26" strokeWidth="0.8" opacity="0.6">
              {Array.from({ length: 15 }, (_, i) => (
                <line key={`v${i}`} x1={i * 46} y1="0" x2={i * 46 + 40} y2="340" />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 48} x2="650" y2={i * 48} />
              ))}
            </g>

            {/* 3D Isometric Building / Assembly Truss Structure */}
            {/* Base platform */}
            <polygon points="120,240 480,285 540,245 180,200" fill="url(#wallGradient)" stroke="#1F4E40" strokeWidth="1.5" />
            <polygon points="120,240 120,150 480,195 480,285" fill="#0C251D" stroke="#1F4E40" strokeWidth="1.5" />

            {/* Columns */}
            <rect x="180" y="160" width="18" height="85" fill="#143A2F" stroke="#1F4E40" />
            <rect x="250" y="170" width="18" height="80" fill="#143A2F" stroke="#1F4E40" />
            <rect x="320" y="180" width="18" height="75" fill="#143A2F" stroke="#1F4E40" />
            <rect x="390" y="190" width="18" height="70" fill="#143A2F" stroke="#1F4E40" />

            {/* Top Slanted Girder Roof */}
            <polygon points="100,150 470,195 490,180 120,135" fill="#1D4A3C" stroke="#2B6B57" strokeWidth="2" />

            {/* Catwalk Stairs on Right */}
            <g stroke="#265C4C" strokeWidth="1.5" fill="none">
              <line x1="450" y1="280" x2="540" y2="255" />
              <line x1="455" y1="290" x2="545" y2="265" />
              <line x1="460" y1="300" x2="550" y2="275" />
            </g>

            {/* Marker 1: FALL · CRITICAL */}
            <g
              onClick={() => setSelectedId('INS-2048')}
              className="cursor-pointer group"
            >
              <circle cx="440" cy="180" r="18" fill="#EF4444" fillOpacity="0.25" className="animate-ping" />
              <circle cx="440" cy="180" r="11" fill="#2A1013" stroke="#EF4444" strokeWidth="2" />
              <circle cx="440" cy="180" r="4" fill="#EF4444" />
            </g>

            {/* Marker 2: ELECTRICAL · HIGH */}
            <g
              onClick={() => setSelectedId('INS-2047')}
              className="cursor-pointer group"
            >
              <circle cx="230" cy="210" r="16" fill="#00DF89" fillOpacity="0.25" />
              <circle cx="230" cy="210" r="10" fill="#0F2923" stroke="#00DF89" strokeWidth="2" />
              <circle cx="230" cy="210" r="3.5" fill="#00DF89" />
            </g>

            {/* Marker 3: CHEMICAL · MEDIUM */}
            <g
              onClick={() => setSelectedId('INS-2046')}
              className="cursor-pointer group"
            >
              <circle cx="510" cy="255" r="16" fill="#F59E0B" fillOpacity="0.25" />
              <circle cx="510" cy="255" r="10" fill="#251C0C" stroke="#F59E0B" strokeWidth="2" />
              <circle cx="510" cy="255" r="3.5" fill="#F59E0B" />
            </g>
          </svg>

          {/* Glowing Labels Over Model (Exact Page 03) */}
          <div
            onClick={() => setSelectedId('INS-2048')}
            className="absolute right-36 top-20 bg-red-950/90 border border-red-500/40 text-red-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer hover:scale-105 transition shadow-lg"
          >
            FALL · CRITICAL
          </div>

          <div
            onClick={() => setSelectedId('INS-2047')}
            className="absolute left-32 bottom-24 bg-[#081211]/90 border border-[#162E2A] text-slate-300 px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer hover:scale-105 transition shadow-lg"
          >
            ELECTRICAL · HIGH
          </div>

          <div
            onClick={() => setSelectedId('INS-2046')}
            className="absolute right-12 bottom-16 bg-amber-950/90 border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer hover:scale-105 transition shadow-lg"
          >
            CHEMICAL · MEDIUM
          </div>

          <div className="absolute right-5 bottom-3 text-[9px] font-mono text-slate-500">
            NORTH ASSEMBLY · LEVEL 2 ↗
          </div>
        </div>

        {/* Right Selected Finding Card (lg:col-span-4) (Exact Page 03) */}
        <div className="lg:col-span-4 bg-[#081211] border border-[#162E2A] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#00DF89] font-bold">
              SELECTED FINDING
            </div>

            {selectedFinding ? (
              <div className="mt-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#00DF89]">
                    {shortId(selectedFinding.id)}
                  </span>
                  <RiskPill i={selectedFinding} />
                </div>

                <div className="text-sm font-bold text-white leading-snug">
                  {selectedFinding.summary}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedFinding.reportText}
                </p>

                <div className="bg-[#0C1A18] rounded-xl p-3 border border-[#162E2A] text-xs space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Suggested Action</div>
                  <div className="text-slate-300 font-medium">{selectedFinding.suggestedAction}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <Source s={selectedFinding.inferenceSource} />
                  <Status s={selectedFinding.status} />
                </div>
              </div>
            ) : (
              <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0C1A18] border border-[#162E2A] flex items-center justify-center text-[#00DF89]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Select a hazard marker</div>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                    Explore illustrative findings around the Plant 2 model.
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedFinding && (
            <button
              type="button"
              onClick={() => onNavigate?.('review')}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Inspect in Review &amp; Approve</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Legend (Exact Page 03) */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-[#162E2A]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> High / critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00DF89]"></span> On-device inference marker
          </span>
        </div>
        <span className="text-[#00DF89]">● 04 SAMPLE FINDINGS</span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<{ onNavigate?: (t: Target) => void; workspace?: string }> = ({ onNavigate, workspace = 'Plant 2' }) => {
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
    return () => {
      a();
      b();
    };
  }, [user]);

  const stats = useMemo(
    () => computeStats(inspections ?? [], actions ?? [], period),
    [inspections, actions, period]
  );
  const today = 'MONDAY, NOVEMBER 23, 2026';
  const msg = (t: string) => <div className="text-sm text-slate-500 py-12 text-center">{t}</div>;

  if (loading) return msg('Connecting to safety operations cloud…');
  if (!user) return msg('Sign in to see your safety overview.');
  if (!error && (inspections === null || actions === null)) return msg('Loading real-time safety telemetry…');

  const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  const maxLevel = Math.max(1, ...levels.map((l) => stats.byLevel[l]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-200">
      {error && (
        <div className="rounded-xl p-3.5 text-xs flex justify-between bg-red-950/40 border border-red-800/40 text-red-300">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header Bar (Exact Page 03) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#122421] pb-5">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#00DF89]">
            {today}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">
            Safety Intelligence Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor workplace conditions, edge AI hazard telemetry, and corrective actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#081211] text-slate-400 border border-[#162E2A]">
            DEMO DATA · LIVE CONNECTED
          </span>
        </div>
      </div>

      {/* 4 KPIs Row (Exact Page 03) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi
          label="Total inspections"
          value={stats.total > 0 ? stats.total : 128}
          sub="Sample period · 30 days"
          color="#00DF89"
          icon="📋"
        />
        <Kpi
          label="Detected hazards"
          value={stats.hazards > 0 ? stats.hazards : 18}
          sub={`Sample data · ${workspace}`}
          color="#f59e0b"
          icon="⚠️"
        />
        <Kpi
          label="High-risk findings"
          value={stats.highRisk > 0 ? stats.highRisk : 4}
          sub="2 require review"
          color="#ef4444"
          icon="⚡"
        />
        <Kpi
          label="Open actions"
          value={stats.openActions > 0 ? stats.openActions : 12}
          sub="3 due this week"
          color="#eab308"
          icon="🛡️"
        />
      </div>

      {/* 3D Facility Site Model (ALWAYS Rendered - Exact Page 03) */}
      <SiteModel findings={stats.findings} onNavigate={go} workspace={workspace} />

      {/* Charts Row: Risk Overview + Hazards by Category */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Risk overview" sub="Sample open hazards by risk level">
          <div className="flex items-end gap-4 h-48 pt-4">
            {levels.map((l) => (
              <div key={l} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  {stats.byLevel[l] || (l === 'critical' ? 2 : l === 'high' ? 4 : l === 'medium' ? 6 : 8)}
                </span>
                <div
                  className="w-full max-w-16 rounded-t-xl transition-all duration-500 shadow-md"
                  style={{
                    height: `${Math.max(15, (stats.byLevel[l] / maxLevel) * 100)}%`,
                    background: RISK[l].color,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 border-t border-[#162E2A] pt-2">
            {levels.map((l) => (
              <div key={l} className="flex-1 text-center text-xs font-mono font-medium text-slate-400 capitalize">
                {RISK[l].label}
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Hazards by category"
          sub="Demo distribution · Plant 2"
          right={
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-xl px-3 py-1.5 text-xs bg-[#081211] text-slate-300 border border-[#162E2A] focus:outline-none focus:border-[#00DF89] cursor-pointer"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          }
        >
          <div className="py-2">
            {stats.categoryTotal > 0 ? (
              <Donut rows={stats.categories} total={stats.categoryTotal} />
            ) : (
              <Donut
                rows={[
                  { key: 'fall', label: 'Fall hazards', count: 6 },
                  { key: 'electrical', label: 'Electrical', count: 4 },
                  { key: 'chemical', label: 'Chemical storage', count: 3 },
                  { key: 'equipment', label: 'Missing guarding', count: 3 },
                  { key: 'other', label: 'Environmental', count: 2 },
                ]}
                total={18}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Recent Inspections Table */}
      <Card
        title="Recent inspections"
        sub="Latest audit submissions across site facilities"
        right={
          <button
            onClick={() => go('history')}
            className="text-xs font-bold text-[#00DF89] hover:underline cursor-pointer"
          >
            View all &rarr;
          </button>
        }
      >
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#162E2A] text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-2.5 pr-4 font-semibold">Hazard</th>
                <th className="py-2.5 pr-4 font-semibold">Category</th>
                <th className="py-2.5 pr-4 font-semibold">Risk score</th>
                <th className="py-2.5 pr-4 font-semibold">Model</th>
                <th className="py-2.5 pr-4 font-semibold">Status</th>
                <th className="py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#122421]">
              {(stats.recent.length > 0 ? stats.recent : SAMPLE_FINDINGS).map((i) => (
                <tr key={i.id} className="hover:bg-[#0F2923]/30 transition group">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{i.summary}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {shortId(i.id)} · {when(i)}
                    </div>
                  </td>
                  <td className="py-3 pr-4 capitalize text-slate-300">{i.hazardCategory}</td>
                  <td className="py-3 pr-4"><RiskPill i={i} /></td>
                  <td className="py-3 pr-4"><Source s={i.inferenceSource} /></td>
                  <td className="py-3 pr-4"><Status s={i.status} /></td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => go('review')}
                      className="px-3 py-1 rounded-lg bg-[#081211] hover:bg-[#00DF89] hover:text-[#071311] text-slate-300 font-bold text-xs border border-[#162E2A] transition cursor-pointer"
                    >
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
  let acc = 0;
  return (
    <div className="flex items-center gap-8 flex-wrap justify-center sm:justify-start">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="#162E2A" strokeWidth="5" />
          {rows.map((r, i) => {
            const pct = (r.count / total) * 100;
            const el = (
              <circle
                key={r.key}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                stroke={CAT_COLORS[i % CAT_COLORS.length]}
                strokeWidth="5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-acc}
                transform="rotate(-90 21 21)"
              />
            );
            acc += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold font-mono text-white">{total}</div>
          <div className="text-[10px] uppercase font-mono text-slate-400">hazards</div>
        </div>
      </div>
      <ul className="flex-1 min-w-44 space-y-2 text-xs">
        {rows.map((r, i) => (
          <li key={r.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}
              />
              <span className="text-slate-300">{r.label}</span>
            </span>
            <span className="font-mono font-bold text-white">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
