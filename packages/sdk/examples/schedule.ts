/**
 * @file schedule.ts
 * @description Scheduling future and recurring emails using @email-service/sdk
 */

import { EmailService } from '../src/index.js';

async function main() {
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
  });

  try {
    // 1. Schedule an email 24 hours into the future
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log(`Scheduling one-time email for: ${tomorrow.toISOString()}`);

    const oneTimeSchedule = await client.scheduleEmail({
      to: 'customer@client.com',
      subject: 'تذكير بموعد التجديد غداً',
      html: '<p>نود تذكيرك بأن اشتراكك ينتهي غداً.</p>',
      scheduledAt: tomorrow,
    });

    console.log('One-time email scheduled successfully! Schedule ID:', oneTimeSchedule.scheduleId);

    // 2. Schedule a recurring daily digest email
    console.log('Scheduling recurring daily email...');
    const recurringSchedule = await client.scheduleEmail({
      to: 'team-leads@mycompany.com',
      subject: 'التقرير الصباحي اليومي لمنظومة البريد',
      html: '<h1>التقرير اليومي</h1><p>ملخص نشاط الخوادم لليوم.</p>',
      scheduledAt: '2026-09-06T08:00:00Z',
      recurrence: 'daily',
    });

    console.log('Recurring schedule registered! Schedule ID:', recurringSchedule.scheduleId);

    // 3. List existing schedules
    console.log('Listing active schedules...');
    const schedules = await client.listSchedules({ page: 1, limit: 10 });
    console.log(`Total schedules found: ${schedules.total}`);

    // 4. Cancel a schedule example
    console.log(`Cancelling schedule ${oneTimeSchedule.scheduleId}...`);
    const cancelRes = await client.cancelSchedule(oneTimeSchedule.scheduleId);
    console.log('Cancellation result:', cancelRes.message);
  } catch (error) {
    console.error('Schedule operation failed:', error);
  }
}

main();
