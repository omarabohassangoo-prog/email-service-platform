/**
 * @file client.ts
 * @description The primary EmailService client class for interacting with the Enterprise ESP Platform.
 */

import type {
  EmailServiceConfig,
  SendEmailOptions,
  SendEmailResult,
  EmailStatus,
  BulkSendOptions,
  BulkEmailResult,
  ScheduleEmailOptions,
  ScheduleEmailResult,
  ScheduleInfo,
  ScheduleList,
  Template,
  TemplateList,
  CreateTemplateOptions,
  RenderTemplateResult,
  ServiceStats,
  HealthStatus,
  SDKTestResult,
  ConnectionTest,
} from './types.js';
import { HttpClient } from './utils/http.js';
import { Logger } from './utils/logger.js';
import {
  validateSendEmailOptions,
  validateScheduleEmailOptions,
  validateCreateTemplateOptions,
} from './utils/validator.js';
import { ValidationError, EmailServiceError } from './errors.js';

/**
 * Enterprise Email Service Client (ESP SDK)
 *
 * Provides a simple, type-safe API for transactional sending, high-throughput bulk dispatch,
 * Handlebars templates, scheduling, and live queue telemetry.
 *
 * @example
 * ```typescript
 * import { EmailService } from '@email-service/sdk';
 *
 * const client = new EmailService({
 *   apiKey: 'sk_live_enterprise_esp_secret',
 *   baseUrl: 'https://api.email-service.com',
 *   logLevel: 'info'
 * });
 *
 * const res = await client.sendEmail({
 *   to: 'recipient@company.com',
 *   subject: 'Welcome to the Platform',
 *   html: '<h1>Welcome!</h1>'
 * });
 * console.log('Queued Job ID:', res.jobId);
 * ```
 */
export class EmailService {
  private static instance: EmailService | null = null;
  private readonly http: HttpClient;
  private readonly logger: Logger;
  private readonly config: EmailServiceConfig;

  /**
   * Initializes a new EmailService client instance.
   *
   * @param config Configuration parameters including API key and base URL.
   * @throws {ValidationError} If the API key is missing or blank.
   */
  constructor(config: EmailServiceConfig) {
    if (!config || typeof config !== 'object') {
      throw new ValidationError('EmailService configuration object is required.');
    }
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
      throw new ValidationError('A valid apiKey must be specified in EmailServiceConfig.');
    }

    this.config = {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      retries: 3,
      logLevel: 'info',
      ...config,
    };

    this.logger = new Logger(this.config.logLevel);
    this.http = new HttpClient({
      baseUrl: this.config.baseUrl!,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      retries: this.config.retries,
      logger: this.logger,
      headers: this.config.headers,
    });

