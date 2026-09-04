import React, { useState } from 'react';
import { EmailTemplate } from '../../types';
import { FileCode2, Copy, Trash2, Edit3, Globe, AppWindow, Play } from 'lucide-react';

interface TemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (template: EmailTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ templates, onEdit, onDuplicate, onDelete, onPreview }) => {
  const [filterScope, setFilterScope] = useState<'all' | 'global' | 'app'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(t => {
    if (filterScope !== 'all' && t.scope !== filterScope) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filterScope}
          onChange={(e) => setFilterScope(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-2.5 focus:border-indigo-500 outline-none text-sm"
        >
          <option value="all">جميع النطاقات</option>
          <option value="global">عام (Global)</option>
          <option value="app">مخصص لتطبيق (App)</option>
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-2.5 focus:border-indigo-500 outline-none text-sm"
        >
          <option value="all">جميع التصنيفات</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(tpl => (
          <div key={tpl.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col h-full group">
            <div className="flex items-start justify-between mb-3 border-b border-slate-800/60 pb-3">
              <div>
                <h3 className="font-bold text-white text-base truncate pr-2">{tpl.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    {tpl.category}
                  </span>
                  {tpl.scope === 'global' ? (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" /> عام
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AppWindow className="w-3 h-3" /> تطبيق ({tpl.app_name || tpl.app_id})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-2 mb-4">
              <p className="text-sm text-slate-300 font-semibold truncate">
                {tpl.subject}
              </p>
              {tpl.description && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {tpl.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {tpl.variables?.slice(0, 3).map(v => (
                  <span key={v} className="text-[10px] font-mono bg-slate-950 text-sky-400 border border-slate-800 px-1.5 py-0.5 rounded">
                    {'{'}{'{'}{v}{'}'}{'}'}
                  </span>
                ))}
                {(tpl.variables?.length || 0) > 3 && (
                  <span className="text-[10px] font-mono bg-slate-950 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                    +{(tpl.variables?.length || 0) - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <button 
                onClick={() => onPreview(tpl)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" /> معاينة
              </button>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(tpl)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors" title="تعديل">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDuplicate(tpl.id)} className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-md hover:bg-emerald-500/20 transition-colors" title="نسخ">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(tpl.id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-md hover:bg-rose-500/20 transition-colors" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>لا توجد قوالب تطابق عوامل التصفية.</p>
          </div>
        )}
      </div>
    </div>
  );
};
