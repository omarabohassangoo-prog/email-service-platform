import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { analyticsService, AnalyticsSummary } from '../../services/analytics.service';
import { AnalyticsCharts } from '../analytics/AnalyticsCharts';
import { ReportsTable } from '../analytics/ReportsTable';
import { ExportButtons } from '../analytics/ExportButtons';
import { ScheduleReport } from '../analytics/ScheduleReport';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await analyticsService.getAnalyticsData();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin ml-2 text-indigo-400" />
        <span>جاري تحميل بيانات التحليلات والتقارير...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>لوحة التحليلات والتقارير الشاملة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مؤشرات أداء التسليم، معدلات الارتداد، والتوافق مع مزودي البريد الإلكتروني العالميين
          </p>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">إجمالي المرسل اليوم</span>
          <div className="text-2xl font-bold text-white font-mono">{data.totalSent.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-400 font-bold">بزيادة 12% عن الأمس</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">نسبة التسليم الناجح</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{data.deliveryRate}%</div>
          <p className="text-[10px] text-slate-500">أعلى من المعيار القياسي للصناعة</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">نسبة الارتداد (Bounce Rate)</span>
          <div className="text-2xl font-bold text-rose-400 font-mono">{data.bounceRate}%</div>
          <p className="text-[10px] text-emerald-400 font-bold">آمن وتحت الحد الأقصى</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">توافق Gmail & Outlook</span>
          <div className="text-2xl font-bold text-sky-400 font-mono">{data.gmailCompatibility}%</div>
          <p className="text-[10px] text-slate-500">استقرار كامل في البوابات</p>
        </div>
      </div>

      {/* Charts & Compatibility */}
      <AnalyticsCharts 
        timeline={data.timeline} 
        gmailComp={data.gmailCompatibility} 
        outlookComp={data.outlookCompatibility} 
      />

      {/* Interactive Reports Table */}
      <ReportsTable reports={data.reports} />

      {/* Export & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExportButtons />
        <ScheduleReport />
      </div>

    </div>
  );
};
