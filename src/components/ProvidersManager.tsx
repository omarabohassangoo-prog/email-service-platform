import React, { useState } from 'react';
import { 
  Server, ShieldAlert, CheckCircle2, RefreshCw, Zap, 
  Settings2, Activity, Play, ArrowDown, ArrowUp, AlertCircle
} from 'lucide-react';
import { ProviderConfig } from '../types';

interface ProvidersManagerProps {
  providers: ProviderConfig[];
  onUpdateProvider: (id: string, data: Partial<ProviderConfig>) => void;
  onTestProvider: (providerId: string, testEmail: string) => Promise<any>;
}

export const ProvidersManager: React.FC<ProvidersManagerProps> = ({
  providers,
  onUpdateProvider,
  onTestProvider
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, any>>({});
  const [testEmailInput, setTestEmailInput] = useState('ping@enterprise-esp.com');

  const handleTestPing = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const res = await onTestProvider(providerId, testEmailInput);
      setTestResult({ ...testResult, [providerId]: res });
    } catch (e: any) {
      setTestResult({ ...testResult, [providerId]: { success: false, error: e.message } });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>مزودات البريد الإلكتروني والتراجع التلقائي (Multi-Provider Failover)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إعداد خوادم SMTP ومزودات الخدمات Cloud (AWS SES, SendGrid) مع ميزة Failover التلقائي عند انقطاع أحد المزودين
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="email"
            placeholder="بريد الفحص..."
            value={testEmailInput}
            onChange={(e) => setTestEmailInput(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Providers List Grid */}
      <div className="space-y-4">
        {providers.map((prov) => {
          const res = testResult[prov.provider_id];
          const isTesting = testingId === prov.provider_id;

          return (
            <div 
              key={prov.id}
              className={`bg-slate-900 p-6 rounded-2xl border transition-all ${
                prov.is_primary ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${prov.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <h3 className="text-base font-bold text-white">{prov.name}</h3>
                    {prov.is_primary && (
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                        المزود الرئيسي (Primary Relay)
                      </span>
                    )}
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                      الأولوية: #{prov.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">عنوان الخادم:</span>
                      <span className="font-mono text-slate-200 font-medium">{prov.host}:{prov.port}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">التأخير (Latency):</span>
                      <span className="font-mono text-emerald-400 font-medium">{prov.latency_ms} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">نسبة النجاح:</span>
                      <span className="font-mono text-indigo-300 font-medium">{prov.success_rate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">أقصى اتصالات:</span>
                      <span className="font-mono text-slate-300 font-medium">{prov.max_connections} conn</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  {!prov.is_primary && (
                    <button
                      onClick={() => onUpdateProvider(prov.id, { is_primary: true })}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      تعيين كـ الرئيسي
                    </button>
                  )}

                  <button
                    onClick={() => handleTestPing(prov.provider_id)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'جاري الفحص...' : 'اختبار الاتصال'}</span>
                  </button>
                </div>

              </div>

              {/* Ping Result Banner */}
              {res && (
                <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                  res.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {res.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{res.message || (res.success ? 'تم الاتصال بنجاح' : res.error)}</span>
                  </div>
                  {res.latency_ms && (
                    <span className="font-mono text-[11px] font-bold">
                      زمن الاستجابة: {res.latency_ms}ms
                    </span>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
