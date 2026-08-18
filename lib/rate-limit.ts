import { getRedisClient } from './redis'

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60
const DEFAULT_MAX = 100

export async function rateLimit(key: string, max = DEFAULT_MAX, windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000): Promise<boolean> {
  const client = getRedisClient()
  const ttlSeconds = Math.ceil(windowMs / 1000)
  const redisKey = `rate-limit:${key}`

  const count = await client.incr(redisKey)
  if (count === 1) {
    await client.expire(redisKey, ttlSeconds)
  }

  return count <= max
}

export function loginRateLimitKey(ip: string, email: string): string {
  const normalized = email.trim().toLowerCase()
  return `login:${ip}:${normalized}`
}

export function getClientIp(req: Request): string {
  const xfwd = req.headers.get('x-forwarded-for')
  if (xfwd) return xfwd.split(',')[0]!.trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri
  return 'unknown'
}
