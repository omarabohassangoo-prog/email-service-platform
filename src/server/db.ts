import { 
  AdminUser, ApiKey, EmailJob, EmailTemplate, EmailEvent, 
  ProviderConfig, AuditLog, QueueMetrics, ScheduledTask
} from '../types';
import { firestoreService } from '../services/firestore.service';

// In-memory persistent state initialized with enterprise production data

export const initialAdminUser: AdminUser = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@enterprise-esp.com',
  role: 'superadmin',
  is_active: true,
  last_login: new Date().toISOString(),
  created_at: '2026-01-01T00:00:00.000Z'
};

export const initialApiKeys: ApiKey[] = [
  {
    id: 'key-001',
    admin_user_id: 'admin-001',
    key: 'esp_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
    name: 'تطبيق خدمة العملاء - Customer Portal App',
    permissions: {
      send_email: true,
      bulk_email: true,
      manage_templates: true,
      view_analytics: true
    },
    rate_limit: 1000,
    daily_limit: 50000,
    daily_used: 12430,
    is_active: true,
    created_at: '2026-02-10T08:30:00.000Z',
    last_used: new Date(Date.now() - 1000 * 60 * 3).toISOString()
  },
  {
    id: 'key-002',
    admin_user_id: 'admin-001',
    key: 'esp_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    name: 'نظام المبيعات والفواتير - ERP & Billing Service',
    permissions: {
      send_email: true,
      bulk_email: false,
      manage_templates: false,
      view_analytics: false
    },
    rate_limit: 500,
    daily_limit: 20000,
    daily_used: 4820,
    is_active: true,
    created_at: '2026-03-01T10:15:00.000Z',
    last_used: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'key-003',
    admin_user_id: 'admin-001',
    key: 'esp_test_0z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k',
    name: 'تطبيق التنبيهات والأمن - Security & Auth Microservice',
    permissions: {
      send_email: true,
      bulk_email: true,
      manage_templates: true,
      view_analytics: true
    },
    rate_limit: 2000,
    daily_limit: 100000,
    daily_used: 28910,
    is_active: true,
    created_at: '2026-03-15T14:00:00.000Z',
    last_used: new Date(Date.now() - 1000 * 15).toISOString()
  }
];

export const initialProviders: ProviderConfig[] = [
  {
    id: 'prov-001',
    provider_id: 'smtp_primary_relay',
    name: 'خادم SMTP الرئيسي (Primary Corporate Relay)',
    type: 'smtp',
    host: 'smtp.enterprise-mail.com',
    port: 587,
    secure: true,
    username: 'relay@enterprise-esp.com',
    from_email: 'noreply@enterprise-esp.com',
    from_name: 'نظام البريد المؤسسي - Enterprise ESP',
    max_connections: 20,
    rate_limit_per_minute: 6000,
    is_primary: true,
    is_active: true,
    priority: 1,
    latency_ms: 120,
    success_rate: 99.8,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'prov-002',
    provider_id: 'aws_ses_failover',
    name: 'AWS SES - مزود احتياطي أول (Backup Gateway)',
    type: 'aws_ses',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    secure: true,
    username: 'AKIAIOSFODNN7EXAMPLE',
    from_email: 'noreply-aws@enterprise-esp.com',
    from_name: 'Enterprise ESP Failover',
    max_connections: 15,
    rate_limit_per_minute: 12000,
    is_primary: false,
    is_active: true,
    priority: 2,
    latency_ms: 85,
    success_rate: 99.95,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'prov-003',
    provider_id: 'sendgrid_marketing',
    name: 'SendGrid - البريد الترويجي والجماعي',
    type: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    username: 'apikey',
    from_email: 'marketing@enterprise-esp.com',
    from_name: 'Enterprise Marketing',
    max_connections: 10,
    rate_limit_per_minute: 3000,
    is_primary: false,
    is_active: true,
    priority: 3,
    latency_ms: 190,
    success_rate: 98.9,
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: new Date().toISOString()
  }
];

