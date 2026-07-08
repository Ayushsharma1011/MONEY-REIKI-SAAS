import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "@/constants/app";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count };
}
