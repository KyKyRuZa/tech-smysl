import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit, loginRateLimitKey, getClientIp } from '@/lib/rate-limit'

const store = new Map<string, { count: number; resetAt: number }>()

vi.mock('@/lib/redis', () => ({
  getRedisClient: () => ({
    incr: async (key: string) => {
      const entry = store.get(key)
      const now = Date.now()
      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + 60_000 })
        return 1
      }
      entry.count += 1
      return entry.count
    },
    expire: async () => {
      // no-op in mock
    },
  }),
}))

describe('Security: rate limiting', () => {
  beforeEach(() => {
    store.clear()
  })

  it('loginRateLimitKey normalizes email and is scoped per IP', () => {
    const a = loginRateLimitKey('1.2.3.4', 'Admin@Example.com')
    const b = loginRateLimitKey('1.2.3.4', 'admin@example.com')
    const c = loginRateLimitKey('5.6.7.8', 'admin@example.com')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('allows up to max requests then blocks', async () => {
    for (let i = 0; i < 10; i++) {
      expect(await rateLimit('k-max', 10, 60_000)).toBe(true)
    }
    expect(await rateLimit('k-max', 10, 60_000)).toBe(false)
  })

  it('tracks keys independently', async () => {
    for (let i = 0; i < 10; i++) expect(await rateLimit('k-a', 10, 60_000)).toBe(true)
    expect(await rateLimit('k-a', 10, 60_000)).toBe(false)
    expect(await rateLimit('k-b', 10, 60_000)).toBe(true)
  })

  it('resets after the window elapses', async () => {
    for (let i = 0; i < 10; i++) expect(await rateLimit('k-reset', 10, 60_000)).toBe(true)
    expect(await rateLimit('k-reset', 10, 60_000)).toBe(false)
    // simulate window expiry
    const entry = store.get('rate-limit:k-reset')!
    entry.resetAt = Date.now() - 1
    store.set('rate-limit:k-reset', entry)
    expect(await rateLimit('k-reset', 10, 60_000)).toBe(true)
  })

  it('getClientIp prefers x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' },
    })
    expect(getClientIp(req)).toBe('9.9.9.9')
  })
})
