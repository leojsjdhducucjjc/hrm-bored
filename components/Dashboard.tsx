
import React from 'react';
import { StaffMember, HRMStats, WorkspaceRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  staff: StaffMember[];
  stats: HRMStats;
  roles: WorkspaceRole[];
}

const Dashboard: React.FC<DashboardProps> = ({ staff, stats, roles }) => {
  const chartData = staff.map(s => ({
    name: s.username,
    points: s.totalPoints
  })).sort((a, b) => b.points - a.points).slice(0, 5);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const clockedInStaff = staff.filter(s => s.isClockedIn);
  
  const getRole = (rankIdOrName: string) => {
    return roles.find(r => r.id === rankIdOrName || r.name === rankIdOrName) || roles[roles.length - 1];
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Personnel Count', value: stats.totalStaff, color: 'text-blue-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Neural Activity', value: stats.activeNow, color: 'text-emerald-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'XP Distributed', value: stats.pointsIssuedToday, color: 'text-amber-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { label: 'Uptime (W)', value: `${stats.totalMinutesThisWeek.toLocaleString()}m`, color: 'text-cyan-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Promo Logic', value: stats.pendingPromotions, color: 'text-indigo-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-blue-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</span>
              <svg className={`w-5 h-5 ${card.color} opacity-50 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={card.icon} />
              </svg>
            </div>
            <p className="text-3xl font-black text-slate-100 italic tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8">Performance Spectrum</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Live Session Nodes</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Stream</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clockedInStaff.length > 0 ? clockedInStaff.map(s => {
                const role = getRole(s.rank);
                return (
                  <div key={s.id} className="flex items-center gap-5 bg-black/40 p-6 rounded-[1.5rem] border border-white/5 hover:border-emerald-500/20 transition-all group">
                    <div className="relative group-hover:scale-110 transition-transform">
                      <img src={s.avatarUrl} alt={s.username} className="w-14 h-14 rounded-[1.25rem] border border-white/10 shadow-2xl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-100 group-hover:text-emerald-400 transition-colors uppercase italic">{s.username}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: role.color }}>{role.name}</p>
                      <div className="flex items-center gap-2 mt-3 bg-white/5 px-2 py-1 rounded-md w-fit">
                        <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{Math.floor(Math.random() * 60) + 1}m Active</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-16 text-center text-slate-600 bg-black/20 rounded-[2rem] border-2 border-dashed border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Personnel Detected In-Game</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8">Protocol Logs</h3>
          <div className="space-y-6">
            {staff.flatMap(s => s.logs).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6).map(log => (
              <div key={log.id} className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px] ${
                  log.type === 'Warning' ? 'bg-red-500 shadow-red-500/50' : 
                  log.type === 'Shift' ? 'bg-cyan-500 shadow-cyan-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                }`} />
                <div>
                  <p className="text-slate-100 text-xs font-bold leading-relaxed">{log.description}</p>
                  <p className="text-slate-600 text-[9px] uppercase font-black mt-2 tracking-widest group-hover:text-slate-400 transition-colors">
                    {log.issuer} // {log.date}
                  </p>
                </div>
              </div>
            ))}
            {staff.length === 0 && (
              <p className="text-slate-700 text-[10px] font-black uppercase text-center py-20 tracking-widest italic">Awaiting events...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
