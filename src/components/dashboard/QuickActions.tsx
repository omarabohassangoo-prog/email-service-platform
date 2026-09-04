import React from 'react';
import { Send, FileText, Settings, Key } from 'lucide-react';

interface QuickActionsProps {
  onNavigateTab: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigateTab }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4 flex-1">
        
        <button 
          onClick={() => onNavigateTab('send-email')}
          className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Send className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">إرسال بريد</span>
        </button>

        <button 
          onClick={() => onNavigateTab('templates')}
          className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">إدارة القوالب</span>
        </button>

        <button 
          onClick={() => onNavigateTab('providers')}
          className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">إعدادات المزودين</span>
        </button>

        <button 
          onClick={() => onNavigateTab('api-keys')}
          className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
        >
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Key className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">مفاتيح API</span>
        </button>

      </div>
    </div>
  );
};
