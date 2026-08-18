import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cached } from '@/lib/cache'

const store = new Map<string, { value: string; expires: number }>()

vi.mock('@/lib/redis', () => ({
  getRedisClient: () => ({
    get: async (key: string) => {
      const entry = store.get(key)
      if (!entry) return null
      if (Date.now() > entry.expires) {
        store.delete(key)
        return null
      }
      return entry.value
    },
    set: async (key: string, value: string, _mode: string, ttlMs: number) => {
      store.set(key, { value, expires: Date.now() + ttlMs })
    },
  }),
}))

describe('lib: cache', () => {
  beforeEach(() => {
    store.clear()
  })

  afterEach(() => {
    store.clear()
  })

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
    // simulate TTL expiry
    const entry = store.get('cache:k3')!
    entry.expires = Date.now() - 1
    store.set('cache:k3', entry)
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

  it('caches non-primitive (object) values by value', async () => {
    const obj = { name: 'x' }
    const factory = vi.fn(async () => obj)
    const first = await cached('kobj', factory)
    const second = await cached('kobj', factory)
    expect(first).toStrictEqual(obj)
    expect(second).toStrictEqual(obj)
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
