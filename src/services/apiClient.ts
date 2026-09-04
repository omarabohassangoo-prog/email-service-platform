import axios from 'axios';
import { store } from '../store';

/**
 * Custom Axios API Client with automatic token & API key headers injection
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
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

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Axios Incoming Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[Axios Error Response]`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);
