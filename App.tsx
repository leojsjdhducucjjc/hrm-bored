
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StaffList from './components/StaffList';
import StaffDetailModal from './components/StaffDetailModal';
import IntegrationPanel from './components/IntegrationPanel';
import Loader from './components/Loader';
import Login from './components/Login';
import { StaffMember, HRMStats, GroupConfig, StaffRank, StaffStatus, AuthUser } from './types';
import { geminiService } from './services/geminiService';
import { dbService } from './services/databaseService';

const INITIAL_GROUP_CONFIG: GroupConfig = {
  groupId: '',
  groupName: '',
  isConnected: false,
  rankMappings: []
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [globalInsights, setGlobalInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [groupConfig, setGroupConfig] = useState<GroupConfig>(INITIAL_GROUP_CONFIG);

  // Persistence: Check Session
  useEffect(() => {
    const checkSession = async () => {
      const user = await dbService.getSession();
      setCurrentUser(user);
      
      const savedStaff = await dbService.loadStaff();
      if (savedStaff.length > 0) {
        setStaff(savedStaff);
        // If staff exists, we assume a group was previously linked
        // In a real app, you'd save groupConfig to DB too
      }
      
      setIsAuthLoading(false);
    };
    checkSession();
  }, []);

  // Persistence: Auto-save staff changes
  useEffect(() => {
    if (staff.length > 0) {
      dbService.saveStaff(staff);
    }
  }, [staff]);

  const stats: HRMStats = {
    totalStaff: staff.length,
    activeNow: staff.filter(s => s.isClockedIn).length,
    pointsIssuedToday: staff.length > 0 ? 145 : 0,
    totalMinutesThisWeek: staff.length > 0 ? staff.reduce((acc, curr) => acc + curr.totalMinutes, 0) / 4 : 0,
    pendingPromotions: staff.filter(s => s.totalPoints > 1000).length
  };

  const handleLinkGroup = async (groupId: string) => {
    if (!groupId) return;
    setIsGlobalLoading(true);
    try {
      const result = await geminiService.fetchGroupMetadata(groupId);
      if (result) {
        setGroupConfig({
          groupId,
          groupName: result.groupName,
          isConnected: true,
          rankMappings: result.mappings
        });
        await handleSyncMembers(groupId, result.mappings);
      }
    } catch (error) {
      console.error("Link Group Error:", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleSyncMembers = async (groupId?: string, mappings?: any[]) => {
    const targetId = groupId || groupConfig.groupId;
    const targetMappings = mappings || groupConfig.rankMappings;
    
    if (!targetId || targetMappings.length === 0) return;

    setIsGlobalLoading(true);
    try {
      const realMembers = await geminiService.fetchMembers(targetId, targetMappings);
      
      setStaff(prev => {
        const existingIds = new Set(prev.map(s => s.robloxId));
        const filteredNew = realMembers.filter(m => !existingIds.has(m.robloxId)).map(m => ({
          ...m,
          totalMinutes: Math.floor(Math.random() * 500), 
          isClockedIn: Math.random() > 0.8 
        }));
        return [...prev, ...filteredNew];
      });
    } catch (error) {
      console.error("Sync Members Error:", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleUpdateStaff = (updated: StaffMember) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedStaff(updated);
  };

  const handleLogout = async () => {
    await dbService.logout();
    setCurrentUser(null);
  };

  const fetchGlobalInsights = async () => {
    if (staff.length === 0) return;
    setLoadingInsights(true);
    const insights = await geminiService.getGlobalStaffInsights(staff);
    setGlobalInsights(insights);
    setLoadingInsights(false);
  };

  if (isAuthLoading) return <Loader message="Validating Credentials..." />;

  if (!currentUser) return <Login onLoginSuccess={setCurrentUser} />;

  return (
    <div className="flex min-h-screen animate-in fade-in duration-1000">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={currentUser} 
        onLogout={handleLogout}
      />
      
      {isGlobalLoading && <Loader message="Synchronizing with Roblox API..." />}

      <main className="flex-1 p-8 overflow-y-auto bg-slate-950">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic">{currentTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-xs">
              {currentTab === 'dashboard' && 'Live Performance Synthesis'}
              {currentTab === 'staff' && 'Personnel Logistics & Records'}
              {currentTab === 'ai' && 'Strategic Predictive Intelligence'}
              {currentTab === 'integration' && 'Roblox Edge API Configuration'}
              {currentTab === 'settings' && 'Instance Parameters'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-right text-right">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Database Node</span>
               <span className="text-xs font-mono font-bold text-indigo-400">neon-us-east-2</span>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-3.5 rounded-[1.25rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${groupConfig.isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${groupConfig.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em]">
                  {groupConfig.isConnected ? 'Stream Active' : 'Offline Mode'}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <span className="text-xs font-mono font-bold text-blue-500">GID:{groupConfig.groupId || '---'}</span>
            </div>
          </div>
        </header>

        {currentTab === 'dashboard' && <Dashboard staff={staff} stats={stats} />}
        {currentTab === 'staff' && (
          <StaffList 
            staff={staff} 
            onViewDetails={(member) => setSelectedStaff(member)} 
          />
        )}
        
        {currentTab === 'integration' && (
          <IntegrationPanel 
            config={groupConfig} 
            onLink={handleLinkGroup}
            onUpdateConfig={setGroupConfig} 
            onSync={() => handleSyncMembers()}
          />
        )}

        {currentTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 border border-white/10 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                         <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.607a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.121 9.193a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm9.193-2.121a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-9.193-9.193a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM13 11a3 3 0 11-6 0 3 3 0 016 0zm3-7a1 1 0 100 2h1a1 1 0 100-2h-1z" /></svg>
                      </div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Strategic Intelligence</h3>
                    </div>
                    <p className="text-indigo-100 max-w-2xl mb-10 opacity-80 leading-relaxed font-medium text-lg">Nexus employs the Gemini engine to audit your entire personnel matrix, detecting behavioral anomalies and automated career path mapping.</p>
                    <button 
                        onClick={fetchGlobalInsights}
                        disabled={loadingInsights || staff.length === 0}
                        className="bg-white text-indigo-950 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-black/40 active:scale-95 disabled:opacity-50"
                    >
                        {loadingInsights ? 'Synthesizing Workforce Data...' : 'Execute Full Instance Audit'}
                    </button>
                    {staff.length === 0 && (
                      <p className="text-white/40 text-[10px] mt-6 font-black uppercase italic tracking-[0.2em]">Connect a group to enable intelligence analytics.</p>
                    )}
                </div>
                {/* Background Flare */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-400 blur-[140px] rounded-full opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" />
            </div>

            {globalInsights && (
                <div className="bg-slate-900 p-12 rounded-[3rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="p-5 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-white leading-none tracking-tight uppercase italic">Intelligence Report</h4>
                          <p className="text-slate-600 text-[10px] mt-1 font-black uppercase tracking-[0.3em]">Quantum analysis complete</p>
                        </div>
                    </div>
                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/20 p-10 rounded-[2rem] border border-white/5 shadow-inner italic font-medium">
                        {globalInsights}
                    </div>
                </div>
            )}
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 max-w-2xl shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-10 border-b border-white/5 pb-6 uppercase tracking-tighter italic">Instance Parameters</h3>
            <div className="space-y-10">
                <div className="group">
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-3 group-hover:text-blue-400 transition-colors tracking-widest">Platform Label</label>
                    <input type="text" defaultValue="Nexus HRM Enterprise" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Visual DNA</label>
                    <div className="grid grid-cols-2 gap-6">
                      <button className="p-6 bg-blue-600/10 border-2 border-blue-500 rounded-[2rem] text-left shadow-xl shadow-blue-900/20">
                        <p className="font-black text-white uppercase tracking-tighter italic">Deep Indigo</p>
                        <p className="text-[10px] text-blue-400 font-black uppercase mt-2">Active Schema</p>
                      </button>
                      <button className="p-6 bg-white/5 border-2 border-transparent rounded-[2rem] text-left hover:border-white/10 transition-all opacity-40 group">
                        <p className="font-black text-slate-400 uppercase tracking-tighter italic group-hover:text-slate-200">Monochrome</p>
                        <p className="text-[10px] text-slate-600 font-black uppercase mt-2">Legacy Schema</p>
                      </button>
                    </div>
                </div>
                <div className="pt-6">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98]">Deploy Global Update</button>
                </div>
            </div>
          </div>
        )}
      </main>

      <StaffDetailModal 
        staff={selectedStaff} 
        onClose={() => setSelectedStaff(null)} 
        onUpdateStaff={handleUpdateStaff}
      />
    </div>
  );
};

export default App;
