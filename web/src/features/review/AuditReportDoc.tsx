import React from 'react';

export interface AuditReportData {
  reportId: string;
  facility: string;
  location: string;
  timestamp: string;
  inspectorName: string;
  inspectorId: string;
  observation: string;
  category: string;
  inferenceMode: string;
  inferenceLatency: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: string;
  actions: Array<{
    title: string;
    description: string;
    priority: string;
    assignee: string;
    deadline: string;
  }>;
  signOffBy: string;
  signOffDate: string;
}

export const SAMPLE_AUDIT_REPORT: AuditReportData = {
  reportId: 'INS-2048',
  facility: 'Plant 2, Industrial Zone',
  location: 'Level 3, North Platform (near eastern catwalk)',
  timestamp: new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  inspectorName: 'Alex Morgan, Lead Safety Engineer',
  inspectorId: 'CERT-HSE-9042',
  observation:
    'Unsecured platform edge observed on Level 3 near the eastern stairwell. Missing compliant guardrails and warning barriers while personnel are actively transporting heavy materials across the corridor.',
  category: 'Fall Hazard',
  inferenceMode: 'Hybrid Edge (Gemini Nano on Chrome WebGPU) + Cloud Validated',
  inferenceLatency: '142 ms',
  likelihood: 4,
  severity: 5,
  riskScore: 20,
  riskLevel: 'CRITICAL',
  actions: [
    {
      title: 'Install OSHA 1926.502 compliant guardrails',
      description: 'Fit certified top-rails and mid-rails along the 14-meter exposed platform boundary.',
      priority: 'IMMEDIATE',
      assignee: 'Structural Maintenance Team (Lead: J. Vance)',
      deadline: 'Within 24 Hours',
    },
    {
      title: 'Restrict worker foot-traffic in perimeter',
      description: 'Deploy physical lock-out tape and audible warning signage at stairwell access point.',
      priority: 'IMMEDIATE',
      assignee: 'Floor Shift Supervisor',
      deadline: 'Immediate (Active)',
    },
    {
      title: 'Comprehensive level 3 perimeter safety sweep',
      description: 'Conduct structural anchor-point assessment across all adjacent high-elevation assembly lines.',
      priority: 'SHORT_TERM',
      assignee: 'HSE Audit Committee',
      deadline: '7 Days',
    },
  ],
  signOffBy: 'Certified Lead Inspector Alex Morgan (PE #48201)',
  signOffDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

export const AuditReportPrintDoc: React.FC<{
  data?: AuditReportData;
  onClose: () => void;
  onPrint: () => void;
}> = ({ data = SAMPLE_AUDIT_REPORT, onClose, onPrint }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0C1A18] border border-[#162E2A] rounded-2xl max-w-4xl w-full p-6 sm:p-10 text-slate-200 shadow-2xl relative my-8">
        {/* Top Control Bar (Hidden during Print) */}
        <div className="no-print flex items-center justify-between pb-6 border-b border-[#162E2A] mb-8">
          <div>
            <div className="text-[10px] font-mono text-[#00DF89] font-bold uppercase tracking-widest">
              OFFICIAL OSHA / HSE REGULATORY COMPLIANCE EXPORT
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Safety Audit Inspection Certificate · {data.reportId}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#081211] border border-[#162E2A] text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="px-5 py-2 rounded-xl bg-[#00DF89] hover:bg-[#00C476] text-[#071311] font-bold text-xs cursor-pointer shadow-md transition flex items-center gap-2"
            >
              <span>🖨️ Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY (Exact 5 Required Sections) */}
        <div id="printable-audit-doc" className="space-y-7 bg-[#070E0D] border border-[#162E2A] p-8 sm:p-10 rounded-xl text-slate-200 font-sans">
          {/* 1. Header & Audit Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#00DF89]/40 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00DF89]">
                <span>🛡️ FIELDGUARD AI SAFETY AUDIT REPORT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {data.reportId}
              </h1>
              <div className="text-xs text-slate-400 mt-1">
                Facility: <strong className="text-white">{data.facility}</strong> · {data.location}
              </div>
            </div>
            <div className="sm:text-right font-mono text-xs space-y-1">
              <div className="text-slate-400">Date/Time: <span className="text-white">{data.timestamp}</span></div>
              <div className="text-slate-400">Inspector: <span className="text-white">{data.inspectorName}</span></div>
              <div className="text-[11px] text-[#00DF89] font-bold">ID: {data.inspectorId}</div>
            </div>
          </div>

          {/* 2. Hazard Observation & Classification */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-[#00DF89] uppercase tracking-wider">
              1. HAZARD OBSERVATION &amp; CLASSIFICATION
            </div>
            <div className="p-4 rounded-xl bg-[#0C1A18] border border-[#162E2A] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  Category: <strong className="text-white px-2 py-0.5 rounded bg-[#162E2A]">{data.category}</strong>
                </span>
                <span className="text-[11px] font-mono text-[#00DF89] bg-[#00DF89]/10 px-2 py-0.5 rounded border border-[#00DF89]/30">
                  {data.inferenceMode} ({data.inferenceLatency})
                </span>
              </div>
              <div className="text-xs italic text-slate-300 leading-relaxed pt-1">
                &ldquo;{data.observation}&rdquo;
              </div>
            </div>
          </div>

          {/* 3. Risk Matrix Assessment */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-[#00DF89] uppercase tracking-wider">
              2. RISK MATRIX ASSESSMENT (ISO 45001 / OSHA)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0C1A18] border border-[#162E2A] text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Likelihood</div>
                <div className="text-2xl font-black text-white mt-1">{data.likelihood} / 5</div>
                <div className="text-[10px] text-slate-500 mt-0.5">High Frequency Exposure</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0C1A18] border border-[#162E2A] text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Severity</div>
                <div className="text-2xl font-black text-white mt-1">{data.severity} / 5</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Critical Fall Hazard</div>
              </div>
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-center">
                <div className="text-[10px] font-mono uppercase text-red-300">Composite Risk Score</div>
                <div className="text-2xl font-black text-red-400 mt-1">{data.riskScore} / 25</div>
                <div className="text-[10px] font-mono font-bold text-red-300 uppercase mt-0.5">● {data.riskLevel} RISK</div>
              </div>
            </div>
          </div>

          {/* 4. Suggested & Approved Corrective Actions */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-[#00DF89] uppercase tracking-wider">
              3. APPROVED CORRECTIVE ACTIONS &amp; REMEDIATION PLAN
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#162E2A] rounded-xl overflow-hidden">
                <thead className="bg-[#0C1A18] text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Remediation Action</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    <th className="py-2.5 px-3 text-right">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162E2A]">
                  {data.actions.map((act, idx) => (
                    <tr key={idx} className="bg-[#070E0D]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{act.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{act.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {act.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{act.assignee}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">{act.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Human Sign-Off & Certification */}
          <div className="space-y-3 border-t border-[#162E2A] pt-5">
            <div className="text-xs font-mono font-bold text-[#00DF89] uppercase tracking-wider">
              4. HUMAN SIGN-OFF &amp; REGULATORY CERTIFICATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0C1A18] border border-[#162E2A] items-center">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Certified Sign-Off By:</div>
                <div className="text-sm font-bold text-white">{data.signOffBy}</div>
                <div className="text-[10px] font-mono text-emerald-400">
                  ✔ Human-In-The-Loop Verification Enforced
                </div>
              </div>
              <div className="sm:text-right space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Certified Date:</div>
                <div className="text-xs font-mono text-white">{data.signOffDate}</div>
                <div className="text-[10px] font-mono text-slate-500">Official FieldGuard AI Compliance Stamp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
