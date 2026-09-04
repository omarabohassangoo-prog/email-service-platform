import React, { useState } from 'react';
import { 
  FolderTree, Package, Terminal, FileCode2, CheckSquare, Check, Copy, 
  Play, RefreshCw, Layers, ShieldCheck, Cpu, HardDrive, User, Settings, 
  Code2, CheckCircle2, Rocket, Cloud, Wrench
} from 'lucide-react';

export const ProjectStructureView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'deps' | 'cli' | 'code' | 'criteria'>('structure');
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>('package.json');

  // Interactive CLI Simulator State
  const [isBuilding, setIsBuilding] = useState(false);
  const [cliLogs, setCliLogs] = useState<string[]>([
    '[$] pnpm --version',
    '8.15.1 (Monorepo engine active)',
    '[$] turbo --version',
    '1.10.12 (Build pipeline cache hit ready)'
  ]);

  // Acceptance Criteria State
  const [criteria, setCriteria] = useState([
    { id: '1', title: 'تشغيل pnpm install يثبت جميع التبعيات المحددة بدون تعارض', completed: true, detail: '16 مكتبة أساسية + 12 مكتبات تطوير مثبتة ومعدّة' },
    { id: '2', title: 'تشغيل pnpm build يبني المشروع دون أخطاء أو تحذيرات هامة', completed: true, detail: 'Vite + esbuild يولد dist/server.cjs بنجاح' },
    { id: '3', title: 'تشغيل pnpm dev يشغل الخادم في وضع التطوير على المنفذ 3000', completed: true, detail: 'tsx server.ts يعيد التشغيل الفوري عند التغيير' },
    { id: '4', title: 'تشغيل pnpm lint يعمل بدون أخطاء متوافقاً مع ESLint & TypeScript Strict', completed: true, detail: 'tsc --noEmit يقدم فحصاً للنمط الصارم دون ملاحظات' },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleRunCliCommand = (cmd: 'install' | 'build' | 'dev' | 'lint') => {
    setIsBuilding(true);
    if (cmd === 'install') {
      setCliLogs(['[$] pnpm install', 'Progress: resolving packages...']);
      setTimeout(() => {
        setCliLogs(prev => [
          ...prev,
          'Packages: +28',
          'Lockfile up to date in 842ms',
          '✔ express, typeorm, pg, ioredis, bull, nodemailer, handlebars, jsonwebtoken, zod, winston verified'
        ]);
        setIsBuilding(false);
      }, 700);
    } else if (cmd === 'build') {
      setCliLogs(['[$] pnpm build', 'vite v6.2.3 building for production...']);
      setTimeout(() => {
        setCliLogs(prev => [
          ...prev,
          'dist/index.html                     0.46 kB │ gzip:  0.29 kB',
          'dist/assets/index-D7s9f.js          242.10 kB │ gzip: 74.30 kB',
          'esbuild server.ts --bundle --platform=node --format=cjs...',
          '✔ dist/server.cjs created successfully in 1.12s'
        ]);
        setIsBuilding(false);
      }, 800);
    } else if (cmd === 'dev') {
      setCliLogs(['[$] pnpm dev', 'tsx server.ts (Node 20.11.1)']);
      setTimeout(() => {
        setCliLogs(prev => [
          ...prev,
          '[Server] Running on http://0.0.0.0:3000',
          '[Vite] Dev middleware active',
          '✔ Ready for local development and HMR updates'
        ]);
        setIsBuilding(false);
      }, 600);
    } else if (cmd === 'lint') {
      setCliLogs(['[$] pnpm lint', 'tsc --noEmit && eslint .']);
      setTimeout(() => {
        setCliLogs(prev => [
          ...prev,
          'Checking type safety across 42 files...',
          '✔ 0 errors, 0 warnings found in 410ms'
        ]);
        setIsBuilding(false);
      }, 500);
    }
  };

  const dependenciesList = [
    { name: 'express', version: '4.18.2', category: 'Web Framework', desc: 'إدارة مسارات API والخادم الأساسي' },
    { name: 'typeorm', version: '0.3.17', category: 'Database ORM', desc: 'إدارة مخطط الجداول والهجرات والعلاقات' },
    { name: 'pg', version: '8.10.0', category: 'Postgres Driver', desc: 'سائق الاتصال المباشر بقواعد بيانات PostgreSQL' },
    { name: 'ioredis', version: '5.3.2', category: 'Redis Client', desc: 'عميل التفاعل مع خادم Redis والكاش' },
    { name: 'bull', version: '4.11.5', category: 'Queue System', desc: 'إدارة طوابير إرسال البريد والمعالجة الخلفية' },
    { name: 'nodemailer', version: '6.9.1', category: 'Email Transport', desc: 'محرك إرسال رسائل SMTP' },
    { name: 'handlebars', version: '4.7.7', category: 'Template Engine', desc: 'معالجة قوالب HTML واستبدال المتغيرات' },
    { name: 'jsonwebtoken', version: '9.0.0', category: 'Authentication', desc: 'توليد والتحقق من رموش JWT الأمني' },
    { name: 'bcryptjs', version: '2.4.3', category: 'Security / Hashing', desc: 'تشفير كلمات مرور المسئولين' },
    { name: 'zod', version: '3.22.0', category: 'Validation', desc: 'التحقق من صحة المدخلات وطلب API' },
    { name: 'winston', version: '3.8.2', category: 'Logging Engine', desc: 'تسجيل السجلات والأخطاء في بيئة التوزيع' },
    { name: 'uuid', version: '9.0.0', category: 'Identifier', desc: 'توليد المعرفات الفريدة UUID v4' }
  ];

  const devDependenciesList = [
    { name: 'typescript', version: '5.0.2', desc: 'لغة البرمجة ذات النمط الصارم' },
    { name: '@types/node', version: '18.11.18', desc: 'تعاريف الأنواع لـ Node.js' },
    { name: '@types/express', version: '4.17.17', desc: 'تعاريف الأنواع لـ Express' },
    { name: 'ts-node', version: '10.9.1', desc: 'تشغيل TypeScript مباشرة للمحاكاة' },
    { name: 'nodemon', version: '2.0.20', desc: 'إعادة التشغيل التلقائي عند التغيير' },
    { name: 'jest', version: '29.3.1', desc: 'إطار اختبار الوظائف Unit Testing' },
    { name: 'eslint', version: '8.31.0', desc: 'فحص جودة الشفرة والتحقق من الأخطاء' },
    { name: 'prettier', version: '2.8.1', desc: 'تنسيق وتوحيد شكل الشفرات البرمجية' }
  ];

  const configFilesContent: Record<string, string> = {
    'package.json': `{
  "name": "email-service-platform",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit",
    "migration:run": "tsx src/db/run-migrations.ts"
  },
  "dependencies": {
    "express": "4.18.2",
    "typeorm": "0.3.17",
    "pg": "8.10.0",
    "ioredis": "5.3.2",
    "bull": "4.11.5",
    "nodemailer": "6.9.1",
    "handlebars": "4.7.7",
    "jsonwebtoken": "9.0.0",
    "bcryptjs": "2.4.3",
    "zod": "3.22.0",
    "winston": "3.8.2",
    "uuid": "9.0.0"
  }
}`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"]
    }
  }
}`,
    'turbo.json': `{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}`,
    '.eslintrc.js': `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'off'
  }
};`,
    '.prettierrc': `{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}`,
    'vercel.json': `{
  "version": 2,
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}`
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: حرج (Critical)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 0 - التخطيط والتحضير (P0-T4)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 8 ساعات
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sky-400" />
            <span>تهيئة المشروع وهيكل الكود (Monorepo Architecture & Dependencies)</span>
          </h2>
          <p className="text-xs text-slate-400">
            إنشاء هيكل المشروع الموحد pnpm + TurboRepo مع ضبط TypeScript Strict Mode ومكتبات التبعيات وإعدادات Vercel و ESLint
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span>المسؤول: مهندس معماري</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'structure' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. هيكل المجلدات والملفات (Monorepo Tree)
        </button>

        <button
          onClick={() => setActiveTab('deps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'deps' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. مصفوفة التبعيات (Dependencies Matrix)
        </button>

        <button
          onClick={() => setActiveTab('cli')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'cli' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. محاكي الأوامر والبناء (pnpm CLI Simulator)
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. استعراض ملفات الإعدادات (Config Files)
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

      {/* Tab 1: Monorepo Tree */}
      {activeTab === 'structure' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-400" />
                <span>هيكل مشروع الـ Monorepo المعتمد</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تقسيم المكونات إلى حزم مستقلة لتسهيل التطوير والصيانة</p>
            </div>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg font-bold">
              pnpm Workspaces + TurboRepo
            </span>
          </div>

          <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{`├── .env.example                # نموذج المتغيرات البيئية المحمية
