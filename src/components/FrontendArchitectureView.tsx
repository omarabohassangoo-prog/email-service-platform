import React, { useState } from 'react';
import { 
  Layout, Layers, Smartphone, Monitor, CheckSquare, Check, User, 
  Key, Send, Activity, FileCode2, Server, Terminal, BarChart3,
  Database, RefreshCw, ShieldCheck, ArrowRight, Code2, Lock
} from 'lucide-react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';

// Pages Import
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmailSendPage } from './pages/EmailSendPage';
import { EmailStatusPage } from './pages/EmailStatusPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { SdkTestPage } from './pages/SdkTestPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const FrontendInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'redux' | 'network' | 'criteria'>('pages');
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');

  const reduxState = useSelector((state: RootState) => state);

  const [criteria, setCriteria] = useState([
    { id: '1', title: 'إنشاء وتجهيز جميع الصفحات الـ 8 الرئيسية المطلوبة', completed: true, detail: 'login, dashboard, email/send, email/status, templates, settings, sdk-test, analytics' },
    { id: '2', title: 'التنقل المباشر والتفاعلي بين الصفحات (App Router Simulator)', completed: true, detail: 'دعم المحاكاة مع توفير تحكم متجاوب وهيكل موحد' },
    { id: '3', title: 'ربط وإدارة الحالة عبر Redux Toolkit Store بالكامل', completed: true, detail: 'تفعيل slices لـ auth, email, template, settings ومفتش حالة حي' },
    { id: '4', title: 'بناء خدمة عميل API باعتراضات Axios (Request & Response Interceptors)', completed: true, detail: 'إحقاق الترويسات ومفاتيح x-api-key وتوكنات Bearer تلقائياً' },
    { id: '5', title: 'تصميم متجاوب بالكامل (Responsive UI/UX) مع إعداد Tailwind CSS', completed: true, detail: 'دعم شاشات الجوال والحاسوب مع مكونات موحدة ورسوم بيانية' }
  ]);

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const routesMap = [
    { path: '/dashboard', name: 'لوحة التحكم الرئيسية', icon: Layout },
    { path: '/login', name: 'صفحة تسجيل الدخول', icon: Key },
    { path: '/email/send', name: 'صفحة إرسال البريد', icon: Send },
    { path: '/email/status', name: 'حالة البريد', icon: Activity },
    { path: '/templates', name: 'إدارة القوالب', icon: FileCode2 },
    { path: '/settings', name: 'إعدادات الخدمة', icon: Server },
    { path: '/sdk-test', name: 'اختبار SDK', icon: Terminal },
    { path: '/analytics', name: 'التحليلات والتقارير', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Task Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: مرتفع (High)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 1 - التصميم الأساسي (P1-T4)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 24 ساعة
            </span>
          </div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-400" />
            <span>تصميم الواجهة الأمامية (UI/UX - React App Router Architecture)</span>
          </h2>
          <p className="text-xs text-slate-400">
            تجهيز الصفحات الـ 8 الرئيسية مدمجة مع Redux Toolkit وخدمات Axios وتصميم متجاوب
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span>المسؤول: مطور أمامي</span>
        </div>
      </div>

      {/* Primary View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pages' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. مستعرض الصفحات التفاعلي (App Router - 8 Pages)
        </button>

        <button
          onClick={() => setActiveTab('redux')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'redux' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. مفتش حالة Redux Toolkit Store الحي
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'network' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. خدمة عميل Axios API Interceptors
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'criteria' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. معايير القبول (Acceptance Criteria)
        </button>
      </div>

      {/* TAB 1: Pages Explorer */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          
          {/* App Bar Router Switcher */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {routesMap.map(r => {
                const Icon = r.icon;
                const isActive = currentRoute === r.path;
                return (
                  <button
                    key={r.path}
                    onClick={() => setCurrentRoute(r.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.name}</span>
                    <span className="text-[10px] font-mono opacity-70">({r.path})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Page Sandbox Render */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 min-h-[420px]">
            {currentRoute === '/login' && <LoginPage />}
            {currentRoute === '/dashboard' && <DashboardPage />}
            {currentRoute === '/email/send' && <EmailSendPage />}
            {currentRoute === '/email/status' && <EmailStatusPage />}
            {currentRoute === '/templates' && <TemplatesPage />}
            {currentRoute === '/settings' && <SettingsPage />}
            {currentRoute === '/sdk-test' && <SdkTestPage />}
            {currentRoute === '/analytics' && <AnalyticsPage />}
          </div>

        </div>
      )}

      {/* TAB 2: Redux Inspector */}
      {activeTab === 'redux' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>شجرة حالة Redux Toolkit (Live State Inspection)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تحديث فوري للحالة المركزية للتطبيق مع كل تفاعل بالصفحات</p>
            </div>

            <span className="text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold">
              4 Slices: auth, email, template, settings
            </span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed max-h-[450px]">
            <code>{JSON.stringify(reduxState, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* TAB 3: Axios Client */}
      {activeTab === 'network' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-sky-400" />
              <span>تكوين عميل Axios ومميزات المعالجات المشتركة Interceptors</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">الحقن التلقائي لمفاتيح API وعناوين JWT مع معالجة الأخطاء السريعة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-bold block">1. Request Interceptor:</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                <li>استخراج `apiKey` و `accessToken` تلقائياً من Redux Store.</li>
                <li>إضافة ترويسة `x-api-key` لطلبات الخدمة.</li>
                <li>إضافة ترويسة Authorization: Bearer JWT_TOKEN للطلبات الإدارية.</li>
                <li>تسجيل سجلات التشخيص (Diagnostic Logs).</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block">2. Response Interceptor:</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                <li>تنسيق المخرجات وإرجاع أجسام الـ JSON مباشرة.</li>
                <li>التقاط أخطاء الـ 401 Unauthorized لتجديد الرموز.</li>
                <li>معالجة أخطاء الـ 429 Rate Limit ومحاكاة التراجع التأسيسي.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Criteria */}
      {activeTab === 'criteria' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>معايير القبول والاعتماد (Acceptance Criteria Checklist)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">التحقق من اكتمال كافة متطلبات مهمة P1-T4</p>
            </div>

            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              مكتمل {criteria.filter(c => c.completed).length} / {criteria.length}
            </span>
          </div>

          <div className="space-y-3">
            {criteria.map(item => (
              <div
                key={item.id}
                onClick={() => toggleCriterion(item.id)}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold mt-0.5 ${
                  item.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                }`}>
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export const FrontendArchitectureView: React.FC = () => {
  return (
    <Provider store={store}>
      <FrontendInner />
    </Provider>
  );
};
