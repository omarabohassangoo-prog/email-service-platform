import React from 'react';
import { Send, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { AnalyticsStats } from '../../types';

interface StatsCardsProps {
  stats: AnalyticsStats | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const emails = stats?.emails;
  const sent = emails?.sent || 0;
  const failed = emails?.failed || 0;
  const waiting = stats?.queue?.waiting || 0;
  const scheduled = emails?.scheduled || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Sent */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">البريد المرسل</p>
          <p className="text-2xl font-bold text-white">{sent.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Send className="w-6 h-6 text-emerald-400" />
        </div>
      </div>
      
      {/* Failed */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">البريد الفاشل</p>
          <p className="text-2xl font-bold text-white">{failed.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
      </div>

      {/* Waiting */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">في الانتظار</p>
          <p className="text-2xl font-bold text-white">{waiting.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Scheduled */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">المجدول</p>
          <p className="text-2xl font-bold text-white">{scheduled.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-indigo-400" />
        </div>
      </div>
    </div>
  );
};
