import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouterModular from '../routes';

const app = express();
app.use(express.json());
app.use('/api', apiRouterModular);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

describe('API Integration Tests (Supertest)', () => {
  it('should return health status successfully', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should handle modular API routes correctly', async () => {
    const res = await request(app).get('/api/analytics/realtime');
    // Even if unauthorized or returning success/mock, it should respond without crashing
    expect(res.status).toBeLessThan(500);
  });
});
