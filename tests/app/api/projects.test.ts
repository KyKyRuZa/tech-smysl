import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/projects/route'

const { mockPrisma, mockRequireAuth } = vi.hoisted(() => ({
  mockPrisma: {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
  mockRequireAuth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: mockRequireAuth,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only published projects by default', async () => {
    const projects = [{ id: '1', title: 'Published', published: true }]
    mockPrisma.project.findMany.mockResolvedValue(projects)

    const req = new Request('http://localhost/api/projects') as NextRequest
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
    mockPrisma.project.findMany.mockResolvedValue(projects)

    const req = new Request('http://localhost/api/projects?all=true') as NextRequest
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

    const req = new Request('http://localhost/api/projects') as NextRequest
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
    mockRequireAuth.mockResolvedValue(payload)
    mockPrisma.project.findFirst.mockResolvedValue(null)
    mockPrisma.project.create.mockResolvedValue({
      id: '1',
      slug: 'my-project',
      title: 'My Project',
      order: 0,
    })

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-project', title: 'My Project' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

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
    }) as NextRequest

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' })

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: 'No slug' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
