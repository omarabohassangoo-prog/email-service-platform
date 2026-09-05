/**
 * @file types.ts
 * @description Type definitions for the Enterprise Email Service SDK (@email-service/sdk).
 */

/**
 * Configuration options for initializing the EmailService client.
 */
export interface EmailServiceConfig {
  /**
   * Secret or application API Key generated from the ESP admin portal.
   * Format usually starts with 'sk_' or 'pk_'.
   */
  apiKey: string;

  /**
   * Base URL of the Email Service API server.
   * @default 'http://localhost:3000'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of automatic retry attempts for idempotent network or rate-limit failures.
   * @default 3
   */
  retries?: number;

  /**
   * Minimum logging level for internal SDK operations.
   * @default 'info'
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';

  /**
   * Optional custom HTTP headers to pass with every API request.
   */
  headers?: Record<string, string>;
}

/**
 * Represents an email attachment for both Node.js and Browser environments.
 */
export interface EmailAttachment {
  /**
   * Name of the attached file (e.g. 'invoice.pdf').
   */
  filename: string;

  /**
   * Binary or base64 encoded content of the attachment.
   */
  content?: string | Uint8Array | ArrayBuffer;

  /**
   * File path on disk (Node.js environment only).
   */
  path?: string;

  /**
   * Content-ID for embedding inline images in HTML templates (e.g. '<img src="cid:logo">').
   */
  cid?: string;

  /**
   * MIME type of the attached file (e.g. 'application/pdf', 'image/png').
   */
  contentType?: string;
}

/**
 * Input parameters for sending an email.
 */
export interface SendEmailOptions {
  /**
   * Recipient email address or list of recipient email addresses.
   */
  to: string | string[];

  /**
   * Carbon Copy (CC) recipients.
   */
  cc?: string | string[];

  /**
   * Blind Carbon Copy (BCC) recipients.
   */
  bcc?: string | string[];

  /**
   * Subject line of the email.
   */
  subject: string;

  /**
   * HTML body content of the email.
   */
  html?: string;

  /**
   * Plain text fallback body content of the email.
   */
  text?: string;

  /**
   * Optional file attachments.
   */
  attachments?: EmailAttachment[];

  /**
   * Execution priority within the Bull Queue.
   * @default 'normal'
   */
  priority?: 'high' | 'normal' | 'low';

  /**
   * ID of a pre-configured Handlebars template on the server.
   */
  templateId?: string;

  /**
   * Key-value parameters to interpolate inside the chosen template.
   */
  templateData?: Record<string, unknown>;

  /**
   * Specific provider ID to force sending through (e.g. 'smtp_primary', 'sendgrid', 'resend').
   */
  providerId?: string;

  /**
   * Schedule the email to be processed at a specific future time.
   */
  scheduledAt?: string | Date;

  /**
   * Custom tags for tracking and analytics.
   */
  tags?: string[];

  /**
   * Custom metadata dictionary stored with the email job.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Result returned immediately after submitting an email job.
 */
export interface SendEmailResult {
  /**
   * Whether the email was accepted into the processing queue.
   */
  success: boolean;

  /**
   * Unique Job ID in the Bull Queue. Can be used with getEmailStatus(jobId).
   */
  jobId: string;

  /**
   * Current processing status of the email job.
   */
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'delayed';

  /**
   * Human-readable message or confirmation from the ESP gateway.
   */
  message: string;

  /**
   * Unique email transaction ID if generated.
   */
  emailId?: string;

  /**
   * ISO 8601 timestamp of when the request was accepted.
   */
  timestamp?: string;
}

/**
 * Real-time status information for a previously dispatched email job.
 */
export interface EmailStatus {
  /**
   * The queue job identifier.
   */
  jobId: string;

  /**
   * Lifecycle status of the email job.
   */
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'delayed' | 'cancelled';

  /**
   * Number of delivery attempts made so far.
   */
  attempts: number;

