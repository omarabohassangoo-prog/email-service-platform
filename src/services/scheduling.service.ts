import { ISchedulingService } from '../interfaces/scheduling.service.interface';
import { ScheduledTask } from '../types';
import { dbStore } from '../server/db';
import { emailQueue } from '../core/queue/emailQueue';

/**
 * Implementation of ISchedulingService
 * Manages one-shot and recurring email campaigns, calculates next run intervals,
 * and handles upcoming send warnings.
 */
export class SchedulingService implements ISchedulingService {
  private notifiedTasks = new Set<string>(); // Keep track of fired 24hr warnings to prevent duplication

  /**
   * Helper to calculate the next running timestamp for recurring configurations
   */
  public calculateNextRunAt(
    frequency: 'daily' | 'weekly' | 'monthly',
    scheduledTime: string, // "HH:MM"
    dayOfWeek?: number,
    dayOfMonth?: number,
    startingFrom = new Date()
  ): Date {
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const nextDate = new Date(startingFrom);
    nextDate.setHours(hours, minutes, 0, 0);

    if (frequency === 'daily') {
      if (nextDate.getTime() <= startingFrom.getTime()) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
    } else if (frequency === 'weekly') {
      const targetDay = dayOfWeek !== undefined ? dayOfWeek : 0;
      const currentDay = nextDate.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0 || (diff === 0 && nextDate.getTime() <= startingFrom.getTime())) {
        diff += 7;
      }
      nextDate.setDate(nextDate.getDate() + diff);
    } else if (frequency === 'monthly') {
      const targetDom = dayOfMonth !== undefined ? dayOfMonth : 1;
      nextDate.setDate(targetDom);
      if (nextDate.getTime() <= startingFrom.getTime()) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    }
    return nextDate;
  }

  /**
   * Schedules a one-shot email delivery at a specific ISO timestamp
   */
  async scheduleOneShotEmail(dto: {
    name: string;
    scheduledTime: string;
    fromEmail: string;
    toEmails: string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<ScheduledTask> {
    const nextRun = new Date(dto.scheduledTime);
    if (isNaN(nextRun.getTime())) {
      throw new Error('صيغة التاريخ غير صالحة لجدولة الإرسال (Invalid ISO datetime format)');
    }

    const newTask: ScheduledTask = {
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: dto.name,
      type: 'one_shot',
      scheduled_time: dto.scheduledTime,
      from_email: dto.fromEmail,
      to_emails: dto.toEmails,
      subject: dto.subject,
      html_content: dto.htmlContent,
      text_content: dto.textContent,
      template_id: dto.templateId,
      template_data: dto.templateData,
      is_active: true,
      next_run_at: nextRun.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbStore.addScheduledTask(newTask);
    dbStore.addAuditLog('schedule.created', {
      task_id: newTask.id,
      name: newTask.name,
      type: 'one_shot',
      next_run_at: newTask.next_run_at,
      message: `تم إنشاء مهمة جدولة لمرة واحدة: ${newTask.name} في ${newTask.next_run_at}`
    });

    return newTask;
  }

  /**
   * Schedules a recurring email campaign (daily, weekly, monthly)
   */
  async scheduleRecurringEmail(dto: {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    scheduledTime: string; // HH:MM
    dayOfWeek?: number;
    dayOfMonth?: number;
    fromEmail: string;
    toEmails: string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<ScheduledTask> {
    const nextRun = this.calculateNextRunAt(dto.frequency, dto.scheduledTime, dto.dayOfWeek, dto.dayOfMonth);

    const newTask: ScheduledTask = {
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: dto.name,
      type: 'recurring',
      frequency: dto.frequency,
      scheduled_time: dto.scheduledTime,
      day_of_week: dto.dayOfWeek,
      day_of_month: dto.dayOfMonth,
      from_email: dto.fromEmail,
      to_emails: dto.toEmails,
      subject: dto.subject,
      html_content: dto.htmlContent,
      text_content: dto.textContent,
      template_id: dto.templateId,
      template_data: dto.templateData,
      is_active: true,
      next_run_at: nextRun.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbStore.addScheduledTask(newTask);
    dbStore.addAuditLog('schedule.created', {
      task_id: newTask.id,
      name: newTask.name,
      type: 'recurring',
      frequency: newTask.frequency,
      next_run_at: newTask.next_run_at,
      message: `تم جدولة حملة دورية متكررة (${dto.frequency}) باسم: ${newTask.name}`
    });

    return newTask;
  }

  /**
   * Lists all currently registered scheduled tasks
   */
  async listScheduledTasks(): Promise<ScheduledTask[]> {
    return dbStore.getScheduledTasks();
  }

  /**
   * Retrieves detail of a single scheduled task
   */
  async getScheduledTask(id: string): Promise<ScheduledTask> {
    const task = dbStore.getScheduledTasks().find(t => t.id === id);
    if (!task) {
      throw new Error(`مهمة الجدولة ذات الرمز "${id}" غير موجودة`);
    }
    return task;
  }

  /**
   * Updates an existing scheduled task (e.g., updates body, rescheduling)
   */
  async updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const existing = await this.getScheduledTask(id);
    
    const fieldsToUpdate: Partial<ScheduledTask> = { ...updates };
    
    // Recalculate next run if scheduling rules are adjusted
    if (updates.scheduled_time || updates.frequency || updates.day_of_week || updates.day_of_month) {
      const freq = updates.frequency || existing.frequency;
      const schedTime = updates.scheduled_time || existing.scheduled_time;
      const dow = updates.day_of_week !== undefined ? updates.day_of_week : existing.day_of_week;
      const dom = updates.day_of_month !== undefined ? updates.day_of_month : existing.day_of_month;

      if (existing.type === 'recurring' && freq) {
        const nextDate = this.calculateNextRunAt(freq, schedTime, dow, dom);
        fieldsToUpdate.next_run_at = nextDate.toISOString();
      } else if (existing.type === 'one_shot') {
        const nextDate = new Date(schedTime);
        if (!isNaN(nextDate.getTime())) {
          fieldsToUpdate.next_run_at = nextDate.toISOString();
        }
      }
    }

    const updated = dbStore.updateScheduledTask(id, fieldsToUpdate);
    if (!updated) {
      throw new Error('فشل تحديث سجل الجدولة في الذاكرة');
    }

    dbStore.addAuditLog('schedule.updated', {
      task_id: id,
      name: updated.name,
      message: `تم تحديث خيارات جدولة المهمة: ${updated.name}`
    });

    return updated;
  }

  /**
   * Cancels/deletes a scheduled task campaign or queue entry
   */
  async cancelScheduledTask(id: string): Promise<boolean> {
    const task = dbStore.getScheduledTasks().find(t => t.id === id);
    const success = dbStore.deleteScheduledTask(id);
    if (success && task) {
      dbStore.addAuditLog('schedule.cancelled', {
        task_id: id,
        name: task.name,
        message: `تم إلغاء وحذف مهمة جدولة الإرسال: ${task.name}`
      });
      this.notifiedTasks.delete(id);
    }
    return success;
  }

  /**
   * Processes current scheduling clocks to trigger tasks and fire 24-hour alerts
   */
  async processSchedules(): Promise<void> {
    const now = new Date();
    const tasks = dbStore.getScheduledTasks().filter(t => t.is_active);

    for (const t of tasks) {
      const nextRunTime = new Date(t.next_run_at).getTime();
      const diffMs = nextRunTime - now.getTime();

      // 1. Fire Scheduled Alert 24 hours before sending (24 hours = 86400000 ms)
      // Trigger warning between 23 and 24 hours before delivery
      if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000 && !this.notifiedTasks.has(t.id)) {
        this.notifiedTasks.add(t.id);
        dbStore.addAuditLog('schedule.upcoming_warning', {
          task_id: t.id,
          name: t.name,
          next_run_at: t.next_run_at,
          message: `تنبيه مسبق: سيتم تشغيل وإرسال البريد المجدول "${t.name}" خلال أقل من 24 ساعة (${new Date(t.next_run_at).toLocaleString('ar-EG')})`
        });
      }

      // 2. Trigger task dispatch if due
      if (now.getTime() >= nextRunTime) {
        console.log(`[SchedulingService] Dispatching scheduled task "${t.name}" (${t.id})`);

        // Add Job to delivery queue (simulated Bull queue)
        await emailQueue.addToQueue({
          api_key_id: 'scheduled_runner',
          job_id: `sch-job-${t.id}-${Date.now().toString().slice(-4)}`,
          from_email: t.from_email,
          to_emails: t.to_emails,
          subject: t.subject,
          html_content: t.html_content || '',
          text_content: t.text_content || '',
          template_id: t.template_id,
          template_data: t.template_data,
          priority: 'normal'
        });

        // Manage state depending on schedule type
        if (t.type === 'one_shot') {
          dbStore.updateScheduledTask(t.id, {
            is_active: false,
            last_run_at: now.toISOString(),
            next_run_at: new Date(0).toISOString() // Sent
          });

          dbStore.addAuditLog('schedule.dispatched_oneshot', {
            task_id: t.id,
            name: t.name,
            message: `تم تنفيذ وإرسال البريد المجدول لمرة واحدة بنجاح: ${t.name}`
          });
        } else {
          // Recurring task - calculate and write the next run date
          if (t.frequency) {
            const nextDate = this.calculateNextRunAt(t.frequency, t.scheduled_time, t.day_of_week, t.day_of_month, now);
            dbStore.updateScheduledTask(t.id, {
              last_run_at: now.toISOString(),
              next_run_at: nextDate.toISOString()
            });

            dbStore.addAuditLog('schedule.dispatched_recurring', {
              task_id: t.id,
              name: t.name,
              next_run_at: nextDate.toISOString(),
              message: `تم إرسال الحملة الدورية المجدولة "${t.name}". موعد الإرسال القادم: ${nextDate.toISOString()}`
            });

            // Reset 24-hour warning for next cycle
            this.notifiedTasks.delete(t.id);
          }
        }
      }
    }
  }
}
