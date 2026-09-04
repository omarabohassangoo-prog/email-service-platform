import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Copy } from 'lucide-react';

interface ComplianceSettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export const ComplianceSettings: React.FC<ComplianceSettingsProps> = ({ data, onChange }) => {
  const [form, setForm] = useState(data || {
    spf_record: 'v=spf1 include:mail.enterprise-esp.com ~all',
    dkim_selector: 'esp2026',
    dmarc_policy: 'quarantine',
    dmarc_report_email: 'dmarc-reports@enterprise-esp.com'
  });

  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">إعدادات التوافق والمصادقة (SPF, DKIM, DMARC)</h3>
          <p className="text-xs text-slate-400">حماية النطاق وتجنب تصنيف البريد كرسائل مزعجة (Spam)</p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">سجل SPF (Sender Policy Framework)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.spf_record}
              onChange={(e) => handleChange('spf_record', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(form.spf_record)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> نسخ
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">يضاف كسجل TXT في إعدادات DNS للنطاق الخاص بك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 block mb-1 font-bold">معرف DKIM Selector</label>
            <input
              type="text"
              value={form.dkim_selector}
              onChange={(e) => handleChange('dkim_selector', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">بريد تقارير DMARC</label>
            <input
              type="email"
              value={form.dmarc_report_email}
              onChange={(e) => handleChange('dmarc_report_email', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">سياسة DMARC (Policy)</label>
          <select
            value={form.dmarc_policy}
            onChange={(e) => handleChange('dmarc_policy', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="none">بدون إجراء صارم (p=none) - مراقبة فقط</option>
            <option value="quarantine">عزل الرسائل المشبوهة (p=quarantine)</option>
            <option value="reject">رفض تام للرسائل غير المصرح بها (p=reject)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
