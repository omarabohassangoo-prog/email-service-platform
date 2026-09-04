/**
 * Interface definition for Redis Queue Management Service
 * Controls Bull Queue instances, worker concurrency, pause/resume state, and queue metrics.
 */

export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: { type: 'fixed' | 'exponential'; delay: number };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface IQueueService {
  /**
   * Adds a new payload to the specified email queue
   */
  addJob<T = any>(queueName: string, name: string, data: T, opts?: QueueJobOptions): Promise<{ id: string }>;

  /**
   * Returns current metric counters (waiting, active, completed, failed) for a queue
   */
  getQueueMetrics(queueName: string): Promise<QueueMetrics>;

  /**
   * Temporarily pauses queue processing
   */
  pauseQueue(queueName: string): Promise<void>;

  /**
   * Resumes queue processing
   */
  resumeQueue(queueName: string): Promise<void>;

  /**
   * Cleans completed or failed jobs from queue storage
   */
  cleanQueue(queueName: string, gracePeriodMs: number, status?: 'completed' | 'failed'): Promise<number>;
}
