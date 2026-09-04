import React, { useState } from 'react';
import { 
  Rocket, Server, GitBranch, ShieldCheck, Database, Terminal, Copy, Check, 
  ExternalLink, Layers, RefreshCw, AlertTriangle, FileCode, CheckSquare, Clock, 
  Calendar, Cpu, Cloud, RotateCcw, Activity, ArrowRight, Zap
} from 'lucide-react';

export const DeploymentSpecsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'environments' | 'cicd' | 'prisma' | 'checklist' | 'rollback' | 'timeline'>('environments');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Interactive Checklist State
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', category: 'pre', text: 'تثبيت جميع التبعيات الموحدة (pnpm install --frozen-lockfile)', checked: true },
    { id: '2', category: 'pre', text: 'تشغيل جميع الاختبارات الأحادية والتكاملية (pnpm test)', checked: true },
    { id: '3', category: 'pre', text: 'فحص الأمان والتبعيات وتجاوز الثغرات (pnpm security-check)', checked: true },
    { id: '4', category: 'pre', text: 'بناء حزم Monorepo كاملة (pnpm build)', checked: true },
    { id: '5', category: 'pre', text: 'مراجعة وتوثيق المتغيرات البيئية لبيئة الإنتاج', checked: false },
    { id: '6', category: 'deploy', text: 'تشغيل هجرات قاعدة البيانات (Prisma / TypeORM Migrations)', checked: false },
    { id: '7', category: 'deploy', text: 'تطبيق التحديث على Vercel Production مع tgz split', checked: false },
    { id: '8', category: 'post', text: 'مراقبة السجلات الفورية وبلاغات السيرفر (Vercel Tail Logs)', checked: false },
    { id: '9', category: 'post', text: 'اختبار نقاط الـ API والمصادقة المباشرة (Health & Ping)', checked: false }
  ]);

  // Rollback Simulator State
  const [isSimulatingRollback, setIsSimulatingRollback] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleCheckitem = (id: string) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSimulateRollback = () => {
    setIsSimulatingRollback(true);
    setRollbackStatus('جاري التحقق من النسخة السابقة...');
    setTimeout(() => {
      setRollbackStatus('جاري التراجع عن هجرات DDL واستعادة النسخة الاحتياطية v1.9.8...');
      setTimeout(() => {
        setRollbackStatus('تم التراجع بنجاح إلى Production Build #20260904-STABLE في 42 ثانية!');
        setIsSimulatingRollback(false);
      }, 1500);
    }, 1200);
  };

  const githubActionsYaml = `name: Deploy Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: \${{ secrets.TURBO_TEAM }}

jobs:
  test:
    name: Test & Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint

  deploy-production:
    name: Deploy Production
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: npx vercel deploy --token=\${{ secrets.VERCEL_TOKEN }} --prod
        env:
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}`;

  const prismaSchemaCode = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  username       String    @unique @db.VarChar(100)
  email          String    @unique @db.VarChar(255)
  passwordHash   String    @map("password_hash") @db.VarChar(255)
  role           String    @default("admin") @db.VarChar(50)
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @default(now()) @updatedAt @map("updated_at")
  
  apiKeys        ApiKey[]
  templates      Template[]
  
  @@map("admin_users")
}

