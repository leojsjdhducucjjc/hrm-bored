
import React, { useState } from 'react';
import { GroupConfig, StaffRank } from '../types';

interface IntegrationPanelProps {
  config: GroupConfig;
  onLink: (id: string) => Promise<void>;
  onUpdateConfig: (newConfig: GroupConfig) => void;
  onSync: () => Promise<void>;
}

const IntegrationPanel: React.FC<IntegrationPanelProps> = ({ config, onLink, onUpdateConfig, onSync }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [tempGroupId, setTempGroupId] = useState(config.groupId);

  const handleLink = async () => {
    if (!tempGroupId) return;
    setIsLinking(true);
    await onLink(tempGroupId);
    setIsLinking(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSync();
    setIsSyncing(false);
  };

  const updateRankMapping = (index: number, newInternalRank: StaffRank) => {
    const newMappings = [...config.rankMappings];
    newMappings[index] = { ...newMappings[index], internalRank: newInternalRank };
    onUpdateConfig({ ...config, rankMappings: newMappings });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Card */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg transition-colors ${config.isConnected ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
              <svg className={`w-6 h-6 transition-colors ${config.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-none">Group API</h3>
              <p className={`text-xs mt-1 font-medium ${config.isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {config.isConnected ? 'Connected & Active' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Target Group ID</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempGroupId}
                  onChange={(e) => setTempGroupId(e.target.value)}
                  placeholder="Roblox Group ID..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button 
                  onClick={handleLink}
                  disabled={isLinking}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/40"
                >
                  {isLinking ? '...' : 'Link'}
                </button>
              </div>
            </div>

            {config.isConnected && (
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 animate-in slide-in-from-top-1">
                <p className="text-xs text-slate-400 mb-1">Group Name</p>
                <p className="text-sm font-bold text-white truncate">{config.groupName}</p>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    {isSyncing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Force Rank Sync
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rank Mapping Card */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Adaptive Rank Mapping</h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-black uppercase">Auto-Discovered</span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black text-slate-500 uppercase border-b border-slate-700">
              <div className="col-span-2 text-center">ID</div>
              <div className="col-span-5">Roblox Rank</div>
              <div className="col-span-5">Internal Management</div>
            </div>
            
            <div className="divide-y divide-slate-700 overflow-y-auto pr-2 custom-scrollbar">
              {config.rankMappings.length > 0 ? config.rankMappings.map((mapping, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-700/20 transition-colors">
                  <div className="col-span-2 text-center text-xs font-mono text-slate-400 font-bold">{mapping.robloxRankId}</div>
                  <div className="col-span-5 text-sm font-semibold text-slate-200">{mapping.label}</div>
                  <div className="col-span-5">
                    <select 
                      value={mapping.internalRank}
                      onChange={(e) => updateRankMapping(idx, e.target.value as StaffRank)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {Object.values(StaffRank).map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-slate-500 text-sm italic">Link a group ID to fetch its rank structure.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 p-6 rounded-2xl flex items-center gap-6">
        <div className="p-4 bg-blue-600/20 rounded-2xl">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div className="max-w-xl">
          <h4 className="text-white font-bold text-lg mb-1">AI-Assisted Discovery</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nexus HRM uses advanced modeling to instantly adapt to your group's specific rank hierarchy. Just provide the ID, and we'll automatically map your "Store Managers" to internal Manager logic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPanel;
