import React, { useState } from 'react';
import { useEffect } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import type { UserProfile } from './useAuth';

// Owner: Humna (humna/web-login) - Exact 100% Replication of PDF Page 10 (Sign-in Screen)
export const AuthView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {
    user,
    loading,
    error,
    setError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    registerCorporate,
    joinTeam,
    profile,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [accountKind, setAccountKind] = useState<'personal' | 'corporate' | 'join'>('personal');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [teamInviteCode, setTeamInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [teamError, setTeamError] = useState('');
  const [teamBusy, setTeamBusy] = useState(false);

  useEffect(() => {
    if (!profile?.teamId) {
      setTeamMembers([]);
      setTeamInviteCode('');
      return;
    }
    const stopTeam = onSnapshot(doc(db, 'teams', profile.teamId), (snapshot) => {
      setTeamInviteCode(typeof snapshot.data()?.inviteCode === 'string' ? snapshot.data()?.inviteCode : '');
    });
    const stopMembers = onSnapshot(
      query(collection(db, 'users'), where('teamId', '==', profile.teamId)),
      (snapshot) => setTeamMembers(snapshot.docs.map((item) => item.data() as UserProfile)),
      (error) => setTeamError(error.message)
    );
    return () => {
      stopTeam();
      stopMembers();
    };
  }, [profile?.teamId]);

  const deleteTeamMember = async (member: UserProfile) => {
    if (!window.confirm(`Remove ${member.email} from this team?`)) return;
    setTeamError('');
    setTeamBusy(true);
    try {
      await updateDoc(doc(db, 'users', member.uid), {
        status: 'disabled',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Could not remove team member.');
    } finally {
      setTeamBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both corporate email and password.');
      return;
    }
    if (mode === 'signup' && accountKind === 'corporate' && !teamName.trim()) {
      setError('Please provide a corporate account name.');
      return;
    }
    if (mode === 'signup' && accountKind === 'join' && !inviteCode.trim()) {
      setError('Please provide the team invite code.');
      return;
    }

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else if (accountKind === 'corporate') {
        await registerCorporate(email, password, teamName);
      } else if (accountKind === 'join') {
        await joinTeam(email, password, inviteCode);
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

  // 1. Logged In State (Settings & Inspector Profile View)
  if (user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-slate-200">
        {profile?.status === 'disabled' && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-xs text-red-300">
            Your team access has been removed. Sign out or continue as a personal account.
          </div>
        )}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00DF89] font-bold">
            WORKSPACE / CONFIGURATION
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">
            Inspector Account &amp; Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your verified auditor identity, security tier, and connected safety cloud.
          </p>
        </div>

        <div className="bg-[#0C1A18] rounded-2xl border border-[#162E2A] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-[#162E2A]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00DF89] text-[#071311] font-black text-base flex items-center justify-center shadow-md">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase() || 'SP'}
              </div>
              <div>
                <div className="text-base font-bold text-white">{user.displayName || 'Certified Safety Inspector'}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00DF89]/10 text-[#00DF89] border border-[#00DF89]/30">
              Active Inspector
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#081211] rounded-xl p-3.5 border border-[#162E2A]">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Inspector UID</div>
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="font-mono text-slate-300 text-[11px] truncate">{user.uid}</span>
                <button
                  type="button"
                  onClick={copyUidToClipboard}
                  className="px-2 py-0.5 rounded bg-[#0F2923] hover:bg-[#00DF89]/20 text-[#00DF89] text-[10px] font-mono border border-[#00DF89]/30 transition shrink-0"
                >
                  {copiedUid ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-[#081211] rounded-xl p-3.5 border border-[#162E2A]">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Auth Method</div>
              <div className="font-semibold text-slate-200 mt-1">
                {user.providerData[0]?.providerId === 'google.com' ? 'Google OAuth 2.0' : 'Corporate Password'}
              </div>
            </div>

            <div className="bg-[#081211] rounded-xl p-3.5 border border-[#162E2A]">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Auditor Certification</div>
              <div className="font-semibold text-[#00DF89] mt-1">ISO 45001 Level 3 Auditor</div>
            </div>

            <div className="bg-[#081211] rounded-xl p-3.5 border border-[#162E2A]">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Plant</div>
              <div className="font-semibold text-slate-200 mt-1">Plant 2 · Industrial Assembly</div>
            </div>
          </div>

          {profile?.role === 'manager' && profile.teamId && (
            <div className="rounded-2xl border border-[#162E2A] bg-[#081211] p-5 space-y-4">
              <div>
                <div className="text-sm font-bold text-white">Team management</div>
                <p className="mt-1 text-xs text-slate-400">
                  {profile.teamName || 'Corporate team'} · Share this code so members can join.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#162E2A] bg-[#0C1A18] p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase text-slate-500">Team invite code</div>
                  <div className="mt-1 font-mono text-sm font-bold tracking-widest text-[#00DF89]">
                    {teamInviteCode || 'Loading...'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!teamInviteCode}
                  onClick={() => navigator.clipboard.writeText(teamInviteCode)}
                  className="rounded-lg border border-[#00DF89]/30 px-2.5 py-1.5 text-[10px] font-semibold text-[#00DF89] disabled:opacity-50"
                >
                  Copy
                </button>
              </div>

              {teamError && <div className="text-xs text-red-400">{teamError}</div>}

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.uid} className="flex items-center justify-between rounded-xl border border-[#162E2A] bg-[#0C1A18] px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-200">{member.email}</div>
                      <div className="mt-0.5 text-[10px] font-mono text-slate-500">
                        {member.role === 'manager' ? 'MANAGER' : 'MEMBER'} · {member.status}
                      </div>
                    </div>
                    {member.role !== 'manager' && (
                      <button
                        type="button"
                        onClick={() => deleteTeamMember(member)}
                        disabled={teamBusy}
                        className="ml-3 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[10px] font-semibold text-red-400 transition hover:bg-red-950/30 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={logout}
              disabled={loading}
              className="py-2.5 px-5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold text-xs transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing out...' : 'Sign Out of FieldGuard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged Out State: 100% Exact Match of Page 10 of PDF (Split Screen Hero + Form)
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#070E0D] text-slate-200 select-none">
      {/* ================= LEFT SIDE: HERO BRANDING (PAGE 10 LEFT HALF) ================= */}
      <div className="relative lg:w-7/12 min-h-[450px] lg:min-h-screen bg-[#071311] border-b lg:border-b-0 lg:border-r border-[#122421] p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Subtle Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#00DF89 1px, transparent 1px), linear-gradient(90deg, #00DF89 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F2923] border border-[#00DF89]/30 flex items-center justify-center text-[#00DF89] shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              FieldGuard<span className="text-[#00DF89]">AI</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">SAFETY OPERATIONS</div>
          </div>
        </div>

        {/* Center Giant Hero Typography (Exact Words from Page 10) */}
        <div className="relative z-10 my-auto py-12">
          {/* Watermark Big Outline Shield */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden xl:block">
            <svg className="w-80 h-80 text-[#00DF89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00DF89] mb-4">
            SAFETY, WITH HUMAN OVERSIGHT
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05]">
            <span className="block text-white">Inspect.</span>
            <span className="block text-white">Assess.</span>
            <span className="block text-[#00DF89]">Approve.</span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl font-medium mt-6 max-w-md">
            AI suggests, a human decides.
          </p>

          <div className="mt-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0C1A18]/80 border border-[#162E2A] text-slate-300 text-xs">
            <svg className="w-4 h-4 text-[#00DF89] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>AI suggests; a human reviews and decides.</span>
          </div>
        </div>

        {/* Bottom Footer Line (Exact from Page 10) */}
        <div className="relative z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          © 2026 FIELDGUARD AI • BUILT FOR THE PEOPLE ON SITE
        </div>
      </div>

      {/* ================= RIGHT SIDE: AUTH FORM (PAGE 10 RIGHT HALF) ================= */}
      <div className="lg:w-5/12 bg-[#081211] p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Back Link (Exact from Page 10) */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-mono text-slate-400 hover:text-[#00DF89] flex items-center gap-1.5 transition cursor-pointer mb-2"
            >
              <span>&larr;</span>
              <span>Back to FieldGuard</span>
            </button>
          )}

          {/* Header Title Section (Exact from Page 10) */}
          <div>
            <div className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#00DF89]">
              WELCOME BACK
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              {mode === 'signin' ? 'Sign in to FieldGuard' : 'Create Inspector Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Access your safety workspace.
            </p>
          </div>

          {/* Local Config Notice if .env.local was missing */}
          {!isFirebaseConfigured && (
            <div className="bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs rounded-xl p-3.5 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Local Configuration Required
              </div>
              <p className="text-[11px] leading-relaxed text-amber-400/90">
                Your Firebase API credentials have not been loaded into <code className="font-mono bg-amber-900/50 px-1 py-0.5 rounded text-amber-200">web/.env.local</code>.
              </p>
            </div>
          )}

          {/* Mode Switch (Sign In vs Register) */}
          <div className="flex bg-[#0C1A18] p-1 rounded-xl text-xs font-semibold border border-[#162E2A]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition font-medium cursor-pointer ${
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
              className={`flex-1 py-2 rounded-lg transition font-medium cursor-pointer ${
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
            className="w-full py-2.5 px-4 rounded-xl border border-[#162E2A] bg-[#0C1A18] hover:bg-[#0F2923] hover:border-[#00DF89]/40 text-slate-200 font-semibold text-xs shadow-sm flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
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
            <span className="bg-[#081211] px-3 text-[10px] text-slate-500 uppercase font-semibold tracking-wider relative">
              Or corporate email
            </span>
          </div>

          {/* Form Fields (Matching Page 10 input design) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Account type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountKind('personal')}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        accountKind === 'personal'
                          ? 'border-[#00DF89] bg-[#00DF89]/10 text-[#00DF89]'
                          : 'border-[#162E2A] bg-[#0C1A18] text-slate-400'
                      }`}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountKind('corporate')}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        accountKind === 'corporate'
                          ? 'border-[#00DF89] bg-[#00DF89]/10 text-[#00DF89]'
                          : 'border-[#162E2A] bg-[#0C1A18] text-slate-400'
                      }`}
                    >
                      Corporate / Team
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountKind('join')}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        accountKind === 'join'
                          ? 'border-[#00DF89] bg-[#00DF89]/10 text-[#00DF89]'
                          : 'border-[#162E2A] bg-[#0C1A18] text-slate-400'
                      }`}
                    >
                      Join Team
                    </button>
                  </div>
                </div>
                {accountKind === 'corporate' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Corporate account name</label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      maxLength={80}
                      placeholder="e.g. Acme Safety Operations"
                      className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89]"
                    />
                  </div>
                )}
                {accountKind === 'join' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Team invite code</label>
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      maxLength={20}
                      placeholder="Enter invite code"
                      className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89]"
                    />
                  </div>
                )}
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] focus:ring-1 focus:ring-[#00DF89]/30 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#0C1A18] border border-[#162E2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00DF89] focus:ring-1 focus:ring-[#00DF89]/30 transition"
              />
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-[#071311]/40 border-t-[#071311] rounded-full animate-spin"></span>
                  Authenticating...
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
    </div>
  );
};
