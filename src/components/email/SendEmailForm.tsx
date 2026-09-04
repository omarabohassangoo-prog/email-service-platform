import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';
import { ProviderConfig } from '../../types';

const sendEmailSchema = z.object({
  to: z.string().min(1, 'البريد الإلكتروني مطلوب'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'عنوان الرسالة مطلوب'),
  html: z.string().min(1, 'محتوى الرسالة مطلوب'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  providerId: z.string().optional(),
});

export type SendEmailFormData = z.infer<typeof sendEmailSchema>;

interface SendEmailFormProps {
  providers: ProviderConfig[];
  onSubmitForm: (data: SendEmailFormData) => void;
  isSending: boolean;
  defaultHtml?: string;
  defaultSubject?: string;
  onPreviewChange: (subject: string, html: string) => void;
}

export const SendEmailForm: React.FC<SendEmailFormProps> = ({ 
  providers, 
  onSubmitForm, 
  isSending, 
  defaultHtml = '', 
  defaultSubject = '',
  onPreviewChange
}) => {
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      to: '',
      cc: '',
      bcc: '',
      subject: defaultSubject,
      html: defaultHtml,
      priority: 'normal',
      providerId: '',
    }
  });

  const subject = watch('subject');
  const html = watch('html');

  useEffect(() => {
    onPreviewChange(subject, html);
  }, [subject, html, onPreviewChange]);

  useEffect(() => {
    setValue('html', defaultHtml);
    setValue('subject', defaultSubject);
  }, [defaultHtml, defaultSubject, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5" dir="rtl">
      
      {/* To / CC / BCC */}
      <div className="space-y-4">
        <div>
          <label className="text-slate-300 font-semibold text-sm mb-1.5 block">إلى (To)</label>
          <input
            {...register('to')}
            placeholder="user@example.com, admin@domain.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-left font-mono"
            dir="ltr"
          />
          {errors.to && <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.to.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 font-semibold text-sm mb-1.5 block">نسخة (CC)</label>
            <input
              {...register('cc')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-left font-mono"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold text-sm mb-1.5 block">نسخة مخفية (BCC)</label>
            <input
              {...register('bcc')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-left font-mono"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Priority & Provider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-300 font-semibold text-sm mb-1.5 block">مستوى الأولوية</label>
          <select
            {...register('priority')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="low">منخفضة (Low)</option>
            <option value="normal">عادية (Normal)</option>
            <option value="high">عالية (High)</option>
            <option value="urgent">طارئة (Urgent)</option>
          </select>
        </div>
        <div>
          <label className="text-slate-300 font-semibold text-sm mb-1.5 block">مزود الخدمة (اختياري)</label>
          <select
            {...register('providerId')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="">-- توجيه تلقائي (Auto Routing) --</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="text-slate-300 font-semibold text-sm mb-1.5 block">عنوان الرسالة (Subject)</label>
        <input
          {...register('subject')}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
        />
        {errors.subject && <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.subject.message}</p>}
      </div>

      {/* HTML Content */}
      <div>
        <label className="text-slate-300 font-semibold text-sm mb-1.5 block">محتوى البريد (HTML)</label>
        <textarea
          {...register('html')}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-200 font-mono focus:border-indigo-500 outline-none text-left"
          dir="ltr"
        />
        {errors.html && <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.html.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {isSending ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>جاري الإرسال...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>إرسال البريد</span>
          </>
        )}
      </button>

    </form>
  );
};
