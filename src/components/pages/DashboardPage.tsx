import React from 'react';
import { LayoutDashboard, Send, Clock, CheckCircle2, AlertTriangle, Cpu, Activity, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const DashboardPage: React.FC = () => {
  const emailState = useSelector((state: RootState) => state.email);
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الرسائل المرسلة اليوم</span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">14,200</div>
          <p className="text-[10px] text-emerald-400 font-bold">+12% مقارنة بالأمس</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>نسبة نجاح التسليم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">99.4%</div>
          <p className="text-[10px] text-slate-400">معدل الارتداد (Bounce) 0.6%</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>رسائل الانتظار بالطابور</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">12</div>
          <p className="text-[10px] text-amber-300">طابور Bull Queue نشط</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>متوسط زمن المعالجة</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">38 ms</div>
          <p className="text-[10px] text-sky-300">استجابة فائقة السرعة</p>
        </div>

      </div>

      {/* Recent Jobs Table */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>آخر عمليات الإرسال المسجلة في Redux Store ({emailState.recentJobs.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="py-2.5 px-3">معرف المهام</th>
                <th className="py-2.5 px-3">المستلم (To)</th>
                <th className="py-2.5 px-3">العنوان</th>
                <th className="py-2.5 px-3">الأولوية</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono">
              {emailState.recentJobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-indigo-300">{job.jobId}</td>
                  <td className="py-2.5 px-3">{job.to.join(', ')}</td>
                  <td className="py-2.5 px-3 text-white font-sans">{job.subject}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] uppercase">
                      {job.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      job.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                      job.status === 'processing' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{job.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
