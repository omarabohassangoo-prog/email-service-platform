/**
 * @file basic.ts
 * @description Basic email sending example using @email-service/sdk
 */

import { EmailService, AuthenticationError, ValidationError, RateLimitError } from '../src/index.js';

async function main() {
  // Initialize the client
  const client = new EmailService({
    apiKey: process.env.EMAIL_SERVICE_API_KEY || 'sk_live_sample_key_12345',
    baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3000',
    logLevel: 'info',
  });

  try {
    console.log('Sending single transactional email...');

    const result = await client.sendEmail({
      to: 'user@example.com',
      subject: 'مرحباً بك في منصة البريد الإلكتروني',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4f46e5;">مرحباً بك في منصتنا!</h1>
          <p>تم استلام طلبك وتفعيله بنجاح.</p>
          <p>شكراً لانضمامك إلينا.</p>
        </div>
      `,
      text: 'مرحباً بك في منصتنا! تم استلام طلبك وتفعيله بنجاح.',
      priority: 'high',
    });

    console.log('Email queued successfully!');
    console.log('Job ID:', result.jobId);
    console.log('Status:', result.status);

    // Track status
    console.log('Checking status in 2 seconds...');
    await new Promise((r) => setTimeout(r, 2000));

    const status = await client.getEmailStatus(result.jobId);
    console.log('Current Job Status:', status.status);
    console.log('Delivery Attempts:', status.attempts);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed: Check your API Key.', error.message);
    } else if (error instanceof ValidationError) {
      console.error('Validation failed: Check input parameters.', error.details);
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limit reached. Retry after ${error.retryAfterSeconds || 60} seconds.`);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

main();
