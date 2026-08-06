import { describe, it, expect, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api/with-error-handler'
import { AppError, NotFoundError } from '@/lib/errors'

const createMockRequest = () => new Request('http://localhost/api/test')

describe('withErrorHandler', () => {
  it('returns successful response', async () => {
    const handler = withErrorHandler(async () => {
      return NextResponse.json({ ok: true }, { status: 200 })
    })
    const req = createMockRequest()
    const response = await handler(req as any)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.ok).toBe(true)
  })

  it('handles AppError and returns correct status', async () => {
    const handler = withErrorHandler(async () => {
      throw new NotFoundError('Not found')
    })
    const req = createMockRequest()
    const response = await handler(req as any)
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error).toBe('Not found')
  })

  it('handles generic Error and returns 500', async () => {
    const handler = withErrorHandler(async () => {
      throw new Error('Something broke')
    })
    const req = createMockRequest()
    const response = await handler(req as any)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('Internal server error')
  })

  it('handles File is required error with 400', async () => {
    const handler = withErrorHandler(async () => {
      throw new Error('File is required')
    })
    const req = createMockRequest()
    const response = await handler(req as any)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('File is required')
  })

  it('handles unknown non-Error throwable and returns 500', async () => {
    const handler = withErrorHandler(async () => {
      throw 'string error'
    })
    const req = createMockRequest()
    const response = await handler(req as any)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('Internal server error')
  })
})