    this.logger.debug('EmailService client initialized successfully.');
  }

  /**
   * Returns or creates a singleton instance of EmailService.
   *
   * @param config Optional configuration to initialize the singleton on first call.
   */
  public static getInstance(config?: EmailServiceConfig): EmailService {
    if (!EmailService.instance) {
      if (!config) {
        throw new EmailServiceError('Cannot initialize EmailService singleton without configuration.');
      }
      EmailService.instance = new EmailService(config);
    }
    return EmailService.instance;
  }

  /**
   * Clears the active singleton instance (primarily used in testing).
   */
  public static resetInstance(): void {
    EmailService.instance = null;
  }

  // ==========================================
  // CORE FUNCTIONS
  // ==========================================

  /**
   * Enqueues an email message to be sent via the platform queue.
   *
   * @param options Email details including recipient(s), subject, body, attachments, priority.
   * @returns A promise resolving to the submission confirmation containing the unique `jobId`.
   *
   * @example
   * ```typescript
   * const result = await client.sendEmail({
   *   to: 'user@example.com',
   *   subject: 'Password Reset',
   *   html: '<p>Click here to reset...</p>',
   *   priority: 'high'
   * });
   * ```
   */
  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    validateSendEmailOptions(options);
    this.logger.info(`Sending email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);

    // Process attachments to normalize base64 if ArrayBuffer/Uint8Array
    const processedAttachments = options.attachments?.map((att) => {
      let content = att.content;
      if (typeof content !== 'string' && content) {
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
          content = (content as Buffer).toString('base64');
        } else if (content instanceof Uint8Array || content instanceof ArrayBuffer) {
          const bytes = content instanceof ArrayBuffer ? new Uint8Array(content) : content;
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            if (byte !== undefined) {
              binary += String.fromCharCode(byte);
            }
          }
          content = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
        }
      }
      return {
        ...att,
        content: content as string | undefined,
      };
    });

    const payload = {
      ...options,
      attachments: processedAttachments,
      scheduled_at: options.scheduledAt,
      template_id: options.templateId,
      template_data: options.templateData,
      provider_id: options.providerId,
    };

    const response = await this.http.request<{
      success: boolean;
      job_id?: string;
      jobId?: string;
      status?: 'queued' | 'processing' | 'sent' | 'failed' | 'delayed';
      message?: string;
      email_id?: string;
      emailId?: string;
      timestamp?: string;
    }>({
      method: 'POST',
      path: '/api/v1/email/send',
      body: payload,
    });

    return {
      success: response.success ?? true,
      jobId: response.jobId || response.job_id || 'unknown_job',
      status: response.status || 'queued',
      message: response.message || 'Email enqueued successfully',
      emailId: response.emailId || response.email_id,
      timestamp: response.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Retrieves the real-time processing status of a previously queued email job.
   *
   * @param jobId The unique identifier returned when calling `sendEmail`.
   * @returns Detailed lifecycle information and provider delivery feedback.
   */
  public async getEmailStatus(jobId: string): Promise<EmailStatus> {
    if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
      throw new ValidationError('A valid non-empty jobId string is required.');
    }

    this.logger.debug(`Fetching email status for job: ${jobId}`);

    const res = await this.http.request<{
      job_id?: string;
      jobId?: string;
      status: 'queued' | 'processing' | 'sent' | 'failed' | 'delayed' | 'cancelled';
      attempts?: number;
      result?: {
        messageId?: string;
        accepted?: string[];
        rejected?: string[];
        provider?: string;
        sentAt?: string;
      };
      error?: string;
      created_at?: string;
      createdAt?: string;
      sent_at?: string;
      sentAt?: string;
    }>({
      method: 'GET',
      path: `/api/v1/email/status/${encodeURIComponent(jobId)}`,
    });

    return {
      jobId: res.jobId || res.job_id || jobId,
      status: res.status,
      attempts: res.attempts ?? 1,
      result: res.result,
      error: res.error,
      createdAt: res.createdAt || res.created_at || new Date().toISOString(),
      sentAt: res.sentAt || res.sent_at,
    };
  }

  /**
   * Dispatches a batch of emails concurrently in chunked intervals.
   *
   * @param options Configuration specifying the email array, batch size, and inter-batch delay.
   * @returns Summary statistics and per-email job assignment results.
   */
  public async bulkSend(options: BulkSendOptions): Promise<BulkEmailResult> {
    if (!options || !Array.isArray(options.emails) || options.emails.length === 0) {
      throw new ValidationError('Field options.emails must be a non-empty array.');
    }

    const batchSize = Math.max(1, options.batchSize ?? 50);
    const batchDelay = Math.max(0, options.batchDelay ?? 50);
    const retryOnFailure = options.retryOnFailure ?? true;
    const emails = options.emails;

    this.logger.info(`Starting bulkSend for ${emails.length} emails in batches of ${batchSize}`);

    const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const results: Array<{ email: string; success: boolean; jobId?: string; error?: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const chunk = emails.slice(i, i + batchSize);

      const chunkPromises = chunk.map(async (emailItem) => {
        const primaryRecipient = Array.isArray(emailItem.to) ? emailItem.to[0] || 'unknown' : emailItem.to;
        try {
          const res = await this.sendEmail(emailItem);
          return {
            email: primaryRecipient,
            success: true,
            jobId: res.jobId,
          };
        } catch (err: unknown) {
          const errorMsg = (err as Error)?.message || 'Failed to dispatch email';
          return {
            email: primaryRecipient,
            success: false,
            error: errorMsg,
          };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      for (const cr of chunkResults) {
        if (cr.success) {
          sentCount++;
        } else {
          failedCount++;
        }
        results.push(cr);
      }

      // Inter-batch delay
      if (i + batchSize < emails.length && batchDelay > 0) {
        await new Promise((r) => setTimeout(r, batchDelay));
      }
    }

    return {
      success: failedCount === 0 || retryOnFailure,
      batchId,
      total: emails.length,
      sent: sentCount,
      failed: failedCount,
      results,
      message: `Bulk send completed: ${sentCount} queued, ${failedCount} failed`,
    };
  }

  /**
   * Schedules an email to be sent at a future point in time or on a recurring cadence.
   *
   * @param options Email payload including scheduledAt and optional recurrence rule.
   * @returns Scheduled task confirmation and schedule ID.
   */
  public async scheduleEmail(options: ScheduleEmailOptions): Promise<ScheduleEmailResult> {
    validateScheduleEmailOptions(options);

    const scheduledDate = options.scheduledAt instanceof Date ? options.scheduledAt.toISOString() : options.scheduledAt;

    const endsDate = options.endsAt instanceof Date ? options.endsAt.toISOString() : options.endsAt;

    this.logger.info(`Scheduling email to ${options.to} for ${scheduledDate}`);

    const res = await this.http.request<{
      success?: boolean;
      schedule_id?: string;
      scheduleId?: string;
      job_id?: string;
      jobId?: string;
      scheduled_at?: string;
      scheduledAt?: string;
      recurrence?: string | null;
      message?: string;
    }>({
      method: 'POST',
      path: '/api/v1/schedules',
      body: {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        scheduled_at: scheduledDate,
        recurrence: options.recurrence ?? null,
        ends_at: endsDate,
        priority: options.priority || 'normal',
        template_id: options.templateId,
        template_data: options.templateData,
      },
    });

    return {
      success: res.success ?? true,
      scheduleId: res.scheduleId || res.schedule_id || `sch_${Date.now()}`,
      jobId: res.jobId || res.job_id,
      scheduledAt: res.scheduledAt || res.scheduled_at || scheduledDate,
      recurrence: res.recurrence,
      message: res.message || 'Email scheduled successfully',
    };
  }

  /**
   * Cancels a previously scheduled email task.
   *
   * @param scheduleId Identifier of the schedule.
   */
  public async cancelSchedule(scheduleId: string): Promise<{ success: boolean; message: string }> {
    if (!scheduleId) {
      throw new ValidationError("Parameter 'scheduleId' is required.");
    }

    this.logger.info(`Cancelling schedule: ${scheduleId}`);

    return await this.http.request<{ success: boolean; message: string }>({
      method: 'DELETE',
      path: `/api/v1/schedules/${encodeURIComponent(scheduleId)}`,
    });
  }

  /**
   * Retrieves full details for a scheduled email task.
   *
   * @param scheduleId Identifier of the schedule.
   */
  public async getSchedule(scheduleId: string): Promise<ScheduleInfo> {
    if (!scheduleId) {
      throw new ValidationError("Parameter 'scheduleId' is required.");
    }

    return await this.http.request<ScheduleInfo>({
      method: 'GET',
      path: `/api/v1/schedules/${encodeURIComponent(scheduleId)}`,
    });
  }

  /**
   * Lists scheduled email tasks with pagination and status filters.
   */
  public async listSchedules(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ScheduleList> {
    return await this.http.request<ScheduleList>({
      method: 'GET',
      path: '/api/v1/schedules',
      query: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        status: params?.status,
      },
    });
  }

  // ==========================================
  // TEMPLATE FUNCTIONS
  // ==========================================

  /**
   * Lists available email templates in the system.
   */
  public async getTemplates(params?: {
    page?: number;
    limit?: number;
    category?: string;
    scope?: 'global' | 'app';
  }): Promise<TemplateList> {
    const res = await this.http.request<{
      templates?: Template[];
      items?: Template[];
      total?: number;
      page?: number;
      limit?: number;
    }>({
      method: 'GET',
      path: '/api/v1/templates',
      query: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        category: params?.category,
        scope: params?.scope,
      },
    });

    const items = res.templates || res.items || [];
    return {
      items,
      total: res.total ?? items.length,
      page: res.page ?? 1,
      limit: res.limit ?? items.length,
    };
  }

  /**
   * Fetches a specific template by its ID.
   */
  public async getTemplate(templateId: string): Promise<Template> {
    if (!templateId) {
      throw new ValidationError("Parameter 'templateId' is required.");
    }

    const res = await this.http.request<{ template?: Template } | Template>({
      method: 'GET',
      path: `/api/v1/templates/${encodeURIComponent(templateId)}`,
    });

    if ('template' in res && res.template) {
      return res.template;
    }
    return res as Template;
  }

  /**
   * Creates a new Handlebars email template.
   */
  public async createTemplate(params: CreateTemplateOptions): Promise<Template> {
    validateCreateTemplateOptions(params);

    this.logger.info(`Creating template: ${params.name}`);

    const res = await this.http.request<{ template?: Template } | Template>({
      method: 'POST',
      path: '/api/v1/templates',
      body: params,
    });

    if ('template' in res && res.template) {
      return res.template;
    }
    return res as Template;
  }

  /**
   * Updates an existing template.
   */
  public async updateTemplate(
    templateId: string,
    data: Partial<CreateTemplateOptions> & { isActive?: boolean }
  ): Promise<Template> {
    if (!templateId) {
      throw new ValidationError("Parameter 'templateId' is required.");
    }

    this.logger.info(`Updating template: ${templateId}`);

    const res = await this.http.request<{ template?: Template } | Template>({
      method: 'PUT',
      path: `/api/v1/templates/${encodeURIComponent(templateId)}`,
      body: data,
    });

    if ('template' in res && res.template) {
      return res.template;
    }
    return res as Template;
  }

  /**
   * Deletes a template from the platform.
   */
  public async deleteTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    if (!templateId) {
      throw new ValidationError("Parameter 'templateId' is required.");
    }

    this.logger.info(`Deleting template: ${templateId}`);

    return await this.http.request<{ success: boolean; message: string }>({
      method: 'DELETE',
      path: `/api/v1/templates/${encodeURIComponent(templateId)}`,
    });
  }

  /**
   * Renders and previews a template with dynamic sample parameters.
   */
  public async renderTemplate(
    templateId: string,
    data: Record<string, unknown>
  ): Promise<RenderTemplateResult> {
    if (!templateId) {
      throw new ValidationError("Parameter 'templateId' is required.");
    }

    return await this.http.request<RenderTemplateResult>({
      method: 'POST',
      path: `/api/v1/templates/${encodeURIComponent(templateId)}/render`,
      body: { data },
    });
  }

  // ==========================================
  // ADMIN & DIAGNOSTIC FUNCTIONS
  // ==========================================

  /**
   * Retrieves high-level operational statistics and queue depths.
   */
  public async getStats(): Promise<ServiceStats> {
    const res = await this.http.request<{
      stats?: ServiceStats;
      totalSent?: number;
      totalFailed?: number;
      queued?: number;
      processing?: number;
      scheduled?: number;
      queue?: ServiceStats['queue'];
      providers?: ServiceStats['providers'];
      status?: ServiceStats['status'];
      uptime?: number;
    }>({
      method: 'GET',
      path: '/api/v1/admin/stats',
    });

    if (res.stats) {
      return res.stats;
    }

    return {
      totalSent: res.totalSent ?? 0,
      totalFailed: res.totalFailed ?? 0,
      queued: res.queued ?? 0,
      processing: res.processing ?? 0,
      scheduled: res.scheduled ?? 0,
      queue: res.queue ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      providers: res.providers ?? [],
      status: res.status ?? 'healthy',
      uptime: res.uptime ?? 0,
    };
  }

  /**
   * Executes a component health check verifying Database, Redis, and Providers.
   */
  public async getHealth(): Promise<HealthStatus> {
    return await this.http.request<HealthStatus>({
      method: 'GET',
      path: '/api/v1/health',
    });
  }

  /**
   * Runs an end-to-end diagnostic test of SDK connectivity and execution.
   */
  public async testSDK(
    action: 'send' | 'status' | 'template',
    params: Record<string, unknown>
  ): Promise<SDKTestResult> {
    const startTime = Date.now();
    const res = await this.http.request<{ success: boolean; data: unknown }>({
      method: 'POST',
      path: '/api/v1/sdk/test',
      body: { action, params, apiKey: this.config.apiKey },
    });

    return {
      success: res.success ?? true,
      action,
      responseTimeMs: Date.now() - startTime,
      data: res.data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Quick round-trip ping verifying network reachability and latency.
   */
  public async testConnection(): Promise<ConnectionTest> {
    const startTime = Date.now();
    const health = await this.getHealth();
    const latency = Date.now() - startTime;

    return {
      connected: health.status === 'healthy' || health.status === 'degraded',
      latencyMs: latency,
      serverTime: health.timestamp || new Date().toISOString(),
      version: health.version || '1.0.0',
    };
  }
}
