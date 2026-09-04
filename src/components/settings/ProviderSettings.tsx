import React, { useState } from 'react';
import { Server, CheckCircle2, Shield } from 'lucide-react';

interface ProviderSettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProviderSettings: React.FC<ProviderSettingsProps> = ({ data, onChange }) => {
  const [form, setForm] = useState(data || {
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: 587,
    smtp_user: 'apikey',
    smtp_secure: true,
    default_from: 'noreply@enterprise-esp.com'
  });

  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-indigo-600/15 text-indigo-400">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">إعدادات مزودي البريد وسيرفرات SMTP</h3>
          <p className="text-xs text-slate-400">تكوين خوادم الإرسال الافتفرانية وبيانات المصادقة الخارجية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">خادم SMTP الرئيسي (Host)</label>
          <input
            type="text"
            value={form.smtp_host}
            onChange={(e) => handleChange('smtp_host', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">منفذ الاتصال (Port)</label>
          <input
            type="number"
            value={form.smtp_port}
            onChange={(e) => handleChange('smtp_port', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">اسم المستخدم (SMTP Username)</label>
          <input
            type="text"
            value={form.smtp_user}
            onChange={(e) => handleChange('smtp_user', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">عنوان المرسل الافتراضي (Default From Email)</label>
          <input
            type="email"
            value={form.default_from}
            onChange={(e) => handleChange('default_from', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <input
          type="checkbox"
          id="secure_smtp"
          checked={form.smtp_secure}
          onChange={(e) => handleChange('smtp_secure', e.target.checked)}
          className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900"
        />
        <label htmlFor="secure_smtp" className="text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>تفعيل التشفير الآمن SSL/TLS لاتصالات SMTP</span>
        </label>
      </div>
    </div>
  );
};
