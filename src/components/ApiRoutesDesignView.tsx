import React, { useState } from 'react';
import { 
  Network, Server, Play, Check, Copy, CheckSquare, ShieldCheck, 
  Terminal, User, Code2, ArrowRight, RefreshCw, FileText, Send,
  Lock, Zap, Database, Layers, CheckCircle2, Download, ExternalLink
} from 'lucide-react';
import openApiDoc from '../docs/openapi.json';

export const ApiRoutesDesignView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'routes' | 'middlewares' | 'tester' | 'openapi' | 'criteria'>('routes');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interactive API Tester State
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [testPath, setTestPath] = useState<string>('/api/email/send');
  const [testHeaders, setTestHeaders] = useState<string>('{\n  "x-api-key": "esp_live_secret_key_8899",\n  "Content-Type": "application/json"\n}');
  const [testBody, setTestBody] = useState<string>('{\n  "to": ["user@example.com"],\n  "subject": "رسالة ترحيب اختبورية",\n  "html": "<h1>أهلاً بك</h1>",\n  "priority": "high"\n}');
  const [isSending, setIsSending] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);

  // Acceptance Criteria Checklist
  const [criteria, setCriteria] = useState([
    { id: '1', title: 'إنشاء جميع المسارات الـ 16 المطلوبة باستخدام Express Router', completed: true, detail: 'تقسيم المسارات لملفات auth, email, templates, admin, sdk' },
    { id: '2', title: 'تنسيق وتشغيل برمجيات الوسط الوسيط (Middlewares) للمصادقة والتحقق', completed: true, detail: 'تغطية auth.middleware, validation.middleware, compliance, error' },
    { id: '3', title: 'إمكانية تجربة واختبار كافة المسارات بدعم استجابات الـ JSON السريعة', completed: true, detail: 'دعم محاكي Postman واختبار الاستجابات وأكواد الحالة' },
    { id: '4', title: 'توثيق كود الخدمة باستخدام مواصفات OpenAPI 3.0 الكاملة', completed: true, detail: 'إنشاء وتضمين openapi.json الشامل لكافة المسارات والمخططات' },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleExecuteApiTest = async () => {
    setIsSending(true);
    setResponseResult(null);

    const startTime = performance.now();

    try {
      let parsedHeaders = {};
      let parsedBody = undefined;

      try {
        if (testHeaders) parsedHeaders = JSON.parse(testHeaders);
        if (testBody && ['POST', 'PUT', 'PATCH'].includes(testMethod)) {
          parsedBody = JSON.parse(testBody);
        }
      } catch (e: any) {
        throw new Error('خطأ في تنسيق JSON للمدخلات: ' + e.message);
      }

      const res = await fetch(testPath, {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders
        },
        body: parsedBody ? JSON.stringify(parsedBody) : undefined
      });

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      const data = await res.json();

      setResponseResult({
        status: res.status,
        statusText: res.statusText,
        durationMs,
        headers: {
          'content-type': res.headers.get('content-type'),
          'x-ratelimit-limit': res.headers.get('x-ratelimit-limit'),
          'x-esp-compliance-policy': res.headers.get('x-esp-compliance-policy')
        },
        body: data
      });
    } catch (err: any) {
      setResponseResult({
        status: 500,
        error: err.message,
        durationMs: Math.round(performance.now() - startTime)
      });
    } finally {
      setIsSending(false);
    }
  };

  const routesList = [
    { category: 'auth', method: 'POST', path: '/api/auth/login', desc: 'تسجيل دخول المسؤول وتوليد رموز JWT', auth: 'Public' },
    { category: 'auth', method: 'POST', path: '/api/auth/refresh', desc: 'تحديث رمز الوصول عبر Refresh Token', auth: 'Public' },
    { category: 'email', method: 'POST', path: '/api/email/send', desc: 'إرسال بريد مفرد أو مع قالب', auth: 'API Key' },
    { category: 'email', method: 'GET', path: '/api/email/status/:id', desc: 'استرجاع حالة وسجل أحداث الرسالة', auth: 'API Key' },
    { category: 'email', method: 'POST', path: '/api/email/bulk', desc: 'إرسال دفعة بريدية جماعية', auth: 'API Key' },
    { category: 'email', method: 'POST', path: '/api/email/schedule', desc: 'جدولة إرسال بريد في وقت مستقبلي', auth: 'API Key' },
    { category: 'templates', method: 'GET', path: '/api/templates', desc: 'قائمة قوالب البريد الإلكتروني', auth: 'API Key' },
    { category: 'templates', method: 'POST', path: '/api/templates', desc: 'إنشاء قالب بريد جديد', auth: 'API Key' },
    { category: 'templates', method: 'GET', path: '/api/templates/:id', desc: 'تفاصيل قالب محدد بالمعرف', auth: 'API Key' },
    { category: 'templates', method: 'PUT', path: '/api/templates/:id', desc: 'تحديث بيانات قالب موجود', auth: 'API Key' },
    { category: 'templates', method: 'DELETE', path: '/api/templates/:id', desc: 'حذف قالب بريد إلكتروني', auth: 'API Key' },
    { category: 'admin', method: 'GET', path: '/api/admin/settings', desc: 'استرجاع إعدادات النظام وتكامل المزودين', auth: 'Bearer JWT' },
    { category: 'admin', method: 'PUT', path: '/api/admin/settings', desc: 'تحديث إعدادات المنصة والأمن', auth: 'Bearer JWT' },
    { category: 'admin', method: 'GET', path: '/api/admin/health', desc: 'فحص صحة الخادم والمزودين والطابور', auth: 'Public' },
    { category: 'admin', method: 'GET', path: '/api/admin/stats', desc: 'إحصائيات الإرسال ونسبة النجاح', auth: 'Bearer JWT' },
    { category: 'sdk', method: 'POST', path: '/api/sdk/test', desc: 'اختبار الاتصال والتوقيع للـ SDK', auth: 'API Key' }
  ];

  const filteredRoutes = selectedCategory === 'all' 
    ? routesList 
    : routesList.filter(r => r.category === selectedCategory);

  const selectRouteForTest = (r: typeof routesList[0]) => {
    setTestMethod(r.method as any);
    setTestPath(r.path.replace(':id', 'tpl-welcome-001'));
    if (r.path.includes('/login')) {
      setTestBody('{\n  "username": "admin",\n  "password": "Admin@123456"\n}');
      setTestHeaders('{\n  "Content-Type": "application/json"\n}');
    } else if (r.auth === 'Bearer JWT') {
      setTestHeaders('{\n  "Authorization": "Bearer esp_jwt_access_mock_token",\n  "Content-Type": "application/json"\n}');
    } else {
      setTestHeaders('{\n  "x-api-key": "esp_live_secret_key_8899",\n  "Content-Type": "application/json"\n}');
    }
    setActiveTab('tester');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: حرج (Critical)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 1 - التصميم الأساسي (P1-T3)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 16 ساعة
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-sky-400" />
            <span>تصميم واجهات البرمجة (Express API Routes & OpenAPI Specs)</span>
          </h2>
          <p className="text-xs text-slate-400">
            بناء الـ 16 مسار المطلوب مدمجة مع Middlewares المصادقة والتحقق والامتثال وتوثيق OpenAPI 3.0
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-sky-400" />
          <span>المسؤول: مطور خلفي 1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'routes' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. مستعرض المسارات الـ 16 (Routes Explorer)
        </button>

        <button
          onClick={() => setActiveTab('middlewares')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'middlewares' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. سلسلة البرمجيات الوسيطة (Middlewares Pipeline)
        </button>

        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tester' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. مختبر API التفاعلي (Postman Tester)
        </button>

        <button
          onClick={() => setActiveTab('openapi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'openapi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. وثيقة OpenAPI 3.0 الشاملة
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'criteria' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          5. معايير القبول (Acceptance Criteria)
        </button>
      </div>

      {/* Tab 1: Routes Explorer */}
      {activeTab === 'routes' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <span>قائمة المسارات المنشأة ({filteredRoutes.length} من أصل 16)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">اضغط على أي مسار لاختباره فوراً في مختبر API</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'auth', 'email', 'templates', 'admin', 'sdk'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRoutes.map((r, idx) => (
              <div
                key={idx}
                onClick={() => selectRouteForTest(r)}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      r.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
                      r.method === 'POST' ? 'bg-sky-500/20 text-sky-300' :
                      r.method === 'PUT' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {r.method}
                    </span>
                    <span className="text-white font-bold group-hover:text-indigo-300 transition-colors">{r.path}</span>
                  </div>

                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {r.auth}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 2: Middlewares Pipeline */}
      {activeTab === 'middlewares' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>تسلسل معالجة الميدلوير (Express Middleware Request Lifecycle)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">تتبع سريان الطلب الوارد عبر الفلاتر والتحقق قبل الوصول للمعالج الرئيسي</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 font-mono">1. Auth Middleware</span>
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-[11px] text-slate-300">التحقق من صحة x-api-key أو رمز JWT المعطى وحساب حدود الاستخدام</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">2. Validation Middleware</span>
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-[11px] text-slate-300">فحص حقول الـ JSON المطلوبة والبريد الإلكتروني ومطابقة الشروط</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">3. Compliance & RateLimit</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300">حقن ترويسات GDPR/CAN-SPAM وحصر المعدل للتصدي للاستغلال</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 font-mono">4. Global Error Handler</span>
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-slate-300">التقاط واستعادة أي استثناء غير متوقع مع إرجاع استجابة JSON موحدة</p>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Postman Tester */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-sky-400" />
              <span>مختبر طلبات API الحية (Postman-style Request Construction)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono rounded-xl p-2.5"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الترويسات (Headers JSON):</label>
                <textarea
                  rows={3}
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-mono"
                />
              </div>

              {['POST', 'PUT'].includes(testMethod) && (
                <div>
                  <label className="text-slate-400 block mb-1">جسم الطلب (Body JSON):</label>
                  <textarea
                    rows={5}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-mono"
                  />
                </div>
              )}

              <button
                onClick={handleExecuteApiTest}
                disabled={isSending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الطلب وتنفيذ المسار</span>
              </button>
            </div>
          </div>

          {/* Response Output */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <span>استجابة الخادم (Server Response)</span>
              </h3>

              {responseResult && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseResult.status >= 200 && responseResult.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {responseResult.status} {responseResult.statusText}
                  </span>
                  <span className="text-slate-400">{responseResult.durationMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-[380px]">
                <code>{JSON.stringify(responseResult.body || responseResult, null, 2)}</code>
              </pre>
            ) : (
              <div className="bg-slate-950 p-12 rounded-xl border border-slate-800 text-center text-slate-500 text-xs font-mono">
                اضغط على زر إرسال الطلب لرؤية النتيجة والاستجابة الحية من الخادم
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 4: OpenAPI Spec Explorer */}
      {activeTab === 'openapi' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>وثيقة OpenAPI 3.0 Specification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">جاهزة للاستيراد في Postman أو Swagger UI</p>
            </div>

            <button
              onClick={() => copyToClipboard(JSON.stringify(openApiDoc, null, 2), 'openapi')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedId === 'openapi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ WSDL/OpenAPI</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed max-h-[450px]">
            <code>{JSON.stringify(openApiDoc, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Tab 5: Criteria */}
      {activeTab === 'criteria' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>معايير القبول والاعتماد (Acceptance Criteria Checklist)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">التحقق من اكتمال كافة متطلبات مهمة P1-T3</p>
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
