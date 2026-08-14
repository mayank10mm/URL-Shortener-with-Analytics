import "server-only";

import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const REDIS_KEY_PREFIX = "urlshortener:";

export const redis = new Redis({
  url: env.upstashRedisRestUrl,
  token: env.upstashRedisRestToken,
});

export function redisKey(parts: string): string {
  return `${REDIS_KEY_PREFIX}${parts}`;
}
