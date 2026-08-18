import { getRedisClient } from './redis'

export async function cached<T>(key: string, factory: () => Promise<T>, ttlMs = 10_000): Promise<T> {
  const client = getRedisClient()
  const redisKey = `cache:${key}`

  const cachedValue = await client.get(redisKey)
  if (cachedValue !== null) {
    return JSON.parse(cachedValue) as T
  }

  const value = await factory()
  await client.set(redisKey, JSON.stringify(value), 'PX', ttlMs)
  return value
}
