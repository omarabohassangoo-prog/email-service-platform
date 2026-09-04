# منصة خدمة البريد الإلكتروني المتكاملة (Enterprise Email Service Platform)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/omarabohassangoo-prog/email-service-platform)
[![CI/CD Pipeline](https://github.com/omarabohassangoo-prog/email-service-platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/omarabohassangoo-prog/email-service-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

منصة بريد إلكتروني مؤسسية مركزية وعالية الأداء مصممة لإدارة الحملات البريدية، الطوابير الذكية، الإشعارات الفورية، وتتبع تسليم الرسائل عبر واجهات برمجة تطبيقات (API) قوية لوحة تحكم متكاملة للمسؤولين.

---

## 🚀 المميزات الرئيسية
- **بنية Monorepo حديثة:** مدعومة بـ TurboRepo و pnpm workspaces.
- **نظام طوابير عالي الأداء:** معالجة آلاف الرسائل عبر طوابير ذكية (Redis / BullMQ).
- **إدارة القوالب الديناميكية:** تصميم وتخصيص قوالب البريد بسهولة.
- **لوحة تحكم متكاملة:** مراقبة الأداء، الإحصائيات اللحظية، وإدارة مفاتيح API.
- **أمان عالي:** دعم المصادقة الثنائية، تششفير البيانات (AES-256)، وسجلات التدقيق (Audit Logs).
- **التوافق والموثوقية:** تكوين تلقائي لـ SPF, DKIM, DMARC ومراقبة عبر Google Postmaster و Better Stack.

---

## 🛠️ هيكل المشروع
- `packages/api`: الخادم الخلفي (Express + Serverless Functions)
- `packages/web`: الواجهة الأمامية لوحة التحكم (React / Next.js)
- `packages/shared`: الأنواع والمكتبات المشتركة
- `packages/sdk`: مكتبة SDK للعملاء

---

## ⚙️ البدء السريع (Quick Start)

### المتطلبات الأساسية:
- Node.js >= 20.0.0
- pnpm >= 8.0.0

### خطوات التثبيت:
```bash
# 1. استنساخ المستودع
git clone https://github.com/omarabohassangoo-prog/email-service-platform.git
cd email-service-platform

# 2. نسخ ملف المتغيرات البيئية
cp .env.example .env

# 3. تثبيت التبعيات
pnpm install

# 4. تشغيل بيئة التطوير المحلية
pnpm dev
```

---

## 🧪 تشغيل الاختبارات
```bash
pnpm test       # تشغيل اختبارات الوحدة والتكامل (Vitest / Jest)
pnpm lint       # فحص الأخطاء البرمجية والأنواع (TypeScript)
pnpm build      # بناء المشروع للإنتاج (TurboRepo Build)
```

---

## 📚 الوثائق
- [دليل المستخدم](./docs/user-guide.md)
- [دليل المطور](./docs/developer-guide.md)
- [وثائق النشر](./docs/deployment-guide.md)
- [توثيق واجهات API (OpenAPI)](./docs/openapi.yaml)

---

## 📄 الرخصة
هذا المشروع مرخص تحت رخصة [MIT](./LICENSE).
