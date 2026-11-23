import React from 'react';

// Owner: Maaz (maaz/web-dashboard)
export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Enterprise Safety Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time hazard monitoring, 5x5 ISO risk matrix, and edge AI telemetry.
        </p>
      </div>
    </div>
  );
};
