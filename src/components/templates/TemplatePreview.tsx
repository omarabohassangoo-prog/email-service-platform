import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types';
import { X, Play, Eye, Mail, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { templateClientService } from '../../services/template-client.service';

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const [testData, setTestData] = useState<string>('{\n  "name": "أحمد",\n  "company": "شركة التقنية"\n}');
  const [previewResult, setPreviewResult] = useState<{ subject: string; html: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePreview = async () => {
    try {
      const data = JSON.parse(testData);
      const result = await templateClientService.previewTemplate(template.id, data);
      setPreviewResult(result);
    } catch (e) {
      console.error('JSON Error'); setPreviewResult(null);
    }
  };

  useEffect(() => {
    // Initial preview if data is valid
    handlePreview();
  }, []);

  const handleSendTest = async () => {
    if (!testEmail) return;
    setIsSending(true);
    setSendStatus(null);
    try {
      const data = JSON.parse(testData);
      await templateClientService.testTemplate(template.id, testEmail, data);
      setSendStatus({ type: 'success', message: 'تم إرسال بريد الاختبار بنجاح' });
    } catch (e: any) {
      setSendStatus({ type: 'error', message: e.response?.data?.error || 'حدث خطأ أثناء إرسال الاختبار' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50 flex-shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" />
          <span>معاينة القالب: {template.name}</span>
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
        {/* Left: Input Variables */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-slate-800 p-5 flex flex-col bg-slate-900 overflow-y-auto">
          <div className="mb-4">
            <label className="text-slate-300 font-semibold text-sm mb-2 flex items-center justify-between">
              <span>بيانات الاختبار (JSON)</span>
              <button onClick={handlePreview} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <Play className="w-3 h-3" /> تحديث المعاينة
              </button>
            </label>
            <textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-mono focus:border-indigo-500 outline-none text-sm leading-relaxed"
              dir="ltr"
            />
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <h4 className="text-slate-300 font-semibold text-sm mb-3">إرسال بريد تجريبي</h4>
            
            {sendStatus && (
              <div className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 ${sendStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {sendStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{sendStatus.message}</span>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm font-mono"
                dir="ltr"
              />
              <button
                onClick={handleSendTest}
                disabled={isSending || !testEmail}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-indigo-400" />}
                <span>إرسال الاختبار</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-full md:w-2/3 bg-slate-950 flex flex-col relative">
          {previewResult ? (
            <div className="flex flex-col h-full absolute inset-0">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
                <div className="text-xs text-slate-400 mb-1">الموضوع:</div>
                <div className="font-semibold text-white truncate">{previewResult.subject}</div>
              </div>
              <div className="flex-1 bg-white overflow-y-auto p-6 text-slate-900 w-full relative">
                 <div dangerouslySetInnerHTML={{ __html: previewResult.html }} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              جاري المعاينة...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
