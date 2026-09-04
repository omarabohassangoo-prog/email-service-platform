import { EmailJob, JobPriority, JobStatus } from '../types';
import { emailQueue as coreEmailQueue } from '../core/queue/emailQueue';
import { queueManager as coreQueueManager } from '../core/queue/queueManager';

/**
 * Legacy/Proxy wrapper around the high-stature core/queue modules.
 * Ensures backward compatibility across backend routes and services.
 */
class EmailQueueManager {
  public startWorkers() {
    coreQueueManager.startWorkers();
  }

  public stopWorkers() {
    coreQueueManager.stopWorkers();
  }

  public pauseQueue() {
    coreQueueManager.pauseQueue();
  }

  public resumeQueue() {
    coreQueueManager.resumeQueue();
  }

  public isQueuePaused() {
    return coreQueueManager.isQueuePaused();
  }

  public async enqueue(
    jobData: Omit<EmailJob, 'id' | 'status' | 'retry_count' | 'created_at' | 'updated_at' | 'max_retries'> & { max_retries?: number }
  ): Promise<EmailJob> {
    return coreEmailQueue.addToQueue(jobData, {
      attempts: jobData.max_retries
    });
  }
}

export const emailQueue = new EmailQueueManager();
export { coreEmailQueue, coreQueueManager };
