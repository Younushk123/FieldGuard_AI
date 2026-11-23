import React from 'react';

// Owner: Younus (younus/web-new-inspection)
export const CaptureView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">New Hazard Observation</h2>
        <p className="text-xs text-slate-500">Log site hazard report for on-device and cloud safety inference.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Hazard Report</label>
          <textarea
            rows={4}
            placeholder="Describe the hazard conditions observed (e.g. exposed wires, pooling water, missing guardrails)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-mono">Schema v1.0 • PREFER_ON_DEVICE</span>
          <button className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm">
            Analyze Hazard →
          </button>
        </div>
      </div>
    </div>
  );
};
