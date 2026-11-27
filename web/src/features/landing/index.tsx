import React from 'react';

// Exact 100% Replication of PDF Page 02: Landing Page
export const LandingPageView: React.FC<{
  onLaunchDashboard: () => void;
  onSignIn: () => void;
  onExploreAI?: () => void;
}> = ({ onLaunchDashboard, onSignIn, onExploreAI }) => {
  return (
    <div className="min-h-screen w-full bg-[#070E0D] text-slate-200 flex flex-col justify-between overflow-x-hidden select-none relative">
      {/* Background Subtle Isometric Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00DF89 1px, transparent 1px), linear-gradient(90deg, #00DF89 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ================= TOP NAVIGATION BAR (Exact Page 02) ================= */}
      <header className="relative z-20 h-20 px-8 lg:px-16 flex items-center justify-between border-b border-[#122421]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F2923] border border-[#00DF89]/30 flex items-center justify-center text-[#00DF89] shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              FIELDGUARD <span className="text-[#00DF89]">/ AI</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">SAFETY INTELLIGENCE</div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <button onClick={onLaunchDashboard} className="hover:text-white transition cursor-pointer">Platform</button>
          <button onClick={onExploreAI || onLaunchDashboard} className="hover:text-white transition cursor-pointer">AI intelligence</button>
          <button onClick={onLaunchDashboard} className="hover:text-white transition cursor-pointer">How it works</button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#081211] text-[#00DF89] border border-[#162E2A]">
            PROTOTYPE · SAMPLE DATA
          </span>
          <button
            type="button"
            onClick={onSignIn}
            className="text-xs font-bold text-white hover:text-[#00DF89] flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Sign in</span>
            <span>&rarr;</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN HERO SECTION (Split 2 Columns) ================= */}
      <main className="relative z-10 flex-1 px-8 lg:px-16 py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full">
        {/* Left Hero Column (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#081211] border border-[#162E2A] text-[11px] font-mono font-bold text-[#00DF89]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00DF89] animate-pulse"></span>
            HYBRID SAFETY INTELLIGENCE
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
            See risks before they become <span className="text-[#00DF89]">incidents.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
            Intelligent workplace safety inspections powered by hybrid AI. Detect hazards, assess risks, and drive corrective action — even offline.
          </p>

          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="px-6 py-3.5 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs flex items-center gap-2 shadow-xl hover:shadow-[#00DF89]/20 transition cursor-pointer"
            >
              <span>Launch dashboard</span>
              <span>&rarr;</span>
            </button>
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="px-5 py-3.5 rounded-xl bg-[#081211] border border-[#162E2A] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Explore platform</span>
              <span>&darr;</span>
            </button>
          </div>

          {/* Footer Badges */}
          <div className="pt-8 flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>📱</span>
              <span>ON-DEVICE FIRST</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>HUMAN APPROVED</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span>OFFLINE READY</span>
            </div>
          </div>
        </div>

        {/* Right 3D Facility Model Showcase (lg:col-span-6) */}
        <div className="lg:col-span-6 relative">
          <div className="bg-[#0C1A18]/90 border border-[#162E2A] rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Model Card Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-[#162E2A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00DF89] animate-pulse"></span>
                <span className="text-white font-bold">FACILITY MODEL / PLANT 2</span>
              </div>
              <span>DEMO ENVIRONMENT 01 / 04</span>
            </div>

            {/* Interactive 3D SVG Isometric Facility */}
            <div className="relative w-full h-[320px] sm:h-[380px] bg-[#071311] rounded-2xl border border-[#162E2A] overflow-hidden flex items-center justify-center">
              {/* Floor Grid Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 380">
                <defs>
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#143A2F" />
                    <stop offset="100%" stopColor="#0B231C" />
                  </linearGradient>
                  <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00DF89" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00DF89" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Perspective Grid Floor */}
                <g stroke="#122E26" strokeWidth="0.8" opacity="0.6">
                  {Array.from({ length: 14 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45 + 50} y2="380" />
                  ))}
                  {Array.from({ length: 9 }, (_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 45} x2="600" y2={i * 45} />
                  ))}
                </g>

                {/* 3D Isometric Building / Assembly Truss Structure */}
                {/* Roof Slanted Beam */}
                <polygon points="120,230 460,285 530,250 190,195" fill="url(#beamGrad)" stroke="#1F4E40" strokeWidth="1.5" />
                <polygon points="120,230 120,135 460,190 460,285" fill="#0C251D" stroke="#1F4E40" strokeWidth="1.5" />
                
                {/* Structural Vertical Columns */}
                <rect x="180" y="150" width="16" height="90" fill="#143A2F" stroke="#1F4E40" />
                <rect x="250" y="165" width="16" height="85" fill="#143A2F" stroke="#1F4E40" />
                <rect x="320" y="180" width="16" height="80" fill="#143A2F" stroke="#1F4E40" />
                <rect x="390" y="195" width="16" height="75" fill="#143A2F" stroke="#1F4E40" />

                {/* Top Slanted Girder Roof */}
                <polygon points="100,140 450,190 470,175 120,125" fill="#1D4A3C" stroke="#2B6B57" strokeWidth="2" />
                
                {/* Catwalk Stairs on Right */}
                <g stroke="#265C4C" strokeWidth="1.5" fill="none">
                  <line x1="430" y1="280" x2="520" y2="260" />
                  <line x1="435" y1="290" x2="525" y2="270" />
                  <line x1="440" y1="300" x2="530" y2="280" />
                </g>

                {/* Hazard Beacon: ELECTRICAL · HIGH */}
                <g className="cursor-pointer">
                  <circle cx="215" cy="205" r="16" fill="url(#beaconGlow)" />
                  <circle cx="215" cy="205" r="10" fill="#0F2923" stroke="#00DF89" strokeWidth="2" />
                  <circle cx="215" cy="205" r="3.5" fill="#00DF89" />
                </g>

                {/* Hazard Beacon: FALL · CRITICAL */}
                <g className="cursor-pointer">
                  <circle cx="430" cy="180" r="18" fill="#EF4444" fillOpacity="0.25" />
                  <circle cx="430" cy="180" r="10" fill="#2A1013" stroke="#EF4444" strokeWidth="2" />
                  <circle cx="430" cy="180" r="3.5" fill="#EF4444" />
                </g>

                {/* Hazard Beacon: CHEMICAL · MEDIUM */}
                <g className="cursor-pointer">
                  <circle cx="500" cy="255" r="16" fill="#F59E0B" fillOpacity="0.25" />
                  <circle cx="500" cy="255" r="10" fill="#251C0C" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="500" cy="255" r="3.5" fill="#F59E0B" />
                </g>
              </svg>

              {/* Floating Labels Over 3D Model (Exact from Page 02) */}
              <div className="absolute left-6 top-8 bg-[#0C1A18]/90 border border-[#162E2A] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00DF89] animate-pulse"></span>
                <div>
                  <div className="text-[10px] font-bold text-white">AI hazard detection</div>
                  <div className="text-[9px] text-slate-400 font-mono">4 sample findings</div>
                </div>
              </div>

              {/* Tag: ELECTRICAL · HIGH */}
              <div className="absolute left-24 bottom-24 bg-[#081211]/90 border border-[#162E2A] px-2 py-0.5 rounded text-[9px] font-mono font-bold text-slate-300">
                ELECTRICAL · HIGH
              </div>

              {/* Tag: FALL · CRITICAL */}
              <div className="absolute right-28 top-20 bg-red-950/80 border border-red-500/40 text-red-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                FALL · CRITICAL
              </div>

              {/* Tag: CHEMICAL · MEDIUM */}
              <div className="absolute right-8 bottom-16 bg-amber-950/80 border border-amber-500/40 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                CHEMICAL · MEDIUM
              </div>

              {/* Floating Badge: Highest Sample Risk */}
              <div className="absolute right-4 bottom-4 bg-[#0C1A18]/95 border border-red-500/40 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                <div>
                  <div className="text-[8px] font-mono uppercase text-slate-400">HIGHEST SAMPLE RISK</div>
                  <div className="text-[11px] font-mono font-bold text-red-400">Critical 20 / 25</div>
                </div>
              </div>
            </div>

            {/* Bottom Facility Status */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00DF89]"></span> On-device AI</span>
              </div>
              <span className="text-[#00DF89]">FG / 02</span>
            </div>
          </div>
        </div>
      </main>

      {/* ================= BOTTOM FOOTER (Exact from Page 02) ================= */}
      <footer className="relative z-10 px-8 lg:px-16 py-4 flex items-center justify-between border-t border-[#122421]/60 text-[10px] font-mono text-slate-500 uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00DF89]"></span>
          <span>FIELD SYSTEM STATUS: <strong className="text-[#00DF89]">READY FOR DEMO</strong></span>
        </div>
        <div>01 — HUMAN-IN-THE-LOOP BY DESIGN</div>
      </footer>
    </div>
  );
};
