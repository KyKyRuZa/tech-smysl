import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import { defaultLocale, getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { rateLimit } from '@/lib/rate-limit'

const protectedRoutes = ['/admin']
const publicRoutes = ['/login']
const apiAuthRoutes = ['/api/auth/login', '/api/auth/logout', '/api/health']

const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
]

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

function isAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  )
}

function stripLocale(pathname: string): string {
  const segments = pathname.split('/')
  if (segments[1] && isValidLocale(segments[1])) {
    segments.splice(1, 1)
  }
  return segments.join('/') || '/'
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isAssetPath(pathname)) {
    const res = NextResponse.next()
    applyCommonHeaders(req, res)
    return res
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
    const allowed = await rateLimit(ip)

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

  const stripped = stripLocale(pathname)
  const isPublicRoute = publicRoutes.some((route) => stripped === route)
  const isProtectedRoute =
    !isPublicRoute &&
    protectedRoutes.some(
      (route) => stripped === route || stripped.startsWith(`${route}/`)
    )

  const session = req.cookies.get('session')?.value
  const payload = decrypt(session)

  if (isProtectedRoute && !payload?.userId) {
    logger.warn('Proxy redirect: unauthorized access to protected route', { pathname })
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && payload?.userId) {
    logger.info('Proxy redirect: authenticated user on public route', {
      pathname,
      userId: payload.userId,
    })
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  const currentLocale = getLocaleFromPath(pathname)

  if (!currentLocale) {
    if (isProtectedRoute || isPublicRoute) {
      const res = NextResponse.next()
      applyDocHeaders(res, nonce, corsHeaders)
      res.cookies.set('NEXT_LOCALE', defaultLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
      return res
    }

    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
    const target = cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : defaultLocale
    const url = req.nextUrl.clone()
    url.pathname = `/${target}${pathname}`
    const res = NextResponse.redirect(url)
    res.cookies.set('NEXT_LOCALE', target, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return res
  }

  const res = NextResponse.next()
  applyDocHeaders(res, nonce, corsHeaders)
  res.cookies.set('NEXT_LOCALE', currentLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return res
}

function applyDocHeaders(
  res: NextResponse,
  nonce: string,
  corsHeaders: Record<string, string>
) {
  const csp = buildCsp(nonce)
  res.headers.set('Content-Security-Policy', csp)

  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  for (const [key, value] of Object.entries(corsHeaders)) {
    res.headers.set(key, value)
  }
}

function applyCommonHeaders(req: NextRequest, res: NextResponse) {
  const corsHeaders = getCorsHeaders(req)
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.headers.set(key, value)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
