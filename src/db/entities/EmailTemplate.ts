import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index 
} from 'typeorm';
import { AdminUser } from './AdminUser';
import { EmailJob } from './EmailJob';

@Entity('email_templates')
@Index('idx_template_name', ['name'])
@Index('idx_template_category', ['category'])
@Index('idx_template_app_id', ['appId'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_user_id', type: 'uuid', nullable: true })
  adminUserId?: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'app', length: 20 })
  scope!: 'app' | 'system' | 'global';

  @Column({ name: 'app_id', length: 100, default: 'default_app' })
  appId!: string;

  @Column({ name: 'app_name', length: 150, default: 'Email Service Platform' })
  appName!: string;

  @Column({ name: 'app_logo', type: 'text', nullable: true })
  appLogo?: string;

  @Column({ name: 'app_url', type: 'text', nullable: true })
  appUrl?: string;

  @Column({ name: 'subject', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  html!: string;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @Column({ type: 'jsonb', default: [] })
  variables!: Array<{ name: string; type: string; required: boolean }>;

  @Column({ length: 50, default: 'general' })
  category!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => AdminUser, (admin) => admin.templates, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser?: AdminUser;

  @OneToMany(() => EmailJob, (job) => job.template)
  emailJobs!: EmailJob[];
}
