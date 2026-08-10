import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

const protectedRoutes = ['/admin']
const publicRoutes = ['/login']
const apiAuthRoutes = ['/api/auth/login', '/api/auth/logout', '/api/health']

const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const RATE_LIMIT_MAX = 100

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for')
  if (xfwd) {
    return xfwd.split(',')[0]!.trim()
  }
  const xri = req.headers.get('x-real-ip')
  if (xri) {
    return xri
  }
  return 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  entry.count += 1
  if (entry.count > RATE_LIMIT_MAX) {
    return false
  }

  return true
}

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]!

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
  return csp.replace(/\s{2,}/g, ' ').trim()
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const nonce = crypto.randomUUID()
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(req)
    const allowed = checkRateLimit(ip)

    if (!allowed) {
      logger.warn('Rate limit exceeded', { ip, pathname })
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }
  }

  const isApiAuthRoute = apiAuthRoutes.some(route => pathname.startsWith(route))
  if (isApiAuthRoute) {
    const res = NextResponse.next()
    for (const [key, value] of Object.entries(corsHeaders)) {
      res.headers.set(key, value)
    }
    return res
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  const session = req.cookies.get('session')?.value
  const payload = decrypt(session)

  if (isProtectedRoute && !payload?.userId) {
    logger.warn('Proxy redirect: unauthorized access to protected route', { pathname })
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && payload?.userId) {
    logger.info('Proxy redirect: authenticated user on public route', { pathname, userId: payload.userId })
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  const res = NextResponse.next()

  if (!pathname.startsWith('/api/')) {
    const csp = buildCsp(nonce)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)
    res.headers.set('Content-Security-Policy', csp)

    if (process.env.NODE_ENV === 'production') {
      res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    }
  }

  for (const [key, value] of Object.entries(corsHeaders)) {
    res.headers.set(key, value)
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
