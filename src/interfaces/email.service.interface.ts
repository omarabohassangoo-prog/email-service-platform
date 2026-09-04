/**
 * Interface definition for Email Processing and Dispatch Service
 * Handles transactional and template-based email job dispatching, status tracking, and error recovery.
 */

export interface SendEmailDto {
  from?: string;
  to: string[];
  subject?: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  attachments?: Array<{ filename: string; size: number; url: string }>;
}

export interface SendEmailResult {
  jobId: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  queuePosition?: number;
  messageId?: string;
  estimatedDeliveryMs?: number;
}

export interface EmailStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'retrying';
  sentAt?: Date;
  retryCount: number;
  errorMessage?: string;
  events: Array<{ type: string; timestamp: Date }>;
}

export interface IEmailService {
  /**
   * Enqueues an email dispatch job into Bull Queue after validating template & API key permissions
   */
  sendEmail(data: SendEmailDto, apiKey: string): Promise<SendEmailResult>;

  /**
   * Retrieves current delivery status and event trail for a specific email job
   */
  getEmailStatus(jobId: string): Promise<EmailStatus>;

  /**
   * Processes the email job in worker thread, executing SMTP transport or failover provider
   */
  processEmail(jobData: SendEmailDto & { jobId: string; apiKeyId?: string }): Promise<void>;

  /**
   * Handles email job failure, updating retry counter and triggering failover if max retries exceeded
   */
  handleEmailFailure(jobId: string, error: Error): Promise<void>;

  /**
   * Cancels a pending or scheduled email job if not yet processing
   */
  cancelEmailJob(jobId: string): Promise<boolean>;
}
