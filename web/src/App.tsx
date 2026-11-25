import React, { useEffect, useState } from 'react';
import { DashboardView } from './features/dashboard/index.tsx';
import { CaptureView } from './features/capture/index.tsx';
import { HistoryView } from './features/history/index.tsx';
import { ActionsView } from './features/actions/index.tsx';
import { AnalysisView } from './features/analysis/index.tsx';
import { ReviewView } from './features/review/index.tsx';
import { AuthView } from './features/auth/index.tsx';
import { useAuth } from './features/auth/useAuth';

type Tab = 'dashboard' | 'capture' | 'history' | 'actions' | 'analysis' | 'review' | 'auth';

const NAV: { tab: Tab; label: string }[] = [
  { tab: 'dashboard', label: 'Dashboard' },
  { tab: 'capture', label: 'New Inspection' },
  { tab: 'history', label: 'Inspections' },
  { tab: 'actions', label: 'Actions' },
  { tab: 'analysis', label: 'AI Intelligence' },
  { tab: 'auth', label: 'Settings' },
];
// Screens already built for the dark design. Every other screen sits on a light panel until it is restyled.
const RESTYLED: Tab[] = ['dashboard', 'actions'];
const C = { page: 'var(--fg-page)', side: 'var(--fg-side)', border: 'var(--fg-border)', text: 'var(--fg-text)', muted: 'var(--fg-muted)', accent: 'var(--fg-accent)', active: 'var(--fg-active)' };

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  return online;
}

export const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { user, loading } = useAuth();
  const online = useOnline();

  // After signing in, leave the sign-in screen.
  useEffect(() => { if (user) setTab('dashboard'); }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: C.page, color: C.muted }}>Loading…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.page }}><AuthView /></div>;

  const name = user.displayName || user.email || 'Inspector';
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const current = tab === 'review' ? 'Review' : NAV.find((n) => n.tab === tab)?.label ?? '';

  const navButton = (n: { tab: Tab; label: string }, row = false) => (
    <button key={n.tab} onClick={() => setTab(n.tab)}
      className={`text-left rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${row ? '' : 'w-full'}`}
      style={{ background: tab === n.tab ? C.active : 'transparent', color: tab === n.tab ? C.accent : C.muted }}>
      {n.label}
    </button>
  );

  const content = {
    dashboard: <DashboardView onNavigate={setTab} />,
    capture: <CaptureView />,
    history: <HistoryView />,
    actions: <ActionsView />,
    analysis: <AnalysisView />,
    review: <ReviewView />,
    auth: <AuthView />,
  }[tab];

  return (
    <div className="min-h-screen flex" style={{ background: C.page, color: C.text }}>
      <aside className="hidden md:flex w-60 shrink-0 flex-col p-4 gap-1" style={{ background: C.side, borderRight: `1px solid ${C.border}` }}>
        <div className="px-3 pb-4">
          <div className="text-lg font-bold">FieldGuard<span style={{ color: C.accent }}>AI</span></div>
          <div className="text-[10px] tracking-widest" style={{ color: C.muted }}>SAFETY OPERATIONS</div>
        </div>
        {NAV.map((n) => navButton(n))}
        <div className="mt-auto flex items-center gap-3 px-3 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: C.active, color: C.accent }}>{initials}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs truncate" style={{ color: C.muted }}>{user.email}</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 px-6 flex items-center justify-between gap-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="text-sm font-semibold">{current}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
              <span className="w-2 h-2 rounded-full" style={{ background: online ? '#10b981' : '#f59e0b' }} />
              {online ? 'Online' : 'Offline'}
            </div>
            <button onClick={() => setTab('capture')} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: C.accent, color: 'var(--fg-on-accent)' }}>
              + New Inspection
            </button>
          </div>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto p-2" style={{ borderBottom: `1px solid ${C.border}` }}>
          {NAV.map((n) => navButton(n, true))}
        </nav>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {RESTYLED.includes(tab) ? content : <div className="rounded-2xl bg-slate-50 text-slate-800 p-6">{content}</div>}
        </main>
      </div>
    </div>
  );
};
