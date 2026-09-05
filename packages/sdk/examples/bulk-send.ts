/**
 * @file bulk-send.ts
 * @description High-throughput bulk email dispatch with batching and rate-limit control using @email-service/sdk
 */

import { EmailService } from '../src/index.js';

async function main() {
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
  });

  // Prepare a mailing list of recipients
  const recipients = [
    { email: 'user1@acme.com', name: 'سارة' },
    { email: 'user2@acme.com', name: 'خالد' },
    { email: 'user3@acme.com', name: 'منى' },
    { email: 'user4@acme.com', name: 'طارق' },
    { email: 'user5@acme.com', name: 'ريم' },
  ];

  const emailBatch = recipients.map((r) => ({
    to: r.email,
    subject: `النشرة التقنية الأسبوعية - مرحباً ${r.name}`,
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; padding: 20px;">
        <h2>أهلاً بك ${r.name} في عدد هذا الأسبوع!</h2>
        <p>نشارك معك آخر التحديثات والإصدارات في منصتنا.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #888;">
          لإلغاء الاشتراك اضغط <a href="https://example.com/unsubscribe">هنا</a>.
        </p>
      </div>
    `,
    priority: 'normal' as const,
  }));

  console.log(`Starting bulk send for ${emailBatch.length} recipients...`);

  try {
    const bulkResult = await client.bulkSend({
      emails: emailBatch,
      batchSize: 2, // process 2 at a time
      batchDelay: 150, // 150ms delay between chunks to respect downstream SMTP quotas
      retryOnFailure: true,
    });

    console.log('--- Bulk Send Results ---');
    console.log('Batch ID:', bulkResult.batchId);
    console.log(`Successfully Enqueued: ${bulkResult.sent}/${bulkResult.total}`);
    console.log(`Failed: ${bulkResult.failed}`);

    if (bulkResult.failed > 0) {
      console.warn('Failures recorded:');
      bulkResult.results
        .filter((r) => !r.success)
        .forEach((f) => console.warn(`- ${f.email}: ${f.error}`));
    }
  } catch (error) {
    console.error('Fatal error during bulk send:', error);
  }
}

main();
