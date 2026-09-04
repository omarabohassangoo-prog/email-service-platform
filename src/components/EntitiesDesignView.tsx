import React, { useState } from 'react';
import { 
  Database, Table, Network, CheckSquare, Check, Copy, Play, 
  RefreshCw, Layers, ShieldCheck, User, Code2, ArrowRight,
  Key, FileCode2, Inbox, Server, Activity, ArrowUpRight, Zap
} from 'lucide-react';
import { AdminUser, ApiKey, EmailTemplate, EmailJob, EmailEvent, ProviderConfig, AuditLog } from '../db/entities';
import { AppDataSourceConfig } from '../db/data-source';

export const EntitiesDesignView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'entities' | 'erd' | 'validation' | 'code' | 'criteria'>('entities');
  const [selectedEntityName, setSelectedEntityName] = useState<string>('AdminUser');

  // Interactive Validation / ORM Simulator
  const [validationLogs, setValidationLogs] = useState<string[]>([
    '[TypeORM] Loaded 7 Entities into DataSource',
    '[Validation] Class-validator decorator rules active on @Column annotations',
    '[Relations] AdminUser -> ApiKey (OneToMany) verified',
    '[Relations] EmailJob -> EmailEvent (OneToMany) verified'
  ]);

  // Acceptance Criteria Checklist
  const [criteria, setCriteria] = useState([
    { id: '1', title: 'جميع الكيانات الـ 7 منشأة باستخدام ديكورات TypeORM والعلاقات الصحيحة', completed: true, detail: 'OneToMany و ManyToOne معرفة بالكامل بأسلوب TypeORM الصارم' },
    { id: '2', title: 'يمكن تشغيل وسحب metadata الكيانات من TypeORM دون أخطاء', completed: true, detail: 'AppDataSource يعالج الكيانات الـ 7 مع إمكانيات الجلب والحفظ' },
    { id: '3', title: 'التحقق من الصحة والقيود (Unique & Not Null) منشأة وتعمل', completed: true, detail: 'شروط البريد الإلكتروني والمستخدم واسم المفتاح ونوع الأولوية محمية' },
    { id: '4', title: 'فهارس الأداء (Performance Indexes) مطبقة على حقول الاستعلام المزدحم', completed: true, detail: 'ديكورات @Index مضافة على id, username, email, status, action' },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleRunOrmValidation = (entityName: string) => {
    setValidationLogs(prev => [
      `[ORM Check] Validating entity "${entityName}" metadata...`,
      `✔ Primary key: UUID v4 generated`,
      `✔ Foreign keys & cascades configured`,
      `✔ Indices registered on database schema`,
      ...prev
    ]);
  };

  const entitiesList = [
    {
      name: 'AdminUser',
      tableName: 'admin_users',
      icon: User,
      desc: 'حسابات المسؤولين، الصلاحيات وقفل الحساب عند المحاولات الخاطئة',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'username', type: 'varchar(100)', unique: true, desc: 'اسم المستخدم' },
        { name: 'email', type: 'varchar(255)', unique: true, desc: 'البريد الإلكتروني الرسمي' },
        { name: 'passwordHash', type: 'varchar(255)', desc: 'تشفير كلمة المرور' },
        { name: 'role', type: 'enum', default: 'admin', desc: 'الصلاحيات (superadmin, admin, operator, viewer)' },
        { name: 'failedAttempts', type: 'integer', default: '0', desc: 'عدد المحاولات الفاشلة' },
        { name: 'lockedUntil', type: 'timestamp', nullable: true, desc: 'تاريخ إزالة الحظر' }
      ],
      relations: [
        { type: 'OneToMany', target: 'ApiKey', property: 'apiKeys', desc: 'مفاتيح API المخصصة للمستخدم' },
        { type: 'OneToMany', target: 'EmailTemplate', property: 'templates', desc: 'القوالب المنشأة بواسطة المستخدم' },
        { type: 'OneToMany', target: 'AuditLog', property: 'auditLogs', desc: 'سجل العمليات والأحداث' }
      ]
    },
    {
      name: 'ApiKey',
      tableName: 'api_keys',
      icon: Key,
      desc: 'مفاتيح واجهة البرمجة (API Keys) المربوطة بالمسؤولين والحدود اليومية',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'adminUserId', type: 'uuid', fk: true, desc: 'معرف المسؤول المالك' },
        { name: 'key', type: 'varchar(255)', unique: true, desc: 'نص المفتاح المشفر esp_live_...' },
        { name: 'rateLimit', type: 'integer', default: '100', desc: 'حد الطلبات بالدقيقة' },
        { name: 'dailyLimit', type: 'integer', default: '10000', desc: 'الحد اليومي للإرسال' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'AdminUser', property: 'adminUser', desc: 'المسؤول المالك للمفتاح' },
        { type: 'OneToMany', target: 'EmailJob', property: 'emailJobs', desc: 'المهام المرسلة عبر المفتاح' }
      ]
    },
    {
      name: 'EmailTemplate',
      tableName: 'email_templates',
      icon: FileCode2,
      desc: 'قوالب البريد الإلكتروني مع دعم متغيرات Dynamic JSONB وهيكل التطبيقات',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'name', type: 'varchar(100)', unique: true, desc: 'اسم القالب الفريد' },
        { name: 'scope', type: 'varchar(20)', default: 'app', desc: 'النطاق (app, system, global)' },
        { name: 'appId', type: 'varchar(100)', desc: 'معرف التطبيق المرفق' },
        { name: 'html', type: 'text', desc: 'شفرة HTML الخاصة بالقالب' },
        { name: 'variables', type: 'jsonb', desc: 'مصفوفة المتغيرات المطلوبة' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'AdminUser', property: 'adminUser', desc: 'منشئ القالب' },
        { type: 'OneToMany', target: 'EmailJob', property: 'emailJobs', desc: 'الرسائل المرسلة بناء على القالب' }
      ]
    },
    {
      name: 'EmailJob',
      tableName: 'email_jobs',
      icon: Inbox,
      desc: 'سجل مهام إرسال البريد الإلكتروني، الحالات الأولوية وإعادات المحاولة',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'jobId', type: 'varchar(100)', unique: true, desc: 'معرف المهمة في الطابور' },
        { name: 'fromEmail', type: 'varchar(255)', desc: 'عنوان المرسل' },
        { name: 'toEmails', type: 'jsonb', desc: 'قائمة عناوين المستقبلين' },
        { name: 'priority', type: 'varchar(20)', default: 'normal', desc: 'الأولوية (low, normal, high, urgent)' },
        { name: 'status', type: 'varchar(20)', default: 'queued', desc: 'الحالة (queued, processing, sent, failed, retrying)' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'ApiKey', property: 'apiKey', desc: 'مفتاح API المستخدم للإرسال' },
        { type: 'ManyToOne', target: 'EmailTemplate', property: 'template', desc: 'القالب المستخدم' },
        { type: 'OneToMany', target: 'EmailEvent', property: 'events', desc: 'سجل الأحداث الفورية (فتح، نقر، ارتداد)' }
      ]
    },
    {
      name: 'EmailEvent',
      tableName: 'email_events',
      icon: Zap,
      desc: 'الأحداث الفورية المربوطة بالرسالة (تسليم، فتح، نقر، ارتداد)',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'emailJobId', type: 'uuid', fk: true, desc: 'معرف المهمة المربوطة' },
        { name: 'eventType', type: 'varchar(50)', desc: 'نوع الحدث (delivered, opened, clicked, bounced)' },
        { name: 'ipAddress', type: 'varchar(45)', desc: 'عنوان IP للمستقبل' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'EmailJob', property: 'emailJob', desc: 'الرسالة الأصلية المربوطة' }
      ]
    },
    {
      name: 'ProviderConfig',
      tableName: 'provider_configs',
      icon: Server,
      desc: 'إعدادات خوادم SMTP والمزودين التجميعية مع إعدادات التبديل وزمن الاستجابة',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'providerId', type: 'varchar(100)', unique: true, desc: 'معرف المزود الفريد' },
        { name: 'host', type: 'varchar(255)', desc: 'عنوان خادم SMTP' },
        { name: 'port', type: 'integer', default: '587', desc: 'المنفذ' },
        { name: 'isPrimary', type: 'boolean', default: 'false', desc: 'خادم رئيسي' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'AdminUser', property: 'adminUser', desc: 'المسؤول المضيف' }
      ]
    },
    {
      name: 'AuditLog',
      tableName: 'audit_logs',
      icon: Activity,
      desc: 'سجل التدقيق والعمليات الحساسة التي جرت في النظام للأمان والامتثال',
      columns: [
        { name: 'id', type: 'uuid', pk: true, nullable: false, desc: 'المعرف الفريد' },
        { name: 'adminUserId', type: 'uuid', fk: true, desc: 'معرف المسؤول المنفذ' },
        { name: 'action', type: 'varchar(100)', desc: 'نوع الإجراء الحساس' },
        { name: 'resourceType', type: 'varchar(100)', desc: 'المورد المتأثر' }
      ],
      relations: [
        { type: 'ManyToOne', target: 'AdminUser', property: 'adminUser', desc: 'المسؤول المنفذ' }
      ]
    }
  ];

  const entityCodeSnippets: Record<string, string> = {
    AdminUser: `// src/db/entities/AdminUser.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { ApiKey } from './ApiKey';
import { EmailTemplate } from './EmailTemplate';

@Entity('admin_users')
@Index('idx_admin_username', ['username'])
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  username!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ default: 'admin', length: 50 })
  role!: 'superadmin' | 'admin' | 'operator' | 'viewer';

  @OneToMany(() => ApiKey, (apiKey) => apiKey.adminUser)
  apiKeys!: ApiKey[];
}`,
    ApiKey: `// src/db/entities/ApiKey.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AdminUser } from './AdminUser';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  key!: string;

  @Column({ name: 'rate_limit', default: 100 })
  rateLimit!: number;

  @ManyToOne(() => AdminUser, (admin) => admin.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser!: AdminUser;
}`,
    'data-source.ts': `// src/db/data-source.ts
import { DataSource } from 'typeorm';
import { AdminUser, ApiKey, EmailTemplate, EmailJob, EmailEvent, ProviderConfig, AuditLog } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  synchronize: false,
  entities: [AdminUser, ApiKey, EmailTemplate, EmailJob, EmailEvent, ProviderConfig, AuditLog],
  migrations: ['src/db/migrations/*.ts']
});`
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-sky-500" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              أولوية: حرج (Critical)
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المرحلة 1 - التصميم الأساسي (P1-T1)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              المدة: 16 ساعة
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>تصميم كيانات قاعدة البيانات (TypeORM Entities Design & Relations)</span>
          </h2>
          <p className="text-xs text-slate-400">
            إنشاء الكيانات الـ 7 مع العلاقات الخارجية (OneToMany & ManyToOne)، القيود، الفهارس، ومصفوفات التحقق الصارمة
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-emerald-400" />
          <span>المسؤول: مطور خلفي 1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('entities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'entities' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          1. مستعرض الكيانات الـ 7 (Entity Explorer)
        </button>

        <button
          onClick={() => setActiveTab('erd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'erd' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          2. مخطط العلاقات السيني (ERD Diagram)
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'validation' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          3. محاكي التحقق بـ TypeORM (ORM Validator)
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          4. الشفرات والمكونات (Entities & DataSource Code)
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

      {/* Tab 1: Entities Explorer */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of Entities */}
          <div className="space-y-2">
            {entitiesList.map((ent) => {
              const IconComp = ent.icon;
              return (
                <div
                  key={ent.name}
                  onClick={() => setSelectedEntityName(ent.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedEntityName === ent.name
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-emerald-400" />
                      <span>{ent.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{ent.tableName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ent.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Entity View */}
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            {(() => {
              const current = entitiesList.find(e => e.name === selectedEntityName) || entitiesList[0];
              const IconComp = current.icon;
              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <IconComp className="w-5 h-5 text-emerald-400" />
                        <span>Entity: {current.name}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Table: {current.tableName}</p>
                    </div>

                    <button
                      onClick={() => handleRunOrmValidation(current.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>فحص TypeORM</span>
                    </button>
                  </div>

                  {/* Columns Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400">الحقول والأعمدة (Columns Metadata):</span>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">اسم الحقل</th>
                            <th className="p-3">النوع (Type)</th>
                            <th className="p-3">القيود</th>
                            <th className="p-3">الوصف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono">
                          {current.columns.map((col, idx) => (
                            <tr key={idx} className="hover:bg-slate-950/50">
                              <td className="p-3 font-bold text-indigo-300 flex items-center gap-1.5">
                                {col.pk && <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded">PK</span>}
                                {col.fk && <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1.5 py-0.5 rounded">FK</span>}
                                <span>{col.name}</span>
                              </td>
                              <td className="p-3 text-emerald-400">{col.type}</td>
                              <td className="p-3 text-slate-400">
                                {col.unique && <span className="text-rose-400 mr-1">UNIQUE</span>}
                                {col.default !== undefined && <span>DEFAULT ({col.default})</span>}
                              </td>
                              <td className="p-3 text-slate-400 font-sans">{col.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relations */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400">العلاقات التفرعية (Relations):</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {current.relations.map((rel, idx) => (
                        <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400 font-mono">{rel.property}</span>
                            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">
                              {rel.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">Target: <strong className="text-white">{rel.target}</strong></p>
                          <p className="text-[10px] text-slate-400">{rel.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      )}

      {/* Tab 2: ERD Diagram */}
      {activeTab === 'erd' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <span>مخطط العلاقات الشامل (Entity Relationship Network)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تتبع سريان المفاتيح الأجنبية والتسلسل الهرمي بين الجداول الـ 7</p>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 p-4 rounded-xl border border-indigo-500/30 space-y-2">
                <span className="text-xs font-bold text-indigo-400 block font-mono">AdminUser (المسؤول)</span>
                <p className="text-[11px] text-slate-300">يملك حساب الكيان الرئيسي ويدير المفاتيح والقوالب</p>
                <div className="text-[10px] font-mono text-emerald-400 space-y-1 pt-1 border-t border-slate-800">
                  <p>⬇ OneToMany: api_keys</p>
                  <p>⬇ OneToMany: email_templates</p>
                  <p>⬇ OneToMany: provider_configs</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-sky-500/30 space-y-2">
                <span className="text-xs font-bold text-sky-400 block font-mono">ApiKey (المفتاح)</span>
                <p className="text-[11px] text-slate-300">يربط الطلبات الخارجية بحدود الاستخدام</p>
                <div className="text-[10px] font-mono text-sky-300 space-y-1 pt-1 border-t border-slate-800">
                  <p>⬆ ManyToOne: admin_users</p>
                  <p>⬇ OneToMany: email_jobs</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block font-mono">EmailJob (الرسالة)</span>
                <p className="text-[11px] text-slate-300">سجل المهمة الأساسية للإرسال عبر الطابور</p>
                <div className="text-[10px] font-mono text-emerald-300 space-y-1 pt-1 border-t border-slate-800">
                  <p>⬆ ManyToOne: api_keys / templates</p>
                  <p>⬇ OneToMany: email_events</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ORM Validation Simulator */}
      {activeTab === 'validation' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>محاكي فحص TypeORM Metadata & Relationships</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">اختبار وتأكيد سلامة القيود والفهارس عند البدء</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[160px]">
            {validationLogs.map((log, idx) => (
              <p key={idx} className={log.includes('✔') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Code Preview */}
      {activeTab === 'code' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {Object.keys(entityCodeSnippets).map(name => (
                <button
                  key={name}
                  onClick={() => setSelectedEntityName(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    selectedEntityName === name ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(entityCodeSnippets[selectedEntityName] || '', selectedEntityName)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedId === selectedEntityName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ الشفرة</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            <code>{entityCodeSnippets[selectedEntityName] || '// File ready in /src/db/entities/'}</code>
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
              <p className="text-xs text-slate-400 mt-0.5">التحقق من اكتمال كافة متطلبات مهمة P1-T1</p>
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
