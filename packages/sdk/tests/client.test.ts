import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from '../src/client.js';
import { AuthenticationError, ValidationError, RateLimitError } from '../src/errors.js';

describe('EmailService Client Unit Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    EmailService.resetInstance();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should require a valid apiKey in constructor', () => {
    expect(() => new EmailService({ apiKey: '' })).toThrow(ValidationError);
    expect(() => new EmailService(null as any)).toThrow(ValidationError);
  });

  it('should support singleton pattern via getInstance and resetInstance', () => {
    const client1 = EmailService.getInstance({ apiKey: 'sk_test_123' });
    const client2 = EmailService.getInstance();
    expect(client1).toBe(client2);

    EmailService.resetInstance();
    const client3 = EmailService.getInstance({ apiKey: 'sk_test_456' });
    expect(client3).not.toBe(client1);
  });

  it('should successfully call sendEmail and parse returned jobId', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        job_id: 'job_bull_12345',
        status: 'queued',
        message: 'Job enqueued successfully',
      }),
    });

    const client = new EmailService({
      apiKey: 'sk_test_mock',
      baseUrl: 'https://api.esp-example.com',
      logLevel: 'none',
    });

    const result = await client.sendEmail({
      to: 'client@example.com',
      subject: 'Order Confirmation',
      html: '<h1>Your order #1001</h1>',
      priority: 'high',
    });

    expect(result.success).toBe(true);
    expect(result.jobId).toBe('job_bull_12345');
    expect(result.status).toBe('queued');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toBe('https://api.esp-example.com/api/v1/email/send');
    expect(callArgs[1].headers['X-API-Key']).toBe('sk_test_mock');
  });

  it('should throw AuthenticationError when server responds with 401', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ error: 'Invalid API Key' }),
    });

    const client = new EmailService({
      apiKey: 'sk_invalid',
      baseUrl: 'https://api.esp-example.com',
      logLevel: 'none',
    });

    await expect(
      client.sendEmail({
        to: 'a@b.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it('should throw RateLimitError when server responds with 429', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({
        'content-type': 'application/json',
        'retry-after': '30',
      }),
      text: async () => JSON.stringify({ error: 'Rate limit exceeded' }),
    });

    const client = new EmailService({
      apiKey: 'sk_rate_limited',
      baseUrl: 'https://api.esp-example.com',
      retries: 0, // don't retry in this test
      logLevel: 'none',
    });

    await expect(
      client.sendEmail({
        to: 'a@b.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })
    ).rejects.toThrow(RateLimitError);
  });

  it('should fetch email job status via getEmailStatus', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        job_id: 'job_999',
        status: 'sent',
        attempts: 1,
        result: { messageId: '<msg_123@smtp.server>', provider: 'smtp_primary' },
        created_at: '2026-09-05T08:00:00Z',
        sent_at: '2026-09-05T08:00:01Z',
      }),
    });

    const client = new EmailService({
      apiKey: 'sk_test_key',
      baseUrl: 'https://api.esp-example.com',
      logLevel: 'none',
    });

    const status = await client.getEmailStatus('job_999');
    expect(status.jobId).toBe('job_999');
    expect(status.status).toBe('sent');
    expect(status.result?.provider).toBe('smtp_primary');
  });

  it('should handle bulkSend with chunking and reporting', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          job_id: `job_bulk_${callCount}`,
          status: 'queued',
        }),
      };
    });

    const client = new EmailService({
      apiKey: 'sk_test_key',
      baseUrl: 'https://api.esp-example.com',
      logLevel: 'none',
    });

    const bulkResult = await client.bulkSend({
      emails: [
        { to: 'user1@test.com', subject: 'News 1', html: '<p>Hi</p>' },
        { to: 'user2@test.com', subject: 'News 2', html: '<p>Hi</p>' },
        { to: 'user3@test.com', subject: 'News 3', html: '<p>Hi</p>' },
      ],
      batchSize: 2,
      batchDelay: 10,
    });

    expect(bulkResult.total).toBe(3);
    expect(bulkResult.sent).toBe(3);
    expect(bulkResult.failed).toBe(0);
    expect(bulkResult.results.length).toBe(3);
  });
});
