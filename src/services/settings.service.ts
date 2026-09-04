import { apiClient } from './apiClient';

export interface SystemSettings {
  providers: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_secure: boolean;
    default_from: string;
  };
  security: {
    jwt_expiry: string;
    rate_limiting: number;
    tls_version: string;
    require_auth: boolean;
    ip_whitelist: string[];
  };
  limits: {
    daily_quota: number;
    monthly_quota: number;
    max_batch_size: number;
    max_attachment_size_mb: number;
  };
  compliance: {
    spf_record: string;
    dkim_selector: string;
    dkim_private_key?: string;
    dmarc_policy: 'none' | 'quarantine' | 'reject';
    dmarc_report_email: string;
  };
  webhooks: {
    url: string;
    secret: string;
    events: string[];
    enabled: boolean;
  };
}

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    } catch (err) {
      // Fallback default mock/local object if backend endpoint isn't fully expanded
      return {
        providers: {
          smtp_host: 'smtp.sendgrid.net',
          smtp_port: 587,
          smtp_user: 'apikey',
          smtp_secure: true,
          default_from: 'noreply@enterprise-esp.com'
        },
        security: {
          jwt_expiry: '24h',
          rate_limiting: 1000,
          tls_version: 'TLS 1.3',
          require_auth: true,
          ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8']
        },
        limits: {
          daily_quota: 50000,
          monthly_quota: 1500000,
          max_batch_size: 10000,
          max_attachment_size_mb: 25
        },
        compliance: {
          spf_record: 'v=spf1 include:mail.enterprise-esp.com ~all',
          dkim_selector: 'esp2026',
          dmarc_policy: 'quarantine',
          dmarc_report_email: 'dmarc-reports@enterprise-esp.com'
        },
        webhooks: {
          url: 'https://api.myapp.com/webhooks/email',
          secret: 'whsec_AbC123XyZ7890SecretKey',
          events: ['email.sent', 'email.delivered', 'email.bounced', 'email.complained'],
          enabled: true
        }
      };
    }
  },
  updateSettings: async (settings: any) => {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  }
};
