import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as logoutPost } from '@/app/api/auth/logout/route'

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('@/lib/auth/session', () => ({
  deleteSession: vi.fn(),
}))

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs out successfully', async () => {
    const req = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
    }) as NextRequest

    const response = await logoutPost(req)

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain('/login')
  })
})
