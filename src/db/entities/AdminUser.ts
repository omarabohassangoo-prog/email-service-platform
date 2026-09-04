import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index 
} from 'typeorm';
import { ApiKey } from './ApiKey';
import { EmailTemplate } from './EmailTemplate';
import { ProviderConfig } from './ProviderConfig';
import { AuditLog } from './AuditLog';

@Entity('admin_users')
@Index('idx_admin_username', ['username'])
@Index('idx_admin_email', ['email'])
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  username!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ default: 'admin', length: 50 })
  role!: 'superadmin' | 'admin' | 'operator' | 'viewer';

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'failed_attempts', default: 0 })
  failedAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => ApiKey, (apiKey) => apiKey.adminUser)
  apiKeys!: ApiKey[];

  @OneToMany(() => EmailTemplate, (template) => template.adminUser)
  templates!: EmailTemplate[];

  @OneToMany(() => ProviderConfig, (provider) => provider.adminUser)
  providerConfigs!: ProviderConfig[];

  @OneToMany(() => AuditLog, (log) => log.adminUser)
  auditLogs!: AuditLog[];
}
