
import React from 'react';
import { StaffMember, HRMStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  staff: StaffMember[];
  stats: HRMStats;
}

const Dashboard: React.FC<DashboardProps> = ({ staff, stats }) => {
  const chartData = staff.map(s => ({
    name: s.username,
    points: s.totalPoints
  })).sort((a, b) => b.points - a.points).slice(0, 5);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const clockedInStaff = staff.filter(s => s.isClockedIn);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Staff', value: stats.totalStaff, color: 'text-blue-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Clocked In', value: stats.activeNow, color: 'text-emerald-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Points Issued', value: stats.pointsIssuedToday, color: 'text-amber-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { label: 'Minutes (Week)', value: stats.totalMinutesThisWeek.toLocaleString(), color: 'text-cyan-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending Promo', value: stats.pendingPromotions, color: 'text-indigo-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">{card.label}</span>
              <svg className={`w-6 h-6 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-slate-100">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Point Earners</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100">Live Shifts (In-Game)</h3>
              <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Live Feed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clockedInStaff.length > 0 ? clockedInStaff.map(s => (
                <div key={s.id} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                  <div className="relative">
                    <img src={s.avatarUrl} alt={s.username} className="w-12 h-12 rounded-full border border-slate-700" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{s.username}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.rank}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-slate-400 font-mono">Session: {Math.floor(Math.random() * 60) + 1}m</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                  No staff members are currently in-game.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {staff.flatMap(s => s.logs).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start space-x-3 text-sm p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  log.type === 'Warning' ? 'bg-red-500' : 
                  log.type === 'Shift' ? 'bg-cyan-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="text-slate-100 font-medium leading-tight">{log.description}</p>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-1 tracking-tighter">Issued by {log.issuer} • {log.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
