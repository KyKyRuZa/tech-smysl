import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/blog-posts/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { blogPostSelect } from '@/lib/api/helpers'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
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

describe('GET /api/blog-posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only published posts by default', async () => {
    const posts = [{ id: '1', title: 'Published Post', published: true }]
    mockPrisma.blogPost.findMany.mockResolvedValue(posts as any)

    const req = new Request('http://localhost/api/blog-posts') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: blogPostSelect,
    })
    expect(json.data).toEqual(posts)
    expect(response.status).toBe(200)
  })

  it('returns all posts when all=true', async () => {
    const posts = [
      { id: '1', title: 'Published', published: true },
      { id: '2', title: 'Draft', published: false },
    ]
    mockPrisma.blogPost.findMany.mockResolvedValue(posts as any)

    const req = new Request('http://localhost/api/blog-posts?all=true') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { publishedAt: 'desc' },
      select: blogPostSelect,
    })
    expect(json.data).toEqual(posts)
    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    mockPrisma.blogPost.findMany.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/blog-posts') as any
    const response = await GET(req)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})

describe('POST /api/blog-posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates post for authenticated admin', async () => {
    const payload = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }
    mockRequireAuth.mockResolvedValue(payload as any)
    mockPrisma.blogPost.findFirst.mockResolvedValue(null)
    mockPrisma.blogPost.create.mockResolvedValue({
      id: '1',
      slug: 'my-post',
      title: 'My Post',
      content: 'Content',
      published: false,
      publishedAt: null,
      tags: [],
      createdAt: new Date(),
    } as any)

    const req = new Request('http://localhost/api/blog-posts', {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-post', title: 'My Post', content: 'Content' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    const json = await response.json()

    expect(mockRequireAuth).toHaveBeenCalledWith(req)
    expect(mockPrisma.blogPost.create).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(json.data.slug).toBe('my-post')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/blog-posts', {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-post', title: 'My Post' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)

    const req = new Request('http://localhost/api/blog-posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'No slug' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
