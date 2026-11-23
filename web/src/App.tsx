import React, { useState } from 'react';
import { DashboardView } from './features/dashboard/index.tsx';
import { CaptureView } from './features/capture/index.tsx';
import { HistoryView } from './features/history/index.tsx';
import { ActionsView } from './features/actions/index.tsx';
import { AnalysisView } from './features/analysis/index.tsx';
import { ReviewView } from './features/review/index.tsx';
import { AuthView } from './features/auth/index.tsx';
import { useAuth } from './features/auth/useAuth';

type Tab = 'dashboard' | 'capture' | 'history' | 'actions' | 'analysis' | 'review' | 'auth';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('auth');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Simple Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
            🛡️
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-slate-900 leading-none">
              FieldGuard<span className="text-orange-600">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Enterprise Safety Platform</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('capture')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'capture'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ➕ New Inspection
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'actions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'analysis' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'auth' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{user ? '👤 Account' : '🔑 Sign In'}</span>
            {user && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </button>
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500">Inference:</span>
          <span className="font-mono font-semibold text-emerald-700">Gemini Nano (Edge)</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'capture' && <CaptureView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'actions' && <ActionsView />}
        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'review' && <ReviewView />}
        {activeTab === 'auth' && <AuthView />}
      </main>
    </div>
  );
};
