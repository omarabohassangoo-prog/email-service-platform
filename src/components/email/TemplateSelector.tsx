import React from 'react';
import { EmailTemplate } from '../../types';
import { FileCode2 } from 'lucide-react';

interface TemplateSelectorProps {
  templates: EmailTemplate[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, selectedTemplateId, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="text-slate-300 font-semibold text-sm flex items-center gap-2">
        <FileCode2 className="w-4 h-4 text-purple-400" />
        <span>استخدام قالب (اختياري)</span>
      </label>
      <select
        value={selectedTemplateId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
      >
        <option value="">-- بدون قالب (محتوى مباشر) --</option>
        {templates.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.name}
          </option>
        ))}
      </select>
    </div>
  );
};
