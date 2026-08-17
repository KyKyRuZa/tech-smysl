import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cached } from '@/lib/cache'

describe('lib: cache', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the factory value on first call', async () => {
    const factory = vi.fn(async () => 42)
    const result = await cached('k', factory)
    expect(result).toBe(42)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('serves cached value without calling factory again within TTL', async () => {
    const factory = vi.fn(async () => Math.random())
    const first = await cached('k2', factory)
    const second = await cached('k2', factory)
    expect(second).toBe(first)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('refetches after the TTL elapses', async () => {
    const factory = vi.fn(async () => Math.random())
    const first = await cached('k3', factory, 1000)
    vi.advanceTimersByTime(1001)
    const second = await cached('k3', factory, 1000)
    expect(second).not.toBe(first)
    expect(factory).toHaveBeenCalledTimes(2)
  })

  it('isolates different keys independently', async () => {
    const fa = vi.fn(async () => 'a')
    const fb = vi.fn(async () => 'b')
    expect(await cached('ka', fa)).toBe('a')
    expect(await cached('kb', fb)).toBe('b')
    expect(fa).toHaveBeenCalledTimes(1)
    expect(fb).toHaveBeenCalledTimes(1)
  })

  it('caches non-primitive (object) values by reference', async () => {
    const obj = { name: 'x' }
    const factory = vi.fn(async () => obj)
    const first = await cached('kobj', factory)
    const second = await cached('kobj', factory)
    expect(first).toBe(obj)
    expect(second).toBe(obj)
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