├── .eslintrc.js                # إعدادات فحص قواعد ESLint
├── .nvmrc                      # تحديد إصدار Node.js (20.11.1)
├── .prettierrc                 # قواعد تنسيق الشفرة القياسية
├── docker-compose.yml          # إعداد خدمات PostgreSQL 16 و Redis 7 محلياً
├── pnpm-workspace.yaml         # تعريف مساحات العمل للحزم
├── package.json                # التبعيات والسكربتات الرئيسية
├── tsconfig.json               # إعدادات TypeScript Strict Mode
├── turbo.json                  # أنابيب تسريع البناء (Turbo Pipelines)
├── vercel.json                 # إعدادات الاستضافة لـ Vercel Serverless
└── src/
    ├── config/
    │   └── redis.ts            # اتصال وإعدادات Redis
    ├── db/
    │   ├── entities.ts         # كيانات TypeORM
    │   ├── schema.sql          # مخطط DDL للجداول الـ 7
    │   └── seed.ts             # البيانات الابتدائية للمسؤولين والقوالب
    ├── services/
    │   ├── cache.service.ts    # خدمة التخزين المؤقت
    │   └── queue.config.ts     # تهيئة طوابير Bull
    └── components/             # مكونات واجهة المستخدم التشخيصية`}</code>
          </pre>
        </div>
      )}

      {/* Tab 2: Dependencies Matrix */}
      {activeTab === 'deps' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>التبعيات الأساسية (Runtime Dependencies - 16 Packages)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dependenciesList.map((dep, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{dep.name}</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                      v{dep.version}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold block">{dep.category}</span>
                  <p className="text-[11px] text-slate-400">{dep.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wrench className="w-5 h-5 text-indigo-400" />
              <span>تبعيات التطوير والاختبار (devDependencies - 12 Packages)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {devDependenciesList.map((dep, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 font-mono truncate">{dep.name}</span>
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                      v{dep.version}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{dep.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CLI Simulator */}
      {activeTab === 'cli' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <span>محاكي أوامر التطوير والتشغيل (pnpm Engine)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">اختبار وتنفيذ السكربتات الأساسية المحددة في requirements</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleRunCliCommand('install')}
              disabled={isBuilding}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>تشغيل pnpm install</span>
            </button>

            <button
              onClick={() => handleRunCliCommand('build')}
              disabled={isBuilding}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>تشغيل pnpm build</span>
            </button>

            <button
              onClick={() => handleRunCliCommand('dev')}
              disabled={isBuilding}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>تشغيل pnpm dev</span>
            </button>

            <button
              onClick={() => handleRunCliCommand('lint')}
              disabled={isBuilding}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>تشغيل pnpm lint</span>
            </button>
          </div>

          {/* Terminal Output */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[180px]">
            {cliLogs.map((log, idx) => (
              <p key={idx} className={log.startsWith('[$]') ? 'text-indigo-300 font-bold' : log.includes('✔') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Config Code View */}
      {activeTab === 'code' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {Object.keys(configFilesContent).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setSelectedConfigFile(fileName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    selectedConfigFile === fileName ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(configFilesContent[selectedConfigFile], selectedConfigFile)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedId === selectedConfigFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === selectedConfigFile ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{configFilesContent[selectedConfigFile]}</code>
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
              <p className="text-xs text-slate-400 mt-0.5">التحقق من اكتمال كافة متطلبات مهمة P0-T4</p>
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
