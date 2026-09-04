import React, { useState } from 'react';
import { 
  Key, Plus, Copy, Trash2, ShieldCheck, Check, AlertCircle, 
  Lock, Activity, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { ApiKey, ApiKeyPermissions } from '../types';

interface ApiKeysManagerProps {
  apiKeys: ApiKey[];
  onCreateKey: (data: Partial<ApiKey>) => void;
  onToggleKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
}

export const ApiKeysManager: React.FC<ApiKeysManagerProps> = ({
  apiKeys,
  onCreateKey,
  onToggleKey,
  onDeleteKey
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(1000);
  const [dailyLimit, setDailyLimit] = useState(10000);
  const [permissions, setPermissions] = useState<ApiKeyPermissions>({
    send_email: true,
    bulk_email: true,
    manage_templates: false,
    view_analytics: false
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateKey({
      name: keyName || 'مفتاح تطبيق جديد',
      rate_limit: rateLimit,
      daily_limit: dailyLimit,
      permissions
    });
    setIsModalOpen(false);
    setKeyName('');
  };

  const handleCopyKey = (keyStr: string, id: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <span>إدارة مفاتيح API وتحديد المعدلات (Rate Limiting)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء مفاتيح خاصة بكل تطبيق مع تخصيص الصلاحيات والحد الأقصى للإرسال اليومي واللحظي
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>توليد مفتاح API جديد</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiKeys.map((item) => {
          const usedPct = Math.min(100, Math.round((item.daily_used / item.daily_limit) * 100));
          return (
            <div 
              key={item.id} 
              className={`bg-slate-900 p-5 rounded-2xl border transition-all ${
                item.is_active ? 'border-slate-800' : 'border-rose-900/40 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{item.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    أنشئ في: {new Date(item.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleKey(item.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      item.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={item.is_active ? 'تعطيل المفتاح' : 'تفعيل المفتاح'}
                  >
                    {item.is_active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>

                  <button
                    onClick={() => onDeleteKey(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Secret Code */}
              <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <span className="text-indigo-300 font-medium truncate max-w-[280px]">
                  {item.key}
                </span>
                <button
                  onClick={() => handleCopyKey(item.key, item.id)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quotas & Progress Bar */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>الاستهلاك اليومي للبريد:</span>
                  <span className="font-mono text-slate-200">
                    {item.daily_used.toLocaleString()} / {item.daily_limit.toLocaleString()} ({usedPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      usedPct > 90 ? 'bg-rose-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>حد الطلبات (Rate Limit): <strong className="text-slate-300 font-mono">{item.rate_limit} req/min</strong></span>
                  <span>آخر استخدام: <strong className="text-slate-300 font-mono">{item.last_used ? new Date(item.last_used).toLocaleTimeString('ar-SA') : 'لم يستخدم'}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Generate Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>إنشاء مفتاح API جديد</span>
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم التطبيق / الخدمة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: microservice-billing-app"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">حد الطلبات (Req/Min):</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">الحد اليومي (Emails/Day):</label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-2">صلاحيات المفتاح:</label>
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.send_email}
                      onChange={(e) => setPermissions({ ...permissions, send_email: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-200">إرسال البريد المفرد (POST /email/send)</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.bulk_email}
                      onChange={(e) => setPermissions({ ...permissions, bulk_email: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-200">إرسال البريد الجماعي (POST /email/bulk)</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manage_templates}
                      onChange={(e) => setPermissions({ ...permissions, manage_templates: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-200">إدارة القوالب المعاينة (Templates Access)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                إنشاء المفتاح
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
