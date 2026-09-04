import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, Activity, Database, 
  Layers, Lock, Server, Terminal, Copy, Check, RefreshCw, Play, 
  Clock, PhoneCall, CheckCircle2, FileText, Zap, Eye, AlertCircle
} from 'lucide-react';

export const RiskAnalysisView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'security' | 'operational' | 'compliance' | 'drp'>('all');
  const [selectedRiskId, setSelectedRiskId] = useState<string>('TR-001');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Disaster Recovery Simulation state
  const [isSimulatingDR, setIsSimulatingDR] = useState(false);
  const [drStep, setDrStep] = useState(0);

  const handleSimulateFailover = () => {
    setIsSimulatingDR(true);
    setDrStep(1);

    setTimeout(() => setDrStep(2), 1200); // Primary DB Failure
    setTimeout(() => setDrStep(3), 2400); // Failover to Read Replica
    setTimeout(() => {
      setDrStep(4); // RPO < 5m, RTO achieved
      setIsSimulatingDR(false);
    }, 3800);
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const risksData = [
    {
      id: 'TR-001',
      name: 'فشل قاعدة البيانات الرئيسية (Primary DB Breakdown)',
      category: 'technical',
      severity: 'حرج',
      probability: 'متوسط',
      impact: 'تعطل كامل للخدمة وفقدان مؤقت للاتصال بالبيانات',
      symptoms: ['توقف الاتصال بقاعدة البيانات', 'أخطاء في الاستعلامات', 'تباطؤ شديد في الأداء'],
      rootCauses: ['انهيار الخادم الرئيسي', 'نفاد المساحة التخزينية', 'هجمات DDoS على منفذ DB'],
      prevention: ['نسخ احتياطي يومي آلي لقاعدة البيانات', 'استخدام نسخ متماثلة للقراءة (Read Replicas)', 'توزيع الاتصالات عبر Pool Size = 50'],
      detection: ['مراقبة أداء الاستعلامات كل 5 ثواني', 'تنبيهات تلقائية عند تجاوز زمن الاستجابة 500ms'],
      recovery: ['التبديل التلقائي إلى النسخة المتماثلة (Replica Failover)', 'استعادة البيانات RPO = 5m خلال RTO = 30m'],
      codeTitle: 'strategies/database.recovery.ts',
      codeSnippet: `import { DataSource } from 'typeorm';
import { redis } from '../config/redis';

class DatabaseRecovery {
  private primary: DataSource;
  private replicas: DataSource[];

  async handleFailure(): Promise<void> {
    const isPrimaryDown = await this.checkPrimaryHealth();
    if (isPrimaryDown) {
      logger.error('Primary database is down, initiating failover');
      await this.switchToReplica();
    }
  }

  private async switchToReplica(): Promise<void> {
    for (const replica of this.replicas) {
      if (await replica.initialize()) {
        this.primary = replica;
        await this.sendAlert('Database failover activated successfully');
        return;
      }
    }
    await this.enterEmergencyMode();
  }
}`
    },
    {
      id: 'TR-002',
      name: 'فشل Redis / توقف نظام الطوابير (Bull Queue Stalled)',
      category: 'technical',
      severity: 'حرج',
      probability: 'متوسط',
      impact: 'توقف معالجة إرسال البريد وتراكم الرسائل في الانتظار',
      symptoms: ['ارتفاع حجم الطابور الممتلئ', 'عدم استجابة عميل ioredis'],
      rootCauses: ['نفاد ذاكرة الخادم (OOM)', 'انقطاع الاتصال بالشبكة السحابية'],
      prevention: ['تشغيل Redis في وضع Cluster Mode', 'حدود memory max = 2GB'],
      detection: ['فحص صحة اتصال Redis ping كل 10 ثواني', 'تنبيهات عند استهلاك 70% من الذاكرة'],
      recovery: ['التبديل التلقائي إلى Redis Replica', 'استعادة حالة الطوابير المحفوظة'],
      codeTitle: 'strategies/redis.recovery.ts',
      codeSnippet: `import Redis from 'ioredis';

class RedisRecovery {
  async handleRedisFailure(): Promise<void> {
    logger.warn('Redis is unhealthy, attempting recovery...');
    try {
      await this.primaryClient.ping();
    } catch {
      await this.switchToRedisReplica();
    }
  }

  private async switchToRedisReplica(): Promise<void> {
    this.primaryClient = this.replicaClient;
    await this.sendAlert('Redis failover activated');
  }
}`
    },
    {
      id: 'TR-003',
      name: 'انقطاع مزود البريد SMTP الأساسي',
      category: 'technical',
      severity: 'مرتفع',
      probability: 'متوسط',
      impact: 'فشل إرسال البريد المباشر وتأخر التسليم',
      symptoms: ['ارتفاع نسبة أخطاء المزود فوق 5%', 'رفض خادم SMTP للاتصالات'],
      rootCauses: ['مشكلة في خادم المزود', 'تعليق الحساب أو تجاوز الكوتا'],
      prevention: ['إعداد مزودين متعددين (SMTP Primary + AWS SES + SendGrid)'],
      detection: ['اختبار الاتصال بالخادم كل دقيقة', 'تتبع نسبة النجاح الحية'],
      recovery: ['التحويل الآلي الفوري للمزود الثانوي البديل مع تجربة إعادة إرسال الشحنات'],
      codeTitle: 'strategies/provider.failover.ts',
      codeSnippet: `class ProviderFailover {
  async handleProviderFailure(providerId: string): Promise<void> {
    this.healthStatus.set(providerId, false);
    const altProvider = await this.findAlternativeProvider();
    if (altProvider) {
      await this.switchToProvider(altProvider);
      await this.retryFailedEmails(altProvider);
    }
  }
}`
    },
    {
      id: 'SR-001',
      name: 'اختراق المفتاح السري للمسؤول (Admin Key Leak)',
      category: 'security',
      severity: 'حرج',
      probability: 'منخفض',
      impact: 'وصول غير مصرح به وإمكانية تعديل قوالب وتغيير الإعدادات',
      symptoms: ['تسجيل دخول من عناوين IP مجهولة', 'تغيير غير مجدول في المفاتيح'],
      rootCauses: ['تسريب المفتاح في السجلات', 'محاولات القوة العمياء (Brute Force)'],
      prevention: ['تخزين المفاتيح كـ Env Hash وتوليد JWT صالحة لـ 24 ساعة فقط'],
      detection: ['تنبيه فوري بعد 5 محاولات فاشلة وحظر الـ IP لمدة 30 دقيقة'],
      recovery: ['إبطال جميع رموز JWT الحالية فوراً وتوليد مفتاح سري جديد'],
      codeTitle: 'strategies/security.monitor.ts',
      codeSnippet: `class SecurityMonitor {
  async monitorAdminAccess(ip: string, secretKey: string): Promise<boolean> {
    if (this.failedAttempts.get(ip) > 5) {
      this.blockIP(ip);
      await this.sendSecurityAlert(\`IP \${ip} blocked after failed attempts\`);
      return false;
    }
    return this.validateKey(secretKey);
  }
}`
    },
    {
      id: 'SR-002',
      name: 'هجوم DDoS واستنزاف موارد الـ API',
      category: 'security',
      severity: 'مرتفع',
      probability: 'متوسط',
      impact: 'بطء أو تعطل استجابة نقاط API للمستخدمين الشرعيين',
      symptoms: ['ارتفاع مفاجئ في الطلبات الواردة من عناوين IP متعددة'],
      rootCauses: ['هجوم Botnet منظم لاستنزاف نطاق التردد'],
      prevention: ['تطبيق express-rate-limit بحد أقصى 100 طلب/دقيقة لكل مفتاح API'],
      detection: ['مراقبة كود الاستجابة HTTP 429 وتتبع أنماط الطلبات'],
      recovery: ['تفعيل وضع الحماية الصارم وتصفية عناوين IP المشبوهة تلقائياً'],
      codeTitle: 'strategies/ddos.protection.ts',
      codeSnippet: `class DDoSProtection {
  async protectAPI(req: Request, res: Response, next: NextFunction) {
    const key = \`\${req.headers['x-api-key']}:\${req.ip}\`;
    if (this.isExceededLimit(key)) {
      return res.status(429).json({ code: 'RATE_LIMIT_EXCEEDED' });
    }
    next();
  }
}`
    },
    {
      id: 'CR-001',
      name: 'مخاطر عدم الامتثال لـ GDPR وقوانين حماية البيانات',
      category: 'compliance',
      severity: 'حرج',
      probability: 'متوسط',
      impact: 'فرض غرامات قانونية ومساءلة تنظيمية',
      symptoms: ['تخزين بيانات مستلمين غير مشفرة أو عدم وجود رابط إغلاق الاشتراكات'],
      rootCauses: ['إرسال رسائل بدون رابط إلغاء الاشتراك (Unsubscribe)'],
      prevention: ['تشفير البيانات الشخصية AES-256 وإتاحة رابط إلغاء الاشتراك في كل قالب'],
      detection: ['فحص دوري لقوائم البريد وسجلات الشكاوى'],
      recovery: ['حذف أو إخفاء بيانات المستلم فوراً بناءً على الطلب (Right to be Forgotten)'],
      codeTitle: 'strategies/data.protection.ts',
      codeSnippet: `class DataProtection {
  encryptData(data: any): EncryptedData {
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    return { data: cipher.update(JSON.stringify(data), 'utf8', 'hex') };
  }
}`
    }
  ];

  const filteredRisks = activeCategory === 'all' 
    ? risksData 
    : risksData.filter(r => r.category === activeCategory);

  const activeRisk = risksData.find(r => r.id === selectedRiskId) || risksData[0];

  return (
    <div className="space-y-6">
      
      {/* Header Document Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              RISK-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              معتمد وموثق
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>تحليل المخاطر واستراتيجيات التجنب والتعافي (Risk Management & DR)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل المخاطر المعتمد (45 مخاطرة موثقة) مع بروتوكولات الاستجابة والاستعادة من الكوارث RTO &lt; 30m & RPO &lt; 5m
          </p>
        </div>

        <button
          onClick={handleSimulateFailover}
          disabled={isSimulatingDR}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
        >
          {isSimulatingDR ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isSimulatingDR ? 'جاري محاكاة الـ Failover...' : 'محاكاة التعافي المباشر (DR Failover)'}</span>
        </button>
      </div>

      {/* DR Simulation Toast Indicator */}
      {drStep > 0 && (
        <div className="p-4 bg-slate-900 border border-rose-500/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>
                {drStep === 1 && '1/3 - اكتشاف انقطاع الخادم الرئيسي (Primary Down Detected)...'}
                {drStep === 2 && '2/3 - تحويل الحركة للنسخة المتماثلة (Switching to Read Replica)...'}
                {drStep === 3 && '3/3 - تفعيل وضع الطوارئ ومزامنة الطوابير (Failover Active)...'}
                {drStep === 4 && '✅ تم التعافي التلقائي بنجاح! RTO = 12s, RPO = 0s (صفر فقدان بيانات)'}
              </span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">RTO &lt; 30m Approved</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 h-full transition-all duration-500" 
              style={{ width: `${(drStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Risk Analysis KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>إجمالي المخاطر</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">45</div>
          <span className="text-[11px] text-slate-400 font-medium">موزعة على 5 محاور</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>المخاطر الحرجة (Critical)</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">12</div>
          <span className="text-[11px] text-rose-400 font-medium">مستهدفة بـ Failover آلي</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>المخاطر العالية (High)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">18</div>
          <span className="text-[11px] text-amber-400 font-medium">محمية بـ Monitoring</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>هدف التعافي (RTO)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">&lt; 30m</div>
          <span className="text-[11px] text-emerald-400 font-medium">استعادة تلقائية</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>هدف فقد البيانات (RPO)</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-400">&lt; 5m</div>
          <span className="text-[11px] text-sky-400 font-medium">نسخ احتياطي مستمر</span>
        </div>

      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          جميع المخاطر (45)
        </button>

        <button
          onClick={() => setActiveCategory('technical')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'technical' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          المخاطر التقنية (TR-15)
        </button>

        <button
          onClick={() => setActiveCategory('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          المخاطر الأمنية (SR-12)
        </button>

        <button
          onClick={() => setActiveCategory('compliance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'compliance' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          الامتثال والخصوصية (CR-4)
        </button>
      </div>

      {/* Main Risk Explorer Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Items Selector List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300">اختر المخاطرة لمعاينة استراتيجية التجنب:</h3>
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              onClick={() => setSelectedRiskId(risk.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                selectedRiskId === risk.id
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-400">{risk.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  risk.severity === 'حرج' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {risk.severity}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">{risk.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{risk.impact}</p>
            </div>
          ))}
        </div>

        {/* Selected Risk Details & Code Viewer */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-400 font-bold">{activeRisk.id}</span>
                <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  احتمالية: {activeRisk.probability}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{activeRisk.name}</h3>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
              activeRisk.severity === 'حرج' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              الخطورة: {activeRisk.severity}
            </span>
          </div>

          {/* Impact & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-rose-400 font-bold block">الأعراض المؤشرة (Symptoms):</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {activeRisk.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">الأسباب الجذرية (Root Causes):</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {activeRisk.rootCauses.map((rc, idx) => <li key={idx}>{rc}</li>)}
              </ul>
            </div>
          </div>

          {/* Mitigation Plan Grid */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white">استراتيجية التجنب والوقاية (Mitigation Framework):</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">الوقاية (Prevention)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{activeRisk.prevention.join(' • ')}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block mb-1">الاكتشاف (Detection)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{activeRisk.detection.join(' • ')}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">التعافي (Recovery)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{activeRisk.recovery.join(' • ')}</p>
              </div>
            </div>
          </div>

          {/* Code Implementation Box */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>كود معالجة التعافي ({activeRisk.codeTitle}):</span>
              </span>
              <button
                onClick={() => copyCode(activeRisk.codeSnippet, activeRisk.id)}
                className="flex items-center gap-1 text-indigo-400 hover:text-white"
              >
                {copiedCodeId === activeRisk.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeId === activeRisk.id ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
              <code>{activeRisk.codeSnippet}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
