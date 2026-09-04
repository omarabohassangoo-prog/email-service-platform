import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index 
} from 'typeorm';
import { AdminUser } from './AdminUser';
import { EmailJob } from './EmailJob';

@Entity('api_keys')
@Index('idx_apikey_key', ['key'])
@Index('idx_apikey_admin_id', ['adminUserId'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_user_id', type: 'uuid' })
  adminUserId!: string;

  @Column({ unique: true, length: 255 })
  key!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'jsonb', default: [] })
  permissions!: string[];

  @Column({ name: 'rate_limit', default: 100 })
  rateLimit!: number;

  @Column({ name: 'daily_limit', default: 10000 })
  dailyLimit!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'last_used', type: 'timestamp', nullable: true })
  lastUsed?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relationships
  @ManyToOne(() => AdminUser, (admin) => admin.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser!: AdminUser;

  @OneToMany(() => EmailJob, (job) => job.apiKey)
  emailJobs!: EmailJob[];
}
