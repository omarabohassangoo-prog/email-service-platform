import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, RefreshCw, Send, ShieldCheck, Activity } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const EmailStatusPage: React.FC = () => {
  const [jobId, setJobId] = useState('job_101');
  const [searchedData, setSearchedData] = useState<any | null>({
    jobId: 'job_101',
    status: 'sent',
    recipient: 'user1@company.com',
    providerUsed: 'Primary SMTP Cluster (smtp.sendgrid.net)',
    retryCount: 0,
    events: [
      { type: 'queued', timestamp: '2026-09-04 14:00:00', detail: 'تم التضمين في طابور Bull Queue' },
      { type: 'processing', timestamp: '2026-09-04 14:00:01', detail: 'بدء المعالجة في Worker thread' },
      { type: 'sent', timestamp: '2026-09-04 14:00:02', detail: 'تم الإرسال بنجاح وتلقي 250 OK' }
    ]
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedData({
      jobId: jobId,
      status: 'sent',
      recipient: 'searched_recipient@domain.com',
      providerUsed: 'AWS SES Backup Cluster',
      retryCount: 0,
      events: [
        { type: 'queued', timestamp: new Date(Date.now() - 3000).toLocaleTimeString(), detail: 'تم الإدراج بالطابور' },
        { type: 'processing', timestamp: new Date(Date.now() - 2000).toLocaleTimeString(), detail: 'بدء التسليم' },
        { type: 'sent', timestamp: new Date().toLocaleTimeString(), detail: 'تمت العملية بنجاح' }
      ]
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>الاستعلام عن حالة البريد والسجل (Email Job Status Tracker)</span>
        </h2>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="أدخل معرف المهمة (مثل job_101)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 outline-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>استعلام</span>
          </button>
        </form>
      </div>

      {searchedData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">معرف المهمة</span>
              <h3 className="text-sm font-bold text-indigo-300 font-mono">{searchedData.jobId}</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase">
              {searchedData.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">المستلم:</span>
              <span className="text-white font-bold">{searchedData.recipient}</span>
            </div>
            <div>
              <span className="text-slate-500 block">المزود المستخدم:</span>
              <span className="text-white font-bold">{searchedData.providerUsed}</span>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300">مسار الأحداث والتطور (Event Trail):</h4>
            <div className="space-y-2 border-r-2 border-indigo-500/30 pr-3 mr-1">
              {searchedData.events.map((ev: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase font-mono">{ev.type}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{ev.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
