import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const noopLimiter = { limit: async () => ({ success: true }) };

export const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:login",
    })
  : noopLimiter;

export const signupRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "3600 s"),
      prefix: "ratelimit:signup",
    })
  : noopLimiter;
