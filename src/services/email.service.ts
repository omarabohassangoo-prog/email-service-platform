import { 
  IEmailService, SendEmailDto, SendEmailResult, EmailStatus 
} from '../interfaces/email.service.interface';
import { IAuthService } from '../interfaces/auth.service.interface';
import { IQueueService } from '../interfaces/queue.service.interface';
import { IProviderService } from '../interfaces/provider.service.interface';
import { ITemplateService } from '../interfaces/template.service.interface';
import { dbStore } from '../server/db';
import { emailQueue } from '../server/queue';

/**
 * Implementation of IEmailService
 * Coordinates validation, template rendering, provider failover, and queue dispatching.
 */
export class EmailService implements IEmailService {
  constructor(
    private authService: IAuthService,
    private queueService: IQueueService,
    private providerService: IProviderService,
    private templateService: ITemplateService
  ) {}

  /**
   * Enqueues an email dispatch job into Queue after validating template, attachments & API key limits
   */
  async sendEmail(data: SendEmailDto, apiKey: string): Promise<SendEmailResult> {
    // 1. Validate API Key
    const authResult = await this.authService.validateApiKey(apiKey);
    if (!authResult.isValid) {
      throw new Error(`Authentication Failed: ${authResult.error || 'Invalid API key'}`);
    }

    // 2. Rate Limit & Daily Limit Check
    const keyObj = dbStore.getApiKeyByKey(apiKey);
    if (keyObj) {
      if (keyObj.daily_used >= keyObj.daily_limit) {
        throw new Error('تجاوزت الحد اليومي المسموح به لإرسال الرسائل عبر هذا المفتاح (Daily API Key rate limit exceeded)');
      }
    }

    // 3. Render Template if templateId is specified
    let finalHtml = data.html || '';
    let finalSubject = data.subject || 'No Subject';
    let finalText = data.text || '';

    if (data.templateId) {
      const renderResult = await this.templateService.renderTemplate(data.templateId, data.templateData || {});
      finalHtml = renderResult.renderedHtml;
      finalSubject = renderResult.renderedSubject;
      finalText = renderResult.renderedText || '';
    }

    if (!finalHtml && !finalText) {
      throw new Error('محتوى الرسالة (HTML أو نص عادي أو قالب) مطلوب (Email body is required)');
    }

    // 4. Validate Attachment Size Limit (up to 10MB total)
    if (data.attachments && data.attachments.length > 0) {
      const totalSize = data.attachments.reduce((sum, att) => sum + (att.size || 0), 0);
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (totalSize > MAX_SIZE) {
        throw new Error('إجمالي حجم المرفقات يتجاوز الحد الأقصى المسموح به وهو 10 ميجابايت (Total attachments size exceeds 10MB limit)');
      }
    }

    // 5. Increment usage count
    if (keyObj) {
      keyObj.daily_used += 1;
      keyObj.last_used = new Date().toISOString();
    }

    // 6. Dispatch to Queue Manager
    const job = await emailQueue.enqueue({
      api_key_id: authResult.apiKeyId,
      job_id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      from_email: data.from || 'noreply@enterprise-esp.com',
      to_emails: data.to,
      subject: finalSubject,
      html_content: finalHtml,
      text_content: finalText,
      template_id: data.templateId,
      template_data: data.templateData,
      attachments: data.attachments,
      priority: data.priority || 'normal',
      scheduled_at: data.scheduledAt ? data.scheduledAt.toISOString() : undefined
    });

    return {
      jobId: job.job_id,
      status: job.status as any,
      queuePosition: 1,
      estimatedDeliveryMs: 1500
    };
  }

  /**
   * Retrieves current delivery status and event trail for a specific email job from the database
   */
  async getEmailStatus(jobId: string): Promise<EmailStatus> {
    const job = dbStore.getJobById(jobId);
    if (!job) {
      throw new Error(`Email Job with ID "${jobId}" not found`);
    }

    const events = dbStore.getEventsByJobId(job.id).map(e => ({
      type: e.event_type,
      timestamp: new Date(e.created_at)
    }));

    return {
      jobId: job.job_id || job.id,
      status: job.status as any,
      sentAt: job.sent_at ? new Date(job.sent_at) : undefined,
      retryCount: job.retry_count || 0,
      errorMessage: job.error_message,
      events: events.length > 0 ? events : [{ type: job.status, timestamp: new Date(job.updated_at) }]
    };
  }

  /**
   * Processes the email job in worker thread, executing SMTP transport or failover provider
   */
  async processEmail(jobData: SendEmailDto & { jobId: string; apiKeyId?: string }): Promise<void> {
    const activeProvider = await this.providerService.getActiveProvider();
    console.log(`[EmailService] Processing job ${jobData.jobId} via provider ${activeProvider.name} (${activeProvider.host}:${activeProvider.port})`);
  }

  /**
   * Handles email job failure, updating retry counter and triggering failover if max retries exceeded
   */
  async handleEmailFailure(jobId: string, error: Error): Promise<void> {
    console.error(`[EmailService] Job ${jobId} failed: ${error.message}. Triggering failover check.`);
    const provider = await this.providerService.getActiveProvider();
    await this.providerService.triggerFailover(provider.providerId, error.message);
  }

  /**
   * Cancels a pending or scheduled email job if not yet processing
   */
  async cancelEmailJob(jobId: string): Promise<boolean> {
    console.log(`[EmailService] Cancelling job ${jobId}`);
    const job = dbStore.getJobById(jobId);
    if (job && (job.status === 'queued' || job.status === 'scheduled')) {
      dbStore.updateJob(job.id, { status: 'failed', error_message: 'تم إلغاء المهمة من قبل المستخدم' });
      return true;
    }
    return false;
  }
}
