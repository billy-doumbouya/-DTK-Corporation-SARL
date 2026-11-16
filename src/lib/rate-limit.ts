/**
 * Simple in-memory rate limiter. For production with multiple instances,
 * replace with Upstash Redis or similar.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || entry.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowSeconds * 1000 }
    buckets.set(key, fresh)
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt }
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt }
  }
  entry.count++
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}
