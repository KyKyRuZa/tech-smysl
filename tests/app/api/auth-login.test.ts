import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST as loginPost } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}))

vi.mock('@/lib/auth/session', () => ({
  createSession: vi.fn(),
}))

const mockPrisma = vi.mocked(prisma)
const mockBcrypt = vi.mocked(bcrypt)

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid email', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await loginPost(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 for missing password', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await loginPost(req)
    expect(response.status).toBe(400)
  })

  it('returns 401 for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await loginPost(req)
    const json = await response.json()
    expect(response.status).toBe(401)
    expect(json.error).toBe('Invalid credentials')
  })

  it('returns 401 for wrong password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'ADMIN',
    } as any)
    mockBcrypt.compare.mockResolvedValue(false)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await loginPost(req)
    const json = await response.json()
    expect(response.status).toBe(401)
    expect(json.error).toBe('Invalid credentials')
  })

  it('returns user data for valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'ADMIN',
    } as any)
    mockBcrypt.compare.mockResolvedValue(true)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    }) as any

    const response = await loginPost(req)
    const json = await response.json()
    expect(response.status).toBe(200)
    expect(json.data.email).toBe('admin@example.com')
    expect(json.data.role).toBe('ADMIN')
  })
})
