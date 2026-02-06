
import React, { useState } from 'react';

interface WelcomeSetupProps {
  onLink: (groupId: string) => Promise<void>;
  loading: boolean;
}

const WelcomeSetup: React.FC<WelcomeSetupProps> = ({ onLink, loading }) => {
  const [groupId, setGroupId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId) onLink(groupId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Marketing/Value Prop */}
        <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Version 4.0 // Deployment Ready</span>
            </div>
            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              INITIATE YOUR <br />
              <span className="text-blue-500">WORKSPACE.</span>
            </h1>
            <p className="text-slate-400 text-lg mt-6 max-w-lg font-medium leading-relaxed">
              Experience the world's most advanced HRM for Roblox. Nexus leverages Gemini AI to automate personnel management, providing strategic clarity to your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Neural Sync",
                desc: "Real-time rank synchronization with the Roblox cloud.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z"
              },
              {
                title: "Gemini Audits",
                desc: "AI-driven performance reports and promotion logic.",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707"
              },
              {
                title: "Data Integrity",
                desc: "Quantum-level logging of every shift and warning.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944"
              },
              {
                title: "Global Search",
                desc: "Instant lookup of any member across your entire history.",
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              }
            ].map((feat, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feat.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{feat.title}</h4>
                  <p className="text-slate-500 text-[10px] mt-1 font-medium leading-tight">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Setup Form */}
        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="mb-10 text-center">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Workspace Configuration</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Connect to the Roblox Grid</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Target Group ID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. 1234567"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-6 text-white text-xl font-mono focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs font-bold uppercase pointer-events-none">
                      Roblox ID
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <p className="text-xs text-blue-400/80 leading-relaxed font-medium">
                    <span className="font-black text-blue-400">PRO TIP:</span> You can find your Group ID in the URL of your group's Roblox page.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !groupId}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Synthesizing Node...
                    </>
                  ) : (
                    <>
                      Deploy Workspace
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
                <div className="h-px flex-1 bg-white/20"></div>
                <div className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Nexus OS</div>
                <div className="h-px flex-1 bg-white/20"></div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[100px] bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[100px] h-[100px] bg-indigo-500/10 blur-3xl rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeSetup;
