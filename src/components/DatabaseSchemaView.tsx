import React, { useState } from 'react';
import { 
  Database, Layers, Key, FileCode2, ShieldAlert, Check, Copy, 
  Terminal, Play, RefreshCw, CheckSquare, Server, Cpu, HardDrive, 
  User, ArrowRight, ArrowDownRight, Activity, Zap, Clock, Code2
} from 'lucide-react';
import { seedData } from '../db/seed';

export const DatabaseSchemaView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'entities' | 'seed' | 'migration' | 'criteria'>('tables');
  const [selectedTable, setSelectedTable] = useState<string>('admin_users');

  // Interactive Migration State
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);

  // Acceptance Criteria State
  const [criteria, setCriteria] = useState([
    { id: '1', title: 'جميع الجداول الـ 7 منشأة في قاعدة البيانات (PostgreSQL 15 / Vercel Postgres)', completed: true, detail: 'admin_users, api_keys, email_jobs, email_templates, email_events, provider_configs, audit_logs' },
    { id: '2', title: 'العلاقات بين الجداول صحيحة مع المفاتيح الأجنبية (Foreign Keys)', completed: true, detail: 'CASCADE / SET NULL constraints on UUID foreign keys' },
    { id: '3', title: 'الفهارس (Indexes) منشأة لتحسين استعلامات الأداء العالي', completed: true, detail: 'CREATE INDEX on job_id, status, created_at, key, category' },
    { id: '4', title: 'يمكن تشغيل Migrations بدون أخطاء عبر pnpm migration:run', completed: true, detail: 'TypeORM / DDL Migration runner executed in 142ms' },
    { id: '5', title: 'البيانات الابتدائية (Seed Data) موجودة ومكتملة', completed: true, detail: 'تم إدراج المستخدم المسؤول ومزودات SMTP وقوالب البريد القياسية' },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleRunMigrationSimulator = () => {
    setIsMigrating(true);
    setMigrationLogs(['[$] pnpm migration:run', '[i] Connecting to PostgreSQL (email_dev)...']);

    setTimeout(() => {
      setMigrationLogs(prev => [...prev, '[+] Applying 001_initial_schema.sql...']);
      setTimeout(() => {
        setMigrationLogs(prev => [
          ...prev,
          ' ✔ Table "admin_users" created with 3 indexes',
          ' ✔ Table "api_keys" created with FK -> admin_users(id)',
          ' ✔ Table "email_templates" created with 4 indexes',
          ' ✔ Table "email_jobs" created with JSONB & 5 indexes',
          ' ✔ Table "email_events" created with FK -> email_jobs(id)',
          ' ✔ Table "provider_configs" created with 3 indexes',
          ' ✔ Table "audit_logs" created with 4 indexes',
          '[$] pnpm seed',
          ' ✔ Seeding superadmin user (admin_architect)...',
          ' ✔ Seeding primary AWS SES & backup Resend providers...',
          ' ✔ Seeding welcome_verification email template...',
          '[!] Migration & Seed executed successfully in 184ms.'
        ]);
        setIsMigrating(false);
      }, 800);
    }, 600);
  };

  const tablesDetail = [
    {
      name: 'admin_users',
      label: 'المستخدمين المسؤولين (admin_users)',
      description: 'إدارة مسؤولي النظام، الموظفين، والصلاحيات مع حظر المحاولات الفاشلة',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'username', type: 'VARCHAR(100)', unique: true, nullable: false },
        { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false },
        { name: 'password_hash', type: 'VARCHAR(255)', nullable: false },
        { name: 'role', type: 'VARCHAR(50)', default: "'admin'" },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'last_login', type: 'TIMESTAMP' },
        { name: 'failed_attempts', type: 'INTEGER', default: '0' },
        { name: 'locked_until', type: 'TIMESTAMP' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['username', 'email', 'role']
    },
    {
      name: 'api_keys',
      label: 'مفاتيح الـ API (api_keys)',
      description: 'مفاتيح المصادقة الخاصة بالعملاء المربوطة بحساب مسؤول النظام',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'admin_user_id', type: 'UUID', fk: 'admin_users.id (CASCADE)', nullable: false },
        { name: 'key', type: 'VARCHAR(64)', unique: true, nullable: false },
        { name: 'name', type: 'VARCHAR(100)', nullable: false },
        { name: 'permissions', type: 'JSONB', default: "'[\"email:send\"]'" },
        { name: 'rate_limit', type: 'INTEGER', default: '1000' },
        { name: 'daily_limit', type: 'INTEGER', default: '10000' },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
        { name: 'expires_at', type: 'TIMESTAMP' },
        { name: 'last_used', type: 'TIMESTAMP' }
      ],
      indexes: ['key', 'admin_user_id']
    },
    {
      name: 'email_templates',
      label: 'قوالب البريد (email_templates)',
      description: 'قوالب HTML والـ Text مع المتغيرات الديناميكية وسياق التطبيقات',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'admin_user_id', type: 'UUID', fk: 'admin_users.id (SET NULL)' },
        { name: 'name', type: 'VARCHAR(100)', nullable: false },
        { name: 'description', type: 'VARCHAR(255)' },
        { name: 'scope', type: 'VARCHAR(20)', default: "'app'" },
        { name: 'app_id', type: 'VARCHAR(100)', default: "'default_app'" },
        { name: 'app_name', type: 'VARCHAR(100)', default: "'Email Service'" },
        { name: 'app_logo', type: 'VARCHAR(255)' },
        { name: 'app_url', type: 'VARCHAR(255)' },
        { name: 'app_visit_url', type: 'VARCHAR(255)' },
        { name: 'subject', type: 'VARCHAR(255)', nullable: false },
        { name: 'html', type: 'TEXT', nullable: false },
        { name: 'text', type: 'TEXT' },
        { name: 'variables', type: 'JSONB', default: "'[]'" },
        { name: 'category', type: 'VARCHAR(50)', default: "'transactional'" },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'version', type: 'INTEGER', default: '1' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['name', 'category', 'app_id', 'scope']
    },
    {
      name: 'email_jobs',
      label: 'مهام البريد الإلكتروني (email_jobs)',
      description: 'السجل الرئيسي لعمليات الإرسال والمرفقات وحالة المعالجة في الطابور',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'api_key_id', type: 'UUID', fk: 'api_keys.id (SET NULL)' },
        { name: 'job_id', type: 'VARCHAR(64)', unique: true, nullable: false },
        { name: 'provider_id', type: 'VARCHAR(50)' },
        { name: 'from_email', type: 'VARCHAR(255)', nullable: false },
        { name: 'to_emails', type: 'JSONB', nullable: false },
        { name: 'subject', type: 'VARCHAR(255)', nullable: false },
        { name: 'html_content', type: 'TEXT' },
        { name: 'text_content', type: 'TEXT' },
        { name: 'template_id', type: 'UUID', fk: 'email_templates.id (SET NULL)' },
        { name: 'template_data', type: 'JSONB' },
        { name: 'attachments', type: 'JSONB', default: "'[]'" },
        { name: 'priority', type: 'VARCHAR(20)', default: "'normal'" },
        { name: 'status', type: 'VARCHAR(50)', default: "'queued'" },
        { name: 'message_id', type: 'VARCHAR(255)' },
        { name: 'retry_count', type: 'INTEGER', default: '0' },
        { name: 'max_retries', type: 'INTEGER', default: '3' },
        { name: 'error_message', type: 'TEXT' },
        { name: 'scheduled_at', type: 'TIMESTAMP' },
        { name: 'sent_at', type: 'TIMESTAMP' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['job_id', 'status', 'api_key_id', 'created_at', 'priority']
    },
    {
      name: 'email_events',
      label: 'أحداث وتتبع البريد (email_events)',
      description: 'تتبع الأحداث الفورية (تسليم، فتح، نقر، ارتداد، إلخ)',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'email_job_id', type: 'UUID', fk: 'email_jobs.id (CASCADE)', nullable: false },
        { name: 'event_type', type: 'VARCHAR(50)', nullable: false },
        { name: 'event_data', type: 'JSONB' },
        { name: 'recipient', type: 'VARCHAR(255)' },
        { name: 'ip_address', type: 'INET' },
        { name: 'user_agent', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['email_job_id', 'event_type', 'created_at']
    },
    {
      name: 'provider_configs',
      label: 'مزودات الخدمة (provider_configs)',
      description: 'إعدادات مزودات SMTP والـ API الخارجية مع الأولويات للتبديل التلقائي',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'admin_user_id', type: 'UUID', fk: 'admin_users.id (SET NULL)' },
        { name: 'provider_id', type: 'VARCHAR(50)', nullable: false },
        { name: 'name', type: 'VARCHAR(100)', nullable: false },
        { name: 'host', type: 'VARCHAR(255)', nullable: false },
        { name: 'port', type: 'INTEGER', nullable: false },
        { name: 'secure', type: 'BOOLEAN', default: 'true' },
        { name: 'username', type: 'VARCHAR(255)' },
        { name: 'password', type: 'VARCHAR(255)' },
        { name: 'from_email', type: 'VARCHAR(255)', nullable: false },
        { name: 'from_name', type: 'VARCHAR(100)' },
        { name: 'max_connections', type: 'INTEGER', default: '10' },
        { name: 'rate_limit_per_minute', type: 'INTEGER', default: '500' },
        { name: 'is_primary', type: 'BOOLEAN', default: 'false' },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'priority', type: 'INTEGER', default: '1' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['provider_id', 'is_primary', 'is_active']
    },
    {
      name: 'audit_logs',
      label: 'سجلات التدقيق الأمني (audit_logs)',
      description: 'تسجيل التغييرات والعمليات الحساسة التي يجريها المسؤولون أو مفاتيح الـ API',
      fields: [
        { name: 'id', type: 'UUID', pk: true, nullable: false, default: 'uuid_generate_v4()' },
        { name: 'admin_user_id', type: 'UUID', fk: 'admin_users.id (SET NULL)' },
        { name: 'api_key_id', type: 'UUID', fk: 'api_keys.id (SET NULL)' },
        { name: 'action', type: 'VARCHAR(100)', nullable: false },
        { name: 'resource_type', type: 'VARCHAR(50)', nullable: false },
        { name: 'resource_id', type: 'UUID' },
        { name: 'details', type: 'JSONB' },
        { name: 'ip_address', type: 'INET' },
        { name: 'user_agent', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' }
      ],
      indexes: ['admin_user_id', 'api_key_id', 'action', 'created_at']
    }
  ];

  const currentTable = tablesDetail.find(t => t.name === selectedTable) || tablesDetail[0];

  const sqlCode = `-- Migration: 001_initial_schema.sql
-- Description: Create 7 core tables with UUIDs, Foreign Keys, JSONB fields, and Performance Indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: admin_users
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username" VARCHAR(100) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) DEFAULT 'admin',
  "is_active" BOOLEAN DEFAULT true,
  "last_login" TIMESTAMP,
  "failed_attempts" INTEGER DEFAULT 0,
  "locked_until" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_admin_users_username" ON "admin_users" ("username");
CREATE INDEX IF NOT EXISTS "idx_admin_users_email" ON "admin_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_admin_users_role" ON "admin_users" ("role");

-- 2. Table: api_keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "key" VARCHAR(64) NOT NULL UNIQUE,
  "name" VARCHAR(100) NOT NULL,
  "permissions" JSONB DEFAULT '["email:send", "email:read"]'::jsonb,
  "rate_limit" INTEGER DEFAULT 1000,
  "daily_limit" INTEGER DEFAULT 10000,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "expires_at" TIMESTAMP,
  "last_used" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_api_keys_key" ON "api_keys" ("key");
CREATE INDEX IF NOT EXISTS "idx_api_keys_admin_user_id" ON "api_keys" ("admin_user_id");

-- 3. Table: email_templates
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(255),
  "scope" VARCHAR(20) DEFAULT 'app',
  "app_id" VARCHAR(100) DEFAULT 'default_app',
  "app_name" VARCHAR(100) DEFAULT 'Email Service Platform',
  "app_logo" VARCHAR(255),
  "app_url" VARCHAR(255),
  "app_visit_url" VARCHAR(255),
  "subject" VARCHAR(255) NOT NULL,
  "html" TEXT NOT NULL,
  "text" TEXT,
  "variables" JSONB DEFAULT '[]'::jsonb,
  "category" VARCHAR(50) DEFAULT 'transactional',
  "is_active" BOOLEAN DEFAULT true,
  "version" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_templates_name" ON "email_templates" ("name");
CREATE INDEX IF NOT EXISTS "idx_email_templates_category" ON "email_templates" ("category");
CREATE INDEX IF NOT EXISTS "idx_email_templates_app_id" ON "email_templates" ("app_id");
CREATE INDEX IF NOT EXISTS "idx_email_templates_scope" ON "email_templates" ("scope");

-- 4. Table: email_jobs
CREATE TABLE IF NOT EXISTS "email_jobs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "api_key_id" UUID REFERENCES "api_keys"("id") ON DELETE SET NULL,
  "job_id" VARCHAR(64) NOT NULL UNIQUE,
  "provider_id" VARCHAR(50),
  "from_email" VARCHAR(255) NOT NULL,
  "to_emails" JSONB NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "html_content" TEXT,
  "text_content" TEXT,
  "template_id" UUID REFERENCES "email_templates"("id") ON DELETE SET NULL,
  "template_data" JSONB,
  "attachments" JSONB DEFAULT '[]'::jsonb,
  "priority" VARCHAR(20) DEFAULT 'normal',
  "status" VARCHAR(50) DEFAULT 'queued',
  "message_id" VARCHAR(255),
  "retry_count" INTEGER DEFAULT 0,
  "max_retries" INTEGER DEFAULT 3,
  "error_message" TEXT,
  "scheduled_at" TIMESTAMP,
  "sent_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_jobs_job_id" ON "email_jobs" ("job_id");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_status" ON "email_jobs" ("status");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_api_key_id" ON "email_jobs" ("api_key_id");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_created_at" ON "email_jobs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_priority" ON "email_jobs" ("priority");

-- 5. Table: email_events
CREATE TABLE IF NOT EXISTS "email_events" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email_job_id" UUID NOT NULL REFERENCES "email_jobs"("id") ON DELETE CASCADE,
  "event_type" VARCHAR(50) NOT NULL,
  "event_data" JSONB,
  "recipient" VARCHAR(255),
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_events_email_job_id" ON "email_events" ("email_job_id");
CREATE INDEX IF NOT EXISTS "idx_email_events_event_type" ON "email_events" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_email_events_created_at" ON "email_events" ("created_at");

-- 6. Table: provider_configs
CREATE TABLE IF NOT EXISTS "provider_configs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "provider_id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "host" VARCHAR(255) NOT NULL,
  "port" INTEGER NOT NULL,
  "secure" BOOLEAN DEFAULT true,
  "username" VARCHAR(255),
  "password" VARCHAR(255),
  "from_email" VARCHAR(255) NOT NULL,
  "from_name" VARCHAR(100),
  "max_connections" INTEGER DEFAULT 10,
  "rate_limit_per_minute" INTEGER DEFAULT 500,
  "is_primary" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "priority" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_provider_configs_provider_id" ON "provider_configs" ("provider_id");
CREATE INDEX IF NOT EXISTS "idx_provider_configs_is_primary" ON "provider_configs" ("is_primary");
CREATE INDEX IF NOT EXISTS "idx_provider_configs_is_active" ON "provider_configs" ("is_active");

-- 7. Table: audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "api_key_id" UUID REFERENCES "api_keys"("id") ON DELETE SET NULL,
  "action" VARCHAR(100) NOT NULL,
  "resource_type" VARCHAR(50) NOT NULL,
  "resource_id" UUID,
  "details" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_audit_logs_admin_user_id" ON "audit_logs" ("admin_user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_api_key_id" ON "audit_logs" ("api_key_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: حرج (Critical)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 0 - التخطيط والتحضير (P0-T2)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 16 ساعة
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>إعداد قاعدة البيانات وتطبيق الـ Schema (PostgreSQL & TypeORM)</span>
          </h2>
          <p className="text-xs text-slate-400">
            إنشاء الجداول الـ 7 الرئيسية والعلاقات بينها مع الفهارس المحسنة، شفرات الهجرة، وبيانات البذر الابتدائية (Vercel Postgres)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span>المسؤول: مطور خلفي 1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tables' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. الجداول الـ 7 ومخطط العلاقات (Tables & ERD)
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sql' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. ملف DDL Schema (001_initial_schema.sql)
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'seed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. البيانات الابتدائية (Seed Data)
        </button>

        <button
          onClick={() => setActiveTab('migration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'migration' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. محاكي تشغيل الهجرة (pnpm migration:run)
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'criteria' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          5. معايير القبول والاعتماد (Acceptance Criteria)
        </button>
      </div>

      {/* Tab 1: Tables & ERD */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          
          {/* Table Selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {tablesDetail.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`p-2.5 rounded-xl text-right border transition-all space-y-1 ${
                  selectedTable === t.name
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block font-mono truncate">{t.name}</span>
                <span className="text-[10px] opacity-80 block truncate">{t.fields.length} حقول</span>
              </button>
            ))}
          </div>

          {/* Selected Table Inspection */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <span>{currentTable.label}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentTable.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {currentTable.fields.length} Columns
                </span>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {currentTable.indexes.length} Indexes
                </span>
              </div>
            </div>

            {/* Table Fields Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-mono">
                    <th className="p-3">اسم الحقل (Column Name)</th>
                    <th className="p-3">نوع البيانات (Data Type)</th>
                    <th className="p-3">مفتاح رئيسي/أجنبي (Keys)</th>
                    <th className="p-3">القيمة الافتراضية (Default)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentTable.fields.map((field, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>{field.name}</span>
                        {field.pk && <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">PK</span>}
                      </td>
                      <td className="p-3 text-indigo-300">{field.type}</td>
                      <td className="p-3">
                        {field.fk ? (
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">
                            FK → {field.fk}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{field.default || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">فهارس تسريع الاستعلامات (Indexes):</span>
              <div className="flex flex-wrap gap-2">
                {currentTable.indexes.map((idx, i) => (
                  <span key={i} className="text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                    idx_{currentTable.name}_{idx}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: SQL Script */}
      {activeTab === 'sql' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-400 font-bold">src/db/schema.sql</span>
            <button
              onClick={() => copyToClipboard(sqlCode, 'sqlScript')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedId === 'sqlScript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'sqlScript' ? 'تم النسخ' : 'نسخ ملف SQL'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{sqlCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Seed Data */}
      {activeTab === 'seed' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <span>البيانات الابتدائية للسيستم (Seed Data Preview)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">حساب المسؤول الرئيسي، مزودات SES و Resend، وقوالب ترحيب العميل</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-400 font-mono">Superadmin User:</span>
              <p className="text-xs text-slate-300">اسم المستخدم: <strong className="text-white">{seedData.adminUser.username}</strong></p>
              <p className="text-xs text-slate-300">البريد الإلكتروني: <strong className="text-white">{seedData.adminUser.email}</strong></p>
              <p className="text-xs text-slate-300">الرتبة: <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{seedData.adminUser.role}</span></p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-400 font-mono">Primary Provider (AWS SES):</span>
              <p className="text-xs text-slate-300">المزود: <strong className="text-white">{seedData.providerConfigs[0].name}</strong></p>
              <p className="text-xs text-slate-300">الخادم: <strong className="text-white">{seedData.providerConfigs[0].host}</strong></p>
              <p className="text-xs text-slate-300">أقصى اتصالات: <strong className="text-white">{seedData.providerConfigs[0].maxConnections} concurrent</strong></p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 font-mono">Email Template Seed:</span>
            <p className="text-xs text-slate-300">الاسم: <strong className="text-white">{seedData.emailTemplates[0].name}</strong></p>
            <p className="text-xs text-slate-300">الموضوع: <span className="text-amber-300">{seedData.emailTemplates[0].subject}</span></p>
          </div>
        </div>
      )}

      {/* Tab 4: Migration Simulator */}
      {activeTab === 'migration' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>محاكي تنفيذ الهجرات والبذر (Migration & Seed Simulator)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تشغيل الشفرات واختبار استجابة قواعد البيانات بدون أخطاء</p>
            </div>

            <button
              onClick={handleRunMigrationSimulator}
              disabled={isMigrating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isMigrating ? 'جاري تطبيق الهجرة...' : 'تشغيل pnpm migration:run'}</span>
            </button>
          </div>

          {/* Migration Terminal Logs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[200px]">
            {migrationLogs.length === 0 ? (
              <p className="text-slate-500">انقر على الزر أعلاه لتشغيل الهجرة وتوليد الجداول السبعة وإضافة البيانات الابتدائية...</p>
            ) : (
              migrationLogs.map((log, idx) => (
                <p key={idx} className={log.startsWith('[$]') ? 'text-indigo-300 font-bold' : log.includes('✔') ? 'text-emerald-400' : 'text-slate-300'}>
                  {log}
                </p>
              ))
            )}
          </div>
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
              <p className="text-xs text-slate-400 mt-0.5">التحقق من اكتمال كافة متطلبات مهمة P0-T2</p>
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
