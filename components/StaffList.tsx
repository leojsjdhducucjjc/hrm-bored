
import React, { useState } from 'react';
import { StaffMember, StaffStatus } from '../types';

interface StaffListProps {
  staff: StaffMember[];
  onViewDetails: (member: StaffMember) => void;
}

const StaffList: React.FC<StaffListProps> = ({ staff, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = staff.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-100">Staff Directory</h2>
        <div className="relative">
          <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search staff..." 
            className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-xs font-bold uppercase text-slate-500 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Points</th>
              <th className="px-6 py-4 text-center">Minutes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredStaff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={member.avatarUrl} alt={member.username} className="w-10 h-10 rounded-full border border-slate-600" />
                      {member.isClockedIn && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">{member.username}</p>
                      <p className="text-xs text-slate-500">ID: {member.robloxId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-medium">{member.rank}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                    member.status === StaffStatus.ACTIVE ? 'bg-emerald-500/20 text-emerald-400' : 
                    member.status === StaffStatus.ON_LEAVE ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm font-mono text-blue-400">{member.totalPoints}</td>
                <td className="px-6 py-4 text-center text-sm font-mono text-cyan-400">{member.totalMinutes.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onViewDetails(member)}
                    className="text-xs font-bold bg-slate-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No staff members match your search criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
