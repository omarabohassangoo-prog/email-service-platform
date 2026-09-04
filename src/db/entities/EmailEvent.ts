import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { EmailJob } from './EmailJob';

@Entity('email_events')
@Index('idx_email_events_job_id', ['emailJobId'])
@Index('idx_email_events_type', ['eventType'])
export class EmailEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'email_job_id', type: 'uuid' })
  emailJobId!: string;

  @Column({ name: 'event_type', length: 50 })
  eventType!: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complaint' | 'failed';

  @Column({ name: 'event_data', type: 'jsonb', nullable: true })
  eventData?: Record<string, any>;

  @Column({ length: 255, nullable: true })
  recipient?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relationships
  @ManyToOne(() => EmailJob, (job) => job.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'email_job_id' })
  emailJob!: EmailJob;
}
