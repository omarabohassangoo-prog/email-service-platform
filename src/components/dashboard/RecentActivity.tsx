import React from 'react';
import { EmailJob } from '../../types';
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';

interface RecentActivityProps {
  jobs: EmailJob[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ jobs }) => {
  const recentJobs = jobs.slice(0, 6); // Show top 6

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'sent': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />;
      case 'queued': return <Clock className="w-4 h-4 text-amber-400" />;
      default: return <RefreshCw className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'sent': return 'تم الإرسال';
      case 'failed': return 'فشل';
      case 'processing': return 'جاري المعالجة';
      case 'queued': return 'في الطابور';
      default: return status;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6">النشاطات الأخيرة</h3>
      
      {recentJobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <Clock className="w-8 h-8 opacity-20" />
          <p>لا توجد نشاطات حديثة</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {recentJobs.map(job => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg ${
                  job.status === 'sent' ? 'bg-emerald-500/10' : 
                  job.status === 'failed' ? 'bg-rose-500/10' : 
                  job.status === 'processing' ? 'bg-sky-500/10' : 'bg-amber-500/10'
                }`}>
                  {getStatusIcon(job.status)}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-200 truncate">{job.to_emails[0]}</p>
                  <p className="text-xs text-slate-500 truncate">{job.subject}</p>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.status === 'sent' ? 'text-emerald-400 bg-emerald-500/10' : 
                  job.status === 'failed' ? 'text-rose-400 bg-rose-500/10' : 
                  job.status === 'processing' ? 'text-sky-400 bg-sky-500/10' : 'text-amber-400 bg-amber-500/10'
                }`}>
                  {getStatusText(job.status)}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {new Date(job.created_at).toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
