import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { AdminUser } from './AdminUser';

@Entity('provider_configs')
@Index('idx_provider_id', ['providerId'])
@Index('idx_provider_is_active', ['isActive'])
export class ProviderConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_user_id', type: 'uuid', nullable: true })
  adminUserId?: string;

  @Column({ name: 'provider_id', unique: true, length: 100 })
  providerId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255 })
  host!: string;

  @Column({ default: 587 })
  port!: number;

  @Column({ default: true })
  secure!: boolean;

  @Column({ length: 255, nullable: true })
  username?: string;

  @Column({ length: 255, nullable: true })
  password?: string;

  @Column({ name: 'from_email', length: 255 })
  fromEmail!: string;

  @Column({ name: 'from_name', length: 150, nullable: true })
  fromName?: string;

  @Column({ name: 'max_connections', default: 10 })
  maxConnections!: number;

  @Column({ name: 'rate_limit_per_minute', default: 500 })
  rateLimitPerMinute!: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: 1 })
  priority!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => AdminUser, (admin) => admin.providerConfigs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser?: AdminUser;
}
