import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/hero-slides/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    heroSlide: {
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

describe('GET /api/hero-slides', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only published slides by default', async () => {
    const slides = [{ id: '1', title: 'Slide', published: true }]
    mockPrisma.heroSlide.findMany.mockResolvedValue(slides as any)

    const req = new Request('http://localhost/api/hero-slides') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.heroSlide.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(slides)
    expect(response.status).toBe(200)
  })

  it('returns all slides when all=true', async () => {
    const slides = [
      { id: '1', title: 'Slide 1', published: true },
      { id: '2', title: 'Slide 2', published: false },
    ]
    mockPrisma.heroSlide.findMany.mockResolvedValue(slides as any)

    const req = new Request('http://localhost/api/hero-slides?all=true') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.heroSlide.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(slides)
    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    mockPrisma.heroSlide.findMany.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/hero-slides') as any
    const response = await GET(req)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})

describe('POST /api/hero-slides', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates slide for authenticated admin', async () => {
    const payload = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }
    mockRequireAuth.mockResolvedValue(payload as any)
    mockPrisma.heroSlide.create.mockResolvedValue({
      id: '1',
      imageUrl: 'slide.jpg',
      title: 'Slide',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/hero-slides', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: 'slide.jpg', title: 'Slide' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    const json = await response.json()

    expect(mockRequireAuth).toHaveBeenCalledWith(req)
    expect(mockPrisma.heroSlide.create).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(json.data.imageUrl).toBe('slide.jpg')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/hero-slides', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: 'slide.jpg', title: 'Slide' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)

    const req = new Request('http://localhost/api/hero-slides', {
      method: 'POST',
      body: JSON.stringify({ title: 'No image' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
