import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseConfigured } from '../../lib/firebase';

// Owner: Humna (humna/web-login) - Styled to 100% match Dark Industrial UI
export const AuthView: React.FC = () => {
  const {
    user,
    loading,
    error,
    setError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both corporate email and password.');
      return;
    }

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch {
      // Error handled in hook state
    }
  };

  const copyUidToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // 1. Logged In State (Inspector Account Profile Card - Dark UI)
  if (user) {
    return (
      <div className="max-w-md w-full mx-auto space-y-4">
        <div className="bg-[#0C1A18] rounded-2xl border border-[#162E2A] p-6 shadow-xl space-y-5 text-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-[#162E2A]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#00DF89] border border-[#00DF89]/30 flex items-center justify-center text-[#071311] font-black text-sm">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase() || 'SP'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.displayName || 'Certified Safety Inspector'}</div>
                <div className="text-xs text-slate-400 truncate font-mono">{user.email}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
              Active Session
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#081211] rounded-xl p-3 border border-[#162E2A]">
              <span className="text-slate-400 font-medium">Inspector UID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">{user.uid}</span>
                <button
                  type="button"
                  onClick={copyUidToClipboard}
                  className="px-2 py-0.5 rounded bg-[#0F2923] hover:bg-[#00DF89]/20 text-[#00DF89] text-[10px] font-mono border border-[#00DF89]/30 transition"
                >
                  {copiedUid ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#081211] rounded-xl p-3 border border-[#162E2A]">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Auth Provider</div>
                <div className="font-semibold text-slate-200 mt-0.5 text-xs">
                  {user.providerData[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Corporate Email'}
                </div>
              </div>
              <div className="bg-[#081211] rounded-xl p-3 border border-[#162E2A]">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Role Tier</div>
                <div className="font-semibold text-[#00DF89] mt-0.5 text-xs">Certified Auditor</div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold text-xs transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign Out of FieldGuard'}
          </button>
        </div>
      </div>
    );
  }

  // 2. Logged Out State (Login / Registration Form - 100% Dark UI matching PDF)
  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      <div className="bg-[#0C1A18] rounded-2xl border border-[#162E2A] p-7 shadow-2xl space-y-5 text-slate-200">
        {/* Brand Shield & Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F2923] border border-[#00DF89]/30 text-[#00DF89] shadow-sm mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {mode === 'signin' ? 'Inspector Sign In' : 'Create Inspector Account'}
          </h2>
          <p className="text-xs text-slate-400">
            FieldGuard AI Industrial Safety &amp; Hazard Audit System
          </p>
        </div>

        {/* Local Configuration Warning if .env.local is missing */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs rounded-xl p-3.5 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span> Local Configuration Required
            </div>
            <p className="text-[11px] leading-relaxed text-amber-400/90">
              Your Firebase API credentials have not been loaded into <code className="font-mono bg-amber-900/50 px-1 py-0.5 rounded text-amber-200">web/.env.local</code>. Please copy your web app config from Firebase Console into <code className="font-mono bg-amber-900/50 px-1 py-0.5 rounded text-amber-200">.env.local</code> to authenticate against <strong className="font-mono">fieldguard-ai</strong>.
            </p>
          </div>
        )}

        {/* Tab Selector (Sign In vs Register) */}
        <div className="flex bg-[#081211] p-1 rounded-xl text-xs font-semibold border border-[#162E2A]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition font-medium ${
              mode === 'signin' ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition font-medium ${
              mode === 'signup' ? 'bg-[#00DF89] text-[#071311] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-950/30 border border-red-800/50 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2">
            <span className="font-bold shrink-0">⚠️</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-[#162E2A] bg-[#081211] hover:bg-[#0F2923] hover:border-[#00DF89]/40 text-slate-200 font-semibold text-xs shadow-sm flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#162E2A] w-full"></div>
          <span className="bg-[#0C1A18] px-3 text-[10px] text-slate-500 uppercase font-semibold tracking-wider relative">
            Or corporate email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="safety.officer@fieldguard.internal"
              className="w-full bg-[#081211] border border-[#162E2A] rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] focus:ring-1 focus:ring-[#00DF89]/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#081211] border border-[#162E2A] rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] focus:ring-1 focus:ring-[#00DF89]/30 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-[#071311]/40 border-t-[#071311] rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : mode === 'signin' ? (
              'Sign In as Inspector'
            ) : (
              'Create Inspector Account'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
          Enforces ISO 45001 Access Controls &amp; Firebase App Check
        </div>
      </div>
    </div>
  );
};
