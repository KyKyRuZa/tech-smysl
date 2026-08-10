// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST as uploadPost } from '@/app/api/upload/route'

const { mockRequireAuth, mockSharpInstance } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockSharpInstance: {
    metadata: vi.fn(),
    resize: vi.fn(function () {
      return mockSharpInstance
    }),
    webp: vi.fn(function () {
      return mockSharpInstance
    }),
    toFile: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('@/lib/auth/require-auth', () => ({ requireAuth: mockRequireAuth }))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>()
  return { ...actual, mkdir: vi.fn(() => Promise.resolve()) }
})
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return { ...actual, randomUUID: () => 'uuid-123' }
})
vi.mock('sharp', () => ({ default: vi.fn(() => mockSharpInstance) }))

const authorized = { userId: '1', email: 'admin@example.com', role: 'ADMIN' as const }
const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

function buildRequest(file: File): NextRequest {
  const fd = new FormData()
  fd.append('image', file)
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: fd,
  }) as NextRequest
}

describe('Security: file upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSharpInstance.resize.mockReturnValue(mockSharpInstance)
    mockSharpInstance.webp.mockReturnValue(mockSharpInstance)
  })

  it('rejects unauthenticated uploads with 401', async () => {
    mockRequireAuth.mockResolvedValue(unauthorized)
    const res = await uploadPost(buildRequest(new File(['x'], 'a.png', { type: 'image/png' })))
    expect(res.status).toBe(401)
  })

  it('rejects spoofed non-image content (HTML as image/png)', async () => {
    mockRequireAuth.mockResolvedValue(authorized)
    mockSharpInstance.metadata.mockRejectedValue(new Error('unsupported format'))
    const res = await uploadPost(
      buildRequest(new File(['<script>alert(1)</script>'], 'evil.html', { type: 'image/png' }))
    )
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error).toMatch(/invalid image/i)
  })

  it('rejects disallowed image formats', async () => {
    mockRequireAuth.mockResolvedValue(authorized)
    mockSharpInstance.metadata.mockResolvedValue({ format: 'svg' })
    const res = await uploadPost(
      buildRequest(new File(['x'], 'a.svg', { type: 'image/svg+xml' }))
    )
    expect(res.status).toBe(400)
  })

  it('accepts a valid image and stores it as .webp', async () => {
    mockRequireAuth.mockResolvedValue(authorized)
    mockSharpInstance.metadata.mockResolvedValue({ format: 'png' })
    const res = await uploadPost(
      buildRequest(new File(['x'], 'original.PNG', { type: 'image/png' }))
    )
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json.filename).toBe('uuid-123.webp')
    expect(json.url).toBe('/uploads/uuid-123.webp')
    expect(json.filename).not.toMatch(/\.html$/)
    expect(json.filename).not.toContain('original')
  })

  it('uses a random uuid filename, ignoring the client-provided name', async () => {
    mockRequireAuth.mockResolvedValue(authorized)
    mockSharpInstance.metadata.mockResolvedValue({ format: 'jpeg' })
    const res = await uploadPost(
      buildRequest(new File(['x'], '../../escape.jpg', { type: 'image/jpeg' }))
    )
    const json = await res.json()
    expect(json.filename).toBe('uuid-123.webp')
  })
})
