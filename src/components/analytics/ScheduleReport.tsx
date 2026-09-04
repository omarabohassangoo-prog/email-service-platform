import React, { useState } from 'react';
import { Calendar, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';

export const ScheduleReport: React.FC = () => {
  const [email, setEmail] = useState('admin@enterprise-esp.com');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [format, setFormat] = useState('PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await analyticsService.scheduleReport({ email, frequency, format });
      setSuccessMsg(res.message);
    } catch (err: any) {
      alert('فشل جدولة التقرير');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4" dir="rtl">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>جدولة وإرسال التقارير التلقائية (Automated Reports Scheduling)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">إرسال التقارير التحليلية وملخصات الأداء بشكل دوري إلى البريد الإلكتروني</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-end">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">البريد الإلكتروني للمستلم:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">دورية الإرسال:</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="daily">يومياً (Daily Report)</option>
            <option value="weekly">أسبوعياً (Weekly Report)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">صيغة التقرير:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="PDF">تقرير PDF مفصل</option>
            <option value="Excel">جدول Excel</option>
            <option value="CSV">ملف CSV</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>تفعيل الجدول</span>
          </button>
        </div>
      </form>
    </div>
  );
};
