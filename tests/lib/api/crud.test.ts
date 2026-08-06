/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { NextResponse } from 'next/server'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { encrypt } from '@/lib/auth/session'

const validToken = encrypt({ userId: '123', email: 'test@example.com', role: 'ADMIN' as const })

describe('crud handlers', () => {
  it('createGetHandler returns 404 when not found', async () => {
    const handler = createGetHandler(
      async () => null,
      'Item not found'
    )
    const req = new Request('http://localhost') as any
    const params = Promise.resolve({ id: 'missing' })
    const res = await handler(req, { params } as any)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Item not found' })
  })

  it('createDeleteHandler returns 404 when not found', async () => {
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
    const res = await handler(req, { params } as any)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res.status).toBe(404)
  })
})
