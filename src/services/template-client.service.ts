import { apiClient } from './apiClient';
import { EmailTemplate } from '../types';

export const templateClientService = {
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get('/v1/templates');
    return response.data.templates || [];
  },
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.get(`/v1/templates/${id}`);
    return response.data.template;
  },
  createTemplate: async (data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const response = await apiClient.post('/v1/templates', data);
    return response.data.template;
  },
  updateTemplate: async (id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const response = await apiClient.put(`/v1/templates/${id}`, data);
    return response.data.template;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/templates/${id}`);
  },
  duplicateTemplate: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.post(`/v1/templates/${id}/duplicate`);
    return response.data.template;
  },
  previewTemplate: async (id: string, data: Record<string, any>) => {
    const response = await apiClient.post(`/v1/templates/${id}/preview`, { data });
    return response.data;
  },
  testTemplate: async (id: string, to: string, data: Record<string, any>) => {
    const response = await apiClient.post(`/v1/templates/${id}/test`, { to, data });
    return response.data;
  },
  extractVariables: (content: string): string[] => {
    const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }
};
