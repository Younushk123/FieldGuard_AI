import React from 'react';

// Owner: Humna (humna/web-review)
export const ReviewView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Review & Approve Inspection</h2>
      <p className="text-xs text-slate-500">
        Certified inspector review and sign-off. AI never independently certifies a condition safe.
      </p>
    </div>
  );
};
