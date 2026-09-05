import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Code, Calendar, Users, Activity, Copy, Check } from 'lucide-react';
import { ApiKey } from '../../types';

export type SdkActionType = 'send' | 'bulk' | 'schedule' | 'status' | 'template' | 'ping';

interface SDKTestFormProps {
  apiKeys: ApiKey[];
  onRunTest: (testType: SdkActionType, params: any, apiKey: string) => void;
  isRunning: boolean;
}

export const SDKTestForm: React.FC<SDKTestFormProps> = ({ apiKeys, onRunTest, isRunning }) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);
  const [testType, setTestType] = useState<SdkActionType>('send');
  const [copiedCode, setCopiedCode] = useState(false);

  // Send parameters
  const [to, setTo] = useState('recipient@example.com');
  const [subject, setSubject] = useState('اختبار إرسال بريد عبر @email-service/sdk');
  const [html, setHtml] = useState('<h2>مرحباً بك</h2><p>هذا اختبار تفاعلي مباشر لحزمة SDK البرمجية.</p>');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('high');

  // Bulk parameters
  const [bulkCount, setBulkCount] = useState(3);
  const [bulkDomain, setBulkDomain] = useState('company.com');

  // Schedule parameters
  const [scheduledDate, setScheduledDate] = useState('2026-09-06T10:00:00Z');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('daily');

  // Status parameters
  const [jobId, setJobId] = useState('bull-job-123456');

  // Template parameters
  const [templateId, setTemplateId] = useState('tmpl-001');
  const [templateData, setTemplateData] = useState('{\n  "user_name": "سارة",\n  "verify_link": "https://esp.com/verify"\n}');

  const activeKey = apiKeys[selectedKeyIndex]?.key || 'esp_live_test_key_sample';

  // Generate real TypeScript code snippet matching the user selection
  const generateSnippet = () => {
    switch (testType) {
      case 'send':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const result = await client.sendEmail({
  to: '${to}',
  subject: '${subject}',
  html: \`${html.replace(/`/g, '\\`')}\`,
  priority: '${priority}'
});

console.log('Queued Job ID:', result.jobId);`;

      case 'bulk':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const emails = Array.from({ length: ${bulkCount} }, (_, i) => ({
  to: \`user\${i + 1}@${bulkDomain}\`,
  subject: 'نشرة دورية للمطورين',
  html: '<p>محتوى البريد الجماعي</p>',
  priority: 'normal'
}));

const bulkResult = await client.bulkSend({
  emails,
  batchSize: 50,
  batchDelay: 100
});

console.log('Sent count:', bulkResult.sent);`;

      case 'schedule':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const scheduled = await client.scheduleEmail({
  to: '${to}',
  subject: '${subject}',
  html: '<p>تذكير مجدول</p>',
  scheduledAt: '${scheduledDate}',
  recurrence: ${recurrence === 'none' ? 'null' : `'${recurrence}'`}
});

console.log('Schedule ID:', scheduled.scheduleId);`;

      case 'status':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const status = await client.getEmailStatus('${jobId}');
console.log('Job Status:', status.status);
console.log('Attempts:', status.attempts);`;

      case 'template':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const rendered = await client.renderTemplate('${templateId}', ${templateData.trim()});
console.log('Rendered Subject:', rendered.subject);`;

      case 'ping':
        return `import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: '${activeKey}',
  baseUrl: window.location.origin,
});

const ping = await client.testConnection();
console.log('Latency:', ping.latencyMs, 'ms');`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let params: any = {};
    if (testType === 'send') {
      params = { to, subject, html, priority };
    } else if (testType === 'bulk') {
      const emails = Array.from({ length: bulkCount }, (_, i) => ({
        to: `user${i + 1}@${bulkDomain}`,
        subject: 'بريد جماعي عبر SDK',
        html: '<p>نص البريد</p>'
      }));
      params = { emails };
    } else if (testType === 'schedule') {
      params = {
        to,
        subject,
        html,
        scheduled_at: scheduledDate,
        recurrence: recurrence === 'none' ? null : recurrence
      };
    } else if (testType === 'status') {
      params = { job_id: jobId };
    } else if (testType === 'template') {
      try {
        const parsedData = JSON.parse(templateData);
        params = { template_id: templateId, data: parsedData };
      } catch {
        alert('صيغة JSON غير صالحة لبيانات القالب');
        return;
      }
    } else if (testType === 'ping') {
      params = {};
    }
    onRunTest(testType, params, activeKey);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
      {/* Header with Key Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>إعداد نموذج استدعاء SDK</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">اختر العملية وحدد المعاملات المطلوبة للتنفيذ الفوري</p>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">المفتاح المعتمد (API Key):</label>
          <select
            value={selectedKeyIndex}
            onChange={(e) => setSelectedKeyIndex(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 font-mono outline-none"
          >
            {apiKeys.length > 0 ? (
              apiKeys.map((k, idx) => (
                <option key={k.id} value={idx}>{k.name} ({k.key.substring(0, 12)}...)</option>
              ))
            ) : (
              <option value={0}>مفتاح تجريبي (esp_live_test_sample...)</option>
            )}
          </select>
        </div>
      </div>

      {/* Operation Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
        <button
          type="button"
          onClick={() => setTestType('send')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'send' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>إرسال فردي</span>
        </button>

        <button
          type="button"
          onClick={() => setTestType('bulk')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'bulk' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إرسال جماعي</span>
        </button>

        <button
          type="button"
          onClick={() => setTestType('schedule')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'schedule' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>جدولة بريد</span>
        </button>

        <button
          type="button"
          onClick={() => setTestType('status')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'status' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>استعلام حالة</span>
        </button>

        <button
          type="button"
          onClick={() => setTestType('template')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'template' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>معاينة قالب</span>
        </button>

        <button
          type="button"
          onClick={() => setTestType('ping')}
          className={`p-2.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
            testType === 'ping' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>فحص اتصال</span>
        </button>
      </div>

      {/* Dynamic Form Inputs */}
      <div className="space-y-4 text-xs">
        {testType === 'send' && (
          <>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">البريد المستلم (To):</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">موضوع الرسالة (Subject):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">الأولوية (Priority):</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
              >
                <option value="high">مرتفعة (High Priority)</option>
                <option value="normal">عادية (Normal Priority)</option>
                <option value="low">منخفضة (Low Priority)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">محتوى البريد (HTML):</label>
              <textarea
                rows={3}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-200 font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
          </>
        )}

        {testType === 'bulk' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">عدد المستلمين في الدفعة:</label>
              <input
                type="number"
                min={1}
                max={500}
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">نطاق البريد (Domain):</label>
              <input
                type="text"
                value={bulkDomain}
                onChange={(e) => setBulkDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none"
                dir="ltr"
                required
              />
            </div>
          </div>
        )}

        {testType === 'schedule' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">تاريخ وتوقيت التنفيذ (ISO String):</label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">التكرار (Recurrence):</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
              >
                <option value="none">بدون تكرار (مرة واحدة فقط)</option>
                <option value="daily">يومي (Daily)</option>
                <option value="weekly">أسبوعي (Weekly)</option>
                <option value="monthly">شهري (Monthly)</option>
              </select>
            </div>
          </div>
        )}

        {testType === 'status' && (
          <div>
            <label className="text-slate-400 block mb-1 font-bold">معرف المهمة المطلوب فحصها (Job ID):</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500"
              dir="ltr"
              required
            />
          </div>
        )}

        {testType === 'template' && (
          <>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">معرف القالب (Template ID):</label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">متغيرات القالب بتنسيق JSON:</label>
              <textarea
                rows={4}
                value={templateData}
                onChange={(e) => setTemplateData(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
          </>
        )}

        {testType === 'ping' && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs">
            <p>سيتم إجراء فحص استجابة سريع (Ping Diagnostic) لقياس زمن الاستجابة (Latency) والتحقق من صحة الخادم.</p>
          </div>
        )}
      </div>

      {/* Live Code Snippet Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px] font-bold">الكود المصدري بلغة TypeScript المطابق للمدخلات:</span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto max-h-[140px] overflow-y-auto" dir="ltr">
          <pre>{generateSnippet()}</pre>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isRunning}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>جارِ تنفيذ طلب الـ SDK...</span>
          </>
        ) : (
          <>
            <Terminal className="w-4 h-4" />
            <span>تنفيذ العملية فورياً عبر الـ SDK</span>
          </>
        )}
      </button>
    </form>
  );
};
