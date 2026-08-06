import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/projects/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
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

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only published projects by default', async () => {
    const projects = [{ id: '1', title: 'Published', published: true }]
    mockPrisma.project.findMany.mockResolvedValue(projects as any)

    const req = new Request('http://localhost/api/projects') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(projects)
    expect(response.status).toBe(200)
  })

  it('returns all projects when all=true', async () => {
    const projects = [
      { id: '1', title: 'Published', published: true },
      { id: '2', title: 'Draft', published: false },
    ]
    mockPrisma.project.findMany.mockResolvedValue(projects as any)

    const req = new Request('http://localhost/api/projects?all=true') as any
    const response = await GET(req)
    const json = await response.json()

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { order: 'asc' },
    })
    expect(json.data).toEqual(projects)
    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    mockPrisma.project.findMany.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/projects') as any
    const response = await GET(req)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})

describe('POST /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates project for authenticated admin', async () => {
    const payload = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }
    mockRequireAuth.mockResolvedValue(payload as any)
    mockPrisma.project.findFirst.mockResolvedValue(null)
    mockPrisma.project.create.mockResolvedValue({
      id: '1',
      slug: 'my-project',
      title: 'My Project',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-project', title: 'My Project' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    const json = await response.json()

    expect(mockRequireAuth).toHaveBeenCalledWith(req)
    expect(mockPrisma.project.create).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(json.data.slug).toBe('my-project')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-project', title: 'My Project' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: 'No slug' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
