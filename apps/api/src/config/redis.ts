import { createClient } from 'redis';
import { ENV } from './env';

class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const inMemoryCache = new InMemoryCache();

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) return redisClient;
  try {
    const client = createClient({ url: ENV.REDIS_URL });
    client.on('error', (err) => console.warn('Redis error (using fallback cache):', err.message));
    await client.connect();
    redisClient = client;
    return client;
  } catch (err) {
    console.warn('Redis connection failed. Defaulting to in-memory fallback cache.');
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      return await redis.get(key);
    }
  } catch {
    // fallback
  }
  return inMemoryCache.get(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.set(key, value, { EX: ttlSeconds });
      return;
    }
  } catch {
    // fallback
  }
  await inMemoryCache.set(key, value, { EX: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.del(key);
      return;
    }
  } catch {
    // fallback
  }
  await inMemoryCache.del(key);
}
