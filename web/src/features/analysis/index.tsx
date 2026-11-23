import React from 'react';

// Owner: Humna (humna/web-cloud-analyst)
export const AnalysisView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900">Cloud AI Safety Analysis</h2>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Gemini 3.5 Flash Lite
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Provides engineering rationale, ISO 45001 hazard categorization, and prioritized corrective actions.
      </p>
    </div>
  );
};