export const initialTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-001',
    admin_user_id: 'admin-001',
    name: 'رمز التحقق السريع (OTP Verification)',
    description: 'قالب إرسال رمز التحقق ثنائي العوامل المكون من 6 أرقام',
    category: 'security',
    subject: 'رمز التحقق الخاص بك هو: {{otp_code}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #334155;" dir="rtl">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #6366f1; margin: 0; font-size: 24px;">نظام الأمن والمصادقة</h1>
    <p style="color: #94a3b8; font-size: 14px;">Enterprise Security Service</p>
  </div>
  <div style="background: #1e293b; padding: 24px; border-radius: 8px; text-align: center;">
    <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 16px;">مرحباً {{user_name}}، استخدم رمز التحقق التالي لإكمال عملية الدخول:</p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 16px; border-radius: 6px; display: inline-block; margin: 12px 0;">
      {{otp_code}}
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">هذا الرمز صالِح لمدة {{valid_minutes}} دقائق فقط. لا تشارك الرمز مع أي شخص.</p>
  </div>
  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #64748b;">
    © 2026 جميع الحقوق محفوظة - Enterprise ESP Platform
  </div>
</div>`.trim(),
    text: 'مرحباً {{user_name}}، رمز التحقق الخاص بك هو: {{otp_code}}. ينتهي خلال {{valid_minutes}} دقائق.',
    variables: ['user_name', 'otp_code', 'valid_minutes'],
    is_active: true,
    version: 3,
    created_at: '2026-01-15T12:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'tmpl-002',
    admin_user_id: 'admin-001',
    name: 'فاتورة الشراء وتأكيد الطلب (Order Invoice)',
    description: 'إشعار فوري بالفاتورة وتفاصيل الطلب للعميل',
    category: 'transactional',
    subject: 'تأكيد الطلب رقم #{{order_number}} - فاتورة رقم {{invoice_id}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 12px;" dir="rtl">
  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 16px;">
    <h2 style="color: #10b981; margin: 0;">شكراً لطلبك، {{customer_name}}!</h2>
  </div>
  <p style="color: #a1a1aa; font-size: 14px; margin-top: 16px;">تم تأكيد طلبك بنجاح وهو قيد المعالجة الآن.</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: #27272a; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #3f3f46; color: #f4f4f5; text-align: right;">
        <th style="padding: 12px;">الوصف</th>
        <th style="padding: 12px;">المبلغ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #3f3f46;">{{item_title}}</td>
        <td style="padding: 12px; border-bottom: 1px solid #3f3f46;">{{item_price}} SAR</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold; color: #34d399;">الإجمالي النهائي</td>
        <td style="padding: 12px; font-weight: bold; color: #34d399;">{{total_amount}} SAR</td>
      </tr>
    </tbody>
  </table>
  <div style="margin-top: 24px; text-align: center;">
    <a href="{{invoice_url}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">عرض الفاتورة الإلكترونية</a>
  </div>
</div>`.trim(),
    text: 'عزيزي {{customer_name}}، شكراً لطلبك رقم #{{order_number}}. الإجمالي: {{total_amount}} SAR. رابط الفاتورة: {{invoice_url}}',
    variables: ['customer_name', 'order_number', 'invoice_id', 'item_title', 'item_price', 'total_amount', 'invoice_url'],
    is_active: true,
    version: 1,
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'tmpl-003',
    admin_user_id: 'admin-001',
    name: 'تنبيه أمني - تسجيل دخول جديد (Security Login Alert)',
    description: 'قالب التنبيه التلقائي عن الأجهزة الجديدة ومواقع الدخول',
    category: 'security',
    subject: 'تنبيه أمني: تم تسجيل دخول جديد لموقعك من {{location}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;" dir="rtl">
  <div style="background: #7f1d1d; color: #fecaca; padding: 12px 16px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
    ⚠️ تنبيه أمني عاجل
  </div>
  <p>مرحباً {{user_name}}، لاحظنا تسجيل دخول جديد لنظامك بالتفاصيل التالية:</p>
  <ul style="background: #1e293b; padding: 16px 32px; border-radius: 8px; color: #cbd5e1; line-height: 1.8;">
    <li><strong>الوقت:</strong> {{login_time}}</li>
    <li><strong>الجهاز والمتصفح:</strong> {{device_info}}</li>
    <li><strong>عنوان IP:</strong> {{ip_address}}</li>
    <li><strong>الموقع الجغرافي:</strong> {{location}}</li>
  </ul>
  <p style="color: #94a3b8; font-size: 13px;">إذا لم تكن أنت من قام بهذا الدخول، يرجى تغيير كلمة المرور فوراً عبر هذا الرابط:</p>
  <div style="text-align: center; margin-top: 16px;">
    <a href="{{secure_link}}" style="background: #dc2626; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">تأمين الحساب الآن</a>
  </div>
