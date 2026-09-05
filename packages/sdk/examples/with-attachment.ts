/**
 * @file with-attachment.ts
 * @description Sending an email with attachments and inline images using @email-service/sdk
 */

import { EmailService } from '../src/index.js';

async function main() {
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
  });

  try {
    console.log('Sending email with PDF invoice and inline banner...');

    const result = await client.sendEmail({
      to: 'finance@customer.com',
      cc: 'billing@mycompany.com',
      subject: 'فاتورة اشتراك شهر سبتمبر - #INV-2026-09',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>فاتورة الاشتراك الشهرية</h2>
          <p>مرفق طيه تفاصيل الفاتورة لشهر سبتمبر 2026.</p>
          <img src="cid:company_logo" alt="Company Logo" width="150" />
        </div>
      `,
      text: 'مرفق طيه تفاصيل الفاتورة لشهر سبتمبر 2026.',
      attachments: [
        {
          filename: 'invoice-sep-2026.pdf',
          // Base64 or Buffer content
          content: 'JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDw...', // sample base64 string
          contentType: 'application/pdf',
        },
        {
          filename: 'logo.png',
          content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          cid: 'company_logo',
          contentType: 'image/png',
        },
      ],
      priority: 'high',
    });

    console.log('Invoice email submitted! Job ID:', result.jobId);
  } catch (error) {
    console.error('Failed to send email with attachment:', error);
  }
}

main();
