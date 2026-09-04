import React, { useState } from 'react';
import { 
  Server, Database, Cpu, Terminal, Check, Copy, HardDrive, 
  Settings, CheckCircle2, Play, RefreshCw, Layers, ShieldCheck, 
  GitBranch, Code2, AlertCircle, FileCode, CheckSquare, Zap, Clock, User
} from 'lucide-react';

export const DevEnvSetupView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'docker' | 'workspace' | 'diagnostics' | 'criteria'>('overview');

  // Simulated Services Health
  const [services, setServices] = useState({
    node: { status: 'online', version: 'v20.11.1', detail: 'Node.js 20+ Runtime' },
    typescript: { status: 'online', version: 'v5.8.2', detail: 'TypeScript Strict Mode' },
    pnpm: { status: 'online', version: 'v8.15.1', detail: 'Fast Package Manager Workspace' },
    postgres: { status: 'online', port: '5432', detail: 'PostgreSQL 16 Alpine (email_dev)' },
    redis: { status: 'online', port: '6379', detail: 'Redis 7 Alpine Cache' },
    vercelCli: { status: 'online', version: 'v33.4.0', detail: 'Vercel Serverless CLI' },
  });

  // Acceptance Criteria State
  const [criteria, setCriteria] = useState([
    { id: '1', title: 'تشغيل npm run dev / pnpm dev على المنفذ 3000', completed: true, detail: 'الخادم يعمل ويعالج الطلبات على http://localhost:3000' },
    { id: '2', title: 'الاتصال بقاعدة البيانات PostgreSQL (Port 5432) يعمل', completed: true, detail: 'تم التحقق من الاتصال بقاعدة البيانات email_dev عبر docker-compose' },
    { id: '3', title: 'الاتصال بـ Redis (Port 6379) يعمل بنجاح', completed: true, detail: 'استجابة PONG من Redis 7 Alpine' },
    { id: '4', title: 'جميع الأدوات والتبعيات الأساسية مثبتة وتعمل بدون أخطاء', completed: true, detail: 'Node 20+, TS 5.8+, pnpm, TurboRepo, Vercel CLI' },
  ]);

  // Terminal Simulator State
  const [termCommand, setTermCommand] = useState('docker compose up -d');
  const [termOutput, setTermOutput] = useState<string[]>([
    '[$] docker compose up -d',
    '[+] Running 2/2',
    ' ✔ Container email_service_postgres  Started (0.4s)',
    ' ✔ Container email_service_redis     Started (0.3s)',
    '[!] PostgreSQL is ready to accept connections on port 5432.',
    '[!] Redis server initialized and listening on port 6379.'
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleRunCommand = (cmd: string) => {
    setTermCommand(cmd);
    setIsExecuting(true);
    let output: string[] = [`[$] ${cmd}`];

    setTimeout(() => {
      if (cmd.includes('docker ps')) {
        output.push('CONTAINER ID   IMAGE                COMMAND                  PORTS                    NAMES');
        output.push('a1b2c3d4e5f6   postgres:16-alpine   "docker-entrypoint.s…"   0.0.0.0:5432->5432/tcp   email_service_postgres');
        output.push('f6e5d4c3b2a1   redis:7-alpine       "docker-entrypoint.s…"   0.0.0.0:6379->6379/tcp   email_service_redis');
      } else if (cmd.includes('redis-cli ping')) {
        output.push('PONG');
      } else if (cmd.includes('pnpm --version')) {
        output.push('8.15.1');
      } else if (cmd.includes('node -v')) {
        output.push('v20.11.1');
      } else if (cmd.includes('docker compose up')) {
        output.push('[+] Running 2/2');
        output.push(' ✔ Container email_service_postgres  Running');
        output.push(' ✔ Container email_service_redis     Running');
      } else {
        output.push(`Executed: ${cmd}`);
        output.push('Status: Success (0ms)');
      }
      setTermOutput(output);
      setIsExecuting(false);
    }, 600);
  };

  const dockerComposeYaml = `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: email_service_postgres
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres_password}
      POSTGRES_DB: \${POSTGRES_DB:-email_dev}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: email_service_redis
    restart: always
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-redis_password}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:`;

  const envExample = `# Node Environment
NODE_ENV=development
PORT=3000

# Database Settings (Local Docker / Vercel Postgres)
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/email_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password
POSTGRES_DB=email_dev

# Redis Settings (Local Docker / Vercel KV)
REDIS_URL=redis://:redis_password@localhost:6379
REDIS_PASSWORD=redis_password

# Authentication & Security
JWT_SECRET=super_secret_jwt_key_2026_dev
ADMIN_SECRET=super_secret_admin_key_2026_dev
ENCRYPTION_KEY=32_bytes_dev_encryption_key_12345

# Vercel Configurations
VERCEL_SUPPORT_LARGE_FUNCTIONS=1
NEXT_PUBLIC_API_URL=http://localhost:3000

# Log Settings
LOG_LEVEL=debug`;

  const pnpmWorkspaceYaml = `packages:
  - 'packages/*'
  - 'apps/*'`;

  const turboJson = `{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}`;

  return (
    <div className="space-y-6">
      
      {/* Header Badge */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-sky-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: حرج (Critical)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 0 - التخطيط والتحضير (P0-T1)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 8 ساعات
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <span>إعداد بيئة التطوير والبنية التحتية (Dev Environment & Infrastructure Setup)</span>
          </h2>
          <p className="text-xs text-slate-400">
            تثبيت وتكوين جميع الأدوات والتقنيات اللازمة لتطوير خدمة البريد الإلكتروني (PostgreSQL, Redis, pnpm Workspace, TurboRepo, Docker Compose)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span>المسؤول: مهندس معماري</span>
        </div>
      </div>

      {/* Services Live Status Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Runtime</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-white">{services.node.version}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.node.detail}</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Compiler</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white">{services.typescript.version}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.typescript.detail}</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Package Manager</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white">pnpm {services.pnpm.version}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.pnpm.detail}</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-400">PostgreSQL</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white">Port {services.postgres.port}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.postgres.detail}</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400">Redis Cache</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white">Port {services.redis.port}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.redis.detail}</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-400">Vercel CLI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white">{services.vercelCli.version}</p>
          <p className="text-[10px] text-slate-400 truncate">{services.vercelCli.detail}</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. الهيكل والمتطلبات (Overview & Structure)
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'docker' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. ملف docker-compose.yml
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'workspace' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. إعدادات pnpm & TurboRepo & .env
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'diagnostics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. محاكي الأوامر والتشخيص المباشر
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>هيكل المجلدات والحزم الحزمة (Monorepo Code Structure)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">توزيع إدارة المشروع باستخدام pnpm workspace و TurboRepo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 font-mono">packages/api</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">Backend API</span>
              </div>
              <p className="text-xs text-slate-300">الخادم الخلفي للخدمات وواجهات برمجة التطبيقات و Serverless Functions.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">packages/web</span>
                <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded">Next.js Web</span>
              </div>
              <p className="text-xs text-slate-300">الواجهة الأمامية ولوحة التحكم الإدارية لتتبع الرسائل والإحصائيات.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">packages/shared</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Types & Utils</span>
              </div>
              <p className="text-xs text-slate-300">الأنواع والمخططات والمكتبات المشتركة بين باقي الخدمات.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">packages/sdk</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">Client SDK</span>
              </div>
              <p className="text-xs text-slate-300">مكتبة SDK للعملاء لمكامنة الإرسال البريدي بسهولة من تطبيقاتهم.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-white block">ملاحظات معمارية وتقنية (Technical Notes):</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>اعتماد مدير الحزم <strong>pnpm</strong> لسرعته الفائقة وتقليل استخدام المساحات عبر الأقراص الصلبة.</li>
              <li>تفعيل خيار <strong>strict mode</strong> في TypeScript لضمان أمان الأنواع الكامل ومنع الأخطاء أثناء التشغيل.</li>
              <li>ربط <strong>ESLint + Prettier</strong> بقواعد صارمة لتطابق كود جميع المطورين.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Docker Compose */}
      {activeTab === 'docker' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                <span>تكوين بيئة Docker المحلية (docker-compose.yml)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تشغيل حاويات PostgreSQL 16 و Redis 7 محلياً مع المراقبة الصحية (Healthchecks)</p>
            </div>

            <button
              onClick={() => copyToClipboard(dockerComposeYaml, 'dockerCode')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedId === 'dockerCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'dockerCode' ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{dockerComposeYaml}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Workspace Configs */}
      {activeTab === 'workspace' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          
          {/* env.example */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono">.env.example</span>
              <button
                onClick={() => copyToClipboard(envExample, 'envCode')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                {copiedId === 'envCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ .env.example</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <code>{envExample}</code>
            </pre>
          </div>

          {/* pnpm & turbo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-400 font-mono">pnpm-workspace.yaml</span>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-200">
                <code>{pnpmWorkspaceYaml}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">turbo.json</span>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-200">
                <code>{turboJson}</code>
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Command Diagnostics Simulator */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>محاكي فحص وتشغيل الأوامر (CLI Infrastructure Terminal)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">اختبار استجابة الحاويات والبيئة المحلية تفاعلياً</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleRunCommand('docker compose up -d')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>docker compose up -d</span>
            </button>

            <button
              onClick={() => handleRunCommand('docker ps')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-sky-400" />
              <span>docker ps</span>
            </button>

            <button
              onClick={() => handleRunCommand('redis-cli ping')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-rose-400" />
              <span>redis-cli ping</span>
            </button>

            <button
              onClick={() => handleRunCommand('node -v && pnpm --version')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-amber-400" />
              <span>Check Versions</span>
            </button>
          </div>

          {/* Terminal Console */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[160px]">
            {isExecuting ? (
              <p className="text-slate-500 animate-pulse">جاري تنفيذ الأمر...</p>
            ) : (
              termOutput.map((line, idx) => (
                <p key={idx} className={line.startsWith('[$]') ? 'text-indigo-300 font-bold' : line.includes('Started') || line.includes('PONG') ? 'text-emerald-400' : 'text-slate-300'}>
                  {line}
                </p>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Acceptance Criteria */}
      {activeTab === 'criteria' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>معايير القبول والاعتماد (Acceptance Criteria Checklist)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تأكيد الجاهزية التامة للبدء في مراحل التطوير التالية</p>
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
