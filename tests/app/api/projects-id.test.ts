import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/projects/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
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

describe('GET /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns project by id', async () => {
    const project = { id: '1', title: 'My Project', slug: 'my-project' }
    mockPrisma.project.findUnique.mockResolvedValue(project as any)

    const req = new Request('http://localhost/api/projects/1') as any
    const response = await GET(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(json.data).toEqual(project)
    expect(response.status).toBe(200)
  })

  it('returns 404 when project not found', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/projects/999') as any
    const res = await GET(req, { params: createMockParams('999') })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates project for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.project.findUnique.mockResolvedValue({ id: '1', title: 'Old' } as any)
    mockPrisma.project.update.mockResolvedValue({
      id: '1',
      title: 'New',
      slug: 'new',
      order: 0,
    } as any)

    const req = new Request('http://localhost/api/projects/1', {
      method: 'PUT',
      body: JSON.stringify({ slug: 'new', title: 'New' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.project.update).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(json.data.title).toBe('New')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

    const req = new Request('http://localhost/api/projects/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'New' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await PUT(req, { params: createMockParams('1') })
    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes project for authenticated admin', async () => {
    mockRequireAuth.mockResolvedValue({ userId: '1', email: 'admin@example.com', role: 'ADMIN' } as any)
    mockPrisma.project.findUnique.mockResolvedValue({ id: '1' } as any)
    mockPrisma.project.delete.mockResolvedValue({ id: '1' } as any)

    const req = new Request('http://localhost/api/projects/1', {
      method: 'DELETE',
    }) as any

    const response = await DELETE(req, { params: createMockParams('1') })
    const json = await response.json()

    expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(response.status).toBe(200)
    expect(json.message).toBe('Deleted')
  })
})
