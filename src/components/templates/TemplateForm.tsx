import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmailTemplate } from '../../types';
import { Save, X, RefreshCw, Wand2 } from 'lucide-react';
import { templateClientService } from '../../services/template-client.service';

const templateSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  description: z.string().optional(),
  category: z.string().min(2, 'التصنيف مطلوب'),
  scope: z.enum(['global', 'app']),
  app_id: z.string().optional(),
  app_name: z.string().optional(),
  subject: z.string().min(1, 'عنوان الرسالة مطلوب'),
  html: z.string().min(1, 'محتوى HTML مطلوب'),
  text: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  initialData?: EmailTemplate | null;
  onSave: (data: Partial<EmailTemplate>) => Promise<void>;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ initialData, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [extractedVars, setExtractedVars] = useState<string[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || 'marketing',
      scope: initialData?.scope || 'global',
      app_id: initialData?.app_id || '',
      app_name: initialData?.app_name || '',
      subject: initialData?.subject || '',
      html: initialData?.html || '',
      text: initialData?.text || '',
    }
  });

  const htmlContent = watch('html');
  const scope = watch('scope');

  useEffect(() => {
    const vars = templateClientService.extractVariables(htmlContent || '');
    setExtractedVars(vars);
  }, [htmlContent]);

  const onSubmit = async (data: TemplateFormData) => {
    setIsSaving(true);
    try {
      await onSave({
        ...data,
        variables: extractedVars,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
        <h3 className="text-lg font-bold text-white">
          {initialData ? 'تعديل القالب' : 'إنشاء قالب جديد'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-slate-300 font-semibold text-sm mb-1.5 block">الاسم (Identifier)</label>
            <input
              {...register('name')}
              placeholder="e.g. welcome_email_v1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm"
              dir="ltr"
            />
            {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-slate-300 font-semibold text-sm mb-1.5 block">التصنيف (Category)</label>
            <input
              {...register('category')}
              placeholder="e.g. onboarding, alerts, billing"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm"
              dir="ltr"
            />
            {errors.category && <p className="text-rose-400 text-xs mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-semibold text-sm mb-1.5 block">وصف قصير</label>
          <input
            {...register('description')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-slate-800 rounded-xl bg-slate-950/30">
          <div>
            <label className="text-slate-300 font-semibold text-sm mb-1.5 block">نطاق القالب (Scope)</label>
            <select
              {...register('scope')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm"
            >
              <option value="global">عام لكل النظام (Global)</option>
              <option value="app">مخصص لتطبيق معين (App)</option>
            </select>
          </div>
          
          {scope === 'app' && (
            <>
              <div>
                <label className="text-slate-300 font-semibold text-sm mb-1.5 block">معرف التطبيق (App ID)</label>
                <input
                  {...register('app_id')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold text-sm mb-1.5 block">اسم التطبيق</label>
                <input
                  {...register('app_name')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="text-slate-300 font-semibold text-sm mb-1.5 block">عنوان الرسالة (Subject Pattern)</label>
          <input
            {...register('subject')}
            placeholder="أهلاً بك {{name}} في منصتنا"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-sm"
          />
          {errors.subject && <p className="text-rose-400 text-xs mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-slate-300 font-semibold text-sm block">محتوى القالب (HTML Handlebars)</label>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono bg-sky-500/10 px-2 py-1 rounded">
              <Wand2 className="w-3.5 h-3.5" />
              <span>المتغيرات المستخرجة: {extractedVars.length > 0 ? extractedVars.join(', ') : 'لا يوجد'}</span>
            </div>
          </div>
          <textarea
            {...register('html')}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-indigo-200 font-mono focus:border-indigo-500 outline-none text-sm leading-relaxed"
            dir="ltr"
          />
          {errors.html && <p className="text-rose-400 text-xs mt-1">{errors.html.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ القالب</span>
          </button>
        </div>
      </form>
    </div>
  );
};