model ApiKey {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  adminUserId   String   @map("admin_user_id") @db.Uuid
  key           String   @unique @db.VarChar(64)
  name          String   @db.VarChar(100)
  rateLimit     Int      @default(1000) @map("rate_limit")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  
  adminUser     AdminUser @relation(fields: [adminUserId], references: [id])

  @@map("api_keys")
}`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" />

        <div>
          <div className="flex items-center gap-2">
            <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              DEP-ESP-2026-001 v1.0.0
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              معتمد لـ Vercel Monorepo + CI/CD
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-violet-400" />
            <span>خطة وخريطة النشر التلقائي للإنتاج (Deployment & CI/CD Pipeline)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة البيئات (Dev/Staging/Prod)، أتمتة GitHub Actions، هجرات قواعد البيانات Prisma، والتراجع الفوري
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://vercel.com/docs/monorepos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
            <span>Vercel Monorepo Docs</span>
          </a>
        </div>
      </div>

      {/* Environments Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dev Environment */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Server className="w-3.5 h-3.5" />
              <span>Development (المحلية)</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            <p className="text-slate-400">URL: <span className="text-emerald-300">http://localhost:3000</span></p>
            <p className="text-slate-400">Database: <span className="text-slate-200">PostgreSQL / SQLite</span></p>
            <p className="text-slate-400">Redis: <span className="text-slate-200">Local Redis Container</span></p>
          </div>
        </div>

        {/* Staging Environment */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
              <span>Staging (بيئة الاختبار)</span>
            </span>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded">Vercel Preview</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            <p className="text-slate-400">URL: <span className="text-sky-300">staging.email-service.app</span></p>
            <p className="text-slate-400">Database: <span className="text-slate-200">Vercel Postgres (Staging)</span></p>
            <p className="text-slate-400">Redis: <span className="text-slate-200">Vercel KV (Staging)</span></p>
          </div>
        </div>

        {/* Production Environment */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-indigo-500/40 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Production (الإنتاج النهائي)</span>
            </span>
            <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">Live 99.99%</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            <p className="text-slate-400">URL: <span className="text-indigo-300">https://api.email-service.com</span></p>
            <p className="text-slate-400">Database: <span className="text-slate-200">Vercel Postgres (Cluster)</span></p>
            <p className="text-slate-400">Redis: <span className="text-slate-200">Vercel KV (Replicated)</span></p>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('environments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'environments' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. هيكلة المشروع (Monorepo Packages)
        </button>

        <button
          onClick={() => setActiveTab('cicd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'cicd' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. أنبوب التبديل والتسليم (GitHub Actions CI/CD)
        </button>

        <button
          onClick={() => setActiveTab('prisma')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'prisma' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. هجرات قواعد البيانات (Prisma & Schema)
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'checklist' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. قائمة التدقيق المباشرة قبل النشر (Pre-Deploy Checklist)
        </button>

        <button
          onClick={() => setActiveTab('rollback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'rollback' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          5. محاكي التراجع التلقائي (Rollback Simulator)
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          6. جدول الإطلاق النهائي (Go-Live Timeline)
        </button>
      </div>

      {/* Tab 1: Monorepo Architecture */}
      {activeTab === 'environments' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>هيكلة حزم المشروع الموحد (pnpm Workspace + TurboRepo)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع الوحدات داخل مجلد packages لضمان إعادة استخدام الكود واستقلالية الاختبار
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-bold text-xs block font-mono">packages/api</span>
              <p className="text-[11px] text-slate-300">الخادم الخلفي للخدمات - واجهات API و Serverless Functions.</p>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded block">Vercel Functions</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-sky-400 font-bold text-xs block font-mono">packages/web</span>
              <p className="text-[11px] text-slate-300">الواجهة الأمامية ولوحة التحكم الإدارية Next.js App Router.</p>
              <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded block">Next.js Framework</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-xs block font-mono">packages/shared</span>
              <p className="text-[11px] text-slate-300">الأنواع المشتركة، الميدلوير، والمنطق الحسابي المشترك.</p>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded block">TypeScript Models</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold text-xs block font-mono">packages/sdk</span>
              <p className="text-[11px] text-slate-300">مكتبة Node.js SDK للعملاء والتطبيقات الخارجية.</p>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded block">NPM Package</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GitHub Actions CI/CD */}
      {activeTab === 'cicd' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-400 font-bold">.github/workflows/deploy.yml</span>
            <button
              onClick={() => copyCode(githubActionsYaml, 'ghCode')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedCodeId === 'ghCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCodeId === 'ghCode' ? 'تم النسخ' : 'نسخ ملف Workflow'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{githubActionsYaml}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Prisma Schema */}
      {activeTab === 'prisma' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-emerald-400 font-bold">prisma/schema.prisma</span>
            <button
              onClick={() => copyCode(prismaSchemaCode, 'prismaCode')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedCodeId === 'prismaCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCodeId === 'prismaCode' ? 'تم النسخ' : 'نسخ المخطط'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed">
            <code>{prismaSchemaCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 4: Interactive Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>قائمة التدقيق التفاعلية قبل النشر المباشر (Deployment Gate)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تأكيد الجاهزية واجتياز الفحوصات الأمنية والتقنية قبل إطلاق التحديث للعملاء
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              مكتمل {checklistItems.filter(i => i.checked).length} من {checklistItems.length}
            </span>
          </div>

          <div className="space-y-2">
            {checklistItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleCheckitem(item.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  item.checked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold ${
                  item.checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                }`}>
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Rollback Simulator */}
      {activeTab === 'rollback' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <span>محاكي التراجع التلقائي والتأمين من الكوارث (Automated Rollback Engine)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                استعادة الإصدار المستقر وتراجع الهجرات فوراً في حال تجاوز نسبة الأخطاء 5%
              </p>
            </div>

            <button
              onClick={handleSimulateRollback}
              disabled={isSimulatingRollback}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isSimulatingRollback ? 'جاري التراجع...' : 'محاكاة التراجع التلقائي الآن'}</span>
            </button>
          </div>

          {rollbackStatus && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 space-y-2">
              <span className="font-bold text-white block">حالة التراجع المباشر:</span>
              <p>{rollbackStatus}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block">مؤشرات الأداء المستهدفة التعافي:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li><strong>RPO (Recovery Point Objective):</strong> 5 دقائق.</li>
                <li><strong>RTO (Recovery Time Objective):</strong> أقل من 30 دقيقة.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-bold block">استراتيجية النسخ الاحتياطي:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>نسخ تلقائي يومي لقواعد البيانات `pg_dump` مع تخزين في Vercel Blob.</li>
                <li>حفظ واسترجاع الصور والنصوص لمدة تصل إلى 90 يوماً.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>الجدول الزمني للإطلاق النهائي (Go-Live Timeline Dec 2026)</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400">المرحلة الأولى</span>
                <span className="text-[10px] text-slate-500">7 ديسمبر 2026</span>
              </div>
              <h4 className="text-xs font-bold text-white">النشر على Staging</h4>
              <p className="text-[11px] text-slate-400">تهيئة بيئة الاختبار، تشغيل الفحوصات وإصلاح الأخطاء الأولية.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-400">المرحلة الثانية</span>
                <span className="text-[10px] text-slate-500">8 - 10 ديسمبر 2026</span>
              </div>
              <h4 className="text-xs font-bold text-white">اختبارات الحمل والأمان</h4>
              <p className="text-[11px] text-slate-400">اختبار الإجهاد وتحمل الخوادم مع k6 واختبارات الأمان.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400">المرحلة الثالثة</span>
                <span className="text-[10px] text-slate-500">11 - 12 ديسمبر 2026</span>
              </div>
              <h4 className="text-xs font-bold text-white">التدريب والتوثيق</h4>
              <p className="text-[11px] text-slate-400">تدريب فرق الدعم الفني وتوثيق إجراءات التشغيل والـ Runbooks.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">المرحلة الرابعة</span>
                <span className="text-[10px] text-emerald-400 font-bold">13 ديسمبر 2026</span>
              </div>
              <h4 className="text-xs font-bold text-white">الإطلاق النهائي Production</h4>
              <p className="text-[11px] text-slate-400">النشر إلى Production مع مراقبة نشطة ودعم على مدار الساعة.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
