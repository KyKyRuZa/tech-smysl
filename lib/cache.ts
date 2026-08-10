type Entry<T> = { value: T; expires: number }

const cache = new Map<string, Entry<unknown>>()

function pruneExpired() {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key)
  }
}

export function cached<T>(key: string, factory: () => Promise<T>, ttlMs = 10_000): Promise<T> {
  const hit = cache.get(key) as Entry<T> | undefined
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value)

  pruneExpired()

  return factory().then((value) => {
    cache.set(key, { value, expires: Date.now() + ttlMs })
    return value
  })
}
