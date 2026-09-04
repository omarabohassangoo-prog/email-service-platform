import { apiClient } from './apiClient';

export interface SdkTestPayload {
  action: 'send' | 'status' | 'template';
  apiKey: string;
  params: {
    to?: string;
    subject?: string;
    html?: string;
    priority?: string;
    job_id?: string;
    template_id?: string;
    data?: Record<string, any>;
  };
}

export const sdkService = {
  executeTest: async (payload: SdkTestPayload) => {
    const startTime = performance.now();
    try {
      const response = await apiClient.post('/v1/sdk/test', payload, {
        headers: {
          'X-API-Key': payload.apiKey
        }
      });
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

      return {
        success: true,
        status: response.status,
        data: response.data,
        responseTimeMs,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      return {
        success: false,
        status: err.response?.status || 500,
        data: err.response?.data || { error: err.message },
        responseTimeMs,
        timestamp: new Date().toISOString()
      };
    }
  }
};
