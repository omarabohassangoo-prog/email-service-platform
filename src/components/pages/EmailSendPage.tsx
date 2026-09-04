import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EmailTemplate, ProviderConfig } from '../../types';
import { emailClientService } from '../../services/email-client.service';
import { TemplateSelector } from '../email/TemplateSelector';
import { AttachmentManager, Attachment } from '../email/AttachmentManager';
import { SendEmailForm, SendEmailFormData } from '../email/SendEmailForm';
import { EmailPreview } from '../email/EmailPreview';

export const EmailSendPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [defaultSubject, setDefaultSubject] = useState('');
  const [defaultHtml, setDefaultHtml] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Load templates and providers
    const loadData = async () => {
      try {
        const [tplRes, provRes] = await Promise.all([
          emailClientService.getTemplates().catch(() => ({ templates: [] })),
          emailClientService.getProviders().catch(() => ({ providers: [] }))
        ]);
        if (tplRes.templates) setTemplates(tplRes.templates);
        if (provRes.providers) setProviders(provRes.providers);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    loadData();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setDefaultSubject('');
      setDefaultHtml('');
      return;
    }
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      setDefaultSubject(tpl.subject);
      setDefaultHtml(tpl.html);
    }
  };

  const handleSend = async (data: SendEmailFormData) => {
    setIsSending(true);
    setSendStatus(null);
    try {
      const payload = {
        to: data.to.split(',').map(s => s.trim()),
        cc: data.cc ? data.cc.split(',').map(s => s.trim()) : undefined,
        bcc: data.bcc ? data.bcc.split(',').map(s => s.trim()) : undefined,
        subject: data.subject,
        html: data.html,
        priority: data.priority,
        template: selectedTemplateId || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      };
      
      const response = await emailClientService.sendEmail(payload);
      setSendStatus({
        type: 'success',
        message: `تم إرسال البريد بنجاح، رقم العملية: ${response.job_id}`
      });
      // Optionally reset form state here if needed
    } catch (err: any) {
      setSendStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'حدث خطأ غير معروف'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <span>إرسال البريد الإلكتروني</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            صياغة الرسائل والمرفقات مع معاينة فورية ومحرك توجيه ذكي
          </p>
        </div>
      </div>

      {sendStatus && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${sendStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          {sendStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{sendStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Settings */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <TemplateSelector 
              templates={templates} 
              selectedTemplateId={selectedTemplateId} 
              onSelect={handleTemplateSelect} 
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <AttachmentManager 
              attachments={attachments}
              onAdd={(att) => setAttachments([...attachments, att])}
              onRemove={(id) => setAttachments(attachments.filter(a => a.id !== id))}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <SendEmailForm 
              providers={providers}
              onSubmitForm={handleSend}
              isSending={isSending}
              defaultHtml={defaultHtml}
              defaultSubject={defaultSubject}
              onPreviewChange={(subj, html) => {
                setPreviewSubject(subj);
                setPreviewHtml(html);
              }}
            />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:h-full">
          <div className="sticky top-24 h-[calc(100vh-140px)]">
            <EmailPreview subject={previewSubject} htmlContent={previewHtml} />
          </div>
        </div>
      </div>
    </div>
  );
};
