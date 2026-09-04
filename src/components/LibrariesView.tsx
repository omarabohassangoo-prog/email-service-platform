import React, { useState } from 'react';
import { 
  Library, Box, Code2, Terminal, CheckCircle2, ShieldCheck, 
  Cpu, Database, Mail, Layers, Lock, CheckSquare, FileText, 
  Copy, ExternalLink, Sparkles, Server, Zap, Wrench
} from 'lucide-react';

export const LibrariesView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const libraryCategories = [
    { id: 'all', label: 'جميع المكتبات (All Libraries)' },
    { id: 'core', label: 'المكتبات الأساسية (Core)' },
    { id: 'database', label: 'قواعد البيانات (Database)' },
    { id: 'email', label: 'البريد والتصميم (Email)' },
    { id: 'queue', label: 'الطوابير (Queue & Redis)' },
    { id: 'security', label: 'الأمان والمصادقة (Security)' },
    { id: 'validation', label: 'التحقق والبيانات (Validation)' },
    { id: 'integrations', label: 'التكامل السحابي (Integrations)' },
    { id: 'monitoring', label: 'المراقبة والسجلات (Logging)' },
  ];

  const librariesList = [
    {
      category: 'core',
      name: 'express',
      version: '^4.18.2',
      description: 'إطار عمل لبناء تطبيقات الويب وتوفير نقاط API عالية الأداء',
      purpose: 'إنشاء خادم HTTP وتوجيه المسارات',
      example: `import express from 'express';\nconst app = express();\napp.use(express.json());`,
      docs: 'https://expressjs.com/'
    },
    {
      category: 'core',
      name: 'typescript',
      version: '^5.0.2',
      description: 'لغة برمجة مبنية على JavaScript توفر فحص الأنواع الصارم للبرمجيات الضخمة',
      purpose: 'تطوير آمن مع أنواع ثابتة لجميع أجزاء النظام',
      example: `interface EmailOptions {\n  to: string;\n  subject: string;\n  html: string;\n}`,
      docs: 'https://www.typescriptlang.org/'
    },
    {
      category: 'core',
      name: 'dotenv',
      version: '^16.0.3',
      description: 'تحميل متغيرات البيئة تلقائياً من ملف .env الخاص بالمشروع',
      purpose: 'إدارة وتشفير المفاتيح الحساسة',
      example: `import dotenv from 'dotenv';\ndotenv.config();\nconst PORT = process.env.PORT || 3000;`,
      docs: 'https://github.com/motdotla/dotenv'
    },
    {
      category: 'database',
      name: 'typeorm',
      version: '^0.3.17',
      description: 'نظام ORM متقدم لبناء الجداول والروابط بين الكيانات',
      purpose: 'إدارة كيانات PostgreSQL والعلاقات البرمجية',
      example: `@Entity('admin_users')\nexport class AdminUser {\n  @PrimaryGeneratedColumn('uuid') id: string;\n  @Column({ unique: true }) username: string;\n}`,
      docs: 'https://typeorm.io/'
    },
    {
      category: 'database',
      name: 'pg',
      version: '^8.10.0',
      description: 'محرّك الاتصال المباشر بقواعد بيانات PostgreSQL في Node.js',
      purpose: 'توفير حوض اتصالات (Connection Pool) سريع واستعلامات مخصصة',
      example: `import { Pool } from 'pg';\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });`,
      docs: 'https://node-postgres.com/'
    },
    {
      category: 'database',
      name: 'ioredis',
      version: '^5.3.2',
      description: 'عميل Redis عالي الأداء مع دعم لـ Cluster و Sentinel',
      purpose: 'التخزين المؤقت المباشر وتنسيق الطوابير مع Bull',
      example: `import Redis from 'ioredis';\nconst redis = new Redis(process.env.REDIS_URL);`,
      docs: 'https://github.com/luin/ioredis'
    },
    {
      category: 'email',
      name: 'nodemailer',
      version: '^6.9.1',
      description: 'المكتبة المعتمدة لإرسال البريد الإلكتروني عبر خوادم SMTP',
      purpose: 'معالجة الاتصال بالخوادم، المرفقات، والرسائل المباشرة',
      example: `import nodemailer from 'nodemailer';\nconst transporter = nodemailer.createTransport({ host: 'smtp.provider.com', port: 587 });`,
      docs: 'https://nodemailer.com/'
    },
    {
      category: 'email',
      name: 'handlebars',
      version: '^4.7.7',
      description: 'محرك قوالب منطقي لدمج وتوليد صفحات HTML الديناميكية',
      purpose: 'معالجة قوالب البريد واستبدال المتغيرات {{username}}',
      example: `import Handlebars from 'handlebars';\nconst template = Handlebars.compile('<h1>مرحباً {{name}}</h1>');`,
      docs: 'https://handlebarsjs.com/'
    },
    {
      category: 'queue',
      name: 'bull',
      version: '^4.11.5',
      description: 'نظام طوابير موزعة يعتمد على Redis مع معالجة الأولويات وإعادة التكاسل التكعيبي',
      purpose: 'إدارة وإيقاف ومعالجة مهام إرسال البريد في الخلفية',
      example: `import Queue from 'bull';\nconst emailQueue = new Queue('email-queue', process.env.REDIS_URL);\nemailQueue.process(async (job) => { sendEmail(job.data); });`,
      docs: 'https://github.com/OptimalBits/bull'
    },
    {
      category: 'security',
      name: 'jsonwebtoken',
      version: '^9.0.0',
      description: 'إنشاء وتوثيق الرموز المشفرة (JSON Web Tokens)',
      purpose: 'مصادقة المسؤولين والتحقق من صلاحيات الجلسات (24h)',
      example: `import jwt from 'jsonwebtoken';\nconst token = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });`,
      docs: 'https://github.com/auth0/node-jsonwebtoken'
    },
    {
      category: 'security',
      name: 'bcryptjs',
      version: '^2.4.3',
      description: 'تشفير وحساب تجزئة (Hash) كلمات المرور باستخدام خوارزمية Blowfish',
      purpose: 'حفظ واسترجاع مفاتيح الأمان بشكل مشفر ومحمي',
      example: `import bcrypt from 'bcryptjs';\nconst hash = await bcrypt.hash('secretPass', 10);`,
      docs: 'https://github.com/dcodeIO/bcrypt.js'
    },
    {
      category: 'security',
      name: 'express-rate-limit',
      version: '^6.7.0',
      description: 'تحديد معدل التدفق والطلبات الواردة لكل بروتوكول أو مفتاح',
      purpose: 'حماية النظام من هجمات الإغراق والـ DOS (100 req/min)',
      example: `import rateLimit from 'express-rate-limit';\nconst limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });`,
      docs: 'https://github.com/express-rate-limit/express-rate-limit'
    },
    {
      category: 'validation',
      name: 'joi',
      version: '^17.9.2',
      description: 'مكتبة فحص الهياكل والتحقق من صحة البيانات الواردة مع رسائل خطأ دقيقة',
      purpose: 'مطابقة مدخلات إرسال البريد وحقول القوالب',
      example: `import Joi from 'joi';\nconst schema = Joi.object({ to: Joi.string().email().required() });`,
      docs: 'https://joi.dev/'
    },
    {
      category: 'integrations',
      name: 'aws-sdk',
      version: '^2.1450.0',
      description: 'مكتبة التفاعل المباشر مع خدمات AWS الموزعة',
      purpose: 'إرسال البريد عبر AWS SES وتخزين المرفقات الضخمة في Amazon S3',
      example: `import AWS from 'aws-sdk';\nconst s3 = new AWS.S3({ region: 'us-east-1' });`,
      docs: 'https://aws.amazon.com/sdk-for-node-js/'
    },
    {
      category: 'monitoring',
      name: 'winston',
      version: '^3.8.2',
      description: 'نظام تسجيل أحداث وخطوات التشغيل المتقدم متعدد الوجهات',
      purpose: 'تسجيل العمليات والسجلات الأمنية وسجلات الأخطاء في ملفات منفصلة',
      example: `import winston from 'winston';\nconst logger = winston.createLogger({ transports: [new winston.transports.Console()] });`,
      docs: 'https://github.com/winstonjs/winston'
    },
    {
      category: 'monitoring',
      name: 'prom-client',
      version: '^14.2.0',
      description: 'مكتبة قياس الأداء وتوفير مؤشرات Prometheus',
      purpose: 'تصدير المقاييس الفنية ورسومات Grafana',
      example: `import promClient from 'prom-client';\nconst counter = new promClient.Counter({ name: 'emails_sent_total', help: 'Total sent' });`,
      docs: 'https://github.com/siimon/prom-client'
    }
  ];

  const filteredLibraries = activeCategory === 'all' 
    ? librariesList 
    : librariesList.filter(l => l.category === activeCategory);

  const copyToClipboard = (text: string, indexStr: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexStr);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner Document Info */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              LIB-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              معتمد ومطابق
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-400" />
            <span>وثيقة المكتبات والتكاملات الخارجية (External Libraries & Dependencies)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دليل المكتبات الأساسية، استراتيجيات الاستيراد، تحسين الأداء، والتوافقية مع خادم Node.js v18+
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left font-mono text-xs text-slate-300">
            <span className="text-slate-500 text-[10px] block">Node / TS Compatibility:</span>
            <span className="text-emerald-400 font-bold">Node.js &gt;=16.x | TS &gt;=5.0.0</span>
          </div>
        </div>
      </div>

      {/* Compatibility Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>إطار العمل واللغة</span>
            <Code2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">Express.js + TypeScript</div>
          <span className="text-[11px] text-indigo-400 font-medium">Strict ESM & CJS Build</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>محرك الطوابير والكاش</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">Bull + ioredis</div>
          <span className="text-[11px] text-emerald-400 font-medium">Concurrency Limit: 100 job/s</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>التمرير المباشر والمرفقات</span>
            <Mail className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">Nodemailer + Handlebars</div>
          <span className="text-[11px] text-sky-400 font-medium">Multi-SMTP Failover Supported</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>الأمان والتشفير</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">JWT + Bcrypt + Helmet</div>
          <span className="text-[11px] text-amber-400 font-medium">Rate Limits & CORS Active</span>
        </div>

      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {libraryCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Package Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLibraries.map((lib, idx) => (
          <div key={lib.name} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-base font-bold text-white">{lib.name}</span>
                  <span className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {lib.version}
                  </span>
                </div>

                <a 
                  href={lib.docs} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                  title="الوثائق الرسمية"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {lib.description}
              </p>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-indigo-400 font-semibold block mb-0.5">الغرض والاستخدام:</span>
                <span className="text-slate-400">{lib.purpose}</span>
              </div>

            </div>

            {/* Code Snippet Box */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>مثال الاستيراد والاستخدام:</span>
                <button
                  onClick={() => copyToClipboard(lib.example, `lib-${idx}`)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === `lib-${idx}` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIndex === `lib-${idx}` ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                <code>{lib.example}</code>
              </pre>
            </div>

          </div>
        ))}
      </div>

      {/* Installation Commands & Environment Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Commands Box */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>أوامر تثبيت الحزم (NPM Installation)</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 block mb-1 font-semibold">تثبيت جميع المكاتب (Full Bundle):</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 flex items-center justify-between">
                <code className="text-[11px]">npm install express typescript dotenv typeorm pg ioredis nodemailer bull handlebars jsonwebtoken bcryptjs helmet cors express-rate-limit joi winston uuid compression axios</code>
                <button 
                  onClick={() => copyToClipboard('npm install express typescript dotenv typeorm pg ioredis nodemailer bull handlebars jsonwebtoken bcryptjs helmet cors express-rate-limit joi winston uuid compression axios', 'cmd-1')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 font-semibold">حزم التطوير والأنواع (DevDependencies & Types):</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 flex items-center justify-between">
                <code className="text-[11px]">npm install --save-dev typescript @types/express @types/nodemailer @types/bull @types/jsonwebtoken @types/bcryptjs @types/uuid tsx esbuild</code>
                <button 
                  onClick={() => copyToClipboard('npm install --save-dev typescript @types/express @types/nodemailer @types/bull @types/jsonwebtoken @types/bcryptjs @types/uuid tsx esbuild', 'cmd-2')}
                  className="p-1 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practice Optimization Tips */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>توصيات الأداء والتحسين (Optimization Strategies)</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">تفعيل Tree Shaking عبر ES Modules:</strong>
                <span>استخدام استيرادات محددة للوحدات لتقليل حجم الحزمة واستبعاد الكود غير المستخدم.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">التخزين المؤقت الذكي عبر Redis (Caching):</strong>
                <span>تخزين نتائج التحقق من مفاتيح API وقوالب البريد لتفادي الاستعلامات المتكررة لقاعدة البيانات.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">ضغط الاستجابات (Compression Middleware):</strong>
                <span>تفعيل ضغط gzip/brotli لكل استجابات الـ REST API لتقليص حجم البيانات المنقولة بنسبة تصل لـ 70%.</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
