import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1000 }, // Load test: ramp up to 1000 concurrent users
    { duration: '1m', target: 5000 },  // Stress test: ramp up to 5000 concurrent users
    { duration: '30s', target: 10000 }, // Spike test: ramp up to 10000 concurrent users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests must complete below 100ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test health check endpoint
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'health status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Test analytics realtime endpoint
  const resAnalytics = http.get(`${BASE_URL}/api/analytics/realtime`, {
    headers: { 'X-API-Key': 'esp_live_test_key_sample' },
  });
  check(resAnalytics, {
    'analytics status < 500': (r) => r.status < 500,
  });

  sleep(1);
}
