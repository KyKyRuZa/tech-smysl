import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/reviews/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    review: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

const createMockParams = (id: string) => Promise.resolve({ id })

describe('GET /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns review by id', async () => {
    const review = { id: '1', headline: 'Great', body: 'Review' }
    mockPrisma.review.findUnique.mockResolvedValue(review as any)

    const req = new Request('http://localhost/api/reviews/1') as any
    const response = await GET(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(json.data).toEqual(review)
    expect(response.status).toBe(200)
  })

  it('returns 404 when review not found', async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/reviews/999') as any
    const res = await GET(req, { params: createMockParams('999') })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates review for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.review.findUnique.mockResolvedValue({ id: '1', headline: 'Old' } as any)
    mockPrisma.review.update.mockResolvedValue({
      id: '1',
      headline: 'New',
      body: 'New body',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/reviews/1', {
      method: 'PUT',
      body: JSON.stringify({ headline: 'New', body: 'New body' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.review.update).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(json.data.headline).toBe('New')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/reviews/1', {
      method: 'PUT',
      body: JSON.stringify({ headline: 'New' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes review for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.review.findUnique.mockResolvedValue({ id: '1' } as any)
    mockPrisma.review.delete.mockResolvedValue({ id: '1' } as any)

    const req = new Request('http://localhost/api/reviews/1', {
      method: 'DELETE',
    }) as any

    const response = await DELETE(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.review.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(response.status).toBe(200)
    expect(json.message).toBe('Deleted')
  })
})
