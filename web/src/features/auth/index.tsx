import React from 'react';

// Owner: Humna (humna/web-login)
export const AuthView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-md mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Inspector Sign In</h2>
        <p className="text-xs text-slate-500">FieldGuard AI Workplace Safety</p>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <input
          type="email"
          placeholder="Corporate Email"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900"
        />
        <button className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm">
          Sign In
        </button>
      </form>
    </div>
  );
};
