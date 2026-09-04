// Seed Data Script for Email Service Platform (P0-T2)

export const seedData = {
  adminUser: {
    id: "a1000000-0000-0000-0000-000000000001",
    username: "admin_architect",
    email: "admin@email-service.com",
    passwordHash: "$2b$12$eX8m3X83Lq...hashed_password_dev",
    role: "superadmin",
    isActive: true,
    failedAttempts: 0,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z")
  },
  apiKeys: [
    {
      id: "b2000000-0000-0000-0000-000000000001",
      adminUserId: "a1000000-0000-0000-0000-000000000001",
      key: "esp_live_9f8a3b2c1d0e4f5a6b7c8d9e0f1a2b3c",
      name: "Production Billing Service API Key",
      permissions: ["email:send", "email:read", "template:read"],
      rateLimit: 1000,
      dailyLimit: 50000,
      isActive: true,
      createdAt: new Date("2026-09-01T00:00:00Z")
    },
    {
      id: "b2000000-0000-0000-0000-000000000002",
      adminUserId: "a1000000-0000-0000-0000-000000000001",
      key: "esp_test_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      name: "Staging Test Integration Key",
      permissions: ["email:send"],
      rateLimit: 100,
      dailyLimit: 1000,
      isActive: true,
      createdAt: new Date("2026-09-02T00:00:00Z")
    }
  ],
  providerConfigs: [
    {
      id: "c3000000-0000-0000-0000-000000000001",
      adminUserId: "a1000000-0000-0000-0000-000000000001",
      providerId: "smtp_aws_ses",
      name: "Amazon SES Primary SMTP",
      host: "email-smtp.us-east-1.amazonaws.com",
      port: 587,
      secure: true,
      username: "AKIAIOSFODNN7EXAMPLE",
      password: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      fromEmail: "noreply@email-service.com",
      fromName: "Email Service Platform",
      maxConnections: 50,
      rateLimitPerMinute: 3000,
      isPrimary: true,
      isActive: true,
      priority: 1,
      createdAt: new Date("2026-09-01T00:00:00Z"),
      updatedAt: new Date("2026-09-01T00:00:00Z")
    },
    {
      id: "c3000000-0000-0000-0000-000000000002",
      adminUserId: "a1000000-0000-0000-0000-000000000001",
      providerId: "smtp_resend_backup",
      name: "Resend Emergency Failover",
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      username: "resend",
      password: "re_1234567890abcdef",
      fromEmail: "backup@email-service.com",
      fromName: "Email Service Backup",
      maxConnections: 20,
      rateLimitPerMinute: 1000,
      isPrimary: false,
      isActive: true,
      priority: 2,
      createdAt: new Date("2026-09-01T00:00:00Z"),
      updatedAt: new Date("2026-09-01T00:00:00Z")
    }
  ],
  emailTemplates: [
    {
      id: "d4000000-0000-0000-0000-000000000001",
      adminUserId: "a1000000-0000-0000-0000-000000000001",
      name: "welcome_verification",
      description: "قالب ترحيب وتأكيد البريد الإلكتروني للعميل الجديد",
      scope: "global",
      appId: "auth_service",
      appName: "خدمة المصادقة والأمان",
      subject: "مرحباً بك في المنصة - رمز التأكيد الخاص بك هو {{otp_code}}",
      html: "<div style='font-family:sans-serif;'><h2>أهلاً {{user_name}}</h2><p>رمز التفعيل الخاص بك هو: <strong>{{otp_code}}</strong></p></div>",
      text: "أهلاً {{user_name}}، رمز التفعيل الخاص بك هو: {{otp_code}}",
      variables: [
        { name: "user_name", type: "string", required: true },
        { name: "otp_code", type: "string", required: true }
      ],
      category: "authentication",
      isActive: true,
      version: 1,
      createdAt: new Date("2026-09-01T00:00:00Z"),
      updatedAt: new Date("2026-09-01T00:00:00Z")
    }
  ]
};
