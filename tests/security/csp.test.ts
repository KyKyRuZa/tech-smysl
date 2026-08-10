import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { proxy } from '@/proxy'

const { mockDecrypt } = vi.hoisted(() => ({ mockDecrypt: vi.fn() }))

vi.mock('@/lib/auth/session', () => ({ decrypt: mockDecrypt }))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const sessionCookie = (token: string) =>
  new NextRequest('http://localhost/', {
    headers: { cookie: `session=${token}` },
  })

function scriptSrc(csp: string | null): string {
  if (!csp) return ''
  const directive = csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('script-src'))
  return directive ?? ''
}

describe('Security: CSP and HSTS (proxy)', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
    vi.stubGlobal('crypto', { randomUUID: () => 'nonce-test123' })
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.unstubAllGlobals()
  })

  it('sets a nonce-based CSP with no unsafe-inline/unsafe-eval on documents', async () => {
    mockDecrypt.mockReturnValue({ userId: '1', email: 'a@b.c', role: 'ADMIN' })
    const res = await proxy(new NextRequest('http://localhost/'))
    const csp = res.headers.get('content-security-policy')
    expect(csp).toBeTruthy()
    const src = scriptSrc(csp)
    expect(src).toContain("'nonce-nonce-test123'")
    expect(src).toContain("'strict-dynamic'")
    expect(src).not.toContain('unsafe-inline')
    expect(src).not.toContain('unsafe-eval')
    // styles are allowed inline (React inline styles); scripts must not be
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
  })

  it('does not set CSP on API routes', async () => {
    mockDecrypt.mockReturnValue(null)
    const res = await proxy(new NextRequest('http://localhost/api/blog-posts'))
    expect(res.headers.get('content-security-policy')).toBeNull()
  })

  it('omits HSTS outside production', async () => {
    process.env.NODE_ENV = 'test'
    mockDecrypt.mockReturnValue({ userId: '1', email: 'a@b.c', role: 'ADMIN' })
    const res = await proxy(new NextRequest('http://localhost/'))
    expect(res.headers.get('strict-transport-security')).toBeNull()
  })

  it('sets HSTS in production', async () => {
    process.env.NODE_ENV = 'production'
    mockDecrypt.mockReturnValue({ userId: '1', email: 'a@b.c', role: 'ADMIN' })
    const res = await proxy(new NextRequest('http://localhost/'))
    expect(res.headers.get('strict-transport-security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    )
  })

  it('redirects unauthenticated users away from /admin', async () => {
    mockDecrypt.mockReturnValue(null)
    const res = await proxy(new NextRequest('http://localhost/admin'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('redirects authenticated users away from /login', async () => {
    mockDecrypt.mockReturnValue({ userId: '1', email: 'a@b.c', role: 'ADMIN' })
    const res = await proxy(new NextRequest('http://localhost/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin')
  })
})
