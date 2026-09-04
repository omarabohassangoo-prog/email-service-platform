import React, { useState } from 'react';
import { Terminal, Play, ShieldCheck, Code2, Check, Copy } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const SdkTestPage: React.FC = () => {
  const apiKey = useSelector((state: RootState) => state.auth.apiKey);
  const [sdkMethod, setSdkMethod] = useState('sendEmail');
  const [recipient, setRecipient] = useState('sdk_user@domain.org');
  const [subject, setSubject] = useState('تجربة إرسال عبر حزمة SDK الرسمية');
  const [isExecuting, setIsExecuting] = useState(false);
  const [sdkOutput, setSdkOutput] = useState<any | null>(null);

  const handleRunSdk = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setSdkOutput({
        status: 'success',
        clientVersion: '@esp/sdk-node-v1.2.0',
        authMethod: 'x-api-key',
        apiKeyUsed: apiKey.slice(0, 10) + '...',
        result: {
          jobId: `sdk_job_${Date.now()}`,
          delivered: true,
          latencyMs: 24,
          signature: 'sha256_esp_sdk_verified_sig_992'
        }
      });
      setIsExecuting(false);
    }, 600);
  };

  const sampleCode = `import { ESPClient } from '@esp/sdk-node';

const esp = new ESPClient({
  apiKey: '${apiKey || 'YOUR_API_KEY'}',
  endpoint: 'https://api.esp-platform.com/v1'
});

const response = await esp.email.send({
  to: ['${recipient}'],
  subject: '${subject}',
  html: '<h1>اختبار SDK الناجح</h1>'
});

console.log(response.jobId);`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <span>مختبر حزمة تطوير البرمجيات (SDK Tester)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">محاكاة استدعاءات الـ Node.js / TypeScript SDK الحية</p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-bold">الدالة المستهدفة:</label>
            <select
              value={sdkMethod}
              onChange={(e) => setSdkMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono focus:border-indigo-500 outline-none"
            >
              <option value="sendEmail">esp.email.send()</option>
              <option value="getJobStatus">esp.email.getStatus()</option>
              <option value="listTemplates">esp.templates.list()</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">المستلم (Recipient):</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">العنوان (Subject):</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            onClick={handleRunSdk}
            disabled={isExecuting}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>تنفيذ الأمر واختبار الـ SDK</span>
          </button>
        </div>
      </div>

      {/* Code & Response Panel */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>كود الاستدعاء المولد (Generated SDK Snippet)</span>
          </h3>

          <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
            <code>{sampleCode}</code>
          </pre>
        </div>

        {sdkOutput && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>نتيجة استجابة الـ SDK:</span>
            </h3>

            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(sdkOutput, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
