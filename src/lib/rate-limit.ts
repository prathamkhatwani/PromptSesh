import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Robust Multi-Tier Rate Limiter
 * 
 * 1. Production / Serverless: When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 *    are configured, leverages Upstash Redis sliding window algorithm across all
 *    serverless edge/lambda instances globally.
 * 2. Development / Fallback: Gracefully falls back to local in-memory sliding window
 *    when Redis credentials are not provided.
 */

// In-memory sliding window fallback store
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryRateLimitMap = new Map<string, RateLimitRecord>();

let upstashRatelimitInstance: Ratelimit | null = null;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimitInstance) {
    return upstashRatelimitInstance;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({
        url,
        token,
      });

      upstashRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        analytics: true,
        prefix: "promptsesh_ratelimit",
      });

      return upstashRatelimitInstance;
    } catch (e) {
      console.warn("[RATE-LIMIT] Failed to initialize Upstash Redis rate limiter, using fallback:", (e as Error).message);
    }
  }

  return null;
}

/**
 * Extracts a secure client identifier for rate limiting.
 * Strictly prioritizes authenticated userId > leftmost IP from x-forwarded-for > fallback.
 */
export function getRateLimitIdentifier(
  req: Request,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Parse leftmost client IP from forwarded header
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp && firstIp !== "::1" && firstIp !== "127.0.0.1") {
      return `ip:${firstIp}`;
    }
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp.trim()}`;
  }

  return "ip:anonymous";
}

/**
 * Executes rate limiting check against identifier.
 * Works seamlessly with Upstash Redis in serverless production or memory in dev.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const upstash = getUpstashRatelimit();

  if (upstash) {
    try {
      const res = await upstash.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        resetTime: res.reset,
      };
    } catch (err) {
      console.warn("[RATE-LIMIT] Upstash call error, falling back to local window:", (err as Error).message);
    }
  }

  // Fallback: in-memory sliding window
  const now = Date.now();

  // Periodic eviction
  if (memoryRateLimitMap.size > 500) {
    for (const [key, val] of memoryRateLimitMap.entries()) {
      if (now > val.resetTime) {
        memoryRateLimitMap.delete(key);
      }
    }
  }

  const record = memoryRateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    memoryRateLimitMap.set(identifier, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
