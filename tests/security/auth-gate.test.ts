import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET as getBlogPosts } from '@/app/api/blog-posts/route'
import { GET as getProjects } from '@/app/api/projects/route'
import { GET as getReviews } from '@/app/api/reviews/route'
import { GET as getHeroSlides } from '@/app/api/hero-slides/route'

const { mockPrisma, mockRequireAuth } = vi.hoisted(() => ({
  mockPrisma: {
    blogPost: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    review: { findMany: vi.fn() },
    heroSlide: { findMany: vi.fn() },
  },
  mockRequireAuth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/auth/require-auth', () => ({ requireAuth: mockRequireAuth }))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const authorized = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }

const handlers = [
  { name: 'blog-posts', get: getBlogPosts, model: mockPrisma.blogPost },
  { name: 'projects', get: getProjects, model: mockPrisma.project },
  { name: 'reviews', get: getReviews, model: mockPrisma.review },
  { name: 'hero-slides', get: getHeroSlides, model: mockPrisma.heroSlide },
]

describe('Security: ?all=true requires authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const h of handlers) h.model.findMany.mockResolvedValue([])
  })

  for (const h of handlers) {
    describe(`GET /api/${h.name}`, () => {
      it('returns 401 for all=true when unauthenticated', async () => {
        mockRequireAuth.mockResolvedValue(unauthorized)
        const res = await h.get(
          new Request(`http://localhost/api/${h.name}?all=true`) as NextRequest
        )
        expect(res.status).toBe(401)
      })

      it('returns 200 for all=true when authenticated', async () => {
        mockRequireAuth.mockResolvedValue(authorized)
        const res = await h.get(
          new Request(`http://localhost/api/${h.name}?all=true`) as NextRequest
        )
        expect(res.status).toBe(200)
      })

      it('returns 200 for published list without auth (default)', async () => {
        mockRequireAuth.mockResolvedValue(unauthorized)
        const res = await h.get(
          new Request(`http://localhost/api/${h.name}`) as NextRequest
        )
        expect(res.status).toBe(200)
        expect(h.model.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { published: true } })
        )
      })

      it('queries unpublished content only when authorized', async () => {
        mockRequireAuth.mockResolvedValue(authorized)
        await h.get(
          new Request(`http://localhost/api/${h.name}?all=true`) as NextRequest
        )
        expect(h.model.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: {} })
        )
      })
    })
  }
})