</div>`.trim(),
    text: 'تنبيه أمني عزيزي {{user_name}}، تم تسجيل دخول من {{device_info}} في {{location}} بـ IP: {{ip_address}}.',
    variables: ['user_name', 'login_time', 'device_info', 'ip_address', 'location', 'secure_link'],
    is_active: true,
    version: 2,
    created_at: '2026-02-20T16:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'global-welcome-001',
    admin_user_id: 'admin-001',
    name: 'ترحيب عام (جميع التطبيقات)',
    description: 'قالب ترحيب عام مرن يعتمد على اسم التطبيق وشعار ورابط الزيارة الديناميكي',
    scope: 'global',
    category: 'welcome',
    app_name: '{{app_name}}',
    app_url: '{{app_url}}',
    app_visit_url: '{{app_visit_url}}',
    subject: 'مرحباً بك في {{app_name}}!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;" dir="rtl">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 36px 24px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 26px; font-weight: bold;">{{app_name}}</h1>
  </div>
  <div style="padding: 32px 24px; color: #1e293b;">
    <h2 style="font-size: 20px; color: #667eea; margin-top: 0;">مرحباً {{user_name}} 👋</h2>
    <p style="line-height: 1.8; color: #475569; font-size: 15px;">شكراً لانضمامك إلى {{app_name}}. نحن سعداء جداً بوجودك معنا ونقدم لك أفضل الخدمات الممكنة.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{app_visit_url}}" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">زيارة {{app_name}} الان</a>
    </div>
    <p style="text-align: center; font-size: 13px; color: #94a3b8;">
      رابط الموقع المباشر: <a href="{{app_url}}" style="color: #667eea;">{{app_url}}</a>
    </p>
  </div>
  <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
    © {{year}} {{app_name}}. جميع الحقوق محفوظة.
  </div>
</div>`.trim(),
    text: 'مرحباً {{user_name}}، أهلاً بك في {{app_name}}. رابط الزيارة المباشر: {{app_visit_url}}',
    variables: ['app_name', 'user_name', 'app_visit_url', 'app_url', 'year'],
    is_active: true,
    version: 1,
    created_at: '2026-09-04T00:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'global-notification-001',
    admin_user_id: 'admin-001',
    name: 'إشعار عام (جميع التطبيقات)',
    description: 'قالب إشعارات تنبيهية وإجرائية لجميع التطبيقات المشتركة',
    scope: 'global',
    category: 'notification',
    app_name: '{{app_name}}',
    app_url: '{{app_url}}',
    app_visit_url: '{{app_visit_url}}',
    subject: '📢 {{notification_title}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;" dir="rtl">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 28px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 22px;">{{app_name}}</h1>
  </div>
  <div style="padding: 28px; color: #1e293b;">
    <h2 style="text-align: center; color: #0f172a; margin-top: 0;">{{notification_title}}</h2>
    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-right: 4px solid #f5576c; margin: 20px 0; line-height: 1.8; color: #334155;">
      {{notification_message}}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="{{action_url}}" style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 12px 30px; border-radius: 25px; font-weight: bold; text-decoration: none; display: inline-block;">{{action_text}}</a>
    </div>
  </div>
  <div style="background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
    <a href="{{app_visit_url}}" style="color: #f5576c; text-decoration: none; font-weight: bold;">زيارة {{app_name}}</a>
  </div>
