/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { NotFoundError } from '@/lib/errors'
import { encrypt } from '@/lib/auth/session'

const validToken = encrypt({ userId: '123', email: 'test@example.com', role: 'ADMIN' as const })

describe('crud handlers', () => {
  it('createGetHandler throws NotFoundError when not found', async () => {
    const handler = createGetHandler(
      async () => null,
      'Item not found'
    )
    const req = new Request('http://localhost') as any
    const params = Promise.resolve({ id: 'missing' })
    await expect(handler(req, { params } as any)).rejects.toThrow(NotFoundError)
  })

  it('createDeleteHandler throws NotFoundError when not found', async () => {
    const handler = createDeleteHandler({
      find: async () => null,
      delete: async () => {},
      notFoundMessage: 'Item not found',
      logKey: 'Item',
    })
    const req = {
      cookies: {
        get: () => ({ value: validToken }),
      },
    } as any
    const params = Promise.resolve({ id: 'missing' })
    await expect(handler(req, { params } as any)).rejects.toThrow(NotFoundError)
  })
})
