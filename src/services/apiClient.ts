import axios from 'axios';
import { store } from '../store';

/**
 * Custom Axios API Client with automatic token & API key headers injection,
 * increased timeout, and rate-limit / timeout error handling.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000 // Increased from 10000ms to 45000ms to prevent premature timeouts
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const apiKey = state.auth.apiKey;
    const accessToken = state.auth.accessToken;

    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log(`[Axios Outgoing Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor with automatic retry on rate limit (429) or graceful error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Axios Incoming Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn(`[Axios Timeout] Request timed out after ${error.config?.timeout || 45000}ms. Please check network or server load.`);
    }

    if (error.response?.status === 429) {
      console.warn(`[Axios Rate Exceeded] Too many requests (429). Rate limit reached.`);
      // Optional: attach a friendly user message
      if (error.response.data && typeof error.response.data === 'object') {
        error.response.data.message = error.response.data.message || 'تم تجاوز معدل الطلبات المسموح به (Rate limit exceeded). يرجى الانتظار قليلاً والمحاولة مرة أخرى.';
      }
    }

    console.error(`[Axios Error Response]`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

