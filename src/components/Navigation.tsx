import React from 'react';
import { 
  LayoutDashboard, Layers, FileCode2, Key, Server, Terminal, Send, 
  BarChart3, ShieldAlert, LogIn, LogOut, Activity, Zap, CheckCircle2, PauseCircle, Library, Flame, Cloud, Rocket, HardDrive, Database, FolderTree, Boxes, Network, Layout, Calendar, ShieldCheck
} from 'lucide-react';
import { SystemHealth, QueueMetrics } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  health: SystemHealth | null;
  queueMetrics: QueueMetrics | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isAuthenticated,
  onOpenAuth,
  onLogout,
  health,
  queueMetrics
}) => {
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم والعمليات', icon: LayoutDashboard },
    { id: 'readiness', label: 'شروط التحقق والجاهزية للنشر (QA-READY)', icon: ShieldCheck },
    { id: 'queue', label: 'مراقبة الطوابير (Bull Queue)', icon: Layers, badge: queueMetrics?.waiting || 0 },
    { id: 'templates', label: 'قوالب البريد الإلكتروني', icon: FileCode2 },
    { id: 'api-keys', label: 'مفاتيح API والأمان', icon: Key },
    { id: 'providers', label: 'مزودات الخدمة (Failover)', icon: Server },
    { id: 'schedules', label: 'جدولة البريد والمهام (Scheduling)', icon: Calendar },
    { id: 'performance', label: 'إجهاد والأداء (HP-ESP)', icon: Flame },
    { id: 'deliverability', label: 'معايير التسليم وتجنب الحظر (DLV-ESP)', icon: Zap },
    { id: 'vercel', label: 'استضافة Vercel وحجم الملفات (VER-ESP)', icon: Cloud },
    { id: 'devenv', label: 'إعداد البيئة والبنية التحتية (P0-T1)', icon: HardDrive },
    { id: 'dbschema', label: 'قاعدة البيانات والـ Schema (P0-T2)', icon: Database },
    { id: 'rediscache', label: 'Redis والتخزين المؤقت (P0-T3)', icon: Zap },
    { id: 'projectstruct', label: 'هيكل المشروع والـ Configs (P0-T4)', icon: FolderTree },
    { id: 'entitiesdesign', label: 'تصميم الكيانات والعلاقات (P1-T1)', icon: Database },
    { id: 'coreservices', label: 'الخدمات الأساسية و DI (P1-T2)', icon: Boxes },
    { id: 'apiroutes', label: 'واجهات API وميدلوير (P1-T3)', icon: Network },
    { id: 'frontendui', label: 'الواجهة الأمامية UI/UX (P1-T4)', icon: Layout },
    { id: 'deployment', label: 'خطة النشر والـ CI/CD (DEP-ESP)', icon: Rocket },
    { id: 'send-email', label: 'إرسال بريد (Send Email)', icon: Send },
    { id: 'analytics', label: 'التحليلات والتقارير', icon: BarChart3 },
    { id: 'risk', label: 'سجل المخاطر (RISK-ESP)', icon: ShieldAlert },
    { id: 'libraries', label: 'المكتبات والتسهيلات (LIB-ESP)', icon: Library },
    { id: 'audit', label: 'سجل الأمان والعمليات', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  خدمة البريد الإلكتروني المتكاملة
                </h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
                  v1.0 ESP API
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                نظام موزع عالي الأداء مع طوابير ذكية وتغطية 99.99% Uptime
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics Header Chips */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse text-xs">
            {/* Uptime Chip */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">التوفر:</span>
              <span className="text-emerald-400 font-mono font-bold">99.99%</span>
            </div>

            {/* Throughput Chip */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">الإنتاجية:</span>
              <span className="text-indigo-300 font-mono font-bold">100 بريد/ثانية</span>
            </div>

            {/* Queue State Chip */}
            <div className="flex items-center space-x-2 space-x-reverse bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              {queueMetrics?.paused ? (
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              <span className="text-slate-400">الطابور:</span>
              <span className="text-slate-200 font-mono font-bold">
                {queueMetrics?.waiting || 0} في الانتظار
              </span>
            </div>
          </div>

          {/* User Auth Action */}
          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className="hidden md:inline-block text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 font-medium">
                  مسؤول النظام (Admin)
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 space-x-reverse px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول المسؤول</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 space-x-reverse overflow-x-auto pb-2 scrollbar-none pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 space-x-reverse px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                    isActive ? 'bg-white text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
