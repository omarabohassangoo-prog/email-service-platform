import { Router, Request, Response } from 'express';
import { authenticateApiKey } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/sdk/test
 * @desc Test endpoint for SDK client connection & signature verification
 */
router.post('/test', authenticateApiKey, async (req: Request, res: Response, next) => {
  try {
    const { action, payload } = req.body;
    res.json({
      success: true,
      sdkVersion: '1.0.0-beta',
      action: action || 'ping',
      receivedPayload: payload || {},
      serverTime: new Date().toISOString(),
      clientVerified: true
    });
  } catch (err) {
    next(err);
  }
});

export default router;
