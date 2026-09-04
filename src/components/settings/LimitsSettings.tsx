import React, { useState } from 'react';
import { Gauge, Zap, AlertCircle } from 'lucide-react';

interface LimitsSettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export const LimitsSettings: React.FC<LimitsSettingsProps> = ({ data, onChange }) => {
  const [form, setForm] = useState(data || {
    daily_quota: 50000,
    monthly_quota: 1500000,
    max_batch_size: 10000,
    max_attachment_size_mb: 25
  });

  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-600/15 text-amber-400">
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">إعدادات الحصص والحدود التشغيلية (Quotas & Limits)</h3>
          <p className="text-xs text-slate-400">تحديد سقف إرسال الرسائل اليومي والشهرى وأحجام الملفات المرفقة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">الحصة اليومية القصوى (Daily Quota)</label>
          <input
            type="number"
            value={form.daily_quota}
            onChange={(e) => handleChange('daily_quota', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
          <p className="text-[10px] text-slate-500 mt-1">الحد الأقصى لعدد الرسائل التي يمكن إرسالها خلال 24 ساعة</p>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">الحصة الشهرية القصوى (Monthly Quota)</label>
          <input
            type="number"
            value={form.monthly_quota}
            onChange={(e) => handleChange('monthly_quota', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
          <p className="text-[10px] text-slate-500 mt-1">الحد الأقصى الإجمالي المسموح به شهرياً</p>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">أقصى عدد للدفعة الواحدة (Max Batch Size)</label>
          <input
            type="number"
            value={form.max_batch_size}
            onChange={(e) => handleChange('max_batch_size', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">أقصى حجم للمرفقات (MB)</label>
          <input
            type="number"
            value={form.max_attachment_size_mb}
            onChange={(e) => handleChange('max_attachment_size_mb', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};
