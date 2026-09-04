import { Router, Request, Response } from 'express';
import { container } from '../services/container';
import { validateBodyFields } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Admin user authentication
 */
router.post('/login', validateBodyFields(['username', 'password']), async (req: Request, res: Response, next) => {
  try {
    const { username, password } = req.body;
    const tokens = await container.authService.login({ username, password });
    res.json({
      success: true,
      data: tokens,
      message: 'Authentication successful'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT access token
 */
router.post('/refresh', validateBodyFields(['refreshToken']), async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshToken.includes('esp_jwt_refresh_')) {
      res.status(400).json({ success: false, error: 'Invalid or expired refresh token' });
      return;
    }

    res.json({
      success: true,
      data: {
        accessToken: `esp_jwt_access_${Date.now()}_refreshed`,
        refreshToken: refreshToken,
        expiresIn: 3600
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
