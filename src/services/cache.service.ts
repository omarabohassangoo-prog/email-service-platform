// Cache Service for Email Service Platform (P0-T3)
// Provides generic cache operations, TTL management, pattern invalidation, and domain-specific caching strategies

import { redisClient } from '../config/redis';

export class CacheService {
  private static instance: CacheService;
  private prefix = 'esp:email:';

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get parsed JSON or string item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const data = await redisClient.get(fullKey);
      if (!data) return null;
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    } catch (err) {
      console.error(`[CacheService] Error getting key "${key}":`, err);
      return null;
    }
  }

  /**
   * Set item in cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const fullKey = this.prefix + key;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.set(fullKey, stringValue, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.error(`[CacheService] Error setting key "${key}":`, err);
      return false;
    }
  }

  /**
   * Delete specific key or multiple keys
   */
  async del(...keys: string[]): Promise<number> {
    try {
      const fullKeys = keys.map(k => this.prefix + k);
      return await redisClient.del(...fullKeys);
    } catch (err) {
      console.error('[CacheService] Error deleting keys:', err);
      return 0;
    }
  }

  /**
   * Pattern-based cache invalidation (e.g. invalidate('template:*'))
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.prefix + pattern;
      const keys = await redisClient.keys(fullPattern);
      if (keys.length === 0) return 0;
      
      // Strip prefix before passing to del() because del() adds prefix
      const strippedKeys = keys.map(k => k.startsWith(this.prefix) ? k.slice(this.prefix.length) : k);
      return await this.del(...strippedKeys);
    } catch (err) {
      console.error(`[CacheService] Error invalidating pattern "${pattern}":`, err);
      return 0;
    }
  }

  /**
   * Get item if cached, or fetch from DB fallback and cache the result (Cache-Aside Pattern)
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetchFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }

  // --- Domain-Specific Strategies ---

  /**
   * Cache API Key metadata & limits (TTL: 1 hour)
   */
  async cacheApiKey(apiKeyString: string, keyData: any): Promise<boolean> {
    return this.set(`apikey:${apiKeyString}`, keyData, 3600);
  }

  async getApiKey(apiKeyString: string): Promise<any | null> {
    return this.get(`apikey:${apiKeyString}`);
  }

  /**
   * Cache Email Template (TTL: 12 hours)
   */
  async cacheTemplate(templateIdOrName: string, templateData: any): Promise<boolean> {
    return this.set(`template:${templateIdOrName}`, templateData, 43200);
  }

  async getTemplate(templateIdOrName: string): Promise<any | null> {
    return this.get(`template:${templateIdOrName}`);
  }

  /**
   * Cache Provider Configurations (TTL: 24 hours)
   */
  async cacheProviders(providers: any[]): Promise<boolean> {
    return this.set('providers:active', providers, 86400);
  }

  async getProviders(): Promise<any[] | null> {
    return this.get('providers:active');
  }

  /**
   * Invalidate all provider configurations cache
   */
  async invalidateProviders(): Promise<number> {
    return this.del('providers:active');
  }
}

export const cacheService = CacheService.getInstance();
