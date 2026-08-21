// Minimal in-memory fixed-window rate limiter.
// Suitable for a single-instance placeholder app (no external deps).
// For multi-instance/prod, swap this for a shared store (e.g. Redis).

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

// Opportunistically drop expired buckets so the map doesn't grow unbounded.
export function sweepExpired(): void {
  const now = Date.now();
  for (const [key, win] of buckets) {
    if (now >= win.resetAt) buckets.delete(key);
  }
}
