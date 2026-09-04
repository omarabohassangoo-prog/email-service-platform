import { apiClient } from './apiClient';

export interface SendEmailPayload {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  template?: string;
  template_data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: Array<{ filename: string; content: string; contentType: string; size: number }>;
}

export const emailClientService = {
  sendEmail: async (payload: SendEmailPayload) => {
    const response = await apiClient.post('/v1/email/send', payload);
    return response.data;
  },
  getProviders: async () => {
    const response = await apiClient.get('/v1/providers');
    return response.data;
  },
  getTemplates: async () => {
    const response = await apiClient.get('/v1/templates');
    return response.data;
  }
};
