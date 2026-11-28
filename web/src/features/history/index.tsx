import React, { useEffect, useMemo, useState } from 'react';
import '../../lib/firebase';
import { subscribeInspections } from '../data/api';
import type { InspectionDoc } from '../data/types';
import { inspectionMatchesWorkspace, siteLabelForSelection, type SiteSelection } from '../data/sites.ts';
import { useAuth } from '../auth/useAuth';

const CATEGORIES = ['fall', 'electrical', 'fire', 'chemical', 'mechanical', 'ergonomic', 'environmental', 'other'];
const LEVELS = ['low', 'medium', 'high', 'critical'];

const RISK_PILL: Record<string, string> = {
  critical: 'border-red-500/40 text-red-400 bg-red-500/10',
  high: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  medium: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  low: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
};

const STATUS_PILL: Record<string, string> = {
  approved: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  pending_review: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  rejected: 'border-red-500/40 text-red-400 bg-red-500/10',
};

// Owner: Younus / Humna - 100% Exact match of Page 04 (Inspections register)
export const HistoryView: React.FC<{ workspace: SiteSelection; onNavigate?: (tab: string, inspectionId?: string) => void }> = ({ workspace, onNavigate }) => {
  const { user, profile } = useAuth();
  const teamId = profile?.teamId || null;
  const [items, setItems] = useState<InspectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    return subscribeInspections(
      user.uid,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
      teamId
    );
  }, [user, teamId]);

  const siteItems = useMemo(
    () => items.filter((inspection) => inspectionMatchesWorkspace(inspection, workspace)),
    [items, workspace]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return siteItems.filter(
      (i) =>
        (category === 'all' || i.hazardCategory.toLowerCase() === category.toLowerCase()) &&
        (level === 'all' || i.riskLevel === level) &&
        (source === 'all' || i.inferenceSource === source) &&
        (status === 'all' || i.status === status) &&
        (!q || i.summary.toLowerCase().includes(q) || i.reportText.toLowerCase().includes(q))
    );
  }, [siteItems, category, level, source, status, search]);

  const hasFilters = category !== 'all' || level !== 'all' || source !== 'all' || status !== 'all' || search !== '';

  function clearFilters() {
    setCategory('all');
    setLevel('all');
    setSource('all');
    setStatus('all');
    setSearch('');
  }

  function formatDate(i: InspectionDoc): string {
    const d = i.createdAt?.toDate?.();
    if (!d) return 'Just now';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header Bar (Page 04) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#122421] pb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00DF89] font-bold">
            RECORDS / SITE ACTIVITY
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">
            Inspections
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and audit verified hazard records for {siteLabelForSelection(workspace)}.
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('capture')}
            className="px-4 py-2 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <span>+</span>
            <span>New inspection</span>
          </button>
        )}
      </div>

      {/* Filter Control Bar (Page 04) */}
      <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-72 relative">
          <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspections..."
            className="w-full bg-[#081211] border border-[#162E2A] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF89] transition"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#081211] border border-[#162E2A] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00DF89] transition capitalize cursor-pointer"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-[#081211] border border-[#162E2A] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00DF89] transition capitalize cursor-pointer"
          >
            <option value="all">All risk levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#081211] border border-[#162E2A] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00DF89] transition capitalize cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#00DF89] hover:underline px-2 cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card (Page 04) */}
      <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono">
            Loading verified inspections...
          </div>
        ) : error ? (
          <div className="p-6 text-red-400 text-xs">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <div className="text-sm font-bold text-white">No inspections recorded yet</div>
            <p className="text-slate-500">Go to "New Inspection" to log your first field hazard report.</p>
          </div>
        ) : siteItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No inspections recorded for {siteLabelForSelection(workspace)}.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No inspection matches the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#162E2A] text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-5 font-semibold">Inspection ID</th>
                  <th className="py-3 px-4 font-semibold">Site</th>
                  <th className="py-3 px-4 font-semibold">Hazard</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Model</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#122421]">
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-[#0F2923]/30 transition group">
                    <td className="py-3.5 px-5 font-mono text-[#00DF89] font-bold">
                      {`INS-${i.id.slice(0, 4).toUpperCase()}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {siteLabelForSelection(workspace)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-sm truncate">
                      {i.summary || i.reportText}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081211] border border-[#162E2A] text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00DF89]"></span>
                        {i.hazardCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(i)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border ${
                        RISK_PILL[i.riskLevel] || 'border-slate-500 text-slate-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {i.riskScore} {i.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-[#00DF89]">
                        {i.inferenceSource === 'on-device' ? '⚡ On-device' : '☁️ Cloud'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border ${
                        STATUS_PILL[i.status] || 'border-slate-500 text-slate-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {i.status === 'approved' ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('review', i.id)}
                        className="w-7 h-7 rounded-lg bg-[#081211] hover:bg-[#00DF89] hover:text-[#071311] border border-[#162E2A] inline-flex items-center justify-center text-slate-400 transition cursor-pointer"
                        title="Review finding"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
