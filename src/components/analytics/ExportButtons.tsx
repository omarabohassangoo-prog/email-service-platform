import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';

export const ExportButtons: React.FC = () => {
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    analyticsService.exportData(format);
    setExportedFormat(format);
    setTimeout(() => setExportedFormat(null), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" dir="rtl">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>تصدير التقارير والبيانات (Export Reports)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">تصدير السجلات الكاملة بصيغ متعددة جاهزة للأرشفة والمراجعة</p>
      </div>

      <div className="flex items-center gap-3">
        {exportedFormat && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تم تصدير ملف {exportedFormat.toUpperCase()} بنجاح!</span>
          </div>
        )}

        <button
          onClick={() => handleExport('csv')}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-700"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>تصدير CSV</span>
        </button>

        <button
          onClick={() => handleExport('excel')}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>تصدير Excel</span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير PDF</span>
        </button>
      </div>
    </div>
  );
};
