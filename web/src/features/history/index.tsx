import React, { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../lib/firebase';
import { subscribeInspections } from '../data/api';
import type { InspectionDoc } from '../data/types';

const CATEGORIES = ['fall', 'electrical', 'fire', 'chemical', 'mechanical', 'ergonomic', 'environmental', 'other'];
const LEVELS = ['low', 'medium', 'high', 'critical'];

const LEVEL_STYLE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const selectClass =
  'w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500';

function formatDate(i: InspectionDoc): string {
  // createdAt can be briefly empty right after saving, until the server confirms it.
  const d = i.createdAt?.toDate?.();
  return d ? d.toLocaleString() : 'Just now';
}

export const HistoryView: React.FC = () => {
  const [items, setItems] = useState<InspectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let stopData: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(getAuth(), (user) => {
      stopData?.();
      stopData = undefined;
      if (!user) {
        setItems([]);
        setLoading(false);
        setError('Please sign in to see your inspections.');
        return;
      }
      setLoading(true);
      setError('');
      stopData = subscribeInspections(
        user.uid,
        (data) => {
          setItems(data);
          setLoading(false);
        },
        (e) => {
          setError(e.message);
          setLoading(false);
        }
      );
    });
    return () => {
      stopAuth();
      stopData?.();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (category === 'all' || i.hazardCategory === category) &&
        (level === 'all' || i.riskLevel === level) &&
        (source === 'all' || i.inferenceSource === source) &&
        (status === 'all' || i.status === status) &&
        (!q || i.summary.toLowerCase().includes(q) || i.reportText.toLowerCase().includes(q))
    );
  }, [items, category, level, source, status, search]);

  const hasFilters = category !== 'all' || level !== 'all' || source !== 'all' || status !== 'all' || search !== '';

  function clearFilters() {
    setCategory('all');
    setLevel('all');
    setSource('all');
    setStatus('all');
    setSearch('');
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Inspection History</h2>
        <p className="text-xs text-slate-500">Your inspections, with filters for category, risk, inference source and status.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass} aria-label="Risk level">
          <option value="all">All risk levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass} aria-label="Inference source">
          <option value="all">All sources</option>
          <option value="on-device">On-device</option>
          <option value="cloud">Cloud</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="pending_review">Pending review</option>
          <option value="approved">Approved</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className={selectClass}
          aria-label="Search"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length} of {items.length}
        </span>
        {hasFilters && (
          <button onClick={clearFilters} className="font-semibold text-orange-600 hover:text-orange-700">
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      {loading ? (
        <p className="text-xs text-slate-500 py-6 text-center">Loading inspections...</p>
      ) : !error && items.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">No inspections yet. Create one from New Inspection.</p>
      ) : !error && filtered.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">No inspections match these filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Ref</th>
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Summary</th>
                <th className="py-2 pr-3 font-semibold">Category</th>
                <th className="py-2 pr-3 font-semibold">L x S</th>
                <th className="py-2 pr-3 font-semibold">Risk</th>
                <th className="py-2 pr-3 font-semibold">Source</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3 font-mono text-slate-500">{i.id.slice(0, 6).toUpperCase()}</td>
                  <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{formatDate(i)}</td>
                  <td className="py-2 pr-3 text-slate-900 max-w-xs">{i.summary}</td>
                  <td className="py-2 pr-3 capitalize">{i.hazardCategory}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {i.likelihood} x {i.severity}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full font-bold uppercase ${LEVEL_STYLE[i.riskLevel] ?? ''}`}>
                      {i.riskLevel} ({i.riskScore})
                    </span>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full font-bold ${
                        i.inferenceSource === 'on-device' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {i.inferenceSource === 'on-device' ? 'On-device' : 'Cloud'}
                    </span>
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {i.status === 'approved' ? 'Approved' : 'Pending review'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};