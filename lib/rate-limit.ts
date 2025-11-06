type RateLimiterOptions = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  expires: number;
};

export function createRateLimiter({ limit, windowMs }: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.expires <= now) {
        buckets.delete(key);
      }
    }
  };

  return {
    check(key: string) {
      const now = Date.now();
      const existing = buckets.get(key);

      if (!existing || existing.expires <= now) {
        buckets.set(key, { count: 1, expires: now + windowMs });
        cleanup();
        return true;
      }

      if (existing.count >= limit) {
        return false;
      }

      existing.count += 1;
      cleanup();
      return true;
    },
  };
}
