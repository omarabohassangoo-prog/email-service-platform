import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, ShieldCheck } from 'lucide-react';

interface AnalyticsChartsProps {
  timeline: Array<{ time: string; sent: number; delivered: number; bounced: number }>;
  gmailComp: number;
  outlookComp: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ timeline, gmailComp, outlookComp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Area Chart */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>حجم الإرسال والتسليم على مدار الأربع وعشرين ساعة الماضية</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            تحديث مباشر (Live)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="sent" name="المرسل" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" />
              <Area type="monotone" dataKey="delivered" name="المسلم" stroke="#10b981" fillOpacity={1} fill="url(#colorDelivered)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compatibility Card (Gmail & Outlook) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>مقاييس التوافق مع مزودي البريد</span>
          </h3>
          <p className="text-xs text-slate-400">نسبة اجتياز اختبارات العرض والتسليم بدون حظر</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-300">توافق Gmail (Google Workspace)</span>
              <span className="text-emerald-400 font-mono">{gmailComp}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${gmailComp}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-300">توافق Outlook (Microsoft 365)</span>
              <span className="text-indigo-400 font-mono">{outlookComp}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${outlookComp}%` }} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          * يتم فحص القوالب تلقائياً ضد قواعد الحظر الخاصة بـ SPF و DKIM و DMARC لضمان وصول ممتاز.
        </div>
      </div>
    </div>
  );
};
