/**
 * @file with-template.ts
 * @description Sending an email using pre-defined Handlebars templates using @email-service/sdk
 */

import { EmailService } from '../src/index.js';

async function main() {
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
  });

  try {
    console.log('Sending templated email with dynamic variables...');

    const result = await client.sendEmail({
      to: 'ahmed@company.com',
      subject: 'تأكيد التسجيل في النظام',
      templateId: 'tpl_onboarding_welcome',
      templateData: {
        user_name: 'أحمد الشريف',
        app_name: 'منظومة الخدمات المركزية',
        login_url: 'https://app.company.com/login',
        support_email: 'support@company.com',
        expiry_days: 7,
      },
      priority: 'normal',
    });

    console.log('Templated email enqueued! Job ID:', result.jobId);
  } catch (error) {
    console.error('Failed to send templated email:', error);
  }
}

main();
