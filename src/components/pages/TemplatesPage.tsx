import React, { useState, useEffect } from 'react';
import { FileCode2, Plus } from 'lucide-react';
import { EmailTemplate } from '../../types';
import { templateClientService } from '../../services/template-client.service';
import { TemplateList } from '../templates/TemplateList';
import { TemplateForm } from '../templates/TemplateForm';
import { TemplatePreview } from '../templates/TemplatePreview';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [view, setView] = useState<'list' | 'form' | 'preview'>('list');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await templateClientService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setView('form');
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setView('form');
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewingTemplate(template);
    setView('preview');
  };

  const handleDelete = async (id: string) => {
    
    try {
      await templateClientService.deleteTemplate(id);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await templateClientService.duplicateTemplate(id);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to duplicate template", error);
    }
  };

  const handleSaveForm = async (data: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate) {
        await templateClientService.updateTemplate(editingTemplate.id, data);
      } else {
        await templateClientService.createTemplate(data);
      }
      await fetchTemplates();
      setView('list');
    } catch (error) {
      console.error("Failed to save template", error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-purple-400" />
            <span>إدارة قوالب البريد الإلكتروني</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء قوالب مرنة باستخدام Handlebars ومحرك استخراج المتغيرات التلقائي
          </p>
        </div>
        {view === 'list' && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء قالب جديد</span>
          </button>
        )}
      </div>

      {isLoading && view === 'list' ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          جاري تحميل القوالب...
        </div>
      ) : (
        <>
          {view === 'list' && (
            <TemplateList 
              templates={templates} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onPreview={handlePreview}
            />
          )}

          {view === 'form' && (
            <TemplateForm
              initialData={editingTemplate}
              onSave={handleSaveForm}
              onCancel={() => setView('list')}
            />
          )}

          {view === 'preview' && previewingTemplate && (
            <TemplatePreview
              template={previewingTemplate}
              onClose={() => setView('list')}
            />
          )}
        </>
      )}
    </div>
  );
};
