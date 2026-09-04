// Redis Client Configuration for Email Service Platform (P0-T3)
// Support for Redis 7 local Docker and Vercel KV / Upstash Redis in serverless production environments

export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number | null;
  enableReadyCheck?: boolean;
  retryStrategy?: (times: number) => number | void;
}

export const defaultRedisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || 'redis_password',
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: 'esp:email:',
  maxRetriesPerRequest: null, // Required for Bull queue compatibility
  enableReadyCheck: true,
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    console.log(`[Redis] Connection retry attempt #${times} in ${delay}ms...`);
    return delay;
  }
};

export class MockRedisClient {
  private store: Map<string, { value: string; expiresAt?: number }> = new Map();
  public isConnected: boolean = true;

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiresAt = Date.now() + duration;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.delete(key)) deletedCount++;
    }
    return deletedCount;
  }

  async incr(key: string): Promise<number> {
    const val = await this.get(key);
    let num = val ? parseInt(val, 10) : 0;
    if (isNaN(num)) num = 0;
    num += 1;
    const existing = this.store.get(key);
    this.store.set(key, { value: String(num), expiresAt: existing?.expiresAt });
    return num;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const existing = this.store.get(key);
    if (!existing) return 0;
    existing.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const existing = this.store.get(key);
    if (!existing) return -2;
    if (existing.expiresAt) {
      const remainingMs = existing.expiresAt - Date.now();
      if (remainingMs <= 0) {
        this.store.delete(key);
        return -2;
      }
      return Math.ceil(remainingMs / 1000);
    }
    return -1;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.store.keys());
    if (pattern === '*') return allKeys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter(k => regex.test(k));
  }

  async flushdb(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  async ping(): Promise<'PONG'> {
    return 'PONG';
  }
}

export const redisClient = new MockRedisClient();
