import React, { useEffect, useState } from 'react';
import { DashboardView } from './features/dashboard/index.tsx';
import { CaptureView } from './features/capture/index.tsx';
import { HistoryView } from './features/history/index.tsx';
import { ActionsView } from './features/actions/index.tsx';
import { AnalysisView } from './features/analysis/index.tsx';
import { ReviewView } from './features/review/index.tsx';
import { AuthView } from './features/auth/index.tsx';
import { useAuth } from './features/auth/useAuth';

type Tab = 'dashboard' | 'capture' | 'history' | 'review' | 'actions' | 'analysis' | 'settings';

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [workspace] = useState('Plant 2');
  const { user } = useAuth();
  const online = useOnline();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Safety overview';
      case 'capture': return 'New inspection';
      case 'history': return 'Safety overview';
      case 'review': return 'Safety overview';
      case 'actions': return 'Safety overview';
      case 'analysis': return 'Safety overview';
      case 'settings': return 'Inspector Profile & Security';
      default: return 'Safety overview';
    }
  };

  const name = user?.displayName || user?.email || 'Alex Morgan';
  const email = user?.email || 'lead-auditor@fieldguard.ai';
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'AM';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#070E0D] text-slate-200 font-sans antialiased select-none">
      {/* ================= LEFT SIDEBAR (100% MATCHING PDF) ================= */}
      <aside className="w-64 bg-[#081211] border-r border-[#122421] flex flex-col justify-between shrink-0 z-20">
        <div className="flex flex-col h-full">
          {/* Logo & Brand Header */}
          <div className="h-20 px-6 flex items-center gap-3 border-b border-[#122421]">
            <div className="w-9 h-9 rounded-xl bg-[#0F2923] border border-[#00DF89]/30 flex items-center justify-center text-[#00DF89] shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                FieldGuard <span className="text-[#00DF89] text-xs font-mono px-1.5 py-0.5 rounded bg-[#00DF89]/10 border border-[#00DF89]/30">AI</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider">SAFETY PLATFORM</div>
            </div>
          </div>

          {/* Plant / Workspace Selector Dropdown (from PDF Page 04) */}
          <div className="px-5 py-4">
            <div className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs cursor-pointer hover:border-[#00DF89]/40 transition">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#00DF89] animate-pulse"></span>
                <span className="font-semibold text-slate-200 truncate">{workspace} (Active)</span>
              </div>
              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>

            {/* Inspections (History) */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Inspections</span>
              </div>
            </button>

            {/* AI Intelligence (Page 06) */}
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Intelligence</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === 'analysis' ? 'bg-[#071311]/20 text-[#071311]' : 'bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30'
              }`}>
                Flash Lite
              </span>
            </button>

            {/* Review & Approve (Page 05/08) */}
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Review &amp; Approve</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === 'review' ? 'bg-[#071311]/20 text-[#071311]' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                Critical
              </span>
            </button>

            {/* Action Board (Page 09) */}
            <button
              type="button"
              onClick={() => setActiveTab('actions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'actions'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Action Board</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === 'actions' ? 'bg-[#071311]/20 text-[#071311]' : 'bg-[#162E2A] text-slate-400'
              }`}>
                5 open
              </span>
            </button>

            {/* Settings / Auth */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0C1A18]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </div>
            </button>
          </nav>

          {/* User Profile Card at bottom (from PDF) */}
          <div className="p-4 border-t border-[#122421]">
            <div
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#0C1A18] cursor-pointer transition"
            >
              <div className="w-9 h-9 rounded-full bg-[#00DF89] text-[#071311] font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{name}</div>
                <div className="text-[11px] text-slate-500 truncate">{email}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN VIEW CONTAINER (100% MATCHING PDF) ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070E0D]">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#081211] border-b border-[#122421] px-8 flex items-center justify-between shrink-0 z-10">
          {/* Breadcrumb: Plant 2 > Safety overview */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">{workspace}</span>
            <span className="text-slate-600">&gt;</span>
            <span className="text-white font-semibold">{getBreadcrumb()}</span>
          </div>

          {/* Right Controls: Online status, bell, Export PDF, + New Inspection, Profile */}
          <div className="flex items-center gap-4">
            {/* Online Indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-[#00DF89]' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] font-medium">{online ? 'Online · demo data' : 'Offline'}</span>
            </div>

            {/* Bell Icon */}
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#0C1A18] border border-[#162E2A] flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Export PDF Button */}
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#0C1A18] border border-[#162E2A] text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export PDF</span>
            </button>

            {/* + New Inspection (Mint Green Button Exact from PDF) */}
            <button
              type="button"
              onClick={() => setActiveTab('capture')}
              className="px-4 py-1.5 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>+</span>
              <span>New Inspection</span>
            </button>

            {/* Profile Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-[#00DF89] text-[#071311] font-black text-xs flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(t) => setActiveTab(t as Tab)} />}
          {activeTab === 'capture' && <CaptureView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'actions' && <ActionsView />}
          {activeTab === 'analysis' && <AnalysisView />}
          {activeTab === 'review' && <ReviewView />}
          {activeTab === 'settings' && <AuthView />}
        </main>
      </div>
    </div>
  );
};
