# @email-service/sdk

> حزمة برمجية متطورة بلغة **TypeScript** للربط المباشر مع منصة البريد الإلكتروني عالية الأداء (Enterprise ESP Platform).
> تدعم الإرسال الفردي، البريد الجماعي عالي الإنتاجية، القوالب الديناميكية، الجدولة، والمراقبة الحية للطوابير.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node >= 18](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](#)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-%3C25KB-brightgreen.svg)](#)

---

## 🌟 المميزات الرئيسية (Key Features)

- 🚀 **صفر تبعيات خارجية (Zero Runtime Dependencies)**: يعتمد كلياً على `fetch API` المدمجة في المتصفحات الحديثة و Node.js 18+.
- 🔒 **أمان مدمج وحماية المفاتيح**: تنقية وتشفير تلقائي للبيانات الحساسة في السجلات؛ لا يتم تسريب المفاتيح في الـ Logs.
- ⚡ **أداء فائق مع إعادة المحاولة التلقائية**: دعم مدمج للتأخير التصاعدي (Exponential Backoff) والتعامل مع قيود المعدل (Rate Limiting).
- 📦 **حجم حزمة فائق الصغر**: أقل من 25KB، متوافق بنسبة 100% مع بيئات Node.js والمتصفحات (Universal ESM + CommonJS).
- 📑 **إدارة القوالب والجدولة**: دعم كامل لقوالب Handlebars، الجدولة الزمنية لمرة واحدة أو المهام المتكررة.
- 🛡️ **فئات أخطاء نموذجية دقيقة**: استثناءات مخصصة (`AuthenticationError`, `ValidationError`, `RateLimitError`, `EmailSendError`).

---

## 📦 التثبيت (Installation)

```bash
# باستخدام npm
npm install @email-service/sdk

# أو pnpm
pnpm add @email-service/sdk

# أو yarn
yarn add @email-service/sdk
```

---

## 🚀 البدء السريع (Quickstart)

### 1. تهيئة العميل (Client Initialization)

```typescript
import { EmailService } from '@email-service/sdk';

const client = new EmailService({
  apiKey: 'sk_live_enterprise_esp_secret',
  baseUrl: 'https://api.email-service.com', // رابط المنصة
  logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error' | 'none'
  timeout: 15000,   // 15 ثانية كحد أقصى للمهلة
  retries: 3        // عدد محاولات إعادة الاتصال التلقائية
});
```

أو استخدام نمط الـ Singleton:

```typescript
const client = EmailService.getInstance({
  apiKey: process.env.EMAIL_SERVICE_API_KEY!
});
```

---

### 2. إرسال بريد إلكتروني فردي (Send Single Email)

```typescript
const result = await client.sendEmail({
  to: 'customer@example.com',
  subject: 'تأكيد الحجز',
  html: '<h1>مرحباً بك!</h1><p>تم تأكيد حجزك بنجاح.</p>',
  priority: 'high'
});

console.log('معرف المهمة في الطابور:', result.jobId);
console.log('حالة المهمة:', result.status); // 'queued'
```

---

### 3. التحقق من حالة البريد (Get Email Status)

```typescript
const status = await client.getEmailStatus(result.jobId);

console.log('حالة التسليم:', status.status); // 'sent' | 'processing' | 'failed'
console.log('عدد المحاولات:', status.attempts);
if (status.result) {
  console.log('المزود الذي تولى الإرسال:', status.result.provider);
}
```

---

### 4. الإرسال الجماعي مع التحكم بالمعدل (Bulk Send)

```typescript
const recipients = [
  { to: 'user1@company.com', subject: 'تحديث أسبوعي', html: '<p>مرحباً user 1</p>' },
  { to: 'user2@company.com', subject: 'تحديث أسبوعي', html: '<p>مرحباً user 2</p>' }
];

const bulkResult = await client.bulkSend({
  emails: recipients,
  batchSize: 50,      // إرسال 50 رسالة في الدفعة الواحدة
  batchDelay: 100,    // تأخير 100 ملي ثانية بين الدفعات
  retryOnFailure: true
});

console.log(`تم قبول ${bulkResult.sent} من أصل ${bulkResult.total}`);
```

---

### 5. إرسال بريد باستخدام القوالب (Templates)

```typescript
const result = await client.sendEmail({
  to: 'user@example.com',
  subject: 'تفعيل الحساب',
  templateId: 'tpl_welcome_user',
  templateData: {
    user_name: 'أحمد',
    activation_url: 'https://example.com/activate?token=xyz'
  }
});
```

---

### 6. جدولة البريد (Scheduling)

```typescript
// جدولة بعد 24 ساعة
const scheduleResult = await client.scheduleEmail({
  to: 'user@example.com',
  subject: 'تذكير بالموعد',
  html: '<p>نذكرك بموعد اجتماعك غداً في تمام العاشرة صباحاً.</p>',
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  recurrence: 'daily' // 'daily' | 'weekly' | 'monthly' | null
});

console.log('معرف الجدولة:', scheduleResult.scheduleId);

// إلغاء الجدولة عند الرغبة:
await client.cancelSchedule(scheduleResult.scheduleId);
```

---

## 🛡️ معالجة الأخطاء النموذجية (Error Handling)

توفر الحزمة استثناءات مخصصة تشتق من `EmailServiceError`:

```typescript
import { 
  EmailService, 
  AuthenticationError, 
  ValidationError, 
  RateLimitError, 
  NotFoundError, 
  EmailSendError 
} from '@email-service/sdk';

try {
  await client.sendEmail({ to: 'invalid-email', subject: 'Test', html: '<p>Test</p>' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('بيانات المدخلات غير صالحة:', error.details);
  } else if (error instanceof AuthenticationError) {
    console.error('مفتاح API غير صالح أو منتهي الصلاحية');
  } else if (error instanceof RateLimitError) {
    console.error(`تم تجاوز معدل الطلبات. انتظر ${error.retryAfterSeconds} ثانية.`);
  } else if (error instanceof NotFoundError) {
    console.error('العنصر المطلوب غير موجود:', error.message);
  } else if (error instanceof EmailSendError) {
    console.error('فشل الإرسال من خوادم المزود:', error.statusCode, error.message);
  } else {
    console.error('خطأ غير متوقع:', error);
  }
}
```

---

## 📋 الواجهات البرمجية والأنواع (API Reference)

| الدالة (Method) | الوصف | المُدخلات | المخرجات |
| :--- | :--- | :--- | :--- |
| `sendEmail(options)` | إدخال بريد في طابور الإرسال | `SendEmailOptions` | `Promise<SendEmailResult>` |
| `getEmailStatus(jobId)` | الاستعلام عن حالة البريد | `string` | `Promise<EmailStatus>` |
| `bulkSend(options)` | إرسال دفعة بريد جماعي مجزأة | `BulkSendOptions` | `Promise<BulkEmailResult>` |
| `scheduleEmail(options)` | جدولة بريد لوقت لاحق أو متكرر | `ScheduleEmailOptions` | `Promise<ScheduleEmailResult>` |
| `cancelSchedule(scheduleId)` | إلغاء مهمة مجدولة | `string` | `Promise<{ success, message }>` |
| `getSchedule(scheduleId)` | جلب تفاصيل الجدولة | `string` | `Promise<ScheduleInfo>` |
| `listSchedules(params)` | قائمة المهام المجدولة مع ترقيم | `{ page, limit, status }` | `Promise<ScheduleList>` |
| `getTemplates(params)` | جلب قوالب البريد | `{ page, limit, category }` | `Promise<TemplateList>` |
| `getTemplate(templateId)` | جلب قالب محدد | `string` | `Promise<Template>` |
| `createTemplate(options)` | إنشاء قالب Handlebars جديد | `CreateTemplateOptions` | `Promise<Template>` |
| `updateTemplate(id, data)` | تعديل قالب موجود | `string, Partial<Template>` | `Promise<Template>` |
| `deleteTemplate(id)` | حذف قالب | `string` | `Promise<{ success, message }>` |
| `renderTemplate(id, data)` | معاينة القالب وتعبئة المتغيرات | `string, Record<string, any>` | `Promise<RenderTemplateResult>` |
| `getStats()` | إحصائيات المنصة الحية | - | `Promise<ServiceStats>` |
| `getHealth()` | فحص صحة المكونات | - | `Promise<HealthStatus>` |
| `testSDK(action, params)` | اختبار تشخيصي لوظائف الـ SDK | `action, params` | `Promise<SDKTestResult>` |
| `testConnection()` | فحص سرعة الاتصال والـ Latency | - | `Promise<ConnectionTest>` |

---

## 🧪 الاختبارات (Testing)

```bash
# تشغيل جميع اختبارات الـ SDK
npm test

# تشغيل الفحص والتحقق من الأنواع
npm run lint
```

---

## 📄 الترخيص (License)

مرخص تحت رخصة **MIT**. راجع ملف `LICENSE` للمزيد من التفاصيل.
