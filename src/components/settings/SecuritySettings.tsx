import React, { useState } from 'react';
import { ShieldCheck, Key, Lock, Globe } from 'lucide-react';

interface SecuritySettingsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ data, onChange }) => {
  const [form, setForm] = useState(data || {
    jwt_expiry: '24h',
    rate_limiting: 1000,
    tls_version: 'TLS 1.3',
    require_auth: true,
    ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8']
  });

  const [newIp, setNewIp] = useState('');

  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  const handleAddIp = () => {
    if (!newIp) return;
    const updatedIps = [...(form.ip_whitelist || []), newIp];
    handleChange('ip_whitelist', updatedIps);
    setNewIp('');
  };

  const handleRemoveIp = (index: number) => {
    const updatedIps = form.ip_whitelist.filter((_: any, i: number) => i !== index);
    handleChange('ip_whitelist', updatedIps);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">إعدادات الأمان ومفاتيح التوثيق (JWT & Rate Limits)</h3>
          <p className="text-xs text-slate-400">التحكم بسياسات الصلاحيات وحماية نقاط الـ API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-bold">صلاحية جلسة JWT (Token Expiry)</label>
          <select
            value={form.jwt_expiry}
            onChange={(e) => handleChange('jwt_expiry', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="1h">ساعة واحدة (1h)</option>
            <option value="12h">12 ساعة (12h)</option>
            <option value="24h">24 ساعة (24h)</option>
            <option value="7d">7 أيام (7d)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">معدل الطلبات الأقصى (Rate Limit/min)</label>
          <input
            type="number"
            value={form.rate_limiting}
            onChange={(e) => handleChange('rate_limiting', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-indigo-500 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-bold">بروتوكول الأمان (TLS Version)</label>
          <select
            value={form.tls_version}
            onChange={(e) => handleChange('tls_version', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="TLS 1.2">TLS 1.2</option>
            <option value="TLS 1.3">TLS 1.3 (موصى به)</option>
          </select>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="space-y-3 pt-2">
        <label className="text-slate-400 block font-bold text-xs flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>عناوين IP المسموح لها بالوصول (IP Whitelist)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="192.168.1.50 أو 10.0.0.0/16"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:border-indigo-500 outline-none"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleAddIp}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            إضافة IP
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {form.ip_whitelist?.map((ip: string, idx: number) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-300">
              <span>{ip}</span>
              <button
                type="button"
                onClick={() => handleRemoveIp(idx)}
                className="text-slate-500 hover:text-rose-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
