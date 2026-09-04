# وثائق النشر - خدمة البريد الإلكتروني المتكاملة (ESP Platform)
**المرجع:** DEPLOY-DOC-ESP-2026-001 | **الإصدار:** 3.0.0 | **التاريخ:** 2026-09-05 | **الحالة:** نهائي

---

## 1. نظرة عامة على النشر (Deployment Overview)
- **المنصة المستهدفة:** Vercel (Pro Plan)
- **البنية المعمارية:** Monorepo + Serverless Functions + Next.js / Express API
- **بيئات التشغيل:** `development`, `staging`, `production`
- **التكامل المستمر (CI/CD):** GitHub Actions + Vercel CLI

---

## 2. المتطلبات الأساسية (Prerequisites)
### الحسابات المطلوبة:
1. **Vercel Pro Plan:** ($20/شهر) مع تفعيل *Fluid Compute* و *Large Functions (5 GB)*، Vercel Postgres، Vercel KV (Redis)، و Vercel Blob.
2. **GitHub:** لإدارة المستودع وربط مسارات CI/CD.
3. **Database (Vercel Postgres):** PostgreSQL 15+.
4. **Redis (Vercel KV):** إدارة الطوابير والجلسات.
5. **Storage (Vercel Blob):** تخزين مرفقات البريد والقوالب الكبيرة.

### الأدوات البرمجية:
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Git >= 2.40.0
- Vercel CLI >= 33.0.0

---

## 3. إعداد المستودع وبناء المشروع
```bash
git clone https://github.com/omarabohassangoo-prog/email-service-platform.git
cd email-service-platform
cp .env.example .env
pnpm install
pnpm build
```

---

## 4. تكوين Vercel (`vercel.json`)
المشروع مهيأ بـ `vercel.json` متكامل يتضمن ضبط وقت التنفيذ (`maxDuration`) لكل نقطة نهاية، وظائف الـ Cron لتنظيف الطوابير وإرسال التقارير، رؤوس الأمان (Security Headers)، وإعدادات CORS.

---

## 5. خط أنابيب النشر التلقائي (CI/CD - GitHub Actions)
يتم تشغيل الاختبارات تلقائياً عند أي `Pull Request` أو `Push` إلى فروع `develop` (Staging) و `main` (Production).

---

## 6. خطة استعادة الكوارث والنسخ الاحتياطي (Backup & Disaster Recovery)
- **قاعدة البيانات:** نسخ احتياطي يومي تلقائي عبر Vercel Postgres مع احتفاظ لمدة 30 يوماً.
- **الملفات:** نسخ احتياطي دوري لـ Vercel Blob.
- **RPO:** 5 دقائق | **RTO:** 30 دقيقة.

---

## 7. استكشاف الأخطاء وإصلاحها (Troubleshooting)
- **Timeout:** استخدام Fluid Compute وزيادة `maxDuration` حتى 300 ثانية.
- **Function Size:** تفعيل `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`.
- **تسليم البريد إلى Gmail:** التحقق من سجلات SPF, DKIM, DMARC عبر Google Postmaster.

---

## 8. خطة الصيانة الدورية
- **يوميًا:** مراقبة السجلات ومعدلات الارتداد والأخطاء.
- **أسبوعيًا:** فحص Sender Score وسمعة النطاق.
- **شهريًا:** تنظيف قوائم المستلمين وتحديث التبعيات الأمنية.
- **ربع سنويًا:** اختبار استعادة البيانات من النسخ الاحتياطي الشامل.
