import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Calendar, ArrowUpRight, CheckCircle2, 
  Eye, MousePointerClick, AlertTriangle, FileSpreadsheet, FileText, 
  Filter, RefreshCw, FileCode, CheckCircle, HelpCircle, Activity,
  TrendingUp, Clock, ChevronDown, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { AnalyticsStats } from '../types';

interface AnalyticsViewProps {
  stats: AnalyticsStats | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats: propStats }) => {
  const [dateRange, setDateRange] = useState('7d');
  const [activeStats, setActiveStats] = useState<any>(propStats);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  
  // Advanced report generator states
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchStats = async (range: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/stats?range=${range}`);
      const data = await res.json();
      if (data && !data.error) {
        setActiveStats(data);
      }
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propStats) {
      setActiveStats(propStats);
    }
  }, [propStats]);

  useEffect(() => {
    fetchStats(dateRange);
  }, [dateRange]);

  const emailData = activeStats?.emails || {
    total: 24500,
    sent: 24100,
    delivered: 23800,
    opened: 15400,
    clicked: 6800,
    bounced: 300,
    failed: 100,
    complaint: 22,
    unsubscribe: 145
  };

  const ratesData = activeStats?.rates || {
    deliveryRate: 98.7,
    openRate: 64.7,
    clickThroughRate: 28.5,
    clickToOpenRate: 44.1,
    bounceRate: 1.2,
    complaintRate: 0.09
  };

  const providerDistribution = activeStats?.providers || [
    { name: 'SMTP Primary', value: 65, color: '#6366f1' },
    { name: 'AWS SES Failover', value: 25, color: '#10b981' },
    { name: 'SendGrid Marketing', value: 10, color: '#f59e0b' },
  ];

  const chartData = activeStats?.hourly_timeline || [
    { time: '00:00', sent: 1200, delivered: 1180, opened: 700, clicked: 300, bounced: 20 },
    { time: '04:00', sent: 800, delivered: 790, opened: 450, clicked: 180, bounced: 10 },
    { time: '08:00', sent: 3400, delivered: 3350, opened: 2100, clicked: 850, bounced: 50 },
    { time: '12:00', sent: 5600, delivered: 5540, opened: 3600, clicked: 1500, bounced: 60 },
    { time: '16:00', sent: 4800, delivered: 4760, opened: 3100, clicked: 1200, bounced: 40 },
    { time: '20:00', sent: 2900, delivered: 2880, opened: 1800, clicked: 720, bounced: 20 }
  ];

  const handleExportData = async () => {
    setDownloadMsg('جاري تحضير وتصدير البيانات من الخادم...');
    try {
      const response = await fetch(`/api/v1/analytics/export?range=${dateRange}&format=${exportFormat}`);
      if (!response.ok) throw new Error('خطأ في استيراد البيانات');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const ext = exportFormat === 'csv' ? 'csv' : exportFormat === 'excel' ? 'xls' : 'txt';
      a.download = `ESP_Analytics_Export_${dateRange}_${new Date().toISOString().split('T')[0]}.${ext}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloadMsg(`تم تصدير ملف ${exportFormat.toUpperCase()} بنجاح وتحميله على جهازك.`);
      setTimeout(() => setDownloadMsg(''), 4000);
    } catch (err: any) {
      setDownloadMsg(`فشل التصدير: ${err.message}`);
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/v1/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: reportRange })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedReport(data.report);
      }
    } catch (err) {
      console.error('Error generating operational report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header Bar */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-end md:justify-start">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>نظام التحليلات والتقارير المتقدمة (Analytics & Reports Engine)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تقارير تفاعلية، تحليل الفتح والنقر (Engagement CTR)، محاكي الارتداد، وأدوات تصدير التقارير متعددة الصيغ في الوقت الفعلي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
            >
              <option value="24h">آخر 24 ساعة</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-bold"
            >
              <option value="csv">ملف CSV</option>
              <option value="excel">ملف Excel (XLS)</option>
              <option value="pdf">تقرير مطبوع (Document)</option>
            </select>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Download className="w-4 h-4" />
            <span>تصدير الآن</span>
          </button>

          <button
            onClick={() => fetchStats(dateRange)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="تحديث البيانات فورياً"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
          <span className="font-semibold">{downloadMsg}</span>
        </div>
      )}

      {/* Analytics KPI Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Delivered */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>الرسائل المسلمة (Delivered)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {emailData.delivered?.toLocaleString() || '0'}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            معدل الوصول: {ratesData.deliveryRate}%
          </span>
        </div>

        {/* Opened */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل الفتح (Open Rate)</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {emailData.opened?.toLocaleString() || '0'}
          </div>
          <span className="text-[11px] text-indigo-400 font-semibold block">
            نسبة التفاعل: {ratesData.openRate}%
          </span>
        </div>

        {/* Clicked */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل النقر (CTR)</span>
            <MousePointerClick className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {emailData.clicked?.toLocaleString() || '0'}
          </div>
          <span className="text-[11px] text-sky-400 font-semibold block">
            نسبة النقر للفتح: {ratesData.clickToOpenRate}%
          </span>
        </div>

        {/* Bounced */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>الارتدادات (Bounce Rate)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {emailData.bounced?.toLocaleString() || '0'}
          </div>
          <span className="text-[11px] text-rose-400 font-semibold block">
            النسبة المئوية: {ratesData.bounceRate}%
          </span>
        </div>

      </div>

      {/* Visual Funnel and Provider Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Engagement Funnel Area / Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              تحديث في الوقت الفعلي (Real-Time Stats)
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              <span>معدل النشاط والتدفق الزمني للمراسلات</span>
            </h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', textAlign: 'right' }} />
                <Area type="monotone" dataKey="sent" name="تم الإرسال" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="opened" name="المفتوح" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOpen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Usage Distribution Pie */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>توزيع معالجة المزودات</span>
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {providerDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {providerDistribution.map((p: any) => (
              <div key={p.id || p.name} className="flex justify-between items-center text-slate-300">
                <span className="font-mono font-bold">{p.value}%</span>
                <span className="flex items-center gap-2">
                  <span>{p.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#6366f1' }} />
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Operational Reports Panel */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <select
                value={reportRange}
                onChange={(e) => setReportRange(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none font-bold"
              >
                <option value="daily">يومي (Daily Report)</option>
                <option value="weekly">أسبوعي (Weekly Report)</option>
                <option value="monthly">شهري (Monthly Report)</option>
              </select>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد تقرير تشغيلي</span>
            </button>
          </div>

          <h3 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <span>نظام توليد التقارير التشغيلية المتقدمة (generateReport)</span>
          </h3>
        </div>

        {isGeneratingReport ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">جاري تحليل البيانات التاريخية وتوليد التقرير...</h4>
          </div>
        ) : generatedReport ? (
          <div className="bg-slate-950 rounded-xl border border-emerald-500/10 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                تاريخ التوليد: {new Date(generatedReport.generatedAt).toLocaleString('ar-EG')}
              </span>
              <h4 className="font-bold text-white text-sm">{generatedReport.name}</h4>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 leading-relaxed text-xs">
              {generatedReport.summary}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">إجمالي المعالجة</span>
                <span className="text-base font-black font-mono text-white mt-1 block">{generatedReport.metrics.total}</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">معدل التسليم</span>
                <span className="text-base font-black font-mono text-emerald-400 mt-1 block">{generatedReport.rates.deliveryRate}%</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">معدل الفتح</span>
                <span className="text-base font-black font-mono text-indigo-400 mt-1 block">{generatedReport.rates.openRate}%</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">نسبة الارتداد</span>
                <span className="text-base font-black font-mono text-rose-400 mt-1 block">{generatedReport.rates.bounceRate}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl">
            <HelpCircle className="w-10 h-10 text-slate-700 mb-3" />
            <h4 className="text-sm font-semibold text-slate-400">لا يوجد تقرير مولّد حالياً</h4>
            <p className="text-xs text-slate-500 mt-1">اختر نطاق التقارير (يومي، أسبوعي، أو شهري) من القائمة المجاورة، ثم اضغط على "توليد تقرير تشغيلي" لإجراء معالجة شاملة للبيانات وتوصيات الأمان.</p>
          </div>
        )}
      </div>

    </div>
  );
};
