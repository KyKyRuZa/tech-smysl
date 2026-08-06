import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/reviews/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    review: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

const mockPrisma = vi.mocked(prisma)
const mockRequireAuth = vi.mocked(requireAuth)

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only published reviews by default', async () => {
    const reviews = [{ id: '1', headline: 'Great', published: true }]
    mockPrisma.review.findMany.mockResolvedValue(reviews as any)

    const req = new Request('http://localhost/api/reviews') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(reviews)
    expect(response.status).toBe(200)
  })

  it('returns all reviews when all=true', async () => {
    const reviews = [
      { id: '1', headline: 'Great', published: true },
      { id: '2', headline: 'Bad', published: false },
    ]
    mockPrisma.review.findMany.mockResolvedValue(reviews as any)

    const req = new Request('http://localhost/api/reviews?all=true') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(reviews)
    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    mockPrisma.review.findMany.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/reviews') as any
    const response = await GET(req)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates review for authenticated admin', async () => {
    const payload = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }
    mockRequireAuth.mockResolvedValue(payload as any)
    mockPrisma.review.create.mockResolvedValue({
      id: '1',
      headline: 'Great',
      body: 'Review text',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ headline: 'Great', body: 'Review text' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    const json = await response.json()

    expect(mockRequireAuth).toHaveBeenCalledWith(req)
    expect(mockPrisma.review.create).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(json.data.headline).toBe('Great')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ headline: 'Great', body: 'Review' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)

    const req = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ headline: '' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
