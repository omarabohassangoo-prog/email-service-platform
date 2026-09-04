import React, { useState } from 'react';
import { 
  Layers, Play, Pause, RefreshCw, Trash2, Search, Filter, 
  Clock, AlertCircle, CheckCircle2, RotateCcw, Eye, X, Send, ChevronRight
} from 'lucide-react';
import { EmailJob, QueueMetrics, JobPriority } from '../types';

interface QueueMonitorProps {
  jobs: EmailJob[];
  queueMetrics: QueueMetrics | null;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onRefresh: () => void;
  onRetryJob: (jobId: string) => void;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({
  jobs,
  queueMetrics,
  onPauseQueue,
  onResumeQueue,
  onRefresh,
  onRetryJob
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'queued' | 'processing' | 'sent' | 'failed' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<EmailJob | null>(null);

  const isPaused = queueMetrics?.paused || false;

  const filteredJobs = jobs.filter(job => {
    if (activeFilter !== 'all') {
      if (activeFilter === 'queued' && job.status !== 'queued') return false;
      if (activeFilter === 'processing' && job.status !== 'processing') return false;
      if (activeFilter === 'sent' && job.status !== 'sent') return false;
      if (activeFilter === 'failed' && job.status !== 'failed') return false;
      if (activeFilter === 'scheduled' && job.status !== 'scheduled') return false;
    }
    if (priorityFilter !== 'all' && job.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSubject = job.subject.toLowerCase().includes(q);
      const matchTo = job.to_emails.some(e => e.toLowerCase().includes(q));
      const matchId = job.job_id.toLowerCase().includes(q) || job.id.toLowerCase().includes(q);
      return matchSubject || matchTo || matchId;
    }
    return true;
  });

  const countByStatus = {
    queued: jobs.filter(j => j.status === 'queued').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    sent: jobs.filter(j => j.status === 'sent').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Control Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>مراقبة وإدارة طوابير Bull Queue</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPaused 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isPaused ? 'المعالجة موقوفة مؤقتاً' : 'عمال الطابور نشطة (Worker Fleet Active)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة طوابير الرسائل حسب الأولوية (High / Normal / Low) مع معالجة متوازية وإعادة المحاولة التلقائية
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isPaused ? (
            <button
              onClick={onResumeQueue}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-4 h-4" />
              <span>استئناف المعالجة</span>
            </button>
          ) : (
            <button
              onClick={onPauseQueue}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>إيقاف مؤقت</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Queue Filter Stats Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { id: 'all', label: 'جميع المهام', count: jobs.length, color: 'indigo' },
          { id: 'queued', label: 'في الانتظار', count: countByStatus.queued, color: 'amber' },
          { id: 'processing', label: 'قيد المعالجة', count: countByStatus.processing, color: 'sky' },
          { id: 'sent', label: 'تم التسليم', count: countByStatus.sent, color: 'emerald' },
          { id: 'failed', label: 'فشلت الإرسال', count: countByStatus.failed, color: 'rose' },
          { id: 'scheduled', label: 'مجدولة للأفق', count: countByStatus.scheduled, color: 'purple' },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`p-3.5 rounded-xl text-right transition-all border ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-[11px] text-slate-400">{tab.label}</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {tab.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Priority Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالبريد، الموضوع، أو ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">تصفية الأولوية:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">جميع الأولويات</option>
            <option value="high">مرتفعة (High Priority)</option>
            <option value="normal">عادية (Normal Priority)</option>
            <option value="low">منخفضة (Low Priority)</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold">Job ID</th>
                <th className="py-3.5 px-4 font-semibold">المستلم (To)</th>
                <th className="py-3.5 px-4 font-semibold">الموضوع</th>
                <th className="py-3.5 px-4 font-semibold">الأولوية</th>
                <th className="py-3.5 px-4 font-semibold">الحالة</th>
                <th className="py-3.5 px-4 font-semibold">المحاولات</th>
                <th className="py-3.5 px-4 font-semibold">الوقت</th>
                <th className="py-3.5 px-4 font-semibold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد مهام مطابقة للفلتر المحدد
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">{job.job_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{job.to_emails[0]}</td>
                    <td className="py-3 px-4 text-slate-200 max-w-xs truncate">{job.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.priority === 'high' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : job.priority === 'normal' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {job.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        job.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : job.status === 'processing'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse'
                          : job.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          job.status === 'sent' ? 'bg-emerald-400' : job.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        {job.status === 'sent' ? 'تم الإرسال' : job.status === 'processing' ? 'جاري المعالجة' : job.status === 'failed' ? 'فشلت' : 'في الانتظار'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {job.retry_count} / {job.max_retries}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(job.created_at).toLocaleTimeString('ar-SA')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {job.status === 'failed' && (
                          <button
                            onClick={() => onRetryJob(job.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="إعادة المحاولة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Job Detail View */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>تفاصيل المهمة: {selectedJob.job_id}</span>
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">المستلم:</span>
                <span className="font-mono text-slate-200 font-semibold">{selectedJob.to_emails.join(', ')}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">الموضوع:</span>
                <span className="text-slate-200 font-semibold">{selectedJob.subject}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">مزود الإرسال المستخدم:</span>
                <span className="font-mono text-indigo-300">{selectedJob.provider_id || 'لم يحدد بعد'}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Message ID:</span>
                <span className="font-mono text-slate-300 truncate block">{selectedJob.message_id || '-'}</span>
              </div>
            </div>

            {selectedJob.error_message && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                <span className="font-bold block text-rose-400">تفاصيل الخطأ (Stack Trace):</span>
                <p className="font-mono mt-1">{selectedJob.error_message}</p>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">محتوى البريد (HTML Content):</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto">
                {selectedJob.html_content || selectedJob.text_content || 'لا يوجد محتوى'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
