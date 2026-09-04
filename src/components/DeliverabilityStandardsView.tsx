import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Key, Activity, Flame, 
  Terminal, Copy, Check, ExternalLink, RefreshCw, Layers, Zap, Eye,
  Search, Sliders, Shield, FileText, CheckSquare
} from 'lucide-react';

export const DeliverabilityStandardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'auth' | 'warmup' | 'checker' | 'monitoring' | 'code'>('auth');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // SPF Generator State
  const [spfDomain, setSpfDomain] = useState('enterprise-esp.com');
  const [includeGoogle, setIncludeGoogle] = useState(true);
  const [includeSmtp, setIncludeSmtp] = useState(true);
  const [customIp, setCustomIp] = useState('192.168.1.100');
  const [spfPolicy, setSpfPolicy] = useState<'~all' | '-all'>('~all');

  // DKIM Generator State
  const [dkimSelector, setDkimSelector] = useState('esp2026');
  const [dkimKeySize, setDkimKeySize] = useState<2048 | 1024>(2048);

  // DMARC Generator State
  const [dmarcPolicy, setDmarcPolicy] = useState<'none' | 'quarantine' | 'reject'>('quarantine');
  const [dmarcRuaEmail, setDmarcRuaEmail] = useState('dmarc-reports@enterprise-esp.com');

  // Domain Warmup Calculator State
  const [warmupDomain, setWarmupDomain] = useState('mail.company.com');
  const [targetVolume, setTargetVolume] = useState(50000);
  const [currentWeek, setCurrentWeek] = useState(3);

  // Compliance Test State
  const [testHtml, setTestHtml] = useState(`<!DOCTYPE html>
<html>
<body>
  <h2>أهلاً بك في منصتنا</h2>
  <p>نشكرك على الانضمام. يرجى متابعة التحديثات عبر حسابك.</p>
  <a href="https://example.com/unsubscribe">إلغاء الاشتراك</a>
</body>
</html>`);
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    hasUnsubscribe: boolean;
    textRatio: number;
    issues: string[];
  } | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Generated Records
  const generatedSpf = `v=spf1 ${includeGoogle ? 'include:_spf.google.com ' : ''}${includeSmtp ? 'include:spf.smtp.com ' : ''}ip4:${customIp} ${spfPolicy}`;
  const generatedDkim = `${dkimSelector}._domainkey.${spfDomain} TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz8q9X+028vK3..."`;
  const generatedDmarc = `v=DMARC1; p=${dmarcPolicy}; pct=100; rua=mailto:${dmarcRuaEmail}; sp=${dmarcPolicy}`;

  // Warmup Calculation
  const calculateWarmupVolume = (week: number) => {
    const progress = week / 8;
    const vol = Math.min(targetVolume, Math.round(targetVolume * (0.10 + progress * 0.90)));
    return vol;
  };

  const handleTestCompliance = () => {
    const hasUnsub = /unsubscribe/i.test(testHtml) || /إلغاء الاشتراك/i.test(testHtml);
    const textLength = testHtml.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
    const imageCount = (testHtml.match(/<img/g) || []).length;
    const totalContent = textLength + (imageCount * 1000);
    const ratio = totalContent > 0 ? textLength / totalContent : 1;

    const issues: string[] = [];
    if (!hasUnsub) issues.push('البريد يفتقر إلى رابط إلغاء اشتراك ألمح بكلمة Unsubscribe / إلغاء الاشتراك (مطلوب لـ Gmail & Yahoo)');
    if (ratio < 0.4) issues.push('نسبة النص إلى الصور منخفضة جداً (يُوصى بـ 60% نص)');

    setTestResult({
      passed: issues.length === 0,
      hasUnsubscribe: hasUnsub,
      textRatio: Math.round(ratio * 100),
      issues
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Document Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />

        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              DLV-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              معتمد لـ Gmail & Yahoo & Outlook 2026
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>معايير التوافق مع خدمات البريد وتجنب الحظر (Deliverability & Auth)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دليل تحسين وصول الرسائل لصندوق الوارد Inbox ومصادقة SPF, DKIM, DMARC وتسخين النطاقات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://postmaster.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Google Postmaster</span>
          </a>
        </div>
      </div>

      {/* KPI Key Deliverability Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل الارتداد (Bounce Rate)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">0.42%</div>
          <span className="text-[11px] text-emerald-400 font-semibold block">المستهدف: &lt; 2.0%</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل الشكاوى (Complaint Rate)</span>
            <AlertTriangle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-400">0.03%</div>
          <span className="text-[11px] text-sky-400 font-semibold block">حد Google الأقصى: &lt; 0.1%</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>تقييم النطاق (Sender Score)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">98 / 100</div>
          <span className="text-[11px] text-amber-400 font-semibold block">ممتاز (High Reputation)</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>سياسة DMARC الفعالة</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-400">p=quarantine</div>
          <span className="text-[11px] text-indigo-400 font-semibold block">100% Enforced</span>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('auth')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'auth' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. مولد سجلات المصادقة (SPF, DKIM, DMARC)
        </button>

        <button
          onClick={() => setActiveTab('warmup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'warmup' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. حاسبة تسخين النطاق (Domain Warmup)
        </button>

        <button
          onClick={() => setActiveTab('checker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'checker' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. فاحص الامتثال التفاعلي (Compliance Test)
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'monitoring' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. متطلبات المرسلين الكبار (Bulk Senders)
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          5. كود الميدلوير والخدمات (Code Snippets)
        </button>
      </div>

      {/* Tab 1: DNS Record Generators */}
      {activeTab === 'auth' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SPF Generator */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Key className="w-4 h-4" />
              <span>سجل SPF (Sender Policy Framework)</span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم النطاق:</label>
                <input
                  type="text"
                  value={spfDomain}
                  onChange={(e) => setSpfDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={includeGoogle} onChange={(e) => setIncludeGoogle(e.target.checked)} />
                  <span>تضمين خوادم Google Workspace (_spf.google.com)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={includeSmtp} onChange={(e) => setIncludeSmtp(e.target.checked)} />
                  <span>تضمين خادم Relay الخارجي (spf.smtp.com)</span>
                </label>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">عنوان IP4 الخادم:</label>
                <input
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">السياسة النهائية:</label>
                <select
                  value={spfPolicy}
                  onChange={(e) => setSpfPolicy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value="~all">Soft Fail (~all - موصى به)</option>
                  <option value="-all">Hard Fail (-all)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>سجل TXT المولد:</span>
                <button onClick={() => copyCode(generatedSpf, 'spf')} className="text-indigo-400 hover:text-white text-[11px] flex items-center gap-1">
                  {copiedCodeId === 'spf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 break-all">
                {generatedSpf}
              </pre>
            </div>
          </div>

          {/* DKIM Generator */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>سجل DKIM (DomainKeys Identified Mail)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">محدد النطاق (Selector):</label>
                <input
                  type="text"
                  value={dkimSelector}
                  onChange={(e) => setDkimSelector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">حجم المفتاح التشفيري:</label>
                <select
                  value={dkimKeySize}
                  onChange={(e) => setDkimKeySize(Number(e.target.value) as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value={2048}>2048-bit RSA (موصى به لـ 2026)</option>
                  <option value={1024}>1024-bit RSA</option>
                </select>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                يتم نشر التوقيع الرقمي في DNS لمنع أي تلاعب بمحتوى الرسالة أثناء العبور وتأكيد المالك الشرعي.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>سجل TXT المولد:</span>
                <button onClick={() => copyCode(generatedDkim, 'dkim')} className="text-indigo-400 hover:text-white text-[11px] flex items-center gap-1">
                  {copiedCodeId === 'dkim' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-sky-300 break-all max-h-24 overflow-y-auto">
                {generatedDkim}
              </pre>
            </div>
          </div>

          {/* DMARC Generator */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>سجل DMARC (Policy & Reporting)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">السياسة التنفيدية (Policy):</label>
                <select
                  value={dmarcPolicy}
                  onChange={(e) => setDmarcPolicy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value="none">p=none (مراقبة فقط - للمبتدئين)</option>
                  <option value="quarantine">p=quarantine (تحويل للبريد المهمل - موصى به)</option>
                  <option value="reject">p=reject (رفض تام للرسائل المزيفة)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">بريد التقارير المجمعة (rua):</label>
                <input
                  type="email"
                  value={dmarcRuaEmail}
                  onChange={(e) => setDmarcRuaEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                متطلب إلزامي من Google و Yahoo لكل من يرسل أكثر من 5,000 بريد يومياً لضمان عدم انتحال نطاقك.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>سجل TXT المولد:</span>
                <button onClick={() => copyCode(generatedDmarc, 'dmarc')} className="text-indigo-400 hover:text-white text-[11px] flex items-center gap-1">
                  {copiedCodeId === 'dmarc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-300 break-all">
                {generatedDmarc}
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Domain Warmup Scheduler */}
      {activeTab === 'warmup' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>خطة تسخين النطاق الجديد (Domain Warmup Ramp-Up)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تدرج في الحجم اليومي على مدار 8 أسابيع لتجنب تصنيف الخوادم لك كمرسل عشوائي Spam
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">النطاق المستهدف:</span>
                <span className="text-amber-400 font-bold">{warmupDomain}</span>
              </div>
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">السعة المستهدفة:</span>
                <span className="text-emerald-400 font-bold">{targetVolume.toLocaleString()} / يوم</span>
              </div>
            </div>
          </div>

          {/* Warmup Interactive Slider & Timeline */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-300 font-bold">
              <span>حدد الأسبوع المتقدم لخطتك: الأسبوع {currentWeek} من 8</span>
              <span className="text-emerald-400 font-mono">الحجم اليومي الموصى به: {calculateWarmupVolume(currentWeek).toLocaleString()} بريد/يوم</span>
            </div>

            <input
              type="range"
              min={1}
              max={8}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
                const vol = calculateWarmupVolume(w);
                const isActive = w === currentWeek;
                return (
                  <div
                    key={w}
                    onClick={() => setCurrentWeek(w)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">الأسبوع {w}</span>
                    <span className="text-xs font-mono font-bold text-white mt-1 block">{vol.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 block">بريد / يوم</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Compliance Test */}
      {activeTab === 'checker' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>فاحص الامتثال للمعايير قبل الإرسال (Live Compliance Checker)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اختبار محتوى HTML للتحقق من وجود روابط إلغاء الاشتراك ونسبة النص إلى الصور
              </p>
            </div>

            <button
              onClick={handleTestCompliance}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>فحص كود HTML الآن</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">أدخل كود HTML للبريد الإلكتروني التجريبي:</label>
              <textarea
                value={testHtml}
                onChange={(e) => setTestHtml(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">نتيجة الفحص التلقائي:</h4>

              {testResult ? (
                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                    testResult.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {testResult.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold">
                      {testResult.passed ? 'ممتاز! البريد يتوافق تماماً مع معايير التسليم والتسليم لـ Inbox' : 'تنبيه: يتضمن البريد بعض المخالفات للمعايير'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <p>• رابط إلغاء الاشتراك (Unsubscribe Link): <strong className={testResult.hasUnsubscribe ? 'text-emerald-400' : 'text-rose-400'}>{testResult.hasUnsubscribe ? 'موجود ✅' : 'مفقود ❌'}</strong></p>
                    <p>• نسبة المحتوى النصي: <strong className="text-indigo-400 font-mono">{testResult.textRatio}%</strong> (المستهدف &gt; 40%)</p>
                  </div>

                  {testResult.issues.length > 0 && (
                    <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-rose-300 space-y-1">
                      <span className="font-bold block text-[11px]">التوصيات للتصحيح:</span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {testResult.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">اضغط على زر "فحص كود HTML الآن" لبدء الاختبار السريع.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Bulk Senders Requirements */}
      {activeTab === 'monitoring' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>متطلبات المرسلين الكبار لعام 2026 (Gmail & Yahoo Bulk Sender Mandates)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-rose-400 font-bold block">شروط Google للمرسلين (&gt; 5,000 بريد/يوم):</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1.5">
                <li>مصادقة ثلاثية إلزامية كاملة (SPF + DKIM + DMARC).</li>
                <li>معدل الشكوى Spam Rate أقل من 0.1% مع حد حظر أقصى 0.3%.</li>
                <li>رابط إلغاء الاشتراك بنقرة واحدة (List-Unsubscribe Header).</li>
                <li>معالجة طلبات إلغاء الاشتراك خلال أقل من 48 ساعة.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 font-bold block">شروط Yahoo & Outlook الإلزامية:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1.5">
                <li>سياسة DMARC مفعلة لا تقل عن p=none لمنع انتحال الهوية.</li>
                <li>معالجة الـ Hard Bounces وتصفيتها فوراً لمنع تدهور السمعة.</li>
                <li>استخدام عناوين From متسقة بحسب النوع (sales@, alerts@).</li>
                <li>استجابة سريعة لطلبات عدم الإزعاج وتحديث القوائم.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Code Snippets Viewer */}
      {activeTab === 'code' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-400 font-bold">middleware/compliance.middleware.ts</span>
            <button
              onClick={() => copyCode(`// middleware/compliance.middleware.ts
import { Request, Response, NextFunction } from 'express';

export async function checkCompliance(req: Request, res: Response, next: NextFunction) {
  const emailData = req.body;
  const hasUnsubscribe = /unsubscribe/i.test(emailData.html) || /إلغاء الاشتراك/i.test(emailData.html);
  
  if (!hasUnsubscribe) {
    return res.status(400).json({
      success: false,
      message: 'البريد يفتقر إلى رابط إلغاء الاشتراك'
    });
  }
  next();
}`, 'midCode')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white"
            >
              {copiedCodeId === 'midCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCodeId === 'midCode' ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>
{`// middleware/compliance.middleware.ts
import { Request, Response, NextFunction } from 'express';

export async function checkCompliance(req: Request, res: Response, next: NextFunction) {
  const emailData = req.body;
  const hasUnsubscribe = /unsubscribe/i.test(emailData.html) || /إلغاء الاشتراك/i.test(emailData.html);
  
  if (!hasUnsubscribe) {
    return res.status(400).json({
      success: false,
      message: 'البريد يفتقر إلى رابط إلغاء الاشتراك الإلزامي (Gmail & Yahoo Mandates)'
    });
  }
  
  next();
}`}
            </code>
          </pre>
        </div>
      )}

    </div>
  );
};