  /**
   * Final delivery details when successfully sent.
   */
  result?: {
    messageId?: string;
    accepted?: string[];
    rejected?: string[];
    provider?: string;
    sentAt?: string;
  };

  /**
   * Detailed error message if the job failed all retry attempts.
   */
  error?: string;

  /**
   * ISO timestamp of job creation.
   */
  createdAt: string;

  /**
   * ISO timestamp when the message was physically sent by the provider.
   */
  sentAt?: string;
}

/**
 * Options for bulk email sending operations.
 */
export interface BulkSendOptions {
  /**
   * Array of email specifications to dispatch.
   */
  emails: SendEmailOptions[];

  /**
   * Batch size for chunking concurrent requests.
   * @default 50
   */
  batchSize?: number;

  /**
   * Milliseconds delay between chunk dispatches to conform with rate limits.
   * @default 100
   */
  batchDelay?: number;

  /**
   * Whether to continue processing remaining batches if individual items fail.
   * @default true
   */
  retryOnFailure?: boolean;
}

/**
 * Summary result of a bulk email dispatch operation.
 */
export interface BulkEmailResult {
  success: boolean;
  batchId: string;
  total: number;
  sent: number;
  failed: number;
  results: Array<{
    email: string;
    success: boolean;
    jobId?: string;
    error?: string;
  }>;
  message: string;
}

/**
 * Parameters for scheduling an email dispatch at a future time or recurring schedule.
 */
export interface ScheduleEmailOptions extends SendEmailOptions {
  /**
   * Specific future date/time to send the email (ISO string or Date object).
   */
  scheduledAt: string | Date;

  /**
   * Recurrence frequency rule for recurring jobs.
   */
  recurrence?: 'daily' | 'weekly' | 'monthly' | null;

  /**
   * Date at which recurring executions should stop.
   */
  endsAt?: string | Date;
}

/**
 * Result returned after registering a scheduled email job.
 */
export interface ScheduleEmailResult {
  success: boolean;
  scheduleId: string;
  jobId?: string;
  scheduledAt: string;
  recurrence?: string | null;
  message: string;
}

/**
 * Detailed information regarding a scheduled job.
 */
export interface ScheduleInfo {
  id: string;
  to: string | string[];
  subject: string;
  scheduledAt: string;
  recurrence?: string | null;
  endsAt?: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  createdAt: string;
  updatedAt?: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

/**
 * Paginated list of scheduled jobs.
 */
export interface ScheduleList {
  items: ScheduleInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Represents an email template managed in the ESP system.
 */
export interface Template {
  id: string;
  name: string;
  description?: string;
  scope: 'global' | 'app';
  appId?: string;
  appName?: string;
  category: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated list of email templates.
 */
export interface TemplateList {
  items: Template[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Input parameters for creating a new template.
 */
export interface CreateTemplateOptions {
  name: string;
  description?: string;
  scope: 'global' | 'app';
  appId?: string;
  appName?: string;
  category?: string;
  subject: string;
  html: string;
  text?: string;
  variables?: string[];
}

/**
 * Rendered template preview output.
 */
export interface RenderTemplateResult {
  subject: string;
  html: string;
  text: string;
}

/**
 * High-level service statistics and metrics.
 */
export interface ServiceStats {
  totalSent: number;
  totalFailed: number;
  queued: number;
  processing: number;
  scheduled: number;
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  providers: Array<{
    id: string;
    name: string;
    status: string;
    lastCheck: string;
  }>;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
}

/**
 * Component-level health check output.
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  components?: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, unknown>;
  }>;
}

/**
 * Result returned from the SDK diagnostic test suite.
 */
export interface SDKTestResult {
  success: boolean;
  action: string;
  responseTimeMs: number;
  data: unknown;
  timestamp: string;
}

/**
 * Simple connection ping diagnostic output.
 */
export interface ConnectionTest {
  connected: boolean;
  latencyMs: number;
  serverTime: string;
  version: string;
}
