import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, redisKey } from "@/lib/redis";

let createLimit: Ratelimit | undefined;
let redirectLimit: Ratelimit | undefined;

function getCreateLimit() {
  if (!createLimit) {
    createLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: redisKey("ratelimit:create"),
      analytics: false,
    });
  }
  return createLimit;
}

function getRedirectLimit() {
  if (!redirectLimit) {
    redirectLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: redisKey("ratelimit:redirect"),
      analytics: false,
    });
  }
  return redirectLimit;
}

export async function limitCreate(ip: string) {
  return getCreateLimit().limit(ip);
}

export async function limitRedirect(ip: string) {
  return getRedirectLimit().limit(ip);
}
