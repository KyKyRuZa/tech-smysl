import { describe, it, expect } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth/require-auth'
import { encrypt, SessionPayload } from '@/lib/auth/session'

const createMockRequest = (cookieValue?: string): NextRequest => {
  const cookies = new Map<string, string>()
  if (cookieValue !== undefined) {
    cookies.set('session', cookieValue)
  }
  return {
    cookies: {
      get: (name: string) => cookies.get(name) ? { value: cookies.get(name)! } : undefined,
    },
  } as NextRequest
}

describe('requireAuth', () => {
  it('returns payload for valid token', async () => {
    const token = encrypt({ userId: '1', email: 'admin@example.com', role: 'ADMIN' })
    const req = createMockRequest(token)
    const payload = await requireAuth(req) as SessionPayload
    expect(payload.userId).toBe('1')
    expect(payload.email).toBe('admin@example.com')
    expect(payload.role).toBe('ADMIN')
  })

  it('returns 401 when no token', async () => {
    const req = createMockRequest()
    const result = await requireAuth(req)
    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Unauthorized')
    expect((result as NextResponse).status).toBe(401)
  })

  it('returns 401 for invalid token', async () => {
    const req = createMockRequest('invalid-token')
    const result = await requireAuth(req)
    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Unauthorized')
  })
})

describe('requireAdmin', () => {
  it('returns payload for admin token', async () => {
    const token = encrypt({ userId: '1', email: 'admin@example.com', role: 'ADMIN' })
    const req = createMockRequest(token)
    const payload = await requireAdmin(req) as SessionPayload
    expect(payload.userId).toBe('1')
    expect(payload.email).toBe('admin@example.com')
    expect(payload.role).toBe('ADMIN')
  })

  it('returns 403 for non-admin token', async () => {
    const token = encrypt({ userId: '2', email: 'user@example.com', role: 'EDITOR' })
    const req = createMockRequest(token)
    const result = await requireAdmin(req)
    expect(result).toBeInstanceOf(NextResponse)
    const json = await (result as NextResponse).json()
    expect(json.error).toBe('Forbidden')
    expect((result as NextResponse).status).toBe(403)
  })

  it('returns 401 when no token', async () => {
    const req = createMockRequest()
    const result = await requireAdmin(req)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })
})
