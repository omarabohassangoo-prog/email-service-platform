import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AnalyticsStats } from '../../types';

interface ActivityChartProps {
  stats: AnalyticsStats | null;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ stats }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
  
  // Fake weekly data if period is weekly, otherwise use hourly from stats
  const chartData = period === 'daily' 
    ? stats?.hourly_timeline || []
    : [
        { time: 'الأحد', sent: 12000, delivered: 11500, failed: 200 },
        { time: 'الإثنين', sent: 15000, delivered: 14800, failed: 150 },
        { time: 'الثلاثاء', sent: 18000, delivered: 17500, failed: 300 },
        { time: 'الأربعاء', sent: 20000, delivered: 19800, failed: 100 },
        { time: 'الخميس', sent: 22000, delivered: 21500, failed: 250 },
        { time: 'الجمعة', sent: 14000, delivered: 13500, failed: 400 },
        { time: 'السبت', sent: 10000, delivered: 9800, failed: 100 },
      ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">النشاط والإرسال</h3>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setPeriod('daily')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${period === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            يومي
          </button>
          <button 
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${period === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            أسبوعي
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area type="monotone" dataKey="sent" name="تم الإرسال" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
