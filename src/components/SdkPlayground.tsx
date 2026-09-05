import React, { useState } from 'react';
import { 
  Terminal, BookOpen, Activity, Code2, Copy, Check, ShieldCheck, 
  Zap, Package, RefreshCw, Send, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ApiKey } from '../types';
import { sdkService } from '../services/sdk.service';
import { SDKTestForm, SdkActionType } from './sdk/SDKTestForm';
import { TestResults } from './sdk/TestResults';
import { PerformanceMetrics } from './sdk/PerformanceMetrics';

interface SdkPlaygroundProps {
  apiKeys: ApiKey[];
  onExecuteSdkTest?: (action: string, params: any, apiKeyStr: string) => Promise<any>;
}

export const SdkPlayground: React.FC<SdkPlaygroundProps> = ({ apiKeys }) => {
  const [activeSubTab, setActiveSubTab] = useState<'playground' | 'docs' | 'diagnostics' | 'examples'>('playground');
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [testHistory, setTestHistory] = useState<Array<{ success: boolean; responseTimeMs: number }>>([]);
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null);

  // Diagnostics state
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState<{ latencyMs: number; status: string; timestamp: string } | null>(null);

  const handleCopyInstall = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedPkg(cmd);
    setTimeout(() => setCopiedPkg(null), 2000);
  };

  const handleRunTest = async (testType: SdkActionType, params: any, apiKey: string) => {
    setIsRunning(true);
    try {
      const res = await sdkService.executeTest({
        action: testType,
        apiKey,
        params
      });
      setCurrentResult(res);
      setTestHistory(prev => [{ success: res.success, responseTimeMs: res.responseTimeMs }, ...prev]);
    } catch (err: any) {
      const errRes = {
        success: false,
        status: 500,
        data: { error: err.message },
        responseTimeMs: 120,
        timestamp: new Date().toISOString()
      };
      setCurrentResult(errRes);
      setTestHistory(prev => [{ success: false, responseTimeMs: 120 }, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickPing = async () => {
    setPingRunning(true);
    const start = performance.now();
    try {
      const firstKey = apiKeys[0]?.key || 'esp_live_test_sample';
      await sdkService.executeTest({
        action: 'ping',
        apiKey: firstKey,
        params: {}
      });
      const end = performance.now();
      setPingResult({
        latencyMs: Math.round(end - start),
        status: 'متصل وجاهز (Healthy)',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch {
      setPingResult({
        latencyMs: 150,
        status: 'تعذر الاتصال بالخادم',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setPingRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Banner with Package Details */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">واجهة ومختبر حزمة @email-service/sdk</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/20 font-bold">
                  v1.0.0 Stable
                </span>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-mono border border-indigo-500/20 hidden sm:inline-block">
                  Zero Dependencies (&lt;25KB)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                مكتبة TypeScript الرسمية عالية الأداء للإرسال الفردي والجماعي، القوالب، الجدولة، وإدارة الطوابير.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Install Pill */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl" dir="ltr">
          <Package className="w-4 h-4 text-indigo-400" />
          <code className="text-xs font-mono text-indigo-300">npm i @email-service/sdk</code>
          <button
            type="button"
            onClick={() => handleCopyInstall('npm i @email-service/sdk')}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="نسخ أمر التثبيت"
          >
            {copiedPkg === 'npm i @email-service/sdk' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('playground')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'playground'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>مختبر الاختبار اللحظي (Interactive Playground)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('docs')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دليل التوثيق والـ API Reference</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('examples')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'examples'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>أمثلة التكامل البرمجي (Examples)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'diagnostics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>فحص الاتصال وتشخيص SDK</span>
        </button>
      </div>

      {/* SUB-TAB 1: PLAYGROUND */}
      {activeSubTab === 'playground' && (
        <div className="space-y-6">
          <PerformanceMetrics history={testHistory} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SDKTestForm 
                apiKeys={apiKeys} 
                onRunTest={handleRunTest} 
                isRunning={isRunning} 
              />
            </div>

            <div>
              <TestResults result={currentResult} />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DOCUMENTATION & API REFERENCE */}
      {activeSubTab === 'docs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>صفر تبعيات (Zero Dependencies)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                مبنية بالكامل على native <code className="text-indigo-300">fetch API</code> بدون أي حزم إضافية، متوافقة مع Node.js 18+ وجميع المتصفحات.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>أمان وحجب تلقائي للمفاتيح</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                نظام تسجيل داخلي مزود بـ <code className="text-emerald-300">Sanitizer</code> يمنع تسريب مفاتيح API أو كلمات المرور في سجلات الـ Console.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>إعادة محاولة مع Exponential Backoff</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                معالجة ذكية للأخطاء الشبكية وقيود المعدل (HTTP 429 RateLimit) مع إعادة المحاولة التلقائية والتأخير التدريجي.
              </p>
            </div>
          </div>

          {/* Methods Reference Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>جدول الدوال والواجهات البرمجية الأساسية</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 pr-2">الدالة (Method)</th>
                    <th className="pb-3">المدخلات (Parameters)</th>
                    <th className="pb-3">المخرجات (Returns)</th>
                    <th className="pb-3">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">sendEmail(options)</td>
                    <td className="py-3 text-slate-300">SendEmailOptions</td>
                    <td className="py-3 text-emerald-400">Promise&lt;SendEmailResult&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">إرسال بريد إلكتروني فردي مع دعم المرفقات والأولويات</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">getEmailStatus(jobId)</td>
                    <td className="py-3 text-slate-300">string (jobId)</td>
                    <td className="py-3 text-emerald-400">Promise&lt;EmailStatus&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">استعلام لحظي عن حالة الرسالة في طابور المعالجة</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">bulkSend(options)</td>
                    <td className="py-3 text-slate-300">BulkSendOptions</td>
                    <td className="py-3 text-emerald-400">Promise&lt;BulkEmailResult&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">إرسال دفعات مجزأة مع فواصل زمنية للتحكم بالتدفق</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">scheduleEmail(options)</td>
                    <td className="py-3 text-slate-300">ScheduleEmailOptions</td>
                    <td className="py-3 text-emerald-400">Promise&lt;ScheduleEmailResult&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">جدولة بريد مستقبلي مع دعم التكرار اليومي/الأسبوعي</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">getTemplates(params)</td>
                    <td className="py-3 text-slate-300">&#123; page, limit, category &#125;</td>
                    <td className="py-3 text-emerald-400">Promise&lt;TemplateList&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">جلب قائمة قوالب البريد الإلكتروني المتوفرة</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">renderTemplate(id, data)</td>
                    <td className="py-3 text-slate-300">string, Record&lt;string, any&gt;</td>
                    <td className="py-3 text-emerald-400">Promise&lt;RenderTemplateResult&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">معاينة القالب وحقن المتغيرات واختبار النتيجة</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-2 text-indigo-400 font-bold">testConnection()</td>
                    <td className="py-3 text-slate-300">-</td>
                    <td className="py-3 text-emerald-400">Promise&lt;ConnectionTest&gt;</td>
                    <td className="py-3 text-slate-400 font-sans">فحص سرعة الاستجابة وزمن الانتقال (Ping & Latency)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXAMPLES */}
      {activeSubTab === 'examples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Example 1: Basic Send */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">1. إرسال بريد فردي أساسي</span>
              <span className="text-[10px] text-indigo-400 font-mono">basic.ts</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-indigo-300 overflow-x-auto text-[11px]" dir="ltr">
              <pre>{`import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: process.env.ESP_API_KEY!,
  baseUrl: 'https://api.email-service.com'
});

const result = await client.sendEmail({
  to: 'client@company.com',
  subject: 'مرحباً بك!',
  html: '<h1>شكراً لانضمامك إلينا</h1>',
  priority: 'high'
});`}</pre>
            </div>
          </div>

          {/* Example 2: Bulk Send */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">2. إرسال بريد جماعي مجزأ</span>
              <span className="text-[10px] text-indigo-400 font-mono">bulk-send.ts</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-indigo-300 overflow-x-auto text-[11px]" dir="ltr">
              <pre>{`const bulkResult = await client.bulkSend({
  emails: [
    { to: 'u1@domain.com', subject: 'تحديث أسبوعي', html: '<p>Hi 1</p>' },
    { to: 'u2@domain.com', subject: 'تحديث أسبوعي', html: '<p>Hi 2</p>' }
  ],
  batchSize: 50,
  batchDelay: 100, // 100ms
  retryOnFailure: true
});

console.log(\`Sent: \${bulkResult.sent}/\${bulkResult.total}\`);`}</pre>
            </div>
          </div>

          {/* Example 3: Templates */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">3. استخدام القوالب الديناميكية</span>
              <span className="text-[10px] text-indigo-400 font-mono">with-template.ts</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-indigo-300 overflow-x-auto text-[11px]" dir="ltr">
              <pre>{`const res = await client.sendEmail({
  to: 'user@example.com',
  subject: 'إشعار تفعيل الحساب',
  templateId: 'tpl_onboarding_welcome',
  templateData: {
    user_name: 'أحمد',
    activation_url: 'https://example.com/verify'
  }
});`}</pre>
            </div>
          </div>

          {/* Example 4: Scheduling */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">4. جدولة البريد الإلكتروني</span>
              <span className="text-[10px] text-indigo-400 font-mono">schedule.ts</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-indigo-300 overflow-x-auto text-[11px]" dir="ltr">
              <pre>{`const scheduled = await client.scheduleEmail({
  to: 'lead@company.com',
  subject: 'التقرير الصباحي اليومي',
  html: '<p>ملخص نشاط الخوادم</p>',
  scheduledAt: new Date(Date.now() + 86400000),
  recurrence: 'daily'
});

console.log('Schedule ID:', scheduled.scheduleId);`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DIAGNOSTICS */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>فحص الاتصال المباشر والـ Round-trip Ping</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                إجراء فحص لحظي مباشر للتحقق من وصول طلبات SDK إلى الخادم بدون تأخير
              </p>
            </div>

            <button
              type="button"
              onClick={runQuickPing}
              disabled={pingRunning}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pingRunning ? 'animate-spin' : ''}`} />
              <span>{pingRunning ? 'جارِ الفحص...' : 'فحص الاتصال الآن'}</span>
            </button>
          </div>

          {pingResult ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-400 block mb-1">حالة الاتصال</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pingResult.status}</span>
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-400 block mb-1">زمن الاستجابة (Latency)</span>
                <span className="text-white font-mono font-bold text-sm">{pingResult.latencyMs} ms</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-400 block mb-1">توقيت الفحص</span>
                <span className="text-slate-300 font-mono text-sm">{pingResult.timestamp}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl text-center text-slate-500 text-xs">
              اضغط على زر &quot;فحص الاتصال الآن&quot; لقياس سرعة الاستجابة اللحظية.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
