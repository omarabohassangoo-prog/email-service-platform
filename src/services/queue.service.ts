import { 
  IQueueService, QueueJobOptions, QueueMetrics 
} from '../interfaces/queue.service.interface';
import { emailQueue } from '../core/queue/emailQueue';
import { queueManager } from '../core/queue/queueManager';

/**
 * Implementation of IQueueService
 * Manages Bull Queue operations, metric tracking, and worker state control.
 */
export class QueueService implements IQueueService {
  /**
   * Adds a new payload to the specified email queue
   */
  async addJob<T = any>(queueName: string, name: string, data: T, opts?: QueueJobOptions): Promise<{ id: string }> {
    const jobData = data as any;
    const job = await emailQueue.addToQueue({
      api_key_id: jobData.api_key_id || 'manual',
      job_id: jobData.job_id || `job-${Date.now()}`,
      from_email: jobData.from_email || 'noreply@enterprise-esp.com',
      to_emails: jobData.to_emails || [],
      subject: jobData.subject || 'No Subject',
      html_content: jobData.html_content || '',
      text_content: jobData.text_content || '',
      template_id: jobData.template_id,
      template_data: jobData.template_data,
      attachments: jobData.attachments || [],
      priority: jobData.priority || 'normal',
      scheduled_at: jobData.scheduled_at
    }, opts);

    return { id: job.id };
  }

  /**
   * Returns current metric counters (waiting, active, completed, failed) for a queue
   */
  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    const stats = await emailQueue.getQueueStats();
    return {
      ...stats,
      paused: queueManager.isQueuePaused()
    };
  }

  /**
   * Temporarily pauses queue processing
   */
  async pauseQueue(queueName: string): Promise<void> {
    queueManager.pauseQueue();
  }

  /**
   * Resumes queue processing
   */
  async resumeQueue(queueName: string): Promise<void> {
    queueManager.resumeQueue();
  }

  /**
   * Cleans completed or failed jobs from queue storage
   */
  async cleanQueue(queueName: string, gracePeriodMs: number, status?: 'completed' | 'failed'): Promise<number> {
    return emailQueue.cleanQueue(gracePeriodMs, status);
  }
}
