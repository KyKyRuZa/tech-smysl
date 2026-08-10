import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/applications/route'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    application: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('POST /api/applications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates application with valid data', async () => {
    mockPrisma.application.create.mockResolvedValue({
      id: 'app-1',
      name: 'Иван',
      email: 'ivan@example.com',
      message: 'Нужен сайт',
    })

    const req = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Иван',
        email: 'ivan@example.com',
        phone: '+79990000000',
        service: 'web',
        message: 'Нужен сайт',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

    const response = await POST(req)
    const json = await response.json()

    expect(mockPrisma.application.create).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(json.data.id).toBe('app-1')
    expect(json.data.status).toBe('ok')
  })

  it('creates application with only required fields', async () => {
    mockPrisma.application.create.mockResolvedValue({
      id: 'app-2',
      name: 'Аня',
      email: 'anya@example.com',
      message: 'Привет',
    })

    const req = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Аня',
        email: 'anya@example.com',
        message: 'Привет',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

    const response = await POST(req)
    expect(response.status).toBe(201)
  })

  it('returns 400 for invalid body', async () => {
    const req = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'not-an-email' }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

    const response = await POST(req)
    const json = await response.json()

    expect(mockPrisma.application.create).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    expect(json.details).toBeDefined()
  })

  it('returns 500 on database error', async () => {
    mockPrisma.application.create.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Иван',
        email: 'ivan@example.com',
        message: 'Нужен сайт',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})
