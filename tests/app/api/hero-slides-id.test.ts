import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/hero-slides/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    heroSlide: {
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

describe('GET /api/hero-slides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns slide by id', async () => {
    const slide = { id: '1', title: 'Slide', imageUrl: 'slide.jpg' }
    mockPrisma.heroSlide.findUnique.mockResolvedValue(slide as any)

    const req = new Request('http://localhost/api/hero-slides/1') as any
    const response = await GET(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(json.data).toEqual(slide)
    expect(response.status).toBe(200)
  })

  it('returns 404 when slide not found', async () => {
    mockPrisma.heroSlide.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/hero-slides/999') as any
    const res = await GET(req, { params: createMockParams('999') })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/hero-slides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates slide for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.heroSlide.findUnique.mockResolvedValue({ id: '1', title: 'Old' } as any)
    mockPrisma.heroSlide.update.mockResolvedValue({
      id: '1',
      title: 'New',
      imageUrl: 'new.jpg',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/hero-slides/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'New', imageUrl: 'new.jpg' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.heroSlide.update).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(json.data.title).toBe('New')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/hero-slides/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'New' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/hero-slides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes slide for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.heroSlide.findUnique.mockResolvedValue({ id: '1' } as any)
    mockPrisma.heroSlide.delete.mockResolvedValue({ id: '1' } as any)

    const req = new Request('http://localhost/api/hero-slides/1', {
      method: 'DELETE',
    }) as any

    const response = await DELETE(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.heroSlide.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(response.status).toBe(200)
    expect(json.message).toBe('Deleted')
  })
})
