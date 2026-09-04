// TypeORM Entity Definitions for Email Service Platform (P0-T2 & P1-T1)

export * from './entities/index';

export interface AdminUserEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'operator' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyEntity {
  id: string;
  adminUserId: string;
  key: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  dailyLimit: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

export interface EmailJobEntity {
  id: string;
  apiKeyId?: string;
  jobId: string;
  providerId?: string;
  fromEmail: string;
  toEmails: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{ filename: string; size: number; url: string }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'retrying';
  messageId?: string;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateEntity {
  id: string;
  adminUserId?: string;
  name: string;
  description?: string;
  scope: 'app' | 'system' | 'global';
  appId: string;
  appName: string;
  appLogo?: string;
  appUrl?: string;
  appVisitUrl?: string;
  subject: string;
  html: string;
  text?: string;
  variables: Array<{ name: string; type: string; required: boolean }>;
  category: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailEventEntity {
  id: string;
  emailJobId: string;
  eventType: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complaint' | 'failed';
  eventData?: Record<string, any>;
  recipient?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ProviderConfigEntity {
  id: string;
  adminUserId?: string;
  providerId: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
  maxConnections: number;
  rateLimitPerMinute: number;
  isPrimary: boolean;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntity {
  id: string;
  adminUserId?: string;
  apiKeyId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
