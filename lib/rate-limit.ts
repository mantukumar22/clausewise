import { env } from '@/lib/env';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Simple in-memory sliding window rate limiter
export function checkRateLimit(
  ip: string,
  limit: number = env.RATE_LIMIT_MAX,
  windowMs: number = env.RATE_LIMIT_WINDOW_MS
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  // Clean up expired entries periodically if map grows too large
  if (ipMap.size > 1000) {
    for (const [key, val] of ipMap.entries()) {
      if (val.resetTime < now) {
        ipMap.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    ipMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
