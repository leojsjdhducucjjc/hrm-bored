
import React, { useState } from 'react';
import { GroupConfig, WorkspaceRole } from '../types';

interface IntegrationPanelProps {
  config: GroupConfig;
  onLink: (id: string) => Promise<void>;
  onUpdateConfig: (newConfig: GroupConfig) => void;
  onSync: () => Promise<void>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];

const IntegrationPanel: React.FC<IntegrationPanelProps> = ({ config, onLink, onUpdateConfig, onSync }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [tempGroupId, setTempGroupId] = useState(config.groupId);
  
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

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

  const updateRankMapping = (index: number, newInternalRankId: string) => {
    const newMappings = [...config.rankMappings];
    newMappings[index] = { ...newMappings[index], internalRank: newInternalRankId };
    onUpdateConfig({ ...config, rankMappings: newMappings });
  };

  const addRole = () => {
    if (!newRoleName) return;
    const newRole: WorkspaceRole = {
      id: 'r-' + Math.random().toString(36).substr(2, 9),
      name: newRoleName,
      color: selectedColor
    };
    onUpdateConfig({
      ...config,
      customRanks: [...config.customRanks, newRole]
    });
    setNewRoleName('');
  };

  const deleteRole = (id: string) => {
    onUpdateConfig({
      ...config,
      customRanks: config.customRanks.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-2xl transition-all ${config.isConnected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800 border border-slate-700'}`}>
              <svg className={`w-6 h-6 ${config.isConnected ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-white uppercase italic tracking-tighter text-lg">Group Stream</h3>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.isConnected ? 'text-emerald-500' : 'text-slate-600'}`}>
                {config.isConnected ? 'Neural Link Active' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Target Group ID</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={tempGroupId}
                  onChange={(e) => setTempGroupId(e.target.value)}
                  placeholder="ID..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                />
                <button 
                  onClick={handleLink}
                  disabled={isLinking}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-blue-900/40"
                >
                  {isLinking ? '...' : 'Connect'}
                </button>
              </div>
            </div>

            {config.isConnected && (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-top-4 duration-500">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Detected Alias</p>
                <p className="text-sm font-bold text-white truncate mb-4">{config.groupName}</p>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border border-white/5"
                >
                  {isSyncing ? 'Synchronizing...' : 'Resync Members'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Role Architect */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Role Architect</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-black uppercase border border-blue-500/20">Custom Logic</span>
          </div>

          <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
             <div className="space-y-4 pr-2 overflow-y-auto max-h-48 custom-scrollbar">
                {config.customRanks.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                      <span className="text-xs font-black text-slate-200 uppercase tracking-widest">{role.name}</span>
                    </div>
                    <button onClick={() => deleteRole(role.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
             </div>

             <div className="pt-6 border-t border-white/5 space-y-4">
                <input 
                  type="text" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="New Role Name..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    {COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white scale-125' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button onClick={addRole} className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/40">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Rank Mapping Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Rank Mapping</h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-black uppercase border border-indigo-500/20">Bridge</span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="divide-y divide-white/5 overflow-y-auto pr-2 custom-scrollbar">
              {config.rankMappings.length > 0 ? config.rankMappings.map((mapping, idx) => (
                <div key={idx} className="flex flex-col gap-2 py-4 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID {mapping.robloxRankId}</span>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{mapping.label}</span>
                  </div>
                  <select 
                    value={mapping.internalRank}
                    onChange={(e) => updateRankMapping(idx, e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-xs rounded-xl px-4 py-2.5 text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-black/60 transition-all font-bold uppercase tracking-wider"
                  >
                    {config.customRanks.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">Awaiting Sync Connection</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600/10 via-indigo-900/10 to-transparent border border-white/5 p-10 rounded-[3rem] shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="p-6 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/20 shadow-inner">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 11-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div className="max-w-2xl text-center md:text-left">
            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Hierarchical Synthesis</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Nexus doesn't just display your Roblox data—it adapts to your internal business logic. Create roles that represent your organizational reality and bridge them to the Roblox API with the mapping tool. This ensures your AI reports and dashboard metrics reflect your unique structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPanel;
