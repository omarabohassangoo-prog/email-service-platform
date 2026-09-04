// Bull Queue Configuration with Redis for Email Service Platform (P0-T3)

import { defaultRedisConfig } from '../config/redis';

export interface QueueJobData {
  jobId: string;
  fromEmail: string;
  toEmails: string[];
  subject: string;
  htmlContent?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  retryCount?: number;
}

export const emailQueueOptions = {
  redis: defaultRedisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5 seconds initial delay
    },
    removeOnComplete: 1000, // Keep last 1000 completed jobs in Redis
    removeOnFail: 5000 // Keep last 5000 failed jobs for diagnostics
  },
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 30000,
    maxStalledCount: 2
  }
};

export class MockBullQueue {
  public name: string;
  public status: 'connected' | 'connecting' | 'paused' = 'connected';
  private jobs: Map<string, { data: QueueJobData; opts: any; status: string; progress: number }> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  async add(data: QueueJobData, opts?: any) {
    const id = data.jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job = { data: { ...data, jobId: id }, opts, status: 'waiting', progress: 0 };
    this.jobs.set(id, job);
    return { id, data: job.data };
  }

  async getJobCounts() {
    let waiting = 0, active = 0, completed = 0, failed = 0, delayed = 0;
    for (const job of this.jobs.values()) {
      if (job.status === 'waiting') waiting++;
      else if (job.status === 'active') active++;
      else if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
      else if (job.status === 'delayed') delayed++;
    }
    return { waiting, active, completed, failed, delayed };
  }

  async clean(grace: number, status: string) {
    let count = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === status) {
        this.jobs.delete(id);
        count++;
      }
    }
    return count;
  }
}

export const emailQueue = new MockBullQueue('email_dispatch_queue');
