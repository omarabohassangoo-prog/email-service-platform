import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from '../../src/client.js';

describe('EmailService Integration Scenarios', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should create, list, and render email templates', async () => {
    const mockTemplate = {
      id: 'tpl_welcome_01',
      name: 'Welcome Email',
      scope: 'app' as const,
      category: 'onboarding',
      subject: 'Welcome, {{name}}!',
      html: '<h1>Hello {{name}}</h1>',
      variables: ['name'],
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      const path = new URL(url).pathname;

      if (path === '/api/v1/templates' && init?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ template: mockTemplate }),
        };
      }

      if (path === '/api/v1/templates' && (!init?.method || init?.method === 'GET')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ templates: [mockTemplate], total: 1, page: 1, limit: 10 }),
        };
      }

      if (path === '/api/v1/templates/tpl_welcome_01/render') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            subject: 'Welcome, Omar!',
            html: '<h1>Hello Omar</h1>',
            text: 'Hello Omar',
          }),
        };
      }

      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
      };
    });

    const client = new EmailService({
      apiKey: 'sk_test_templates',
      baseUrl: 'https://esp.local',
      logLevel: 'none',
    });

    // 1. Create template
    const created = await client.createTemplate({
      name: 'Welcome Email',
      scope: 'app',
      category: 'onboarding',
      subject: 'Welcome, {{name}}!',
      html: '<h1>Hello {{name}}</h1>',
    });
    expect(created.id).toBe('tpl_welcome_01');

    // 2. List templates
    const list = await client.getTemplates({ category: 'onboarding' });
    expect(list.items.length).toBe(1);
    expect(list.items[0]?.name).toBe('Welcome Email');

    // 3. Render template
    const rendered = await client.renderTemplate('tpl_welcome_01', { name: 'Omar' });
    expect(rendered.subject).toBe('Welcome, Omar!');
    expect(rendered.html).toBe('<h1>Hello Omar</h1>');
  });

  it('should schedule an email and allow cancellation', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      const path = new URL(url).pathname;

      if (path === '/api/v1/schedules' && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            schedule_id: 'sch_abc123',
            message: 'Email scheduled',
          }),
        };
      }

      if (path.startsWith('/api/v1/schedules/') && init?.method === 'DELETE') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            message: 'Schedule cancelled',
          }),
        };
      }

      return { ok: false, status: 404, text: async () => 'Not found' };
    });

    const client = new EmailService({
      apiKey: 'sk_test_schedules',
      baseUrl: 'https://esp.local',
      logLevel: 'none',
    });

    const scheduled = await client.scheduleEmail({
      to: 'scheduled@test.com',
      subject: 'Daily Reminder',
      html: '<p>Time for standup</p>',
      scheduledAt: new Date(Date.now() + 86400000),
      recurrence: 'daily',
    });

    expect(scheduled.success).toBe(true);
    expect(scheduled.scheduleId).toBe('sch_abc123');

    const cancelResult = await client.cancelSchedule('sch_abc123');
    expect(cancelResult.success).toBe(true);
  });

  it('should test connection and system health', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        status: 'healthy',
        timestamp: '2026-09-05T10:00:00Z',
        uptime: 3600,
        version: '1.0.0',
        components: [
          { name: 'Database', status: 'healthy' },
          { name: 'Redis', status: 'healthy' },
        ],
      }),
    });

    const client = new EmailService({
      apiKey: 'sk_test_health',
      baseUrl: 'https://esp.local',
      logLevel: 'none',
    });

    const connTest = await client.testConnection();
    expect(connTest.connected).toBe(true);
    expect(connTest.version).toBe('1.0.0');

    const health = await client.getHealth();
    expect(health.status).toBe('healthy');
  });
});
