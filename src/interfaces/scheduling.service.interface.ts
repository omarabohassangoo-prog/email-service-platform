import { ScheduledTask } from '../types';

export interface ISchedulingService {
  /**
   * Schedules a one-shot email delivery at a specific ISO timestamp
   */
  scheduleOneShotEmail(dto: {
    name: string;
    scheduledTime: string;
    fromEmail: string;
    toEmails: string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<ScheduledTask>;

  /**
   * Schedules a recurring email campaign (daily, weekly, monthly)
   */
  scheduleRecurringEmail(dto: {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    scheduledTime: string; // HH:MM
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
    fromEmail: string;
    toEmails: string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<ScheduledTask>;

  /**
   * Lists all currently registered scheduled tasks
   */
  listScheduledTasks(): Promise<ScheduledTask[]>;

  /**
   * Retrieves detail of a single scheduled task
   */
  getScheduledTask(id: string): Promise<ScheduledTask>;

  /**
   * Updates an existing scheduled task (e.g., updates body, rescheduling)
   */
  updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask>;

  /**
   * Cancels/deletes a scheduled task campaign or queue entry
   */
  cancelScheduledTask(id: string): Promise<boolean>;

  /**
   * Processes current scheduling clocks to trigger tasks and fire 24-hour alerts
   */
  processSchedules(): Promise<void>;
}
