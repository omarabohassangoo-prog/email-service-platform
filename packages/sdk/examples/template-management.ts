/**
 * @file template-management.ts
 * @description Managing Handlebars templates (Create, Read, Update, Delete, Preview) using @email-service/sdk
 */

import { EmailService } from '../src/index.js';

async function main() {
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
  });

  try {
    // 1. Create a new template
    console.log('1. Creating a new template...');
    const newTemplate = await client.createTemplate({
      name: 'قالب إشعار الدفع الناجح',
      description: 'يتم إرساله عند اكتمال عملية الدفع للعميل',
      scope: 'app',
      appId: 'billing-app',
      appName: 'بوابة الفواتير',
      category: 'finance',
      subject: 'تم استلام دفعتك بنجاح - {{invoice_number}}',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981;">شكراً لك يا {{customer_name}}!</h2>
          <p>تم استلام مبلغ قدره <strong>{{amount}} {{currency}}</strong> بنجاح.</p>
          <div style="background: #f8fafc; padding: 12px; margin: 16px 0; border-radius: 6px;">
            <p><strong>رقم الفاتورة:</strong> {{invoice_number}}</p>
            <p><strong>التاريخ:</strong> {{payment_date}}</p>
            <p><strong>وسيلة الدفع:</strong> {{payment_method}}</p>
          </div>
          <p>يمكنك تحميل الفاتورة الضريبية في أي وقت من لوحة التحكم.</p>
        </div>
      `,
      text: 'شكراً لك {{customer_name}}! تم استلام دفعتك رقم {{invoice_number}} بقيمة {{amount}} {{currency}} بنجاح.',
    });

    console.log(`Template created successfully! ID: ${newTemplate.id}, Version: ${newTemplate.version}`);

    // 2. Render & Preview Template with mock data
    console.log('\n2. Rendering template preview...');
    const preview = await client.renderTemplate(newTemplate.id, {
      customer_name: 'عمر النجار',
      amount: '450.00',
      currency: 'SAR',
      invoice_number: 'INV-2026-9081',
      payment_date: '2026-09-05',
      payment_method: 'بطاقة مدى (Mada)',
    });

    console.log('Subject Preview:', preview.subject);
    console.log('HTML Length:', preview.html.length, 'characters');

    // 3. Update the template
    console.log('\n3. Updating template...');
    const updated = await client.updateTemplate(newTemplate.id, {
      description: 'قالب رسمي معتمد لإشعارات الدفع والفواتير',
      isActive: true,
    });
    console.log(`Updated template: ${updated.id}, Description: ${updated.description}`);

    // 4. List all templates in the finance category
    console.log('\n4. Listing finance templates...');
    const templates = await client.getTemplates({ category: 'finance', limit: 5 });
    console.log(`Found ${templates.items.length} templates.`);
    templates.items.forEach((t) => console.log(`- [${t.id}] ${t.name} (v${t.version})`));
  } catch (error) {
    console.error('Template management error:', error);
  }
}

main();
