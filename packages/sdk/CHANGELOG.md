# سجل التغييرات (Changelog)

جميع التغييرات الملحوظة في حزمة `@email-service/sdk` سيتم توثيقها في هذا الملف.

التنسيق يتبع مبادئ [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)،
وهذا المشروع يلتزم بـ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-05

### 🎉 الإطلاق الأول (Initial Release)
- **النواة الأساسية (Core Engine)**:
  - فئة `EmailService` متوافقة مع Node.js 18+ والمتصفحات الحديثة.
  - دعم إرسال البريد الفردي `sendEmail` مع المرفقات والأولويات (`high`, `normal`, `low`).
  - متابعة حالة المهام في الوقت الحقيقي `getEmailStatus` عبر طوابير Bull Queue.
  - إرسال بريد جماعي `bulkSend` مجزأ في دفعات مع تأخير قابل للتخصيص وميزة استمرار المحاولات.
  - جدولة البريد الإلكتروني `scheduleEmail` مع دعم التكرار اليومي والأسبوعي والشهري.
  - إلغاء واستعراض المهام المجدولة (`cancelSchedule`, `getSchedule`, `listSchedules`).

- **إدارة القوالب (Templates Engine)**:
  - دوال CRUD كاملة لقوالب Handlebars (`getTemplates`, `getTemplate`, `createTemplate`, `updateTemplate`, `deleteTemplate`).
  - معاينة القوالب برمجياً وحقن المتغيرات `renderTemplate`.

- **الأمان والشبكة (Security & Networking)**:
  - عميل HTTP مدمج مبني بالكامل على `fetch API` بدون أي حزم خارجية إضافية (Zero Dependencies).
  - إعادة محاولة تلقائية مع تأخير تصاعدي (Exponential Backoff with Jitter).
  - حماية تامة للبيانات الحساسة: حظر طباعة مفاتيح API أو كلمات المرور في السجلات (Logger Sanitization).
  - فئات استثناءات مخصصة بدقة (`AuthenticationError`, `ValidationError`, `RateLimitError`, `EmailSendError`, `NotFoundError`, `TimeoutError`).

- **التوثيق والاختبارات**:
  - توثيق JSDoc شامل بنسبة 100% لكافة الدوال والأنواع والمعاملات.
  - تغطية اختبارات تفوق 90% تشمل اختبارات الوحدة، اختبارات الأنواع، اختبارات الاستثناءات، واختبارات التكامل.
  - 6 أمثلة برمجية عملية كاملة في مجلد `examples/`.
