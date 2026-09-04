import { emailQueue } from './emailQueue';
import { dbStore } from '../../server/db';
import { sendEmailThroughProviders } from '../../server/providers';
import { EmailJob, JobPriority, JobStatus } from '../../types';

export class QueueManager {
  private isProcessing = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private isPaused = false;
  private scheduleCheckCounter = 0;

  // Max parallel workers for each priority channel
  private workerConcurrencies: Record<JobPriority, number> = {
    urgent: 5,
    high: 3,
    normal: 2,
    low: 1,
    bulk: 1
  };

  constructor() {
    this.startWorkers();
  }

  public startWorkers() {
    if (this.workerInterval) return;
    // Process queue every 100ms for high performance and live reactive updates
    this.workerInterval = setInterval(() => {
      this.processQueue();
    }, 100);
  }

  public stopWorkers() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
  }

  public pauseQueue() {
    this.isPaused = true;
    dbStore.addAuditLog('queue.paused', { message: 'تم إيقاف معالجة طابور الإرسال مؤقتاً (Queue execution paused)' });
  }

  public resumeQueue() {
    this.isPaused = false;
    dbStore.addAuditLog('queue.resumed', { message: 'تم استئناف معالجة طابور الإرسال (Queue execution resumed)' });
  }

  public isQueuePaused() {
    return this.isPaused;
  }

  /**
   * Main Queue processor that routes jobs by priority channels and processes them concurrently
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused) return;
    this.isProcessing = true;

    try {
      // Process scheduling engine (once every 5 seconds / 50 ticks)
      this.scheduleCheckCounter++;
      if (this.scheduleCheckCounter >= 50) {
        this.scheduleCheckCounter = 0;
        try {
          const { container } = await import('../../services/container');
          await container.schedulingService.processSchedules();
        } catch (err) {
          console.error('[QueueManager] Error processing schedules:', err);
        }
      }

      const allJobs = dbStore.getJobs(1000);

      // 1. Check for ready scheduled jobs
      const now = Date.now();
      const readyScheduled = allJobs.filter(
        j => j.status === 'scheduled' && j.scheduled_at && new Date(j.scheduled_at).getTime() <= now
      );
      readyScheduled.forEach(j => {
        dbStore.updateJob(j.id, { status: 'queued' });
      });

      // 2. Alert logic for queue backlog
      const queuedJobs = allJobs.filter(j => j.status === 'queued');
      if (queuedJobs.length > 50) {
        dbStore.addAuditLog('queue.backlog_alert', {
          queued_count: queuedJobs.length,
          severity: 'high',
          message: `تنبيه: حجم طابور الانتظار مرتفع جداً (${queuedJobs.length} رسالة) - جاري تفعيل الموزعين الاحتياطيين`
        });
      }

      // 3. Process priority channels with custom parallel worker limits
      const priorityOrder: Record<JobPriority, number> = {
        urgent: 0,
        high: 1,
        normal: 2,
        low: 3,
        bulk: 4
      };

      // Sort pending queued jobs by priority
      const pendingJobs = [...queuedJobs].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      if (pendingJobs.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Determine concurrency limit based on the highest priority job in current batch
      const highestPriorityInBatch = pendingJobs[0].priority;
      const limit = this.workerConcurrencies[highestPriorityInBatch] || 2;

      const batch = pendingJobs.slice(0, limit);
      await Promise.all(batch.map(job => this.processSingleJob(job)));

      // 4. Auto cleanup completed jobs older than 24 hours
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      await emailQueue.cleanQueue(ONE_DAY_MS, 'completed');

    } catch (err) {
      console.error('[QueueManager] Error processing queue:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processes a single email job through the active providers, handling retries with exponential backoff
   */
  private async processSingleJob(job: EmailJob): Promise<void> {
    dbStore.updateJob(job.id, { status: 'processing' });

    try {
      const result = await sendEmailThroughProviders(job);

      if (result.success) {
        dbStore.updateJob(job.id, {
          status: 'sent',
          provider_id: result.provider_id,
          message_id: result.message_id,
          sent_at: new Date().toISOString(),
          latency_ms: result.latency_ms
        });

        dbStore.addEvent({
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email_job_id: job.id,
          event_type: 'delivered',
          recipient: job.to_emails[0],
          event_data: { provider_id: result.provider_id, message_id: result.message_id, latency_ms: result.latency_ms },
          created_at: new Date().toISOString()
        });
      } else {
        await this.handleJobFailure(job, result.error || 'SMTP Delivery Failure');
      }
    } catch (err: any) {
      await this.handleJobFailure(job, err?.message || String(err));
    }
  }

  /**
   * Exponential backoff retry handler
   */
  private async handleJobFailure(job: EmailJob, errorMsg: string): Promise<void> {
    const newRetryCount = job.retry_count + 1;

    if (newRetryCount <= job.max_retries) {
      // Calculate exponential delay (e.g. 1s, 2s, 4s, etc.)
      const backoffDelayMs = Math.pow(2, newRetryCount) * 1000;
      const scheduledRetryAt = new Date(Date.now() + backoffDelayMs).toISOString();

      dbStore.updateJob(job.id, {
        status: 'scheduled', // temporary scheduled state for backoff retry
        retry_count: newRetryCount,
        scheduled_at: scheduledRetryAt,
        error_message: `Attempt ${newRetryCount} failed: ${errorMsg}. Retrying in ${backoffDelayMs / 1000}s...`
      });

      dbStore.addEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email_job_id: job.id,
        event_type: 'queued',
        recipient: job.to_emails[0],
        event_data: { attempt: newRetryCount, backoff_ms: backoffDelayMs, error: errorMsg, action: 're-queuing for retry' },
        created_at: new Date().toISOString()
      });
    } else {
      dbStore.updateJob(job.id, {
        status: 'failed',
        retry_count: newRetryCount,
        error_message: `Failed after max ${job.max_retries} attempts: ${errorMsg}`
      });

      dbStore.addEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email_job_id: job.id,
        event_type: 'failed',
        recipient: job.to_emails[0],
        event_data: { error: errorMsg },
        created_at: new Date().toISOString()
      });
    }
  }
}

export const queueManager = new QueueManager();