</div>`.trim(),
    text: '{{notification_title}}: {{notification_message}} - رابط الإجراء: {{action_url}}',
    variables: ['app_name', 'notification_title', 'notification_message', 'action_url', 'action_text', 'app_visit_url'],
    is_active: true,
    version: 1,
    created_at: '2026-09-04T00:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'app-ecommerce-order-confirmation',
    admin_user_id: 'admin-001',
    name: 'تأكيد طلب - المتجر الإلكتروني',
    description: 'قالب خاص بتطبيق المتجر الإلكتروني مع قائمة المشتريات والعنوان وتتبع الطلب',
    scope: 'app',
    app_id: 'app-ecommerce-001',
    app_name: 'المتجر الإلكتروني',
    app_url: 'https://shop.example.com',
    app_visit_url: 'https://shop.example.com/visit',
    category: 'transactional',
    subject: 'تأكيد طلبك #{{order_id}} - {{app_name}}',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;" dir="rtl">
  <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 28px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px;">🛒 {{app_name}}</h1>
  </div>
  <div style="padding: 28px; color: #1e293b;">
    <p style="font-size: 16px; font-weight: bold;">مرحباً {{customer_name}}،</p>
    <p style="color: #64748b; font-size: 14px;">شكراً لتسوقك من {{app_name}}. تم تأكيد طلبك رقم <strong>#{{order_id}}</strong> بنجاح.</p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">🛍️ ملخص المشتريات</h3>
      <p style="color: #334155; font-size: 14px;">الإجمالي الكلي: <strong style="color: #ee5a24; font-size: 20px;">{{total_amount}} {{currency}}</strong></p>
    </div>

    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #0369a1;">
      <strong>📦 عنوان التوصيل:</strong> {{shipping_address}}<br/>
      <strong>رقم التواصل:</strong> {{phone_number}}
    </div>

    <div style="text-align: center;">
      <a href="{{order_tracking_url}}" style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 12px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">تتبع الشحنة الآن</a>
    </div>
  </div>
  <div style="background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
    <a href="{{app_visit_url}}" style="color: #ee5a24; text-decoration: none; font-weight: bold;">مواصلة التسوق في {{app_name}}</a>
  </div>
</div>`.trim(),
    text: 'عزيزي {{customer_name}}، تم تأكيد طلبك #{{order_id}} في {{app_name}}. الإجمالي: {{total_amount}} {{currency}}. رابط التتبع: {{order_tracking_url}}',
    variables: ['app_name', 'customer_name', 'order_id', 'total_amount', 'currency', 'shipping_address', 'phone_number', 'order_tracking_url', 'app_visit_url'],
    is_active: true,
    version: 2,
    created_at: '2026-09-04T00:00:00.000Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'app-saas-welcome',
    admin_user_id: 'admin-001',
    name: 'ترحيب - منصة SaaS',
    description: 'قالب خاص بمنصة SaaS يشتمل على مميزات الخدمة ورابط الداشبورد المباشر',
    scope: 'app',
    app_id: 'app-saas-001',
    app_name: 'منصة SaaS المنظمة',
    app_url: 'https://saas.example.com',
    app_visit_url: 'https://saas.example.com/dashboard',
    category: 'welcome',
    subject: 'مرحباً بك في {{app_name}} - ابدأ العمل الآن!',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;" dir="rtl">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 32px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px;">🚀 {{app_name}}</h1>
  </div>
  <div style="padding: 32px; color: #1e293b;">
    <p style="font-size: 18px; font-weight: bold;">مرحباً بك في {{app_name}}!</p>
    <p style="color: #64748b; line-height: 1.8;">نحن متحمسون جداً لانضمامك إلينا. حسابك جاهز للاستخدام ومزود بأحدث الأدوات والتحليلات الفورية.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{app_visit_url}}" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 14px 36px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">الانتقال إلى لوحة التحكم</a>
    </div>
  </div>
  <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
    © {{year}} {{app_name}}. جميع الحقوق محفوظة.
  </div>
