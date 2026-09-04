import { EmailJob, JobPriority, JobStatus } from '../../types';
import { dbStore } from '../../server/db';
import { QueueJobOptions, QueueMetrics } from '../../interfaces/queue.service.interface';

/**
 * High-performance mock implementation of Bull Queue.
 * Emulates multiple channels based on priority (high, normal, low, bulk)
 * with robust state handling backed by dbStore.
 */
export class EmailQueue {
  public name: string;
  private defaultOptions: QueueJobOptions;

  constructor(name: string = 'email-queue') {
    this.name = name;
    this.defaultOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false
    };
  }

  /**
   * Adds a new email dispatch job to the queue
   */
  public async addToQueue(
    jobData: Omit<EmailJob, 'id' | 'status' | 'retry_count' | 'created_at' | 'updated_at' | 'max_retries'> & { max_retries?: number },
    options?: QueueJobOptions
  ): Promise<EmailJob> {
    const opts = { ...this.defaultOptions, ...options };
    const isScheduled = jobData.scheduled_at && new Date(jobData.scheduled_at).getTime() > Date.now();
    const status: JobStatus = isScheduled ? 'scheduled' : 'queued';

    const newJob: EmailJob = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status,
      retry_count: 0,
      max_retries: jobData.max_retries || opts.attempts || 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbStore.addJob(newJob);

    dbStore.addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email_job_id: newJob.id,
      event_type: 'queued',
      recipient: newJob.to_emails[0],
      created_at: new Date().toISOString()
    });

    // Check queue threshold limits and trigger warning alert if necessary
    const stats = await this.getQueueStats();
    if (stats.waiting > 100) {
      dbStore.addAuditLog('queue.threshold_warning', {
        queue: this.name,
        waiting_count: stats.waiting,
        message: 'تحذير: تجاوز عدد الرسائل في طابور الانتظار 100 رسالة (Queue size exceeded limits)'
      });
    }

    return newJob;
  }

  /**
   * Retrieves current metric counts of jobs in the queue
   */
  public async getQueueStats(): Promise<QueueMetrics> {
    const allJobs = dbStore.getJobs(1000);
    const stats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: false
    };

    allJobs.forEach(job => {
      if (job.status === 'queued') stats.waiting++;
      else if (job.status === 'processing') stats.active++;
      else if (job.status === 'sent') stats.completed++;
      else if (job.status === 'failed') stats.failed++;
      else if (job.status === 'scheduled') stats.delayed++;
    });

    return stats;
  }

  /**
   * Cleans up completed or failed jobs from the database store
   */
  public async cleanQueue(gracePeriodMs: number, status?: 'completed' | 'failed'): Promise<number> {
    const allJobs = dbStore.getJobs(2000);
    const now = Date.now();
    let cleanedCount = 0;

    allJobs.forEach(job => {
      const isStatusMatch = !status || 
        (status === 'completed' && job.status === 'sent') || 
        (status === 'failed' && job.status === 'failed');

      if (isStatusMatch) {
        const lastUpdated = new Date(job.updated_at).getTime();
        if (now - lastUpdated > gracePeriodMs) {
          // Remove the job from the storage array
          const index = dbStore.getJobs(2000).findIndex(j => j.id === job.id);
          if (index !== -1) {
            dbStore.getJobs(2000).splice(index, 1);
            cleanedCount++;
          }
        }
      }
    });

    if (cleanedCount > 0) {
      dbStore.addAuditLog('queue.cleanup', {
        cleaned_count: cleanedCount,
        status: status || 'all'
      });
    }

    return cleanedCount;
  }
}

export const emailQueue = new EmailQueue();
