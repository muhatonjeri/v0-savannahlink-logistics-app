// Simple in-memory rate limiter for API routes
// In production, use Upstash Redis or similar

const requests = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.reset) {
    requests.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}
