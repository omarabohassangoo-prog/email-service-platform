import { apiClient } from './apiClient';
import { AnalyticsStats, SystemHealth, EmailJob } from '../types';

export const dashboardService = {
  getStats: async (): Promise<AnalyticsStats> => {
    const response = await apiClient.get('/v1/admin/stats');
    return response.data;
  },
  getHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get('/v1/admin/health');
    return response.data;
  },
  getRecentJobs: async (): Promise<EmailJob[]> => {
    const response = await apiClient.get('/v1/admin/jobs');
    return response.data.jobs || [];
  }
};
