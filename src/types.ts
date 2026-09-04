export type JobPriority = 'high' | 'normal' | 'low' | 'urgent' | 'bulk';
export type JobStatus = 'queued' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'retrying';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'operator';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface ApiKeyPermissions {
  send_email: boolean;
  bulk_email: boolean;
  manage_templates: boolean;
  view_analytics: boolean;
}

export interface ApiKey {
  id: string;
  admin_user_id: string;
  key: string;
  name: string;
  permissions: ApiKeyPermissions;
  rate_limit: number; // req per minute
  daily_limit: number; // emails per day
  daily_used: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used?: string;
}

export interface EmailJob {
  id: string;
  api_key_id?: string;
  job_id: string;
  provider_id?: string;
  from_email: string;
  to_emails: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html_content?: string;
  text_content?: string;
  template_id?: string;
  template_data?: Record<string, any>;
  attachments?: Array<{ filename: string; contentType?: string; size: number; url?: string }>;
  priority: JobPriority;
  status: JobStatus;
  message_id?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  latency_ms?: number;
}

export interface EmailTemplate {
  id: string;
  admin_user_id: string;
  name: string;
  description?: string;
  scope?: 'global' | 'app';
  app_id?: string;
  app_name?: string;
  app_logo?: string;
  app_url?: string;
  app_visit_url?: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'security' | 'onboarding' | 'welcome' | 'notification' | 'system';
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  email_job_id: string;
  event_type: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  event_data?: Record<string, any>;
  recipient?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ProviderConfig {
  id: string;
  provider_id: string;
  name: string;
  type: 'smtp' | 'aws_ses' | 'sendgrid' | 'mailgun' | 'postmark';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  from_email: string;
  from_name?: string;
  max_connections: number;
  rate_limit_per_minute: number;
  is_primary: boolean;
  is_active: boolean;
  priority: number;
  latency_ms: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id?: string;
  api_key_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  throughput_per_sec: number;
  active_workers: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  checks: {
    postgres: { status: string; latency_ms: number };
    redis_queue: { status: string; pending_jobs: number };
    providers: { active_count: number; total: number };
    api_gateway: { status: string; uptime_sec: number };
    system_memory: { used_mb: number; free_mb: number; total_mb: number };
    cpu_usage_pct: number;
  };
  timestamp: string;
  uptime: number;
}

export interface AnalyticsStats {
  emails: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
  };
  queue: QueueMetrics;
  providers: ProviderConfig[];
  hourly_timeline: Array<{
    time: string;
    sent: number;
    delivered: number;
    failed: number;
    latency: number;
  }>;
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'one_shot' | 'recurring';
  frequency?: 'daily' | 'weekly' | 'monthly';
  scheduled_time: string; // ISO timestamp or HH:MM
  day_of_week?: number; // 0-6 for weekly recurring
  day_of_month?: number; // 1-31 for monthly recurring
  from_email: string;
  to_emails: string[];
  subject: string;
  html_content?: string;
  text_content?: string;
  template_id?: string;
  template_data?: Record<string, any>;
  is_active: boolean;
  last_run_at?: string;
  next_run_at: string;
  created_at: string;
  updated_at: string;
}

