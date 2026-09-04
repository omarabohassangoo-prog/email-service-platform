import React, { useEffect, useState } from 'react';
import { SystemHealth, QueueMetrics, EmailJob, AnalyticsStats } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { StatsCards } from './dashboard/StatsCards';
import { ActivityChart } from './dashboard/ActivityChart';
import { RecentActivity } from './dashboard/RecentActivity';
import { QuickActions } from './dashboard/QuickActions';
import { Activity, RefreshCw } from 'lucide-react';

interface DashboardOverviewProps {
  stats: AnalyticsStats | null;
  health: SystemHealth | null;
  queue: QueueMetrics | null;
  recentJobs: EmailJob[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats: initialStats,
  health,
  queue,
  recentJobs: initialJobs,
  onRefresh,
  onNavigateTab
}) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(initialStats);
  const [recentJobs, setRecentJobs] = useState<EmailJob[]>(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [newStats, newJobs] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getRecentJobs().catch(() => [])
      ]);
      if (newStats) setStats(newStats);
      if (newJobs) setRecentJobs(newJobs);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    if (initialStats) setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    if (initialJobs.length > 0) setRecentJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    fetchDashboardData(); // initial fetch for jobs
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    onRefresh(); // Also trigger app-level refresh
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>لوحة التحكم الرئيسية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة لحظية لمعدل الإرسال وحالة الخدمات المصغرة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-medium transition-all border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2">
          <ActivityChart stats={stats} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions onNavigateTab={onNavigateTab} />
        </div>

      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <RecentActivity jobs={recentJobs} />
        </div>

        {/* Keeping the legacy microservices health cards for flavor, adapted */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col h-full">
          <h3 className="text-lg font-bold text-white mb-6">حالة النظام</h3>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">قاعدة البيانات</p>
                <p className="text-xs text-slate-400 mt-1">PostgreSQL</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${health?.checks?.postgres?.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {health?.checks?.postgres?.status === 'connected' ? 'متصل' : 'مفصول'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">الكاش والطابور</p>
                <p className="text-xs text-slate-400 mt-1">Redis</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${health?.checks?.redis_queue?.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {health?.checks?.redis_queue?.status === 'connected' ? 'متصل' : 'مفصول'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">بوابة API</p>
                <p className="text-xs text-slate-400 mt-1">وقت العمل: {health?.checks?.api_gateway?.uptime_sec || 0} ثانية</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${health?.checks?.api_gateway?.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {health?.checks?.api_gateway?.status === 'online' ? 'نشط' : 'بطيء'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
