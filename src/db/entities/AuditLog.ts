import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { AdminUser } from './AdminUser';

@Entity('audit_logs')
@Index('idx_audit_admin_id', ['adminUserId'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_created_at', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_user_id', type: 'uuid', nullable: true })
  adminUserId?: string;

  @Column({ name: 'api_key_id', type: 'uuid', nullable: true })
  apiKeyId?: string;

  @Column({ length: 100 })
  action!: string;

  @Column({ name: 'resource_type', length: 100 })
  resourceType!: string;

  @Column({ name: 'resource_id', length: 100, nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relationships
  @ManyToOne(() => AdminUser, (admin) => admin.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser?: AdminUser;
}
