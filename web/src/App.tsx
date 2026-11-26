import React, { useEffect, useState } from 'react';
import { LandingPageView } from './features/landing/index.tsx';
import { DashboardView } from './features/dashboard/index.tsx';
import { CaptureView } from './features/capture/index.tsx';
import { HistoryView } from './features/history/index.tsx';
import { ActionsView } from './features/actions/index.tsx';
import { AnalysisView } from './features/analysis/index.tsx';
import { ReviewView } from './features/review/index.tsx';
import { AuthView } from './features/auth/index.tsx';
import { useAuth } from './features/auth/useAuth';

type Tab = 'dashboard' | 'capture' | 'history' | 'review' | 'actions' | 'analysis' | 'settings';

function getRouteFromPath(path: string): { type: 'landing' | 'signin' | 'app'; tab: Tab } {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean || clean === 'landing') {
    return { type: 'landing', tab: 'dashboard' };
  }
  if (clean === 'signin' || clean === 'login') {
    return { type: 'signin', tab: 'settings' };
  }
  let tab: Tab = 'dashboard';
  if (clean === 'dashboard') tab = 'dashboard';
  else if (clean === 'capture' || clean === 'new' || clean === 'new-inspection') tab = 'capture';
  else if (clean === 'history' || clean === 'inspections') tab = 'history';
  else if (clean === 'review') tab = 'review';
  else if (clean === 'actions') tab = 'actions';
  else if (clean === 'analysis') tab = 'analysis';
  else if (clean === 'settings' || clean === 'profile') tab = 'settings';
  return { type: 'app', tab };
}

function tabToPath(tab: Tab): string {
  switch (tab) {
    case 'dashboard': return '/dashboard';
    case 'capture': return '/capture';
    case 'history': return '/inspections';
    case 'review': return '/review';
    case 'actions': return '/actions';
    case 'analysis': return '/analysis';
    case 'settings': return '/settings';
  }
}

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
  const [routeInfo, setRouteInfo] = useState(() => getRouteFromPath(window.location.pathname));
  const [workspace, setWorkspace] = useState('Plant 2');
  const { user, loading } = useAuth();
  const online = useOnline();

  useEffect(() => {
    const onPop = () => {
      setRouteInfo(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRouteInfo(getRouteFromPath(path));
  };

  const handleTabChange = (tab: Tab) => {
    navigate(tabToPath(tab));
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#070E0D] text-slate-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00DF89] border-t-transparent rounded-full animate-spin"></div>
          <div>CONNECTING TO FIELDGUARD SAFETY CLOUD...</div>
        </div>
      </div>
    );
  }

  // 1. Standalone Public Landing Page at "/" (No sidebar, no top bar, 100% standalone)
  if (routeInfo.type === 'landing') {
    return (
      <LandingPageView
        onLaunchDashboard={() => navigate('/dashboard')}
        onSignIn={() => navigate('/signin')}
        onExploreAI={() => navigate('/analysis')}
      />
    );
  }

  // 2. Standalone Sign In Page at "/signin" (when not logged in)
  if (routeInfo.type === 'signin' && !user) {
    return <AuthView onBack={() => navigate('/')} />;
  }

  // 3. Authenticated App Protection (Redirect unauthenticated users to Sign In with Back to "/")
  if (!user) {
    return <AuthView onBack={() => navigate('/')} />;
  }

  const activeTab = routeInfo.tab;

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Safety overview';
      case 'capture': return 'New inspection';
      case 'history': return 'Safety overview';
      case 'review': return 'Safety overview';
      case 'actions': return 'Safety overview';
      case 'analysis': return 'AI Analysis';
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
          <div
            onClick={() => navigate('/')}
            className="h-20 px-6 flex items-center gap-3 border-b border-[#122421] cursor-pointer hover:bg-[#0C1A18]/50 transition"
            title="FieldGuard AI - Public Home"
          >
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
            <div className="relative">
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-200 appearance-none focus:outline-none focus:border-[#00DF89] cursor-pointer hover:border-[#00DF89]/40 transition pr-9"
              >
                <option value="Plant 2" className="bg-[#0C1A18] text-white">Plant 2 (Industrial Zone)</option>
                <option value="Plant 1" className="bg-[#0C1A18] text-white">Plant 1 (Assembly Line)</option>
                <option value="Plant 3" className="bg-[#0C1A18] text-white">Plant 3 (Chemical Storage)</option>
                <option value="Offshore Delta" className="bg-[#0C1A18] text-white">Offshore Platform Delta</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00DF89] animate-pulse"></span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => handleTabChange('dashboard')}
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
              onClick={() => handleTabChange('history')}
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

            {/* AI Analysis (Page 06) */}
            <button
              type="button"
              onClick={() => handleTabChange('analysis')}
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
                <span>AI Analysis</span>
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
              onClick={() => handleTabChange('review')}
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
              onClick={() => handleTabChange('actions')}
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
              onClick={() => handleTabChange('settings')}
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
                <span>{user ? 'Settings' : 'Sign In / Account'}</span>
              </div>
              {!user && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
                  Login
                </span>
              )}
            </button>
          </nav>

          {/* User Profile Card at bottom (from PDF) */}
          <div className="p-4 border-t border-[#122421]">
            {user ? (
              <div
                onClick={() => handleTabChange('settings')}
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
            ) : (
              <div
                onClick={() => handleTabChange('settings')}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#0C1A18] cursor-pointer transition border border-dashed border-[#162E2A]"
              >
                <div className="w-8 h-8 rounded-full bg-[#162E2A] text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#00DF89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#00DF89]">Sign In</div>
                  <div className="text-[10px] text-slate-500 truncate">Authenticate Inspector</div>
                </div>
              </div>
            )}
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
              onClick={() => handleTabChange('capture')}
              className="px-4 py-1.5 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>+</span>
              <span>New Inspection</span>
            </button>

            {/* Profile Avatar / Sign In Button */}
            {user ? (
              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                title="Account Settings"
                className="w-8 h-8 rounded-full bg-[#00DF89] text-[#071311] font-black text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#00DF89]/50 transition"
              >
                {initials}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="px-3.5 py-1.5 rounded-xl border border-[#00DF89]/40 bg-[#00DF89]/10 hover:bg-[#00DF89]/20 text-[#00DF89] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(t) => handleTabChange(t as Tab)} workspace={workspace} />}
          {activeTab === 'capture' && <CaptureView initialSite={workspace} />}
          {activeTab === 'history' && <HistoryView onNavigate={(t) => handleTabChange(t as Tab)} />}
          {activeTab === 'actions' && <ActionsView />}
          {activeTab === 'analysis' && <AnalysisView />}
          {activeTab === 'review' && <ReviewView />}
          {activeTab === 'settings' && <AuthView />}
        </main>
      </div>
    </div>
  );
};
