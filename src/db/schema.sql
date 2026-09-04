-- Migration: 001_initial_schema.sql
-- Description: Create 7 core tables with UUIDs, Foreign Keys, JSONB fields, and Performance Indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: admin_users
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username" VARCHAR(100) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) DEFAULT 'admin',
  "is_active" BOOLEAN DEFAULT true,
  "last_login" TIMESTAMP,
  "failed_attempts" INTEGER DEFAULT 0,
  "locked_until" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_admin_users_username" ON "admin_users" ("username");
CREATE INDEX IF NOT EXISTS "idx_admin_users_email" ON "admin_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_admin_users_role" ON "admin_users" ("role");

-- 2. Table: api_keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "key" VARCHAR(64) NOT NULL UNIQUE,
  "name" VARCHAR(100) NOT NULL,
  "permissions" JSONB DEFAULT '["email:send", "email:read"]'::jsonb,
  "rate_limit" INTEGER DEFAULT 1000,
  "daily_limit" INTEGER DEFAULT 10000,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "expires_at" TIMESTAMP,
  "last_used" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_api_keys_key" ON "api_keys" ("key");
CREATE INDEX IF NOT EXISTS "idx_api_keys_admin_user_id" ON "api_keys" ("admin_user_id");

-- 3. Table: email_templates
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(255),
  "scope" VARCHAR(20) DEFAULT 'app',
  "app_id" VARCHAR(100) DEFAULT 'default_app',
  "app_name" VARCHAR(100) DEFAULT 'Email Service Platform',
  "app_logo" VARCHAR(255),
  "app_url" VARCHAR(255),
  "app_visit_url" VARCHAR(255),
  "subject" VARCHAR(255) NOT NULL,
  "html" TEXT NOT NULL,
  "text" TEXT,
  "variables" JSONB DEFAULT '[]'::jsonb,
  "category" VARCHAR(50) DEFAULT 'transactional',
  "is_active" BOOLEAN DEFAULT true,
  "version" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_templates_name" ON "email_templates" ("name");
CREATE INDEX IF NOT EXISTS "idx_email_templates_category" ON "email_templates" ("category");
CREATE INDEX IF NOT EXISTS "idx_email_templates_app_id" ON "email_templates" ("app_id");
CREATE INDEX IF NOT EXISTS "idx_email_templates_scope" ON "email_templates" ("scope");

-- 4. Table: email_jobs
CREATE TABLE IF NOT EXISTS "email_jobs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "api_key_id" UUID REFERENCES "api_keys"("id") ON DELETE SET NULL,
  "job_id" VARCHAR(64) NOT NULL UNIQUE,
  "provider_id" VARCHAR(50),
  "from_email" VARCHAR(255) NOT NULL,
  "to_emails" JSONB NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "html_content" TEXT,
  "text_content" TEXT,
  "template_id" UUID REFERENCES "email_templates"("id") ON DELETE SET NULL,
  "template_data" JSONB,
  "attachments" JSONB DEFAULT '[]'::jsonb,
  "priority" VARCHAR(20) DEFAULT 'normal',
  "status" VARCHAR(50) DEFAULT 'queued',
  "message_id" VARCHAR(255),
  "retry_count" INTEGER DEFAULT 0,
  "max_retries" INTEGER DEFAULT 3,
  "error_message" TEXT,
  "scheduled_at" TIMESTAMP,
  "sent_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_jobs_job_id" ON "email_jobs" ("job_id");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_status" ON "email_jobs" ("status");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_api_key_id" ON "email_jobs" ("api_key_id");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_created_at" ON "email_jobs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_email_jobs_priority" ON "email_jobs" ("priority");

-- 5. Table: email_events
CREATE TABLE IF NOT EXISTS "email_events" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email_job_id" UUID NOT NULL REFERENCES "email_jobs"("id") ON DELETE CASCADE,
  "event_type" VARCHAR(50) NOT NULL,
  "event_data" JSONB,
  "recipient" VARCHAR(255),
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_email_events_email_job_id" ON "email_events" ("email_job_id");
CREATE INDEX IF NOT EXISTS "idx_email_events_event_type" ON "email_events" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_email_events_created_at" ON "email_events" ("created_at");

-- 6. Table: provider_configs
CREATE TABLE IF NOT EXISTS "provider_configs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "provider_id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "host" VARCHAR(255) NOT NULL,
  "port" INTEGER NOT NULL,
  "secure" BOOLEAN DEFAULT true,
  "username" VARCHAR(255),
  "password" VARCHAR(255),
  "from_email" VARCHAR(255) NOT NULL,
  "from_name" VARCHAR(100),
  "max_connections" INTEGER DEFAULT 10,
  "rate_limit_per_minute" INTEGER DEFAULT 500,
  "is_primary" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "priority" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_provider_configs_provider_id" ON "provider_configs" ("provider_id");
CREATE INDEX IF NOT EXISTS "idx_provider_configs_is_primary" ON "provider_configs" ("is_primary");
CREATE INDEX IF NOT EXISTS "idx_provider_configs_is_active" ON "provider_configs" ("is_active");

-- 7. Table: audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "admin_user_id" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "api_key_id" UUID REFERENCES "api_keys"("id") ON DELETE SET NULL,
  "action" VARCHAR(100) NOT NULL,
  "resource_type" VARCHAR(50) NOT NULL,
  "resource_id" UUID,
  "details" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_audit_logs_admin_user_id" ON "audit_logs" ("admin_user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_api_key_id" ON "audit_logs" ("api_key_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");
