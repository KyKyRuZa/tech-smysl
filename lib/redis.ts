import Redis from 'ioredis'
import { logger } from './logger'

const url = process.env.REDIS_URL

let client: Redis | null = null

function createNoopClient(): Redis {
  const noop = () => Promise.resolve()
  return {
    get: () => Promise.resolve(null),
    set: noop,
    del: noop,
    incr: () => Promise.resolve(1),
    expire: noop,
    on: () => {},
    quit: () => Promise.resolve(),
    disconnect: () => {},
    status: 'noop',
    addr: 'noop',
    connect: async () => {},
  } as unknown as Redis
}

export function getRedisClient(): Redis {
  if (!url) {
    return createNoopClient()
  }

  if (!client) {
    client = new Redis(url, {
      keepAlive: 30,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(100 * times, 2000)
        return delay
      },
    })

    client.on('connect', () => logger.info('Redis connected'))
    client.on('error', (err) => logger.error('Redis error', { error: err.message }))
    client.on('close', () => logger.warn('Redis connection closed'))
  }

  return client
}
