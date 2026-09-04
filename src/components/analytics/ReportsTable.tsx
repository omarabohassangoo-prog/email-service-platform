import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ReportItem {
  id: string;
  timestamp: string;
  appName: string;
  recipient: string;
  subject: string;
  status: 'delivered' | 'bounced' | 'pending';
  provider: string;
}

interface ReportsTableProps {
  reports: ReportItem[];
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appFilter, setAppFilter] = useState<string>('all');

  const apps = Array.from(new Set(reports.map(r => r.appName)));

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (appFilter !== 'all' && r.appName !== appFilter) return false;
    if (searchQuery && !r.recipient.toLowerCase().includes(searchQuery.toLowerCase()) && !r.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>سجل التقارير التفاعلي (Interactive Activity Reports)</span>
        </h3>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالبريد أو الموضوع..."
              className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white focus:border-indigo-500 outline-none w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="delivered">تم التسليم (Delivered)</option>
            <option value="bounced">مرتد (Bounced)</option>
          </select>

          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none"
          >
            <option value="all">كل التطبيقات</option>
            {apps.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4">التاريخ والوقت</th>
              <th className="py-3 px-4">التطبيق</th>
              <th className="py-3 px-4">المستلم</th>
              <th className="py-3 px-4">الموضوع</th>
              <th className="py-3 px-4">مزود الإرسال</th>
              <th className="py-3 px-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {filteredReports.map(rep => (
              <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-400">{rep.timestamp}</td>
                <td className="py-3 px-4">
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] text-indigo-300 font-sans">
                    {rep.appName}
                  </span>
                </td>
                <td className="py-3 px-4 text-white font-semibold">{rep.recipient}</td>
                <td className="py-3 px-4 text-slate-300 font-sans">{rep.subject}</td>
                <td className="py-3 px-4 text-slate-400">{rep.provider}</td>
                <td className="py-3 px-4">
                  {rep.status === 'delivered' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                      <CheckCircle2 className="w-3 h-3" /> تم التسليم
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                      <AlertTriangle className="w-3 h-3" /> مرتد
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  لا توجد تقارير مطابقة لعوامل التصفية.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
