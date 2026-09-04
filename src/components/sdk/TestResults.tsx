import React from 'react';
import { FileJson, CheckCircle2, AlertTriangle, Clock, Activity } from 'lucide-react';

interface TestResultsProps {
  result: {
    success: boolean;
    status: number;
    data: any;
    responseTimeMs: number;
    timestamp: string;
  } | null;
}

export const TestResults: React.FC<TestResultsProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-full flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
        <FileJson className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-xs">لم يتم إجراء أي اختبار بعد. قم بتعبئة النموذج واضغط على تشغيل.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileJson className="w-4 h-4 text-emerald-400" />
          <span>النتائج والتفاصيل (Detailed Test Results)</span>
        </h3>
        
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
            result.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            HTTP {result.status} {result.success ? 'SUCCESS' : 'ERROR'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">وقت الاستجابة (Latency)</span>
            <span className="font-mono text-white text-sm font-bold">{result.responseTimeMs} ms</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">وقت التنفيذ (Timestamp)</span>
            <span className="font-mono text-slate-300 text-xs">{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* JSON Output */}
      <div>
        <label className="text-slate-400 text-xs block mb-1.5 font-bold">حمولة الاستجابة الكاملة (Raw Response Payload):</label>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[300px] overflow-y-auto leading-relaxed">
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      </div>

      {result.success ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>تم اجتياز الاختبار بنجاح واستجابة الخادم مطابقة للمواصفات القياسية.</span>
        </div>
      ) : (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>فشل الاختبار، يرجى مراجعة مفتاح الـ API أو صحة المعاملات المدخلة.</span>
        </div>
      )}
    </div>
  );
};
