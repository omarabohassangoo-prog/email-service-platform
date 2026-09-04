import React, { useState } from 'react';
import { Terminal, Play, Code, Send, CheckCircle2 } from 'lucide-react';
import { ApiKey } from '../../types';

interface SDKTestFormProps {
  apiKeys: ApiKey[];
  onRunTest: (testType: 'send' | 'status' | 'template', params: any, apiKey: string) => void;
  isRunning: boolean;
}

export const SDKTestForm: React.FC<SDKTestFormProps> = ({ apiKeys, onRunTest, isRunning }) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);
  const [testType, setTestType] = useState<'send' | 'status' | 'template'>('send');

  // Send parameters
  const [to, setTo] = useState('recipient@example.com');
  const [subject, setSubject] = useState('اختبار إرسال بريد عبر SDK');
  const [html, setHtml] = useState('<h2>مرحباً بك</h2><p>هذا اختبار تفاعلي لواجهة SDK.</p>');
  const [priority, setPriority] = useState('high');

  // Status parameters
  const [jobId, setJobId] = useState('bull-job-123456');

  // Template parameters
  const [templateId, setTemplateId] = useState('welcome_template');
  const [templateData, setTemplateData] = useState('{\n  "user_name": "سارة",\n  "verify_link": "https://esp.com/verify"\n}');

  const activeKey = apiKeys[selectedKeyIndex]?.key || 'esp_live_test_key_sample';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let params: any = {};
    if (testType === 'send') {
      params = { to, subject, html, priority };
    } else if (testType === 'status') {
      params = { job_id: jobId };
    } else if (testType === 'template') {
      try {
        const parsedData = JSON.parse(templateData);
        params = { template_id: templateId, data: parsedData };
      } catch (err) {
        alert('صيغة JSON غير صالحة لبيانات القالب');
        return;
      }
    }
    onRunTest(testType, params, activeKey);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>إعداد نموذج اختبار SDK</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">اختر نوع الاختبار وحدد المعاملات المطلوبة للتنفيذ الفوري</p>
        </div>

        <div>
          <select
            value={selectedKeyIndex}
            onChange={(e) => setSelectedKeyIndex(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 font-mono outline-none"
          >
            {apiKeys.map((k, idx) => (
              <option key={k.id} value={idx}>{k.name} ({k.key.substring(0, 10)}...)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Type Tabs */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <button
          type="button"
          onClick={() => setTestType('send')}
          className={`p-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            testType === 'send' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>اختبار الإرسال (Send)</span>
        </button>
        <button
          type="button"
          onClick={() => setTestType('status')}
          className={`p-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            testType === 'status' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>اختبار الحالة (Status)</span>
        </button>
        <button
          type="button"
          onClick={() => setTestType('template')}
          className={`p-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            testType === 'template' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>اختبار القوالب (Templates)</span>
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
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
              >
                <option value="high">مرتفعة (High)</option>
                <option value="normal">عادية (Normal)</option>
                <option value="low">منخفضة (Low)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold">محتوى البريد (HTML):</label>
              <textarea
                rows={4}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-200 font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
          </>
        )}

        {testType === 'status' && (
          <div>
            <label className="text-slate-400 block mb-1 font-bold">معرف المهمة (Job ID):</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500"
              dir="ltr"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">أدخل معرف المهمة الذي تم إرجاعه عند الإرسال</p>
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
              <label className="text-slate-400 block mb-1 font-bold">بيانات المتغيرات (JSON Data):</label>
              <textarea
                rows={4}
                value={templateData}
                onChange={(e) => setTemplateData(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-mono outline-none focus:border-indigo-500"
                dir="ltr"
                required
              />
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isRunning}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
        <span>{isRunning ? 'جاري تنفيذ الاختبار...' : 'تشغيل اختبار SDK الآن'}</span>
      </button>
    </form>
  );
};
