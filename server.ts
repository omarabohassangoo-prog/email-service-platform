import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore, initialAdminUser } from './src/server/db';
import { renderTemplate, extractVariables } from './src/server/templateEngine';
import { emailQueue } from './src/server/queue';
import { sendEmailThroughProviders } from './src/server/providers';
import { container } from './src/services/container';
import { authenticateApiKey, authenticateAdminJwt, requireApiKeyScope } from './src/middleware/auth.middleware';

import apiRouterModular from './src/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS and Headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- HEALTH ENDPOINTS ---
  app.get('/health', async (req, res) => {
    const health = await container.healthService.checkAll();
    return res.status(health.status === 'critical' ? 503 : 200).json(health);
  });

  app.get('/health/ready', async (req, res) => {
    const health = await container.healthService.checkAll();
    const isReady = health.status !== 'critical';
    return res.status(isReady ? 200 : 503).json({ ready: isReady, status: health.status });
  });

  app.get('/health/live', (req, res) => {
    return res.status(200).json({ status: 'alive', uptime: process.uptime() });
  });

  // Router for /api/v1
  const apiRouter = express.Router();

  // --- 1. AUTHENTICATION ---
  apiRouter.post('/auth/login', async (req, res) => {
    const { secret_key } = req.body;
    try {
      if (!secret_key) {
        return res.status(400).json({
          error: 'Missing secret key',
          message: 'يرجى تزويد المفتاح السري لتسجيل الدخول'
        });
      }

      const loginResult = await container.authService.loginWithSecretKey(secret_key);
      return res.json({
        access_token: loginResult.accessToken,
        refresh_token: loginResult.refreshToken,
        expires_in: loginResult.expiresIn,
        user: loginResult.user
      });
    } catch (err: any) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: err.message || 'المفتاح السري غير صحيح'
      });
    }
  });

  apiRouter.post('/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    try {
      if (!refresh_token) {
        return res.status(400).json({
          error: 'Missing refresh token',
          message: 'يرجى تقديم رمز تجديد الوصول'
        });
      }
      const refreshResult = await container.authService.refreshAccessToken(refresh_token);
      return res.json({
        access_token: refreshResult.accessToken,
        expires_in: refreshResult.expiresIn
      });
    } catch (err: any) {
      return res.status(403).json({
        error: 'Forbidden',
        message: err.message || 'رمز التجديد غير صالح أو منتهي الصلاحية'
      });
    }
  });

  apiRouter.post('/auth/logout', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || '';
    const { refresh_token } = req.body;
    
    await container.authService.logout(token, refresh_token);
    return res.json({ success: true, message: 'تم تسجيل الخروج بنجاح وإبطال الرموز' });
  });

  // --- 2. EMAIL OPERATIONS ---
  apiRouter.post('/email/send', authenticateApiKey, requireApiKeyScope('send_email'), async (req, res) => {
    try {
      const { to, cc, bcc, subject, html, text, priority, template, template_data, scheduled_at, attachments } = req.body;

      if (!to || (!subject && !template)) {
        return res.status(400).json({
          error: 'Missing required parameters: "to" and ("subject" or "template")',
          message: 'يرجى تقديم عنوان المستلم والموضوع أو القالب'
        });
      }

      const toArray = Array.isArray(to) ? to : [to];
      let finalSubject = subject || '';
      let finalHtml = html || '';
      let finalText = text || '';
      let templateId: string | undefined;

      // Handle template rendering
      if (template) {
        const tmplObj = dbStore.getTemplateById(template);
        if (!tmplObj) {
          return res.status(404).json({ error: `Template "${template}" not found` });
        }
        templateId = tmplObj.id;
        finalSubject = renderTemplate(tmplObj.subject, template_data || {});
        finalHtml = renderTemplate(tmplObj.html, template_data || {});
        finalText = renderTemplate(tmplObj.text || '', template_data || {});
      }

      const apiKeyObj = (req as any).apiKey;
      const job = await emailQueue.enqueue({
        api_key_id: apiKeyObj?.id,
        job_id: `bull-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        from_email: process.env.DEFAULT_FROM_EMAIL || 'noreply@enterprise-esp.com',
        to_emails: toArray,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        subject: finalSubject,
        html_content: finalHtml,
        text_content: finalText,
        template_id: templateId,
        template_data,
        attachments,
        priority: priority || 'normal',
        scheduled_at
      });

      return res.status(202).json({
        job_id: job.job_id,
        id: job.id,
        status: job.status,
        priority: job.priority,
        scheduled_at: job.scheduled_at,
        created_at: job.created_at,
        message: job.scheduled_at ? 'تمت جدولة الرسالة بنجاح' : 'تمت إضافة الرسالة إلى طابور الإرسال بنجاح'
      });

    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  apiRouter.get('/email/status/:job_id', authenticateApiKey, requireApiKeyScope('view_analytics'), (req, res) => {
    const { job_id } = req.params;
    const job = dbStore.getJobById(job_id);

    if (!job) {
      return res.status(404).json({ error: 'Email job not found' });
    }

    const events = dbStore.getEventsByJobId(job.id);
    return res.json({
      job_id: job.job_id,
      id: job.id,
      status: job.status,
      to: job.to_emails,
      subject: job.subject,
      priority: job.priority,
      provider_id: job.provider_id,
      message_id: job.message_id,
      retry_count: job.retry_count,
      error_message: job.error_message,
      created_at: job.created_at,
      sent_at: job.sent_at,
      latency_ms: job.latency_ms,
      events
    });
  });

  apiRouter.post('/email/bulk', authenticateApiKey, requireApiKeyScope('bulk_email'), async (req, res) => {
    const { emails, batch_size } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Expected "emails" array parameter' });
    }

    const batchId = `batch-${Date.now()}`;
    const apiKeyObj = (req as any).apiKey;

    let count = 0;
    for (const item of emails) {
      count++;
      await emailQueue.enqueue({
        api_key_id: apiKeyObj?.id,
        job_id: `${batchId}-${count}`,
        from_email: 'noreply@enterprise-esp.com',
        to_emails: Array.isArray(item.to) ? item.to : [item.to],
        subject: item.subject || 'بريد جماعي مؤسسي',
        html_content: item.html || '<div>بريد إلكتروني</div>',
        priority: item.priority || 'low'
      });
    }

    dbStore.addAuditLog('email.bulk_send', { batch_id: batchId, total: count });

    return res.json({
      batch_id: batchId,
      total: count,
      status: 'queued',
      message: `تمت إضافة ${count} رسالة جماعية إلى طابور المعالجة بنجاح`
    });
  });

  apiRouter.post('/email/schedule', authenticateApiKey, requireApiKeyScope('send_email'), async (req, res) => {
    const { email, scheduled_at } = req.body;
    if (!email || !scheduled_at) {
      return res.status(400).json({ error: 'Missing email payload or scheduled_at timestamp' });
    }

    const apiKeyObj = (req as any).apiKey;
    const job = await emailQueue.enqueue({
      api_key_id: apiKeyObj?.id,
      job_id: `sched-${Date.now()}`,
      from_email: 'noreply@enterprise-esp.com',
      to_emails: Array.isArray(email.to) ? email.to : [email.to],
      subject: email.subject,
      html_content: email.html,
      priority: email.priority || 'normal',
      scheduled_at
    });

    return res.json({
      job_id: job.job_id,
      status: job.status,
      scheduled_at: job.scheduled_at
    });
  });

  // --- 3. TEMPLATES API ---
  apiRouter.get('/templates', (req, res) => {
    const templates = dbStore.getTemplates();
    return res.json({ templates, total: templates.length });
  });

  apiRouter.post('/templates', authenticateAdminJwt, (req, res) => {
    const tmpl = dbStore.createTemplate(req.body);
    return res.status(201).json({ template: tmpl });
  });

  apiRouter.get('/templates/:id', (req, res) => {
    const tmpl = dbStore.getTemplateById(req.params.id);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    return res.json({ template: tmpl });
  });

  apiRouter.put('/templates/:id', authenticateAdminJwt, (req, res) => {
    const tmpl = dbStore.updateTemplate(req.params.id, req.body);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    return res.json({ template: tmpl });
  });

  apiRouter.delete('/templates/:id', authenticateAdminJwt, (req, res) => {
    dbStore.deleteTemplate(req.params.id);
    return res.json({ success: true, message: 'تم حذف القالب بنجاح' });
  });

  apiRouter.post('/templates/:id/duplicate', authenticateAdminJwt, (req, res) => {
    const original = dbStore.getTemplateById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Template not found' });

    const duplicate = dbStore.createTemplate({
      ...original,
      name: `${original.name} (نسخة مُكررة)`,
      version: 1
    });

    return res.json({ template: duplicate });
  });

  apiRouter.post('/templates/:id/preview', (req, res) => {
    const tmpl = dbStore.getTemplateById(req.params.id);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });

    const data = req.body.data || {};
    const renderedSubject = renderTemplate(tmpl.subject, data);
    const renderedHtml = renderTemplate(tmpl.html, data);
    const renderedText = renderTemplate(tmpl.text || '', data);

    return res.json({
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
      variables: tmpl.variables
    });
  });

  apiRouter.post('/templates/:id/test', async (req, res) => {
    const tmpl = dbStore.getTemplateById(req.params.id);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });

    const { to, data } = req.body;
    if (!to) return res.status(400).json({ error: 'Missing "to" email address' });

    const renderedSubject = renderTemplate(tmpl.subject, data || {});
    const renderedHtml = renderTemplate(tmpl.html, data || {});

    const job = await emailQueue.enqueue({
      job_id: `test-tmpl-${Date.now()}`,
      from_email: 'noreply@enterprise-esp.com',
      to_emails: [to],
      subject: `[اختبار] ${renderedSubject}`,
      html_content: renderedHtml,
      priority: 'high'
    });

    return res.json({
      success: true,
      job_id: job.job_id,
      message: `تم إرسال بريد الاختبار إلى ${to} بنجاح`
    });
  });

  // --- 4. ADMIN & MONITORING API ---
  apiRouter.get('/admin/settings', (req, res) => {
    return res.json({
      providers: dbStore.getProviders(),
      security: {
        jwt_expiry: '24h',
        rate_limiting: '1000 req/min',
        tls_version: 'TLS 1.3',
        encryption: 'AES-256'
      },
      limits: {
        max_batch_size: 100000,
        max_attachment_size_mb: 25,
        daily_system_limit: 1000000
      },
      system: {
        version: '1.0.0-enterprise',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version
      }
    });
  });

  apiRouter.put('/admin/settings', authenticateAdminJwt, (req, res) => {
    dbStore.addAuditLog('admin.settings_update', req.body);
    return res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  });

  apiRouter.get('/admin/health', async (req, res) => {
    const fullHealth = await container.healthService.checkAll();
    
    // Map to legacy structure for Dashboard backwards compatibility
    const dbCheck = fullHealth.components.find(c => c.name.includes('Database'));
    const redisCheck = fullHealth.components.find(c => c.name.includes('Redis'));
    const providerCheck = fullHealth.components.find(c => c.name.includes('Providers'));
    const queueCheck = fullHealth.components.find(c => c.name.includes('Queue'));
    const sysCheck = fullHealth.components.find(c => c.name.includes('System'));

    return res.json({
      status: fullHealth.status,
      checks: {
        postgres: { 
          status: dbCheck?.status === 'healthy' ? 'connected' : 'disconnected', 
          latency_ms: dbCheck?.latency_ms || 0 
        },
        redis_queue: { 
          status: redisCheck?.status === 'healthy' ? 'connected' : 'degraded', 
          pending_jobs: queueCheck?.details?.waiting || 0 
        },
        providers: { 
          active_count: providerCheck?.details?.active || 0, 
          total: providerCheck?.details?.total || 0 
        },
        api_gateway: { 
          status: 'online', 
          uptime_sec: Math.floor(fullHealth.uptime) 
        },
        system_memory: { 
          used_mb: sysCheck?.details?.memory?.heap_used_mb || 0, 
          free_mb: (sysCheck?.details?.memory?.heap_total_mb || 0) - (sysCheck?.details?.memory?.heap_used_mb || 0), 
          total_mb: sysCheck?.details?.memory?.heap_total_mb || 0 
        },
        cpu_usage_pct: sysCheck?.details?.cpu_usage_pct || 0
      },
      timestamp: fullHealth.timestamp,
      uptime: Math.floor(fullHealth.uptime)
    });
  });

  apiRouter.get('/admin/jobs', (req, res) => {
    const jobs = dbStore.getJobs(50);
    return res.json({ jobs });
  });

  apiRouter.get('/admin/stats', async (req, res) => {
    try {
      const range = (req.query.range as string) || '7d';
      const stats = await container.analyticsService.getRealTimeStats(range);
      
      return res.json({
        emails: stats.emails,
        queue: dbStore.getQueueMetrics(),
        providers: stats.providers,
        hourly_timeline: stats.hourlyTimeline,
        rates: stats.rates
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });


  apiRouter.post('/admin/test', authenticateAdminJwt, async (req, res) => {
    const { to, provider } = req.body;
    const recipient = to || 'test@enterprise-esp.com';

    const result = await sendEmailThroughProviders({
      id: `admin-test-${Date.now()}`,
      job_id: `test-ping-${Date.now()}`,
      from_email: 'noreply@enterprise-esp.com',
      to_emails: [recipient],
      subject: 'رسالة فحص الاتصال والتجربة (Ping Test Email)',
      html_content: '<div>اختبار الاتصال بنجاح.</div>',
      priority: 'high',
      status: 'queued',
      retry_count: 0,
      max_retries: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return res.json({
      success: result.success,
      provider_used: result.provider_id,
      message_id: result.message_id,
      latency_ms: result.latency_ms,
      error: result.error,
      message: result.success ? `تم اختبار المزود وإرسال الرسالة إلى ${recipient} بنجاح` : `فشل الاختبار: ${result.error}`
    });
  });

  // --- Queue Actions ---
  apiRouter.post('/admin/queue/pause', authenticateAdminJwt, (req, res) => {
    emailQueue.pauseQueue();
    dbStore.addAuditLog('queue.pause');
    return res.json({ success: true, message: 'تم إيقاف معالجة الطابور مؤقتاً' });
  });

  apiRouter.post('/admin/queue/resume', authenticateAdminJwt, (req, res) => {
    emailQueue.resumeQueue();
    dbStore.addAuditLog('queue.resume');
    return res.json({ success: true, message: 'تم استئناف العمل في الطابور' });
  });

  // --- 5. API KEYS API ---
  apiRouter.get('/api-keys', authenticateAdminJwt, async (req, res) => {
    const keys = await container.apiKeyService.getApiKeys();
    return res.json({ keys });
  });

  apiRouter.post('/api-keys', authenticateAdminJwt, async (req, res) => {
    try {
      const newKey = await container.apiKeyService.createApiKey(req.body);
      return res.status(201).json({ key: newKey });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  apiRouter.put('/api-keys/:id/toggle', authenticateAdminJwt, async (req, res) => {
    try {
      const keys = await container.apiKeyService.getApiKeys();
      const existing = keys.find(k => k.id === req.params.id);
      if (!existing) return res.status(404).json({ error: 'Key not found' });

      const updated = await container.apiKeyService.updateApiKey(req.params.id, {
        is_active: !existing.is_active
      });
      return res.json({ key: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  apiRouter.delete('/api-keys/:id', authenticateAdminJwt, async (req, res) => {
    dbStore.deleteApiKey(req.params.id);
    return res.json({ success: true, message: 'تم إلغاء مفتاح API بنجاح' });
  });

  // --- 6. PROVIDERS API ---
  apiRouter.get('/providers', (req, res) => {
    return res.json({ providers: dbStore.getProviders() });
  });

  apiRouter.put('/providers/:id', authenticateAdminJwt, (req, res) => {
    const prov = dbStore.updateProvider(req.params.id, req.body);
    if (!prov) return res.status(404).json({ error: 'Provider not found' });
    return res.json({ provider: prov });
  });

  apiRouter.post('/providers/:id/test', authenticateAdminJwt, async (req, res) => {
    const prov = dbStore.getProviders().find(p => p.id === req.params.id || p.provider_id === req.params.id);
    if (!prov) return res.status(404).json({ error: 'Provider not found' });

    try {
      const health = await container.providerService.testProvider(prov.provider_id);
      return res.json({
        success: health.isHealthy,
        latency_ms: health.latencyMs,
        error: health.errorMessage,
        message: health.isHealthy 
          ? `نجح الاتصال بخادم SMTP (${prov.host}:${prov.port})` 
          : `فشل الاتصال: ${health.errorMessage}`
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 6. SCHEDULING SERVICE API ---
  apiRouter.post('/schedules/one-shot', async (req, res) => {
    try {
      const { name, scheduledTime, fromEmail, toEmails, subject, htmlContent, textContent, templateId, templateData } = req.body;
      if (!name || !scheduledTime || !toEmails || !subject) {
        return res.status(400).json({ error: 'Missing required parameters: name, scheduledTime, toEmails, subject' });
      }
      const task = await container.schedulingService.scheduleOneShotEmail({
        name,
        scheduledTime,
        fromEmail: fromEmail || 'noreply@enterprise-esp.com',
        toEmails: Array.isArray(toEmails) ? toEmails : [toEmails],
        subject,
        htmlContent,
        textContent,
        templateId,
        templateData
      });
      return res.status(201).json({ success: true, task });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/schedules/recurring', async (req, res) => {
    try {
      const { name, frequency, scheduledTime, dayOfWeek, dayOfMonth, fromEmail, toEmails, subject, htmlContent, textContent, templateId, templateData } = req.body;
      if (!name || !frequency || !scheduledTime || !toEmails || !subject) {
        return res.status(400).json({ error: 'Missing required parameters: name, frequency, scheduledTime, toEmails, subject' });
      }
      const task = await container.schedulingService.scheduleRecurringEmail({
        name,
        frequency,
        scheduledTime,
        dayOfWeek,
        dayOfMonth,
        fromEmail: fromEmail || 'noreply@enterprise-esp.com',
        toEmails: Array.isArray(toEmails) ? toEmails : [toEmails],
        subject,
        htmlContent,
        textContent,
        templateId,
        templateData
      });
      return res.status(201).json({ success: true, task });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/schedules', async (req, res) => {
    try {
      const tasks = await container.schedulingService.listScheduledTasks();
      return res.json({ success: true, schedules: tasks });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/schedules/:id', async (req, res) => {
    try {
      const task = await container.schedulingService.getScheduledTask(req.params.id);
      return res.json({ success: true, schedule: task });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/schedules/:id', async (req, res) => {
    try {
      const updated = await container.schedulingService.updateScheduledTask(req.params.id, req.body);
      return res.json({ success: true, schedule: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/schedules/:id', async (req, res) => {
    try {
      const deleted = await container.schedulingService.cancelScheduledTask(req.params.id);
      return res.json({ success: deleted, message: deleted ? 'Scheduled task cancelled successfully' : 'Task not found' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 7. AUDIT LOGS ---
  apiRouter.get('/audit-logs', (req, res) => {
    return res.json({ logs: dbStore.getAuditLogs() });
  });

  // --- 8. SDK INTERACTIVE TESTER ---
  apiRouter.post('/sdk/test', authenticateApiKey, async (req, res) => {
    const { action, params } = req.body;

    if (action === 'send') {
      const job = await emailQueue.enqueue({
        job_id: `sdk-${Date.now()}`,
        from_email: 'noreply@enterprise-esp.com',
        to_emails: Array.isArray(params?.to) ? params.to : [params?.to || 'dev@example.com'],
        subject: params?.subject || 'تجربة عبر SDK',
        html_content: params?.html || '<p>محتوى البريد الإلكتروني</p>',
        priority: params?.priority || 'high'
      });
      return res.json({ success: true, action, result: { job_id: job.job_id, status: job.status } });
    }

    if (action === 'status') {
      const job = dbStore.getJobById(params?.job_id);
      return res.json({ success: !!job, action, result: job || { error: 'Job not found' } });
    }

    if (action === 'template') {
      const tmpl = dbStore.getTemplateById(params?.template_id || 'tmpl-001');
      if (!tmpl) return res.json({ success: false, error: 'Template not found' });
      const rendered = renderTemplate(tmpl.html, params?.data || {});
      return res.json({ success: true, action, result: { subject: tmpl.subject, html: rendered } });
    }

    return res.json({ success: true, action, result: { status: 'ok', message: 'SDK ping success' } });
  });

  // --- 8. ANALYTICS SERVICE API ---
  apiRouter.get('/analytics/stats', async (req, res) => {
    try {
      const range = (req.query.range as string) || '7d';
      const stats = await container.analyticsService.getRealTimeStats(range);
      return res.json({ success: true, stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/analytics/event', async (req, res) => {
    try {
      const { jobId, eventType, details } = req.body;
      if (!jobId || !eventType) {
        return res.status(400).json({ success: false, error: 'Missing required parameters: jobId, eventType' });
      }
      await container.analyticsService.trackEvent(jobId, eventType, details);
      return res.json({ success: true, message: `Event ${eventType} tracked successfully for job ${jobId}` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/analytics/report', async (req, res) => {
    try {
      const range = (req.body.range as 'daily' | 'weekly' | 'monthly') || 'weekly';
      const report = await container.analyticsService.generateReport(range);
      return res.json({ success: true, report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/analytics/export', async (req, res) => {
    try {
      const range = (req.query.range as string) || '7d';
      const format = (req.query.format as 'csv' | 'excel' | 'pdf') || 'csv';
      
      const { content, mimeType, filename } = await container.analyticsService.exportData(range, format);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.send(content);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Register API router
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouterModular);

  // Vite Integration for dev vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise Email Service Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
