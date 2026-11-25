import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseConfigured } from '../../lib/firebase';

// Owner: Humna (humna/web-login)
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

  // 1. Logged In State (Inspector Account Card)
  if (user) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase() || 'SP'}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{user.displayName || 'Safety Inspector'}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Session
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Inspector User ID (UID)
            </div>
            <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded p-2 text-xs font-mono text-slate-800">
              <span className="truncate">{user.uid}</span>
              <button
                onClick={copyUidToClipboard}
                className="shrink-0 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans font-medium transition"
              >
                {copiedUid ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Used as <code className="font-mono text-slate-600">ownerId</code> across Firestore inspections, actions, and audit logs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Auth Provider</div>
              <div className="font-semibold text-slate-700 mt-0.5">
                {user.providerData[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Corporate Password'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Role Tier</div>
              <div className="font-semibold text-slate-700 mt-0.5">Certified Inspector</div>
            </div>
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="w-full py-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign Out of FieldGuard'}
          </button>
        </div>
      </div>
    );
  }

  // 2. Logged Out State (Login / Registration Form)
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-2xl mb-1">
            🛡️
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'signin' ? 'Inspector Sign In' : 'Create Inspector Account'}
          </h2>
          <p className="text-xs text-slate-500">
            FieldGuard AI Industrial Safety & Hazard Audit System
          </p>
        </div>

        {/* Local Configuration Warning if .env.local is missing */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span> Local Configuration Required
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              Your Firebase API credentials have not been loaded into <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">web/.env.local</code>. Please copy your web app config from Firebase Console into <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">.env.local</code> to authenticate against <strong className="font-mono">fieldguard-ai</strong>.
            </p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
            className={`flex-1 py-1.5 rounded-md transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 flex items-start gap-2">
            <span className="font-bold shrink-0">⚠️</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
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
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-semibold tracking-wider relative">
            Or corporate email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="safety.officer@fieldguard.internal"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : mode === 'signin' ? (
              'Sign In as Inspector'
            ) : (
              'Create Inspector Account'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-slate-400">
          Enforces ISO 45001 Access Controls &amp; Firebase App Check Attestation
        </div>
      </div>
    </div>
  );
};
