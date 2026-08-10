import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, loginRateLimitKey, getClientIp } from '@/lib/rate-limit'

describe('Security: rate limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('loginRateLimitKey normalizes email and is scoped per IP', () => {
    const a = loginRateLimitKey('1.2.3.4', 'Admin@Example.com')
    const b = loginRateLimitKey('1.2.3.4', 'admin@example.com')
    const c = loginRateLimitKey('5.6.7.8', 'admin@example.com')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('allows up to max requests then blocks', () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimit('k-max', 10, 60_000)).toBe(true)
    }
    expect(rateLimit('k-max', 10, 60_000)).toBe(false)
  })

  it('tracks keys independently', () => {
    for (let i = 0; i < 10; i++) expect(rateLimit('k-a', 10, 60_000)).toBe(true)
    expect(rateLimit('k-a', 10, 60_000)).toBe(false)
    expect(rateLimit('k-b', 10, 60_000)).toBe(true)
  })

  it('resets after the window elapses', () => {
    for (let i = 0; i < 10; i++) expect(rateLimit('k-reset', 10, 60_000)).toBe(true)
    expect(rateLimit('k-reset', 10, 60_000)).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(rateLimit('k-reset', 10, 60_000)).toBe(true)
  })

  it('getClientIp prefers x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' },
    })
    expect(getClientIp(req)).toBe('9.9.9.9')
  })
})
