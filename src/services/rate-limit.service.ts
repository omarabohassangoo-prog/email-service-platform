import { redisClient } from '../config/redis';
import { dbStore } from '../server/db';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until limit resets
}

export class RateLimitService {
  /**
   * Checks the rate limit for a specific API Key and endpoint using sliding window in Redis.
   * Also verifies and enforces daily limits.
   */
  public async checkLimit(
    apiKeyId: string,
    endpoint: string,
    limitPerMinute: number = 100,
    dailyLimit: number = 10000
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // 1. Daily Limit Check (Persistent DB state or Redis counter)
    const keyObj = dbStore.getApiKeys().find(k => k.id === apiKeyId);
    if (keyObj) {
      if (keyObj.daily_used >= (keyObj.daily_limit || dailyLimit)) {
        // Trigger limit alerts
        dbStore.addAuditLog('ratelimit.daily_exceeded', {
          apiKeyId,
          endpoint,
          daily_used: keyObj.daily_used,
          daily_limit: keyObj.daily_limit || dailyLimit,
          message: `تنبيه: تجاوز مفتاح API الحد اليومي المسموح به (${keyObj.daily_limit || dailyLimit} بريد/يوم)`
        });

        return {
          allowed: false,
          limit: keyObj.daily_limit || dailyLimit,
          remaining: 0,
          reset: this.getSecondsUntilMidnight()
        };
      }
    }

    // 2. Sliding Window Counter in Redis (Simulating Redis sliding window with list of timestamps)
    const redisKey = `rate:sliding:${apiKeyId}:${endpoint}`;
    const rawTimestamps = await redisClient.get(redisKey);
    let timestamps: number[] = rawTimestamps ? JSON.parse(rawTimestamps) : [];

    // Filter out timestamps older than 1 minute
    const cutOff = now - windowMs;
    timestamps = timestamps.filter(ts => ts > cutOff);

    const actualLimit = keyObj?.rate_limit || limitPerMinute;

    if (timestamps.length >= actualLimit) {
      // Limit Exceeded!
      const oldestActiveTs = timestamps[0];
      const resetTimeSec = Math.max(1, Math.ceil((oldestActiveTs + windowMs - now) / 1000));

      // Trigger limit alerts
      dbStore.addAuditLog('ratelimit.exceeded', {
        apiKeyId,
        endpoint,
        current_minute_count: timestamps.length,
        limit: actualLimit,
        message: `تنبيه: تم تجاوز حد الاستدعاء المسموح به لكل دقيقة لمفتاح API`
      });

      return {
        allowed: false,
        limit: actualLimit,
        remaining: 0,
        reset: resetTimeSec
      };
    }

    // Record new request timestamp
    timestamps.push(now);
    await redisClient.set(redisKey, JSON.stringify(timestamps), 'EX', 65); // expires in 65 seconds

    const remaining = Math.max(0, actualLimit - timestamps.length);
    const oldestTs = timestamps[0];
    const reset = Math.ceil((oldestTs + windowMs - now) / 1000);

    return {
      allowed: true,
      limit: actualLimit,
      remaining,
      reset: Math.max(1, reset)
    };
  }

  /**
   * Retrieves remaining limit count without incrementing the window
   */
  public async getRemaining(
    apiKeyId: string,
    endpoint: string,
    limitPerMinute: number = 100
  ): Promise<{ remaining: number; reset: number }> {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const redisKey = `rate:sliding:${apiKeyId}:${endpoint}`;

    const rawTimestamps = await redisClient.get(redisKey);
    let timestamps: number[] = rawTimestamps ? JSON.parse(rawTimestamps) : [];
    const cutOff = now - windowMs;
    timestamps = timestamps.filter(ts => ts > cutOff);

    const keyObj = dbStore.getApiKeys().find(k => k.id === apiKeyId);
    const limit = keyObj?.rate_limit || limitPerMinute;

    const remaining = Math.max(0, limit - timestamps.length);
    const oldestTs = timestamps.length > 0 ? timestamps[0] : now;
    const reset = Math.ceil((oldestTs + windowMs - now) / 1000);

    return {
      remaining,
      reset: Math.max(1, reset)
    };
  }

  /**
   * Resets the rate limit key in Redis instantly
   */
  public async resetLimit(apiKeyId: string, endpoint: string): Promise<void> {
    const redisKey = `rate:sliding:${apiKeyId}:${endpoint}`;
    await redisClient.del(redisKey);
    dbStore.addAuditLog('ratelimit.reset', {
      apiKeyId,
      endpoint,
      message: `تم تصفير عداد حد الطلبات لمفتاح API بشكل يدوي`
    });
  }

  /**
   * Utility: calculates seconds left until next UTC midnight
   */
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }
}

export const rateLimitService = new RateLimitService();
