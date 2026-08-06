import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/blog-posts/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
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

describe('GET /api/blog-posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns post by id', async () => {
    const post = { id: '1', title: 'My Post', slug: 'my-post' }
    mockPrisma.blogPost.findUnique.mockResolvedValue(post as any)

    const req = new Request('http://localhost/api/blog-posts/1') as any
    const response = await GET(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.blogPost.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: expect.any(Object),
    })
    expect(json.data).toEqual(post)
    expect(response.status).toBe(200)
  })

  it('returns 404 when post not found', async () => {
    mockPrisma.blogPost.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/blog-posts/999') as any
    const res = await GET(req, { params: createMockParams('999') })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/blog-posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates post for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: '1', title: 'Old' } as any)
    mockPrisma.blogPost.update.mockResolvedValue({
      id: '1',
      title: 'New',
      slug: 'new',
      content: 'Content',
      published: false,
      publishedAt: null,
      tags: [],
      createdAt: new Date(),
    } as any)

    const req = new Request('http://localhost/api/blog-posts/1', {
      method: 'PUT',
      body: JSON.stringify({ slug: 'new', title: 'New', content: 'Content' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockRequireAuth).toHaveBeenCalledWith(req)
    expect(mockPrisma.blogPost.update).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(json.data.title).toBe('New')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/blog-posts/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'New' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    expect(response.status).toBe(401)
  })

  it('returns 404 when post not found', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.blogPost.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/blog-posts/999', {
      method: 'PUT',
      body: JSON.stringify({ slug: 'new', title: 'New', content: 'Content' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const res = await PUT(req, { params: createMockParams('999') })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/blog-posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes post for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: '1' } as any)
    mockPrisma.blogPost.delete.mockResolvedValue({ id: '1' } as any)

    const req = new Request('http://localhost/api/blog-posts/1', {
      method: 'DELETE',
    }) as any

    const response = await DELETE(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(response.status).toBe(200)
    expect(json.message).toBe('Deleted')
  })

  it('returns 404 when post not found', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.blogPost.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/blog-posts/999', {
      method: 'DELETE',
    }) as any

    const response = await DELETE(req, { params: createMockParams('999') })
    expect(response.status).toBe(404)
  })
})
