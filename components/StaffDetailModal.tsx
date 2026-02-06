
import React, { useState } from 'react';
import { StaffMember, StaffStatus, WorkspaceRole } from '../types';
import { geminiService } from '../services/geminiService';

interface StaffDetailModalProps {
  staff: StaffMember | null;
  roles: WorkspaceRole[];
  onClose: () => void;
  onUpdateStaff?: (updated: StaffMember) => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ staff, roles, onClose, onUpdateStaff }) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualAmount, setManualAmount] = useState<number>(0);

  if (!staff) return null;

  const runAnalysis = async () => {
    setLoading(true);
    const result = await geminiService.analyzeStaffPerformance(staff);
    setAiAnalysis(result);
    setLoading(false);
  };

  const getRole = (rankIdOrName: string) => {
    return roles.find(r => r.id === rankIdOrName || r.name === rankIdOrName) || roles[roles.length - 1];
  };

  const role = getRole(staff.rank);

  const addMetric = (type: 'points' | 'minutes') => {
    if (!onUpdateStaff || manualAmount <= 0) return;
    
    const updated = { ...staff };
    if (type === 'points') {
      updated.totalPoints += manualAmount;
      updated.logs = [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Point',
          description: `Manual addition of ${manualAmount} XP units`,
          issuer: 'Nexus Admin'
        },
        ...updated.logs
      ];
    } else {
      updated.totalMinutes += manualAmount;
      updated.logs = [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Shift',
          description: `Manual addition of ${manualAmount} minutes`,
          issuer: 'Nexus Admin'
        },
        ...updated.logs
      ];
    }
    onUpdateStaff(updated);
    setManualAmount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/5 w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-[3rem] shadow-2xl custom-scrollbar">
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={staff.avatarUrl} alt={staff.username} className="w-20 h-20 rounded-[1.75rem] border-4 border-white/5 shadow-2xl bg-black" />
              {staff.isClockedIn && (
                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-emerald-500 text-[9px] font-black text-white rounded-lg uppercase border-4 border-slate-900 animate-pulse shadow-lg">Linked</div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-100 uppercase italic tracking-tighter">{staff.username}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: role.color }}>{role.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">ID: {staff.robloxId}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 text-slate-500 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all border border-white/5 group">
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Cumulative XP', value: staff.totalPoints.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-500/5' },
                { label: 'Service Time', value: `${staff.totalMinutes.toLocaleString()}m`, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                { label: 'Instances', value: staff.shiftsCompleted, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
              ].map((m, i) => (
                <div key={i} className={`p-8 rounded-[2rem] border border-white/5 ${m.bg}`}>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em]">{m.label}</p>
                  <p className={`text-4xl font-black italic tracking-tighter ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/20 p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] mb-6 italic">Personnel Modification Terminal</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="number" 
                  value={manualAmount || ''}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  placeholder="Metric Value..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-mono focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={() => addMetric('points')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                >
                  Apply XP
                </button>
                <button 
                  onClick={() => addMetric('minutes')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
                >
                  Apply Time
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black italic uppercase text-slate-100 mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chronological Logs
              </h3>
              <div className="space-y-4">
                {staff.logs.length > 0 ? staff.logs.map(log => (
                  <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-md tracking-wider ${
                        log.type === 'Warning' ? 'bg-red-500/10 text-red-500' : 
                        log.type === 'Shift' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {log.type} Protocol
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono font-bold uppercase">{log.date}</span>
                    </div>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed italic">"{log.description}"</p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Authored by: {log.issuer}</span>
                      <svg className="w-4 h-4 text-slate-800" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-black/20 rounded-[2.5rem] border-2 border-dashed border-white/5">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Personnel record is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8 h-fit">
            <div className="bg-gradient-to-br from-blue-600/10 via-slate-900 to-indigo-900/10 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    Gemini Audit
                  </h3>
                  {!aiAnalysis && (
                    <button 
                      onClick={runAnalysis}
                      disabled={loading}
                      className="bg-white text-slate-950 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-black/40 disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : 'Execute'}
                    </button>
                  )}
                </div>

                {aiAnalysis ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-5 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Efficiency</p>
                        <p className="text-3xl font-black text-blue-400 italic">{aiAnalysis.potentialRating}<span className="text-xs text-slate-600">/10</span></p>
                      </div>
                      <div className="text-center p-5 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Affinity</p>
                        <p className={`text-xs font-black uppercase tracking-widest mt-2 ${aiAnalysis.sentiment === 'Positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {aiAnalysis.sentiment}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Synthesis Summary</h4>
                        <p className="text-slate-300 text-xs leading-relaxed bg-black/20 p-5 rounded-2xl border border-white/5 italic">
                          {aiAnalysis.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Strategic Advice</h4>
                        <p className="text-blue-200 text-xs leading-relaxed bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl font-medium">
                          {aiAnalysis.recommendation}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setAiAnalysis(null)}
                      className="w-full text-center text-[10px] uppercase font-black text-slate-600 hover:text-white transition-all pt-4"
                    >
                      Re-Evaluate Neural Data
                    </button>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-black/40 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                      <svg className="w-8 h-8 text-slate-800 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase max-w-[180px] leading-relaxed tracking-widest italic">Intelligence engine awaiting signal. Deploy audit to begin mapping.</p>
                  </div>
                )}
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
              <h3 className="text-white font-black uppercase text-xs italic tracking-tighter border-b border-white/5 pb-4">Personnel Metadata</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Enlisted</span>
                  <span className="text-xs text-slate-200 font-mono font-bold">{staff.joinedDate}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Profile Path</span>
                  <a href={`https://www.roblox.com/users/${staff.robloxId}/profile`} target="_blank" className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-2 text-[10px] uppercase group">
                    View Cloud
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Neural Level</span>
                  <span className="text-indigo-400 font-black italic text-sm tracking-tighter">LVL {Math.floor(staff.totalPoints / 100) + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;
