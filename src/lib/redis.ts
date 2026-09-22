import { Redis } from '@upstash/redis';

// Upstash is optional here: without it, rate limiting is skipped
// (see rateLimiterService) and this client is never called.
export const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://redis.invalid',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'unset',
});
