import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { rateLimitService } from '../services/rate-limit.service';

/**
 * Express Middleware to enforce Redis-backed rate limiting per API Key and endpoint.
 */
export const rateLimiter = (endpoint: string = 'general') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Identify client key or fall back to IP address
      const apiKeyId = req.apiKeyData?.apiKeyId || (req as any).apiKey?.id;
      
      if (!apiKeyId) {
        // If no API Key is available (e.g. public endpoints), fall back to IP rate limiting
        const ip = req.ip || req.headers['x-forwarded-for'] as string || 'anonymous_ip';
        const result = await rateLimitService.checkLimit(`ip:${ip}`, endpoint, 60, 5000);

        res.setHeader('X-RateLimit-Limit', result.limit.toString());
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
        res.setHeader('X-RateLimit-Reset', result.reset.toString());

        if (!result.allowed) {
          res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: 'تم تجاوز الحد الأقصى لمعدل الطلبات المسموح به لكل دقيقة لهذه الـ IP (Rate limit exceeded)',
            retry_after: result.reset
          });
          return;
        }
        return next();
      }

      // 2. Perform Redis sliding window rate-limit check
      const result = await rateLimitService.checkLimit(apiKeyId, endpoint);

      // Set RFC-compliant headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.reset.toString());

      if (!result.allowed) {
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: 'تم تجاوز معدل الطلبات المسموح به لمفتاح الـ API الخاص بك (Rate limit exceeded)',
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          retry_after: result.reset
        });
        return;
      }

      next();
    } catch (err: any) {
      console.error('[RateLimitMiddleware] Error:', err);
      // Fallback: don't block the api if rate limiting fails internally
      next();
    }
  };
};