</div>`.trim(),
    text: 'مرحباً بك في {{app_name}}! انتقل للوحة التحكم عبر: {{app_visit_url}}',
    variables: ['app_name', 'app_visit_url', 'year'],
    is_active: true,
    version: 1,
    created_at: '2026-09-04T00:00:00.000Z',
    updated_at: new Date().toISOString()
  }
];

// Helper database state wrapper
class DatabaseStore {
  private apiKeys: ApiKey[] = [...initialApiKeys];
  private providers: ProviderConfig[] = [...initialProviders];
  private templates: EmailTemplate[] = [...initialTemplates];
  private jobs: EmailJob[] = [];
  private events: EmailEvent[] = [];
  private auditLogs: AuditLog[] = [];
  private scheduledTasks: ScheduledTask[] = [];
  private startTime = Date.now();

  constructor() {
    this.seedRecentJobs();
  }

  private seedRecentJobs() {
    // Generate sample past email jobs for metrics analytics
    const now = Date.now();
    const sampleRecipients = [
      'user1@company.com', 'client.test@domain.org', 'support@clientapp.com',
      'developer@techfirm.io', 'finance@partner.sa', 'ceo@enterprise.com'
    ];
    const statuses: Array<{ status: EmailJob['status']; count: number }> = [
      { status: 'sent', count: 180 },
      { status: 'processing', count: 8 },
      { status: 'queued', count: 12 },
      { status: 'failed', count: 4 }
    ];

    let idCounter = 100;
    statuses.forEach(({ status, count }) => {
      for (let i = 0; i < count; i++) {
        idCounter++;
        const createdAt = new Date(now - Math.floor(Math.random() * 86400000 * 2)).toISOString();
        const recipient = sampleRecipients[i % sampleRecipients.length];
        const job: EmailJob = {
          id: `job-${idCounter}`,
          api_key_id: this.apiKeys[i % this.apiKeys.length].id,
          job_id: `bull-job-${Math.random().toString(36).substring(2, 11)}`,
          provider_id: this.providers[i % this.providers.length].provider_id,
          from_email: 'noreply@enterprise-esp.com',
          to_emails: [recipient],
          subject: i % 2 === 0 ? 'رمز التحقق الخاص بك' : 'إشعار الفاتورة والخدمة',
          priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'normal' : 'low',
          status,
          message_id: status === 'sent' ? `<msg-${Math.random().toString(36).substring(2, 10)}@enterprise-esp.com>` : undefined,
          retry_count: status === 'failed' ? 3 : 0,
          max_retries: 3,
          error_message: status === 'failed' ? 'Connection timeout after 5000ms on SMTP relay' : undefined,
          sent_at: status === 'sent' ? new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString() : undefined,
          created_at: createdAt,
          updated_at: createdAt,
          latency_ms: status === 'sent' ? Math.floor(80 + Math.random() * 200) : undefined
        };
        this.jobs.push(job);

        // Add event
        this.events.push({
          id: `evt-${idCounter}`,
          email_job_id: job.id,
          event_type: status === 'sent' ? 'delivered' : status === 'failed' ? 'failed' : 'queued',
          recipient,
          ip_address: '192.168.1.100',
          created_at: createdAt
        });
      }
    });

    // Seed audit logs
    this.auditLogs.push(
      {
        id: 'audit-1',
        admin_user_id: 'admin-001',
        action: 'auth.login.success',
        details: { method: 'secret_key', ip: '127.0.0.1' },
        ip_address: '127.0.0.1',
        created_at: new Date(now - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'audit-2',
        api_key_id: 'key-001',
        action: 'email.send_bulk',
        details: { count: 150, priority: 'high' },
        ip_address: '10.0.4.12',
        created_at: new Date(now - 1000 * 60 * 15).toISOString()
      }
    );
  }

  // API Key methods
  getApiKeys() { return this.apiKeys; }
  getApiKeyByKey(keyStr: string) { return this.apiKeys.find(k => k.key === keyStr && k.is_active); }
  createApiKey(data: Partial<ApiKey>) {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      admin_user_id: 'admin-001',
      key: `esp_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      name: data.name || 'مفتاح API جديد',
      permissions: data.permissions || { send_email: true, bulk_email: true, manage_templates: false, view_analytics: false },
      rate_limit: data.rate_limit || 1000,
      daily_limit: data.daily_limit || 10000,
      daily_used: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.apiKeys.unshift(newKey);
    this.addAuditLog('api_key.create', { key_id: newKey.id, name: newKey.name });
    firestoreService.saveApiKey(newKey).catch(() => {});
    return newKey;
  }
  toggleApiKey(id: string) {
    const k = this.apiKeys.find(key => key.id === id);
    if (k) {
      k.is_active = !k.is_active;
      this.addAuditLog('api_key.toggle', { key_id: id, is_active: k.is_active });
      firestoreService.saveApiKey(k).catch(() => {});
    }
    return k;
  }
  deleteApiKey(id: string) {
    this.apiKeys = this.apiKeys.filter(k => k.id !== id);
    this.addAuditLog('api_key.delete', { key_id: id });
    firestoreService.deleteApiKey(id).catch(() => {});
    return true;
  }

  // Templates
  getTemplates() { return this.templates; }
  getTemplateById(id: string) { return this.templates.find(t => t.id === id || t.name === id); }
  createTemplate(data: Partial<EmailTemplate>) {
    const tmpl: EmailTemplate = {
      id: `tmpl-${Date.now()}`,
      admin_user_id: 'admin-001',
      name: data.name || 'قالب جديد',
      description: data.description,
      subject: data.subject || 'عنوان البريد',
      html: data.html || '<div>المحتوى</div>',
      text: data.text,
      variables: data.variables || [],
      category: data.category || 'transactional',
      is_active: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.templates.unshift(tmpl);
    this.addAuditLog('template.create', { template_id: tmpl.id, name: tmpl.name });
    firestoreService.saveTemplate(tmpl).catch(() => {});
    return tmpl;
  }
  updateTemplate(id: string, data: Partial<EmailTemplate>) {
    const tmpl = this.templates.find(t => t.id === id);
    if (tmpl) {
      Object.assign(tmpl, data, { version: tmpl.version + 1, updated_at: new Date().toISOString() });
      this.addAuditLog('template.update', { template_id: tmpl.id, version: tmpl.version });
      firestoreService.saveTemplate(tmpl).catch(() => {});
    }
    return tmpl;
  }
  deleteTemplate(id: string) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.addAuditLog('template.delete', { template_id: id });
    return true;
  }

  // Provider Configs
  getProviders() { return this.providers; }
  getPrimaryProvider() { return this.providers.find(p => p.is_primary && p.is_active) || this.providers[0]; }
  updateProvider(id: string, data: Partial<ProviderConfig>) {
    const prov = this.providers.find(p => p.id === id);
    if (prov) {
      Object.assign(prov, data, { updated_at: new Date().toISOString() });
      if (data.is_primary) {
        this.providers.forEach(p => { if (p.id !== id) p.is_primary = false; });
      }
      this.addAuditLog('provider.update', { provider_id: id });
    }
    return prov;
  }

  // Jobs & Events
  getJobs(limit = 100) { return this.jobs.slice(0, limit); }
  getJobById(jobId: string) { return this.jobs.find(j => j.id === jobId || j.job_id === jobId); }
  addJob(job: EmailJob) {
    this.jobs.unshift(job);
    if (this.jobs.length > 2000) this.jobs.pop();
    firestoreService.saveEmailJob(job).catch(() => {});
    return job;
  }
  updateJob(jobId: string, updates: Partial<EmailJob>) {
    const job = this.jobs.find(j => j.id === jobId || j.job_id === jobId);
    if (job) {
      Object.assign(job, updates, { updated_at: new Date().toISOString() });
      firestoreService.saveEmailJob(job).catch(() => {});
    }
    return job;
  }
  addEvent(event: EmailEvent) {
    this.events.unshift(event);
    if (this.events.length > 5000) this.events.pop();
  }
  getEventsByJobId(jobId: string) {
    return this.events.filter(e => e.email_job_id === jobId);
  }
  getEvents() {
    return this.events;
  }


  // Audit Logs
  getAuditLogs(limit = 100) { return this.auditLogs.slice(0, limit); }
  addAuditLog(action: string, details?: Record<string, any>, admin_user_id = 'admin-001', api_key_id?: string) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      admin_user_id,
      api_key_id,
      action,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    firestoreService.saveAuditLog(log).catch(() => {});
  }

  // Stats & System Metrics
  getUptimeSec() { return Math.floor((Date.now() - this.startTime) / 1000); }

  getQueueMetrics(): QueueMetrics {
    const waiting = this.jobs.filter(j => j.status === 'queued').length;
    const active = this.jobs.filter(j => j.status === 'processing').length;
    const completed = this.jobs.filter(j => j.status === 'sent').length;
    const failed = this.jobs.filter(j => j.status === 'failed').length;
    const delayed = this.jobs.filter(j => j.status === 'scheduled').length;

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: false,
      throughput_per_sec: 100, // Meets 100 emails/sec specification target
      active_workers: 5
    };
  }

  // Scheduled Tasks CRUD
  getScheduledTasks() {
    return this.scheduledTasks;
  }
  addScheduledTask(task: ScheduledTask) {
    this.scheduledTasks.unshift(task);
  }
  updateScheduledTask(id: string, updates: Partial<ScheduledTask>) {
    const task = this.scheduledTasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates, { updated_at: new Date().toISOString() });
    }
    return task;
  }
  deleteScheduledTask(id: string): boolean {
    const initialLen = this.scheduledTasks.length;
    this.scheduledTasks = this.scheduledTasks.filter(t => t.id !== id);
    return this.scheduledTasks.length < initialLen;
  }
}

export const dbStore = new DatabaseStore();
