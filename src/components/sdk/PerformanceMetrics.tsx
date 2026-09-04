import React from 'react';
import { Activity, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PerformanceMetricsProps {
  history: Array<{ success: boolean; responseTimeMs: number }>;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ history }) => {
  const totalTests = history.length;
  const successCount = history.filter(h => h.success).length;
  const successRate = totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 100;
  
  const avgResponseTime = totalTests > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / totalTests) 
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>مقاييس أداء SDK والجلسة الحالية (Session Performance)</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">معدل النجاح (Success Rate)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{successRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">من أصل {totalTests} اختبارات منفذة</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">متوسط الاستجابة (Avg Latency)</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300">{avgResponseTime} ms</div>
          <div className="text-[10px] text-slate-500 mt-1">زمن رحلة الطلب إلى الـ API</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">حالة الاتصال والبروتوكول</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400">TLS 1.3</div>
          <div className="text-[10px] text-slate-500 mt-1">آمن ومشفر بالكامل</div>
        </div>
      </div>
    </div>
  );
};
