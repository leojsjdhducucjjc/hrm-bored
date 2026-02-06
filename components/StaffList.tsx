
import React, { useState } from 'react';
import { StaffMember, StaffStatus, WorkspaceRole } from '../types';

interface StaffListProps {
  staff: StaffMember[];
  roles: WorkspaceRole[];
  onViewDetails: (member: StaffMember) => void;
}

const StaffList: React.FC<StaffListProps> = ({ staff, roles, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = staff.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRole = (rankIdOrName: string) => {
    return roles.find(r => r.id === rankIdOrName || r.name === rankIdOrName) || roles[roles.length - 1];
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter">Personnel Directory</h2>
        <div className="relative">
          <svg className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search records..." 
            className="bg-black/40 border border-white/10 text-white rounded-2xl pl-12 pr-6 py-3 w-full md:w-80 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-[10px] font-black uppercase text-slate-600 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 tracking-[0.2em]">Personnel</th>
              <th className="px-8 py-5 tracking-[0.2em]">Deployment Rank</th>
              <th className="px-8 py-5 tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-center tracking-[0.2em]">XP / Points</th>
              <th className="px-8 py-5 text-center tracking-[0.2em]">Session Time</th>
              <th className="px-8 py-5 text-right tracking-[0.2em]">Protocols</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStaff.map((member) => {
              const role = getRole(member.rank);
              return (
                <tr key={member.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative group-hover:scale-110 transition-transform">
                        <img src={member.avatarUrl} alt={member.username} className="w-12 h-12 rounded-2xl border border-white/10 bg-black/40 shadow-xl" />
                        {member.isClockedIn && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-100 group-hover:text-blue-400 transition-colors uppercase italic">{member.username}</p>
                        <p className="text-[10px] text-slate-600 font-mono font-bold tracking-widest">#{member.robloxId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span 
                      className="px-3 py-1 text-[10px] font-black uppercase rounded-lg border border-white/5 tracking-wider shadow-inner"
                      style={{ color: role.color, backgroundColor: `${role.color}10` }}
                    >
                      {role.name}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-md tracking-tighter ${
                      member.status === StaffStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-500' : 
                      member.status === StaffStatus.ON_LEAVE ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-xs font-mono font-black text-blue-500">{member.totalPoints.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center text-xs font-mono font-black text-indigo-400">{member.totalMinutes.toLocaleString()}m</td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onViewDetails(member)}
                      className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white text-slate-400 hover:text-slate-900 px-4 py-2 rounded-xl transition-all border border-white/10"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">No compatible personnel found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
