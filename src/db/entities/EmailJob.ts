import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index 
} from 'typeorm';
import { ApiKey } from './ApiKey';
import { EmailTemplate } from './EmailTemplate';
import { EmailEvent } from './EmailEvent';

@Entity('email_jobs')
@Index('idx_email_jobs_job_id', ['jobId'])
@Index('idx_email_jobs_status', ['status'])
@Index('idx_email_jobs_created_at', ['createdAt'])
export class EmailJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'api_key_id', type: 'uuid', nullable: true })
  apiKeyId?: string;

  @Column({ name: 'job_id', unique: true, length: 100 })
  jobId!: string;

  @Column({ name: 'provider_id', length: 100, nullable: true })
  providerId?: string;

  @Column({ name: 'from_email', length: 255 })
  fromEmail!: string;

  @Column({ name: 'to_emails', type: 'jsonb' })
  toEmails!: string[];

  @Column({ length: 255 })
  subject!: string;

  @Column({ name: 'html_content', type: 'text', nullable: true })
  htmlContent?: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{ filename: string; size: number; url: string }>;

  @Column({ default: 'normal', length: 20 })
  priority!: 'low' | 'normal' | 'high' | 'urgent';

  @Column({ default: 'queued', length: 20 })
  status!: 'queued' | 'processing' | 'sent' | 'failed' | 'retrying';

  @Column({ name: 'message_id', length: 255, nullable: true })
  messageId?: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount!: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries!: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ApiKey, (apiKey) => apiKey.emailJobs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKey;

  @ManyToOne(() => EmailTemplate, (template) => template.emailJobs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template?: EmailTemplate;

  @OneToMany(() => EmailEvent, (event) => event.emailJob)
  events!: EmailEvent[];
}
