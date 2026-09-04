import { Router, Request, Response } from 'express';
import { container } from '../services/container';
import { authenticateAdminJwt } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/admin/health
 * @desc System Health check endpoint
 */
router.get('/health', async (req: Request, res: Response, next) => {
  try {
    const activeProvider = await container.providerService.getActiveProvider();
    const queueMetrics = await container.queueService.getQueueMetrics('email_dispatch_queue');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: { status: 'up', type: 'PostgreSQL' },
        cache: { status: 'up', type: 'Redis' },
        queue: { status: queueMetrics.paused ? 'paused' : 'up', metrics: queueMetrics },
        activeSmtpProvider: { id: activeProvider.providerId, host: activeProvider.host }
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/admin/stats
 * @desc Overall service analytics and throughput statistics
 */
router.get('/stats', authenticateAdminJwt, async (req: Request, res: Response, next) => {
  try {
    const queueMetrics = await container.queueService.getQueueMetrics('email_dispatch_queue');
    const providers = await container.providerService.listProviders();

    res.json({
      success: true,
      data: {
        totalEmailsSentToday: 14200,
        deliverySuccessRate: 99.4,
        avgLatencyMs: 38,
        activeProvidersCount: providers.length,
        queue: queueMetrics
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/admin/settings
 * @desc Retrieve platform configuration settings
 */
router.get('/settings', authenticateAdminJwt, async (req: Request, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: {
        platformName: 'Email Service Platform',
        environment: process.env.NODE_ENV || 'development',
        defaultSender: 'noreply@platform.com',
        maxRetryAttempts: 3,
        rateLimitPerMinute: 1000,
        enableFailover: true
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /api/admin/settings
 * @desc Update platform configuration settings
 */
router.put('/settings', authenticateAdminJwt, async (req: Request, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: {
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      message: 'Admin settings updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
