import { Redis } from '@upstash/redis';

// Support both direct Upstash env vars and Vercel KV env vars
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  '';

const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  '';

export const isRedisConfigured = Boolean(redisUrl && redisToken);

// Singleton Upstash client (lazy initialization)
let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!isRedisConfigured) return null;
  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: redisUrl,
        token: redisToken,
      });
    } catch (e) {
      console.warn('[Redis] Failed to initialize Upstash Redis client:', e);
      return null;
    }
  }
  return redisClient;
}

/**
 * Free-tier safe Redis GET with timeout protection and silent 429 quota handling.
 * If Redis is not configured or exceeds free-tier limits, returns null seamlessly.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    // 400ms timeout for Redis HTTP call to prevent edge latency
    const result = await Promise.race([
      client.get<T>(key),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Redis GET timeout')), 400),
      ),
    ]);
    return result;
  } catch (error: any) {
    // Silently fall back to L1 / DB on rate limits, network timeouts, or free-tier quota exhaustion
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Redis GET] Cache miss/degrade for ${key}:`, error.message);
    }
    return null;
  }
}

/**
 * Free-tier safe Redis SET with configurable TTL (default 2 hours).
 * Long TTLs prevent excessive write commands on the 10,000/day free tier.
 */
export async function redisSet(
  key: string,
  value: any,
  ttlSeconds: number = 7200, // 2 Hours default TTL
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    // Non-blocking asynchronous cache update
    await client.set(key, value, { ex: ttlSeconds });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Redis SET] Failed for ${key}:`, error.message);
    }
  }
}

/**
 * Purge cache keys by prefix or exact key
 */
export async function redisDel(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error: any) {
    console.warn(`[Redis DEL] Failed for ${key}:`, error.message);
  }
}

/**
 * Event-Driven Cache Invalidation:
 * Executed when an Admin adds, updates, or publishes a product.
 * Purges shared catalogue keys so visitors see new products immediately.
 */
export async function redisInvalidateCatalogue(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    // Purge primary catalogue cache keys
    const keys = [
      'cs:categories_tree',
      'cs:all_tags',
      'cs:homepage_sections',
    ];
    await client.del(...keys);

    // Also scan and delete products list cache if available
    const productKeys = await client.keys('cs:products_*');
    if (productKeys && productKeys.length > 0) {
      await client.del(...productKeys);
    }
  } catch (error: any) {
    console.warn('[Redis] Invalidation warning:', error.message);
  }
}
