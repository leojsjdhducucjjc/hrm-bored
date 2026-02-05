
import React, { useState } from 'react';
import { StaffMember, StaffStatus } from '../types';
import { geminiService } from '../services/geminiService';

interface StaffDetailModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onUpdateStaff?: (updated: StaffMember) => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ staff, onClose, onUpdateStaff }) => {
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
          description: `Manual addition of ${manualAmount} points`,
          issuer: 'Admin'
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
          issuer: 'Admin'
        },
        ...updated.logs
      ];
    }
    onUpdateStaff(updated);
    setManualAmount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={staff.avatarUrl} alt={staff.username} className="w-16 h-16 rounded-full border-2 border-blue-500" />
              {staff.isClockedIn && (
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-[8px] font-black text-white rounded-full uppercase border-2 border-slate-900 animate-pulse">Live</div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{staff.username}</h2>
              <p className="text-slate-400 font-medium">{staff.rank}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Total Points</p>
                <p className="text-2xl font-black text-blue-500">{staff.totalPoints.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Tracked Minutes</p>
                <p className="text-2xl font-black text-cyan-400">{staff.totalMinutes.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Shifts Done</p>
                <p className="text-2xl font-black text-emerald-500">{staff.shiftsCompleted}</p>
              </div>
            </div>

            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4">Manual Entry Tool</h3>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  value={manualAmount || ''}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  placeholder="Amount..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button 
                  onClick={() => addMetric('points')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Add Points
                </button>
                <button 
                  onClick={() => addMetric('minutes')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Add Minutes
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity History
              </h3>
              <div className="space-y-3">
                {staff.logs.length > 0 ? staff.logs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                        log.type === 'Warning' ? 'bg-red-500/20 text-red-500' : 
                        log.type === 'Shift' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{log.date}</span>
                    </div>
                    <p className="text-slate-200 text-sm font-medium">{log.description}</p>
                    <p className="text-[10px] text-slate-500 mt-2 uppercase font-black">Admin: {log.issuer}</p>
                  </div>
                )) : (
                  <p className="text-slate-500 text-center py-12 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">No activity logged yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 h-fit">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Gemini Audit
                </h3>
                {!aiAnalysis && (
                  <button 
                    onClick={runAnalysis}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                  >
                    {loading ? 'Analyzing...' : 'Execute Audit'}
                  </button>
                )}
              </div>

              {aiAnalysis ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Potential</p>
                      <p className="text-2xl font-black text-blue-400">{aiAnalysis.potentialRating}/10</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Sentiment</p>
                      <p className={`text-sm font-bold uppercase ${aiAnalysis.sentiment === 'Positive' ? 'text-green-400' : 'text-amber-400'}`}>
                        {aiAnalysis.sentiment}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Executive Summary</h4>
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                      {aiAnalysis.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Strategic Advice</h4>
                    <p className="text-blue-200 text-xs leading-relaxed bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl italic">
                      {aiAnalysis.recommendation}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setAiAnalysis(null)}
                    className="w-full text-center text-[10px] uppercase font-black text-slate-500 hover:text-slate-300 transition-colors pt-2"
                  >
                    Refresh Intelligence
                  </button>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase max-w-[150px] leading-relaxed">Intelligence engine offline. Run audit to begin trajectory mapping.</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-800 p-6 rounded-2xl border border-indigo-500/20">
              <h3 className="text-white font-bold text-sm mb-3">Staff Context</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Joined Platform</span>
                  <span className="text-slate-200 font-mono">{staff.joinedDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Roblox Profile</span>
                  <a href={`https://www.roblox.com/users/${staff.robloxId}/profile`} target="_blank" className="text-blue-400 hover:underline">View Roblox</a>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Internal Level</span>
                  <span className="text-indigo-400 font-black">LEVEL {Math.floor(staff.totalPoints / 100) + 1}</span>
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
