import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { redis, redisKey } from "@/lib/redis";

const createLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: redisKey("ratelimit:create"),
  analytics: false,
});

const redirectLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  prefix: redisKey("ratelimit:redirect"),
  analytics: false,
});

export async function limitCreate(ip: string) {
  return createLimit.limit(ip);
}

export async function limitRedirect(ip: string) {
  return redirectLimit.limit(ip);
}
