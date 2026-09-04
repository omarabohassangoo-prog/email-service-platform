# دليل المطور - خدمة البريد الإلكتروني المتكاملة (ESP Platform)

## 1. هيكل المشروع (Monorepo Structure)
يعتمد المشروع على بنية Monorepo باستخدام TurboRepo و pnpm:
- `packages/api`: الخادم الخلفي (Express + Serverless Functions)
- `packages/web`: الواجهة الأمامية (React / Next.js)
- `packages/shared`: الأنواع والمكتبات المشتركة
- `packages/sdk`: مكتبة SDK للعملاء

---

## 2. إعداد بيئة التطوير المحلية
```bash
git clone https://github.com/org/email-service-platform.git
cd email-service-platform
cp .env.example .env
pnpm install
pnpm dev
```

---

## 3. قاعدة البيانات ونظام الطوابير
- **قاعدة البيانات:** PostgreSQL مع ORM / Drizzle لتخزين المستخدمين، القوالب، وسجلات التدقيق (Audit Logs).
- **نظام الطوابير:** Redis (Vercel KV / BullMQ) لمعالجة مهام إرسال البريد في الخلفية وتجنب بطء الاستجابة.

---

## 4. تشغيل الاختبارات
```bash
pnpm test       # تشغيل اختبارات Vitest / Jest
pnpm lint       # فحص الأخطاء البرمجية والأنواع
pnpm build      # بناء المشروع للإنتاج
```
