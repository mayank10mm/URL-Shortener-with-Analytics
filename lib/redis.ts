import "server-only";

import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const REDIS_KEY_PREFIX = "urlshortener:";

let cached: Redis | undefined;

export function getRedis(): Redis {
  if (!cached) {
    cached = new Redis({
      url: env.upstashRedisRestUrl,
      token: env.upstashRedisRestToken,
    });
  }
  return cached;
}

export function redisKey(parts: string): string {
  return `${REDIS_KEY_PREFIX}${parts}`;
}
